# Specs: employee-management-backend

## API / Contract

| Method | Path | Request Body | Response | Mã lỗi |
|---|---|---|---|---|
| GET | `/api/v1/employees` | Query: `keyword`, `branchId`, `status`, `page`, `pageSize` | `PagedList<EmployeeSummaryDto>` | 401, 403 |
| GET | `/api/v1/employees/{id}` | — | `EmployeeResponse` | 401, 404 |
| POST | `/api/v1/employees` | `CreateEmployeeRequest` | 201 Created `EmployeeResponse` | 400, 409 (trùng SĐT/CCCD) |
| PUT | `/api/v1/employees/{id}` | `UpdateEmployeeRequest` | 200 OK `EmployeeResponse` | 400, 404, 409 |
| PATCH | `/api/v1/employees/{id}/status` | `UpdateEmployeeStatusRequest` | 200 OK | 400, 404 |
| POST | `/api/v1/employees/{id}/identity-account` | `CreateIdentityAccountRequest` | 200 OK `UserDto` | 400, 404, 409 |
| DELETE | `/api/v1/employees/{id}` | — | 200 OK | 400 (đã có ca làm việc/phiếu lương), 404 |
| GET | `/api/v1/shift-configs` | Query: `branchId`, `status` | `List<ShiftConfigDto>` | 401, 403 |
| GET | `/api/v1/shift-configs/{id}` | — | `ShiftConfigDto` | 401, 404 |
| POST | `/api/v1/shift-configs` | `CreateShiftConfigRequest` | 201 Created `ShiftConfigDto` | 400, 409 |
| PUT | `/api/v1/shift-configs/{id}` | `UpdateShiftConfigRequest` | 200 OK `ShiftConfigDto` | 400, 404, 409 |
| DELETE | `/api/v1/shift-configs/{id}` | — | 200 OK | 400, 404 |
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

### Requirement: REQ-01 Quản lý Hồ sơ Nhân viên & Đồng bộ Phụ cấp (Sync & Diffing)
Hệ thống **MUST** hỗ trợ tạo, tra cứu, chỉnh sửa hồ sơ nhân viên và cấp tài khoản đăng nhập Identity.
Hệ thống **MUST** tự động sinh mã nhân viên tuần tự theo định dạng `NV0001`, `NV0002` theo từng Tenant và ngăn chặn trùng lặp mã cũng như trùng lặp CCCD/SĐT trong cùng tenant.
Khi cập nhật phụ cấp nhân viên (`EmployeeAllowance`), hệ thống **MUST** áp dụng thuật toán so sánh và đồng bộ hóa (Sync & Diffing) 3 chiều:
1. **Thêm mới (Insert)**: Phụ cấp trong payload chưa có Id hoặc `Guid.Empty` $\rightarrow$ tạo mới bản ghi qua `_context.EmployeeAllowances.Add()` và gán tường minh `EntityState.Added` (ngăn ngừa EF Core hiểu nhầm Id sinh sẵn từ constructor của `BaseTenantEntity` thành `Modified` gây `DbUpdateConcurrencyException`).
2. **Cập nhật (Update)**: Phụ cấp có Id tồn tại trong cả database và payload $\rightarrow$ giữ nguyên Id, cập nhật Tên và Số tiền, gán `EntityState.Modified`.
3. **Xóa (Delete)**: Phụ cấp có trong database nhưng không còn trong payload $\rightarrow$ xóa vĩnh viễn khỏi cơ sở dữ liệu qua `_context.EmployeeAllowances.RemoveRange(toDelete)` mà **không** gọi `employee.Allowances.Remove(item)` trên collection in-memory nhằm triệt tiêu ngoại lệ đứt gãy quan hệ (`severed relationship`) do khóa ngoại `EmployeeId` là non-nullable.

