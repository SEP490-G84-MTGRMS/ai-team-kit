# EXP-2026-11-19-001: HR & Payroll Notification System (Multi-Tenant)

## 1. Problem Statement
Trong phân hệ HR & Payroll hiện tại của MT-GRMS, các sự kiện quan trọng như ban hành/cập nhật lịch làm việc (`ScheduleService`), gửi và duyệt/từ chối đơn ca làm việc (`ScheduleApprovalService`), khởi tạo/tạm ứng/thanh toán phiếu lương (`PayslipService`) chưa phát sinh thông báo chủ động cho `StoreOwner` và `Staff`. Người dùng phải tự vào từng màn hình để kiểm tra trạng thái, đồng thời hệ thống chưa có bảng lưu trữ thông báo đọc/chưa đọc theo `TenantId` và `RecipientUserId`.

## 2. Context & Background
- **Hiện trạng Backend (`MT_GRMS_BACKEND`):**
  - Thư mục `MT_GRMS.Domain.Entities.System` mới chỉ có `AuditLog` và `OutboxMessage` (hàng đợi sự kiện bất đồng bộ), chưa có entity `Notification` hay `NotificationPreference`.
  - Đã có mẫu `BackgroundService` xử lý Outbox tại `SupplierOrderDispatchWorker.cs`.
  - `Program.cs` chưa cấu hình SignalR (`AddSignalR()` / `MapHub`), nhưng đã cấu hình JWT Bearer và CORS.
- **Hiện trạng Frontend (`MT_GRMS_FRONTEND`):**
  - Đã cài sẵn `@microsoft/signalr` (`^10.0.11`), `@tanstack/react-query`, `lucide-react`.
  - Hai layout chính cho HR là `StoreOwnerLayout.tsx` (Chủ cửa hàng) và `AppTopNav.tsx` trong `EmployeeLayout` (Nhân viên), hiện chưa có chuông thông báo.
- **Tài liệu thiết kế tham chiếu:** `doc/Require/Nhan Vien/ThietKe_ThongBao_HR_Payroll.md`.

## 3. Constraints
- Phải cô lập dữ liệu tuyệt đối theo `TenantId` và `RecipientUserId` (chuẩn Multi-Tenant `BaseTenantEntity`).
- Mọi thay đổi Database phải đi qua EF Core migration mới (PostgreSQL), không sửa migration cũ đã merge.
- Không được làm chậm hoặc làm fail transaction nghiệp vụ gốc (`PublishAsync`, `ReviewRequestAsync`, `PayPayslipAsync`...) nếu quá trình gửi thông báo gặp sự cố.
- Hỗ trợ trường hợp nhân viên chưa có tài khoản đăng nhập (`Employee.UserId == null`).

## 4. Assumptions
- **[ASSUMPTION]**: Mỗi `StoreOwner` / `Admin` trong Tenant đều có tài khoản `User` hợp lệ để nhận thông báo đơn mới từ nhân viên thuộc chi nhánh quản lý.
- **[ASSUMPTION]**: Thời gian lưu DB theo UTC (`DateTime.UtcNow`) và hiển thị trên Frontend theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh`).
- **[ASSUMPTION]**: Kênh Email sử dụng hạ tầng email sẵn có (hoặc log/mock an toàn khi chưa cấu hình SMTP ở môi trường dev).

## 5. Scope & Non-Goals
### In Scope
- Lưu trữ thông báo In-App (`Notification`) và cấu hình kênh nhận (`NotificationPreference`) trong DB.
- Ghi `OutboxMessage` cho các sự kiện HR & Payroll và xử lý qua Background Worker (`NotificationOutboxWorker`).
- Đẩy thông báo real-time qua SignalR `NotificationHub` và cung cấp REST API `NotificationsController`.
- Hiển thị `<NotificationBell />` trên `StoreOwnerLayout` và `AppTopNav` (`EmployeeLayout`).

### Out of Scope (Non-Goals)
- Không triển khai Mobile Push Notification (FCM/APNs), SMS hoặc Zalo ZNS trong phase này.
- Không mở rộng sang sự kiện POS/Kho/Đặt hàng nhà cung cấp (chỉ chuẩn bị hạ tầng `Module` để mở rộng sau).

## 6. Options Analysis & Selected Approach
- **Phương án 1 — Ghi trực tiếp `Notification` đồng bộ trong Service nghiệp vụ + Polling FE:**
  - *Ưu điểm:* Triển khai nhanh, không cần Outbox Worker hay SignalR.
  - *Nhược điểm:* Làm phình transaction chính, dễ gây timeout khi `PublishAsync` hàng loạt cho nhiều nhân viên, tốn băng thông polling và không real-time.
- **Phương án 2 — Transactional Outbox (`OutboxMessages`) + `NotificationOutboxWorker` + SignalR Hub (Chọn):**
  - *Ưu điểm:* Tận dụng trực tiếp `OutboxMessage` và pattern của `SupplierOrderDispatchWorker` có sẵn trong repo; đảm bảo atomicity cho transaction chính; chống gửi trùng bằng `IdempotencyKey`; hỗ trợ gom nhóm batch và đẩy real-time qua `@microsoft/signalr` đã cài sẵn ở Frontend.
  - *Nhược điểm:* Cần cấu hình JWT qua query string `access_token` cho WebSocket SignalR và xử lý retry/dead-letter trong Worker.
- **Quyết định:** Chọn **Phương án 2** vì phù hợp kiến trúc sẵn có, an toàn dữ liệu và đáp ứng trải nghiệm real-time.

## 7. Risks & Mitigations
- **Rủi ro rò rỉ thông báo chéo Tenant qua SignalR:** Chỉ lấy `TenantId` và `UserId` từ JWT Claims trong `NotificationHub.OnConnectedAsync()`, không tin tưởng parameter từ client.
- **Rủi ro trùng lặp khi Worker retry:** Bắt buộc gắn `IdempotencyKey` duy nhất trên `OutboxMessage` và kiểm tra trước khi insert `Notification`.
- **Rủi ro spam khi ban hành lịch hàng loạt:** Gom nhóm theo `EmployeeId` trong `PublishAsync` để chỉ phát 1 thông báo tổng hợp cho mỗi nhân viên.

## 8. Success Criteria
- `StoreOwner` nhận real-time notification khi `Staff` gửi đơn; `Staff` nhận real-time notification khi lịch được ban hành/sửa/hủy, đơn được duyệt/từ chối, hoặc phiếu lương được tạo/tạm ứng/thanh toán.
- Truy cập chéo Tenant hoặc chéo User bị chặn với `403`/`404`.
- Toàn bộ unit/integration test và build BE/FE đều pass.
