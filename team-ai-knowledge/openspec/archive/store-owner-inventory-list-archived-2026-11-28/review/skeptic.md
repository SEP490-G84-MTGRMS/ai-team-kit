# Skeptic Review: store-owner-inventory-list

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 6 Requirements từ REQ-01 đến REQ-06, bao gồm 5 thẻ KPI, bộ lọc đa tiêu chí, bảng dữ liệu 16 cột, Drawer FEFO lô date, và phân quyền navigation. Đã có đủ kịch bản GIVEN/WHEN/THEN cho từng requirement. |
| D2 Correctness | 5/5 | Logic tính toán chuẩn xác: `Available = Math.max(0, onHand - committed)` ngăn chặn số âm; định giá `ItemTotalValue = onHand * avgCost` chuẩn; phân loại trạng thái tồn `Out of Stock / Low Stock / OK` chặt chẽ theo reorder point. |
| D3 Coherence | 5/5 | Sự đồng bộ cao giữa proposal.md, design-brief.md và specs.md. Thuật ngữ tồn kho (On-hand, Committed, Available, On-Order, Reorder Point, Avg Cost) thống nhất với prototype và nghiệp vụ bán lẻ MT-GRMS. |
| D4 Constraints | 5/5 | Tuân thủ tuyệt đối quy định kiến trúc: tạo module riêng `src/features/inventory/`, không can thiệp hay làm ảnh hưởng màn hình POS của thu ngân, dùng pure Tailwind CSS và React 19 component hóa sạch sẽ. |
| D5 Blast Radius | 5/5 | Rủi ro rất thấp (Low Blast Radius). Chỉ thêm module mới và đăng ký route `/store-owner/inventory` cùng 1 liên kết menu trong `AppTopNav.tsx`. Không gây breaking changes cho bất kỳ chức năng hiện hữu nào. |

## Vấn đề
- [MEDIUM] Trạng thái rỗng (Empty State) & Xử lý số liệu an toàn: Khi bộ lọc không tìm thấy sản phẩm nào, bảng cần hiển thị Empty State thân thiện ("Không tìm thấy sản phẩm tồn kho nào khớp với điều kiện lọc") và các thẻ KPI hiển thị `0` an toàn thay vì NaN.
  → Đề xuất: Bổ sung component/giao diện Empty State trong `InventoryTable` và giá trị fallback mặc định 0 cho 5 KPI card.
- [LOW] Reset trang khi đổi bộ lọc: Khi người dùng đổi Chi nhánh, Ngành hàng hoặc gõ tìm kiếm, trang hiện tại (`pageIndex`) cần tự động nhảy về trang 1.
  → Đề xuất: Trong state hook của `InventoryFilterBar`, tự động set `pageIndex: 1` khi bất kỳ filter nào thay đổi.

## Kết luận: Chấp nhận
Specs đã sẵn sàng để lập `tasks.md` và tiến hành hiện thực hóa code UI.
