# Spec: identity

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-AUTH-08 Xác thực 2 bước (2FA) qua Email OTP khi Đăng nhập
Sau khi kiểm tra đúng mật khẩu, Backend MUST đọc trạng thái 2FA của chính tài khoản từ dữ liệu bền vững.
1. Nếu bật, sinh OTP 6 chữ số bằng CSPRNG, lưu hash trong challenge gắn UserId, TTL 5 phút. Backend MUST lưu challenge và kích hoạt gửi email qua `IEmailService` theo cơ chế Non-Blocking / Background Task (hoặc trả response ngay sau khi enqueue email dispatch), trả về `requiresOtp: true`, `tempToken`, `emailMasked` cho client với độ trễ phản hồi < 100ms. Không bắt HTTP request chờ kết nối SMTP hoàn tất. Không cấp phiên trước khi xác minh OTP.
2. Nếu `SmtpUser` hoặc `SmtpPass` trống trong môi trường Development, Backend MUST ghi log / in console ngay lập tức và trả về `devOtpCode`, tuyệt đối không thử mở kết nối SMTP gây timeout blocking.
3. Nếu tắt, hoàn tất đăng nhập và cấp HttpOnly cookies theo REQ-01; không sinh hoặc gửi OTP đăng nhập.
4. `POST /api/auth/login/verify-otp` MUST giới hạn tối đa 5 lần nhập sai; challenge hết hạn hoặc đã dùng bị từ chối. Xác minh đúng MUST tiêu thụ challenge một lần trước khi cấp phiên. Không trả OTP/token nhạy cảm trong body production.
5. Email OTP đăng ký ở REQ-AUTH-09 độc lập với trạng thái 2FA đăng nhập.
6. `otpCode` MUST đúng 6 chữ số ASCII; `tempToken` MUST không trống và tối đa 128 ký tự. Sai định dạng bị từ chối trước khi tra cứu và không tiêu hao lượt thử.

#### Scenario: Đăng nhập khi 2FA bật
- GIVEN tài khoản hợp lệ có 2FA bật
- WHEN đăng nhập bằng đúng mật khẩu
- THEN hệ thống lưu challenge và kích hoạt gửi Email OTP non-blocking, trả `requiresOtp: true` cùng `tempToken` ngay lập tức (< 100ms), chưa cấp phiên.

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
1. Backend MUST kiểm tra độc lập: họ tên 2–100 ký tự; tên cửa hàng 2–150; email hợp lệ tối đa 100 ký tự; số điện thoại canonical 10 chữ số khớp `^(03|05|07|08|09)\d{8}$`; password 8–64 ký tự, không whitespace, có chữ hoa, chữ thường, số và ký tự đặc biệt; `agreeTerms` phải được truyền rõ ràng và bằng `true`; OTP đúng 6 chữ số ASCII. Frontend MUST phản hồi sớm cùng quy tắc nhưng Backend là nguồn có thẩm quyền.
2. Khi gọi `POST /api/auth/register/send-otp`, Backend MUST lưu mã OTP vào cache/bộ nhớ và gửi email theo cơ chế Non-Blocking / Background Task, trả HTTP 200 OK ngay lập tức cho client. Nếu thiếu cấu hình SMTP ở môi trường Development, ghi log console ngay và trả `devOtpCode`, không để kết nối mạng SMTP làm chậm phản hồi.

#### Scenario: Gửi mã OTP kích hoạt đăng ký
- GIVEN người dùng nhập thông tin đăng ký hợp lệ với Email `"newstore@gmail.com"`
- WHEN gọi `POST /api/auth/register/send-otp`
- THEN hệ thống MUST tạo mã OTP 6 số, lưu vào cache `otp:register:newstore@gmail.com`, kích hoạt gửi email ngầm và trả HTTP 200 OK ngay lập tức (< 100ms) để mở modal OTP mà không bị treo giao diện.

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

### Requirement: REQ-AUTH-11 Giao Diện Modal OTP Chuẩn KiotViet & Hỗ Trợ Dev Fallback
Giao diện Modal OTP (`LoginOtpModal.tsx` và `RegistrationOtpModal.tsx`) MUST tuân thủ nghiêm ngặt `RULE_UI_DESIGN_SYSTEM.md`:
- Nút bấm bo tròn Full Pill (`border-radius: 9999px`), ô nhập số phông `JetBrains Mono` bo góc `12px`.
- Modal nằm tĩnh (Static & Grounded), tuyệt đối KHÔNG có animation nhún nhảy / rung lắc.
- Sử dụng 100% Monochrome SVG Icons, không dùng emoji.
- Khi người dùng bấm nút gửi/gửi lại OTP, Frontend hiển thị spinner loading mượt mà trên nút bấm và phản hồi mở modal tức thì mà không khóa đơ trình duyệt.
- Khi chạy ở môi trường Development hoặc khi Backend trả về `devOtpCode`, hiển thị nút "Điền nhanh OTP Dev" để hỗ trợ kiểm thử và chấm đồ án thuận tiện.

