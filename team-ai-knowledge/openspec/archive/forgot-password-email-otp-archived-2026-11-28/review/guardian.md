# Guardian Review: forgot-password-email-otp

| Hạng mục | Tình trạng (OK / Rủi ro / Thiếu) | Ghi chú |
|---|---|---|
| Multi-tenant | OK | Tài khoản `User` liên kết qua `TenantUsers`. Đổi mật khẩu cập nhật bảng gốc `Users`, các tenant liên kết được bảo toàn. |
| AuthN/AuthZ | OK | Các endpoint forgot/verify/reset là public endpoint (chưa có token). Sau khi đổi mật khẩu thành công, token cũ bị vô hiệu hóa khi refresh/login. |
| Validation | OK | Đã giới hạn mật khẩu mới >= 8 ký tự, email có định dạng hợp lệ, mã OTP 6 ký tự số. |
| Toàn vẹn dữ liệu | OK | Không chạy migration; sử dụng các trường `PasswordResetOtp` và `OtpExpiry` đã có sẵn trong bảng `Users`. |
| Vận hành & audit | OK | Cung cấp fallback Dev Console Logger giúp vận hành trơn tru khi chạy local hoặc test kiểm thử. |

## Kết luận: An toàn
Không có lỗ hổng bảo mật nghiêm trọng. Kế hoạch an toàn để thực thi.
