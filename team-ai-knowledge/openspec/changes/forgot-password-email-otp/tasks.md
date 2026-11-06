# Tasks: forgot-password-email-otp

## Backend (Application & Infrastructure)
- [ ] T1 — Bổ sung DTOs (`ForgotPasswordRequest`, `VerifyOtpRequest`, `ResetPasswordRequest`) trong `MT_GRMS.Application/Auth/Dtos/AuthDtos.cs` (REQ-AUTH-04, REQ-AUTH-05, REQ-AUTH-06)
- [ ] T2 — Tạo `IEmailService` trong `MT_GRMS.Application/Common/Interfaces/` và triển khai `EmailService` trong `MT_GRMS.Infrastructure/Services/EmailService.cs` với cấu hình `EmailSettings` trong `appsettings.json` (hỗ trợ gửi SMTP Gmail & Dev Console Logger) (REQ-AUTH-04)
- [ ] T3 — Mở rộng `IAuthService` và `AuthService` với 3 phương thức: `ForgotPasswordAsync`, `VerifyOtpAsync`, `ResetPasswordAsync` (REQ-AUTH-04, REQ-AUTH-05, REQ-AUTH-06)
- [ ] T4 — Bổ sung 3 endpoints trong `AuthController.cs` với tiền tố chuẩn `/api/auth/` (`forgot-password`, `verify-otp`, `reset-password`) (REQ-AUTH-04, REQ-AUTH-05, REQ-AUTH-06, REQ-AUTH-07)
- [ ] T5 — Đăng ký `IEmailService` và cấu hình `EmailSettings` trong `MT_GRMS.Infrastructure/DependencyInjection.cs` (REQ-AUTH-04)

## Frontend
- [ ] T6 — Cập nhật cấu hình route: đổi `VITE_API_BASE_URL` trong `.env` và `httpClient.ts` về `/api` (loại bỏ `/v1`), tinh gọn proxy trong `vite.config.ts` (REQ-AUTH-07)
- [ ] T7 — Bổ sung các phương thức API trong `authService.ts` (`requestPasswordReset`, `verifyOtp`, `resetPassword`) trỏ tới `/api/auth/...` (REQ-AUTH-04, REQ-AUTH-05, REQ-AUTH-06)
- [ ] T8 — Hoàn thiện `ForgotPasswordPage.tsx`: xóa bỏ mã OTP hardcoded `889966`, kết nối kiểm tra OTP qua backend, bổ sung bộ đếm ngược resend OTP 60s và xử lý loading/alert (REQ-AUTH-04, REQ-AUTH-05, REQ-AUTH-06)

## Test & Verification
- [ ] T9 — Viết unit tests cho `ForgotPasswordAsync`, `VerifyOtpAsync`, `ResetPasswordAsync` trong `UserAuthenticationTests.cs` (REQ-AUTH-04, REQ-AUTH-05, REQ-AUTH-06)
- [ ] T10 — Chạy `dotnet test MT_GRMS_BACKEND.sln` và `npm run build` đảm bảo 100% tests pass và build thành công (REQ-AUTH-07)
