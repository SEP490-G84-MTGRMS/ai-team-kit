# Specs: hr-payroll-notifications

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| GET | `/api/notifications` | Query: `module?`, `isRead?`, `page`, `pageSize` | `ApiResponse<PagedResult<NotificationDto>>` | 401 |
| GET | `/api/notifications/unread-count` | — | `ApiResponse<UnreadCountDto>` | 401 |
| PATCH | `/api/notifications/{id:guid}/read` | Route: `id` | `ApiResponse<bool>` | 401, 403, 404 |
| PATCH | `/api/notifications/read-all` | Query: `module?` | `ApiResponse<MarkAllReadResultDto>` | 401 |
| GET | `/api/notifications/preferences` | — | `ApiResponse<List<NotificationPreferenceDto>>` | 401 |
| PUT | `/api/notifications/preferences` | Body: `List<UpdateNotificationPreferenceDto>` | `ApiResponse<bool>` | 400, 401 |
| WS/Hub | `/hubs/notifications` | JWT Bearer (`access_token` query / Header) | Event `ReceiveNotification(NotificationDto)` | 401 |

## ADDED Requirements

### Requirement: REQ-01 Multi-Tenant Notification Storage & Isolation
Hệ thống MUST lưu trữ `Notification` và `NotificationPreference` gắn `TenantId` và `RecipientUserId`, và mọi truy vấn/cập nhật MUST lọc theo `TenantId` và `UserId` của người dùng đang đăng nhập.

#### Scenario: Truy vấn danh sách thông báo của người dùng hiện tại
- **GIVEN** người dùng A thuộc Tenant T1 có 3 thông báo (2 chưa đọc, 1 đã đọc) và người dùng B thuộc Tenant T2 có 2 thông báo
- **WHEN** người dùng A gọi `GET /api/notifications?page=1&pageSize=20`
- **THEN** hệ thống trả về đúng 3 thông báo của người dùng A trong Tenant T1, sắp xếp mới nhất trước.

#### Scenario: Chặn truy cập thông báo của người dùng hoặc Tenant khác
- **GIVEN** thông báo N1 thuộc về `RecipientUserId = U2` (hoặc thuộc `TenantId = T2`)
- **WHEN** người dùng U1 (thuộc Tenant T1) gọi `PATCH /api/notifications/{N1.Id}/read`
- **THEN** hệ thống từ chối với HTTP `403 Forbidden` hoặc `404 Not Found` và không thay đổi trạng thái `IsRead` của N1.

### Requirement: REQ-02 Transactional Outbox & Idempotent Processing
Hệ thống MUST ghi `OutboxMessage` trong cùng `UnitOfWork` của các nghiệp vụ HR & Payroll (`ScheduleService`, `ScheduleApprovalService`, `PayslipService`) và `NotificationOutboxWorker` MUST xử lý bất đồng bộ kèm kiểm tra `IdempotencyKey` để không tạo trùng `Notification`.

#### Scenario: Nghiệp vụ gốc vẫn thành công khi xử lý thông báo lỗi
- **GIVEN** Store Owner phê duyệt đơn nghỉ phép (`ReviewRequestAsync`)
- **WHEN** transaction nghiệp vụ commit thành công nhưng SignalR Hub tạm thời không khả dụng
- **THEN** đơn nghỉ phép vẫn được lưu ở trạng thái `Approved`, `OutboxMessage` được giữ lại để Worker retry mà không làm rollback giao dịch duyệt đơn.

#### Scenario: Chống trùng lặp thông báo khi Worker retry
- **GIVEN** một `OutboxMessage` có `IdempotencyKey = "HR_PAYSLIP_PAID:{PayslipId}"` đã được xử lý tạo `Notification`
- **WHEN** Worker chạy lại cùng `IdempotencyKey` đó
- **THEN** hệ thống không tạo thêm bản ghi `Notification` trùng lặp cho người nhận.

### Requirement: REQ-03 HR Schedule & Attendance Notifications
Hệ thống SHALL phát sinh thông báo khi lịch làm việc được ban hành (`HR_SCHEDULE_PUBLISHED`), cập nhật/hủy (`HR_SCHEDULE_UPDATED`) và nhắc nhở chấm công (`HR_ATTENDANCE_REMINDER`), đồng thời MUST gom nhóm theo từng `EmployeeId` khi ban hành hàng loạt.

#### Scenario: Ban hành lịch hàng loạt gom nhóm thông báo theo nhân viên
- **GIVEN** Store Owner ban hành 14 ca làm việc cho 2 nhân viên có tài khoản `UserId`
- **WHEN** `ScheduleService.PublishAsync` hoàn tất
- **THEN** hệ thống tạo đúng 1 thông báo tổng hợp cho mỗi nhân viên kèm số lượng ca và liên kết `/employee/my-schedule`.

#### Scenario: Bỏ qua In-App Notification cho nhân viên chưa có tài khoản đăng nhập
- **GIVEN** nhân viên E1 có `UserId == null` được phân công hoặc tính lương
- **WHEN** Worker xử lý sự kiện liên quan tới E1
- **THEN** Worker bỏ qua việc tạo bản ghi In-App `Notification` cho E1 mà không ném ngoại lệ làm gián đoạn các nhân viên khác.

