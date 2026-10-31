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
