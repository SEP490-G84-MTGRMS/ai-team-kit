# Tasks: employee-management-backend

## DB
- [ ] T1 — Bổ sung các cột kiểm soát duyệt ca (`IsAudited`, `AuditedBy`, `AuditedAtUtc`, `DenominationDetailsJson`) vào entity `ShiftZReport` và tạo EF Core Migration (REQ-05)
- [x] T2 — Cấu hình Fluent API trong `AppDbContext` cho các thực thể HR (`Employee`, `ShiftConfig`, `BranchAttendancePolicy`, `EmployeeSchedule`, `Payslip`, `EmployeeAllowance`) với các chỉ mục Index chống trùng lặp theo Tenant và cấu hình cột `ShiftCode` VARCHAR(30) (REQ-01, REQ-02, REQ-07, REQ-03, REQ-06)

## Backend
### Cụm 1: Quản lý Hồ sơ Nhân viên & Cấp tài khoản
- [x] T3 — Xây dựng các DTOs, Request/Response và FluentValidation cho phân hệ Nhân viên trong `MT_GRMS.Application/HR/Employees/Dtos` (hỗ trợ `Guid? Id` trong `EmployeeAllowanceDto`) (REQ-01)
- [x] T4 — Triển khai `IEmployeeService` và `EmployeeService` với logic sinh mã nhân viên tuần tự chuẩn `NVxxxx` theo Tenant, kiểm tra trùng lặp SĐT/CCCD, thuật toán `SyncAllowances` an toàn chống lỗi Concurrency / Severed relationship, và Business Rule `BR-EMP-03` chặn xóa khi có lịch làm việc/phiếu lương (REQ-01)
- [x] T5 — Xây dựng tính năng cấp tài khoản đăng nhập Identity (`Users`) cho nhân viên với mã hóa BCrypt và phân quyền vai trò (REQ-01)
- [x] T6 — Xây dựng `EmployeesController` với đầy đủ các RESTful API endpoints phân trang, tìm kiếm, CRUD và cấp tài khoản (REQ-01)

### Cụm 2: Cấu hình Ca, Chính sách Chấm công & Lập lịch làm việc
#### Nhóm 2.1: Quản lý Danh mục & Cấu hình Ca (ShiftConfigs)
- [x] T7 — Xây dựng các DTOs, Request/Response và FluentValidation cho Cấu hình Ca trong `MT_GRMS.Application/HR/ShiftConfigs/Dtos` (hỗ trợ khung giờ `StartTime`/`EndTime`, `DurationHours`, đa chi nhánh `BranchIds`, ca qua đêm `IsNextDayCheckIn`) (REQ-02)
- [x] T8 — Xây dựng `IShiftConfigRepository`/`ShiftConfigRepository` và `IShiftConfigService`/`ShiftConfigService` xử lý CRUD danh mục ca và phạm vi chi nhánh (REQ-02)
- [x] T9 — Xây dựng `ShiftConfigsController` với đầy đủ RESTful API endpoints: tra cứu theo chi nhánh, xem chi tiết, tạo mới, cập nhật và xóa cấu hình ca (REQ-02)

#### Nhóm 2.2: Quản lý Chính sách Chấm công Chi nhánh (BranchAttendancePolicy)
- [x] T10 — Xây dựng các DTOs, Request/Response và FluentValidation cho Chính sách Chấm công trong `MT_GRMS.Application/HR/AttendancePolicies/Dtos` (hỗ trợ `StandardDayHours`, `IsConvertHoursToDays`, `ConversionRulesJson`, dung sai đi muộn `LateThresholdMinutes`, về sớm, và làm thêm giờ OT) (REQ-07)
- [x] T11 — Triển khai `IBranchAttendancePolicyRepository`/`BranchAttendancePolicyRepository` và `IBranchAttendancePolicyService`/`BranchAttendancePolicyService` xử lý lấy chính sách (fallback default nếu chưa có), Upsert theo chi nhánh và cơ chế sao chép đa chi nhánh (`CopyPolicyAsync`) (REQ-07)
- [x] T12 — Xây dựng `BranchAttendancePoliciesController` với các endpoints: `GET /api/v1/attendance-policies/branch/{branchId}`, `PUT /api/v1/attendance-policies/branch/{branchId}`, và `POST /api/v1/attendance-policies/copy` (REQ-07)

