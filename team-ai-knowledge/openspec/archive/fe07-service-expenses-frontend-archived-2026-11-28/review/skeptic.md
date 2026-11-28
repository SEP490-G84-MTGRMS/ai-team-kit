# Skeptic Review: fe07-service-expenses-frontend

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5 | Đặc tả chi tiết 5 Requirements đầy đủ kịch bản chính và edge case (rỗng, sai số tiền, click đúp). |
| D2 Correctness | 5 | Logic nghiệp vụ chi phí vận hành và liên kết Sổ quỹ tiền mặt FE-17 chính xác. |
| D3 Coherence | 5 | Nhất quán 100% giữa proposal, exploration, design-brief và specs.md về DTOs và hành vi UI. |
| D4 Constraints | 5 | Tuân thủ tuyệt đối quy chuẩn KiotViet Design System, React 19, Tailwind CSS v4, Zod và TanStack Query. |
| D5 Blast Radius | 5 | Phạm vi cô lập trong `src/features/service-expenses/`, không gây ảnh hưởng hay breaking change tới các module khác. |

## Vấn đề
- [MEDIUM] REQ-07.1: Modal xem trước hóa đơn (`BillPreviewModal`) cần có cơ chế xử lý Fallback khi ảnh bị lỗi (404 / hỏng đường dẫn URL) để tránh vỡ giao diện. → Đề xuất: Thêm thẻ `img` với sự kiện `onError` chuyển sang hiển thị icon cảnh báo và thông báo "Không thể tải ảnh chứng từ".
- [LOW] REQ-07.1: Ô tìm kiếm từ khóa trên thanh lọc (`ExpenseFilterBar`) nên có debounce 300ms. → Đề xuất: Áp dụng debounce khi người dùng nhập từ khóa tìm kiếm trước khi cập nhật URL query params để giảm tải request API.

## Kết luận: Chấp nhận
Tài liệu đặc tả và thiết kế đã hoàn chỉnh, các vấn đề nêu trên là điểm tối ưu hóa trải nghiệm người dùng và sẽ được đưa trực tiếp vào danh sách thực thi trong `tasks.md`.
