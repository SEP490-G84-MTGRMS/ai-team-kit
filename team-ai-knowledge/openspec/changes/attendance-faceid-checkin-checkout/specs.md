# Specs: attendance-faceid-checkin-checkout

## API / Contract

| Method | Path | Request Body | Response Body | HTTP Status / Errors |
|---|---|---|---|---|
| `GET` | `/api/v1/schedules/face-id/today-descriptors` | None (Query: `branchId`) | `ApiResponse<IReadOnlyList<TodayStaffDescriptorDto>>` | 200 OK, 401 Unauthorized, 403 Forbidden |
| `POST` | `/api/v1/schedules/face-id/check-in` | `MultipartForm (ScheduleId, EmployeeId, FaceMatchScore, LivenessPassed, SnapshotImage)` | `ApiResponse<bool>` | 200 OK, 400 Bad Request, 404 Not Found |
| `POST` | `/api/v1/schedules/face-id/check-out` | `MultipartForm (ScheduleId, EmployeeId, FaceMatchScore, LivenessPassed, SnapshotImage)` | `ApiResponse<bool>` | 200 OK, 400 Bad Request, 404 Not Found, 409 Conflict |
| `POST` | `/api/v1/schedules/{id}/attendance` | `RecordManualAttendanceRequest (AttendanceType, CheckInTime, CheckOutTime, Note)` | `ApiResponse<bool>` | 200 OK, 400 Bad Request, 404 Not Found |
| `POST` | `/api/v1/employees/{id}/face-descriptor` | `RegisterFaceDescriptorRequest (FaceDescriptor)` | `ApiResponse<bool>` | 200 OK, 400 Bad Request, 404 Not Found |

---

## ADDED Requirements

### Requirement: REQ-ATT-01 Điểm danh vào ca bằng AI FaceID (FaceMatcher & Euclid Distance) trên Web POS
Hệ thống MUST hỗ trợ nhân viên tự điểm danh vào ca (`Check-in`) trực tiếp tại camera máy POS quầy thu ngân thông qua thư viện AI Client-side `@vladmandic/face-api`:
- **FaceMatcher & Khoảng cách Euclid:** Hệ thống MUST sử dụng cơ chế `faceapi.FaceMatcher` kết hợp `faceapi.LabeledFaceDescriptors` với ngưỡng khoảng cách `DISTANCE_THRESHOLD = 0.6` (khoảng cách Euclid $\le 0.6$ tương đương độ khớp `FaceMatchScore >= 70.00%`).
- **Nút Xác nhận luôn hiển thị:** Nút "Xác nhận vào ca" trên modal POS MUST mặc định luôn hiển thị rõ ràng, không bị disabled, cho phép nhân viên bấm xác nhận tức thì.
- **Canvas Overlay:** Đồng bộ tỷ lệ và kích thước canvas đè khít lên video qua `faceapi.matchDimensions` và vẽ khung bounding box, tên nhân viên, độ lệch khoảng cách bằng `faceapi.draw.DrawBox`.
- **Lưu vết và Kích hoạt ca:** Khi điểm danh thành công, hệ thống MUST lưu `CheckInTime = UtcNow`, `CheckInMethod = "FACE_ID"`, upload ảnh snapshot camera lên Cloudinary lưu link vào `CheckInFaceImageUrl`, tự động tính toán số phút đi muộn `LateMinutes`, và mở quyền mở phiên thu ngân POS cho nhân viên.

#### Scenario: Nhân viên bấm xác nhận vào ca thành công với FaceID
- **GIVEN**: Nhân viên A có ca làm việc trong ngày. Đứng trước camera POS lúc 07:55:00.
- **WHEN**: Nhân viên nhìn vào camera, khung xanh hiển thị tên và độ lệch khoảng cách $< 0.6$. Nhân viên bấm nút "Xác nhận vào ca".
- **THEN**: 
  - Hệ thống chụp snapshot nén gửi về Backend, lưu `CheckInTime` hợp lệ, `LateMinutes = 0`.
  - Màn hình POS mở khóa cho phép nhân viên A bấm [Mở phiên thu ngân].

---

