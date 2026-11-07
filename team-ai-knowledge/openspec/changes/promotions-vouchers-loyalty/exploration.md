# EXP-2026-11-07-001: Khảo Sát & Giải Pháp Kỹ Thuật Khuyến Mãi, Voucher và Cấu Hình Tích Điểm

## 1. Problem Statement (Phát biểu vấn đề)
Hệ thống bán lẻ MT-GRMS đã có hạ tầng Backend cho Quản lý Khuyến mại (`PromotionsController`) và Voucher (`VouchersController`), đồng thời có các trang giao diện mẫu ở Frontend (`src/features/promotion/`). Tuy nhiên:
1. Logic thẩm định giỏ hàng (`EvaluateCartAsync`) hiện chỉ hỗ trợ `ORDER_DISCOUNT` và `BUY_X_GET_Y`, chưa hỗ trợ `PRODUCT_DISCOUNT` (giảm giá trực tiếp theo sản phẩm/mặt hàng).
2. Chưa có API cấu hình tỷ lệ tích điểm và tiêu điểm (`LoyaltyConfig`), tỷ lệ tích điểm đang bị gán cứng `10.000 đ = 1 điểm` trong `OrderService.cs`, và Frontend `LoyaltyConfigPage` hoàn toàn chỉ dùng mock data trong RAM.
3. Màn hình bán hàng POS (`PosCheckoutPage.tsx`) chưa tích hợp gọi API tự động thẩm định khuyến mãi, chưa cho phép nhập mã voucher để khấu trừ tiền, và chưa có giao diện chọn tiêu điểm thưởng khi khách hàng thanh toán.

## 2. Context & Background (Bối cảnh & Hiện trạng)
- **Backend**:
  - Entity `Promotion`: có sẵn `Type` (ORDER_DISCOUNT, FIXED_AMOUNT, PERCENT, BUY_X_GET_Y, VOUCHER), `PromotionCondition` (quan hệ M:N với Product qua `ProductRole`: BUY, GIFT, DISCOUNT), `VoucherCode`.
  - Service `PromotionService`: Đã có CRUD Khuyến mãi, CRUD Đợt Voucher, Sinh mã tự động, Thẩm định voucher (`ValidateVoucherAsync`), Đổi mã (`RedeemVoucherAsync`), và Thẩm định giỏ hàng (`EvaluateCartAsync`).
  - Entity `Customer`: Đã có trường `RewardPoints` và `TotalSpending`.
  - Service `OrderService`: Đã có `PointsRedeemed` trong `OrderCreateRequest` và trừ điểm khách hàng, cộng điểm khi hoàn tất đơn.
- **Frontend**:
  - `src/features/promotion/`: Đã có giao diện `PromotionListPage`, `VoucherListPage`, `LoyaltyConfigPage` cùng các components modal, nhưng chưa có API client (`promotionApi.ts`) kết nối với Backend.
  - `src/features/pos/pages/PosCheckoutPage.tsx`: Đã có state `orderDiscountPercent`, `couponDiscount`, `usePoints` nhưng chưa liên kết với backend API.

## 3. Constraints (Ràng buộc kỹ thuật & nghiệp vụ)
1. **Clean Architecture**: Domain độc lập; Application chứa DTOs, logic tính toán; Infrastructure thao tác EF Core; API Controller định tuyến.
2. **Multi-tenancy**: Mọi dữ liệu Khuyến mãi, Đợt Voucher, Mã Voucher và Cấu hình tích điểm phải lọc theo `TenantId` (Store) hiện tại.
3. **Tiền tệ & Điểm thưởng**: Tiền tệ VND dùng `decimal(18,2)`; Điểm thưởng thành viên dùng `int` nguyên dương (làm tròn xuống khi tích điểm, không tích điểm âm).
4. **Không breaking changes**: Giữ tương thích ngược với các API POS Order hiện có, không ảnh hưởng đến dòng tiền ca chốt (`CashierShift`) và sổ quỹ (`LedgerTransaction`).

## 4. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Mỗi đơn hàng POS cho phép áp dụng tối đa 1 chương trình khuyến mãi tự động (hệ thống chọn khuyến mãi có giá trị giảm cao nhất cho khách hàng nếu có nhiều chương trình cùng thỏa mãn), kèm tối đa 1 mã Voucher hợp lệ, và được kết hợp tiêu điểm thưởng của khách.
- **[ASSUMPTION-02]**: Quà tặng trong chương trình Mua X tặng Y (`BUY_X_GET_Y`) được đưa vào giỏ hàng POS với đơn giá 0đ (`IsGift = true`), kiểm tra tồn kho tại chi nhánh bình thường.
- **[ASSUMPTION-03]**: Tỷ lệ tích điểm mặc định là 10.000 VNĐ doanh số = 1 điểm; Tỷ lệ tiêu điểm mặc định là 1 điểm = 1.000 VNĐ; Điểm tối thiểu để đổi là 20 điểm (tương đương 20.000 VNĐ).

