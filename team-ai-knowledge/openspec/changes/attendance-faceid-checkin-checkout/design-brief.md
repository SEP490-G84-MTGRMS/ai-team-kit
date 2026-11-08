# Design Brief: attendance-faceid-checkin-checkout

## 1. Luồng Người dùng & Kiến trúc Giao diện (User Flows & UI Architecture)

```mermaid
sequenceDiagram
    autonumber
    actor NV as Nhân viên Thu ngân
    participant POS as Giao diện Web POS
    participant FaceAPI as Client AI (@vladmandic/face-api)
    participant BE as Backend (.NET 8 API)
    participant DB as PostgreSQL DB

    Note over NV,POS: LUỒNG CHECK-IN VÀO CA
    NV->>POS: Bấm [Điểm danh vào ca]
    POS->>BE: GET /api/v1/schedules/face-id/today-descriptors?branchId={id}
    BE->>DB: Truy vấn ca hôm nay + Vector FaceDescriptor của nhân viên
    BE-->>POS: Trả về Cache danh sách nhân viên trong ngày
    POS->>FaceAPI: Bật Webcam, tải TinyFaceDetector + Landmark68 + FaceRecognition
    FaceAPI->>FaceAPI: Quét 30fps tìm Face Bounding Box
    FaceAPI-->>POS: Nhắc nhở: "Vui lòng chớp mắt để xác thực người thật"
    NV->>POS: Chớp mắt tự nhiên (EAR < 0.18 trong 100-250ms)
    FaceAPI->>FaceAPI: Liveness Passed! Trích xuất Vector 128-d & So khớp Euclidean <= 0.45 (Score >= 85%)
    FaceAPI->>POS: Chụp ảnh snapshot nét nhất (300x300)
    POS->>BE: POST /api/v1/schedules/face-id/check-in (FormData: ScheduleId, Score, Image)
    BE->>DB: Cập nhật CheckInTime, CheckInMethod='FACE_ID', CheckInFaceImageUrl, LateMinutes
    BE-->>POS: 200 OK - Điểm danh thành công!
    POS-->>NV: Hiển thị thông báo & Mở khóa quyền bấm [Mở phiên thu ngân]

    Note over NV,POS: LUỒNG CHECK-OUT RA CA
    NV->>POS: Bấm [Điểm danh ra ca]
    POS->>BE: Kiểm tra phiên bán hàng ShiftZReport
    alt Phiên POS còn mở (ShiftState == Open)
        BE-->>POS: 400 Bad Request: "Bạn chưa đóng ca và kiểm đếm tiền Z-Report!"
        POS-->>NV: Chặn điểm danh, hiển thị cảnh báo đỏ
    else Phiên POS đã đóng (ShiftState == Closed)
        POS->>FaceAPI: Quét FaceID + Chớp mắt + Chụp ảnh snapshot
        POS->>BE: POST /api/v1/schedules/face-id/check-out
        BE->>DB: CheckOutTime = UtcNow, ActualWorkHours = (Out - In), Status = Completed
        BE-->>POS: 200 OK - Điểm danh ra ca thành công!
    end
```

---

## 2. Thiết kế Màn hình & Component Frontend

### 2.1. Component `FaceAttendanceModal.tsx` (Tích hợp tại Web POS)
- **Vị trí hiển thị:** Quầy POS thu ngân bán lẻ (`POSCheckoutPage.tsx`) và góc thao tác Bảng chấm công nhân viên.
- **Trạng thái hiển thị:**
  - `Loading`: Đang tải 3 mô hình AI (~6.8 MB) từ `/models/face-api/` (thanh progress bar tiến trình nạp mô hình).
  - `Streaming`: Hiển thị khung tròn camera webcam tỷ lệ 1:1, vẽ bounding box xanh khi phát hiện mặt.
  - `Liveness Pending`: Hiển thị thông báo nhấp nháy: *"Vui lòng chớp mắt để xác thực người thật..."*.
  - `Recognized`: Khung viền chuyển xanh lá, hiển thị tên nhân viên + Điểm tin cậy (Ví dụ: `Nguyễn Văn A - 91.5%`).
  - `Submitting`: Chụp snapshot, hiển thị spinner gửi request lên Backend.
  - `Error / Mismatch`: Cảnh báo *"Không nhận diện được khuôn mặt hoặc độ tương đồng < 85%"*, kèm nút bấm *"Báo sự cố chấm công"* chuyển sang `CreateScheduleRequestModal`.

