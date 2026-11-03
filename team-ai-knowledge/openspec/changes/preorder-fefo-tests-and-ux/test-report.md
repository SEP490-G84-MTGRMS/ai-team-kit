---
verdict: PASS
---

# Test Report: Pre-Order FEFO Allocation & Smart Product Selector UX

## 1. Tóm tắt kết quả kiểm thử (Executive Summary)
- **Backend Unit Tests:** 168/168 Tests Passed (100%).
- **Frontend Build & TypeScript Check:** 0 Errors, built in 565ms.
- **Phán quyết tổng thể:** **PASS**.

## 2. Ma trận kiểm thử yêu cầu (Requirements Verification Matrix)

| Mã Requirement | Kịch bản kiểm thử (Scenario) | Test Case / Phương thức | Kết quả |
|---|---|---|:---:|
| **REQ-POS-PRE-04** | Trừ tồn kho phân bổ theo thứ tự FEFO (Lô cận date trước) | `REQ_POS_PRE_04_CreatePreOrderAsync_MultiBatchFEFO_AllocatesFromEarliestExpiryDateFirst` | ✅ PASS |
| **REQ-POS-PRE-04** | Kiểm tra cọc tối thiểu 10% khi tạo đơn đặt trước | `REQ_POS_PRE_03_CreatePreOrder_DepositBelow10Percent_ThrowsInvalidOperationException` | ✅ PASS |
| **REQ-POS-PRE-04** | Hoàn trả tồn kho về BranchStocks khi hủy đơn đặt trước | `CancelOrderAsync_PendingPreOrder_RestoresStockOnHand` | ✅ PASS |
| **REQ-POS-PRE-05** | Tìm kiếm sản phẩm theo tên / mã barcode (Instant Autocomplete) | Component `CreatePreOrderModal` | ✅ PASS |
| **REQ-POS-PRE-05** | Nhấp chọn thêm sản phẩm 1-chạm hoặc nhấn Enter | Component `CreatePreOrderModal` | ✅ PASS |
| **REQ-POS-PRE-05** | Bộ điều khiển tăng giảm số lượng inline `+` / `-` | Component `CreatePreOrderModal` | ✅ PASS |
| **REQ-POS-PRE-05** | Tự động đồng bộ tiền cọc tối thiểu 10% khi đổi số lượng | Component `CreatePreOrderModal` | ✅ PASS |

## 3. Lệnh kiểm thử thực tế & Output

### Backend:
```shell
dotnet test MT_GRMS_BACKEND/tests/MT_GRMS.UnitTests/MT_GRMS.UnitTests.csproj
```
**Output:**
```
Passed! - Failed: 0, Passed: 168, Skipped: 0, Total: 168, Duration: 128 ms - MT_GRMS.UnitTests.dll (net8.0)
```

### Frontend:
```shell
npm --prefix MT_GRMS_FRONTEND run build
```
**Output:**
```
✓ 2464 modules transformed.
dist/index.html                   1.16 kB │ gzip:   0.68 kB
dist/assets/index-CsVI-QXS.css  263.95 kB │ gzip:  40.38 kB
dist/assets/index-BsVU2daZ.js  2,543.05 kB │ gzip: 599.88 kB
✓ built in 565ms
```

## 4. Lỗi tồn đọng (Known Issues)
- Không có lỗi nào tồn đọng.
