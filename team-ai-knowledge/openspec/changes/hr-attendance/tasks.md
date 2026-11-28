# Tasks: Màn hình Chấm công Check-in / Check-out bằng AI FaceID & Bảng công Thực tế (`hr-attendance`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `EmployeeSchedule`, `Employee` đảm bảo lọc `TenantId` (`REQ-HR-ATTE-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `hr-attendance` (`REQ-HR-ATTE-02`, `REQ-HR-ATTE-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `SchedulesController.cs`, `EmployeesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-HR-ATTE-01`, `REQ-HR-ATTE-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/employee/pages/AttendancePage.tsx` tại route `/store-owner/employees/attendance` và kết nối API thời gian thực (`REQ-HR-ATTE-01` → `REQ-HR-ATTE-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-18-04` (`REQ-HR-ATTE-01` → `REQ-HR-ATTE-04`).
