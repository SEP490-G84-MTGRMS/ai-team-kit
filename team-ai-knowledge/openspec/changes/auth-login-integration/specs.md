# Specs: auth-login-integration

## API / Contract
| Method | Path | Request Body | Response Body | Cookie / Header | HTTP Lỗi |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/login` (hoặc `/api/auth/login`) | `LoginRequest` (`usernameOrEmail`, `password`, `tenantCode?`) | `ApiResponse<LoginInitResponse>` (`requiresOtp: true`, `tempToken`, `emailMasked`, `expiresInSeconds`, `devOtp?`) | - | 400 Bad Request, 401 Unauthorized |
| POST | `/api/v1/auth/login/verify-otp` (hoặc `/api/auth/login/verify-otp`) | `VerifyLoginOtpRequest` (`tempToken`, `otpCode`) | `ApiResponse<UserInfo>` (`id`, `fullName`, `roleName`, `storeName`, `tenantId`, `accessToken?`) | `access_token` (HttpOnly), `refresh_token` (HttpOnly) | 400 Bad Request, 401 Unauthorized |
| POST | `/api/v1/auth/register/send-otp` (hoặc `/api/auth/register/send-otp`) | `SendEmailOtpRequest` (`email`, `fullName?`, `storeName?`) | `ApiResponse<{ success: true, message: string, devOtp?: string }>` | - | 400 Bad Request |
| POST | `/api/v1/auth/register` (hoặc `/api/auth/register`) | `RegisterTenantRequest` (`fullName`, `storeName`, `phone`, `email`, `password`, `otpCode`) | `ApiResponse<AuthResponse>` | `access_token`, `refresh_token` | 400 Bad Request |
| POST | `/api/v1/auth/refresh` (hoặc `/api/auth/refresh`) | Không có body (Đọc từ Cookie) | `ApiResponse<UserInfo>` | Cặp cookie `access_token` và `refresh_token` mới | 401 Unauthorized |
| GET | `/api/v1/auth/me` (hoặc `/api/auth/me`) | Không có body | `ApiResponse<UserInfo>` | - | 401 Unauthorized |
| POST | `/api/v1/auth/logout` | Không có body | `ApiResponse<{ success: true, message: string }>` | Xóa cookies (`Max-Age=0`) | 400 Bad Request |

## ADDED Requirements

### Requirement: REQ-01 Xác thực Đăng nhập & Cấp phát HttpOnly Cookies
Hệ thống Backend MUST cung cấp API xác thực tài khoản qua username/email và mật khẩu, cấp phát Access Token (thời hạn 15–60 phút) và Refresh Token (thời hạn 7–30 ngày) **dưới dạng HttpOnly Cookies**, tuyệt đối không trả chuỗi token nhạy cảm trong response body.

#### Scenario: Đăng nhập thành công với tài khoản quản trị Admin
- GIVEN tài khoản admin tồn tại trong bảng users với Username `"admin"` và Mật khẩu `"Admin@123"`
- WHEN người dùng gửi yêu cầu POST tới `/api/v1/auth/login` với `{ usernameOrEmail: "admin", password: "Admin@123" }`
- THEN hệ thống MUST:
  1. Trả về HTTP 200 OK kèm payload `UserInfo` (`id == "usr_super_admin_01"`, `roleName == "ADMIN"`).
  2. Đính kèm header `Set-Cookie` cho `access_token` với các thuộc tính `HttpOnly`, `SameSite=Lax`, `Path=/`.
  3. Đính kèm header `Set-Cookie` cho `refresh_token` với các thuộc tính `HttpOnly`, `SameSite=Lax`, `Path=/api/auth`.
  4. Response body MUST NOT chứa bất kỳ trường token nào (`accessToken`, `refreshToken`).

---

### Requirement: REQ-AUTH-08 Xác thực 2 bước (2FA) qua Email OTP khi Đăng nhập
Hệ thống MUST triển khai cơ chế xác thực hai bước (2FA) bằng mã OTP gửi về Email khi đăng nhập:
1. Khi gọi `POST /api/auth/login`, Backend kiểm tra thông tin đăng nhập. Nếu hợp lệ, sinh mã OTP 6 chữ số lưu trong cache (TTL 5 phút) và gửi email qua `IEmailService`.
2. Trả về `{ requiresOtp: true, tempToken: "...", emailMasked: "..." }`.
3. Khi gọi `POST /api/auth/login/verify-otp` với đúng `tempToken` và `otpCode`, Backend xác thực thành công, hủy mã OTP khỏi cache, cấp token/cookie và trả về thông tin `user`.

#### Scenario: Đăng nhập bước 1 đúng mật khẩu
- GIVEN tài khoản hợp lệ có email `"owner@mtmart.vn"`
- WHEN gửi `POST /api/auth/login` với đúng mật khẩu
- THEN hệ thống MUST sinh mã OTP 6 chữ số, gửi email tới `"owner@mtmart.vn"` (kèm in console log nếu chưa có SMTP) và trả về `requiresOtp: true` cùng `tempToken`.

#### Scenario: Xác thực OTP đăng nhập bước 2 thành công
- GIVEN `tempToken` hợp lệ và mã OTP còn trong thời hạn 5 phút
- WHEN gửi `POST /api/auth/login/verify-otp` với mã OTP chính xác
- THEN hệ thống MUST trả về HTTP 200 OK, thiết lập phiên đăng nhập và điều hướng người dùng tới Dashboard theo đúng vai trò.

#### Scenario: Nhập sai mã OTP quá 5 lần
- GIVEN người dùng cố tình nhập sai mã OTP 5 lần liên tiếp
- WHEN gửi lần thử thứ 6
- THEN hệ thống MUST hủy mã OTP trong cache và trả về lỗi 400 yêu cầu đăng nhập lại từ đầu.

---

### Requirement: REQ-AUTH-09 Xác thực Email OTP khi Đăng ký Cửa hàng Mới
Hệ thống MUST xác thực quyền sở hữu Email của chủ cửa hàng thông qua mã OTP trước khi cho phép tạo Cửa hàng (`Tenant`), Chi nhánh (`Branch`) và Tài khoản chủ sở hữu (`StoreOwner`).

#### Scenario: Gửi mã OTP kích hoạt đăng ký
- GIVEN người dùng nhập thông tin đăng ký hợp lệ với Email `"newstore@gmail.com"`
- WHEN gọi `POST /api/auth/register/send-otp`
- THEN hệ thống MUST tạo mã OTP 6 số, lưu vào cache `otp:register:newstore@gmail.com` và gửi email kích hoạt qua `IEmailService`.

#### Scenario: Hoàn tất đăng ký với mã OTP Email hợp lệ
- GIVEN mã OTP hợp lệ trong cache
- WHEN gọi `POST /api/auth/register` kèm đầy đủ thông tin và `otpCode` chính xác
- THEN hệ thống MUST:
  1. Tạo mới Tenant, Branch mặc định và User chủ cửa hàng (Role `StoreOwner`).
  2. Xóa mã OTP khỏi cache.
  3. Cấp phiên đăng nhập tự động và trả về HTTP 200 OK.

---

### Requirement: REQ-AUTH-10 Loại Bỏ Hoàn Toàn SMS & TextBee Gateway
Hệ thống Backend và Frontend MUST gỡ bỏ toàn bộ sự phụ thuộc vào SMS, Twilio, Firebase Phone Auth và TextBee Gateway:
- Gỡ bỏ `TextBeeSmsService.cs`, `TextBeeSettings.cs`, `ISmsService.cs`.
- Xóa các biến môi trường `TextBeeSettings__*` trong `.env`.
- Toàn bộ việc gửi mã xác thực đều đi qua `IEmailService`.

---

### Requirement: REQ-AUTH-11 Giao Diện Modal OTP Chuẩn KiotViet & Hỗ Trợ Dev Fallback
Giao diện Modal OTP (`LoginOtpModal.tsx` và `RegistrationOtpModal.tsx`) MUST tuân thủ nghiêm ngặt `RULE_UI_DESIGN_SYSTEM.md`:
- Nút bấm bo tròn Full Pill (`border-radius: 9999px`), ô nhập số phông `JetBrains Mono` bo góc `12px`.
- Modal nằm tĩnh (Static & Grounded), tuyệt đối KHÔNG có animation nhún nhảy / rung lắc.
- Sử dụng 100% Monochrome SVG Icons, không dùng emoji.
- Khi chạy ở môi trường Development hoặc khi Backend trả về `devOtp`, hiển thị nút "Điền nhanh OTP Dev" để hỗ trợ kiểm thử và chấm đồ án thuận tiện.

---

## Acceptance checklist
- [ ] REQ-01: API login cấp phát HttpOnly cookies an toàn.
- [ ] REQ-AUTH-08: Đăng nhập 2 bước (2FA) qua Email OTP: Step 1 trả về `tempToken` + gửi email; Step 2 `POST /api/auth/login/verify-otp` xác thực thành công.
- [ ] REQ-AUTH-09: Đăng ký cửa hàng gửi OTP tới Email và hoàn tất mở cửa hàng khi nhập đúng mã.
- [ ] REQ-AUTH-10: Gỡ bỏ hoàn toàn TextBee / SMS khỏi backend và frontend.
- [ ] REQ-AUTH-11: `LoginOtpModal.tsx` và `RegistrationOtpModal.tsx` tuân thủ KiotViet Design System, có nút "Điền nhanh OTP Dev".
- [ ] BE-UT: Toàn bộ Unit Tests trong `UserAuthenticationTests.cs` (login 2FA, register email OTP) đạt PASS 100%.
- [ ] FE-BUILD: `npm run build` trên `MT_GRMS_FRONTEND` đạt 0 errors.