Hệ thống **MUST** thực thi quy tắc nghiệp vụ `BR-EMP-03`: Chỉ cho phép xóa nhân viên khi nhân viên đó **chưa từng lưu trữ bất kỳ dữ liệu ca làm việc / lịch làm việc (`EmployeeSchedule`) và phiếu lương (`Payslip`)**. Khi xóa nhân viên hợp lệ thành công, hệ thống **MUST** đồng thời dọn dẹp và xóa sạch toàn bộ các khoản phụ cấp (`EmployeeAllowances`) của nhân viên đó khỏi cơ sở dữ liệu. Nếu nhân viên đã phát sinh ca làm việc hoặc phiếu lương, hệ thống **MUST** từ chối xóa và yêu cầu chuyển trạng thái sang `Inactive` (Ngừng làm việc) để bảo toàn lịch sử chấm công và tính toàn vẹn dữ liệu sổ quỹ/lương.

#### Scenario: Tạo hồ sơ nhân viên mới thành công
- **GIVEN** Store Owner hoặc Branch Manager đã đăng nhập và gửi thông tin nhân viên hợp lệ kèm mức lương cơ bản và chi nhánh trực thuộc.
- **WHEN** Gửi request `POST /api/v1/employees`.
- **THEN** Hệ thống sinh mã tuần tự tiếp theo (VD `NV0005`), lưu vào DB với `TenantId` hiện tại, trả về status 201 Created kèm dữ liệu nhân viên.

#### Scenario: Ngăn chặn trùng lặp CCCD hoặc SĐT
- **GIVEN** Một nhân viên đã tồn tại trong Tenant với CCCD `001202009999` hoặc SĐT `0988776655`.
- **WHEN** Quản trị viên cố gắng tạo hoặc sửa nhân viên có cùng CCCD hoặc SĐT đó.
- **THEN** Hệ thống MUST trả về mã lỗi 409 Conflict với thông báo lỗi chi tiết, không lưu bản ghi.

#### Scenario: Cập nhật phụ cấp an toàn không ngắt liên kết quan hệ (Sync & Diffing)
- **GIVEN** Nhân viên đang có 2 phụ cấp trong DB: Phụ cấp Xăng xe (`Id = guid_1`, 500.000đ) và Phụ cấp Ăn trưa (`Id = guid_2`, 650.000đ).
- **WHEN** Quản trị viên gửi request `PUT /api/v1/employees/{id}` với danh sách phụ cấp mới gồm: Phụ cấp Ăn trưa (`Id = guid_2`, tăng lên 700.000đ) và Phụ cấp Chuyên cần (không có Id, 300.000đ).
- **THEN** Hệ thống:
  - Cập nhật số tiền Phụ cấp Ăn trưa thành 700.000đ (giữ nguyên `guid_2`).
  - Thêm mới bản ghi Phụ cấp Chuyên cần với `EntityState.Added` (chèn thành công, không bị lỗi Concurrency).
  - Xóa bỏ Phụ cấp Xăng xe khỏi database mà không gây lỗi ngắt quan hệ (severed relationship).
  - Trả về HTTP 200 OK với danh sách phụ cấp đã đồng bộ.

#### Scenario: Từ chối xóa nhân viên đã có dữ liệu ca làm việc hoặc phiếu lương (BR-EMP-03)
- **GIVEN** Nhân viên đã có ít nhất một ca làm việc (`EmployeeSchedule`) hoặc phiếu lương (`Payslip`) trong hệ thống.
- **WHEN** Quản trị viên gửi request `DELETE /api/v1/employees/{id}`.
- **THEN** Hệ thống MUST từ chối xóa và trả về HTTP 400 Bad Request với mã lỗi `EMPLOYEE_HAS_WORK_HISTORY`, kèm thông báo hướng dẫn chuyển trạng thái nhân viên sang 'Ngừng làm việc' thay vì xóa.

