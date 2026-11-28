---
verdict: PASS
total_tests: 588
passed_tests: 588
failed_tests: 0
date: 2026-11-09
change: pos-order-promo-audit-bogo-and-preorder-promo
---

# Báo Cáo Kiểm Thử (Test Report)
## Change: pos-order-promo-audit-bogo-and-preorder-promo — Ghi Vết KM/Voucher, Hoàn Thiện Mua X Tặng Y (BOGO) & Tự Động Áp KM Đơn Đặt Trước

### 1. Tóm Tắt Kết Quả (Executive Summary)
- **Kết quả chung (Verdict):** `PASS` (100% test cases đạt, build Production Frontend & Linter đạt 0 lỗi, không phát sinh hồi quy).
- **Môi trường thực thi:**
  - **Backend:** .NET 8.0, C# 12, xUnit (`MT_GRMS.UnitTests` & `MT_GRMS.IntegrationTests`).
  - **Frontend:** React + TypeScript, Vite 8.3.1 (`tsc -b && vite build`), `oxlint`.
- **Tổng số test cases Backend toàn hệ thống:** `588` (`544` Unit Tests + `44` Integration Tests) — `588 Passed, 0 Failed, 0 Skipped`.
- **Bộ test trọng tâm (`PromotionEvaluationTests` + `PosOrderServiceTests`):** `56/56 Passed` (`247 ms`), bao gồm **8 Unit Tests TDD mới** đặc tả trực tiếp 6 Requirements của change.

---

### 2. Ma Trận Truy Vết Nghiệp Vụ & Scenarios (Requirements-to-Test Matrix)

| Mã Yêu Cầu / Scenario | Mô Tả Nghiệp Vụ & Kịch Bản | Test Case / Kiểm Chứng Thực Tế | Kết Quả |
|---|---|---|---|
| **REQ-ORD-PROMO-01**<br>- Scenario: Đơn bán lẻ POS có cả KM tự động & Voucher<br>- Scenario: Tương thích ngược hóa đơn lịch sử | Lưu bền vững `Note` + phân rã `AppliedPromotionId`, `AppliedPromotionSummary`, `PromotionDiscountAmount`, `AppliedVoucherCode`, `VoucherDiscountAmount`, `PointsRedeemed`, `PointsDiscountAmount` trên `Orders`; hiển thị tách biệt trên `InvoiceManagementPage`, `PosReceiptModal`, `ThermalPrintService`; an toàn với đơn cũ `null` metadata | - `PosOrderServiceTests.REQ_ORD_PROMO_01_02_CreateAndCancelOrder_PersistsPromoAuditAndSyncsUsageAndVoucher`<br>- `PosOrderServiceTests.REQ_POS_01_CreateOrder_Cash_Success_ComputesChangeAmount` (hồi quy đơn không metadata KM)<br>- `npm run build` (`tsc -b` type-check `InvoiceManagementPage.tsx` & `PosReceiptModal.tsx`) | **PASS** |
| **REQ-ORD-PROMO-02**<br>- Scenario: Chạm trần ngân sách `BudgetLimit`<br>- Scenario: Gạch mã Voucher nguyên tử & cô lập Tenant<br>- Scenario: `STORE_OWNER` hủy đơn hoàn `UsedCount`, `TotalDiscountGiven` & mở khóa Voucher | Tăng nguyên tử `UsedCount` & `TotalDiscountGiven` cho cả KM tự động (tiền giảm + giá trị quy đổi quà thực xuất) và đợt phát hành Voucher; hoàn trả tồn kho (kể cả quà tặng), giảm `UsedCount`/`TotalDiscountGiven` (kẹp `>= 0`) và mở khóa mã Voucher về `UNUSED` khi `STORE_OWNER` hủy đơn; chặn `CASHIER` hủy đơn `Completed` | - `PosOrderServiceTests.REQ_ORD_PROMO_01_02_CreateAndCancelOrder_PersistsPromoAuditAndSyncsUsageAndVoucher`<br>- `PromotionEvaluationTests.REQ_ORD_BOGO_01_EvaluateCart_BuyXGetY_BudgetLimitClampsGiftQuantity`<br>- `PosOrderServiceTests.CreateOrderAsync_WithVoucherCode_InvokesAtomicRedemption` | **PASS** |
| **REQ-ORD-BOGO-01**<br>- Scenario: `Best-Offer` BOGO thắng giảm tiền<br>- Scenario: `Best-Offer` giảm tiền thắng BOGO | Cấu hình chọn **Sản phẩm mua (X)** trong `PromotionModal` (`[TIERS_JSON]` + `PromotionConditions`); đánh giá `BUY_X_GET_Y`, quy đổi giá trị quà tặng, kẹp theo ngân sách dư và xét chọn **1 chương trình `Best-Offer` toàn cục** duy nhất (không cộng dồn trùng lặp) | - `PromotionEvaluationTests.REQ_ORD_BOGO_01_EvaluateCart_BuyXGetY_WithTiersJsonAndBuyProductId_AwardsExactGift`<br>- `PromotionEvaluationTests.REQ_ORD_BOGO_01_EvaluateCart_BestOffer_BuyXGetYVsOrderDiscount_PicksHigherValueNoStacking`<br>- `PromotionEvaluationTests.REQ_ORD_BOGO_01_EvaluateCart_BuyXGetY_BudgetLimitClampsGiftQuantity`<br>- `PromotionEvaluationTests.REQ_PV03_EvaluateCart_BuyXGetY_AwardsCorrectGiftItems` | **PASS** |
| **REQ-ORD-BOGO-02**<br>- Scenario: Mua 2/3 tặng 1 trùng mã SP khi kho thiếu quà tặng<br>- Scenario: Chặn đơn chỉ chứa dòng `IsGift = true` | Bắt buộc có ít nhất 1 dòng `!IsGift`; trừ kho lô FEFO ưu tiên hàng mua chính trước rồi mới cấp tồn khả dụng cho hàng tặng (`ActualPrice = 0`, `VatAmount = 0`, không cộng vào `TotalAmount`/`FinalAmount`); thiếu quà không chặn đơn chính, trả `GiftStockWarning` và không ghi khống lượt dùng KM nếu giao `0` quà | - `PosOrderServiceTests.REQ_ORD_BOGO_02_CreateOrder_WithGiftItem_DeductsFefoStockAndPersistsZeroPriceLine`<br>- `PosOrderServiceTests.REQ_ORD_BOGO_02_CreateOrder_SameProductBuyAndGift_LowStockPrioritizesPaidAndWarns_AndRejectsAllGiftOrder` | **PASS** |
| **REQ-ORD-BOGO-03**<br>- Scenario: Khách trả lại sản phẩm quà tặng trùng mã SP mua chính | Tách dòng theo `OrderDetailId` (`itemId`) trên `ReturnExchangeModal` & `ProcessReturnExchangeAsync`; khóa cứng số tiền hoàn trả = `0 đ` cho dòng gốc `IsGift == true` bất kể `UnitPrice` client gửi lên, đồng thời vẫn nhập lại tồn kho `BranchStock` nếu `Condition == "Restock"` | - `PosOrderServiceTests.REQ_ORD_BOGO_03_ProcessReturnExchange_ReturningGiftItemSameProduct_ForcesZeroRefundAndRestocks` | **PASS** |
| **REQ-ORD-PRE-01**<br>- Scenario: Đơn đặt trước tự áp KM giảm cọc tối thiểu `10%` & giữ kho quà tặng<br>- Scenario: Từ chối mã Voucher dùng 1 lần trên Đơn đặt trước | Tự động thẩm định KM trên `CreatePreOrderModal` (ẩn hoàn toàn ô nhập Voucher), tính `minDeposit = 10% * FinalAmount` sau KM, giữ kho FEFO cho hàng đặt & quà tặng `0 đ`, chặn cứng `VoucherCode` tại `CreatePreOrderAsync`, và đồng bộ hiển thị trạng thái `PendingPickup` trên tab Đơn đặt trước | - `PosOrderServiceTests.REQ_ORD_PRE_01_CreatePreOrder_AutoPromoReducesMinDepositAndReservesGift_AndRejectsVoucherCode` | **PASS** |

