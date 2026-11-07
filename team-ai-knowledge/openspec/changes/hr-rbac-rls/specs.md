# Specs: hr-rbac-rls

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/employees` | `EmployeeQueryFilter` | `PagedResult<EmployeeSummaryDto>` | `401 Unauthorized`, `403 Forbidden` |
| `GET` | `/api/employees/{id}` | `Guid id` | `EmployeeResponse` | `401`, `403 Forbidden` (khi nhân viên xem hồ sơ người khác), `404` |
| `POST` | `/api/employees` | `CreateEmployeeRequest` | `EmployeeResponse` | `401`, `403 Forbidden` |
| `PUT` | `/api/employees/{id}` | `UpdateEmployeeRequest` | `EmployeeResponse` | `401`, `403 Forbidden` |
| `PATCH`| `/api/employees/{id}/status`| `UpdateEmployeeStatusRequest` | `200 OK` | `401`, `403 Forbidden` |
| `POST` | `/api/employees/{id}/identity-account` | `CreateIdentityAccountRequest` | `200 OK` | `401`, `403 Forbidden` |
| `PUT` | `/api/employees/{id}/identity-account` | `CreateIdentityAccountRequest` | `200 OK` | `401`, `403 Forbidden` |
| `DELETE`| `/api/employees/{id}` | `Guid id` | `200 OK` | `401`, `403 Forbidden` |
| `GET` | `/api/shift-configs` | `ShiftConfigQueryFilter` | `PagedResult<ShiftConfigResponse>` | `401` |
| `POST, PUT, DELETE` | `/api/shift-configs/{id?}` | Body Dto | `ShiftConfigResponse` | `401`, `403 Forbidden` |
| `GET` | `/api/schedules` | `ScheduleQueryFilter` | `IReadOnlyList<ScheduleResponse>` | `401`, `403 Forbidden` |
| `GET` | `/api/schedules/my-schedule` | `DateTime? fromDate, toDate` | `IReadOnlyList<ScheduleResponse>` | `401 Unauthorized` |
| `GET` | `/api/schedules/{id}` | `Guid id` | `ScheduleResponse` | `401`, `403 Forbidden` (ca người khác), `404` |
| `POST` | `/api/schedules/batch` | `BatchCreateScheduleRequest` | `IReadOnlyList<ScheduleResponse>` | `401`, `403 Forbidden` |
| `POST` | `/api/schedules/publish` | `PublishSchedulesRequest` | `PublishSchedulesResponse` | `401`, `403 Forbidden` |
| `POST, PUT` | `/api/schedules/{id}/attendance` | `ManualAttendanceRequest` | `ScheduleResponse` | `401`, `403 Forbidden` |
| `GET` | `/api/payslips` | `PayslipQueryFilter` | `PagedResult<PayslipSummaryDto>` | `401`, `403 Forbidden` |
| `GET` | `/api/payslips/{id}` | `Guid id` | `PayslipResponse` | `401`, `403 Forbidden` (phiếu người khác), `404` |
| `POST` | `/api/payslips/generate-batch` | `GeneratePayrollBatchRequest` | `IReadOnlyList<PayslipResponse>` | `401`, `403 Forbidden` |
| `POST` | `/api/payslips/recalculate` | `GeneratePayrollBatchRequest` | `IReadOnlyList<PayslipResponse>` | `401`, `403 Forbidden` |
| `POST` | `/api/payslips/{id}/pay` | `PayPayslipRequest` | `PayslipResponse` | `401`, `403 Forbidden` |
| `POST` | `/api/payslips/batch-pay` | `BatchPayPayslipsRequest` | `BatchPayResultDto` | `401`, `403 Forbidden` |
| `DELETE`| `/api/payslips/{id}` | `Guid id` | `bool` | `401`, `403 Forbidden` |
| `GET` | `/api/attendance-policies/branch/{id}` | `Guid branchId` | `AttendancePolicyResponse` | `401` |
| `PUT` | `/api/attendance-policies/branch/{id}` | `UpsertAttendancePolicyRequest` | `AttendancePolicyResponse` | `401`, `403 Forbidden` |
| `POST` | `/api/attendance-policies/copy` | `CopyAttendancePolicyRequest` | `CopyAttendancePolicyResultDto` | `401`, `403 Forbidden` |

---

## ADDED Requirements

### Requirement: REQ-01 Áp dụng RBAC trên Controllers Phân hệ Nhân sự
Hệ thống **MUST** bảo vệ các endpoints của 5 Controller (`EmployeesController`, `ShiftConfigsController`, `SchedulesController`, `PayslipsController`, `BranchAttendancePoliciesController`) bằng xác thực JWT `[Authorize]`.
Hệ thống **MUST** chỉ cho phép tài khoản có Role `STORE_OWNER` hoặc `ADMIN` thực hiện các thao tác quản trị (Tạo, Sửa, Xóa nhân viên, Phân ca, Ban hành lịch, Chấm công hộ, Khởi tạo bảng lương, Chi trả lương, Cấu hình chính sách).
Hệ thống **SHALL** cho phép tài khoản mang Role `EMPLOYEE` hoặc `STAFF` truy cập các endpoint đọc thông tin ca làm việc, tra cứu lịch làm việc cá nhân (`my-schedule`), xem chính sách chấm công.

#### Scenario: Chủ cửa hàng thực hiện thao tác quản trị thành công
- **GIVEN** Người dùng đã đăng nhập với vai trò `STORE_OWNER`.
- **WHEN** Gửi request `POST /api/payslips/generate-batch` để khởi tạo bảng lương.
- **THEN** Hệ thống xử lý thành công và trả về mã HTTP `200 OK`.

#### Scenario: Nhân viên cố tình gọi API quản trị bị từ chối
- **GIVEN** Người dùng đã đăng nhập với vai trò `EMPLOYEE`.
- **WHEN** Gửi request `POST /api/payslips/generate-batch` hoặc `DELETE /api/employees/{id}`.
- **THEN** Hệ thống chặn request và trả về mã HTTP `403 Forbidden`.

---

### Requirement: REQ-02 Row-Level Security (RLS) cho Hồ sơ Nhân viên
Hệ thống **MUST** giới hạn quyền truy cập chi tiết hồ sơ `GET /api/employees/{id}`.
Nếu người dùng đăng nhập có vai trò `EMPLOYEE` hoặc `STAFF`, hệ thống **MUST** kiểm tra xem `id` được yêu cầu có tương ứng với tài khoản nhân viên của chính người dùng đó hay không (thông qua `Employee.UserId == currentUserId`).

#### Scenario: Nhân viên xem hồ sơ của chính mình
- **GIVEN** Nhân viên A đang đăng nhập hệ thống với `UserId = U-001` gắn với hồ sơ `EmployeeId = E-001`.
- **WHEN** Nhân viên A gửi request `GET /api/employees/E-001`.
- **THEN** Hệ thống trả về `200 OK` cùng thông tin hồ sơ của nhân viên A.

#### Scenario: Nhân viên cố tình truy cập hồ sơ nhân viên khác (IDOR)
- **GIVEN** Nhân viên A đang đăng nhập hệ thống với `EmployeeId = E-001`.
- **WHEN** Nhân viên A gửi request `GET /api/employees/E-002` (hồ sơ của nhân viên B).
- **THEN** Hệ thống chặn lại và trả về HTTP `403 Forbidden` với mã lỗi `FORBIDDEN`.

---

### Requirement: REQ-03 Row-Level Security (RLS) cho Phiếu lương và Thông tin Thu nhập
Hệ thống **MUST** bảo vệ thông tin thu nhập của nhân viên.
Chỉ `STORE_OWNER` và `ADMIN` được phép gọi `GET /api/payslips` để xem danh sách toàn bộ phiếu lương của cửa hàng.
Tại endpoint `GET /api/payslips/{id}`, nếu người dùng là `EMPLOYEE`, hệ thống **MUST** xác thực phiếu lương có trường `Employee.UserId` khớp với `CurrentUserId` của người gọi.

#### Scenario: Nhân viên xem phiếu lương của chính mình
- **GIVEN** Nhân viên A có phiếu lương `P-001` trong kỳ tháng 10.
- **WHEN** Nhân viên A gửi request `GET /api/payslips/P-001`.
- **THEN** Hệ thống trả về HTTP `200 OK` với chi tiết thu nhập của nhân viên A.

#### Scenario: Nhân viên cố tình xem phiếu lương của đồng nghiệp
- **GIVEN** Nhân viên B có phiếu lương `P-002`.
- **WHEN** Nhân viên A gửi request `GET /api/payslips/P-002`.
- **THEN** Hệ thống chặn lại và trả về HTTP `403 Forbidden`.

#### Scenario: Nhân viên gọi API danh sách toàn bộ phiếu lương
- **GIVEN** Người dùng mang vai trò `EMPLOYEE`.
- **WHEN** Gửi request `GET /api/payslips`.
- **THEN** Hệ thống trả về HTTP `403 Forbidden`.

---

### Requirement: REQ-04 Row-Level Security (RLS) cho Ca làm việc
Hệ thống **MUST** đảm bảo tại endpoint `GET /api/schedules/{id}`, nếu người dùng là `EMPLOYEE`, chỉ được phép xem ca làm việc mà mình được phân công (`Schedule.Employee.UserId == CurrentUserId`).
Tại endpoint `GET /api/schedules/my-schedule`, hệ thống **MUST** tự động trích xuất `UserId` từ JWT Token và chỉ trả về danh sách ca làm việc của người dùng hiện tại.

#### Scenario: Nhân viên tra cứu ca cá nhân
- **GIVEN** Nhân viên đang đăng nhập gửi request `GET /api/schedules/my-schedule`.
- **WHEN** Hệ thống xử lý request.
- **THEN** Trả về danh sách các ca làm việc của chính nhân viên đó, không lẫn ca của nhân viên khác.

---

### Requirement: REQ-05 Bảo vệ giao diện người dùng Frontend (UI Role Guard & Visibility)
Phía Frontend **MUST** căn cứ vào thông tin vai trò người dùng trong Auth Store để:
1. Chặn người dùng `EMPLOYEE` truy cập vào các tuyến đường quản trị `/store-owner/employees/*` và tự động redirect về cổng nhân viên `/employee/schedule`.
2. Ẩn toàn bộ các nút thao tác quản trị trên UI đối với vai trò `EMPLOYEE`: "Thêm nhân viên", "Cấp tài khoản", "Xếp ca", "Ban hành lịch", "Khởi tạo bảng lương", "Tính lại bảng lương", "Chi trả".

#### Scenario: Nhân viên truy cập portal
- **GIVEN** Người dùng đăng nhập thành công với vai trò `EMPLOYEE`.
- **WHEN** Người dùng mở ứng dụng.
- **THEN** Hệ thống chỉ hiển thị cổng thông tin nhân viên, không hiển thị menu quản trị nhân sự hay bảng lương toàn cửa hàng.

---

## Acceptance checklist
- [ ] REQ-01: Cả 5 Controller (`Employees`, `ShiftConfigs`, `Schedules`, `Payslips`, `BranchAttendancePolicies`) có `[Authorize]` và lọc role chính xác.
- [ ] REQ-02: Nhân viên xem hồ sơ của mình thành công (`200 OK`), xem hồ sơ người khác bị `403 Forbidden`.
- [ ] REQ-03: Nhân viên xem phiếu lương của mình thành công (`200 OK`), xem phiếu lương người khác hoặc danh sách toàn cửa hàng bị `403 Forbidden`.
- [ ] REQ-04: API `my-schedule` và `GET /api/schedules/{id}` tuân thủ RLS cho ca làm việc.
- [ ] REQ-05: Frontend UI ẩn/hiện đúng quyền và route guard bảo vệ an toàn.
- [ ] Unit Test suite của Backend đạt 100% PASS và bổ sung test cases cho RBAC/RLS.
