# Specs: attendance-faceid-checkin-checkout

## API / Contract

| Method | Path | Request Body | Response Body | HTTP Status / Errors |
|---|---|---|---|---|
| `GET` | `/api/v1/schedules/face-id/today-descriptors` | None (Query: `branchId`) | `ApiResponse<IReadOnlyList<TodayStaffDescriptorDto>>` | 200 OK, 401 Unauthorized, 403 Forbidden |
| `POST` | `/api/v1/schedules/face-id/check-in` | `FaceIdCheckInRequest (ScheduleId, EmployeeId, FaceMatchScore, SnapshotBase64)` | `ApiResponse<ScheduleResponse>` | 200 OK, 400 Bad Request, 404 Not Found |
| `POST` | `/api/v1/schedules/face-id/check-out` | `FaceIdCheckOutRequest (ScheduleId, EmployeeId, FaceMatchScore, SnapshotBase64)` | `ApiResponse<ScheduleResponse>` | 200 OK, 400 Bad Request, 404 Not Found, 409 Conflict |
| `POST` | `/api/v1/schedules/{id}/attendance` | `RecordManualAttendanceRequest (AttendanceType, CheckInTime, CheckOutTime, Note)` | `ApiResponse<ScheduleResponse>` | 200 OK, 400 Bad Request, 404 Not Found |
| `POST` | `/api/v1/employees/{id}/face-descriptor` | `RegisterFaceDescriptorRequest (FaceDescriptor, FaceImageUrls)` | `ApiResponse<bool>` | 200 OK, 400 Bad Request, 404 Not Found |

---

## ADDED Requirements

### Requirement: REQ-ATT-01 Điểm danh vào ca bằng AI FaceID (FaceMatcher & Khoảng cách Euclid <= 0.45) trên Web POS
Hệ thống MUST hỗ trợ nhân viên tự điểm danh vào ca (`Check-in`) trực tiếp tại camera máy POS quầy thu ngân thông qua thư viện AI Client-side `@vladmandic/face-api`:
- **FaceMatcher & Ngưỡng khoảng cách Euclid:** Hệ thống MUST sử dụng cơ chế `faceapi.FaceMatcher` kết hợp `faceapi.LabeledFaceDescriptors` với ngưỡng khoảng cách `DISTANCE_THRESHOLD = 0.45`. So khớp thuần túy dựa trên khoảng cách Euclid $\le 0.45$ (khoảng cách càng nhỏ càng chính xác), loại bỏ điểm số phần trăm tối thiểu.
- **Backend Validation:** Backend MUST kiểm tra `FaceMatchScore` (lưu giá trị khoảng cách Euclid): nếu `FaceMatchScore > 0.45m` thì ném `BusinessException("FACE_MATCH_FAILED", "Khoảng cách nhận diện khuôn mặt vượt quá ngưỡng cho phép (tối đa 0.45).")`.
- **Nút Xác nhận luôn hiển thị:** Nút "Xác nhận vào ca" trên modal POS MUST mặc định luôn hiển thị rõ ràng, không bị disabled, cho phép nhân viên bấm xác nhận tức thì khi đứng trước camera.
- **Canvas Overlay:** Đồng bộ tỷ lệ và kích thước canvas đè khít lên video qua `faceapi.matchDimensions` và vẽ khung bounding box, tên nhân viên, khoảng cách thực tế bằng `faceapi.draw.DrawBox`.
- **Lưu vết và Kích hoạt ca:** Khi điểm danh thành công, hệ thống MUST lưu `CheckInTime = UtcNow.AddHours(7)`, `CheckInMethod = "FACE_ID"`, upload ảnh snapshot camera lên Cloudinary lưu link vào `CheckInFaceImageUrl`, lưu khoảng cách vào `FaceMatchScore`, tự động tính toán số phút đi muộn `LateMinutes`, và mở quyền mở phiên thu ngân POS cho nhân viên.

#### Scenario: Nhân viên bấm xác nhận vào ca thành công với FaceID
- **GIVEN**: Nhân viên A có ca làm việc trong ngày. Đứng trước camera POS lúc 07:55:00.
- **WHEN**: Nhân viên nhìn vào camera, khung xanh hiển thị tên và khoảng cách $d \le 0.45$. Nhân viên bấm nút "Xác nhận vào ca".
- **THEN**: 
  - Hệ thống chụp snapshot nén gửi về Backend kèm khoảng cách $d$, lưu `CheckInTime` hợp lệ, `LateMinutes = 0`.
  - Màn hình POS mở khóa cho phép nhân viên A bấm [Mở phiên thu ngân].

---