### Requirement: REQ-AUTH-SESSION-01 Quản lý thời hạn và phiên đăng nhập
Hệ thống MUST dùng các trường RefreshToken và RefreshTokenExpiryTime hiện có trên Users để quản lý một refresh token cho mỗi tài khoản.
- Access token mặc định có hạn 15 phút. Refresh token có hạn cố định 7 ngày tính từ lần đăng nhập hoặc đăng ký thành công.
- Refresh token mới MUST được tạo bằng CSPRNG và lưu hash trong trường RefreshToken hiện có. Token dạng cũ còn hạn MUST tiếp tục được xử lý tương thích; giá trị hash lưu trong DB MUST không được sử dụng trực tiếp như bearer token.
- Token MUST được truyền bằng HttpOnly cookies, Secure theo HTTPS. Cookie refresh MUST hoạt động với các đường dẫn auth được hỗ trợ.
- Đăng nhập thành công MUST thay thế refresh token hiện tại của tài khoản.
#### Scenario: Đăng nhập thành công
- GIVEN tài khoản đã hoàn tất xác thực mật khẩu và OTP nếu bật 2FA
- WHEN cấp thông tin đăng nhập
- THEN cấp access token và refresh token, lưu hash cùng hạn refresh trong Users.

### Requirement: REQ-AUTH-SESSION-02 Refresh và xoay vòng token an toàn
- Khi refresh token hợp lệ và tài khoản còn quyền hoạt động, Backend MUST cấp access token mới, giới hạn thời hạn access trong thời hạn refresh còn lại.
- Refresh thành công MUST giữ refresh token và thời hạn 7 ngày ban đầu. Refresh MUST không cập nhật ghi đè token trong Users.
- Khi refresh token hết hạn, không hợp lệ hoặc đã bị xóa, Backend MUST trả HTTP 401 và xóa cookies.
#### Scenario: Refresh thành công
- GIVEN access token hết hạn và refresh token còn hiệu lực
- WHEN gọi POST /api/auth/refresh
- THEN cấp access token mới và giữ nguyên refresh token cùng thời hạn.
#### Scenario: Refresh hết hạn
- GIVEN refresh token đã hết hạn
- WHEN gọi refresh
- THEN từ chối với HTTP 401 và yêu cầu đăng nhập lại.

### Requirement: REQ-AUTH-SESSION-03 Tự khôi phục phiên và thu hồi phiên
- Các API client thường và tài chính MUST dùng chung cơ chế refresh và chờ cùng yêu cầu refresh đang chạy trong một tab.
- Khi API trả HTTP 401, Frontend MUST thử refresh và gửi lại yêu cầu ban đầu tối đa một lần. API đăng nhập, đăng ký, refresh và logout MUST được loại khỏi vòng tự refresh.
- Refresh trả HTTP 401 MUST xóa trạng thái đăng nhập và chuyển đến trang đăng nhập, giữ đường dẫn quay lại nội bộ.
- Lỗi mạng, HTTP 429 hoặc HTTP 5xx khi refresh MUST giữ trạng thái đăng nhập và hiển thị thông báo cho phép thử lại.
- Đăng xuất và đặt lại mật khẩu MUST xóa refresh token trong Users. Đăng xuất MUST xử lý được refresh cookie khi access token đã hết hạn.
- Theo yêu cầu thu gọn của người dùng, kiểm chứng bằng build backend/frontend; dừng bổ sung test chi tiết cho quản lý phiên.
#### Scenario: Lỗi kết nối khi refresh
- GIVEN refresh gặp lỗi mạng hoặc HTTP 503
- WHEN Frontend xử lý lỗi
- THEN giữ trạng thái đăng nhập và hiển thị thông báo thử lại.

## Lịch sử
- 2026-11-13 · `sep-refactor:Cập-nhật-REQ-AUTH-08,-REQ-AUTH-09,-REQ-A` · +0 ~3 -0
- 2026-11-14 · `sep-refactor:Bổ-sung-quản-lý-phiên-theo-thiết-bị,-acc` · +3 ~0 -0
- 2026-11-14 · `sep-refactor:Theo-yêu-cầu-thu-gọn-của-người-dùng:-dùn` · +0 ~3 -0
