# Skeptic Review: employee-management-backend

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 5 REQ trọng tâm tương ứng 5 cụm chức năng. Có đầy đủ kịch bản chuẩn và các edge cases: trùng CCCD/SĐT, xung đột ca cùng ngày, chấm công ngoài bán kính GPS, đóng ca thiếu giải trình lệch tiền, và khởi tạo đúp bảng lương. |
| D2 Correctness | 5/5 | Logic tính độ lệch tiền két tuân thủ chuẩn `GBR-POS-04`, công thức Haversine tính khoảng cách GPS chính xác, công thức lương NetSalary chuẩn TO-BE Swimlane, cơ chế hạch toán tự động vào Sổ quỹ qua `ICashbookService` chính xác. |
| D3 Coherence | 5/5 | Nhất quán 100% giữa proposal, exploration, design-brief và specs về thuật ngữ, vai trò người dùng (Owner, Manager, Cashier, Staff), DTOs và 5 Endpoints/Controllers. |
| D4 Constraints | 5/5 | Đảm bảo tính cô lập Multi-tenant (`TenantId`), tiền tệ decimal(18,2), chuẩn thời gian UTC khi lưu DB và bảo vệ phân quyền theo RBAC. |
| D5 Blast Radius | 5/5 | Tác động an toàn: mở rộng Domain HR và Finance bằng các dịch vụ độc lập, tái sử dụng `ICashbookService` có sẵn mà không làm ảnh hưởng đến các module Sales hay Inventory. |

## Vấn đề & Ghi chú
- [MEDIUM] Đảm bảo tính Idempotent khi duyệt ca và thanh toán lương: Nếu người dùng gửi request duyệt ca hoặc thanh toán phiếu lương nhiều lần, hệ thống MUST kiểm tra trạng thái (`IsAudited == true` hoặc `Status == 'PAID'`) để từ chối ngay lập tức, ngăn ngừa sinh đúp phiếu thu/chi trên Sổ quỹ. → *Đã thể hiện trong Scenario REQ-04 và REQ-05*.
- [LOW] Lưu trữ chi tiết 9 mệnh giá tiền mặt: Khi đóng ca POS, ngoài tổng tiền đếm được, nên lưu chuỗi JSON chi tiết số lượng từng mệnh giá vào trường `DenominationDetailsJson` của `ShiftZReport` để phục vụ tra cứu lịch sử kiểm đếm. → *Đã cập nhật trong Design Brief*.

## Kết luận: Chấp nhận
Specs đã sẵn sàng để chuyển sang lập kế hoạch thực thi (tasks.md).
