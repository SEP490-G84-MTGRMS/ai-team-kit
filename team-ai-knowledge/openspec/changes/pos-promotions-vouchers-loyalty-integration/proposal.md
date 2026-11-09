# Proposal: pos-promotions-vouchers-loyalty-integration

## 1. Vấn đề (Context & Problem)
1. **Dư thừa cấu hình hạng thành viên**: Giao diện cấu hình tích điểm (`LoyaltyConfigForm.tsx`) hiện vẫn còn khối cấu hình "4 Hạng thẻ thành viên & Hệ số nhân" (Đồng, Bạc, Vàng, Kim Cương). Phần này không có trong mô hình CSDL C# (`LoyaltySetting` chỉ quản lý tỷ lệ tích điểm và tiêu điểm phẳng theo cửa hàng/tenant), gây hiểu nhầm cho chủ cửa hàng và làm phức tạp hóa nghiệp vụ.
2. **Kiểm tra và chuẩn hóa Backend**: Phân hệ Khuyến mãi (Promotions), Voucher và Tích điểm (Loyalty) đã có Entity và Controller cơ bản, nhưng cần rà soát lại xem đã hoàn chỉnh các API phục vụ bán hàng POS chưa (`evaluate-cart`, `validate` voucher, `redeem` voucher, cộng và trừ điểm thưởng khi thanh toán đơn hàng).
3. **Thiếu Unit Test tích hợp bán hàng**: Cần đảm bảo có đầy đủ Unit Tests bao phủ trọn vẹn luồng tích điểm, tiêu điểm và áp dụng mã voucher trong thanh toán POS.
4. **Tích hợp thực tế vào màn hình Bán hàng POS**: Màn hình bán hàng POS (`PosCheckoutPage.tsx`, `PosPaymentPanel.tsx`) cần kết nối API thực tế:
   - Tự động đánh giá khuyến mãi giỏ hàng (`evaluate-cart`).
   - Nhập mã voucher và trừ tiền trực tiếp trên đơn hàng.
   - Cho phép khách hàng thành viên tiêu điểm tích lũy để giảm trừ thanh toán.

---

## 2. Mục tiêu (Objectives)
1. **Đơn giản hóa cấu hình Tích điểm**: Xóa bỏ hoàn toàn khối xét hạng thẻ thành viên khỏi giao diện cấu hình tích điểm của Chủ cửa hàng.
2. **Khép kín luồng nghiệp vụ Bán hàng POS**:
   - Tự động áp dụng khuyến mãi giỏ hàng từ Backend API.
   - Áp dụng mã Voucher hợp lệ, giảm trừ tiền đơn hàng và đánh dấu mã đã sử dụng (`USED`) sau khi thanh toán.
   - Khách hàng tiêu điểm thưởng tích lũy (theo tỷ lệ cấu hình của cửa hàng) để giảm tiền thanh toán trực tiếp.
   - Tự động cộng điểm thưởng mới cho khách hàng sau khi hoàn tất hóa đơn.
3. **Chất lượng mã nguồn**: Viết đầy đủ Unit Tests cho backend và đảm bảo frontend build sạch 100% không lỗi.

---

## 3. Phạm vi (Scope)

### Trong phạm vi (In-Scope)
- **Frontend UI (`MT_GRMS_FRONTEND`)**:
  - `LoyaltyConfigForm.tsx` & `LoyaltyConfigPage.tsx`: Loại bỏ Card 3 "Chính sách 4 Hạng thẻ thành viên & Hệ số nhân điểm" và các state liên quan.
  - `PosPaymentPanel.tsx`: Dọn dẹp nhãn hiển thị hạng thành viên, chỉ hiển thị số điểm tích lũy và số tiền quy đổi tương ứng.
  - `PosCheckoutPage.tsx`:
    - Tích hợp gọi API `promotionApi.evaluateCart` tự động tính chiết khấu khuyến mãi khi giỏ hàng thay đổi.
    - Tích hợp kiểm tra voucher qua `promotionApi.validateVoucher` và áp dụng giảm giá.
    - Tích hợp chọn tiêu điểm thưởng của khách hàng (theo tỷ lệ `LoyaltySetting.redemptionRateAmount` / `redemptionRatePoints`).
    - Gửi `voucherCode` và `pointsRedeemed` khi gọi API tạo đơn hàng POS `createOrder`.
- **Backend API (`MT_GRMS_BACKEND`)**:
  - Rà soát `PromotionsController`, `VouchersController`, `LoyaltyConfigController`.
  - Kiểm tra `OrderService.CreateOrderAsync`: Xác thực điểm tiêu của khách hàng, trừ điểm, cộng điểm tích lũy mới và đổi mã voucher (`RedeemVoucherCodeAtomicAsync`).
  - Viết/cập nhật Unit Tests trong `MT_GRMS.UnitTests` cho luồng tạo đơn hàng kết hợp Voucher và Tích điểm.

### Ngoài phạm vi (Out-of-Scope)
- Hệ thống thăng hạng VIP đa cấp độ phức tạp (Bạc/Vàng/Kim Cương).
- Gửi SMS Brandname hoặc email thông báo điểm thưởng cho khách hàng.

---

## 4. Người dùng & Phân quyền (Users & Roles)
- **Chủ cửa hàng (StoreOwner / Admin)**: Cấu hình tỷ lệ tích điểm (VNĐ → Điểm), tỷ lệ tiêu điểm (Điểm → VNĐ), quản lý danh sách chương trình khuyến mãi và đợt phát hành voucher.
- **Thu ngân (Cashier / POS)**: Bán hàng tại quầy POS, chọn khách hàng, xem số điểm tích lũy, nhập mã voucher và xác nhận tiêu điểm giảm trừ cho khách.
- **Khách hàng (Customer)**: Hưởng chiết khấu khuyến mãi, mã giảm giá và tích lũy/tiêu điểm thưởng khi mua hàng.

---

## 5. Tiêu chí thành công (Success Criteria)
- [ ] Khối "Hạng thẻ thành viên" được xóa bỏ sạch sẽ khỏi trang Cấu hình Tích điểm (`LoyaltyConfigPage.tsx`, `LoyaltyConfigForm.tsx`).
- [ ] Trang Cấu hình Tích điểm lưu và nạp cấu hình (`LoyaltySetting`) chính xác từ Backend API.
- [ ] Giỏ hàng POS tự động hiển thị khuyến mãi áp dụng khi đủ điều kiện đơn hàng.
- [ ] Nhập mã Voucher hợp lệ trên POS sẽ giảm trừ tiền thanh toán, và mã được cập nhật trạng thái `USED` sau khi đơn hàng hoàn tất.
- [ ] Khách hàng thành viên có thể tiêu điểm tích lũy để giảm trừ tiền đơn hàng theo đúng tỷ lệ trong `LoyaltySetting`.
- [ ] Khách hàng được tự động cộng điểm thưởng mới vào tài khoản dựa trên số tiền thanh toán thực tế.
- [ ] Bộ Unit Tests backend đạt 100% PASS; Frontend build `tsc -b && vite build` thành công 0 lỗi.
