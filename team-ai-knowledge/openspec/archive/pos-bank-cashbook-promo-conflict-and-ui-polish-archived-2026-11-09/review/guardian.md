# Guardian Review: pos-bank-cashbook-promo-conflict-and-ui-polish

| Hạng mục | Tình trạng (OK / Rủi ro / Thiếu) | Ghi chú |
|---|---|---|
| Multi-tenant | OK | Xóa bỏ hoàn toàn việc fallback sang `DefaultBankId` của Tenant mặc định; mọi truy vấn và khởi tạo `FinanceAccountType.Bank` đều gắn chặt với `TenantId` của phiên đăng nhập hiện tại và dùng `Guid.NewGuid()`. |
| AuthN/AuthZ | OK | Giữ nguyên phân quyền JWT và kiểm tra ca làm việc / vai trò thu ngân trên `POST /api/v1/pos/orders` và các API danh mục, khuyến mãi. |
| Validation | OK | Chặn gọi `ReceiveCashAsync` khi `finalAmount == 0` để tránh lỗi `INVALID_AMOUNT`; giới hạn tổng chiết khấu không bao giờ vượt quá `SubTotal` (không âm tiền hóa đơn). |
| Toàn vẹn dữ liệu | OK | Tái sử dụng tài khoản `Bank` đang active nếu đã tồn tại (chống sinh trùng lặp); không sửa đổi dữ liệu lịch sử hay bảng kế toán thuế TT152. |
| Vận hành & audit | OK | Bút toán thu `POS_SALE` ghi đầy đủ `OrderId`, `OrderCode`, `OccurredAtUtc` và chữ ký băm kiểm toán (`AuditHashService`) trong `CashbookService`. |

## Vấn đề
- Không có vấn đề mức HIGH. Hai lưu ý mức MEDIUM về gán tường minh `TenantId` và kẹp trần `BudgetLimit` còn lại đã được cập nhật đầy đủ vào `specs.md`.

## Kết luận: An toàn
