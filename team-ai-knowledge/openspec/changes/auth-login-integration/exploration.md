# Exploration: Email OTP, xác thực đăng nhập và cấu hình 2FA

## Hiện trạng
- Change `auth-login-integration` đã triển khai luồng đăng nhập/đăng ký qua Email OTP; tasks hiện tại đánh dấu các phần này hoàn tất.
- 2FA đăng nhập hiện được mô tả bắt buộc. Yêu cầu mới cần cho phép từng người dùng bật/tắt trong Settings.
- Lần refactor trước đã ghi đè định dạng delta của `specs.md`, làm mất API Contract, REQ-01, REQ-AUTH-09/10/11 và Acceptance checklist. Cần khôi phục đầy đủ nội dung change trước khi triển khai phần mới.
- Không có đủ bằng chứng trong artifact hiện tại để khẳng định backend đã có lưu trạng thái 2FA, UI Settings, xác minh lại khi đổi trạng thái hoặc audit log.

## Giả định
- 2FA tiếp tục dùng Email OTP hiện có.
- Mỗi tài khoản tự quản lý thiết lập của chính mình; không mở quyền quản lý tài khoản khác cho Admin trong phạm vi này.
- Tài khoản hiện hữu mặc định tiếp tục bật 2FA để tránh vô tình giảm bảo mật sau migration.
- Việc bật/tắt cần xác minh mật khẩu hiện tại và OTP gửi tới email đã xác minh.
- Chỉ ghi audit log hành động/thời gian/IP/user; không lưu mật khẩu hoặc OTP.

## Ngoài phạm vi
- TOTP ứng dụng xác thực, SMS OTP, WebAuthn/Passkeys, mã dự phòng và chính sách ép buộc 2FA theo vai trò.
- Admin bật/tắt 2FA thay người dùng.
- Thay đổi quy trình Email OTP đăng ký cửa hàng ngoài việc bảo toàn requirement đã có.

## Phương án
### A. Lưu trạng thái 2FA trên từng tài khoản, Settings tự phục vụ (chọn)
Ưu điểm: trạng thái bền vững, điều khiển rõ ràng theo user, luồng login chỉ cần đọc cờ; phù hợp yêu cầu.
Nhược điểm: cần migration/schema, API cấu hình, quy trình xác minh thao tác và audit log.

### B. Dùng cấu hình hệ thống chung cho mọi tài khoản
Ưu điểm: ít thay đổi dữ liệu.
Nhược điểm: không đáp ứng bật/tắt theo tài khoản; một người thay đổi sẽ ảnh hưởng toàn hệ thống.

### C. Chỉ ẩn/hiện công tắc UI, không đổi hành vi Backend
Ưu điểm: nhanh làm giao diện.
Nhược điểm: không an toàn và không có hiệu lực thực tế; không chấp nhận.

## Phương án chọn và lý do
Chọn A. Backend là nguồn quyết định trạng thái 2FA; UI chỉ cho phép người dùng hiện tại quản lý chính tài khoản của mình. Yêu cầu này giữ nguyên khả năng OTP hiện có và bổ sung trạng thái per-user, bảo vệ thao tác nhạy cảm, audit log.

## Rủi ro và xử lý
- Tài khoản cũ có thể không có giá trị trạng thái: migration/backfill phải mặc định enabled.
- Email chưa xác minh hoặc thiếu email: không cho bật 2FA; hiển thị lý do và cách cập nhật email đã xác minh.
- CSRF/chiếm phiên có thể gây thay đổi thiết lập: xác minh lại mật khẩu và Email OTP, yêu cầu Backend lấy UserId từ phiên xác thực.
- Sai lệch giữa UI/API và spec: bổ sung contract cụ thể và test scenarios cho bật, tắt, đăng nhập cả hai trạng thái, tài khoản khác và audit log.
