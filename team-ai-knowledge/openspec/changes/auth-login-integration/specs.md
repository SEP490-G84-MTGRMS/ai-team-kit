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

- Sau khi hoàn tất xác thực, Backend MUST tạo phiên riêng cho từng lần đăng nhập, liên kết tài khoản và ngữ cảnh tenant.
- Access token MUST có hạn 15 phút, chứa `sessionId`.
- Refresh token MUST hết hạn sau 7 ngày kể từ lần cấp hoặc refresh thành công. Phiên MUST kết thúc tối đa 30 ngày tính từ lần đăng nhập ban đầu.
- Refresh token MUST được sinh bằng bộ sinh số ngẫu nhiên mật mã. Backend MUST lưu hash cùng thời hạn và trạng thái phiên.
- Token MUST được truyền bằng HttpOnly cookies, bật Secure trên HTTPS production. Cookie MUST hoạt động với các đường dẫn auth được hỗ trợ.
- Backend MUST kiểm tra trạng thái phiên và quyền truy cập tài khoản, tenant khi xác thực yêu cầu.

#### Scenario: Đăng nhập trên hai thiết bị
- GIVEN tài khoản có một phiên hợp lệ
- WHEN đăng nhập thành công trên thiết bị khác
- THEN tạo phiên riêng và giữ phiên trước tiếp tục hoạt động.

#### Scenario: Phiên đạt giới hạn tuyệt đối
- GIVEN phiên đã đủ 30 ngày
- WHEN yêu cầu refresh
- THEN từ chối và yêu cầu đăng nhập lại.

### Requirement: REQ-AUTH-SESSION-02 Refresh và xoay vòng token an toàn

- Refresh thành công MUST cấp cặp token mới và vô hiệu hóa refresh token đã sử dụng bằng thao tác nguyên tử.
- Các yêu cầu đồng thời dùng cùng refresh token MUST có tối đa một lần xoay vòng thành công.
- Yêu cầu cạnh tranh MUST nhận kết quả xung đột riêng, cho phép client chờ phiên vừa được cập nhật rồi thử lại một lần.
- Backend MUST lưu dấu vết token đã dùng. Việc sử dụng lại token sau khoảng xử lý cạnh tranh MUST thu hồi phiên liên quan.
- Thời hạn refresh mới MUST nằm trong giới hạn tuyệt đối của phiên.
- Token hết hạn, bị thu hồi hoặc không hợp lệ MUST trả HTTP 401 và xóa cookies tương ứng.

#### Scenario: Hai yêu cầu refresh đồng thời
- GIVEN hai yêu cầu cùng sử dụng một refresh token
- WHEN Backend xử lý đồng thời
- THEN chỉ một yêu cầu xoay vòng thành công và dữ liệu phiên nhất quán.

### Requirement: REQ-AUTH-SESSION-03 Tự khôi phục phiên và thu hồi phiên

- Các API client, bao gồm API tài chính, MUST dùng chung cơ chế xử lý refresh.
- Khi API trả HTTP 401, Frontend MUST thực hiện một yêu cầu refresh và cho các yêu cầu còn lại chờ kết quả. Mỗi yêu cầu ban đầu được gửi lại tối đa một lần.
- Các tab cùng trình duyệt MUST phối hợp refresh để hạn chế cạnh tranh.
- Refresh bị từ chối vì phiên hết hiệu lực MUST xóa trạng thái đăng nhập và chuyển tới trang đăng nhập, giữ đường dẫn quay lại hợp lệ trong ứng dụng.
- Lỗi mạng, HTTP 429 hoặc HTTP 5xx khi refresh MUST hiển thị lỗi có thể thử lại và giữ trạng thái phiên phía client.
- Đăng xuất MUST thu hồi phiên hiện tại. Đổi hoặc đặt lại mật khẩu, khóa tài khoản MUST thu hồi toàn bộ phiên của tài khoản.
- Unit test MUST kiểm tra thời hạn, rotation, refresh đồng thời, gửi lại yêu cầu, lỗi mạng và thu hồi phiên.

#### Scenario: Access token hết hạn
- GIVEN refresh token còn hiệu lực
- WHEN API trả HTTP 401
- THEN Frontend refresh, cập nhật cookies và gửi lại yêu cầu ban đầu.

#### Scenario: Máy chủ tạm thời lỗi
- GIVEN refresh trả HTTP 503
- WHEN Frontend xử lý kết quả
- THEN hiển thị lỗi và cho phép thử lại.

## Lịch sử
- 2026-11-13 · `sep-refactor:Cập-nhật-REQ-AUTH-08,-REQ-AUTH-09,-REQ-A` · +0 ~3 -0
- 2026-11-14 · `sep-refactor:Bổ-sung-quản-lý-phiên-theo-thiết-bị,-acc` · +3 ~0 -0
