# Spec: identity

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-AUTH-05 Xác Thực Mã OTP Chống Dò Tài Khoản & Giới Hạn Lượt Thử
Hệ thống MUST cung cấp API tại `/api/auth/verify-otp` kiểm tra tính hợp lệ của mã OTP 6 chữ số:
1. Nếu email không tồn tại trong hệ thống, API MUST trả về HTTP 400 Bad Request với thông báo trung tính `"Mã xác thực OTP không hợp lệ hoặc đã hết hạn."` (tuyệt đối không trả HTTP 404 làm lộ sự tồn tại của email).
2. Hệ thống MUST giới hạn tối đa 5 lần nhập sai mã OTP cho mỗi lượt yêu cầu; khi sai đủ 5 lần MUST hủy mã OTP hiện tại và yêu cầu gửi lại mã mới.

#### Scenario: Email không tồn tại hoặc nhập sai OTP quá 5 lần
- **GIVEN** email không tồn tại hoặc người dùng nhập sai OTP lần thứ 5
- **WHEN** gọi `POST /api/auth/verify-otp`
- **THEN** hệ thống trả về HTTP 400 Bad Request (không trả 404) và hủy hiệu lực mã OTP nếu đã vượt quá 5 lần thử.

### Requirement: REQ-AUTH-06 Đặt Lại Mật Khẩu Mới Chuẩn Mật Khẩu Mạnh & Thu Hồi Phiên
Hệ thống MUST xác thực lại mã OTP và kiểm tra độ mạnh của `newPassword` (`8–64` ký tự, không khoảng trắng, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt) tại `/api/auth/reset-password` (đồng bộ cả Frontend lẫn Backend), xoay `SecurityStamp`, xóa `RefreshToken` và vô hiệu hóa mã OTP.

#### Scenario: Từ chối mật khẩu đặt lại yếu
- **GIVEN** mã OTP hợp lệ nhưng `newPassword` không đủ chữ hoa/thường/số/ký tự đặc biệt
- **WHEN** gọi `POST /api/auth/reset-password`
- **THEN** hệ thống trả về HTTP 400 Bad Request và không cập nhật mật khẩu.

## Lịch sử
- 2026-11-25 · `sep-refactor:Chống-dò-email-404-tại-verify-otp/reset-` · +0 ~2 -0
