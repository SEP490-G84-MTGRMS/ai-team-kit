# Specs: auth-login-integration

## API / Contract
| Method | Path | Request Body | Response Body | Cookie / Header | HTTP Lỗi |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/login` (hoặc `/api/auth/login`) | `LoginRequest` (`usernameOrEmail`, `password`, `tenantCode?`) | `ApiResponse<LoginInitResponse>` (`requiresOtp: true`, `tempToken`, `emailMasked`, `expiresInSeconds`, `devOtp?`) nếu bật 2FA; `requiresOtp: false` + `UserInfo` nếu tắt | - | 400 Bad Request, 401 Unauthorized |
| POST | `/api/v1/auth/login/verify-otp` (hoặc `/api/auth/login/verify-otp`) | `VerifyLoginOtpRequest` (`tempToken`, `otpCode`) | `ApiResponse<UserInfo>` (`id`, `fullName`, `roleName`, `storeName`, `tenantId`, `accessToken?`) | `access_token` (HttpOnly), `refresh_token` (HttpOnly) | 400 Bad Request, 401 Unauthorized |
| POST | `/api/v1/auth/register/send-otp` (hoặc `/api/auth/register/send-otp`) | `SendEmailOtpRequest` (`email`, `fullName?`, `storeName?`) | `ApiResponse<{ success: true, message: string, devOtp?: string }>` | - | 400 Bad Request |
| POST | `/api/v1/auth/register` (hoặc `/api/auth/register`) | `RegisterTenantRequest` (`fullName`, `storeName`, `phone`, `email`, `password`, `otpCode`) | `ApiResponse<AuthResponse>` | `access_token`, `refresh_token` | 400 Bad Request |
| POST | `/api/v1/auth/refresh` (hoặc `/api/auth/refresh`) | Không có body (Đọc từ Cookie) | `ApiResponse<UserInfo>` | Cặp cookie `access_token` và `refresh_token` mới | 401 Unauthorized |
| GET | `/api/v1/auth/me` (hoặc `/api/auth/me`) | Không có body | `ApiResponse<UserInfo>` | - | 401 Unauthorized |
| POST | `/api/v1/auth/logout` | Không có body | `ApiResponse<{ success: true, message: string }>` | Xóa cookies (`Max-Age=0`) | 400 Bad Request |

## API bổ sung cho Settings
| Method | Path | Request Body | Response Body | HTTP Lỗi |
|---|---|---|---|---|
| GET | `/api/auth/me/2fa` | Không | `{ enabled, emailMasked, emailVerified }` | 401 |
| POST | `/api/auth/me/2fa/challenge` | `{ enabled, currentPassword }` | `{ challengeToken, emailMasked, expiresInSeconds }` | 400, 401, 429 |
| POST | `/api/auth/me/2fa/confirm` | `{ challengeToken, otpCode }` | `{ enabled }` | 400, 401, 403, 429 |

## ADDED Requirements

### Requirement: REQ-01 Xác thực Đăng nhập & Cấp phát HttpOnly Cookies
Hệ thống Backend MUST cung cấp API xác thực tài khoản qua username/email và mật khẩu, cấp phát Access Token (thời hạn 15–60 phút) và Refresh Token (thời hạn 7–30 ngày) **dưới dạng HttpOnly Cookies**, tuyệt đối không trả chuỗi token nhạy cảm trong response body.

Backend MUST từ chối trước khi truy vấn nếu `usernameOrEmail` sau trim không dài 1–254 ký tự hoặc `password` không dài 1–128 ký tự. Password không được trim/biến đổi và đăng nhập không áp lại độ mạnh mật khẩu đăng ký. Sai credentials MUST dùng thông báo chung, không lộ tài khoản tồn tại.

#### Scenario: Payload đăng nhập vượt giới hạn
- GIVEN identifier dài hơn 254 hoặc password dài hơn 128 ký tự
- WHEN gọi API đăng nhập
- THEN trả HTTP 400 trước khi truy vấn xác thực.

#### Scenario: Đăng nhập thành công với tài khoản quản trị Admin
- GIVEN tài khoản admin hợp lệ có 2FA tắt trong môi trường kiểm thử
- WHEN người dùng gửi yêu cầu POST tới `/api/v1/auth/login` với credentials hợp lệ của admin
- THEN hệ thống MUST:
  1. Trả về HTTP 200 OK với `requiresOtp: false` và payload `UserInfo` (`id == "usr_super_admin_01"`, `roleName == "ADMIN"`).
  2. Đính kèm header `Set-Cookie` cho `access_token` với các thuộc tính `HttpOnly`, `SameSite=Lax`, `Path=/`.
  3. Đính kèm header `Set-Cookie` cho `refresh_token` với các thuộc tính `HttpOnly`, `SameSite=Lax`, `Path=/api/auth`.
  4. Response body MUST NOT chứa bất kỳ trường token nào (`accessToken`, `refreshToken`).

---

### Requirement: REQ-AUTH-08 Xác thực 2 bước (2FA) qua Email OTP khi Đăng nhập
Sau khi kiểm tra đúng mật khẩu, Backend MUST đọc trạng thái 2FA của chính tài khoản từ dữ liệu bền vững.
1. Nếu bật, sinh OTP 6 chữ số bằng CSPRNG, lưu hash trong challenge gắn UserId, TTL 5 phút, gửi qua `IEmailService`; trả `requiresOtp: true`, `tempToken`, `emailMasked`. Không cấp phiên trước khi xác minh OTP.
2. Nếu tắt, hoàn tất đăng nhập và cấp HttpOnly cookies theo REQ-01; không sinh hoặc gửi OTP đăng nhập.
3. `POST /api/auth/login/verify-otp` MUST giới hạn tối đa 5 lần nhập sai; challenge hết hạn hoặc đã dùng bị từ chối. Xác minh đúng MUST tiêu thụ challenge một lần trước khi cấp phiên. Không trả OTP/token nhạy cảm trong body production.
4. Email OTP đăng ký ở REQ-AUTH-09 độc lập với trạng thái 2FA đăng nhập.
5. `otpCode` MUST đúng 6 chữ số ASCII; `tempToken` MUST không trống và tối đa 128 ký tự. Sai định dạng bị từ chối trước khi tra cứu và không tiêu hao lượt thử.

#### Scenario: Đăng nhập khi 2FA bật
- GIVEN tài khoản hợp lệ có 2FA bật
- WHEN đăng nhập bằng đúng mật khẩu
- THEN gửi Email OTP, trả `requiresOtp: true` cùng `tempToken`, chưa cấp phiên.

#### Scenario: Đăng nhập khi 2FA tắt
- GIVEN tài khoản hợp lệ có 2FA tắt
- WHEN đăng nhập bằng đúng mật khẩu
- THEN cấp HttpOnly cookies và UserInfo, trả `requiresOtp: false`, không gửi OTP.

#### Scenario: Xác thực OTP đăng nhập thành công
- GIVEN challenge đúng tài khoản và OTP còn hiệu lực
- WHEN gửi đúng OTP tới `POST /api/auth/login/verify-otp`
- THEN cấp phiên và hủy challenge; gửi lại cùng challenge MUST bị từ chối.

#### Scenario: OTP sai hoặc hết hạn
- GIVEN OTP đã sai 5 lần hoặc challenge quá 5 phút
- WHEN thử xác minh tiếp
- THEN từ chối, hủy challenge và không cấp phiên.

#### Scenario: OTP sai định dạng
- GIVEN OTP không đúng 6 chữ số ASCII
- WHEN xác minh
- THEN trả HTTP 400, không tra cứu challenge và không tăng số lần thử.

---

### Requirement: REQ-AUTH-09 Xác thực Email OTP khi Đăng ký Cửa hàng Mới
Hệ thống MUST xác thực quyền sở hữu Email của chủ cửa hàng thông qua mã OTP trước khi cho phép tạo Cửa hàng (`Tenant`), Chi nhánh (`Branch`) và Tài khoản chủ sở hữu (`StoreOwner`).

Backend MUST kiểm tra độc lập: họ tên 2–100 ký tự; tên cửa hàng 2–150; email hợp lệ tối đa 100 ký tự theo schema hiện tại; số điện thoại canonical 10 chữ số khớp `^(03|05|07|08|09)\d{8}# Specs: auth-login-integration