#### Nhóm 2.3: Lập lịch & Ban hành Ca làm việc (Schedules)
- [x] T13 — Xây dựng các DTOs, Request/Response và FluentValidation cho Lịch làm việc trong `MT_GRMS.Application/HR/Schedules/Dtos` (hỗ trợ `CreateRecurringScheduleRequest`, `BatchCreateScheduleRequest` với `HasEndDate`, `EndDate`, và `RepeatDays`) (REQ-03)
- [x] T14 — Triển khai `IScheduleRepository`, `IScheduleService` và `ScheduleService` với thuật toán kiểm tra chống xung đột ca trong ngày (cho phép nhiều ca, max trùng $\le 12$h), tự động tính ngày kết thúc đến hết tháng sau khi bỏ trống, chuẩn hóa `ShiftCode` max 30 ký tự chống tràn cột database, và cơ chế ban hành ca tuần (`publish`) (REQ-03)
- [x] T15 — Xây dựng `SchedulesController` với các endpoints: tra cứu lịch theo dải ngày, lịch cá nhân `my-schedule`, phân ca batch, đăng ký ca lặp định kỳ `POST /api/v1/schedules/recurring` và ban hành ca (REQ-03)

### Cụm 3: Chấm công số & Bảng công
- [ ] T16 — Xây dựng các DTOs cho Chấm công và hàm tính khoảng cách GPS Geofencing theo công thức toán học Haversine trong `MT_GRMS.Application/HR/Attendance` (REQ-04)
- [ ] T17 — Triển khai `IAttendanceService` và `AttendanceService` tự động ghi nhận Check-in/Check-out, áp dụng `BranchAttendancePolicy` để tính số phút đi muộn (`LateMinutes`) có trừ dung sai, về sớm (`EarlyMinutes`), giờ OT và tổng giờ công thực tế (REQ-04)
- [ ] T18 — Xây dựng `AttendanceController` với các endpoints chấm công, gửi yêu cầu giải trình và duyệt điều chỉnh giờ công (REQ-04)

### Cụm 4: Đóng ca POS, Đối soát 9 Mệnh giá & Tự động sinh Phiếu thu Sổ quỹ
- [ ] T19 — Xây dựng các DTOs cho Phiên ca thu ngân trong `MT_GRMS.Application/HR/CashierShifts/Dtos` hỗ trợ kiểm đếm 9 mệnh giá tiền mặt (REQ-05)
- [ ] T20 — Triển khai `ICashierShiftService` và `CashierShiftService` quản lý mở ca kế thừa tiền float, kiểm đếm 9 mệnh giá, đối soát độ lệch tiền két và bắt buộc giải trình theo `GBR-POS-04` (REQ-05)
- [ ] T21 — Triển khai logic Chủ duyệt ca (`AuditApproveShiftAsync`) và tích hợp tự động gọi `ICashbookService.ReceiveCashAsync()` tạo Phiếu thu loại `INCOME` vào Sổ quỹ (REQ-05)
- [ ] T22 — Xây dựng `CashierShiftsController` với các endpoints: mở ca, tóm tắt ca, đóng ca kèm kiểm đếm 9 mệnh giá, danh sách chờ duyệt và duyệt ca (REQ-05)

### Cụm 5: Bảng lương Tự động & Chi trả Sổ quỹ
- [ ] T23 — Xây dựng các DTOs cho Bảng lương trong `MT_GRMS.Application/HR/Payroll/Dtos` (REQ-06)
- [ ] T24 — Triển khai `IPayrollService` và `PayrollService` với Payroll Engine tự động quét và tổng hợp ngày công/giờ công tháng từ `EmployeeSchedules`, tính NetSalary theo công thức (REQ-06)
- [ ] T25 — Triển khai logic phê duyệt chi trả lương qua Tiền mặt / VietQR và tích hợp tự động gọi `ICashbookService.DisburseCashAsync()` tạo Phiếu chi loại `EXPENSE` vào Sổ quỹ (REQ-06)
- [ ] T26 — Xây dựng `PayrollController` với các endpoints: khởi tạo bảng lương tháng, tra cứu danh sách phiếu lương, xem chi tiết và chi trả lương (REQ-06)

