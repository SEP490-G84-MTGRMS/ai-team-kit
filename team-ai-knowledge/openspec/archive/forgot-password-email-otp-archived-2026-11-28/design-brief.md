# Design Brief: forgot-password-email-otp

## 1. Luồng Người Dùng (User Flow)

```
[Màn hình Đăng nhập] 
       │
       ▼ (Bấm "Quên mật khẩu?")
[Màn hình Khôi phục: Bước 1 - Nhập Email/SĐT]
       │
       ├──> Nhập email/phone -> Bấm "GỬI MÃ XÁC THỰC OTP"
       │    └──> Gọi POST /api/v1/auth/forgot-password
       │         └──> Backend sinh OTP 6 số, lưu DB (10 phút)
       │         └──> Gửi Email HTML qua SMTP (kèm fallback Console Logger)
       │
       ▼ (Chuyển sang Bước 2)
[Màn hình Khôi phục: Bước 2 - Nhập mã OTP]
       │
       ├──> Nhập mã 6 số nhận từ Email -> Bấm "XÁC THỰC MÃ OTP"
       │    └──> Gọi POST /api/v1/auth/verify-otp
       │         ├──> OTP sai hoặc hết hạn -> Hiển thị cảnh báo lỗi
       │         └──> OTP hợp lệ -> Chuyển sang Bước 3
       │    └──> Nút "Gửi lại mã?": Đếm ngược 60s để tránh spam request
       │
       ▼ (Chuyển sang Bước 3)
[Màn hình Khôi phục: Bước 3 - Thiết lập Mật khẩu Mới]
       │
       ├──> Nhập Mật khẩu mới & Xác nhận (>= 8 ký tự)
       │    └──> Bấm "CẬP NHẬT MẬT KHẨU MỚI"
       │    └──> Gọi POST /api/v1/auth/reset-password
       │         └──> Backend băm mật khẩu mới (PasswordHasher), cập nhật CSDL
       │         └──> Xóa mã OTP và hạn OTP trong bảng Users
       │
       ▼
[Thông báo thành công & Tự động chuyển hướng về /auth/login sau 1.5s]
```

## 2. API Endpoints & Request/Response Contracts

### A. Yêu cầu gửi mã OTP (`POST /api/v1/auth/forgot-password`)
- **Request Body**:
  ```json
  {
    "email": "owner@mtgrms.vn"
  }
  ```
- **Response HTTP 200 OK**:
  ```json
  {
    "success": true,
    "code": "OK",
    "message": "Mã xác thực OTP đã được gửi đến email của bạn.",
    "statusCode": 200
  }
  ```
- **Response HTTP 404 Not Found**:
  ```json
  {
    "success": false,
    "code": "NOT_FOUND",
    "message": "Không tìm thấy tài khoản với email đã cung cấp.",
    "statusCode": 404
  }
  ```

### B. Kiểm tra mã OTP (`POST /api/v1/auth/verify-otp`)
- **Request Body**:
  ```json
  {
    "email": "owner@mtgrms.vn",
    "otpCode": "123456"
  }
  ```
- **Response HTTP 200 OK**:
  ```json
  {
    "success": true,
    "code": "OK",
    "message": "Mã xác thực hợp lệ.",
    "statusCode": 200
  }
  ```
- **Response HTTP 400 Bad Request**:
  ```json
  {
    "success": false,
    "code": "BAD_REQUEST",
    "message": "Mã OTP không chính xác hoặc đã hết hạn sử dụng.",
    "statusCode": 400
  }
  ```

### C. Đặt lại mật khẩu mới (`POST /api/v1/auth/reset-password`)
- **Request Body**:
  ```json
  {
    "email": "owner@mtgrms.vn",
    "otpCode": "123456",
    "newPassword": "NewSecurePassword@123"
  }
  ```
- **Response HTTP 200 OK**:
  ```json
  {
    "success": true,
    "code": "OK",
    "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.",
    "statusCode": 200
  }
  ```

## 3. Kiến Trúc Email & Dịch Vụ Gửi OTP (Backend)

### A. Cấu hình `appsettings.json`
```json
"EmailSettings": {
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": 587,
  "SenderEmail": "noreply.mtgrms@gmail.com",
  "SenderName": "MT-GRMS Hệ Thống Siêu Thị",
  "SmtpUser": "",
  "SmtpPass": "",
  "EnableSsl": true
}
```

### B. Cơ chế gửi Email & Fallback Dev Log
- Sử dụng thư viện chuẩn .NET 8 `System.Net.Mail.SmtpClient`.
- Khi `SmtpUser` và `SmtpPass` được cấu hình: Gửi email HTML với template mang thương hiệu MT-GRMS, chứa mã OTP 6 chữ số cỡ lớn và cảnh báo bảo mật.
- Khi `SmtpUser` hoặc `SmtpPass` để trống (trong quá trình phát triển/kiểm thử local):
  - Tự động in nổi bật ra console:
    ```
    ================================================================================
    [EMAIL-OTP DEV LOG] Gửi tới: owner@mtgrms.vn
    Mã xác thực OTP: 839201 | Hiệu lực: 10 phút (hết hạn lúc ...)
    ================================================================================
    ```
  - API vẫn phản hồi HTTP 200 OK, giúp lập trình viên và người chấm đồ án test được ngay mà không bị gián đoạn hay cần cấu hình email thật.

## 4. Thay Đổi Database
- **Không có**: Bảng `Users` đã có sẵn các cột `PasswordResetOtp` (string) và `OtpExpiry` (DateTime).

## 5. Thay Đổi Frontend (`ForgotPasswordPage.tsx`)
- Xóa bỏ việc gán cứng `setOtpCode("889966")`.
- Bổ sung state `resendCooldown` (60 giây) cho phép người dùng bấm "Gửi lại mã?" sau khi hết thời gian chờ.
- Kết nối `authService.requestPasswordReset`, `authService.verifyOtp`, `authService.resetPassword`.
- Trạng thái UI: Spinner loading khi đang gọi API, hiển thị alert lỗi đỏ hoặc thông báo xanh rõ ràng.
