# Skeptic Review: pos-sales-checkout-ui

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | 6 Requirements đã bao phủ 100% chức năng từ `POS_Ban_Hang.html` và `Mau_In_Hoa_Don_K80.html`. Các kịch bản edge case (giỏ hàng rỗng, mã vạch không có trong hệ thống, bán dưới giá vốn, đổi tab không mất dữ liệu) đã được nêu rõ ràng. |
| D2 Correctness | 5/5 | Logic tính tiền, công thức giảm giá, tích lũy điểm và tính tiền thừa chính xác. Dữ liệu khớp hoàn toàn với Master Database Schema & ERD. |
| D3 Coherence | 5/5 | Thống nhất thuật ngữ và cấu trúc dữ liệu giữa Proposal, Design Brief và Specs. |
| D4 Constraints | 5/5 | Cơ chế kiểm soát phân quyền qua mã PIN Quản lý (FE-03.2), tuân thủ bảng màu Deep Teal `#0F766E` và tái sử dụng component phân trang có sẵn. |
| D5 Blast Radius | 5/5 | Xây dựng trong feature module độc lập `src/features/pos/` và route `/pos`, không gây xung đột tới các màn hình hiện có. |

## Vấn đề
- [MEDIUM] REQ-POS-03: Cần đảm bảo ô nhập số lượng sản phẩm không cho phép nhập số âm hoặc 0 (tối thiểu là 1; nếu muốn xóa phải ấn nút [X]). → Đề xuất: Ràng buộc `min={1}` và tự động reset về 1 nếu người dùng xóa trắng ô input.
- [LOW] REQ-POS-06: Cần bổ sung cờ CSS ẩn toàn bộ Header và Sidebar khi người dùng kích hoạt lệnh in `window.print()` để hóa đơn nhiệt K80 ra giấy sạch đẹp chuẩn 80mm. → Đề xuất: Thêm style `@media print` trong `pos.css`.

## Kết luận: Chấp nhận
Specs đã sẵn sàng để lập kế hoạch tasks và triển khai code.
