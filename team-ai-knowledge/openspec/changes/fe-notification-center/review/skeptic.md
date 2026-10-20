# Skeptic Review: fe-notification-center

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ 5 requirements với đầy đủ scenario GIVEN/WHEN/THEN và các edge cases quan trọng (chưa đọc = 0, trên 99 tin, chống bubbling event, reload F5). |
| D2 Correctness | 5/5 | Logic liên kết nghiệp vụ với 5 phân hệ cốt lõi MT-GRMS (FE-02, FE-07, FE-08, FE-17, FE-19) hoàn toàn chính xác. |
| D3 Coherence | 5/5 | Đồng nhất hoàn toàn giữa proposal, exploration, design brief và delta specs; thuật ngữ và cấu trúc component khớp 100%. |
| D4 Constraints | 4.5/5 | Tuân thủ TypeScript strict mode, responsive, hiệu năng render danh sách mượt mà; cần chú ý z-index của popover và drawer. |
| D5 Blast Radius | 5/5 | Bổ sung module độc lập tại `src/features/notifications/` và nhúng vào `AppTopNav.tsx`, không gây breaking change đến bất kỳ trang hiện có nào. |

## Vấn Đề & Khuyến Nghị
- [MEDIUM] REQ-NOTIF-02: Popover cần có cơ chế click-outside chuẩn xác để khi người dùng click ra vùng khác hoặc click chọn chi nhánh thì Popover tự đóng lại mà không gây xung đột.
  → *Đề xuất:* Sử dụng ref kết hợp listener `mousedown` trên document để bắt sự kiện click-outside an toàn.
- [LOW] REQ-NOTIF-03: Cần có helper tính thời gian tương đối (`formatRelativeTime`) hiển thị tiếng Việt thân thiện ("vừa xong", "5 phút trước", "hôm qua") thay vì hiển thị raw timestamp.
  → *Đề xuất:* Viết helper hàm nhỏ xử lý chênh lệch thời gian so với `Date.now()`.

## Kết luận: Chấp nhận
Spec đã hoàn thiện, rõ ràng, sẵn sàng để lập kế hoạch task và tiến hành triển khai code.
