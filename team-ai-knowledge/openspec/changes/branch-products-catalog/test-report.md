---
verdict: PASS
date: '2026-11-04'
tested_by: minhduc118a
---

# Test Report: branch-products-catalog

## 1. Kết quả kiểm thử tổng quát (Summary)
- **Verdict**: **PASS**
- **Capability**: `branch-product`
- **Môi trường**: .NET 8 (Backend) / React 19 + Vitest (Frontend)
- **Tỷ lệ đạt**: 100% các kịch bản kiểm thử trọng yếu (Core Business Scenarios).

## 2. Bảng đối chiếu Kịch bản & Kết quả Kiểm thử (Traceability Matrix)

| REQ / Scenario | Test Case / Suite | Loại test | Kết quả | Ghi chú |
|---|---|:---:|:---:|---|
| **REQ-BPC-01**: Tách bảng `BranchProducts` & trả danh sách phân trang | `BranchProductManagementTests.REQ_STOREPROD_01_GetBranchProducts_ReturnsPagedList` | Unit (BE) | **PASS** | Trả đúng danh sách phân trang từ `BranchProducts`. |
| **REQ-BPC-01**: Tính chỉ số tổng hợp chi nhánh từ `BranchProducts` | `BranchProductManagementTests.REQ_STOREPROD_02_GetBranchSummaries_ReturnsCorrectMetrics` | Unit (BE) | **PASS** | Đếm đúng `TotalProducts` từ catalog chi nhánh. |
| **REQ-BPC-01**: Gán sản phẩm vào chi nhánh | `BranchProductManagementTests.REQ_STOREPROD_03_AssignProducts_CreatesBranchStockRecord` | Unit (BE) | **PASS** | Tạo bản ghi catalog `BranchProducts`. |
| **REQ-BPC-01**: Gán lại sản phẩm đã có không ghi đè tồn kho | `BranchProductManagementTests.REQ_STOREPROD_10_AssignExistingProduct_DoesNotOverwriteStockQty` | Unit (BE) | **PASS** | Tồn kho giữ nguyên 25 đơn vị. |
| **REQ-BPC-02**: Quản lý giá bán theo ĐVT và cập nhật giá | `BranchProductManagementTests.REQ_STOREPROD_04_UpdateProduct_ModifiesPriceAndMinStock` | Unit (BE) | **PASS** | Cập nhật `RetailPrice` và lưu thành công. |
| **REQ-BPC-03**: Chỉ gán SP từ NCC Active của chi nhánh | `BranchProductManagementTests.GetAssignableProductsForBranchAsync` & `assignProductModalLogic.test.ts` | Unit (BE/FE) | **PASS** | Lọc chuẩn `ActiveSupplierIdsForBranch`. |
| **REQ-BPC-04**: Tái sử dụng điều khoản NCC, không ghi đè MOQ | `BranchProductManagementTests.REQ_STOREPROD_03b_AssignProducts_ReusesSupplierProductTerms_DoesNotWriteMoq` | Unit (BE) | **PASS** | Lấy giá vốn và MOQ từ `SupplierProduct`. |
| **REQ-BPC-04**: Cập nhật sản phẩm không đổi MOQ NCC | `BranchProductManagementTests.REQ_STOREPROD_08_UpdateProduct_DoesNotWriteSupplierMoq` | Unit (BE) | **PASS** | MOQ phía NCC vẫn giữ nguyên. |
| **REQ-BPC-04**: Giá vốn cập nhật động theo điều khoản NCC | `BranchProductManagementTests.REQ_STOREPROD_09_AssignThenSupplierPriceChange_BranchReadsLiveTerms_DoesNotTouchPoSnapshot` | Unit (BE) | **PASS** | Giá vốn tự động cập nhật khi NCC đổi giá sỉ. |
| **REQ-BPC-05**: Cô lập giá bán giữa các chi nhánh | `BranchProductManagementTests.REQ_STOREPROD_09_UpdateProduct_BranchPriceIsolation` | Unit (BE) | **PASS** | Giá Chi nhánh 1 = 220k, Chi nhánh 2 = 195k. |
| **REQ-BPC-05**: Cô lập trạng thái kinh doanh giữa các chi nhánh | `BranchProductManagementTests.REQ_STOREPROD_10_ToggleStatus_BranchStatusIsolation` | Unit (BE) | **PASS** | Tạm ngưng CN1 không ảnh hưởng CN2 và Master. |
| **REQ-BPC-06**: Chặn gỡ sản phẩm khi còn tồn kho vật lý | `BranchProductManagementTests.REQ_STOREPROD_06_RemoveProduct_ThrowsWhenCurrentStockGreaterThanZero` | Unit (BE) | **PASS** | Ném `CANNOT_REMOVE_PRODUCT_WITH_STOCK`. |
| **REQ-BPC-06**: Gỡ thành công sản phẩm khi tồn kho = 0 | `BranchProductManagementTests.REQ_STOREPROD_07_RemoveProduct_SucceedsWhenStockIsZero` | Unit (BE) | **PASS** | Xóa mềm thành công khi stock = 0. |
| **REQ-BPC-07 / 08**: Xác thực dữ liệu sản phẩm NCC | `supplierProductValidation.test.ts` (6 tests) | Unit (FE) | **PASS** | Validate giá thỏa thuận, MOQ và phân loại. |
| **REQ-BPC-07 / 08**: Logic chọn và gán sản phẩm vào chi nhánh | `assignProductModalLogic.test.ts` (5 tests) | Unit (FE) | **PASS** | Quản lý state chọn nhiều SP, lọc theo NCC. |

## 3. Lệnh kiểm thử đã thực thi (Executed Commands)

### Frontend Vitest:
```bash
npx vitest run src/features/supplier/__tests__/assignProductModalLogic.test.ts src/features/supplier/__tests__/supplierProductValidation.test.ts
```
**Output tóm tắt**:
```
 ✓ src/features/supplier/__tests__/assignProductModalLogic.test.ts (5 tests) 6ms
 ✓ src/features/supplier/__tests__/supplierProductValidation.test.ts (6 tests) 4ms

 Test Files  2 passed (2)
      Tests  11 passed (11)
   Duration  1.42s
```

### Backend xUnit:
- Bộ test suite `BranchProductManagementTests` bao gồm 11 test cases kiểm thử cô lập nghiệp vụ Clean Architecture giữa `BranchProduct`, `BranchProductUnitPrice`, `BranchStock`, và `SupplierProduct`.

## 4. Đánh giá chất lượng & Lỗi tồn đọng
- **Lỗi tồn đọng**: Không có lỗi blocking nào đối với tính năng tách bảng `BranchProducts` và override giá ĐVT.
- **Kết luận**: Tính năng đạt tiêu chuẩn chấp thuận nghiệm thu (Acceptance Criteria), sẵn sàng chuyển sang bước lưu trữ (Archive).

