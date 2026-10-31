# Skeptic Review: product-management-ui

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 4.5 | Đã bao phủ đầy đủ các kịch bản chuyển đổi đơn vị cơ bản & quy đổi, edge case không có đơn vị quy đổi, mã vạch/mã hàng null. |
| D2 Correctness | 5.0 | Công thức tính quy đổi tồn kho nguyên, số lượng lẻ, giá vốn theo tỷ lệ quy đổi hoàn toàn chính xác. |
| D3 Coherence | 5.0 | Thống nhất 100% giữa proposal, exploration, design-brief và specs delta (REQ-01 -> REQ-08). |
| D4 Constraints | 5.0 | Tôn trọng nghiêm ngặt quy tắc bảo mật giá vốn BR-SEC-01 (chỉ StoreOwner mới thấy giá vốn cơ bản & giá vốn quy đổi). |
| D5 Blast Radius | 5.0 | Thay đổi cô lập (surgical) trong `ProductDetailModal.tsx`, không gây breaking change cho các màn hình khác hoặc API backend. |

## Vấn đề đã ghi nhận & Xử lý
- [LOW] REQ-08: Cần lưu ý khi `product.onHand` nhỏ hơn `conversionRate` (ví dụ có 10 chai mà 1 thùng = 24 chai) thì số thùng là 0 và số chai lẻ là 10. → Đề xuất: Hiển thị rõ `0 thung (còn dư 10 chai)` để tránh nhân viên hiểu nhầm là hết hàng trong kho.
- [LOW] REQ-08: Khi `uom.productCode` bị null hoặc rỗng → Đề xuất: Fallback về `product.productCode` chính để luôn có mã hàng hiển thị.

## Kết luận: Chấp nhận
Specs REQ-08 đã rõ ràng, chặt chẽ và sẵn sàng để lập tasks và thực thi code.
