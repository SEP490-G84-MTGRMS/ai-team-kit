# Skeptic Review: product-management-ui

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ đầy đủ kịch bản REQ-05, REQ-06, REQ-07 cho Đơn vị tính và Hàng cùng loại |
| D2 Correctness | 5/5 | Logic quy đổi tỷ lệ, giá vốn tự tính `costPrice * rate`, giá bán riêng biệt chính xác |
| D3 Coherence | 5/5 | Khớp 100% giữa thiết kế mockup, design-brief.md và specs.md |
| D4 Constraints | 5/5 | Tuân thủ BR-SEC-01 (phân quyền giá vốn theo role), validation không cho thêm ĐVT khi chưa có ĐVT cơ bản |
| D5 Blast Radius | 5/5 | Phạm vi cô lập trong `ProductFormModal.tsx` và `ProductListPage.tsx`, không gây breaking change API |

## Vấn đề đã ghi nhận & Xử lý
- [MEDIUM] REQ-06: Khi xóa toàn bộ đơn vị quy đổi (`uomConversions.length === 0`), bảng "Hàng cùng loại" nên tự động ẩn để giữ giao diện gọn gàng. → **Đã xử lý**: Bảng chỉ render khi `uomConversions.length > 0`.
- [MEDIUM] REQ-07: Quản lý state mở popup dropdown trên `ProductListPage` phải theo ID sản phẩm (`activeDropdownProductId`), tránh mở đồng thời hoặc nhầm dòng. → **Đã xử lý**: Sử dụng state `activeUnitDropdownId` kèm click-outside listener để đóng dropdown khi click ra ngoài.
- [LOW] REQ-05: Khi nút `+ Thêm đơn vị` bị disabled, nên hiển thị title tooltip để người dùng biết lý do cần nhập tên đơn vị cơ bản. → **Đã xử lý**: Thêm tooltip và thông báo lỗi rõ ràng.

## Kết luận: Chấp nhận
Đặc tả kỹ thuật hoàn toàn sẵn sàng để tiến hành lập task và triển khai code.