#### Scenario: Xóa nhân viên hợp lệ đồng thời xóa sạch phụ cấp (BR-EMP-03)
- **GIVEN** Nhân viên chưa từng phát sinh ca làm việc (`EmployeeSchedule`) và phiếu lương (`Payslip`), nhưng đang có 2 khoản phụ cấp cố định (`EmployeeAllowance`).
- **WHEN** Quản trị viên gửi request `DELETE /api/v1/employees/{id}`.
- **THEN** Hệ thống:
  - Xóa sạch toàn bộ các khoản phụ cấp `EmployeeAllowance` của nhân viên này khỏi cơ sở dữ liệu.
  - Cập nhật trạng thái nhân viên sang `IsDeleted = true`, `Status = Inactive`.
  - Trả về HTTP 200 OK.

#### Scenario: Cấp tài khoản đăng nhập cho nhân viên
- **GIVEN** Nhân viên chưa có tài khoản đăng nhập (`UserId == null`).
- **WHEN** Gửi request `POST /api/v1/employees/{id}/identity-account` với Username, Password và Role (`CASHIER` hoặc `STAFF`).
- **THEN** Hệ thống mã hóa mật khẩu bằng BCrypt, tạo User mới trong Identity, gán Role và liên kết `Employee.UserId = User.Id`.

---

### Requirement: REQ-02 Cấu hình Ca làm việc Đa chi nhánh & Chấm công qua đêm
Hệ thống **MUST** quản lý danh mục ca làm việc (`ShiftConfigs`), cho phép cấu hình khung giờ làm việc (`StartTime`, `EndTime`), tổng giờ làm việc (`WorkHours`), và khung giờ cho phép chấm công (`CheckInStart`, `CheckInEnd`).
Hệ thống **MUST** hỗ trợ cấu hình phạm vi áp dụng cho một hoặc nhiều chi nhánh (`BranchIds` multi-branch JSONB).
Hệ thống **MUST** hỗ trợ ca qua đêm hoặc chấm công kết thúc vào ngày hôm sau (`IsNextDayCheckIn = true`).

#### Scenario: Thêm mới ca làm việc áp dụng nhiều chi nhánh
- **GIVEN** Quản lý tạo ca "Tối" (17:00 - 21:00, 4h công), giờ chấm công từ 14:00 đến 00:00 ngày hôm sau.
- **AND** Phạm vi áp dụng gồm 2 chi nhánh: "Chi nhánh trung tâm" và "Chi nhánh HCM".
- **WHEN** Gửi `POST /api/v1/shift-configs`.
- **THEN** Hệ thống lưu cấu hình ca với `BranchIds` chứa danh sách ID của 2 chi nhánh, trả về HTTP 201 Created.

---

### Requirement: REQ-03 Lập lịch & Ban hành Ca làm việc
Hệ thống **MUST** cho phép lập lịch làm việc theo tuần/tháng cho nhân viên chi nhánh và **MUST** kiểm tra ngăn chặn xung đột thời gian ca của cùng một nhân viên trong ngày.

#### Scenario: Phân ca hàng loạt theo tuần thành công
- **GIVEN** Danh sách phân ca cho các nhân viên trong tuần từ thứ 2 đến Chủ nhật tại chi nhánh A không bị trùng thời gian.
- **WHEN** Gửi request `POST /api/v1/schedules/batch`.
- **THEN** Hệ thống lưu danh sách `EmployeeSchedules` với trạng thái `draft` và trả về danh sách ca đã tạo.

#### Scenario: Ngăn chặn xung đột lịch ca của nhân viên
- **GIVEN** Nhân viên A đã được phân ca Sáng (06:00 - 14:00) ngày 05/11/2026.
- **WHEN** Người quản lý gửi request phân thêm ca Giao thoa (12:00 - 18:00) cho nhân viên A cùng ngày đó.
- **THEN** Hệ thống MUST trả về mã lỗi 400 Bad Request chỉ rõ nhân viên A đang bị trùng lặp thời gian làm việc.

---

### Requirement: REQ-04 Chấm công số với Xác thực GPS Geofencing
Hệ thống **MUST** xác thực tọa độ GPS của thiết bị khi nhân viên thực hiện Check-in / Check-out so với tọa độ chi nhánh làm việc theo công thức Haversine. Hệ thống **MUST** tự động tính số phút đi muộn (`LateMinutes`) và tổng số giờ công thực tế (`ActualWorkHours`).

