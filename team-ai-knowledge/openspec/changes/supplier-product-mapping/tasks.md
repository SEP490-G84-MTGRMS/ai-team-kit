# Tasks: Màn hình Gán Sản phẩm Cung ứng theo Nhà cung cấp & Bảng giá Mua (`supplier-product-mapping`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `SupplierProduct`, `Supplier`, `Product` đảm bảo lọc `TenantId` (`REQ-SUPP-PROD-MAPP-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `supplier-product-mapping` (`REQ-SUPP-PROD-MAPP-02`, `REQ-SUPP-PROD-MAPP-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `SuppliersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-SUPP-PROD-MAPP-01`, `REQ-SUPP-PROD-MAPP-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/supplier/pages/SupplierProductManagementPage.tsx` tại route `/store-owner/suppliers/products` và kết nối API thời gian thực (`REQ-SUPP-PROD-MAPP-01` → `REQ-SUPP-PROD-MAPP-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-09-04` (`REQ-SUPP-PROD-MAPP-01` → `REQ-SUPP-PROD-MAPP-04`).
