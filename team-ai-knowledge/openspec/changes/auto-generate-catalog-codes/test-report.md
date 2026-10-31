---
verdict: PASS
date: 2026-10-31
total_tests: 101
passed: 101
failed: 0
---

# Test Report: auto-generate-catalog-codes

## Mục tiêu kiểm chứng
1. Sinh mã tự động danh mục: `CAT000001`, `CAT000002`... khi bỏ trống hoặc whitespace.
2. Sinh mã tự động sản phẩm: `SP000001`, `SP000002`... khi bỏ trống hoặc whitespace.
3. Không ghi đè khi client tự truyền mã hợp lệ (`CAT000099`, `SP000099`).
4. Barcode để `null` nếu người dùng không quét hoặc không nhập mã vạch.
5. EF Core migration cho Barcode nullable thành công.
6. JSON Deserialization cho `ProductCreateRequest` hoạt động trơn tru (đã thêm `[method: JsonConstructor]` để giải quyết xung đột multiple constructors).

## Kết quả kiểm thử
- `MT_GRMS.UnitTests`: 95 passed, 0 failed
  - `CategoryServiceTests.CreateCategoryAsync_EmptyCode_AutoGeneratesSequentialCode`: PASS (`CAT000001`)
  - `CategoryServiceTests.CreateCategoryAsync_ExistingCode_IncrementsSequence`: PASS (`CAT000002`)
  - `CategoryServiceTests.CreateCategoryAsync_CustomCode_PreservesCode`: PASS
  - `CatalogServiceTests.CreateProductAsync_ValidRequest_AutoGeneratesSkuAndBarcode`: PASS (`SP000001`, `Barcode = null`)
  - `CatalogServiceTests.CreateProductAsync_EmptyProductCode_AutoGeneratesSequentialCode`: PASS (`SP000001`, `Barcode = null`)
  - `CatalogServiceTests.CreateProductAsync_ExistingProductCode_IncrementsSequence`: PASS (`SP000002`)
  - `CatalogServiceTests.CreateProductAsync_WhenBarcodeProvided_StoresBarcodeAndChecksUnique`: PASS
  - `CatalogServiceTests.ProductCreateRequest_CanBeDeserializedFromJson`: PASS (Đã kiểm chứng payload JSON từ request của client)
- `MT_GRMS.IntegrationTests`: 6 passed, 0 failed

## Kết luận
Tất cả các tiêu chí và bài test đều PASS 100%. Sẵn sàng archive.
