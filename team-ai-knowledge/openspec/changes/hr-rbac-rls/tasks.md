# Tasks: hr-rbac-rls

## Backend
- [ ] T1 — Thiết lập hằng số Role & RBAC Authorize cho 5 Controllers HR (`Employees`, `ShiftConfigs`, `Schedules`, `Payslips`, `BranchAttendancePolicies`) (REQ-01)
- [ ] T2 — Triển khai Row-Level Security (RLS) cho Hồ sơ Nhân viên (`EmployeesController.GetById` & `EmployeeService`) (REQ-02)
- [ ] T3 — Triển khai Row-Level Security (RLS) cho Phiếu lương & Danh sách lương (`PayslipsController.GetPayslipsPaged`, `GetPayslipById` & `PayslipService`) (REQ-03)
- [ ] T4 — Triển khai Row-Level Security (RLS) cho Ca làm việc (`SchedulesController.GetById`, `GetMySchedule` & `ScheduleService`) (REQ-04)

## Frontend
- [ ] T5 — Cập nhật Route Guard & Ẩn/Hiện Action Buttons/Modals cho phân hệ Nhân sự theo Role trong Auth Store (REQ-05)

## Test
- [ ] T6 — Viết Unit Tests kiểm chứng RBAC & RLS (kiểm thử 403 Forbidden cho Employee truy cập dữ liệu người khác) và xác minh toàn bộ test suite đạt PASS (REQ-01, REQ-02, REQ-03, REQ-04)