## 5. Scope & Non-Goals
### In Scope
- Bổ sung xử lý `PRODUCT_DISCOUNT` vào `PromotionService.EvaluateCartAsync`.
- Thêm Entity hoặc cấu hình `LoyaltySetting` lưu trữ tỷ lệ tích điểm và đổi điểm theo từng Tenant, cung cấp API `GET /api/loyalty-config` và `PUT /api/loyalty-config`.
- Cập nhật `OrderService` đọc cấu hình `LoyaltySetting` khi tính điểm thưởng tích lũy và trừ điểm.
- Viết `promotionApi.ts` ở Frontend, thay thế dữ liệu Mock bằng API thật trên 3 trang quản trị (`PromotionListPage`, `VoucherListPage`, `LoyaltyConfigPage`).
- Tích hợp vào `PosCheckoutPage`: Debounce gọi `evaluate-cart`, nhập Voucher, hiển thị điểm và chọn tiêu điểm khách hàng.

### Out of Scope (Non-Goals)
- Không gửi tin nhắn SMS/Zalo thông báo mã voucher (chỉ xem trên UI hoặc in mã).
- Không hỗ trợ hạng thành viên động theo nhiều bậc VIP (Bronze, Silver, Gold, Diamond với quyền lợi phức tạp); chỉ tập trung tích điểm - tiêu điểm thống nhất.
- Không áp dụng đồng thời nhiều mã Voucher trên cùng 1 đơn hàng (POS chỉ nhận 1 Voucher).

## 6. Technical Options (Các phương án kỹ thuật)

### Phương án A: Lưu Cấu hình Tích điểm vào bảng `StorePaymentConfig` (Hoặc gộp vào cấu hình Tenant)
- **Ưu điểm**: Không cần tạo bảng DB mới; tận dụng migration sẵn có của `StorePaymentConfig` (đã là `BaseTenantEntity`).
- **Nhược điểm**: `StorePaymentConfig` vốn quản lý ngân hàng và hạn mức két tiền POS, gộp cấu hình tích điểm vào sẽ vi phạm Single Responsibility Principle (SRP).

### Phương án B (CHỌN): Tạo Entity `LoyaltySetting` riêng biệt kế thừa `BaseTenantEntity`
- **Ưu điểm**:
  - Thiết kế chuẩn 3NF và tuân thủ Domain-Driven Design (DDD).
  - Độc lập hoàn toàn, dễ mở rộng thêm các trường như `MinRedemptionPoints`, `MaxRedemptionAmountPerOrder`, `AllowPointsWithPromotions`.
  - Có Service và Controller riêng `LoyaltyController` (`/api/loyalty-config`), bảo trì và phân quyền rõ ràng.
- **Nhược điểm**: Cần thêm 1 Migration EF Core nhỏ (`AddLoyaltySettingTable`).

## 7. Rủi ro & Cách khắc phục (Risks & Mitigations)
- **Rủi ro 1: Xung đột giảm giá làm đơn hàng âm tiền**: Khi áp dụng đồng thời khuyến mãi + voucher + tiêu điểm, tổng tiền giảm có thể vượt giá trị giỏ hàng.
  - *Khắc phục*: Trong `EvaluateCartAsync` và tại POS checkout, luôn giới hạn: `TotalDiscount = Math.Min(calculatedDiscount, subTotal)`. Số tiền thanh toán cuối cùng (`FinalAmount`) không bao giờ nhỏ hơn 0.
- **Rủi ro 2: Voucher bị dùng nhiều lần do mạng chập chờn (Race condition)**: Hai thu ngân cùng quét 1 mã voucher cùng lúc.
  - *Khắc phục*: Sử dụng Optimistic Concurrency hoặc câu lệnh `UPDATE ... WHERE Status = 'UNUSED'` trong `RedeemVoucherAsync` để đảm bảo tính bất khả quy phạm (Atomic lock).

## 8. Success Criteria (Tiêu chí thành công)
1. Backend vượt qua toàn bộ unit/integration test, bao gồm các test case cho `PRODUCT_DISCOUNT`, `LoyaltyConfig`, và `EvaluateCart`.
2. Frontend build thành công, kết nối API mượt mà, không dùng mock data ở production mode.
3. Tại POS: Thêm sản phẩm được giảm giá tự động, nhập voucher được trừ tiền, chọn tiêu điểm trừ tiền và cập nhật số dư điểm của khách sau khi thanh toán.
