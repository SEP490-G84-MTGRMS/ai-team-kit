# Spec: identity

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-AUTH-13 Đồng bộ Validation Authentication
Các quy tắc validation authentication MUST được định nghĩa tập trung và tái sử dụng giữa endpoint gửi OTP, xác minh OTP và hoàn tất đăng ký. Backend MUST luôn kiểm tra độc lập, không tin dữ liệu đã được Frontend kiểm tra.

#### Scenario: Bỏ qua validation Frontend
- GIVEN client gọi trực tiếp API với payload không hợp lệ
- WHEN Backend tiếp nhận request
- THEN Backend MUST từ chối theo cùng chính sách validation và không thay đổi dữ liệu.

### Requirement: REQ-01 Xác thực Đăng nhập & Cấp phát HttpOnly Cookies
Ngoài cơ chế cấp HttpOnly Cookies hiện tại, Backend MUST validate request đăng nhập trước khi xác thực:

1. `usernameOrEmail` sau khi trim MUST dài từ 1–254 ký tự.
2. `password` MUST dài từ 1–128 ký tự và không được trim hoặc biến đổi.
3. Đăng nhập MUST NOT áp lại quy tắc độ mạnh mật khẩu của đăng ký, nhằm hỗ trợ tài khoản được tạo theo chính sách cũ.
4. Request vượt giới hạn MUST trả HTTP 400; sai thông tin xác thực MUST trả thông báo chung, không tiết lộ tài khoản có tồn tại hay không.

#### Scenario: Payload đăng nhập vượt giới hạn
- GIVEN `usernameOrEmail` dài hơn 254 ký tự hoặc mật khẩu dài hơn 128 ký tự
- WHEN gọi API đăng nhập
- THEN Backend MUST trả HTTP 400 và không thực hiện truy vấn xác thực.

### Requirement: REQ-AUTH-08 Xác thực 2 bước (2FA) qua Email OTP khi Đăng nhập
Giữ nguyên toàn bộ cơ chế 2FA hiện tại và bổ sung:

1. `otpCode` MUST gồm chính xác 6 chữ số ASCII.
2. `tempToken` MUST không trống và dài tối đa 128 ký tự.
3. Payload sai định dạng MUST bị từ chối trước khi tra cứu challenge.
4. OTP hợp lệ vẫn MUST dùng một lần, có TTL 5 phút và tối đa 5 lần nhập sai.

#### Scenario: OTP đăng nhập sai định dạng
- GIVEN OTP chứa chữ, ký tự đặc biệt hoặc không đủ 6 chữ số
- WHEN gọi `POST /api/auth/login/verify-otp`
- THEN Backend MUST trả HTTP 400 và không tăng số lần thử của challenge hợp lệ.

### Requirement: REQ-AUTH-09 Xác thực Email OTP khi Đăng ký Cửa hàng Mới
Ngoài xác thực quyền sở hữu email, Backend MUST kiểm tra toàn bộ dữ liệu đăng ký:

1. Họ tên sau khi trim dài 2–100 ký tự; cho phép chữ Unicode, khoảng trắng, dấu nháy đơn và dấu gạch nối.
2. Tên cửa hàng sau khi trim dài 2–150 ký tự.
3. Email sau khi trim và chuẩn hóa chữ thường dài tối đa 254 ký tự, đúng định dạng email.
4. Số điện thoại được chuẩn hóa về 10 chữ số và MUST khớp `^(03|05|07|08|09)\d{8}$`.
5. Mật khẩu dài 8–64 ký tự, không chứa khoảng trắng và có ít nhất một chữ hoa, một chữ thường, một chữ số và một ký tự đặc biệt.
6. `agreeTerms` MUST được truyền rõ ràng và bằng `true`; Backend không được mặc định thành `true`.
7. `otpCode` MUST gồm chính xác 6 chữ số.
8. Frontend MUST kiểm tra cùng quy tắc để phản hồi sớm, nhưng Backend là nguồn kiểm tra có thẩm quyền.
9. Backend MUST giới hạn độ dài trước khi chuẩn hóa, hash mật khẩu hoặc truy vấn database.
10. Response validation MUST trả lỗi theo trường và không phản chiếu mật khẩu hoặc OTP.

#### Scenario: Đăng ký bằng mật khẩu yếu
- GIVEN mật khẩu thiếu một trong các nhóm chữ hoa, chữ thường, chữ số hoặc ký tự đặc biệt
- WHEN gửi đăng ký
- THEN cả Frontend và Backend MUST từ chối.

#### Scenario: Chưa đồng ý điều khoản
- GIVEN `agreeTerms` bị thiếu hoặc bằng `false`
- WHEN gửi đăng ký
- THEN Backend MUST trả HTTP 400 và không tạo Tenant, Branch hoặc User.

#### Scenario: Dữ liệu đăng ký sai định dạng
- GIVEN email, số điện thoại, OTP hoặc độ dài trường không hợp lệ
- WHEN gửi OTP hoặc hoàn tất đăng ký
- THEN Backend MUST trả HTTP 400 với lỗi theo trường và không tạo dữ liệu.

## Lịch sử
- 2026-11-13 · `sep-refactor:Bổ-sung-validation-đăng-nhập/đăng-ký-tập` · +1 ~3 -0
