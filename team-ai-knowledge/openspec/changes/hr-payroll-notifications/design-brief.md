# Design Brief: HR & Payroll Notification System

## 1. Luồng người dùng (User Flows)
1. **Nhân viên gửi đơn $\rightarrow$ Chủ cửa hàng nhận thông báo:**
   - `Staff` gửi đơn (`CreateRequestAsync`) $\rightarrow$ Backend lưu `ScheduleApprovalRequest` + ghi `OutboxMessage` (`HR_REQUEST_SUBMITTED`).
   - `NotificationOutboxWorker` tìm các `StoreOwner`/`Admin` của `TenantId` $\rightarrow$ lưu `Notification` + đẩy SignalR tới `tenant:{TenantId}:user:{OwnerUserId}`.
   - `<NotificationBell />` trên `StoreOwnerLayout` tăng badge chưa đọc + hiện Toast; bấm vào chuyển tới `/hr/approval-requests`.
2. **Chủ cửa hàng ban hành/sửa lịch, duyệt đơn hoặc xử lý lương $\rightarrow$ Nhân viên nhận thông báo:**
   - `StoreOwner` gọi `PublishAsync` / `UpdateAsync` / `DeleteAsync` / `ReviewRequestAsync` / `GenerateMonthlyPayrollAsync` / `AdvanceSalaryAsync` / `PayPayslipAsync`.
   - Service ghi `OutboxMessage` tương ứng (gom nhóm theo `EmployeeId` đối với `PublishAsync`).
   - Worker kiểm tra `Employee.UserId != null` $\rightarrow$ lưu `Notification` + đẩy SignalR tới `tenant:{TenantId}:user:{EmployeeUserId}`.
   - `<NotificationBell />` trên `AppTopNav` (`EmployeeLayout`) cập nhật badge; bấm vào đánh dấu đã đọc và điều hướng tới `/employee/my-schedule` hoặc `/employee/my-payslips`.

## 2. Thay đổi Database & Entities
### 2.1. `Notification` (`MT_GRMS.Domain.Entities.System`, kế thừa `BaseTenantEntity`)
- `BranchId` (`Guid?`)
- `RecipientUserId` (`string`, max 64, required)
- `Module` (`string`, max 32: `HR_SCHEDULE` | `HR_APPROVAL` | `HR_PAYROLL`)
- `EventType` (`string`, max 64)
- `Title` (`string`, max 200)
- `Message` (`string`, max 1000)
- `ReferenceType` (`string?`, max 64)
- `ReferenceId` (`Guid?`)
- `ActionUrl` (`string?`, max 300)
- `IsRead` (`bool`, default `false`)
- `ReadAtUtc` (`DateTime?`)
- `MetadataJson` (`string?`)
- **Index:** `(TenantId, RecipientUserId, IsRead, CreatedAt)` để query danh sách & `unreadCount` nhanh.

### 2.2. `NotificationPreference` (`MT_GRMS.Domain.Entities.System`, kế thừa `BaseTenantEntity`)
- `UserId` (`string`, max 64, required)
- `Module` (`string`, max 32)
- `EnableInApp` (`bool`, default `true`)
- `EnableEmail` (`bool`, default `true`)
- **Unique Index:** `(TenantId, UserId, Module)` với `IsDeleted = false`.

## 3. API Endpoints & DTOs (`NotificationsController` - `api/notifications`)
- `GET /api/notifications?module=&isRead=&page=1&pageSize=20` $\rightarrow$ `ApiResponse<PagedResult<NotificationDto>>`
- `GET /api/notifications/unread-count` $\rightarrow$ `ApiResponse<{ unreadCount: number }>`
- `PATCH /api/notifications/{id:guid}/read` $\rightarrow$ `ApiResponse<bool>`
- `PATCH /api/notifications/read-all?module=` $\rightarrow$ `ApiResponse<{ updatedCount: number }>`
- `GET /api/notifications/preferences` $\rightarrow$ `ApiResponse<List<NotificationPreferenceDto>>`
- `PUT /api/notifications/preferences` $\rightarrow$ `ApiResponse<bool>`

## 4. SignalR Hub (`/hubs/notifications`)
- `NotificationHub` gắn `[Authorize]`, đọc `TenantId` và `UserId` từ JWT Claims (hỗ trợ `access_token` query khi handshake WebSocket).
- `OnConnectedAsync()`: `Groups.AddToGroupAsync(Context.ConnectionId, $"tenant:{tenantId}:user:{userId}")`.
- Event đẩy xuống client: `"ReceiveNotification"` kèm `NotificationDto`.

## 5. Frontend Components & Trạng thái UI
- **API & Hook:** `src/features/notifications/api/notificationApi.ts`, `src/features/notifications/hooks/useNotificationHub.ts`.
- **Component `<NotificationBell />`:** Gắn vào `StoreOwnerLayout.tsx` và `AppTopNav.tsx`.
  - **Loading:** Hiển thị spinner/skeleton nhẹ trong popover khi tải lần đầu.
  - **Empty:** Hiển thị trạng thái trống *"Chưa có thông báo nào"* (hoặc *"Không có thông báo chưa đọc"* khi đang lọc).
  - **Error:** Hiển thị thông báo lỗi tải dữ liệu kèm nút *"Thử lại"* (không làm crash layout).
  - **Interactive:** Lọc `Tất cả / Chưa đọc`, nút *"Đánh dấu tất cả đã đọc"*, optimistic update khi click item và điều hướng theo `actionUrl`.

## 6. Quy tắc nghiệp vụ & Phân quyền
- Tất cả endpoint yêu cầu `[Authorize(Roles = SystemRoles.AllStaffAndOwner)]`.
- Mọi truy vấn và cập nhật đều lọc theo `TenantId` hiện tại và `RecipientUserId == CurrentUserId`.
- Nếu nhân viên có `Employee.UserId == null`, Worker bỏ qua bước tạo In-App `Notification`.
- Nếu `NotificationPreference.EnableInApp == false` cho `Module` tương ứng, Worker bỏ qua tạo In-App `Notification`.
