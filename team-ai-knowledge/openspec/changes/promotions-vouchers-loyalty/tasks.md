# Tasks: promotions-vouchers-loyalty

## 1. Database & Migrations
- [ ] T1: Tạo Entity `LoyaltySetting` kế thừa `BaseTenantEntity` trong `MT_GRMS.Domain`, tạo `LoyaltySettingConfiguration` trong EF Core, và thêm migration `AddLoyaltySettingsTable`. (REQ-LOYALTY-01)

## 2. Backend Domain & Application Logic
- [ ] T2: Nâng cấp `PromotionService.EvaluateCartAsync` để hỗ trợ tính toán chiết khấu theo sản phẩm (`PRODUCT_DISCOUNT`), kết hợp hoàn chỉnh với `ORDER_DISCOUNT` và `BUY_X_GET_Y`. (REQ-PROMO-01, REQ-PROMO-02)
- [ ] T3: Hiện thực hóa `ILoyaltyService` và `LoyaltyService` trong `MT_GRMS.Application` để đọc/ghi cấu hình tỷ lệ tích điểm và tiêu điểm theo Tenant. (REQ-LOYALTY-01)
- [ ] T4: Cập nhật `OrderCreateRequest` bổ sung `string? VoucherCode = null`; cập nhật `OrderService.CreateOrderAsync` tự động validate & redeem mã voucher và tính toán điểm thưởng / khấu trừ điểm tiêu theo cấu hình `LoyaltySetting`. (REQ-VOUCHER-02, REQ-LOYALTY-02)

## 3. Backend Controllers & API
- [ ] T5: Thêm `LoyaltyConfigController` tại `api/loyalty-config` (`GET` và `PUT`) cung cấp API cấu hình điểm thưởng cho Store Owner. (REQ-LOYALTY-01)

## 4. Frontend API Client & Quản Lý Chiến Dịch
- [ ] T6: Tạo `src/features/promotion/api/promotionApi.ts` với đầy đủ API calls: Promotions, Vouchers, Cart Evaluation, Loyalty Config. (REQ-PROMO-01, REQ-VOUCHER-01, REQ-LOYALTY-01)
- [ ] T7: Cập nhật `PromotionListPage.tsx` và `PromotionModal.tsx` kết nối API thật, hỗ trợ tạo & quản lý 3 loại khuyến mãi: % đơn hàng, giảm giá sản phẩm, Mua X tặng Y. (REQ-PROMO-01)
- [ ] T8: Cập nhật `VoucherListPage.tsx`, `VoucherBatchModal.tsx`, `GenerateCodesModal.tsx` kết nối API thật, theo dõi đợt phát hành và danh sách mã voucher con. (REQ-VOUCHER-01)
- [ ] T9: Cập nhật `LoyaltyConfigPage.tsx` và `LoyaltyConfigForm.tsx` kết nối API `GET` và `PUT /api/loyalty-config`. (REQ-LOYALTY-01)

## 5. Tích Hợp Bán Hàng Tại Quầy POS
- [ ] T10: Cập nhật `PosCheckoutPage.tsx`:
  - Tự động gọi `evaluate-cart` khi thay đổi sản phẩm trong giỏ để áp dụng khuyến mãi và hiển thị quà tặng Buy X Get Y.
  - Tích hợp ô nhập mã Voucher (thẩm định tức thời và hiển thị giảm trừ).
  - Tích hợp hiển thị điểm thưởng của khách hàng đã chọn và công tắc/ô nhập tiêu điểm để giảm trừ tiền.
  - Truyền `voucherCode` và `pointsRedeemed` vào payload thanh toán. (REQ-PROMO-02, REQ-VOUCHER-02, REQ-LOYALTY-02)

## 6. Kiểm Thử & Kiểm Chứng (Testing & Verification)
- [ ] T11: Viết Unit Tests cho `LoyaltyService`, `PromotionService (PRODUCT_DISCOUNT)`, `OrderService (Voucher + Points)`, chạy kiểm thử toàn bộ `dotnet test`. (REQ-PROMO-01, REQ-VOUCHER-02, REQ-LOYALTY-01, REQ-LOYALTY-02)
- [ ] T12: Chạy kiểm tra TypeScript và build Frontend `npm run build` đảm bảo không phát sinh lỗi biên dịch.
