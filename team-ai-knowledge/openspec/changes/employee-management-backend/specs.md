# Specs: employee-management-backend

## API / Contract

| Method | Path | Request Body | Response | Mã lỗi |
|---|---|---|---|---|
| GET | `/api/v1/employees` | Query: `keyword`, `branchId`, `status`, `page`, `pageSize` | `PagedList<EmployeeSummaryDto>` | 401, 403 |
| GET | `/api/v1/employees/{id}` | — | `EmployeeDetailDto` | 401, 404 |
| POST | `/api/v1/employees` | `CreateEmployeeRequest` | 201 Created `EmployeeDetailDto` | 400, 409 (trùng SĐT/CCCD) |
| PUT | `/api/v1/employees/{id}` | `UpdateEmployeeRequest` | 200 OK `EmployeeDetailDto` | 400, 404, 409 |
| PATCH | `/api/v1/employees/{id}/status` | `UpdateEmployeeStatusRequest` | 200 OK | 400, 404 |
| POST | `/api/v1/employees/{id}/identity-account` | `CreateIdentityAccountRequest` | 200 OK `UserDto` | 400, 404, 409 |
| GET | `/api/v1/schedules` | Query: `branchId`, `fromDate`, `toDate` | `List<EmployeeScheduleDto>` | 401, 403 |
| GET | `/api/v1/schedules/my-schedule` | Query: `fromDate`, `toDate` | `List<EmployeeScheduleDto>` | 401 |
| POST | `/api/v1/schedules/batch` | `BatchAssignScheduleRequest` | 200 OK `List<EmployeeScheduleDto>` | 400 (xung đột ca), 404 |
| POST | `/api/v1/schedules/publish` | `PublishScheduleRequest` | 200 OK | 400, 404 |
| POST | `/api/v1/attendance/check-in` | `CheckInRequest` | 200 OK `AttendanceResultDto` | 400, 404 |
| POST | `/api/v1/attendance/check-out` | `CheckOutRequest` | 200 OK `AttendanceResultDto` | 400, 404 |
| POST | `/api/v1/attendance/{scheduleId}/request-approval` | `AttendanceApprovalRequest` | 200 OK | 400, 404 |
| POST | `/api/v1/attendance/{scheduleId}/approve` | `ApproveAttendanceAdjustmentRequest` | 200 OK | 400, 403, 404 |
| POST | `/api/v1/cashier-shifts/open` | `OpenCashierShiftRequest` | 201 Created `CashierShiftDto` | 400 (đang có ca mở) |
| GET | `/api/v1/cashier-shifts/{id}/summary` | — | `CashierShiftSummaryDto` | 401, 404 |
| POST | `/api/v1/cashier-shifts/{id}/close` | `CloseCashierShiftRequest` (9 mệnh giá) | 200 OK `ShiftZReportDto` | 400 (thiếu giải trình lệch tiền) |
| GET | `/api/v1/cashier-shifts/pending-audit` | Query: `branchId` | `List<CashierShiftDto>` | 401, 403 |
| POST | `/api/v1/cashier-shifts/{id}/audit-approve` | `AuditApproveShiftRequest` | 200 OK `AuditShiftResultDto` | 400, 403, 404 (đã duyệt rồi) |
| POST | `/api/v1/payroll/generate` | Query/Body: `periodMonth`, `branchId` | 201 Created `List<PayslipSummaryDto>` | 400, 409 |
| GET | `/api/v1/payroll/payslips` | Query: `periodMonth`, `branchId`, `status`, `page`, `pageSize` | `PagedList<PayslipSummaryDto>` | 401, 403 |
| GET | `/api/v1/payroll/payslips/{id}` | — | `PayslipDetailDto` | 401, 404 |
| POST | `/api/v1/payroll/payslips/{id}/pay` | `PayPayslipRequest` | 200 OK `PaymentResultDto` | 400, 403, 404 (đã thanh toán) |

---

## ADDED Requirements

### Requirement: REQ-01 Quản lý Hồ sơ Nhân viên & Cấp mã tuần tự
Hệ thống **MUST** hỗ trợ tạo, tra cứu, chỉnh sửa hồ sơ nhân viên và cấp tài khoản đăng nhập Identity.
Hệ thống **MUST** tự động sinh mã nhân viên tuần tự theo định dạng `NV0001`, `NV0002` theo từng Tenant và ngăn chặn trùng lặp mã cũng như trùng lặp CCCD/SĐT trong cùng tenant.

#### Scenario: Tạo hồ sơ nhân viên mới thành công
- **GIVEN** Store Owner hoặc Branch Manager đã đăng nhập và gửi thông tin nhân viên hợp lệ kèm mức lương cơ bản.
- **WHEN** Gửi request `POST /api/v1/employees`.
- **THEN** Hệ thống sinh mã tuần tự tiếp theo (VD `NV0005`), lưu vào DB với `TenantId` hiện tại, trả về status 201 Created kèm dữ liệu nhân viên.

