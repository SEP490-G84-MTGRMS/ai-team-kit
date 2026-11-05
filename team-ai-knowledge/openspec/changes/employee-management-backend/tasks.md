# Tasks: employee-management-backend

## DB
- [ ] T1 — Bổ sung các cột kiểm soát duyệt ca (`IsAudited`, `AuditedBy`, `AuditedAtUtc`, `DenominationDetailsJson`) vào entity `ShiftZReport` và tạo EF Core Migration (REQ-04)
- [x] T2 — Cấu hình Fluent API trong `AppDbContext` cho các thực thể HR (`Employee`, `EmployeeSchedule`, `Payslip`, `EmployeeAllowance`) với các chỉ mục Index chống trùng lặp theo Tenant (REQ-01, REQ-02, REQ-05)

## Backend
### Cụm 1: Quản lý Hồ sơ Nhân viên & Cấp tài khoản
- [x] T3 — Xây dựng các DTOs, Request/Response và FluentValidation cho phân hệ Nhân viên trong `MT_GRMS.Application/HR/Employees/Dtos` (hỗ trợ `Guid? Id` trong `EmployeeAllowanceDto`) (REQ-01)
- [x] T4 — Triển khai `IEmployeeService` và `EmployeeService` với logic sinh mã nhân viên tuần tự chuẩn `NVxxxx` theo Tenant, kiểm tra trùng lặp SĐT/CCCD và thuật toán `SyncAllowances` an toàn chống lỗi Concurrency / Severed relationship (REQ-01)
- [x] T5 — Xây dựng tính năng cấp tài khoản đăng nhập Identity (`Users`) cho nhân viên với mã hóa BCrypt và phân quyền vai trò (REQ-01)
- [x] T6 — Xây dựng `EmployeesController` với đầy đủ các RESTful API endpoints phân trang, tìm kiếm, CRUD và cấp tài khoản (REQ-01)

### Cụm 2: Lập lịch & Ban hành Ca làm việc
- [ ] T7 — Xây dựng các DTOs và FluentValidation cho Lịch làm việc trong `MT_GRMS.Application/HR/Schedules/Dtos` (REQ-02)
- [ ] T8 — Triển khai `IScheduleService` và `ScheduleService` với thuật toán kiểm tra chống xung đột khung giờ ca trong ngày và cơ chế ban hành ca tuần (`publish`) (REQ-02)
- [ ] T9 — Xây dựng `SchedulesController` với các endpoints: tra cứu lịch theo dải ngày, lịch cá nhân `my-schedule`, phân ca batch và ban hành ca (REQ-02)

### Cụm 3: Chấm công số & Bảng công
- [ ] T10 — Xây dựng các DTOs cho Chấm công và hàm tính khoảng cách GPS Geofencing theo công thức toán học Haversine trong `MT_GRMS.Application/HR/Attendance` (REQ-03)
- [ ] T11 — Triển khai `IAttendanceService` và `AttendanceService` tự động ghi nhận Check-in/Check-out, tính số phút đi muộn (`LateMinutes`), về sớm (`EarlyMinutes`) và tổng giờ công thực tế (REQ-03)
- [ ] T12 — Xây dựng `AttendanceController` với các endpoints chấm công, gửi yêu cầu giải trình và duyệt điều chỉnh giờ công (REQ-03)

### Cụm 4: Đóng ca POS, Đối soát 9 Mệnh giá & Tự động sinh Phiếu thu Sổ quỹ
- [ ] T13 — Xây dựng các DTOs cho Phiên ca thu ngân trong `MT_GRMS.Application/HR/CashierShifts/Dtos` hỗ trợ kiểm đếm 9 mệnh giá tiền mặt (REQ-04)
- [ ] T14 — Triển khai `ICashierShiftService` và `CashierShiftService` quản lý mở ca kế thừa tiền float, kiểm đếm 9 mệnh giá, đối soát độ lệch tiền két và bắt buộc giải trình theo `GBR-POS-04` (REQ-04)
- [ ] T15 — Triển khai logic Chủ duyệt ca (`AuditApproveShiftAsync`) và tích hợp tự động gọi `ICashbookService.ReceiveCashAsync()` tạo Phiếu thu loại `INCOME` vào Sổ quỹ (REQ-04)
- [ ] T16 — Xây dựng `CashierShiftsController` với các endpoints: mở ca, tóm tắt ca, đóng ca kèm kiểm đếm 9 mệnh giá, danh sách chờ duyệt và duyệt ca (REQ-04)

### Cụm 5: Bảng lương Tự động & Chi trả Sổ quỹ
- [ ] T17 — Xây dựng các DTOs cho Bảng lương trong `MT_GRMS.Application/HR/Payroll/Dtos` (REQ-05)
- [ ] T18 — Triển khai `IPayrollService` và `PayrollService` với Payroll Engine tự động quét và tổng hợp ngày công/giờ công tháng từ `EmployeeSchedules`, tính NetSalary theo công thức (REQ-05)
- [ ] T19 — Triển khai logic phê duyệt chi trả lương qua Tiền mặt / VietQR và tích hợp tự động gọi `ICashbookService.DisburseCashAsync()` tạo Phiếu chi loại `EXPENSE` vào Sổ quỹ (REQ-05)
- [ ] T20 — Xây dựng `PayrollController` với các endpoints: khởi tạo bảng lương tháng, tra cứu danh sách phiếu lương, xem chi tiết và chi trả lương (REQ-05)

## Test
- [x] T21 — Viết Unit Tests cho `EmployeeService` kiểm chứng sinh mã `NVxxxx`, kiểm tra trùng CCCD/SĐT, cấp tài khoản và cơ chế đồng bộ phụ cấp đa chiều (Add/Edit/Delete) (REQ-01)
- [ ] T22 — Viết Unit Tests cho `ScheduleService` kiểm chứng phân ca batch, chặn xung đột thời gian và ban hành lịch (REQ-02)
- [ ] T23 — Viết Unit Tests cho `AttendanceService` kiểm chứng tính khoảng cách GPS Geofencing, số phút trễ và giờ công thực tế (REQ-03)
- [ ] T24 — Viết Unit Tests cho `CashierShiftService` kiểm chứng kiểm đếm 9 mệnh giá, quy tắc `GBR-POS-04` và tự động sinh Phiếu thu Sổ quỹ (REQ-04)
- [ ] T25 — Viết Unit Tests cho `PayrollService` kiểm chứng tính NetSalary, chặn đúp kỳ lương và tự động sinh Phiếu chi Sổ quỹ (REQ-05)
