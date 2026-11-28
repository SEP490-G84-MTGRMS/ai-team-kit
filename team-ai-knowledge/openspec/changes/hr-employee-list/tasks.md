# Tasks: Màn hình Danh sách Hồ sơ Nhân viên, Cấp Tài khoản Đăng nhập & Phân quyền RBAC (`hr-employee-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Employee`, `EmployeeAllowance`, `User`, `TenantUser` đảm bảo lọc `TenantId` (`REQ-HR-EMPL-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `hr-employee-list` (`REQ-HR-EMPL-LIST-02`, `REQ-HR-EMPL-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `EmployeesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-HR-EMPL-LIST-01`, `REQ-HR-EMPL-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/employee/pages/EmployeeListPage.tsx` tại route `/store-owner/employees` và kết nối API thời gian thực (`REQ-HR-EMPL-LIST-01` → `REQ-HR-EMPL-LIST-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-18-01` (`REQ-HR-EMPL-LIST-01` → `REQ-HR-EMPL-LIST-04`).
