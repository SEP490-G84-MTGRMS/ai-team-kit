# Skeptic Review: pos-shift-ui-role-and-cash-approval

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Bao quát đầy đủ 6 yêu cầu: Phân quyền vai trò, kế thừa tiền ca trước, kiểm tra hạn mức 200k & pending approval, drawer duyệt của Chủ, kiểm đếm 9 mệnh giá & khóa chốt ca, cài đặt hạn mức. |
| D2 Correctness | 5/5 | Bất biến kế toán $Retained + Dropped = H$ được tôn trọng. Công thức tính tiền lý thuyết $G$ và đối soát chênh lệch $\Delta = H - G$ chuẩn xác. |
| D3 Coherence | 5/5 | Nhất quán giữa proposal.md, exploration.md, design-brief.md và specs.md. Thuật ngữ thống nhất. |
| D4 Constraints | 5/5 | Đảm bảo bảo mật đa tenant, phân quyền rõ ràng qua role Owner vs Cashier, backend quyết định Status phê duyệt thay vì tin tưởng client. |
| D5 Blast Radius | 4.5/5 | Giới hạn trong phân hệ POS Shift và Cash Movements, không gây ảnh hưởng hay breaking change lên quy trình thanh toán bán hàng cơ bản. |

## Vấn đề
- [MEDIUM] REQ-POS-CASH-03: Cần đảm bảo nhân viên chỉ có thể hủy yêu cầu của chính mình khi đang ở trạng thái `PendingApproval`, không được hủy phiếu của nhân viên khác hoặc phiếu đã duyệt.
  → Đề xuất: Endpoint `POST /api/pos/cash-movements/{id}/cancel` tại Backend xác thực `CreatedBy == currentUserId` và `Status == CashMovementStatus.PendingApproval`.
- [LOW] REQ-POS-CONFIG-06: Trường hợp cửa hàng mới chưa cấu hình hạn mức chi.
  → Đề xuất: Backend tự động fallback về giá trị mặc định 200.000 VNĐ nếu chưa có record cấu hình trong DB.

## Kết luận: Chấp nhận
Spec rõ ràng, logic chặt chẽ, đầy đủ kịch bản, sẵn sàng tạo tasks và triển khai code.