---

### 3. Lệnh Kiểm Thử Đã Chạy & Output Thực Tế

#### 3.1. Toàn bộ Backend Unit & Integration Tests
```powershell
dotnet test "d:\FPT\FPT_Ky9\SEP490\PhanMen\Code\MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln" --nologo --verbosity minimal
```
**Output thực tế:**
```text
Passed!  - Failed:     0, Passed:    44, Skipped:     0, Total:    44, Duration: 2 s - MT_GRMS.IntegrationTests.dll (net8.0)
Passed!  - Failed:     0, Passed:   544, Skipped:     0, Total:   544, Duration: 1 s - MT_GRMS.UnitTests.dll (net8.0)
```

#### 3.2. Bộ Test Trọng Tâm Khuyến Mãi & Đơn Hàng POS
```powershell
dotnet test "d:\FPT\FPT_Ky9\SEP490\PhanMen\Code\MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln" --filter "FullyQualifiedName~PromotionEvaluationTests|FullyQualifiedName~PosOrderServiceTests" --nologo --verbosity minimal
```
**Output thực tế:**
```text
Passed!  - Failed:     0, Passed:    56, Skipped:     0, Total:    56, Duration: 247 ms - MT_GRMS.UnitTests.dll (net8.0)
```

#### 3.3. Frontend TypeScript Check, Production Bundle & Static Lint
```powershell
npm --prefix "d:\FPT\FPT_Ky9\SEP490\PhanMen\Code\MT_GRMS_FRONTEND" run build
npx --prefix "d:\FPT\FPT_Ky9\SEP490\PhanMen\Code\MT_GRMS_FRONTEND" oxlint <14 modified files>
```
**Output thực tế:**
```text
> frontend@0.0.0 build
> tsc -b && vite build
✓ 2580 modules transformed.
✓ built in 850ms

oxlint: Found 21 warnings and 0 errors. Finished in 84ms on 14 files.
```

---

### 4. Lỗi Còn Tồn Đọng (Known Issues / Defects)
- **Số lượng lỗi:** `0` lỗi tồn đọng.
- Toàn bộ 7 mục trong **Acceptance Checklist** của `specs.md` đều đã được kiểm chứng đạt 100%.
