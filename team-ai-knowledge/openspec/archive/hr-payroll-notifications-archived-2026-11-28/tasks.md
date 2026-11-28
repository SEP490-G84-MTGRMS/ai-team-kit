# Tasks: hr-payroll-notifications

## DB & Domain
- [ ] T1 — Tạo Domain entities `Notification` và `NotificationPreference` trong `MT_GRMS.Domain.Entities.System` kế thừa `BaseTenantEntity` (REQ-01)
- [ ] T2 — Tạo EF Core configurations (`NotificationConfiguration`, `NotificationPreferenceConfiguration` với index `(TenantId, RecipientUserId, IsRead, CreatedAt)` và unique index `(TenantId, UserId, Module)`), thêm `DbSet` vào `AppDbContext` và tạo EF Core migration mới (REQ-01)

## Backend (Application, Infrastructure & API)
- [ ] T3 — Tạo DTOs, Validators (`Module`, `page`, `pageSize`), `INotificationRepository`, `INotificationService` và `NotificationService` (phân trang, `GetUnreadCountAsync`, `MarkAsReadAsync` kiểm tra ownership, `MarkAllAsReadAsync`, `GetPreferencesAsync`, `UpdatePreferencesAsync`) (REQ-01)
- [ ] T4 — Tạo `INotificationPublisher` / helper ghi `OutboxMessage` (kèm `IdempotencyKey` chống trùng) và tích hợp vào `ScheduleService` (`PublishAsync` gom nhóm theo `EmployeeId`, `UpdateAsync`, `DeleteAsync`), `ScheduleApprovalService` (`CreateRequestAsync`, `ReviewRequestAsync`), và `PayslipService` (`GenerateMonthlyPayrollAsync`, `AdvanceSalaryAsync`, `PayPayslipAsync`, `BatchPayPayslipsAsync`) (REQ-02, REQ-03, REQ-04, REQ-05)
- [ ] T5 — Tạo `NotificationOutboxWorker` (`BackgroundService` xử lý `OutboxMessages` nhóm `HR_*`, kiểm tra `UserId != null` và `NotificationPreference.EnableInApp`, lưu `Notification` và đẩy real-time qua `IHubContext<NotificationHub>` + job nhắc ca `HR_ATTENDANCE_REMINDER` idempotent) (REQ-02, REQ-03, REQ-04, REQ-05)
- [ ] T6 — Tạo `NotificationHub` (`/hubs/notifications`, group `tenant:{TenantId}:user:{UserId}`), `NotificationsController` (`api/notifications`) và đăng ký DI + SignalR + `JwtBearerEvents.OnMessageReceived` trong `Program.cs` (REQ-01, REQ-06)

## Frontend
- [ ] T7 — Tạo `src/features/notifications/types/index.ts`, `notificationApi.ts` và hook `useNotificationHub.ts` (kết nối `/hubs/notifications`, nhận `ReceiveNotification`) (REQ-06)
- [ ] T8 — Tạo component `<NotificationBell />` (badge chưa đọc, popover lọc `Tất cả / Chưa đọc`, loading/empty/error + thử lại, `MarkAsRead`, `MarkAllAsRead`, điều hướng `actionUrl`) và gắn vào `StoreOwnerLayout.tsx` + `AppTopNav.tsx` (REQ-06)

## Test
- [ ] T9 — Viết unit/integration tests cho `NotificationService` (cô lập Tenant/User), `NotificationOutboxWorker` (idempotency, `UserId == null`, gom nhóm `PublishAsync`, `EnableInApp == false`) và chạy `dotnet test` + `npm run build` / `npm run lint` ở Frontend (REQ-01..REQ-06)