### Requirement: REQ-04 Schedule Approval Request Notifications
Hệ thống SHALL thông báo tới `StoreOwner`/`Admin` khi nhân viên gửi đơn mới (`HR_REQUEST_SUBMITTED`) và thông báo kết quả tới nhân viên khi đơn được duyệt (`HR_REQUEST_APPROVED`) hoặc từ chối (`HR_REQUEST_REJECTED`).

#### Scenario: Nhân viên gửi đơn xin nghỉ / OT / đổi ca / sự cố
- **GIVEN** nhân viên có ca làm việc hợp lệ gửi đơn qua `ScheduleApprovalService.CreateRequestAsync`
- **WHEN** đơn được lưu ở trạng thái `Pending`
- **THEN** các tài khoản `StoreOwner`/`Admin` thuộc cùng Tenant nhận được thông báo `HR_REQUEST_SUBMITTED` với `ActionUrl` trỏ tới `/hr/approval-requests?id={RequestId}`.

#### Scenario: Chủ cửa hàng duyệt hoặc từ chối đơn
- **GIVEN** đơn `Pending` được Chủ cửa hàng xử lý qua `ScheduleApprovalService.ReviewRequestAsync`
- **WHEN** `IsApproved = true` (hoặc `false`)
- **THEN** nhân viên gửi đơn (nếu có `UserId`) nhận thông báo `HR_REQUEST_APPROVED` (hoặc `HR_REQUEST_REJECTED` kèm `ReviewNote`).

### Requirement: REQ-05 Payroll Notifications
Hệ thống SHALL phát sinh thông báo cho nhân viên khi phiếu lương được khởi tạo (`HR_PAYSLIP_GENERATED`), tạm ứng (`HR_PAYSLIP_ADVANCED`) và thanh toán (`HR_PAYSLIP_PAID`).

#### Scenario: Thanh toán phiếu lương phát thông báo kèm mã phiếu chi
- **GIVEN** phiếu lương kỳ `2026-11` ở trạng thái `Unpaid` của nhân viên có `UserId`
- **WHEN** Store Owner thanh toán thành công qua `PayslipService.PayPayslipAsync` sinh mã `PC-000123`
- **THEN** nhân viên nhận được thông báo `HR_PAYSLIP_PAID` chứa số tiền thực nhận và mã phiếu chi `PC-000123` dẫn tới `/employee/my-payslips?id={PayslipId}`.

### Requirement: REQ-06 Real-Time SignalR Delivery & Frontend Bell UI
Hệ thống SHALL đẩy thông báo tức thời qua `NotificationHub` (`/hubs/notifications`) theo group `tenant:{TenantId}:user:{UserId}` và hiển thị `<NotificationBell />` trên `StoreOwnerLayout` và `AppTopNav`.

#### Scenario: Cập nhật badge chưa đọc real-time và đánh dấu đã đọc khi click
- **GIVEN** người dùng đang đăng nhập trên giao diện web và kết nối thành công tới `/hubs/notifications`
- **WHEN** server đẩy sự kiện `ReceiveNotification` tới đúng group của người dùng
- **THEN** số lượng badge chưa đọc trên `<NotificationBell />` tăng ngay lập tức, hiển thị Toast, và khi người dùng bấm vào item thì gọi `PATCH /api/notifications/{id}/read` rồi điều hướng tới `actionUrl`.

#### Scenario: Danh sách thông báo trống hoặc lỗi tải dữ liệu trên UI
- **GIVEN** người dùng mở popover `<NotificationBell />` khi chưa có thông báo nào (hoặc API trả lỗi mạng)
- **WHEN** popover render
- **THEN** UI hiển thị thông điệp empty state rõ ràng (hoặc thông báo lỗi kèm nút "Thử lại") mà không gây lỗi giao diện.

## Acceptance checklist
- [ ] REQ-01: Bảng `Notifications` & `NotificationPreferences` có `TenantId`, index chuẩn và kiểm tra quyền sở hữu.
- [ ] REQ-02: Ghi `OutboxMessage` trong `UnitOfWork`, xử lý idempotent bởi `NotificationOutboxWorker`.
- [ ] REQ-03: Thông báo `HR_SCHEDULE_PUBLISHED`, `HR_SCHEDULE_UPDATED`, `HR_ATTENDANCE_REMINDER`, gom nhóm theo nhân viên & bỏ qua `UserId == null`.
- [ ] REQ-04: Thông báo `HR_REQUEST_SUBMITTED`, `HR_REQUEST_APPROVED`, `HR_REQUEST_REJECTED`.
- [ ] REQ-05: Thông báo `HR_PAYSLIP_GENERATED`, `HR_PAYSLIP_ADVANCED`, `HR_PAYSLIP_PAID`.
- [ ] REQ-06: SignalR `NotificationHub` cô lập theo group Tenant+User và `<NotificationBell />` trên `StoreOwnerLayout` + `AppTopNav`.
