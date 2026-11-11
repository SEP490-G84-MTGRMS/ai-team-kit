# Proposal: auth-email-otp-flow

## Vấn đề
- Việc gửi SMS OTP qua các cổng dịch vụ bên thứ ba (Twilio, Firebase, TextBee Gateway) gặp nhiều rào cản thực tế: chi phí duy trì, chặn vùng mã quốc gia Việt Nam (+84), yêu cầu đặt cọc lớn trên Cloud, hoặc phụ thuộc vào thiết bị Android và SIM cá nhân dễ gián đoạn kết nối.
- Luồng Đăng nhập hiện tại chỉ dùng mật khẩu tĩnh đơn lẻ, chưa có lớp bảo vệ xác thực 2 bước (2FA) qua mã OTP bảo mật.
- Cần một giải pháp xác thực thống nhất, tin cậy, không tốn chi phí và hoạt động độc lập qua **Email OTP** cho cả luồng Đăng ký và Đăng nhập.

## Mục tiêu
- Loại bỏ hoàn toàn sự phụ thuộc vào SMS và TextBee gateway.
- Triển khai xác thực mã OTP 6 số qua **Email** (sử dụng `IEmailService` với SMTP / Gmail App Password, đồng thời có cơ chế Dev Console Fallback phục vụ dev/demo đồ án) cho cả 2 luồng cốt lõi:
  1. **Đăng ký cửa hàng mới (Register)**: Gửi mã OTP xác nhận về địa chỉ Email của chủ cửa hàng; nhập đúng OTP mới kích hoạt Tenant, Branch và StoreOwner.
  2. **Đăng nhập hệ thống (Login 2FA)**: Sau khi nhập Email và Mật khẩu chính xác, hệ thống gửi mã OTP 6 chữ số về Email của tài khoản; chỉ khi nhập đúng mã OTP mới cấp JWT AccessToken và điều hướng người dùng vào Dashboard tương ứng theo vai trò.

## Phạm vi (Scope)
- **In scope**:
  - **Backend (`MT_GRMS_BACKEND`)**:
    - Nâng cấp `IEmailService` và `EmailService`: Bổ sung template email HTML chuyên nghiệp cho OTP Đăng ký (`SendRegistrationOtpAsync`) và OTP Đăng nhập (`SendLoginOtpAsync`).
    - API Đăng ký: Endpoint gửi OTP đăng ký tới email (`POST /api/auth/register/send-otp`) và xác thực OTP khi gọi `POST /api/auth/register`.
    - API Đăng nhập 2FA:
      - `POST /api/auth/login`: Xác thực Email + Password; nếu đúng, sinh mã OTP đăng nhập gửi về Email và trả về `{ requiresOtp: true, tempToken: "...", emailMasked: "a***@gmail.com" }`.
      - `POST /api/auth/login/verify-otp`: Kiểm tra `tempToken` + `otpCode`; nếu hợp lệ, cấp `accessToken`, `refreshToken` và `user` profile hoàn chỉnh.
    - Cập nhật các Unit Tests tương ứng để đảm bảo 100% test pass.
  - **Frontend (`MT_GRMS_FRONTEND`)**:
    - Cập nhật `RegistrationOtpModal.tsx` và `RegisterPage.tsx`: Nhận OTP từ Email, giao diện hiển thị rõ ràng thông điệp gửi về Email, kèm nút "Điền nhanh OTP Dev" khi chạy local.
    - Bổ sung `LoginOtpModal.tsx` và tích hợp vào `LoginPage.tsx`: Sau bước 1 (kiểm tra mật khẩu thành công), mở modal nhập 6 số OTP Email để hoàn tất đăng nhập.
    - Cập nhật `authService.ts` và `authTypes.ts` đồng bộ DTO Contract.
  - Dọn dẹp các tệp và cấu hình TextBee/SMS không còn sử dụng.
- **Out of scope**:
  - Khôi phục tài khoản qua SMS (giữ nguyên quy trình khôi phục qua Email OTP đã hoàn thiện).
  - WebAuthn / Passkeys.

## Người dùng liên quan
- **Chủ cửa hàng (StoreOwner)**: Xác thực mở cửa hàng và đăng nhập bảo mật qua Email.
- **Quản trị viên (Admin) & Nhân viên (Staff)**: Đăng nhập an toàn vào hệ thống với xác thực 2 bước.

## Tiêu chí thành công
- [ ] Luồng Đăng ký gửi OTP 6 số đến Email người đăng ký và hoàn tất tạo cửa hàng khi nhập đúng OTP.
- [ ] Luồng Đăng nhập xác thực 2 bước qua Email thành công, điều hướng chuẩn xác theo vai trò (Admin -> `/admin/dashboard`, StoreOwner -> `/store-owner/dashboard`, Staff -> `/employee/schedule` hoặc `/pos`).
- [ ] Khi chưa cấu hình SMTP credentials, hệ thống in OTP ra Terminal Console và cho phép dùng nút "Điền nhanh" để test mượt mà không bị nghẽn.
- [ ] Build Frontend và Unit Tests Backend chạy kiểm thử đạt 100% PASS.
