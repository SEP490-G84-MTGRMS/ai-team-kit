# Tasks: pos-bank-cashbook-promo-conflict-and-ui-polish

## Test tái hiện lỗi (TDD — Red Phase)
- [ ] T1 — Bổ sung unit test trong `CashbookServiceTests.cs` và `PromotionEvaluationTests.cs` tái hiện kịch bản khởi tạo quỹ `Bank` cho tenant thứ 2 đã có `Till`, đọc bậc thang `[TIERS_JSON]` cao nhất và giải quyết xung đột Best-Offer không cộng dồn (`REQ-POS-BANK-01`, `REQ-POS-PROMO-02`)

## Backend (Domain / Application)
- [ ] T2 — Bổ sung `GetOrCreateBankAccountAsync` vào `ICashbookService` & `CashbookService` (sinh `Guid.NewGuid()`, gán `TenantId`, chuẩn hóa `GetAccountsAsync` không trùng PK tĩnh) và cập nhật `OrderService.CreateOrderAsync` tự phân giải quỹ `Bank` kèm thông tin `StorePaymentConfig`, bỏ qua thu quỹ khi `finalAmount == 0` (`REQ-POS-BANK-01`)
- [ ] T3 — Cập nhật `PromotionService.EvaluateCartAsync` giải mã `[TIERS_JSON]` lấy bậc cao nhất thỏa `SubTotal`, kẹp trần ngân sách còn lại (`BudgetLimit - TotalDiscountGiven`) và chọn duy nhất 1 chương trình tự động tốt nhất theo nguyên tắc Best-Offer (`REQ-POS-PROMO-02`)

## Frontend (POS, Product & Navigation)
- [ ] T4 — Cập nhật `PosCheckoutPage.tsx`, `PosPaymentPanel.tsx` và `OrderDiscountModal.tsx` để tự động trừ `autoPromoDiscount` trên dòng `Giảm giá [KM]`, xử lý chiết khấu tay không cộng chồng, thay số `5%` giả lập bằng số thực tế và khóa dùng điểm khi `allowPointsWithPromotions == false` (`REQ-POS-PROMO-02`)
- [ ] T5 — Thiết kế lại `PriceHistoryModal.tsx` theo khung modal chuẩn của hệ thống (`modal-overlay` / `modal-content`) chống đè chữ/vỡ viền nút, đồng thời xóa sạch nhãn `(FE-03.1)`, `(FE-03.2)` tại `PriceHistoryModal.tsx`, `ProductFormModal.tsx` và `EditStoreProductModal.tsx` (`REQ-PROD-UI-03`)
- [ ] T6 — Gỡ bỏ nút `← Về Dashboard` nằm rời bên ngoài `PosHeader.tsx` (dọn sạch import thừa) và xóa 3 mục con dư thừa trên `AppTopNav.tsx` phân hệ Khuyến mãi (`REQ-UI-NAV-04`)

## Kiểm chứng tổng thể (Green Phase & Build)
- [ ] T7 — Chạy toàn bộ test suite `dotnet test MT_GRMS_BACKEND.sln` và build kiểm tra kiểu `npm --prefix MT_GRMS_FRONTEND run build` đạt PASS 100% (`REQ-POS-BANK-01`, `REQ-POS-PROMO-02`, `REQ-PROD-UI-03`, `REQ-UI-NAV-04`)
