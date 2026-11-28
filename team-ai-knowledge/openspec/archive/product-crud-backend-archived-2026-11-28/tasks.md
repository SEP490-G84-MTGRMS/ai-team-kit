# Tasks: product-crud-backend

## Application Layer (DTOs & Contracts)
- [x] T1 — Cập nhật DTOs trong `src/MT_GRMS.Application/Catalog/Dtos/ProductDtos.cs` (`ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`, `ProductQueryFilter`). (REQ-PROD-01, REQ-PROD-02, REQ-PROD-03, REQ-PROD-04)
- [x] T2 — Mở rộng Interface `IProductRepository.cs` trong `src/MT_GRMS.Application/Catalog/` (`GetPagedListAsync`, `ExistsByCodeAsync`, `ExistsByBarcodeAsync`, `GetByIdWithCategoryAsync`). (REQ-PROD-01, REQ-PROD-02, REQ-PROD-03)
- [x] T3 — Cập nhật Interface `ICatalogService.cs` trong `src/MT_GRMS.Application/Catalog/` với 5 phương thức CRUD chỉ nhận/trả DTO (`GetProductsPagedAsync`, `GetByIdAsync`, `CreateProductAsync`, `UpdateProductAsync`, `DeleteProductAsync`). (REQ-PROD-01 đến REQ-PROD-05)

## Infrastructure Layer (Data Access & Query)
- [x] T4 — Triển khai `ProductRepository.cs` trong `src/MT_GRMS.Infrastructure/Repositories/`:
  - Xây dựng câu truy vấn phân trang `IQueryable` kết hợp lọc theo `searchTerm` (tên, barcode, SKU), lọc theo `categoryId`.
  - Include thông tin `Category` để lấy `CategoryName`.
  - Kiểm tra tính duy nhất của Barcode và ProductCode theo Tenant. (REQ-PROD-01, REQ-PROD-02, REQ-PROD-03)

## Service & API Layer (Business Logic & Presentation)
- [x] T5 — Triển khai `CatalogService.cs` trong `src/MT_GRMS.Application/Catalog/`:
  - Tự động sinh `ProductCode` dạng `SP-XXXXXX` (in hoa) nếu để trống.
  - Kiểm tra tính duy nhất của Barcode/SKU.
  - Kiểm tra tồn tại của CategoryId trong Tenant.
  - Áp dụng quy tắc bảo mật BR-SEC-01: che giấu giá vốn (`CostPrice = null`) khi người gọi là Cashier/Staff.
  - Xóa mềm sản phẩm an toàn (`IsDeleted = true`). (REQ-PROD-01 đến REQ-PROD-06)
- [x] T6 — Cập nhật `ProductsController.cs` trong `src/MT_GRMS.Api/Controllers/` với 5 endpoints RESTful (`GET /api/products`, `GET /api/products/{id}`, `POST /api/products`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`), bọc toàn bộ phản hồi trong `ApiResponse<T>`. (REQ-PROD-01 đến REQ-PROD-06)

## Test & Verification
- [x] T7 — Viết Unit Tests cho `CatalogService` trong `tests/MT_GRMS.UnitTests/CatalogServiceTests.cs` kiểm chứng: phân trang & tìm kiếm, tự sinh SKU, chặn trùng mã vạch, che giấu giá vốn BR-SEC-01 cho Cashier, xóa mềm. (REQ-PROD-01 đến REQ-PROD-06)
- [x] T8 — Chạy kiểm thử tự động `dotnet test` đảm bảo 100% tests pass (57/57 passed). (REQ-PROD-01 đến REQ-PROD-06)

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: product-unit-crud -->
# Tasks: product-unit-crud

## Backend
- [x] T1 — Tạo các DTOs `ProductUnitResponse`, `ProductUnitCreateRequest`, `ProductUnitUpdateRequest` trong `MT_GRMS.Application/Catalog/Dtos` (REQ-UNIT-01, REQ-UNIT-02, REQ-UNIT-03)
- [x] T2 — Tạo interface `IProductUnitRepository` trong `MT_GRMS.Application` và cài đặt `ProductUnitRepository` trong `MT_GRMS.Infrastructure/Repositories` (REQ-UNIT-01, REQ-UNIT-02)
- [x] T3 — Khai báo interface `IProductUnitService` và cài đặt service `ProductUnitService` trong `MT_GRMS.Application/Catalog` với đầy đủ logic kiểm tra nghiệp vụ và xử lý đơn vị cơ bản (REQ-UNIT-01, REQ-UNIT-02, REQ-UNIT-03, REQ-UNIT-04)
- [x] T4 — Đăng ký Dependency Injection cho `IProductUnitRepository` và `IProductUnitService` (REQ-UNIT-01)
- [x] T5 — Xây dựng controller `ProductUnitsController` trong `MT_GRMS.Api/Controllers` tiếp nhận 5 endpoints CRUD (REQ-UNIT-01, REQ-UNIT-02, REQ-UNIT-03, REQ-UNIT-04)

## Test
- [x] T6 — Viết unit tests kiểm thử 100% các trường hợp thành công và ngoại lệ của ProductUnitService trong `MT_GRMS.UnitTests` (REQ-UNIT-01, REQ-UNIT-02, REQ-UNIT-03, REQ-UNIT-04)


<!-- Tasks sáp nhập từ: auto-generate-catalog-codes -->
# Tasks: Tự động sinh mã tuần tự cho Category & Product

## Database & Domain
- [x] T1 — Cập nhật `Product.cs`, `ProductDtos.cs` (`ProductResponse`), `ProductConfiguration.cs` cho phép `Barcode` nullable và tạo EF Core migration `MakeProductBarcodeNullable` (REQ-PROD-01)

## Repositories
- [x] T2 — Bổ sung `GetMaxSequentialCodeAsync` vào `ICategoryRepository` và triển khai tại `CategoryRepository` (REQ-CAT-01)
- [x] T3 — Bổ sung `GetMaxSequentialCodeAsync` vào `IProductRepository` và triển khai tại `ProductRepository`, đồng thời cập nhật `ExistsByBarcodeAsync` bỏ qua barcode rỗng/null (REQ-PROD-01)

## Application Services
- [x] T4 — Nâng cấp `CategoryService.CreateAsync` tự động sinh mã tuần tự dạng `CAT000001`, `CAT000002`... khi để trống mã (REQ-CAT-01)
- [x] T5 — Nâng cấp `CatalogService.CreateProductAsync` tự động sinh mã tuần tự dạng `SP000001`, `SP000002`... khi để trống mã và lưu `Barcode = null` nếu không nhập (REQ-PROD-01)

## Testing & Verification
- [x] T6 — Viết Unit Tests trong `MT_GRMS.UnitTests` cho CategoryService và CatalogService bao phủ sinh mã tự động và Barcode null, chạy toàn bộ test suites xác minh 100% passed (REQ-CAT-01, REQ-PROD-01)
