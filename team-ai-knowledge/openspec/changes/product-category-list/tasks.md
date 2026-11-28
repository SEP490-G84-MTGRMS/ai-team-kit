# Tasks: Màn hình Quản lý Nhóm hàng & Phân loại Ngành hàng (`product-category-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Category`, `Product` đảm bảo lọc `TenantId` (`REQ-PROD-CATE-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `product-category-list` (`REQ-PROD-CATE-LIST-02`, `REQ-PROD-CATE-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `CategoriesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-PROD-CATE-LIST-01`, `REQ-PROD-CATE-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/product/pages/CategoryListPage.tsx` tại route `/store-owner/categories` và kết nối API thời gian thực (`REQ-PROD-CATE-LIST-01` → `REQ-PROD-CATE-LIST-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-01-02` (`REQ-PROD-CATE-LIST-01` → `REQ-PROD-CATE-LIST-04`).
