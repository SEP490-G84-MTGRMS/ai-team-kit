# Specs: forgot-password-email-otp

## API / Contract (Chuẩn Route Thống Nhất: `/api/...` — Loại Bỏ `/v1`)
| Method | Path | Request Body | Response Body | HTTP Lỗi |
|---|---|---|---|---|
| POST | `/api/auth/forgot-password` | `ForgotPasswordRequest(string email)` | `ApiResponse<object>` | 400 Bad Request, 404 Not Found |
| POST | `/api/auth/verify-otp` | `VerifyOtpRequest(string email, string otpCode)` | `ApiResponse<object>` | 400 Bad Request, 404 Not Found |
| POST | `/api/auth/reset-password` | `ResetPasswordRequest(string email, string otpCode, string newPassword)` | `ApiResponse<object>` | 400 Bad Request, 404 Not Found |

---

## ADDED Requirements

### Requirement: REQ-AUTH-04 Khởi Tạo & Gửi Mã Xác Thực OTP (Password Reset OTP Generation & Email Dispatch)
Hệ thống MUST cung cấp API tại `/api/auth/forgot-password` cho phép người dùng gửi yêu cầu khôi phục mật khẩu qua email hoặc số điện thoại. Khi thông tin hợp lệ, hệ thống MUST sinh mã số ngẫu nhiên gồm 6 chữ số, lưu vào cơ sở dữ liệu kèm thời hạn hết hạn 10 phút, và gửi email HTML thông báo tới địa chỉ email của tài khoản (đồng thời ghi log ra terminal nếu chưa cấu hình tài khoản gửi SMTP).

#### Scenario: Gửi yêu cầu với email hợp lệ có trong hệ thống
- **GIVEN** tài khoản người dùng tồn tại với email `"owner@mtgrms.vn"`
- **WHEN** người dùng gửi yêu cầu POST tới `/api/auth/forgot-password` với `{ "email": "owner@mtgrms.vn" }`
- **THEN** hệ thống MUST sinh mã OTP 6 chữ số ngẫu nhiên, lưu vào trường `PasswordResetOtp` và gán `OtpExpiry` bằng thời gian hiện tại cộng 10 phút, gửi email chứa mã OTP và trả về HTTP 200 OK.

#### Scenario: Gửi yêu cầu với email không tồn tại trong hệ thống
- **GIVEN** email `"notfound@example.com"` không thuộc bất kỳ tài khoản nào
- **WHEN** người dùng gửi yêu cầu POST tới `/api/auth/forgot-password`
- **THEN** hệ thống MUST trả về HTTP 404 Not Found với thông báo lỗi rõ ràng.

#### Scenario: Gửi yêu cầu với email trống hoặc định dạng sai
- **GIVEN** payload gửi lên có email rỗng hoặc không chứa ký tự `@`
- **WHEN** người dùng gửi yêu cầu POST tới `/api/auth/forgot-password`
- **THEN** hệ thống MUST trả về HTTP 400 Bad Request.

---

### Requirement: REQ-AUTH-05 Xác Thực Mã OTP (OTP Verification)
Hệ thống MUST cung cấp API tại `/api/auth/verify-otp` kiểm tra tính hợp lệ của mã OTP trước khi cho phép người dùng đặt mật khẩu mới.

#### Scenario: Nhập đúng mã OTP còn trong thời hạn hiệu lực
- **GIVEN** tài khoản có `PasswordResetOtp = "123456"` và `OtpExpiry` còn hiệu lực
- **WHEN** người dùng gửi yêu cầu POST tới `/api/auth/verify-otp` với `{ "email": "owner@mtgrms.vn", "otpCode": "123456" }`
- **THEN** hệ thống MUST trả về HTTP 200 OK xác nhận mã hợp lệ.

#### Scenario: Nhập sai mã OTP hoặc mã đã hết hạn
- **GIVEN** người dùng nhập mã OTP `"999999"` hoặc mã đã quá 10 phút
- **WHEN** người dùng gửi yêu cầu POST tới `/api/auth/verify-otp`
- **THEN** hệ thống MUST trả về HTTP 400 Bad Request với thông báo mã không chính xác hoặc đã hết hạn.

---

### Requirement: REQ-AUTH-06 Đặt Lại Mật Khẩu Mới & Vô Hiệu Hóa Mã OTP (Password Reset Execution)
Hệ thống MUST xác thực lại mã OTP trước khi cập nhật mật khẩu mới tại `/api/auth/reset-password`, băm mật khẩu bằng `PasswordHasher`, cập nhật vào cơ sở dữ liệu và xóa trắng mã OTP để ngăn chặn việc sử dụng lại.

#### Scenario: Đặt lại mật khẩu thành công với đầy đủ điều kiện
- **GIVEN** mã OTP hợp lệ và mật khẩu mới thỏa mãn yêu cầu độ dài (>= 8 ký tự)
- **WHEN** người dùng gửi yêu cầu POST tới `/api/auth/reset-password`
- **THEN** hệ thống MUST cập nhật `PasswordHash` mới, đặt `PasswordResetOtp = null`, `OtpExpiry = null`, lưu vào CSDL và trả về HTTP 200 OK.

#### Scenario: Đăng nhập ngay sau khi đặt lại mật khẩu
- **GIVEN** người dùng vừa đổi mật khẩu thành công sang `"NewPassword@123"`
- **WHEN** người dùng gửi yêu cầu POST tới `/api/auth/login` với mật khẩu mới
- **THEN** hệ thống MUST xác thực thành công và cấp phát Access Token.

---

### Requirement: REQ-AUTH-07 Chuẩn Hóa Route Tiền Tố `/api` Bỏ `/v1`
Hệ thống Frontend MUST chuyển đổi toàn bộ `VITE_API_BASE_URL` và `httpClient.baseURL` về `/api` (loại bỏ `/v1`), đồng thời dọn dẹp quy tắc proxy rewrite trong `vite.config.ts`. Backend `AuthController` tiếp tục ánh xạ `[Route("api/[controller]")]` làm route chuẩn.

#### Scenario: Frontend gọi API qua cấu hình proxy `/api`
- **GIVEN** Frontend chạy tại `http://localhost:5173` và Backend tại `http://localhost:5232`
- **WHEN** `authService` gọi `/auth/forgot-password` với `baseURL = '/api'`
- **THEN** request được gửi trực tiếp tới `http://localhost:5232/api/auth/forgot-password` mà không qua rewrite regex v1.

---

## Acceptance Checklist
- [ ] REQ-AUTH-04: API `POST /api/auth/forgot-password` sinh OTP 6 số, gửi email HTML hoặc ghi log terminal, phản hồi HTTP 200.
- [ ] REQ-AUTH-05: API `POST /api/auth/verify-otp` xác thực đúng mã và thời hạn, báo lỗi khi sai.
- [ ] REQ-AUTH-06: API `POST /api/auth/reset-password` băm mật khẩu mới, xóa OTP, cho phép đăng nhập bằng mật khẩu mới.
- [ ] REQ-AUTH-07: Chuẩn hóa toàn bộ tiền tố route về `/api` (loại bỏ `/v1` ở `.env`, `httpClient.ts`, và `vite.config.ts`).
- [ ] Frontend: `ForgotPasswordPage.tsx` không còn mã cứng `889966`, kết nối 3 bước vào API Backend mượt mà, có đếm ngược gửi lại mã 60s.
- [ ] Unit Tests: Bổ sung kiểm thử tự động cho toàn bộ luồng forgot password trong `UserAuthenticationTests.cs`.
