# Skeptic Review: fe08-customer-crm-frontend

| Chiều | Điểm (1–5) | Nhận xét |
|---|:---:|---|
| D1 Completeness | 5/5 | Đầy đủ 5 yêu cầu chức năng cốt lõi (REQ-08.1 đến REQ-08.5). Có đầy đủ kịch bản Scenario chuẩn Gherkin cho cả happy path và edge cases (vượt hạn mức, số nợ âm, sai định dạng SĐT, thu ngân cố tình sửa hạn mức nợ). |
| D2 Correctness | 5/5 | Logic tài chính chính xác: Số tiền thu nợ không được vượt quá số nợ hiện tại (`Amount <= CurrentDebtAR`), hạn mức nợ `DebtLimit` chặn rủi ro nợ xấu, chuẩn VietQR Napas 247 đúng cú pháp `THUNO <SĐT>`. |
| D3 Coherence | 5/5 | Tính nhất quán cao giữa proposal.md, exploration.md, design-brief.md và specs.md; quy ước đặt tên DTO và entity `Customer` thống nhất với hệ thống. |
| D4 Constraints | 5/5 | Đáp ứng đầy đủ ràng buộc Multi-Tenant (`TenantId`), phân quyền RBAC (chỉ StoreOwner/StoreManager mới được cấp hạn mức nợ), định dạng SĐT 10 số, tiền tệ VND `decimal(18,2)`. |
| D5 Blast Radius | 5/5 | Module độc lập ở frontend, tương thích với bảng `Customers` và liên kết với `CashbookTransactions` mà không gây breaking change đến phân hệ POS FE-12 hay Kho vận. |

## Vấn đề
- [MEDIUM] REQ-08.4: Cần đảm bảo khi khách hàng thanh toán VietQR thành công, nếu Webhook ngân hàng chưa kịp về, thu ngân vẫn có nút "Xác nhận tiền đã vào tài khoản" thủ công để không làm nghẽn quầy → Đề xuất: Đã được đưa vào thiết kế Modal với nút xác nhận có lưu Audit Log.
- [LOW] REQ-08.1: Thanh tìm kiếm SĐT cần áp dụng debounce 300ms để tránh trigger quá nhiều filter request liên tục khi người dùng đang gõ phím.

## Kết luận: Chấp nhận
Specs đã hoàn thiện, rõ ràng, sẵn sàng để lập danh sách tasks và chuyển sang bước triển khai (Apply).
