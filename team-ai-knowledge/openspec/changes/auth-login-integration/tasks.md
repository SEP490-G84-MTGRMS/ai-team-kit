# Tasks: auth-login-integration

## 📧 Email OTP 2FA & Registration Tasks (Chuyển đổi toàn diện từ SMS/TextBee sang Email OTP)
- [x] T-EMAIL-01 — Gỡ bỏ hoàn toàn TextBee & SMS trong Backend: xóa `TextBeeSmsService.cs`, `TextBeeSettings.cs`, `ISmsService.cs`, gỡ config TextBee trong `appsettings.json` và `.env` (REQ-AUTH-10)
- [x] T-EMAIL-02 — Mở rộng `IEmailService` và `EmailService`: thêm `SendLoginOtpAsync` và `SendRegistrationOtpAsync` với template HTML thương hiệu MT-GRMS và console dev fallback (REQ-AUTH-08, REQ-AUTH-09)
- [x] T-EMAIL-03 — Cập nhật DTOs xác thực trong `AuthDtos.cs`: `VerifyLoginOtpRequest`, `SendLoginOtpResponse`, `SendRegistrationOtpRequest` (REQ-AUTH-08, REQ-AUTH-09)
- [x] T-EMAIL-04 — Cập nhật `AuthService.cs`:
  - `SendLoginOtpAsync`: Kiểm tra credentials; sinh `tempToken` và OTP 6 số lưu trong `LoginOtpStore` (TTL 5 phút); gửi email qua `IEmailService`; trả về `SendLoginOtpResponse` (REQ-AUTH-08)
  - `VerifyLoginOtpAsync`: Xác thực `tempToken` + `otpCode`, chống brute-force (tối đa 5 lần), cấp token/cookie và trả về `UserInfo` (REQ-AUTH-08)
  - `SendRegistrationOtpAsync`: Sinh OTP lưu cache và gửi email kích hoạt (REQ-AUTH-09)
  - `RegisterTenantAsync`: Xác thực OTP Email trước khi tạo Tenant, Branch, StoreOwner (REQ-AUTH-09)
- [x] T-EMAIL-05 — Cập nhật `AuthController.cs`: bổ sung endpoint `POST /api/auth/login/send-otp`, `POST /api/auth/login/verify-otp` và cập nhật `POST /api/auth/register/send-otp` nhận email (REQ-AUTH-08, REQ-AUTH-09)
- [x] T-EMAIL-06 — Cập nhật Frontend DTOs trong `authTypes.ts` và API service trong `authService.ts`: hỗ trợ 2FA login và register email OTP (REQ-AUTH-08, REQ-AUTH-09)
- [x] T-EMAIL-07 — Tạo mới component `LoginOtpModal.tsx` tại `MT_GRMS_FRONTEND/src/features/auth/components/LoginOtpModal.tsx` chuẩn KiotViet Design System, phông `Be Vietnam Pro` + `JetBrains Mono`, 100% Monochrome SVG icon, nút Điền nhanh OTP Dev (REQ-AUTH-08, REQ-AUTH-11)
- [x] T-EMAIL-08 — Cập nhật `RegistrationOtpModal.tsx` và `RegisterPage.tsx` sang xác thực mã gửi về Email (REQ-AUTH-09, REQ-AUTH-11)
- [x] T-EMAIL-09 — Tích hợp `LoginOtpModal` vào `LoginPage.tsx`: Bước 1 gọi `sendLoginOtp` nhận `requiresOtp: true`, mở Modal; Bước 2 xác thực OTP thành công điều hướng theo vai trò (REQ-AUTH-08, REQ-03)
- [x] T-EMAIL-10 — Cập nhật Unit Tests trong `UserAuthenticationTests.cs` kiểm thử luồng Login 2FA và Register Email OTP đạt PASS 100% (REQ-AUTH-08, REQ-AUTH-09)
- [x] T-EMAIL-11 — Bắt buộc tạo worklog `MT_GRMS_BACKEND/docs/worklogs/2026-11-11_EMAIL-OTP_AI_email-otp-auth-flow.md` và cập nhật `CHANGELOG.md` theo quy tắc Git pre-commit (REQ-01)
- [x] T-EMAIL-12 — Kiểm thử build Frontend `npm run build` và chạy `dotnet test` Backend xác nhận 100% thành công không có lỗi (REQ-01)

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

## Bổ sung 2FA tùy chọn theo tài khoản (chưa triển khai)
### DB
- [ ] T-2FA-01 — Thêm cờ `IsTwoFactorEnabled` trên User, migration/backfill true cho tài khoản cũ và mặc định true cho tài khoản mới; entity mapping (REQ-AUTH-12).
- [ ] T-2FA-02 — Thiết kế và lưu audit thay đổi 2FA gồm UserId, TenantId, action, timestamp UTC, IP, result; không lưu bí mật (REQ-AUTH-12).