### Requirement: REQ-ATT-02 Điểm danh ra ca bằng AI FaceID & Ràng buộc đóng ca POS
Hệ thống MUST hỗ trợ nhân viên tự điểm danh ra ca (`Check-out`) bằng AI FaceID và bắt buộc kiểm tra điều kiện đóng ca bán hàng POS:
- Hệ thống MUST chặn điểm danh ra ca nếu phiên ca bán hàng của nhân viên trên máy POS tương ứng đang ở trạng thái mở (`ShiftZReport.Status == ShiftState.Open`).
- Khi phiên POS đã đóng (`Closed`), nút "Xác nhận ra ca" luôn hiển thị cho phép nhân viên bấm chấm công ra, hệ thống so khớp FaceMatcher, ghi nhận `CheckOutTime = UtcNow`, upload ảnh snapshot `CheckOutFaceImageUrl`.
- Hệ thống MUST tự động tính toán tổng giờ làm việc thực tế:
  $$\text{ActualWorkHours} = \max\left(0, \text{ROUND}\left((\text{CheckOutTime} - \text{CheckInTime}).\text{TotalHours}, 2\right)\right)$$
- Hệ thống chuyển trạng thái ca sang `ScheduleStatus.Completed` để chốt công.

#### Scenario: Check-out thành công sau khi đã đóng ca Z-Report
- **GIVEN**: Thu ngân B đã nộp tiền Z-report và đóng ca bán hàng (`ShiftZReport.Status = ShiftState.Closed`).
- **WHEN**: Thu ngân B đứng trước camera POS và bấm nút "Xác nhận ra ca".
- **THEN**:
  - `CheckOutTime` được cập nhật, `Status = ScheduleStatus.Completed`.
  - `ActualWorkHours` được chốt chính xác và hiển thị thông báo thành công.

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

### Requirement: REQ-ATT-04 Tự động trích xuất Vector Khuôn mặt khi Tải ảnh Avatar (Zero Extra Step)
Hệ thống loại bỏ quy trình đăng ký khuôn mặt thủ công riêng rẽ. Thay vào đó:
- Khi Quản lý tải ảnh chân dung (`AvatarUrl`) trong form Tạo/Sửa nhân viên (`EmployeeFormModal`), hệ thống Client-side MUST tự động chạy `faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()` để trích xuất mảng vector 128 số thực.
- Vector được lưu dưới dạng chuỗi JSON `[float32Array]` gửi lên API `POST /api/v1/employees/{id}/face-descriptor` và lưu vào cột `FaceDescriptor` của bảng `Employees`.
- Tối ưu hiệu năng: Việc trích xuất chỉ diễn ra 1 lần duy nhất khi tạo/cập nhật ảnh đại diện. Quá trình điểm danh tại máy POS không cần tải lại ảnh gốc, chỉ tải mảng vector JSON từ Backend.

#### Scenario: Quản lý tải ảnh đại diện nhân viên mới
- **GIVEN**: Quản lý đang thêm mới nhân viên F trên trang quản lý nhân viên.
- **WHEN**: Quản lý chọn file ảnh chân dung rõ mặt.
- **THEN**:
  - Giao diện tự động chạy trích xuất vector khuôn mặt nền, hiển thị thông báo đã nhận diện thành công vector FaceID.
  - Sau khi lưu nhân viên, trường `FaceDescriptor` đã có dữ liệu và sẵn sàng điểm danh trên POS.

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

## Acceptance checklist

- [ ] REQ-ATT-01: Sử dụng FaceMatcher với `DISTANCE_THRESHOLD = 0.6`, đồng bộ canvas bằng `matchDimensions` và vẽ khung bounding box `DrawBox`.
- [ ] REQ-ATT-01: Nút "Xác nhận vào ca" trên modal POS mặc định luôn hiển thị rõ ràng, cho phép bấm xác nhận tức thì.
- [ ] REQ-ATT-01: Chụp snapshot Base64 nén, tải lên Cloudinary lưu vào `CheckInFaceImageUrl`.
- [ ] REQ-ATT-02: Ràng buộc kiểm tra phiên POS đã `Closed` trước khi cho phép Check-out.
- [ ] REQ-ATT-03: Chấm công thủ công 3 tiêu chí; tiêu chí "Đi làm" để trống tự động điền giờ ca kế hoạch; "Nghỉ có lương" bảo toàn giờ công.
- [ ] REQ-ATT-04: Tự động trích xuất vector `FaceDescriptor` khi upload `AvatarUrl` tại `EmployeeFormModal`.
- [ ] REQ-ATT-05: Fallback chính sách điểm danh an toàn khi `policy == null`.
- [ ] REQ-ATT-06: Tách biệt đơn `CheckInIncident = 2` (mở ca POS tức thì) và `CheckOutIncident = 5`.
