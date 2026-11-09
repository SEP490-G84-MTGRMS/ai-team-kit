# Improvements: pos-promotions-vouchers-loyalty-integration

## Spec · 2026-11-09 05:52

Thống nhất xóa bỏ khối xét hạng thành viên, rà soát backend, viết unit test và tích hợp trọn vẹn vào POS bán hàng.

## Brainstorm · 2026-11-09 05:58

Đảm bảo các thay đổi giao diện gỡ bỏ phân hạng thẻ đồng bộ hoàn toàn với API Backend hiện có.

## Verify Spec · 2026-11-09 06:02

Bổ sung các unit test tạo đơn hàng kèm voucher và loyalty points để tăng độ tin cậy.

## Apply · 2026-11-09 06:14

Các test kiểm thử tạo đơn hàng có loyalty points và voucher đã được tích hợp chặt chẽ vào PosOrderServiceTests.
