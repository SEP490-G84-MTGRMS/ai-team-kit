# Tasks: Màn hình Chi tiết Hồ sơ Gian hàng Thuê & Lịch sử Giao dịch SaaS (`admin-tenant-detail`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Tenant`, `Branch`, `WalletTransaction`, `AuditLog` đảm bảo lọc `TenantId` (`REQ-ADMI-TENA-DETA-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `admin-tenant-detail` (`REQ-ADMI-TENA-DETA-02`, `REQ-ADMI-TENA-DETA-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AdminTenantsController.cs`, `AdminTenantRecordsController.cs` kèm kiểm soát phân quyền RBAC (MasterAdmin) (`REQ-ADMI-TENA-DETA-01`, `REQ-ADMI-TENA-DETA-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/admin/TenantDetailPage.tsx`, `src/pages/admin/AdminBillingPage.tsx` tại route `/admin/tenants/:id` và kết nối API thời gian thực (`REQ-ADMI-TENA-DETA-01` → `REQ-ADMI-TENA-DETA-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-03` (`REQ-ADMI-TENA-DETA-01` → `REQ-ADMI-TENA-DETA-04`).
