# Improvements: pos-bank-cashbook-promo-conflict-and-ui-polish

## Spec · 2026-11-09 11:34

Chọn schema bug-fix tinh gọn (không dư design-brief) bao phủ trọn vẹn 2 lỗi nghiêm trọng POS và 3 điểm tinh chỉnh UI.

## Brainstorm · 2026-11-09 11:42

Luôn đối chiếu dữ liệu seed tĩnh (DefaultBankId) với Global Query Filter đa tenant trước khi viết hàm thu/chi quỹ trên POS.

## Verify Spec · 2026-11-09 11:46

Kiểm tra kỹ PromotionEvaluationTests.cs ngay trong bước Verify Spec giúp đồng bộ đặc tả Best-Offer và giữ tương thích 100% với hành vi cộng gộp Voucher hiện có.