### Requirement: REQ-ATT-02 Điểm danh ra ca bằng AI FaceID & Ràng buộc đóng ca POS
Hệ thống MUST hỗ trợ nhân viên tự điểm danh ra ca (`Check-out`) bằng AI FaceID theo ngưỡng khoảng cách Euclid $\le 0.45$ và bắt buộc kiểm tra điều kiện đóng ca bán hàng POS:
- Hệ thống MUST chặn điểm danh ra ca nếu phiên ca bán hàng của nhân viên trên máy POS tương ứng đang ở trạng thái mở (`ShiftZReport.Status == ShiftState.Open`).
- Khi phiên POS đã đóng (`Closed`), nút "Xác nhận ra ca" luôn hiển thị cho phép nhân viên bấm chấm công ra, hệ thống so khớp FaceMatcher ($d \le 0.45$), ghi nhận `CheckOutTime = UtcNow.AddHours(7)`, upload ảnh snapshot `CheckOutFaceImageUrl`, lưu khoảng cách vào `FaceMatchScore`.
- Hệ thống MUST tự động tính toán tổng giờ làm việc thực tế:
  $$\text{ActualWorkHours} = \max\left(0, \text{ROUND}\left((\text{CheckOutTime} - \text{CheckInTime}).\text{TotalHours}, 2\right)\right)$$
- Hệ thống chuyển trạng thái ca sang `ScheduleStatus.Completed` để chốt công.

---

### Requirement: REQ-ATT-03 Chấm công thủ công 3 Tiêu chí của Chủ cửa hàng
Hệ thống MUST cung cấp giao diện cho phép Chủ cửa hàng (Store Owner) trực tiếp chấm công linh hoạt theo 3 tiêu chí:
1. **Tiêu chí Đi làm (`Working`):**
   - Cho phép điều chỉnh giờ vào/ra thực tế.
   - Nếu để trống giờ vào và ra, hệ thống MUST tự động gán mặc định khớp chính xác với giờ kế hoạch của ca ban đầu (`CheckInTime = PlannedStartTime`, `CheckOutTime = PlannedEndTime`).
   - Ghi nhận `Status = ScheduleStatus.Completed`, `ApprovalType = "WORKING"`, `CheckInMethod = CheckOutMethod = "MANUAL"`. Mở quyền POS ngay lập tức.
2. **Tiêu chí Nghỉ phép hưởng lương (`PaidLeave`):**
   - `CheckInTime = null`, `CheckOutTime = null`, `LateMinutes = 0`.
   - Bảo toàn giờ công định mức: $\text{ActualWorkHours} = \text{DurationHours}$, `Status = ScheduleStatus.Completed`, `ApprovalType = "PAID_LEAVE"`.
3. **Tiêu chí Nghỉ không lương (`UnpaidLeave`):**
   - Ghi nhận $\text{ActualWorkHours} = 0.00$, `Status = ScheduleStatus.Cancelled`, `ApprovalType = "UNPAID_LEAVE"`.

---

### Requirement: REQ-ATT-04 Huấn luyện Đa ảnh (Multi-image Training) & Trích xuất Mảng Vector Khuôn mặt
Hệ thống hỗ trợ cơ chế huấn luyện nhận diện đa ảnh trực tiếp trong form Nhân viên (`EmployeeFormModal`):
- Quản lý có thể tải lên tới 4 ảnh mẫu khuôn mặt ở các góc độ/biểu cảm khác nhau. Danh sách URL ảnh được lưu dạng mảng JSON trong `FaceImageUrls`.
- Hệ thống Client-side tự động duyệt qua từng ảnh, trích xuất vector 128 số thực cho mỗi ảnh qua `faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()`.
- Toàn bộ các vector được gom thành mảng 2 chiều `[[n1..n128], [n1..n128], ...]` và lưu dạng chuỗi JSON vào cột `FaceDescriptor` của bảng `Employees`.
- Khi khởi tạo FaceID tại máy POS, hàm `buildLabeledFaceDescriptors` nạp toàn bộ danh sách vector của từng nhân viên vào `faceapi.LabeledFaceDescriptors(label, descriptors: Float32Array[])`, giúp tăng độ nhạy và chính xác khi nhận diện từ camera.

---

### Requirement: REQ-ATT-05 Cơ chế Graceful Fallback khi Chi nhánh chưa có Policy
Trường hợp chi nhánh chưa từng cấu hình `BranchAttendancePolicy` (`policy == null`), hệ thống MUST tự động áp dụng chính sách mặc định:
- Ngưỡng dung sai đi muộn / về sớm bằng 0 phút ($\text{Threshold} = 0$).
- Đi muộn: $\text{LateMinutes} = \max(0, (\text{CheckInTime} - \text{PlannedStartTime}).\text{TotalMinutes})$.
- Về sớm: $\text{EarlyLeaveMinutes} = \max(0, (\text{PlannedEndTime} - \text{CheckOutTime}).\text{TotalMinutes})$.

---

