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

### Requirement: REQ-ATT-01 Điểm danh vào ca bằng AI FaceID trên Web POS
Hệ thống MUST hỗ trợ nhân viên tự điểm danh vào ca (`Check-in`) trực tiếp tại camera máy POS quầy thu ngân thông qua thư viện AI Client-side `@vladmandic/face-api`:
- Hệ thống MUST kiểm tra người thật qua cử động chớp mắt tự nhiên (Tỷ lệ co giãn mắt $\text{EAR} < 0.18$ trong 100ms – 250ms).
- Hệ thống MUST so khớp vector đặc trưng 128 chiều (`Float32Array(128)`) với vector đã đăng ký của nhân viên và chỉ chấp nhận khi độ tin cậy `FaceMatchScore >= 85.00%`.
- Khi điểm danh thành công, hệ thống MUST lưu vết `CheckInTime = UtcNow`, `CheckInMethod = "FACE_ID"`, lưu ảnh snapshot vào `CheckInFaceImageUrl`, tự động tính toán số phút đi muộn `LateMinutes`, và kích hoạt quyền cho phép tài khoản nhân viên mở phiên thu ngân trên máy POS.

#### Scenario: Nhân viên điểm danh vào ca thành công với FaceID và chớp mắt thật
- **GIVEN**: Nhân viên A có ca làm việc `PlannedStartTime = 08:00:00`. Nhân viên đứng trước camera POS lúc 07:55:00.
- **WHEN**: Nhân viên nhìn vào camera và chớp mắt tự nhiên, hệ thống nhận diện khớp với độ tin cậy `FaceMatchScore = 91.50%` và `LivenessPassed = true`.
- **THEN**: 
  - Hệ thống ghi nhận `CheckInTime` hợp lệ, `LateMinutes = 0`.
  - Lưu ảnh snapshot camera vào `CheckInFaceImageUrl`.
  - Màn hình POS mở khóa cho phép nhân viên A bấm [Mở phiên thu ngân].

#### Scenario: Cố tình dùng ảnh tĩnh trên điện thoại để điểm danh hộ
- **GIVEN**: Một người giơ ảnh chụp chân dung của Nhân viên A trên màn hình điện thoại trước camera POS.
- **WHEN**: Camera quét khuôn mặt nhưng giá trị $\text{EAR}$ giữ nguyên không đổi (không có hành vi nháy mắt $< 0.18$).
- **THEN**: 
  - Hệ thống MUST chặn điểm danh và hiển thị thông báo nhấp nháy: *"Vui lòng chớp mắt để xác thực người thật!"*.
  - Không gửi request Check-in lên Backend.

---

### Requirement: REQ-ATT-02 Điểm danh ra ca bằng AI FaceID & Ràng buộc đóng ca POS
Hệ thống MUST hỗ trợ nhân viên tự điểm danh ra ca (`Check-out`) bằng AI FaceID và bắt buộc kiểm tra điều kiện đóng ca bán hàng POS:
- Hệ thống MUST chặn điểm danh ra ca nếu phiên ca bán hàng của nhân viên trên máy POS tương ứng đang ở trạng thái mở (`ShiftZReport.Status == ShiftState.Open`).
- Khi phiên POS đã đóng (`Closed`), hệ thống cho phép quét FaceID, kiểm tra liveness chớp mắt, ghi nhận `CheckOutTime = UtcNow`, lưu ảnh snapshot `CheckOutFaceImageUrl`.
- Hệ thống MUST tự động tính toán tổng giờ làm việc thực tế:
  $$\text{ActualWorkHours} = \max\left(0, \text{ROUND}\left((\text{CheckOutTime} - \text{CheckInTime}).\text{TotalHours}, 2\right)\right)$$
- Hệ thống MUST chuyển trạng thái ca sang `ScheduleStatus.Completed` để nạp vào kỳ tính lương.

#### Scenario: Thu ngân cố tình Check-out khi chưa đóng ca bán hàng POS
- **GIVEN**: Thu ngân B có phiên bán hàng trên quầy POS đang mở (`ShiftZReport.Status = ShiftState.Open`).
- **WHEN**: Thu ngân B bấm nút [Điểm danh ra ca].
- **THEN**: 
  - Hệ thống MUST từ chối và cảnh báo lỗi: *"Bạn chưa hoàn tất đóng ca và kiểm đếm tiền POS! Vui lòng hoàn tất đóng ca Z-Report trước khi chấm công ra về."*.
  - Không ghi nhận `CheckOutTime`.

#### Scenario: Check-out thành công sau khi đã đóng ca Z-Report
- **GIVEN**: Thu ngân B đã nộp tiền Z-report và đóng ca bán hàng (`ShiftZReport.Status = ShiftState.Closed`).
- **WHEN**: Thu ngân B quét FaceID ra ca, độ tin cậy đạt 88.0% và chớp mắt hợp lệ.
- **THEN**:
  - `CheckOutTime` được cập nhật, `Status = ScheduleStatus.Completed`.
  - `ActualWorkHours` được chốt chính xác và hiển thị thông báo: *"Chấm công ra thành công! Tổng giờ làm: X.XX giờ"*.

