# Proposal: HR & Payroll Notification System (`hr-payroll-notifications`)

## 1. Vấn đề (Problem Statement)
Hiện tại trong phân hệ Nhân sự & Tiền lương (HR & Payroll) của MT-GRMS:
- Khi Chủ cửa hàng (`StoreOwner`) ban hành, cập nhật hoặc hủy lịch làm việc (`PublishAsync` / `UpdateAsync` / `DeleteAsync`), nhân viên không nhận được thông báo chủ động mà phải tự vào kiểm tra lịch cá nhân.
- Khi Nhân viên (`Staff` / `Cashier`) gửi đơn yêu cầu ca làm việc (Xin nghỉ, Đổi ca, Sự cố vào/ra ca, Tăng ca), Chủ cửa hàng chưa có chuông thông báo real-time mà phải tự kiểm tra hàng đợi phê duyệt.
- Khi Chủ cửa hàng duyệt/từ chối đơn hoặc khởi tạo/tạm ứng/thanh toán phiếu lương (`Payslip`), nhân viên không nhận được thông báo tức thời kèm trạng thái và liên kết xem chi tiết.
- Hệ thống chưa có bảng lưu trữ thông báo (`Notification`) và cài đặt tùy chọn nhận thông báo (`NotificationPreference`) cô lập theo từng `Tenant` và tài khoản người dùng.

## 2. Mục tiêu (Goals)
- Xây dựng hệ thống Thông báo (In-App Real-time + tùy chọn Email) cho phân hệ HR & Payroll theo đúng mô hình Multi-Tenant & Multi-Branch của MT-GRMS.
- Đảm bảo mọi thông báo được cô lập tuyệt đối theo `TenantId` và `RecipientUserId`, đồng thời xử lý bất đồng bộ qua cơ chế Outbox để không ảnh hưởng giao dịch nghiệp vụ chính.
- Cung cấp trải nghiệm thông báo thống nhất trên giao diện cho cả `StoreOwner` (`StoreOwnerLayout`) và `Staff` (`EmployeeLayout`) với chuông thông báo, đếm số chưa đọc, đánh dấu đã đọc và điều hướng thẳng tới chứng từ/màn hình liên quan.

## 3. Phạm vi (Scope)

### In Scope
- **Domain & Persistence:** Bổ sung thực thể `Notification` và `NotificationPreference` (kế thừa `BaseTenantEntity`), cấu hình EF Core + migration.
- **Event & Outbox Processing:** Phát sinh `OutboxMessage` (tận dụng `OutboxMessages` sẵn có) cho các sự kiện HR & Payroll (`HR_SCHEDULE_PUBLISHED`, `HR_SCHEDULE_UPDATED`, `HR_REQUEST_SUBMITTED`, `HR_REQUEST_APPROVED`, `HR_REQUEST_REJECTED`, `HR_PAYSLIP_GENERATED`, `HR_PAYSLIP_ADVANCED`, `HR_PAYSLIP_PAID`, `HR_ATTENDANCE_REMINDER`) và Background Worker xử lý lưu `Notification` + đẩy SignalR (chống trùng bằng `IdempotencyKey`, gom nhóm khi ban hành lịch hàng loạt).
- **Real-time & REST API:** `NotificationHub` (`/hubs/notifications` xác thực JWT và group theo `tenant:{TenantId}:user:{UserId}`) và `NotificationsController` (`GET /api/notifications`, `unread-count`, `read`, `read-all`, `preferences`).
- **Frontend UI:** Component `<NotificationBell />` và hook SignalR trên `StoreOwnerLayout` và `AppTopNav` (`EmployeeLayout`), hiển thị badge chưa đọc, lọc `Tất cả / Chưa đọc`, đánh dấu đã đọc và điều hướng theo `ActionUrl`.

### Out of Scope
- Push notification trên ứng dụng di động native (FCM/APNs) hoặc SMS/Zalo ZNS.
- Thông báo cho các phân hệ ngoài HR & Payroll (POS đơn hàng, Kho, Đặt hàng nhà cung cấp) — sẽ mở rộng ở phase sau dựa trên cùng hạ tầng `Notification`.

## 4. Người dùng & Role liên quan
- **StoreOwner / Admin:** Nhận thông báo khi nhân viên gửi đơn yêu cầu ca làm việc (`HR_REQUEST_SUBMITTED`); có quyền xem, đánh dấu đã đọc và cấu hình tùy chọn nhận thông báo cá nhân.
- **Staff / Cashier (có tài khoản `UserId`):** Nhận thông báo khi lịch làm việc được ban hành/cập nhật/hủy, nhắc nhở ca làm việc, kết quả duyệt/từ chối đơn, và khi phiếu lương được khởi tạo/tạm ứng/thanh toán.
- *(Lưu ý: Nhân viên chưa cấp tài khoản đăng nhập `Employee.UserId == null` sẽ được bỏ qua kênh In-App để tránh lỗi, chỉ gửi Email nếu có địa chỉ email và bật kênh Email).*

## 5. Tiêu chí thành công (Success Criteria)
1. **Cô lập Multi-Tenant 100%:** Người dùng ở Tenant A không bao giờ nhận hoặc truy cập được thông báo/SignalR group của Tenant B hoặc của User khác (`403`/`404` khi truy cập chéo).
2. **Độ tin cậy giao dịch:** Các nghiệp vụ gốc (`PublishAsync`, `CreateRequestAsync`, `ReviewRequestAsync`, `GenerateMonthlyPayrollAsync`, `AdvanceSalaryAsync`, `PayPayslipAsync`) vẫn commit thành công ngay cả khi kênh đẩy real-time/email gặp sự cố; không tạo trùng thông báo khi Worker retry nhờ `IdempotencyKey`.
3. **Real-time & UI:** Badge số chưa đọc trên `<NotificationBell />` cập nhật tức thời qua SignalR khi có thông báo mới, bấm vào thông báo tự động đánh dấu đã đọc và điều hướng đúng màn hình chi tiết.
4. **Kiểm thử đạt chuẩn:** Có unit/integration test cho service, quyền truy cập đa tenant, idempotency và build sạch cả Backend lẫn Frontend.
