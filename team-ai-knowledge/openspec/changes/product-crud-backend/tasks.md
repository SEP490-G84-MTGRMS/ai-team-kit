# Tasks: product-crud-backend

## Application Layer (DTOs & Contracts)
- [ ] T1 — Cập nhật DTOs trong `src/MT_GRMS.Application/Catalog/Dtos/ProductDtos.cs` (`ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`, `ProductQueryFilter`). (REQ-PROD-01, REQ-PROD-02, REQ-PROD-03, REQ-PROD-04)
- [ ] T2 — Mở rộng Interface `IProductRepository.cs` trong `src/MT_GRMS.Application/Catalog/` (`GetPagedListAsync`, `ExistsByCodeAsync`, `ExistsByBarcodeAsync`, `GetByIdWithCategoryAsync`). (REQ-PROD-01, REQ-PROD-02, REQ-PROD-03)
- [ ] T3 — Cập nhật Interface `ICatalogService.cs` trong `src/MT_GRMS.Application/Catalog/` với 5 phương thức CRUD chỉ nhận/trả DTO (`GetProductsPagedAsync`, `GetByIdAsync`, `CreateProductAsync`, `UpdateProductAsync`, `DeleteProductAsync`). (REQ-PROD-01 đến REQ-PROD-05)

## Infrastructure Layer (Data Access & Query)
- [ ] T4 — Triển khai `ProductRepository.cs` trong `src/MT_GRMS.Infrastructure/Repositories/`:
  - Xây dựng câu truy vấn phân trang `IQueryable` kết hợp lọc theo `searchTerm` (tên, barcode, SKU), lọc theo `categoryId`.
  - Include thông tin `Category` để lấy `CategoryName`.
  - Kiểm tra tính duy nhất của Barcode và ProductCode theo Tenant. (REQ-PROD-01, REQ-PROD-02, REQ-PROD-03)

## Service & API Layer (Business Logic & Presentation)
- [ ] T5 — Triển khai `CatalogService.cs` trong `src/MT_GRMS.Application/Catalog/`:
  - Tự động sinh `ProductCode` dạng `SP-XXXXXX` (in hoa) nếu để trống.
  - Kiểm tra tính duy nhất của Barcode/SKU.
  - Kiểm tra tồn tại của CategoryId trong Tenant.
  - Áp dụng quy tắc bảo mật BR-SEC-01: che giấu giá vốn (`CostPrice = null`) khi người gọi là Cashier/Staff.
  - Xóa mềm sản phẩm an toàn (`IsDeleted = true`). (REQ-PROD-01 đến REQ-PROD-06)
- [ ] T6 — Cập nhật `ProductsController.cs` trong `src/MT_GRMS.Api/Controllers/` với 5 endpoints RESTful (`GET /api/products`, `GET /api/products/{id}`, `POST /api/products`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`), bọc toàn bộ phản hồi trong `ApiResponse<T>`. (REQ-PROD-01 đến REQ-PROD-06)

## Test & Verification
- [ ] T7 — Viết Unit Tests cho `CatalogService` trong `tests/MT_GRMS.UnitTests/CatalogServiceTests.cs` kiểm chứng: phân trang & tìm kiếm, tự sinh SKU, chặn trùng mã vạch, che giấu giá vốn BR-SEC-01 cho Cashier, xóa mềm. (REQ-PROD-01 đến REQ-PROD-06)
- [ ] T8 — Chạy kiểm thử tự động `dotnet test` đảm bảo 100% tests pass. (REQ-PROD-01 đến REQ-PROD-06)