## API / Contract
| Method | Path | Request Body | Response Body | Cookie / Header | HTTP Lỗi |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/login` (hoặc `/api/auth/login`) | `LoginRequest` (`usernameOrEmail`, `password`, `tenantCode?`) | `ApiResponse<LoginInitResponse>` (`requiresOtp: true`, `tempToken`, `emailMasked`, `expiresInSeconds`, `devOtp?`) nếu bật 2FA; `requiresOtp: false` + `UserInfo` nếu tắt | - | 400 Bad Request, 401 Unauthorized |
| POST | `/api/v1/auth/login/verify-otp` (hoặc `/api/auth/login/verify-otp`) | `VerifyLoginOtpRequest` (`tempToken`, `otpCode`) | `ApiResponse<UserInfo>` (`id`, `fullName`, `roleName`, `storeName`, `tenantId`, `accessToken?`) | `access_token` (HttpOnly), `refresh_token` (HttpOnly) | 400 Bad Request, 401 Unauthorized |
| POST | `/api/v1/auth/register/send-otp` (hoặc `/api/auth/register/send-otp`) | `SendEmailOtpRequest` (`email`, `fullName?`, `storeName?`) | `ApiResponse<{ success: true, message: string, devOtp?: string }>` | - | 400 Bad Request |
| POST | `/api/v1/auth/register` (hoặc `/api/auth/register`) | `RegisterTenantRequest` (`fullName`, `storeName`, `phone`, `email`, `password`, `otpCode`) | `ApiResponse<AuthResponse>` | `access_token`, `refresh_token` | 400 Bad Request |
| POST | `/api/v1/auth/refresh` (hoặc `/api/auth/refresh`) | Không có body (Đọc từ Cookie) | `ApiResponse<UserInfo>` | Cặp cookie `access_token` và `refresh_token` mới | 401 Unauthorized |
| GET | `/api/v1/auth/me` (hoặc `/api/auth/me`) | Không có body | `ApiResponse<UserInfo>` | - | 401 Unauthorized |
| POST | `/api/v1/auth/logout` | Không có body | `ApiResponse<{ success: true, message: string }>` | Xóa cookies (`Max-Age=0`) | 400 Bad Request |

## API bổ sung cho Settings
| Method | Path | Request Body | Response Body | HTTP Lỗi |
|---|---|---|---|---|
| GET | `/api/auth/me/2fa` | Không | `{ enabled, emailMasked, emailVerified }` | 401 |
| POST | `/api/auth/me/2fa/challenge` | `{ enabled, currentPassword }` | `{ challengeToken, emailMasked, expiresInSeconds }` | 400, 401, 429 |
| POST | `/api/auth/me/2fa/confirm` | `{ challengeToken, otpCode }` | `{ enabled }` | 400, 401, 403, 429 |

## ADDED Requirements

### Requirement: REQ-01 Xác thực Đăng nhập & Cấp phát HttpOnly Cookies
Hệ thống Backend MUST cung cấp API xác thực tài khoản qua username/email và mật khẩu, cấp phát Access Token (thời hạn 15–60 phút) và Refresh Token (thời hạn 7–30 ngày) **dưới dạng HttpOnly Cookies**, tuyệt đối không trả chuỗi token nhạy cảm trong response body.

Backend MUST từ chối trước khi truy vấn nếu `usernameOrEmail` sau trim không dài 1–254 ký tự hoặc `password` không dài 1–128 ký tự. Password không được trim/biến đổi và đăng nhập không áp lại độ mạnh mật khẩu đăng ký. Sai credentials MUST dùng thông báo chung, không lộ tài khoản tồn tại.

#### Scenario: Payload đăng nhập vượt giới hạn
- GIVEN identifier dài hơn 254 hoặc password dài hơn 128 ký tự
- WHEN gọi API đăng nhập
- THEN trả HTTP 400 trước khi truy vấn xác thực.

#### Scenario: Đăng nhập thành công với tài khoản quản trị Admin
- GIVEN tài khoản admin hợp lệ có 2FA tắt trong môi trường kiểm thử
- WHEN người dùng gửi yêu cầu POST tới `/api/v1/auth/login` với credentials hợp lệ của admin
- THEN hệ thống MUST:
  1. Trả về HTTP 200 OK với `requiresOtp: false` và payload `UserInfo` (`id == "usr_super_admin_01"`, `roleName == "ADMIN"`).
  2. Đính kèm header `Set-Cookie` cho `access_token` với các thuộc tính `HttpOnly`, `SameSite=Lax`, `Path=/`.
  3. Đính kèm header `Set-Cookie` cho `refresh_token` với các thuộc tính `HttpOnly`, `SameSite=Lax`, `Path=/api/auth`.
  4. Response body MUST NOT chứa bất kỳ trường token nào (`accessToken`, `refreshToken`).

---

### Requirement: REQ-AUTH-08 Xác thực 2 bước (2FA) qua Email OTP khi Đăng nhập
Sau khi kiểm tra đúng mật khẩu, Backend MUST đọc trạng thái 2FA của chính tài khoản từ dữ liệu bền vững.
1. Nếu bật, sinh OTP 6 chữ số bằng CSPRNG, lưu hash trong challenge gắn UserId, TTL 5 phút, gửi qua `IEmailService`; trả `requiresOtp: true`, `tempToken`, `emailMasked`. Không cấp phiên trước khi xác minh OTP.
2. Nếu tắt, hoàn tất đăng nhập và cấp HttpOnly cookies theo REQ-01; không sinh hoặc gửi OTP đăng nhập.
3. `POST /api/auth/login/verify-otp` MUST giới hạn tối đa 5 lần nhập sai; challenge hết hạn hoặc đã dùng bị từ chối. Xác minh đúng MUST tiêu thụ challenge một lần trước khi cấp phiên. Không trả OTP/token nhạy cảm trong body production.
4. Email OTP đăng ký ở REQ-AUTH-09 độc lập với trạng thái 2FA đăng nhập.
5. `otpCode` MUST đúng 6 chữ số ASCII; `tempToken` MUST không trống và tối đa 128 ký tự. Sai định dạng bị từ chối trước khi tra cứu và không tiêu hao lượt thử.

#### Scenario: Đăng nhập khi 2FA bật
- GIVEN tài khoản hợp lệ có 2FA bật
- WHEN đăng nhập bằng đúng mật khẩu
- THEN gửi Email OTP, trả `requiresOtp: true` cùng `tempToken`, chưa cấp phiên.

#### Scenario: Đăng nhập khi 2FA tắt
- GIVEN tài khoản hợp lệ có 2FA tắt
- WHEN đăng nhập bằng đúng mật khẩu
- THEN cấp HttpOnly cookies và UserInfo, trả `requiresOtp: false`, không gửi OTP.

#### Scenario: Xác thực OTP đăng nhập thành công
- GIVEN challenge đúng tài khoản và OTP còn hiệu lực
- WHEN gửi đúng OTP tới `POST /api/auth/login/verify-otp`
- THEN cấp phiên và hủy challenge; gửi lại cùng challenge MUST bị từ chối.

#### Scenario: OTP sai hoặc hết hạn
- GIVEN OTP đã sai 5 lần hoặc challenge quá 5 phút
- WHEN thử xác minh tiếp
- THEN từ chối, hủy challenge và không cấp phiên.

#### Scenario: OTP sai định dạng
- GIVEN OTP không đúng 6 chữ số ASCII
- WHEN xác minh
- THEN trả HTTP 400, không tra cứu challenge và không tăng số lần thử.

---

### Requirement: REQ-AUTH-09 Xác thực Email OTP khi Đăng ký Cửa hàng Mới
; password 8–64 ký tự, không whitespace, có chữ hoa, chữ thường, số và ký tự đặc biệt; `agreeTerms` phải được truyền rõ ràng và bằng `true`; OTP đúng 6 chữ số. Frontend MUST phản hồi sớm cùng quy tắc nhưng Backend là nguồn có thẩm quyền. Validation chạy trước normalize/hash/query và lỗi không phản chiếu password/OTP.

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

#### Scenario: Dữ liệu đăng ký không hợp lệ
- GIVEN mật khẩu yếu, terms thiếu/false, hoặc tên/email/phone/OTP sai quy tắc
- WHEN gửi OTP hoặc hoàn tất đăng ký
- THEN Backend trả HTTP 400 và không tạo Tenant, Branch hoặc User.

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

### Requirement: REQ-AUTH-12 Quản lý trạng thái 2FA trong Settings
Hệ thống MUST hiển thị và cho người dùng đã đăng nhập bật/tắt 2FA của chính tài khoản.
1. Backend MUST suy ra UserId từ phiên; không dùng UserId do client truyền làm mục tiêu. Nếu nhận target khác tài khoản hiện tại MUST trả 403.
2. Trước mọi thay đổi MUST kiểm tra lại mật khẩu hiện tại và Email OTP của challenge riêng cho Settings, gắn UserId và action (enable/disable), TTL 5 phút, tối đa 5 lần sai, dùng một lần. Challenge cho action khác hoặc tài khoản khác MUST bị từ chối.
3. Giới hạn tần suất cấp OTP/thử sai theo user/IP; gửi lại phải vô hiệu hóa challenge cũ. Nếu gửi email lỗi, không đổi trạng thái. API dùng cookie MUST có CSRF protection.
4. Không cho bật nếu email chưa xác minh. Cờ 2FA lưu bền vững theo User; migration/backfill tài khoản hiện hữu và mặc định tài khoản mới là bật.
5. Confirm MUST cập nhật trạng thái và ghi audit log cùng giao dịch, gồm UserId, TenantId, action, thời gian UTC, IP, kết quả; không lưu mật khẩu, OTP, challenge token. Retry challenge cũ không đổi trạng thái hay ghi thêm audit thành công.
6. UI chỉ phản ánh trạng thái mới sau confirm thành công; xử lý loading, email chưa xác minh, sai mật khẩu/OTP, hết hạn và lỗi gửi email.

#### Scenario: Bật 2FA
- GIVEN người dùng đã đăng nhập, email đã xác minh và 2FA đang tắt
- WHEN xác nhận đúng mật khẩu và OTP challenge enable của chính tài khoản
- THEN bật 2FA và ghi một audit log thành công.

#### Scenario: Tắt 2FA
- GIVEN người dùng đã đăng nhập và 2FA đang bật
- WHEN xác nhận đúng mật khẩu và OTP challenge disable của chính tài khoản
- THEN tắt 2FA và ghi một audit log thành công.

#### Scenario: Từ chối tài khoản/hành động khác
- GIVEN challenge thuộc UserId hoặc action khác, hoặc client yêu cầu đổi tài khoản khác
- WHEN gọi confirm
- THEN từ chối (403 khi target khác), không đổi trạng thái hay ghi audit thành công.

#### Scenario: Chống thử sai và replay
- GIVEN challenge sai OTP 5 lần, hết hạn, đã dùng hoặc đã bị thay bằng lần gửi lại
- WHEN gọi confirm
- THEN từ chối, không thay đổi trạng thái hay ghi thêm audit thành công.

#### Scenario: Email chưa xác minh hoặc gửi thất bại
- GIVEN email chưa xác minh khi bật, hoặc dịch vụ email không gửi được challenge
- WHEN yêu cầu bật/tắt
- THEN trả lỗi phù hợp và giữ nguyên trạng thái.

---

### Requirement: REQ-AUTH-13 Đồng bộ Validation Authentication
Validation MUST được tái sử dụng cho login, login OTP, registration send/verify OTP và register. Backend MUST kiểm tra độc lập trước repository, password hasher, challenge mutation hoặc email service.

#### Scenario: Bypass Frontend
- GIVEN client gọi trực tiếp API với payload sai
- WHEN Backend nhận request
- THEN từ chối và không query, gửi email hoặc thay đổi dữ liệu.

---

## Acceptance checklist
- [ ] REQ-01: API login cấp phát HttpOnly cookies an toàn.
- [ ] REQ-AUTH-08: Đăng nhập 2 bước (2FA) qua Email OTP: Step 1 trả về `tempToken` + gửi email; Step 2 `POST /api/auth/login/verify-otp` xác thực thành công.
- [ ] REQ-AUTH-09: Đăng ký cửa hàng gửi OTP tới Email và hoàn tất mở cửa hàng khi nhập đúng mã.
- [ ] REQ-AUTH-10: Gỡ bỏ hoàn toàn TextBee / SMS khỏi backend và frontend.
- [ ] REQ-AUTH-11: `LoginOtpModal.tsx` và `RegistrationOtpModal.tsx` tuân thủ KiotViet Design System, có nút "Điền nhanh OTP Dev".
- [ ] REQ-AUTH-12: Settings bật/tắt sau mật khẩu + OTP, giới hạn ownership, CSRF, chống replay và ghi audit transaction.
- [ ] REQ-AUTH-13: Validation dùng chung ở frontend/backend; payload sai không chạm repository/hash/challenge/email.
- [ ] REQ-AUTH-08: Trạng thái tắt bỏ qua OTP và cấp cookie; trạng thái bật vẫn xác minh OTP một lần.
- [ ] BE-UT: Toàn bộ Unit Tests trong `UserAuthenticationTests.cs` (login 2FA, register email OTP) đạt PASS 100%.
- [ ] FE-BUILD: `npm run build` trên `MT_GRMS_FRONTEND` đạt 0 errors.