## Test
- [x] T27 — Viết Unit Tests cho `EmployeeService` kiểm chứng sinh mã `NVxxxx`, kiểm tra trùng CCCD/SĐT, cấp tài khoản, cơ chế đồng bộ phụ cấp đa chiều và kiểm tra chặn xóa `BR-EMP-03` (REQ-01)
- [x] T28 — Viết Unit Tests cho `ShiftConfigService` kiểm chứng CRUD ca làm việc, validate ca qua đêm và multi-branch (REQ-02)
- [x] T29 — Viết Unit Tests cho `BranchAttendancePolicyService` kiểm chứng lấy chính sách fallback default, Upsert và sao chép đa chi nhánh (REQ-07)
- [x] T30 — Viết Unit Tests cho `ScheduleService` kiểm chứng phân ca batch, ca lặp định kỳ (`CreateRecurringAsync`) tạo lịch đến hết tháng sau hoặc đến ngày kết thúc chỉ định, cho phép nhiều ca trùng $\le 12$h, chặn xung đột $> 12$h và ban hành lịch (REQ-03)
- [ ] T31 — Viết Unit Tests cho `AttendanceService` kiểm chứng tính khoảng cách GPS Geofencing, áp dụng dung sai chính sách chi nhánh và giờ công thực tế (REQ-04)
- [ ] T32 — Viết Unit Tests cho `CashierShiftService` kiểm chứng kiểm đếm 9 mệnh giá, quy tắc `GBR-POS-04` và tự động sinh Phiếu thu Sổ quỹ (REQ-05)
- [ ] T33 — Viết Unit Tests cho `PayrollService` kiểm chứng tính NetSalary, chặn đúp kỳ lương và tự động sinh Phiếu chi Sổ quỹ (REQ-06)

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: shift-config-crud -->
# Tasks: shift-config-crud

## 1. Database & Infrastructure
- [x] **T1** — Xây dựng `IShiftConfigRepository` và `ShiftConfigRepository` trong `MT_GRMS.Infrastructure/Repositories`, đăng ký DI trong `DependencyInjection.cs` (REQ-SHF-01, REQ-SHF-02)

## 2. Backend Application
- [x] **T2** — Tạo các DTOs `ShiftConfigDtos.cs` (`CreateShiftConfigRequest`, `UpdateShiftConfigRequest`, `ShiftConfigResponse`, `UpdateShiftConfigStatusRequest`) trong `MT_GRMS.Application/HR/ShiftConfigs/Dtos` (REQ-SHF-01, REQ-SHF-03)
- [x] **T3** — Viết bộ kiểm tra hợp lệ dữ liệu `ShiftConfigValidators.cs` bằng FluentValidation cho tạo mới và cập nhật ca (REQ-SHF-01, REQ-SHF-03)
- [x] **T4** — Xây dựng `IShiftConfigService` và `ShiftConfigService` thực thi toàn bộ nghiệp vụ: Tạo ca tự động tính thời lượng ca vắt đêm, chặn trùng `ShiftCode` trong chi nhánh, lấy danh sách theo chi nhánh, cập nhật ca, bật/tắt `IsActive`, xóa mềm (REQ-SHF-01, REQ-SHF-02, REQ-SHF-03, REQ-SHF-04)

## 3. Backend API
- [x] **T5** — Xây dựng `ShiftConfigsController.cs` tại `MT_GRMS.Api/Controllers` phơi bày 6 endpoints RESTful với phân quyền `Authorize` (REQ-SHF-01, REQ-SHF-02, REQ-SHF-03, REQ-SHF-04)

## 4. Frontend Integration
- [x] **T6** — Khai báo TypeScript types và API client service gọi backend cho ShiftConfig tại `MT_GRMS_FRONTEND` (REQ-SHF-01, REQ-SHF-02)
- [x] **T7** — Xây dựng component `ShiftConfigTable` và modal `ShiftConfigModal` tích hợp vào phân hệ quản lý ca làm việc (REQ-SHF-01, REQ-SHF-03, REQ-SHF-04)

## 5. Testing & Verification
- [x] **T8** — Viết Unit Tests toàn diện cho `ShiftConfigServiceTests.cs` trong `MT_GRMS.UnitTests` bao phủ 100% các Scenario trong `specs.md` (Tạo ca chuẩn, ca qua đêm, chặn trùng mã, cập nhật, xóa mềm) (REQ-SHF-01, REQ-SHF-02, REQ-SHF-03, REQ-SHF-04)
- [x] **T9** — Chạy kiểm thử toàn bộ solution `dotnet test` bảo đảm 0 lỗi regression (REQ-SHF-01, REQ-SHF-02, REQ-SHF-03, REQ-SHF-04)
