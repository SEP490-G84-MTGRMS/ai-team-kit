# Exploration: pos-promotions-vouchers-loyalty-integration

## 1. Problem Statement (Vấn đề cần giải quyết)
1. **Dư thừa khối cấu hình Hạng thẻ thành viên**: Tại trang cấu hình Tích điểm [`LoyaltyConfigForm.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/promotion/components/loyalty/LoyaltyConfigForm.tsx), tồn tại Card 3 "Chính sách 4 Hạng thẻ thành viên & Hệ số nhân điểm" (Đồng, Bạc, Vàng, Kim Cương). Khối này hoàn toàn không có trong thực thể CSDL `LoyaltySetting` của backend, gây dư thừa, khó hiểu và dễ phát sinh lỗi khi người dùng cố gắng lưu dữ liệu.
2. **Khép kín luồng POS Bán Hàng**: Mặc dù Backend đã có các controller (`PromotionsController`, `VouchersController`, `LoyaltyConfigController`) và `OrderService.CreateOrderAsync` đã có logic tiếp nhận `VoucherCode` / `PointsRedeemed`, nhưng cần kiểm chứng:
   - Backend đã có Unit Test đầy đủ cho kịch bản tạo đơn hàng POS tích hợp Voucher và Tiêu điểm chưa?
   - Frontend POS (`PosCheckoutPage.tsx`, `PosPaymentPanel.tsx`) đã kết nối API thực tế trơn tru chưa (tự động tính khuyến mãi giỏ hàng, áp dụng voucher, tiêu điểm tích lũy của khách hàng)?

---

## 2. Context & Background (Hiện trạng code)
- **Backend (`MT_GRMS_BACKEND`)**:
  - Thực thể `LoyaltySetting`: Quản lý phẳng theo Tenant gồm `IsEnabled`, `EarningRateAmount` (VNĐ), `EarningPoints`, `RedemptionRatePoints`, `RedemptionRateAmount` (VNĐ), `MinRedemptionPoints`, `AllowPointsWithPromotions`. Tuyệt đối không có bảng Tiers.
  - `PromotionsController`: Đã có `POST /api/promotions/evaluate-cart` để tính chiết khấu giỏ hàng tự động.
  - `VouchersController`: Đã có `POST /api/vouchers/validate` và `POST /api/vouchers/redeem`.
  - `OrderService.CreateOrderAsync`: Đã có logic trừ `PointsRedeemed`, cộng điểm mới từ `finalAmount / EarningRateAmount * EarningPoints`, và gọi `RedeemVoucherCodeAtomicAsync`.
  - Unit Tests: Đã có 20 tests trong `PromotionEvaluationTests`, `PromotionManagementTests`, `VoucherManagementTests`, `LoyaltyServiceTests`. Tuy nhiên cần bổ sung test trong `PosOrderServiceTests` để kiểm thử toàn diện luồng `CreateOrderAsync` có áp dụng voucher và tiêu điểm.
- **Frontend (`MT_GRMS_FRONTEND`)**:
  - `LoyaltyConfigForm.tsx`: Card 3 chứa bảng 4 hạng thẻ thành viên cần được gỡ bỏ sạch sẽ.
  - `LoyaltyConfigPage.tsx`: Cần gỡ bỏ logic scroll tới `#membership-tiers-section`.
  - `PosPaymentPanel.tsx`: Cần xóa bỏ chuỗi `({customer.membershipTier})`, chỉ hiển thị số điểm tích lũy và số tiền quy đổi.
  - `PosCheckoutPage.tsx`: Đã có khung gọi `promotionApi.evaluateCart` và `promotionApi.validateVoucher`, cần đảm bảo khi thanh toán truyền đúng `voucherCode` và `pointsRedeemed` xuống backend.

---

## 3. Constraints (Ràng buộc kỹ thuật & nghiệp vụ)
1. **Kiến trúc dữ liệu**: `LoyaltySetting` tuân thủ mô hình 1 dòng cấu hình cho mỗi Tenant, không tạo thêm bảng xếp hạng thành viên.
2. **Nguyên tắc tiêu điểm**:
   - Khách hàng phải có đủ số điểm tối thiểu `MinRedemptionPoints` (mặc định 20 điểm) mới được tiêu điểm.
   - Số điểm tiêu không được vượt quá số điểm khả dụng của khách và không vượt quá tổng giá trị đơn hàng.
   - Tiêu điểm quy đổi: $\text{Số tiền giảm} = \text{Số điểm tiêu} \times \text{RedemptionRateAmount} / \text{RedemptionRatePoints}$.
3. **Nguyên tắc Voucher**:
   - Voucher phải còn hạn sử dụng, chưa bị dùng (`IsUsed == false`), đạt giá trị đơn hàng tối thiểu.
   - Khi thanh toán thành công, voucher được đổi nguyên tử thành `USED` gắn với mã đơn hàng.

---

## 4. Assumptions (Giả định)
- **[ASSUMPTION-1]**: Mọi khách hàng có số điện thoại đăng ký trong hệ thống đều được tích điểm tự động theo tỷ lệ của cửa hàng mà không cần đăng ký thẻ thành viên riêng.
- **[ASSUMPTION-2]**: Khách vãng lai ("Khách lẻ") không có tài khoản thì không tích điểm và không tiêu điểm được.
- **[ASSUMPTION-3]**: Nếu cửa hàng tắt tính năng tích điểm (`IsEnabled == false`), POS sẽ ẩn tùy chọn tiêu điểm và không cộng điểm thưởng mới.

---

## 5. Scope & Non-Goals

### In Scope
- Xóa bỏ khối "Chính sách 4 Hạng thẻ thành viên" trong `LoyaltyConfigForm.tsx` và `LoyaltyConfigPage.tsx`.
- Dọn dẹp nhãn `membershipTier` trong `PosPaymentPanel.tsx`.
- Viết unit test cho `OrderService.CreateOrderAsync` kiểm thử trừ điểm tiêu, cộng điểm mới và đổi mã voucher.
- Kiểm thử tích hợp luồng Bán hàng POS với Khuyến mãi, Voucher và Tích điểm.

### Out of Scope (Non-Goals)
- Không xây dựng cơ chế thăng hạng thẻ VIP (Silver/Gold/Diamond).
- Không gửi tin nhắn SMS OTP qua điện thoại khi tiêu điểm.

---

## 6. Success Criteria (Tiêu chí thành công)
1. Giao diện Cấu hình tích điểm chỉ còn:
   - Card 1: Kích hoạt hệ thống tích điểm.
   - Card 2: Quy tắc Tích điểm (Doanh số -> Điểm).
   - Card 3: Quy tắc Tiêu điểm (Điểm -> Tiền giảm & Điểm tối thiểu).
2. Khi khách hàng mua hàng tại POS:
   - Nhập mã voucher hợp lệ -> Giảm tiền đơn hàng.
   - Tick chọn tiêu điểm -> Trừ đúng số điểm và giảm đúng số tiền.
   - Sau khi thanh toán -> Điểm của khách hàng được cập nhật chính xác (trừ điểm tiêu, cộng điểm mới).
3. 100% Unit Tests backend đạt PASS và frontend build không lỗi.
