# Skeptic Review: hr-payroll-notifications

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 4 | Đủ 6 REQ bao phủ các sự kiện HR & Payroll, có scenario cho `UserId == null`, retry idempotency, empty/error UI. Nên bổ sung thêm scenario cho `NotificationPreference` (`EnableInApp = false` và invalid `Module`). |
| D2 Correctness | 5 | Luồng Transactional Outbox tách khỏi transaction chính, gom nhóm `PublishAsync` theo `EmployeeId`, logic `IdempotencyKey` chính xác. |
| D3 Coherence | 5 | `proposal.md`, `exploration.md`, `design-brief.md` và `specs.md` khớp hoàn toàn về tên bảng, endpoint, role và `EventType`. |
| D4 Constraints | 4 | Tuân thủ Multi-Tenant (`TenantId`), `BaseTenantEntity`, SignalR group theo JWT Claims. Cần lưu ý cấu hình `JwtBearerEvents.OnMessageReceived` cho `/hubs/notifications`. |
| D5 Blast Radius | 5 | Chỉ thêm bảng mới (`Notifications`, `NotificationPreferences`) và chèn `OutboxMessage` không làm breaking change các API HR hiện tại. |

## Vấn đề
- [MEDIUM] REQ-01 / API Preferences: Bảng API có `GET/PUT /api/notifications/preferences` nhưng chưa có Scenario riêng cho trường hợp tắt `EnableInApp = false` hoặc truyền `Module` không hợp lệ (`400`) → Đề xuất: Lưu ý bổ sung test case & FluentValidation cho `Module` (`HR_SCHEDULE`, `HR_APPROVAL`, `HR_PAYROLL`) khi implement.
- [MEDIUM] REQ-06 SignalR WebSocket Auth: Trình duyệt gửi JWT qua query `?access_token=...` khi kết nối `/hubs/notifications` → Đề xuất: Bổ sung `JwtBearerEvents.OnMessageReceived` trong `Program.cs` đọc `access_token` chỉ khi path bắt đầu bằng `/hubs/notifications`.
- [LOW] REQ-03 `HR_ATTENDANCE_REMINDER`: Job nhắc ca định kỳ cần `IdempotencyKey` theo `(ScheduleId, ReminderType)` để tránh nhắc lặp nhiều lần trong cùng một ca → Đề xuất: Dùng format `HR_ATT_REMINDER_{IN|OUT}:{ScheduleId}`.

## Kết luận: Chấp nhận
Không có vấn đề `HIGH`. Các điểm `MEDIUM`/`LOW` đã được đưa thẳng thành task cụ thể trong `tasks.md` để xử lý triệt để khi apply.
