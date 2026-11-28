# Guardian Review: auth-login-integration

| Hạng mục | Tình trạng | Ghi chú |
|---|---|---|
| Multi-tenant | OK | Không thay ownership/tenant flow. |
| AuthN/AuthZ | OK | Login lỗi dùng thông báo chung. |
| Validation | OK | Chạy trước repository/hash/challenge/email. |
| Toàn vẹn dữ liệu | OK | Payload sai không tạo Tenant/User/Branch. |
| Vận hành & audit | OK | Không phản chiếu password/OTP. |

## Vấn đề
- [HIGH — Đã xử lý] Specs bị mất cơ chế OTP/cookie cũ → Đã khôi phục.
- [HIGH — Đã xử lý] OTP malformed có thể tiêu hao attempt → Spec yêu cầu validate trước lookup/mutation.
- [MEDIUM — Theo task] Bắt buộc test missing/false terms, boundary và bypass frontend.

## Kết luận: An toàn
