# Tasks: Màn hình Quản lý Danh mục Hàng hóa Master, Đa Đơn vị tính & Bảng giá (`product-catalog-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Product`, `ProductUnit`, `ProductPriceHistory`, `Category` đảm bảo lọc `TenantId` (`REQ-PROD-CATA-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `product-catalog-list` (`REQ-PROD-CATA-LIST-02`, `REQ-PROD-CATA-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `ProductsController.cs`, `ProductUnitsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-PROD-CATA-LIST-01`, `REQ-PROD-CATA-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/product/pages/ProductListPage.tsx` tại route `/store-owner/products` và kết nối API thời gian thực (`REQ-PROD-CATA-LIST-01` → `REQ-PROD-CATA-LIST-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-01-01` (`REQ-PROD-CATA-LIST-01` → `REQ-PROD-CATA-LIST-04`).
