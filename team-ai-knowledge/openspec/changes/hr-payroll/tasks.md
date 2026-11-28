# Tasks: Màn hình Quản lý Bảng lương, Tính lương Tự động, Ứng lương & Chi trả Phiếu lương (`hr-payroll`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Payslip`, `Employee`, `EmployeeSchedule`, `CashbookEntry` đảm bảo lọc `TenantId` (`REQ-HR-PAYR-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `hr-payroll` (`REQ-HR-PAYR-02`, `REQ-HR-PAYR-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `PayslipsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-HR-PAYR-01`, `REQ-HR-PAYR-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/employee/pages/PayslipManagementPage.tsx` tại route `/store-owner/employees/payroll` và kết nối API thời gian thực (`REQ-HR-PAYR-01` → `REQ-HR-PAYR-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-18-06` (`REQ-HR-PAYR-01` → `REQ-HR-PAYR-04`).
