# Guardian Review: auth-login-integration

| Hạng mục | Tình trạng | Ghi chú |
|---|---|---|
| Multi-tenant | OK | Tự phục vụ theo UserId phiên; audit có TenantId. |
| AuthN/AuthZ | OK | Không nhận target userId; action bound challenge; cookie cần CSRF. |
| Validation | OK | TTL 5 phút, tối đa 5 lần sai, rate limit user/IP. |
| Toàn vẹn dữ liệu | OK | Tiêu thụ challenge một lần; cập nhật + audit chung transaction. |
| Vận hành & audit | OK | Không log OTP, mật khẩu, token; email che. |

## Vấn đề
- [Đã xử lý HIGH] Tắt 2FA khi session bị chiếm: bắt xác minh mật khẩu và Email OTP.
- [Đã xử lý HIGH] Dùng OTP login cho Settings hoặc đổi action: challenge riêng và bound user/action.
- [Đã xử lý HIGH] CSRF và replay: yêu cầu kiểm tra nguồn/csrf token, tiêu thụ challenge một lần.
- [MEDIUM] Cần xác định rõ IP đáng tin cậy sau proxy và cấu hình rate limit trong code.

## Kết luận: An toàn ở mức đặc tả, cần kiểm chứng code khi Apply