---

### Requirement: REQ-ATT-03 Chấm công thủ công 3 Tiêu chí của Chủ cửa hàng
Hệ thống MUST cung cấp giao diện cho phép Chủ cửa hàng (Store Owner) trực tiếp chấm công linh hoạt theo 3 tiêu chí:
1. **Tiêu chí Đi làm (`Working`):**
   - Cho phép điều chỉnh giờ vào/ra thực tế.
   - **Quy tắc giờ mặc định:** Nếu Chủ cửa hàng để trống giờ vào và ra, hệ thống MUST tự động gán mặc định khớp chính xác với giờ kế hoạch của ca ban đầu (`CheckInTime = PlannedStartTime`, `CheckOutTime = PlannedEndTime`).
   - Nếu ca qua đêm (`IsCheckInNextDay = true` hoặc giờ ra nhỏ hơn giờ vào), hệ thống tự động cộng thêm 1 ngày cho giờ ra ca.
   - Ghi nhận `Status = ScheduleStatus.Completed`, `ApprovalType = "WORKING"`, `CheckInMethod = CheckOutMethod = "MANUAL"`. Kích hoạt ngay lập tức quyền mở POS cho nhân viên.
2. **Tiêu chí Nghỉ phép hưởng lương (`PaidLeave`):**
   - Áp dụng khi nhân viên nghỉ phép năm, việc riêng có lương.
   - `CheckInTime = null`, `CheckOutTime = null`, `LateMinutes = 0`.
   - **Bảo toàn giờ công định mức:** Hệ thống MUST tự động ghi nhận $\text{ActualWorkHours} = \text{DurationHours}$, `Status = ScheduleStatus.Completed`, `ApprovalType = "PAID_LEAVE"`.
3. **Tiêu chí Nghỉ không lương (`UnpaidLeave`):**
   - Ghi nhận $\text{ActualWorkHours} = 0.00$, `Status = ScheduleStatus.Cancelled`, `ApprovalType = "UNPAID_LEAVE"`.

#### Scenario: Chủ cửa hàng chấm công đi làm nhưng để trống giờ vào/ra
- **GIVEN**: Ca làm việc có `PlannedStartTime = 06:00:00`, `PlannedEndTime = 14:00:00` (8 tiếng).
- **WHEN**: Chủ cửa hàng mở modal chấm công, chọn tiêu chí "Đi làm" và bấm [Lưu thiết lập] mà không nhập giờ vào/ra cụ thể.
- **THEN**:
  - Hệ thống tự động gán `CheckInTime` ứng với 06:00 và `CheckOutTime` ứng với 14:00 ngày làm việc.
  - `ActualWorkHours` tự động ghi nhận bằng `8.00` giờ, `Status = Completed`, `ApprovalType = "WORKING"`.
  - Mở khóa cho nhân viên mở ca POS ngay lập tức.

---

### Requirement: REQ-ATT-04 Đăng ký và Trích xuất Vector Khuôn mặt (Face Descriptor Registration)
Hệ thống MUST cung cấp API và giao diện chụp ảnh chân dung hoặc tải ảnh của nhân viên, sử dụng mô hình `FaceRecognitionNet` để trích xuất mảng vector 128 số thực (`Float32Array(128)`), và lưu trữ an toàn vào trường `FaceDescriptor` trong hồ sơ `Employees`.

#### Scenario: Đăng ký vector khuôn mặt cho nhân viên mới
- **GIVEN**: Nhân viên C chưa có dữ liệu khuôn mặt trong hệ thống (`FaceDescriptor == null`).
- **WHEN**: Quản lý chụp ảnh chân dung rõ mặt của nhân viên C tại trang hồ sơ nhân sự và bấm [Lưu khuôn mặt].
- **THEN**:
  - Mô hình AI trích xuất vector 128 chiều hợp lệ.
  - Gửi request `POST /api/v1/employees/{id}/face-descriptor`, cập nhật thành công vào CSDL.
  - Từ ca tiếp theo, nhân viên C đủ điều kiện tự điểm danh bằng FaceID tại máy POS.

---

