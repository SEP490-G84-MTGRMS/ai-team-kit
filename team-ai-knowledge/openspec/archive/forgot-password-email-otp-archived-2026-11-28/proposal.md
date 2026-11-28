# Proposal: forgot-password-email-otp

## Vấn đề
Hiện tại trên màn hình Frontend `ForgotPasswordPage.tsx`, chức năng khôi phục mật khẩu đang là giao diện mô phỏng (Mock UI):
- Khi người dùng nhập email và bấm "GỬI MÃ XÁC THỰC OTP", Frontend tự động gán cứng mã OTP `"889966"` vào ô nhập.
- Backend chưa có API tiếp nhận yêu cầu gửi OTP (`/api/v1/auth/forgot-password`), chưa có dịch vụ gửi Email (`IEmailService`) và chưa có logic sinh mã OTP ngẫu nhiên lưu vào CSDL.
- Khi người dùng nhập OTP và đổi mật khẩu mới, hệ thống không thực sự cập nhật mật khẩu vào bảng `Users` trong cơ sở dữ liệu.

## Mục tiêu
- Xây dựng luồng khôi phục mật khẩu hoàn chỉnh và an toàn qua Email OTP 3 bước:
  1. Gửi mã OTP 6 chữ số qua Email (có thời hạn 10 phút, lưu mã và thời hạn trong bảng `Users`).
  2. Xác thực tính hợp lệ của mã OTP.
  3. Cập nhật mật khẩu mới (băm an toàn bằng `PasswordHasher`) và xóa mã OTP đã dùng.
- Tích hợp dịch vụ gửi Email SMTP chuẩn trong Backend (hỗ trợ cấu hình Gmail/SendGrid qua `appsettings.json`, đồng thời có chế độ Development Log an toàn khi chưa nhập mật khẩu SMTP).
- Kết nối đồng bộ giữa Frontend `ForgotPasswordPage.tsx` và Backend API thực tế.

## Phạm vi
- **In scope**:
  - **Backend**:
    - Bổ sung cấu hình `EmailSettings` trong `appsettings.json` (Host, Port, Sender, User, Pass).
    - Tạo `IEmailService` và `EmailService` hỗ trợ gửi email HTML OTP qua `System.Net.Mail` (tự động fallback log console nếu chưa cấu hình mật khẩu SMTP).
    - Bổ sung các endpoint trong `AuthController.cs`:
      - `POST /api/v1/auth/forgot-password`: Kiểm tra email, sinh OTP 6 số ngẫu nhiên, lưu `PasswordResetOtp` + `OtpExpiry`, gửi email OTP.
      - `POST /api/v1/auth/verify-otp`: Kiểm tra mã OTP còn hiệu lực.
      - `POST /api/v1/auth/reset-password`: Đổi mật khẩu mới và hủy OTP.
  - **Frontend**:
    - Loại bỏ mã OTP hardcoded `889966` trong `ForgotPasswordPage.tsx`.
    - Gọi API thực tế từ `authService.ts`.
    - Bổ sung đếm ngược thời gian gửi lại mã OTP (60s).
- **Out of scope**:
  - Không sửa đổi cấu trúc bảng `Users` (2 cột `PasswordResetOtp` và `OtpExpiry` đã có sẵn trong schema CSDL).
  - Không can thiệp vào các API xác thực khác (`login`, `register`, `refresh`).

## Người dùng liên quan
- Toàn bộ người dùng hệ thống: Store Owner, Cashier, Admin khi quên mật khẩu đăng nhập.

## Tiêu chí thành công
- [ ] Người dùng nhập email, Backend sinh mã OTP 6 chữ số ngẫu nhiên và gửi email tới hòm thư người dùng (kèm fallback in log console nếu môi trường dev).
- [ ] Frontend hiển thị thông báo thành công, chuyển sang bước nhập OTP và bắt buộc người dùng nhập đúng mã OTP đã nhận (không còn tự điền cứng `889966`).
- [ ] Nhập sai OTP hoặc OTP quá hạn (10 phút) -> hệ thống báo lỗi chính xác.
- [ ] Nhập đúng OTP và mật khẩu mới -> hệ thống cập nhật `PasswordHash` trong DB thành công.
- [ ] Người dùng có thể dùng mật khẩu mới để đăng nhập thành công vào hệ thống.
- [ ] `dotnet build` và `npm run build` thành công, 100% tests pass.
