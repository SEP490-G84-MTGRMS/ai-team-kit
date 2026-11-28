# Tasks: Màn hình Xếp lịch Phân ca Nhân viên Định kỳ & Kiểm soát Xung đột Ca (`hr-work-schedule`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `EmployeeSchedule`, `ShiftConfig`, `Payslip`, `Employee` đảm bảo lọc `TenantId` (`REQ-HR-WORK-SCHE-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `hr-work-schedule` (`REQ-HR-WORK-SCHE-02`, `REQ-HR-WORK-SCHE-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `SchedulesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-HR-WORK-SCHE-01`, `REQ-HR-WORK-SCHE-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/employee/pages/WorkSchedulePage.tsx` tại route `/store-owner/employees/schedule` và kết nối API thời gian thực (`REQ-HR-WORK-SCHE-01` → `REQ-HR-WORK-SCHE-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-18-03` (`REQ-HR-WORK-SCHE-01` → `REQ-HR-WORK-SCHE-04`).
