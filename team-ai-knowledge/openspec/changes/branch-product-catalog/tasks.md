# Tasks: Màn hình Gán Sản phẩm vào Chi nhánh, Giá bán Riêng & Định mức Tồn (`branch-product-catalog`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `BranchProduct`, `BranchProductUnitPrice`, `Branch`, `Product` đảm bảo lọc `TenantId` (`REQ-BRAN-PROD-CATA-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `branch-product-catalog` (`REQ-BRAN-PROD-CATA-02`, `REQ-BRAN-PROD-CATA-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `BranchesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-BRAN-PROD-CATA-01`, `REQ-BRAN-PROD-CATA-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/product/pages/StoreProductManagementPage.tsx` tại route `/store-owner/stores/products` và kết nối API thời gian thực (`REQ-BRAN-PROD-CATA-01` → `REQ-BRAN-PROD-CATA-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-01-03` (`REQ-BRAN-PROD-CATA-01` → `REQ-BRAN-PROD-CATA-04`).