### Requirement: REQ-ATT-05 Cơ chế Graceful Fallback khi Chi nhánh chưa có Policy
Trường hợp chi nhánh chưa từng cấu hình `BranchAttendancePolicy` (`policy == null`), hệ thống MUST tự động áp dụng chính sách mặc định mà không gây gián đoạn hay văng lỗi:
- Ngưỡng dung sai đi muộn / về sớm bằng 0 phút ($\text{Threshold} = 0$).
- Đi muộn tính chính xác từng phút chênh lệch so với giờ bắt đầu ca: $\text{LateMinutes} = \max(0, (\text{CheckInTime} - \text{PlannedStartTime}).\text{TotalMinutes})$.
- Về sớm tính chính xác từng phút so với giờ kết thúc ca: $\text{EarlyLeaveMinutes} = \max(0, (\text{PlannedEndTime} - \text{CheckOutTime}).\text{TotalMinutes})$.

#### Scenario: Nhân viên check-in muộn 12 phút tại chi nhánh chưa cấu hình Policy
- **GIVEN**: Chi nhánh X chưa tạo `BranchAttendancePolicy`. Ca làm việc bắt đầu lúc 08:00.
- **WHEN**: Nhân viên D check-in FaceID lúc 08:12.
- **THEN**: Hệ thống tự động ghi nhận `LateMinutes = 12` phút mà không phát sinh lỗi ngoại lệ.

---

### Requirement: REQ-ATT-06 Cơ chế Xử lý Mở ca POS khi FaceID gặp Sự cố
Hệ thống MUST cung cấp 2 giải pháp xử lý khi nhân viên gặp sự cố FaceID (camera hỏng, ánh sáng yếu, không khớp mặt $< 85\%$) để đảm bảo không bị nghẽn quầy bán hàng:
1. **Xử lý nhanh qua Chủ cửa hàng (Tức thì - Realtime):** Nhân viên báo Chủ cửa hàng $\rightarrow$ Chủ mở Bảng chấm công trên điện thoại bấm [Chấm công] tiêu chí "Đi làm" $\rightarrow$ `CheckInTime` được cập nhật $\rightarrow$ Giao diện POS tự động nhận diện và mở khóa quyền [Mở phiên thu ngân] ngay lập tức.
2. **Gửi Đơn báo sự cố chấm công trực tiếp từ Popup FaceID:** Nếu Chủ không online, popup FaceID hiển thị nút **[Báo sự cố chấm công]** $\rightarrow$ Nhân viên gửi đơn giải trình đính kèm ảnh chụp hiện trường $\rightarrow$ Chủ duyệt đơn $\rightarrow$ Ca chuyển `Completed`/`InShift` và mở khóa phiên POS.

#### Scenario: Khách hàng đang đứng chờ thanh toán khi Camera POS bị lỗi
- **GIVEN**: Nhân viên E đến ca lúc 07:00, camera POS bị mất kết nối không thể quét FaceID. Khách hàng đã xếp hàng chờ tính tiền.
- **WHEN**: Nhân viên E gọi điện cho Chủ cửa hàng. Chủ cửa hàng mở Web quản lý trên smartphone, chọn ca của Nhân viên E và bấm [Lưu thiết lập] chấm công Đi làm (mất 5 giây).
- **THEN**:
  - `CheckInTime` của Nhân viên E được ghi nhận ngay lập tức trên hệ thống.
  - Màn hình POS tự động refresh trạng thái, nút [Mở phiên thu ngân] chuyển sang màu xanh cho phép mở ca bán hàng ngay lập tức cho khách.

---

## Acceptance checklist

- [ ] REQ-ATT-01: Điểm danh vào ca FaceID phản hồi $\le 1.0$ giây, yêu cầu liveness chớp mắt thật.
- [ ] REQ-ATT-01: Độ tương đồng $\ge 85.00\%$, chụp và lưu ảnh snapshot camera `CheckInFaceImageUrl`.
- [ ] REQ-ATT-01: Mở khóa quyền bấm Mở phiên thu ngân trên máy POS sau khi Check-in.
- [ ] REQ-ATT-02: Bắt buộc phiên thu ngân POS đã `Closed` mới cho phép Check-out ra ca; chặn khi POS còn `Open`.
- [ ] REQ-ATT-02: Tự động tính đúng `ActualWorkHours` và chuyển ca sang `Status = Completed`.
- [ ] REQ-ATT-03: Chấm công thủ công tiêu chí "Đi làm" để trống tự động lấy giờ ca kế hoạch ban đầu.
- [ ] REQ-ATT-03: Chấm công thủ công tiêu chí "Nghỉ phép hưởng lương" bảo toàn đủ `ActualWorkHours = DurationHours`, loại `PAID_LEAVE`.
- [ ] REQ-ATT-04: Đăng ký thành công vector 128 số thực `FaceDescriptor` cho nhân viên.
- [ ] REQ-ATT-05: Fallback êm khi chưa có policy chi nhánh, không văng lỗi 500, tính dung sai = 0.
- [ ] REQ-ATT-06: Cơ chế mở POS khi FaceID lỗi hỗ trợ cả 2 cách: Chủ chấm nhanh từ xa (tức thì 5s) và Gửi đơn báo sự cố chấm công từ popup FaceID.
