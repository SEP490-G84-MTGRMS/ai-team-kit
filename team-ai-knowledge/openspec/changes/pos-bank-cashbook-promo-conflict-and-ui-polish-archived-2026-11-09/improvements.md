# Improvements: pos-bank-cashbook-promo-conflict-and-ui-polish

## Spec · 2026-11-09 11:34

Chọn schema bug-fix tinh gọn (không dư design-brief) bao phủ trọn vẹn 2 lỗi nghiêm trọng POS và 3 điểm tinh chỉnh UI.

## Brainstorm · 2026-11-09 11:42

Luôn đối chiếu dữ liệu seed tĩnh (DefaultBankId) với Global Query Filter đa tenant trước khi viết hàm thu/chi quỹ trên POS.

## Verify Spec · 2026-11-09 11:46

Kiểm tra kỹ PromotionEvaluationTests.cs ngay trong bước Verify Spec giúp đồng bộ đặc tả Best-Offer và giữ tương thích 100% với hành vi cộng gộp Voucher hiện có.

## Apply · 2026-11-09 11:57

Viết unit test TDD tái hiện đúng trạng thái đỏ trước khi sửa code giúp chứng minh chính xác cả 3 lỗi nghiệp vụ cốt lõi (quỹ Bank tenant 2, bậc thang TIERS_JSON, conflict Best-Offer) đã được xử lý triệt để.

## Test · 2026-11-09 12:10

Lập Unified Test Table 5 tầng (5.1 -> 5.5) kèm kết quả kiểm thử chéo và đối chiếu Red -> Green giúp nghiệm thu đầy đủ cả Backend đa tenant lẫn UI POS/Product.
