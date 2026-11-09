# Improvements: pos-order-promo-audit-bogo-and-preorder-promo

## Test · 2026-11-09 13:32

Khi thiết kế ưu đãi BOGO (Mua X tặng Y), luôn tách biệt dòng quà tặng theo OrderDetailId (itemId) từ Backend tới UI Đổi/Trả để tránh hoàn tiền nhầm khi quà tặng trùng mã với hàng mua chính, đồng thời kiểm tra giao thực tế > 0 trước khi tăng UsedCount.
