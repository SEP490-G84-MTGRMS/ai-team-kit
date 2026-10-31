---
verdict: PASS
date: 2026-10-31
change: auto-generate-catalog-codes
assignee: "@minhtamhtyb"
---

# Báo cáo Kiểm thử: Tự động sinh mã tuần tự cho Category & Product

## 1. Tổng quan Kiểm thử
- **Mục tiêu**: Kiểm tra tính năng tự động sinh mã dạng `CAT000001`, `CAT000002`... cho Nhóm hàng và `SP000001`, `SP000002`... cho Sản phẩm khi bỏ trống mã, cùng tính năng lưu `Barcode = null` khi không nhập mã vạch.
- **Phạm vi**: Backend `MT_GRMS.Application`, `MT_GRMS.Infrastructure`, `MT_GRMS.Domain`, và các bộ test `MT_GRMS.UnitTests`, `MT_GRMS.IntegrationTests`.
- **Kết luận chung (Verdict)**: **PASS** (100% tests passed).

## 2. Kết quả Kiểm thử theo Requirement & Scenario

| Mã Requirement | Kịch bản (Scenario) | Test Case tương ứng | Kết quả |
|---|---|---|:---:|
| **REQ-CAT-01** | Tạo nhóm hàng đầu tiên khi chưa có nhóm hàng nào -> sinh `CAT000001` | `CategoryServiceTests.CreateAsync_WhenCodeIsEmpty_GeneratesFirstCode_CAT000001` | **PASS** |
| **REQ-CAT-01** | Tạo nhóm hàng tiếp theo tự động tăng tuần tự -> sinh `CAT000002` | `CategoryServiceTests.CreateAsync_WhenCodeIsEmptyAndPreviousExists_GeneratesNextSequentialCode_CAT000002` | **PASS** |
| **REQ-CAT-01** | Tạo nhóm hàng với mã tùy chỉnh của người dùng | `CategoryServiceTests.CreateAsync_WhenCodeProvided_UsesProvidedCode` | **PASS** |
| **REQ-CAT-01** | Phòng chống xung đột mã tuần tự đã tồn tại | `CategoryService.CreateAsync` while loop collision check | **PASS** |
| **REQ-PROD-01** | Tạo sản phẩm đầu tiên khi chưa có sản phẩm nào và không nhập Barcode -> `SP000001` & Barcode `null` | `CatalogServiceTests.CreateProductAsync_WhenProductCodeIsEmpty_GeneratesFirstCode_SP000001_AndNullBarcode` | **PASS** |
| **REQ-PROD-01** | Tạo sản phẩm tiếp theo tự động tăng tuần tự và không nhập Barcode -> `SP000002` & Barcode `null` | `CatalogServiceTests.CreateProductAsync_WhenProductCodeIsEmptyAndPreviousExists_GeneratesNextCode_SP000002` | **PASS** |
| **REQ-PROD-01** | Tạo sản phẩm bỏ trống mã nhưng có quét Barcode riêng | `CatalogServiceTests.CreateProductAsync_WhenBarcodeProvided_StoresBarcodeAndChecksUnique` | **PASS** |
| **REQ-PROD-01** | Cập nhật sản phẩm xóa trắng mã vạch -> chuyển thành `null` | `CatalogService.UpdateProductAsync` barcode null handling | **PASS** |
| **REQ-PROD-01** | Migration EF Core cho phép cột Barcode nullable | `20261031120202_MakeProductBarcodeNullable` | **PASS** |

## 3. Lệnh Test Đã Chạy & Output Thực Tế

### Lệnh thực thi:
```powershell
dotnet test MT_GRMS_BACKEND/MT_GRMS_BACKEND.sln
```

### Kết quả output:
```text
Test run for D:\FPT_uni\Sesmester_9_Fall_26\File\MT_GRMS_BACKEND\tests\MT_GRMS.IntegrationTests\bin\Debug\net8.0\MT_GRMS.IntegrationTests.dll (.NETCoreApp,Version=v8.0)
Passed!  - Failed:     0, Passed:     6, Skipped:     0, Total:     6, Duration: 1 s - MT_GRMS.IntegrationTests.dll (net8.0)

Test run for D:\FPT_uni\Sesmester_9_Fall_26\File\MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\bin\Debug\net8.0\MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
Passed!  - Failed:     0, Passed:    94, Skipped:     0, Total:    94, Duration: 198 ms - MT_GRMS.UnitTests.dll (net8.0)

Total Passed: 100/100 tests (100%)
```

## 4. Lỗi còn tồn đọng
- **Không có lỗi tồn đọng** (0 issues).
