# Tasks: Màn hình Danh mục Nhà cung cấp & Quản lý Hồ sơ Chung (`supplier-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Supplier`, `SupplierAPLedger` đảm bảo lọc `TenantId` (`REQ-SUPP-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `supplier-list` (`REQ-SUPP-LIST-02`, `REQ-SUPP-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `SuppliersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-SUPP-LIST-01`, `REQ-SUPP-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/supplier/pages/SupplierListPage.tsx` tại route `/store-owner/suppliers` và kết nối API thời gian thực (`REQ-SUPP-LIST-01` → `REQ-SUPP-LIST-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-09-01` (`REQ-SUPP-LIST-01` → `REQ-SUPP-LIST-04`).
