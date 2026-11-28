# Guardian Review: hr-payroll-notifications

| Hạng mục | Tình trạng (OK / Rủi ro / Thiếu) | Ghi chú |
|---|---|---|
| Multi-tenant | OK | `Notification` và `NotificationPreference` kế thừa `BaseTenantEntity`; mọi query và SignalR group đều lấy `TenantId` + `UserId` từ JWT Claims/`ITenantContext`. |
| AuthN/AuthZ | OK | `NotificationsController` và `NotificationHub` gắn `[Authorize]`; `MarkAsRead` kiểm tra `RecipientUserId == CurrentUserId && TenantId == CurrentTenantId`. |
| Validation | OK | Giới hạn `page`/`pageSize`, validate `Module` hợp lệ (`HR_SCHEDULE`, `HR_APPROVAL`, `HR_PAYROLL`) khi cập nhật preferences. |
| Toàn vẹn dữ liệu | OK | Ghi `OutboxMessage` trong cùng `UnitOfWork` của nghiệp vụ chính; chống trùng bằng `IdempotencyKey`; bỏ qua an toàn khi `Employee.UserId == null`. |
| Vận hành & audit | OK | Lỗi trả chuẩn `ApiResponse` / ProblemDetails; Worker log lỗi và retry có backoff, không làm fail API chính. |

## Vấn đề
- [MEDIUM] SignalR `access_token` qua query string → Đề xuất: Chỉ chấp nhận đọc `access_token` từ query string khi request path bắt đầu bằng `/hubs/notifications` trong `Program.cs`, giữ nguyên header `Authorization` cho toàn bộ REST API.

## Kết luận: An toàn
