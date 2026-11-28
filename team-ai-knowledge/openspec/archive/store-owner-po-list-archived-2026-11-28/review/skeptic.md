# Skeptic Review: store-owner-po-list

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 5 REQ bao quát toàn bộ Data Table, Unified Filter Bar, Paging Footer, Slide-over Drawer và Status Badges. Có kịch bản chính và edge case rỗng/không tìm thấy. |
| D2 Correctness | 5/5 | Logic nghiệp vụ vòng đời PO chuẩn xác (SENT -> CONFIRMED -> PARTIALLY_RECEIVED -> RECEIVED, CANCELLED). Định dạng số tiền VNĐ và phân trang chuẩn. |
| D3 Coherence | 5/5 | Đồng nhất hoàn hảo giữa proposal.md, exploration.md, design-brief.md và specs.md; kế thừa trung thành prototype po_list.html và nâng chuẩn SaaS ERP. |
| D4 Constraints | 5/5 | Tuân thủ tuyệt đối quy tắc coding frontend của MT-GRMS: font chữ, biến màu CSS theme tokens, bố cục edge-to-edge không xén viền. |
| D5 Blast Radius | 5/5 | Phạm vi biệt lập trong feature purchase-order, route mới không ảnh hưởng đến ma trận đặt hàng hay trung tâm chốt đơn cutoff hub. |

## Vấn đề
- [MEDIUM] Logic reset phân trang khi áp dụng bộ lọc mới: Khi người dùng đang ở trang 3 mà lọc lại theo một chi nhánh chỉ có 1 trang, có thể bị rơi vào trang trống nếu không reset.
  → Đề xuất: Đảm bảo handler tìm kiếm và thay đổi bộ lọc tự động gán `pageIndex = 1`. (Đã ghi nhận vào tasks thực hiện).
- [LOW] Phím tắt Esc và backdrop đóng nhanh Drawer: Cần đảm bảo trải nghiệm đóng ngăn kéo chi tiết bằng phím Esc hoặc click overlay mượt mà. (Đã bao hàm trong Scenario REQ-04).

## Kết luận: Chấp nhận
Không có vấn đề mức HIGH. Đặc tả sẵn sàng để lập kế hoạch triển khai (tasks.md).
