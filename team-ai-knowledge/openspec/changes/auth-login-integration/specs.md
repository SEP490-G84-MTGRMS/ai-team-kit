# Spec: identity

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-AUTH-12 Quản lý trạng thái 2FA trong Settings
Hệ thống MUST cung cấp trong Settings một công tắc cho phép người dùng đã đăng nhập bật hoặc tắt 2FA của chính tài khoản.

1. Người dùng chỉ được thay đổi thiết lập 2FA của chính mình, không phụ thuộc vai trò và không được thay đổi tài khoản khác.
2. Trước khi bật hoặc tắt, hệ thống MUST xác minh lại mật khẩu hiện tại và Email OTP.
3. Không cho phép bật 2FA nếu tài khoản chưa có email đã xác minh.
4. Trạng thái 2FA MUST được lưu bền vững theo từng tài khoản.
5. Mọi lần bật/tắt MUST ghi audit log gồm tài khoản, hành động, thời gian và địa chỉ IP; không ghi mật khẩu hoặc OTP.
6. Để giữ nguyên hành vi bảo mật hiện tại, tài khoản đang tồn tại mặc định được xem là đã bật 2FA.

#### Scenario: Bật 2FA cho chính tài khoản
- GIVEN người dùng đã đăng nhập và email đã xác minh
- WHEN xác nhận đúng mật khẩu và Email OTP trong Settings
- THEN hệ thống MUST bật 2FA và ghi audit log.

#### Scenario: Tắt 2FA cho chính tài khoản
- GIVEN người dùng đã đăng nhập và 2FA đang bật
- WHEN xác nhận đúng mật khẩu và Email OTP trong Settings
- THEN hệ thống MUST tắt 2FA và ghi audit log.

#### Scenario: Thay đổi thiết lập của tài khoản khác
- GIVEN người dùng gửi yêu cầu thay đổi 2FA cho tài khoản không phải của mình
- WHEN Backend xử lý yêu cầu
- THEN hệ thống MUST từ chối với HTTP 403.

### Requirement: REQ-AUTH-08 Xác thực 2 bước (2FA) qua Email OTP khi Đăng nhập
Hệ thống MUST kiểm tra trạng thái 2FA của chính tài khoản sau khi xác thực đúng mật khẩu:

1. Nếu 2FA đang bật, Backend MUST sinh OTP 6 chữ số, lưu cache với TTL 5 phút, gửi qua `IEmailService` và trả về:
   `{ requiresOtp: true, tempToken: "...", emailMasked: "..." }`.
2. Nếu 2FA đang tắt, Backend MUST cấp token/cookie và hoàn tất đăng nhập ngay, không sinh OTP.
3. OTP hợp lệ MUST bị hủy sau khi sử dụng.
4. Nhập sai OTP 5 lần MUST hủy OTP và yêu cầu đăng nhập lại.

#### Scenario: Đăng nhập khi 2FA đang bật
- GIVEN tài khoản hợp lệ có 2FA đang bật
- WHEN đăng nhập bằng đúng mật khẩu
- THEN hệ thống MUST gửi Email OTP và yêu cầu xác thực bước hai.

#### Scenario: Đăng nhập khi 2FA đang tắt
- GIVEN tài khoản hợp lệ có 2FA đang tắt
- WHEN đăng nhập bằng đúng mật khẩu
- THEN hệ thống MUST hoàn tất đăng nhập mà không gửi OTP.

#### Scenario: Xác thực OTP thành công
- GIVEN `tempToken` và OTP còn hiệu lực
- WHEN gửi đúng OTP tới `POST /api/auth/login/verify-otp`
- THEN hệ thống MUST cấp phiên đăng nhập và hủy OTP.

#### Scenario: Nhập sai OTP quá 5 lần
- GIVEN người dùng đã nhập sai OTP 5 lần
- WHEN thực hiện lần thử thứ 6
- THEN hệ thống MUST hủy OTP và yêu cầu đăng nhập lại.

## Lịch sử
- 2026-11-11 · `sep-refactor:Mở-rộng-2FA-từ-bắt-buộc-sang-cấu-hình-th` · +1 ~1 -0