### Backend
- [ ] T-2FA-03 — Sửa login để phân nhánh theo cờ: bật tiếp tục Email OTP, tắt cấp HttpOnly cookies ngay; xử lý response đồng nhất (REQ-AUTH-08, REQ-01).
- [ ] T-2FA-04 — API GET trạng thái và POST challenge Settings: lấy UserId từ phiên, xác minh mật khẩu/email, tạo challenge riêng gắn UserId/action, giới hạn gửi lại user/IP, CSRF (REQ-AUTH-12).
- [ ] T-2FA-05 — API confirm: OTP 5 phút/5 sai, chống replay/challenge khác action, update trạng thái và audit nhất quán trong transaction, trả 403 cho target khác (REQ-AUTH-12).

### Frontend
- [ ] T-2FA-06 — Cập nhật authService/authTypes/LoginPage cho response login bật/tắt 2FA (REQ-AUTH-08).
- [ ] T-2FA-07 — Settings bảo mật tự phục vụ cho mọi vai trò: tải trạng thái, công tắc, xác minh mật khẩu/OTP, loading/error/success và email chưa xác minh (REQ-AUTH-12).

### Kiểm chứng
- [ ] T-2FA-08 — Kiểm chứng login bật/tắt, OTP dùng một lần/5 sai/hết hạn; settings ownership/action/CSRF/replay/rate limit/audit transaction; build frontend và backend (REQ-AUTH-08, REQ-AUTH-12).
- [ ] T-2FA-09 — Cập nhật backend worklog và CHANGELOG theo quy tắc repo (REQ-AUTH-12).


## Validation đăng nhập và đăng ký

### Backend
- [ ] T-VAL-01 — Tạo policy/validators dùng chung cho login, login OTP, registration send/verify OTP và register; bảo đảm validator được gọi trước repository/hash/challenge/email (REQ-01, REQ-AUTH-13).
- [ ] T-VAL-02 — Áp dụng giới hạn identifier/password đăng nhập và OTP/tempToken; malformed OTP không tiêu hao attempt; lỗi credentials không gây account enumeration (REQ-01, REQ-AUTH-08).
- [ ] T-VAL-03 — Áp dụng họ tên, tên cửa hàng, email tối đa 100, phone VN, password 8–64 mạnh và AgreeTerms bắt buộc; bỏ default true khỏi DTO (REQ-AUTH-09, REQ-AUTH-13).

### Frontend
- [ ] T-VAL-04 — Đồng bộ validation RegisterPage/LoginPage, sửa regex phone, chặn password yếu, giới hạn input, checkbox terms mặc định false và hiển thị lỗi theo trường (REQ-01, REQ-AUTH-09, REQ-AUTH-13).

### Unit tests và kiểm chứng
- [ ] T-VAL-05 — Viết backend unit tests cho boundary min/max, từng nhóm password thiếu, whitespace, email/phone/name, terms missing/false, OTP 5/6/7 và token 128/129; xác nhận payload sai không gọi repository/hash/email và malformed OTP không tiêu hao attempt (REQ-01, REQ-AUTH-08, REQ-AUTH-09, REQ-AUTH-13).
- [ ] T-VAL-06 — Viết frontend unit tests xác nhận lỗi inline và không gọi API khi form sai; regression login tài khoản cũ, registration/OTP hợp lệ; chạy targeted tests và build hai project (REQ-01, REQ-AUTH-09, REQ-AUTH-13).

## Luồng access và refresh trên Users (phạm vi thu gọn theo yêu cầu người dùng)
- [x] T-TOKEN-01 — Gỡ các bảng/entity/store/mapping/migration quản lý nhiều thiết bị vừa thêm; dùng RefreshToken và RefreshTokenExpiryTime hiện có trên Users.
- [x] T-TOKEN-02 — Access mặc định 15 phút, refresh cố định 7 ngày, lưu hash token mới và hỗ trợ token cũ; refresh chỉ cấp access mới; đồng bộ hạn cookie, logout và reset password.
- [x] T-TOKEN-03 — Chia sẻ cơ chế refresh giữa API thường và tài chính, replay tối đa một lần, giữ trạng thái và thông báo thử lại khi lỗi tạm thời.
- [x] T-TOKEN-04 — Build backend/frontend, rà diff, cập nhật worklog/CHANGELOG. Người dùng yêu cầu dừng viết và chạy thêm test.
