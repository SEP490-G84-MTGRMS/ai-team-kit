# Summary: pos-order-promo-audit-bogo-and-preorder-promo

## Spec — ✅ Approve bởi @sonnguyenn10 · 2026-11-09 12:28

Đã duyệt proposal.md cho change pos-order-promo-audit-bogo-and-preorder-promo: ghi vết chi tiết KM/Voucher/Điểm thưởng vào Quản lý đơn hàng & đồng bộ ngân sách, hoàn thiện trọn gói Mua X tặng Y (chọn SP mua X, chống conflict Best-Offer, trừ kho FEFO dòng 0đ, khóa hoàn tiền khi đổi trả) và tự động áp KM cho Đơn đặt trước (không áp mã Voucher dùng 1 lần).

## Brainstorm — ✅ Approve bởi @sonnguyenn10 · 2026-11-09 12:36

Đã duyệt exploration.md, design-brief.md và specs.md (6 Requirements: REQ-ORD-PROMO-01..02, REQ-ORD-BOGO-01..03, REQ-ORD-PRE-01).

## Verify Spec — ✅ Approve bởi @sonnguyenn10 · 2026-11-09 12:39

Đã duyệt bước Verify Spec (Skeptic + Guardian PASS) và kế hoạch 8 tasks T1..T8 trong tasks.md.

## Apply — ✅ Approve bởi @sonnguyenn10 · 2026-11-09 13:09

Hoàn thành 8/8 tasks (T1-T8): mở rộng cột truy vết KM/Voucher/Điểm & Note trên Orders, đồng bộ nguyên tử UsedCount/TotalDiscountGiven và mở khóa Voucher khi hủy đơn, đánh giá BUY_X_GET_Y theo buyProductId + Best-Offer toàn cục, trừ kho FEFO ưu tiên hàng mua trước quà tặng 0đ kèm cảnh báo tồn kho, khóa hoàn 0đ khi đổi trả quà tặng, tự động áp KM và chặn Voucher trên Đơn đặt trước. Đã pass 588/588 Backend tests, npm run build và oxlint 0 lỗi.
