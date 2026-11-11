# Tasks: auth-login-integration

## 📧 Email OTP 2FA & Registration Tasks (Chuyển đổi toàn diện từ SMS/TextBee sang Email OTP)
- [ ] T-EMAIL-01 — Gỡ bỏ hoàn toàn TextBee & SMS trong Backend: xóa `TextBeeSmsService.cs`, `TextBeeSettings.cs`, `ISmsService.cs`, gỡ config TextBee trong `appsettings.json` và `.env` (REQ-AUTH-10)
- [ ] T-EMAIL-02 — Mở rộng `IEmailService` và `EmailService`: thêm `SendLoginOtpAsync` và `SendRegistrationOtpAsync` với template HTML thương hiệu MT-GRMS và console dev fallback (REQ-AUTH-08, REQ-AUTH-09)
- [ ] T-EMAIL-03 — Cập nhật DTOs xác thực trong `AuthDtos.cs`: `VerifyLoginOtpRequest`, `LoginInitResponse`, `SendEmailOtpRequest` (REQ-AUTH-08, REQ-AUTH-09)
- [ ] T-EMAIL-04 — Cập nhật `AuthService.cs`:
  - `LoginAsync`: Kiểm tra credentials; sinh `tempToken` và OTP 6 số lưu trong `IMemoryCache` (TTL 5 phút); gửi email qua `IEmailService`; trả về `LoginInitResponse` (REQ-AUTH-08)
  - `VerifyLoginOtpAsync`: Xác thực `tempToken` + `otpCode`, chống brute-force (tối đa 5 lần), cấp token/cookie và trả về `UserInfo` (REQ-AUTH-08)
  - `SendRegistrationEmailOtpAsync`: Sinh OTP lưu cache và gửi email kích hoạt (REQ-AUTH-09)
  - `RegisterTenantAsync`: Xác thực OTP Email trước khi tạo Tenant, Branch, StoreOwner (REQ-AUTH-09)
- [ ] T-EMAIL-05 — Cập nhật `AuthController.cs`: bổ sung endpoint `POST /api/auth/login/verify-otp` và cập nhật `POST /api/auth/register/send-otp` nhận email (REQ-AUTH-08, REQ-AUTH-09)
- [ ] T-EMAIL-06 — Cập nhật Frontend DTOs trong `authTypes.ts` và API service trong `authService.ts`: hỗ trợ 2FA login và register email OTP (REQ-AUTH-08, REQ-AUTH-09)
- [ ] T-EMAIL-07 — Tạo mới component `LoginOtpModal.tsx` tại `MT_GRMS_FRONTEND/src/features/auth/components/LoginOtpModal.tsx` chuẩn KiotViet Design System, phông `Be Vietnam Pro` + `JetBrains Mono`, 100% Monochrome SVG icon, nút Điền nhanh OTP Dev (REQ-AUTH-08, REQ-AUTH-11)
- [ ] T-EMAIL-08 — Cập nhật `RegistrationOtpModal.tsx` và `RegisterPage.tsx` sang xác thực mã gửi về Email (REQ-AUTH-09, REQ-AUTH-11)
- [ ] T-EMAIL-09 — Tích hợp `LoginOtpModal` vào `LoginPage.tsx`: Bước 1 gọi login nhận `requiresOtp: true`, mở Modal; Bước 2 xác thực OTP thành công điều hướng theo vai trò (REQ-AUTH-08, REQ-03)
- [ ] T-EMAIL-10 — Cập nhật Unit Tests trong `UserAuthenticationTests.cs` kiểm thử luồng Login 2FA và Register Email OTP đạt PASS 100% (REQ-AUTH-08, REQ-AUTH-09)
- [ ] T-EMAIL-11 — Bắt buộc tạo worklog `MT_GRMS_BACKEND/docs/worklogs/YYYY-MM-DD_EMAIL-OTP_AI_email-otp-auth-flow.md` và cập nhật `CHANGELOG.md` theo quy tắc Git pre-commit (REQ-01)
- [ ] T-EMAIL-12 — Kiểm thử build Frontend `npm run build` và chạy `dotnet test` Backend xác nhận 100% thành công không có lỗi (REQ-01)

---
## Lịch Sử Tasks Đã Hoàn Thành Trước Đó (HttpOnly Cookie & Base Auth)
- [x] T1 — Cấu hình CORS `AllowCredentials()` cho các origins cụ thể (`http://localhost:5173`, `http://localhost:3000`) và middleware đọc JWT từ Cookie trong `Program.cs` (REQ-02)
- [x] T2 — Cập nhật `AuthController.cs` cơ bản (REQ-01)
- [x] T3 — Cập nhật `AuthService.cs` & `IAuthService.cs` cơ bản (REQ-AUTH-07)
- [x] T4 — Cập nhật Unit Tests & Integration Tests ban đầu (REQ-01, REQ-AUTH-07)
- [x] T5 — Tạo tệp worklog ban đầu (REQ-01)
- [x] T6 — Cấu hình `src/api/httpClient.ts` withCredentials (REQ-02)
- [x] T7 — Cập nhật `useAuthStore.ts` & `authService.ts` (REQ-AUTH-04)
- [x] T8 — Cập nhật `LoginPage.tsx` & `ProtectedRoute.tsx` (REQ-03)
- [x] T9 — Tạo tệp worklog Frontend (REQ-01)
- [x] T10 — Chạy `dotnet test` xác minh ban đầu (REQ-01)
- [x] T11 — Chạy `npm run build` trên Frontend (REQ-AUTH-04)
- [x] T12 — Kiểm thử End-to-End ban đầu
