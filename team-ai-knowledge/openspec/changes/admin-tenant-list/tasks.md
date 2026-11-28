# Tasks: Màn hình Danh sách & Quản lý Gian hàng Thuê (Tenant Management) (`admin-tenant-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Tenant`, `SubscriptionPlan`, `Branch`, `User` đảm bảo lọc `TenantId` (`REQ-ADMI-TENA-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `admin-tenant-list` (`REQ-ADMI-TENA-LIST-02`, `REQ-ADMI-TENA-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AdminTenantsController.cs` kèm kiểm soát phân quyền RBAC (MasterAdmin) (`REQ-ADMI-TENA-LIST-01`, `REQ-ADMI-TENA-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/admin/TenantManagementPage.tsx` tại route `/admin/tenants` và kết nối API thời gian thực (`REQ-ADMI-TENA-LIST-01` → `REQ-ADMI-TENA-LIST-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-02` (`REQ-ADMI-TENA-LIST-01` → `REQ-ADMI-TENA-LIST-04`).