### Requirement: REQ-ATT-06 Tách riêng 2 Loại đơn Sự cố Chấm công & Cơ chế Mở ca Tức thì
Hệ thống MUST tách biệt hoàn toàn 2 nghiệp vụ báo sự cố chấm công thành 2 loại đơn yêu cầu độc lập:
1. **Sự cố Check-in vào ca (`CheckInIncident = 2`):**
   - Tạo đơn thành công, hệ thống tự động gán `CheckInTime = NOW()`, `CheckInMethod = "INCIDENT_PENDING"`, mở khóa POS ngay lập tức.
2. **Sự cố Check-out ra ca (`CheckOutIncident = 5`):**
   - Đơn lưu ở trạng thái `Pending` để Chủ cửa hàng duyệt chốt giờ ra ca.

---

### Requirement: REQ-ATT-07 Chế độ Cá nhân (1:1 Verification) khi Chấm công FaceID
Hệ thống MUST áp dụng chế độ xác thực 1:1 Verification nhằm loại bỏ hoàn toàn rủi ro điểm danh hộ:
1. **Quyền truy cập:** Chỉ nhân viên đã đăng nhập vào tài khoản cá nhân mới được phép mở và sử dụng modal chấm công AI FaceID. Người dùng chưa đăng nhập sẽ bị từ chối truy cập ngay lập tức.
2. **Đối chiếu độc quyền 1:1:** Thư viện `face-api.js` CHỈ ĐƯỢC PHÉP nạp duy nhất Face Descriptor của chính tài khoản nhân viên đang đăng nhập vào `FaceMatcher` với ngưỡng khoảng cách `DISTANCE_THRESHOLD = 0.45`. Tuyệt đối không nạp danh sách nhân viên khác.
3. **Hiển thị Canvas và Cảnh báo:**
   - Nếu khuôn mặt trên camera trùng khớp ($d \le 0.45$): Canvas vẽ khung viền xanh lá `#10B981`, hiển thị nhãn tên nhân viên đó kèm khoảng cách Euclid.
   - Nếu người khác đưa mặt vào hoặc $d > 0.45$: Canvas vẽ khung viền đỏ `#EF4444`, hiển thị nhãn `"Không khớp với [Tên NV] (d: 0.xx)"`. Tuyệt đối KHÔNG hiển thị tên của bất kỳ ai khác trên canvas.
4. **Từ chối tức thì:** Khi bấm nút "Xác nhận vào ca" hoặc "Xác nhận ra ca", nếu khuôn mặt trước camera không trùng khớp với tài khoản đang đăng nhập ($d > 0.45$), hệ thống lập tức từ chối và báo lỗi: `"Từ chối: Khuôn mặt trước camera không trùng khớp với tài khoản [Tên NV]. Không thể điểm danh!"`.

---

## Acceptance checklist

- [x] REQ-ATT-01: Sử dụng FaceMatcher với ngưỡng khoảng cách `DISTANCE_THRESHOLD = 0.45` ($\le 0.45$), đồng bộ canvas bằng `matchDimensions` và vẽ khung bounding box `DrawBox`.
- [x] REQ-ATT-01: Backend kiểm tra `FaceMatchScore <= 0.45m`, ném ngoại lệ nếu khoảng cách $> 0.45m$.
- [x] REQ-ATT-01: Nút "Xác nhận vào ca" trên modal POS mặc định luôn hiển thị rõ ràng, cho phép bấm xác nhận tức thì.
- [x] REQ-ATT-01: Chụp snapshot Base64 nén, tải lên Cloudinary lưu vào `CheckInFaceImageUrl`.
- [x] REQ-ATT-02: Ràng buộc kiểm tra phiên POS đã `Closed` trước khi cho phép Check-out.
- [x] REQ-ATT-03: Chấm công thủ công 3 tiêu chí; tiêu chí "Đi làm" để trống tự động điền giờ ca kế hoạch; "Nghỉ có lương" bảo toàn giờ công.
- [x] REQ-ATT-04: Huấn luyện đa ảnh (tối đa 4 ảnh mẫu), lưu trữ `FaceImageUrls`, mảng vector `FaceDescriptor` và `FaceRegisteredAt`.
- [x] REQ-ATT-05: Fallback chính sách điểm danh an toàn khi `policy == null`.
- [x] REQ-ATT-06: Tách biệt đơn `CheckInIncident = 2` (mở ca POS tức thì) và `CheckOutIncident = 5`.
- [x] REQ-ATT-07: Chế độ 1:1 Verification với ngưỡng khoảng cách $\le 0.45$ - Chỉ nhân viên đăng nhập mới truy cập được, FaceMatcher chỉ nạp duy nhất vector của chính tài khoản đó, từ chối ngay nếu người khác đưa mặt vào, canvas chỉ hiển thị thông tin nhân viên đó.
