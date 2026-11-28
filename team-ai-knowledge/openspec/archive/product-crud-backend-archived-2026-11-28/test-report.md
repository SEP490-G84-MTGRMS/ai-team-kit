---
verdict: PASS
tested_at: 2026-10-29
---
# Test Report: product-crud-backend

## Kết quả kiểm thử theo Scenarios trong specs.md

| REQ | Scenario | Test Case tương ứng | Kết quả |
| :--- | :--- | :--- | :--- |
| **REQ-PROD-01** | Tìm kiếm sản phẩm theo tên và phân trang thành công | `GetProductsPagedAsync_SearchFilter_ReturnsCorrectResult` | ✅ PASS |
| **REQ-PROD-01** | Lọc sản phẩm theo danh mục (`categoryId`) | `GetProductsPagedAsync_SearchFilter_ReturnsCorrectResult` | ✅ PASS |
| **REQ-PROD-02** | Tìm thấy sản phẩm theo ID | `GetByIdAsync_ExistingProduct_ReturnsProductResponse` | ✅ PASS |
| **REQ-PROD-02** | Không tìm thấy sản phẩm hoặc sản phẩm bị xóa mềm | `GetByIdAsync_NonExistingProduct_ReturnsNull` | ✅ PASS |
| **REQ-PROD-03** | Tạo sản phẩm mới thành công với mã tự sinh dạng `SP-XXXXXX` | `CreateProductAsync_ValidRequest_AutoGeneratesSkuAndBarcode` | ✅ PASS |
| **REQ-PROD-03** | Lỗi khi Barcode bị trùng lặp trong cùng Tenant | `CreateProductAsync_DuplicateBarcode_ThrowsBusinessException` | ✅ PASS |
| **REQ-PROD-04** | Cập nhật thành công thông tin sản phẩm | `UpdateProductAsync_ValidRequest_UpdatesSuccessfully` | ✅ PASS |
| **REQ-PROD-05** | Xóa mềm sản phẩm (`IsDeleted = true`) | `DeleteProductAsync_ExistingProduct_SoftDeletes` | ✅ PASS |
| **REQ-PROD-06** | Thu ngân (Cashier) xem sản phẩm bị ẩn giá vốn (`CostPrice = null`) | `BR_SEC_01_CashierRole_ConcealsCostPrice` | ✅ PASS |
| **REQ-PROD-06** | Chủ cửa hàng (StoreOwner) xem sản phẩm thấy đủ giá vốn | `BR_SEC_01_StoreOwnerRole_RevealsCostPrice` | ✅ PASS |

---

## Lệnh kiểm thử đã chạy

```powershell
dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\MT_GRMS.UnitTests.csproj
```

**Output thực tế từ xUnit Test Runner:**
```text
Test run for D:\FPT_uni\Sesmester_9_Fall_26\File\MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\bin\Debug\net8.0\MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed: 0, Passed: 57, Skipped: 0, Total: 57, Duration: 130 ms - MT_GRMS.UnitTests.dll (net8.0)
```

---

## Đối chiếu Specs ↔ Code thực tế

1. **Phân trang & Tìm kiếm đa tiêu chí (REQ-PROD-01)**:
   - `ProductRepository.GetPagedListAsync` sử dụng dynamic `IQueryable` tìm kiếm không phân biệt hoa thường trong cả `Name`, `ProductCode`, và `Barcode`.
   - Kết quả trả về `PagedResult<ProductResponse>` với `TotalItems` chính xác và chỉ load đúng số bản ghi theo `PageSize`.

2. **Quy tắc sinh mã & Kiểm tra duy nhất (REQ-PROD-03, REQ-PROD-04)**:
   - `CatalogService.CreateProductAsync` tự động sinh mã dạng `SP-XXXXXX` (in hoa) khi người dùng không nhập mã SKU, đồng thời dùng mã đó làm Barcode nếu Barcode để trống.
   - Cơ chế kiểm tra trùng `ExistsByBarcodeAsync` và `ExistsByCodeAsync` bảo vệ tính toàn vẹn dữ liệu trước khi lưu vào PostgreSQL.

3. **Bảo mật giá vốn RBAC (REQ-PROD-06 / BR-SEC-01)**:
   - Cơ chế kiểm tra vai trò người dùng trong `ITenantContext`: nếu không thuộc các role quản lý (`SUPER_ADMIN`, `STORE_OWNER`, `BRANCH_MANAGER`, `StoreOwner`, `Manager`), trường `CostPrice` được gán về `null` tuyệt đối, ngăn chặn triệt để nguy cơ rò rỉ lợi nhuận kinh doanh tới nhân viên thu ngân.

4. **Xóa mềm an toàn (REQ-PROD-05)**:
   - `CatalogService.DeleteProductAsync` chỉ đánh dấu `IsDeleted = true` và cập nhật `UpdatedAt = UTC Now`. Global Query Filter đảm bảo các câu query sau đó không hiển thị lại sản phẩm đã bị xóa.

---

## Lỗi còn tồn đọng
- Không có lỗi nào tồn đọng. 100% test cases đã PASS.