### 2.2. Modal Chấm công thủ công 3 Tiêu chí `AttendanceDetailModal.tsx` (Dành cho Chủ cửa hàng)
- **Vị trí:** Màn hình Quản lý Bảng chấm công ([`AttendancePage.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/employee/pages/AttendancePage.tsx)).
- **3 Tiêu chí lựa chọn:**
  1. **Đi làm (`Working`):** Cho phép sửa giờ vào/ra. Nếu để trống, hệ thống tự động gán mặc định khớp đúng ca gốc (`CheckInTime = PlannedStartTime`, `CheckOutTime = PlannedEndTime`). Trạng thái ca `Completed`, loại `WORKING`.
  2. **Nghỉ phép hưởng lương (`PaidLeave`):** Giờ vào/ra để trống, tự động bảo toàn giờ công $\text{ActualWorkHours} = \text{DurationHours}$, loại `PAID_LEAVE`.
  3. **Nghỉ không lương (`UnpaidLeave`):** Giờ công $\text{ActualWorkHours} = 0.00$, trạng thái `Cancelled`, loại `UNPAID_LEAVE`.

### 2.3. Modal Đăng ký khuôn mặt `RegisterFaceModal.tsx` (Hồ sơ nhân viên)
- Cho phép chụp trực tiếp từ webcam hoặc tải ảnh chân dung chính diện chất lượng cao.
- Client trích xuất vector 128 số thực `FaceDescriptor` và gửi lên lưu vào bảng `Employees`.

---

## 3. Thiết kế API Endpoints & DTOs Backend (.NET 8)

### 3.1. Danh mục Endpoints

| Method | Endpoint | Mô tả | Authorization |
|---|---|---|---|
| `GET` | `/api/v1/schedules/face-id/today-descriptors` | Lấy danh sách vector nhân viên có ca trong ngày tại chi nhánh | `Staff`, `StoreOwner` |
| `POST` | `/api/v1/schedules/face-id/check-in` | Chấm công vào ca bằng AI FaceID | `Staff`, `StoreOwner` |
| `POST` | `/api/v1/schedules/face-id/check-out` | Chấm công ra ca bằng AI FaceID (kiểm tra POS Closed) | `Staff`, `StoreOwner` |
| `POST` | `/api/v1/schedules/{id}/attendance` | Chủ cửa hàng chấm công thủ công 3 tiêu chí | `StoreOwner` |
| `POST` | `/api/v1/employees/{id}/face-descriptor` | Đăng ký/Cập nhật vector khuôn mặt cho nhân viên | `StoreOwner`, `Employee` |

### 3.2. Data Transfer Objects (DTOs)

```csharp
// Response danh sách vector nhân viên trong ngày
public record TodayStaffDescriptorDto(
    Guid ScheduleId,
    Guid EmployeeId,
    string EmployeeCode,
    string FullName,
    TimeSpan PlannedStartTime,
    TimeSpan PlannedEndTime,
    float[] FaceDescriptor,
    bool HasCheckedIn
);

// Request Check-in FaceID
public class FaceIdCheckInRequest
{
    public Guid ScheduleId { get; set; }
    public Guid EmployeeId { get; set; }
    public decimal FaceMatchScore { get; set; }
    public bool LivenessPassed { get; set; }
    public IFormFile SnapshotImage { get; set; } = null!;
}

// Request Check-out FaceID
public class FaceIdCheckOutRequest
{
    public Guid ScheduleId { get; set; }
    public Guid EmployeeId { get; set; }
    public decimal FaceMatchScore { get; set; }
    public bool LivenessPassed { get; set; }
    public IFormFile SnapshotImage { get; set; } = null!;
}

// Request Chấm công thủ công 3 tiêu chí
public record RecordManualAttendanceRequest(
    string AttendanceType, // "WORKING", "PAID_LEAVE", "UNPAID_LEAVE"
    DateTime? CheckInTime,
    DateTime? CheckOutTime,
    string? Note
);
```

---

## 4. Thiết kế Cơ sở dữ liệu (Database Schema)

- Tận dụng cấu trúc bảng hiện có trong `EmployeeSchedules` và `Employees`:
  - `EmployeeSchedules`: `CheckInTime`, `CheckInMethod`, `CheckInFaceImageUrl`, `FaceMatchScore`, `CheckOutTime`, `CheckOutMethod`, `CheckOutFaceImageUrl`, `LateMinutes`, `EarlyLeaveMinutes`, `ActualWorkHours`, `Status`, `ApprovalType`, `ApprovalStatus`.
  - `Employees`: Cột `FaceDescriptor` (Kiểu dữ liệu `text` lưu JSON mảng 128 float: `[0.123, -0.045, ...]`).
  - Index hỗ trợ truy vấn nhanh: `CREATE INDEX IF NOT EXISTS ix_employee_schedules_workdate_branch ON "EmployeeSchedules"("WorkDate", "BranchId");`.

---

## 5. Quy tắc Nghiệp vụ & Ràng buộc Bảo mật

1. **BR-ATT-01 (Dung sai & Kỷ luật giờ giấc):**
   - Áp dụng cấu hình `BranchAttendancePolicy`.
   - Nếu chi nhánh chưa có cấu hình (`policy == null`), tự động fallback: Dung sai = 0 phút, vào muộn tính `LateMinutes`, về sớm tính `EarlyLeaveMinutes`.
2. **BR-ATT-02 (Ràng buộc Đóng ca POS):**
   - Thu ngân chỉ được Check-out khi phiên ca bán hàng tương ứng trên két quầy `ShiftZReport` đã chuyển trạng thái `Closed`.
3. **BR-ATT-03 (Chống gian lận Liveness):**
   - Tỷ lệ co giãn mắt EAR bắt buộc giảm $< 0.18$ trong 100-250ms để xác nhận chớp mắt thật trước khi chụp ảnh snapshot.
4. **BR-ATT-04 (Bảo toàn công Nghỉ phép):**
   - Ca chấm `PAID_LEAVE` bắt buộc ghi nhận $\text{ActualWorkHours} = \text{DurationHours}$ và `ApprovalType = "PAID_LEAVE"` để được nạp đủ vào bảng lương tháng.
