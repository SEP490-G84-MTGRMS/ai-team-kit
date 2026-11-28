# Skeptic Review: schedule-approval-requests

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 6 requirements chi tiết, kịch bản Gherkin rõ ràng bao quát cả 4 loại yêu cầu (Leave, Swap, Incident, Overtime) và các edge cases. |
| D2 Correctness | 5/5 | Logic nghiệp vụ chính xác: Phân biệt rõ đổi chéo ca (hoán đổi EmployeeId) và nhờ làm thay (chuyển giao EmployeeId). Giờ công OT và sự cố FaceID được đồng bộ ngược lại ca gốc. |
| D3 Coherence | 5/5 | Thống nhất 100% kiến trúc 1-N và Enums chuẩn hóa giữa proposal, design-brief, specs và mã nguồn hiện hữu. |
| D4 Constraints | 5/5 | Đảm bảo tính toàn vẹn: Chặn nghiêm ngặt ca đã chốt lương (`PayslipId != null`), bảo mật đa tenant (`TenantId`), phân quyền rõ ràng giữa STAFF và STORE_OWNER. |
| D5 Blast Radius | 4/5 | Việc thêm trạng thái `OnLeave` và quan hệ 1-N cần chú ý cập nhật giao diện hiển thị lịch làm việc để render đúng màu sắc và badge cho ca. |

## Vấn đề
- [MEDIUM] REQ-02: Quy tắc duyệt đơn Đổi ca khi đồng nghiệp chưa bấm xác nhận trên app (`PeerConfirmed == false`): Cần cho phép Quản lý (STORE_OWNER) có quyền ghi đè (override) duyệt trực tiếp nếu hai bên đã thỏa thuận miệng tại cửa hàng, hệ thống vẫn lưu log người duyệt. → Đã ghi nhận và bổ sung vào logic duyệt của Quản lý.
- [LOW] REQ-03: Cần quy định mã màu giao diện đồng bộ cho ca `OnLeave` (khuyến nghị màu tím nhạt hoặc xám kèm badge [Nghỉ phép]) để tránh nhầm với ca hủy bỏ (`Cancelled`).

## Kết luận: Chấp nhận (Không có vấn đề HIGH)