#### Scenario: Chấm công vào ca đúng vị trí chi nhánh
- **GIVEN** Nhân viên có ca trực từ 06:00 đến 14:00, vị trí GPS của nhân viên cách chi nhánh 25 mét (nhỏ hơn bán kính cho phép 100 mét).
- **WHEN** Nhân viên gửi `POST /api/v1/attendance/check-in` lúc 06:05.
- **THEN** Hệ thống ghi nhận `CheckInTime = UtcNow`, gán `IsGpsValid = true`, tính `LateMinutes = 5`, cập nhật ca làm việc sang `in_progress`.

#### Scenario: Chấm công ra ca và tổng hợp giờ công
- **GIVEN** Nhân viên đã check-in lúc 06:00 và hoàn thành ca lúc 14:00.
- **WHEN** Nhân viên gửi `POST /api/v1/attendance/check-out`.
- **THEN** Hệ thống ghi nhận `CheckOutTime = UtcNow`, tính `ActualWorkHours = 8.00`, chuyển trạng thái ca sang `completed`.

---

### Requirement: REQ-05 Đóng ca POS, Đối soát 9 Mệnh giá & Tự động sinh Phiếu thu Sổ quỹ
Hệ thống **MUST** quản lý chu trình phiên ca thu ngân POS. Khi đóng ca, nhân viên **MUST** khai báo số lượng 9 mệnh giá tiền mặt. Nếu có chênh lệch thừa/thiếu tiền mặt so với lý thuyết, nhân viên **MUST** giải trình lý do theo quy tắc `GBR-POS-04`. Khi chủ cửa hàng duyệt ca, hệ thống **MUST** tự động sinh Phiếu thu tiền mặt vào Sổ quỹ (`Cashbooks` type `INCOME`).

---

### Requirement: REQ-06 Payroll Engine & Chi trả Lương Tích hợp Sổ quỹ
Hệ thống **MUST** cung cấp động cơ tính lương tự động quét ngày công từ `EmployeeSchedules` trong tháng, tính toán lương cơ bản, làm ngoài giờ, phụ cấp, thưởng và phạt đi trễ. Khi phê duyệt chi trả lương, hệ thống **MUST** tự động sinh Phiếu chi lương vào Sổ quỹ (`Cashbooks` type `EXPENSE`).

---

## Acceptance Checklist
- [ ] REQ-01: CRUD hồ sơ nhân viên, sinh mã `NVxxxx` tuần tự, cấp tài khoản `Users`, validate trùng SĐT/CCCD, đồng bộ phụ cấp bằng thuật toán Sync & Diffing an toàn và chặn xóa nhân viên đã có ca làm việc hoặc phiếu lương (BR-EMP-03, xóa sạch phụ cấp khi xóa nhân viên hợp lệ).
- [ ] REQ-02: Quản lý danh mục ca làm việc `ShiftConfigs`, hỗ trợ multi-branch và ca chấm công qua đêm.
- [ ] REQ-03: Phân ca hàng loạt theo tuần/tháng, ban hành ca và kiểm tra ngăn chặn trùng lặp khung giờ ca.
- [ ] REQ-04: Chấm công GPS Geofencing theo công thức Haversine bán kính chi nhánh, tính đúng `LateMinutes` và `ActualWorkHours`.
- [ ] REQ-05: Mở/đóng ca POS với khai báo 9 mệnh giá, đối soát chênh lệch `GBR-POS-04`, khóa Z-Report và tự động sinh Phiếu thu Sổ quỹ (`INCOME`) khi chủ duyệt.
- [ ] REQ-06: Payroll Engine tổng hợp ngày công tháng tự động, tính đúng NetSalary, chi trả VietQR/Tiền mặt và tự động sinh Phiếu chi Sổ quỹ (`EXPENSE`).
