---
change: pos-branch-scoped-catalog-and-stock
capability: pos-sales-order
verdict: PASS
date: 2026-11-10
---

# Test Report: pos-branch-scoped-catalog-and-stock

## 1. Kết quả kiểm thử đặc tả (Scenarios Verification)

| STT | Requirement / Scenario | Test Case / Cơ chế kiểm chứng | Kết quả trước sửa | Kết quả sau sửa | Trạng thái |
|---|---|---|---|---|---|
| 1 | REQ-BRANCH-SCOPE-01: Chi nhánh chưa gán sản phẩm không hiện danh mục chung | `posOrderApi.getAllProducts(branchId)` & `PosCatalogGrid` Empty State | Lọt sang `GET /products` (hiện sản phẩm chung tenant) | Trả mảng `[]`, hiển thị *"Chi nhánh chưa được gán sản phẩm để bán"* | PASS |
| 2 | REQ-BRANCH-SCOPE-01: API danh mục chi nhánh lỗi thì báo lỗi, không dùng mock | `posOrderApi.getAllProducts` & `PosCheckoutPage` error catch | Nuốt lỗi bằng `.catch(() => null)`, fallback sang `getInitialProducts()` mock | Ném lỗi thật, hiện toast lỗi và danh mục rỗng `[]`, không dùng mock | PASS |
| 3 | REQ-BRANCH-SCOPE-01: Lọc "Tất cả chi nhánh" phải chọn chi nhánh trước khi đặt trước | `InvoiceManagementPage` + `CreatePreOrderModal` | Tự ngầm định lấy `dbBranches[0]?.id` mà không hỏi user | Chặn tạo đơn, cảnh báo bắt buộc chọn chi nhánh cụ thể từ bộ lọc | PASS |
| 4 | REQ-BRANCH-SCOPE-02: Sản phẩm có tồn nhưng chưa gán chi nhánh bị từ chối | `REQ_BRANCH_SCOPE_02_CreateOrder_ProductNotInBranch_ThrowsProductNotInBranchAndDoesNotDeductStock` | FAIL (Backend tạo đơn thành công, trừ tồn kho) | PASS (Ném `BusinessException: PRODUCT_NOT_IN_BRANCH`, tồn kho nguyên vẹn) | PASS |
| 5 | REQ-BRANCH-SCOPE-02: BranchProduct trạng thái Inactive bị từ chối | `REQ_BRANCH_SCOPE_02_CreateOrder_ProductInactiveInBranch_ThrowsProductNotInBranch` | FAIL (Tạo đơn thành công) | PASS (Ném `BusinessException: PRODUCT_NOT_IN_BRANCH`) | PASS |
| 6 | REQ-BRANCH-SCOPE-02: PreOrder sản phẩm không thuộc chi nhánh bị từ chối | `REQ_BRANCH_SCOPE_02_CreatePreOrder_ProductNotInBranch_ThrowsProductNotInBranch` | FAIL (Tạo đơn đặt trước thành công) | PASS (Ném `BusinessException: PRODUCT_NOT_IN_BRANCH`) | PASS |
| 7 | REQ-BRANCH-SCOPE-02: Đổi hàng NewItems không thuộc chi nhánh đơn gốc bị từ chối | `REQ_BRANCH_SCOPE_02_ProcessReturnExchange_NewItems_NotInBranch_ThrowsProductNotInBranchAndRollsBack` | FAIL (Cho phép đổi, hoàn kho hàng trả) | PASS (Ném `PRODUCT_NOT_IN_BRANCH`, rollback hoàn toàn không đổi tồn) | PASS |
| 8 | REQ-BRANCH-SCOPE-02: Quà tặng ngoài chi nhánh bị bỏ qua kèm cảnh báo | `REQ_BRANCH_SCOPE_02_CreateOrder_GiftItemNotInBranch_OmittedWithWarning` | FAIL (Quà tặng vẫn bị xuất và trừ tồn) | PASS (Đơn thành công, loại bỏ quà ngoài chi nhánh, có cảnh báo trong GiftStockWarning, tồn quà không đổi) | PASS |
| 9 | REQ-BRANCH-SCOPE-03: Ưu tiên giá chi nhánh -> giá chung master | `REQ_POS_09_CreateOrder_BranchProduct_PriceOverride_AppliesBranchPrice`, `REQ_POS_09_..._FallsBackToMasterPrice` | PASS | PASS (Giữ nguyên logic thứ tự phân giải giá) | PASS |
| 10 | REQ-BRANCH-SCOPE-03: Tồn kho cô lập theo chi nhánh và trừ theo FEFO | `REQ_POS_10_CreateOrder_MultiUnit_ConversionRate_DeductsBaseQuantity_FromBranchStocks_FEFO`, `REQ_POS_11_...` | PASS | PASS (Giữ nguyên thuật toán FEFO trên BranchStocks của chi nhánh) | PASS |

---

## 2. Kết quả kiểm thử hồi quy toàn bộ hệ thống (Regression Suite)

### 2.1. Backend (`MT_GRMS_BACKEND`)
- **Lệnh thực thi**: `dotnet test MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln`
- **Kết quả**:
  - `MT_GRMS.UnitTests.dll`: **Passed!** (Failed: 0, Passed: **595**, Skipped: 0, Total: 595, Duration: 2s)
  - `MT_GRMS.IntegrationTests.dll`: **Passed!** (Failed: 0, Passed: **47**, Skipped: 0, Total: 47, Duration: 2s)
  - **Tổng cộng**: **642/642 tests Passed (100%)**.

### 2.2. Frontend (`MT_GRMS_FRONTEND`)
- **Lệnh thực thi**: `npm --prefix MT_GRMS_FRONTEND run build`
- **Kết quả**:
  - `tsc -b && vite build`: **Exit code 0** (`✓ built in 727ms`).
  - 2589 modules transformed thành công.
- **Linter**:
  - `oxlint`: **0 errors** trên các file POS thay đổi (`posOrderApi.ts`, `PosCheckoutPage.tsx`, `InvoiceManagementPage.tsx`, `PosCatalogGrid.tsx`).

---

## 3. Lỗi tồn đọng
- Không có lỗi tồn đọng. Mọi tiêu chí thành công trong exploration và delta specs đều được thỏa mãn và kiểm chứng.

## 4. Kết luận
**Verdict: PASS**. Sẵn sàng cho lưu trữ và đưa vào sử dụng chính thức.
