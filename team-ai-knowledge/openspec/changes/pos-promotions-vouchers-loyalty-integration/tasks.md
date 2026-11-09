# Tasks: pos-promotions-vouchers-loyalty-integration

## Backend & Domain

- [x] T1 — Rà soát entity `LoyaltySetting`, repository và logic tích/tiêu điểm và voucher trong `OrderService.CreateOrderAsync` (REQ-LOYALTY-CONFIG-03, REQ-POS-LOYALTY-REDEMPTION-04)
- [x] T2 — Bổ sung unit tests kiểm thử tạo đơn hàng POS với tiêu điểm thưởng và áp dụng mã voucher trong `MT_GRMS.UnitTests` (REQ-POS-LOYALTY-REDEMPTION-04, REQ-POS-PROMO-VOUCHER-05)

## Frontend UI Components

- [x] T3 — Gỡ bỏ hoàn toàn Card 3 Hạng thẻ thành viên (`#membership-tiers-section`), dọn dẹp state và handlers cập nhật tier trong `LoyaltyConfigForm.tsx` (REQ-LOYALTY-REMOVE-TIERS-01)
- [x] T4 — Xóa bỏ hash scroll `view=tiers` và các nút điều hướng liên quan trong `LoyaltyConfigPage.tsx` (REQ-LOYALTY-REMOVE-TIERS-01)
- [x] T5 — Xóa nhãn hạng thành viên `({customer.membershipTier})` và chuẩn hóa hiển thị điểm tích lũy quy đổi trong `PosPaymentPanel.tsx` (REQ-LOYALTY-POS-DISPLAY-02)
- [x] T6 — Kiểm tra luồng `PosCheckoutPage.tsx` tích hợp gọi `evaluateCart`, `validateVoucher` và gửi `pointsRedeemed`, `voucherCode` sang `OrdersController` (REQ-POS-LOYALTY-REDEMPTION-04, REQ-POS-PROMO-VOUCHER-05)

## Verification & Testing

- [x] T7 — Biên dịch và kiểm tra Frontend (`npm run build`) xác nhận không còn lỗi TypeScript hay unused imports/variables (REQ-LOYALTY-REMOVE-TIERS-01, REQ-LOYALTY-POS-DISPLAY-02)
- [x] T8 — Chạy toàn bộ Backend test suites (`dotnet test MT_GRMS_BACKEND.sln`) xác nhận 100% test cases thành công (REQ-POS-LOYALTY-REDEMPTION-04, REQ-POS-PROMO-VOUCHER-05)