#### Scenario: Ngăn chặn trùng lặp CCCD hoặc SĐT
- **GIVEN** Một nhân viên đã tồn tại trong Tenant với CCCD `001202009999` hoặc SĐT `0988776655`.
- **WHEN** Quản trị viên cố gắng tạo nhân viên mới có cùng CCCD hoặc SĐT đó.
- **THEN** Hệ thống MUST trả về mã lỗi 409 Conflict với thông báo lỗi chi tiết, không tạo bản ghi mới.

#### Scenario: Cấp tài khoản đăng nhập cho nhân viên
- **GIVEN** Nhân viên chưa có tài khoản đăng nhập (`UserId == null`).
- **WHEN** Gửi request `POST /api/v1/employees/{id}/identity-account` với Username, Password và Role (`CASHIER` hoặc `STAFF`).
- **THEN** Hệ thống mã hóa mật khẩu bằng BCrypt, tạo User mới trong Identity, gán Role và liên kết `Employee.UserId = User.Id`.

---

### Requirement: REQ-02 Lập lịch & Ban hành Ca làm việc
Hệ thống **MUST** cho phép lập lịch làm việc theo tuần/tháng cho nhân viên chi nhánh và **MUST** kiểm tra ngăn chặn xung đột thời gian ca của cùng một nhân viên trong ngày.

#### Scenario: Phân ca hàng loạt theo tuần thành công
- **GIVEN** Danh sách phân ca cho các nhân viên trong tuần từ thứ 2 đến Chủ nhật tại chi nhánh A không bị trùng thời gian.
- **WHEN** Gửi request `POST /api/v1/schedules/batch`.
- **THEN** Hệ thống lưu danh sách `EmployeeSchedules` với trạng thái `draft` và trả về danh sách ca đã tạo.

#### Scenario: Ngăn chặn xung đột lịch ca của nhân viên
- **GIVEN** Nhân viên A đã được phân ca Sáng (06:00 - 14:00) ngày 05/11/2026.
- **WHEN** Người quản lý gửi request phân thêm ca Giao thoa (12:00 - 18:00) cho nhân viên A cùng ngày đó.
- **THEN** Hệ thống MUST trả về mã lỗi 400 Bad Request chỉ rõ nhân viên A đang bị trùng lặp thời gian làm việc.

#### Scenario: Ban hành lịch làm việc tuần
- **GIVEN** Các ca làm việc trong tuần đang ở trạng thái `draft`.
- **WHEN** Gửi request `POST /api/v1/schedules/publish` cho khoảng thời gian tuần đó.
- **THEN** Tất cả các ca thuộc dải ngày được chuyển trạng thái sang `scheduled`, nhân viên có thể xem lịch trên app cá nhân.

---

### Requirement: REQ-03 Chấm công số với Xác thực GPS Geofencing
Hệ thống **MUST** xác thực tọa độ GPS của thiết bị khi nhân viên thực hiện Check-in / Check-out so với tọa độ chi nhánh làm việc theo công thức Haversine. Hệ thống **MUST** tự động tính số phút đi muộn (`LateMinutes`) và tổng số giờ công thực tế (`ActualWorkHours`).

#### Scenario: Chấm công vào ca đúng vị trí chi nhánh
- **GIVEN** Nhân viên có ca trực từ 06:00 đến 14:00, vị trí GPS của nhân viên cách chi nhánh 25 mét (nhỏ hơn bán kính cho phép 100 mét).
- **WHEN** Nhân viên gửi `POST /api/v1/attendance/check-in` lúc 06:05.
- **THEN** Hệ thống ghi nhận `CheckInTime = UtcNow`, gán `IsGpsValid = true`, tính `LateMinutes = 5`, cập nhật ca làm việc sang `in_progress`.

#### Scenario: Chấm công ngoài phạm vi chi nhánh (Cảnh báo GPS)
- **GIVEN** Nhân viên gửi yêu cầu check-in với tọa độ cách chi nhánh 800 mét (> 100m).
- **WHEN** Nhân viên gửi `POST /api/v1/attendance/check-in`.
- **THEN** Hệ thống MUST đánh dấu `IsGpsValid = false`, lưu khoảng cách thực tế, đánh dấu trạng thái cần người quản lý duyệt giải trình.

#### Scenario: Chấm công ra ca và tổng hợp giờ công
- **GIVEN** Nhân viên đã check-in lúc 06:00 và hoàn thành ca lúc 14:00.
- **WHEN** Nhân viên gửi `POST /api/v1/attendance/check-out`.
- **THEN** Hệ thống ghi nhận `CheckOutTime = UtcNow`, tính `ActualWorkHours = 8.00`, chuyển trạng thái ca sang `completed`.

---

### Requirement: REQ-04 Đóng ca POS, Đối soát 9 Mệnh giá & Tự động sinh Phiếu thu Sổ quỹ
Hệ thống **MUST** quản lý chu trình phiên ca thu ngân POS. Khi đóng ca, nhân viên **MUST** khai báo số lượng 9 mệnh giá tiền mặt. Nếu có chênh lệch thừa/thiếu tiền mặt so với lý thuyết, nhân viên **MUST** giải trình lý do theo quy tắc `GBR-POS-04`. Khi chủ cửa hàng duyệt ca, hệ thống **MUST** tự động sinh Phiếu thu tiền mặt vào Sổ quỹ (`Cashbooks` type `INCOME`).

#### Scenario: Khai báo 9 mệnh giá và phát hiện chênh lệch tiền mặt
- **GIVEN** Ca làm việc có tiền lý thuyết `ExpectedCash = 5,000,000đ`. Nhân viên đếm 9 mệnh giá tiền mặt thực tế được `4,950,000đ` (thiếu 50,000đ).
- **WHEN** Nhân viên gửi request `POST /api/v1/cashier-shifts/{id}/close` không kèm `DiscrepancyNotes`.
- **THEN** Hệ thống MUST từ chối với lỗi 400 Bad Request yêu cầu bắt buộc nhập giải trình chênh lệch tiền mặt.
- **WHEN** Nhân viên điền ghi chú giải trình "Nhầm tiền thối khách hàng 50k" và gửi lại.
- **THEN** Hệ thống khóa ca, lưu `ShiftZReport` với `Discrepancy = -50,000đ`, `Status = Closed`.

#### Scenario: Chủ cửa hàng duyệt ca và tự động hạch toán Sổ quỹ
- **GIVEN** Ca thu ngân đã đóng và chờ duyệt (`IsAudited == false`), số tiền nộp về két chính là `3,500,000đ`.
- **WHEN** Chủ cửa hàng gửi request `POST /api/v1/cashier-shifts/{id}/audit-approve`.
- **THEN** Hệ thống cập nhật ca thành `IsAudited = true`, đồng thời tự động gọi `ICashbookService.ReceiveCashAsync()` tạo Phiếu thu loại `INCOME` với `Amount = 3,500,000đ`, `SourceType = "CASHIER_SHIFT"`, `ReferenceCode` chứa mã ca.

---

### Requirement: REQ-05 Payroll Engine & Chi trả Lương Tích hợp Sổ quỹ
Hệ thống **MUST** cung cấp động cơ tính lương tự động quét ngày công từ `EmployeeSchedules` trong tháng, tính toán lương cơ bản, làm ngoài giờ, phụ cấp, thưởng và phạt đi trễ. Khi phê duyệt chi trả lương, hệ thống **MUST** tự động sinh Phiếu chi lương vào Sổ quỹ (`Cashbooks` type `EXPENSE`).

#### Scenario: Khởi tạo bảng lương tháng tự động
- **GIVEN** Tháng 10/2026 có 3 nhân viên đã hoàn thành các ca làm việc và có cấu hình lương cơ bản.
- **WHEN** Chủ cửa hàng gửi request `POST /api/v1/payroll/generate?periodMonth=2026-10`.
- **THEN** Hệ thống tính toán tổng giờ công, trừ tiền phạt đi muộn, cộng phụ cấp và tạo 3 bản ghi `Payslips` với trạng thái `UNPAID`.

#### Scenario: Ngăn chặn khởi tạo đúp bảng lương của cùng một kỳ
- **GIVEN** Bảng lương kỳ `2026-10` đã được khởi tạo.
- **WHEN** Người dùng gửi lại request khởi tạo cho cùng kỳ `2026-10`.
- **THEN** Hệ thống MUST báo lỗi 409 Conflict, yêu cầu hủy hoặc cập nhật bảng lương hiện tại thay vì tạo trùng lặp.

#### Scenario: Chi trả lương qua Tiền mặt / VietQR và tự động sinh Phiếu chi Sổ quỹ
- **GIVEN** Phiếu lương của nhân viên Nguyễn Văn A có `NetSalary = 8,500,000đ` đang ở trạng thái `UNPAID`.
- **WHEN** Chủ cửa hàng thực hiện chi trả và gửi `POST /api/v1/payroll/payslips/{id}/pay` với `PaymentMethod = "VIETQR"`.
- **THEN** Hệ thống cập nhật phiếu lương thành `PAID`, đồng thời tự động gọi `ICashbookService.DisburseCashAsync()` tạo Phiếu chi loại `EXPENSE` với `Amount = 8,500,000đ`, `SourceType = "SALARY"`, `ReferenceCode = PayslipCode`.

---

## Acceptance Checklist
- [ ] REQ-01: CRUD hồ sơ nhân viên, sinh mã `NVxxxx` tuần tự, cấp tài khoản `Users` và validate trùng SĐT/CCCD.
- [ ] REQ-02: Phân ca hàng loạt theo tuần/tháng, ban hành ca và kiểm tra ngăn chặn trùng lặp khung giờ ca.
- [ ] REQ-03: Chấm công GPS Geofencing theo công thức Haversine bán kính chi nhánh, tính đúng `LateMinutes` và `ActualWorkHours`.
- [ ] REQ-04: Mở/đóng ca POS với khai báo 9 mệnh giá, đối soát chênh lệch `GBR-POS-04`, khóa Z-Report và tự động sinh Phiếu thu Sổ quỹ (`INCOME`) khi chủ duyệt.
- [ ] REQ-05: Payroll Engine tổng hợp ngày công tháng tự động, tính đúng NetSalary, chi trả VietQR/Tiền mặt và tự động sinh Phiếu chi Sổ quỹ (`EXPENSE`).
