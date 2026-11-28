# Codebase Review: auth-login-integration

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa |
|---|---|---|
| REQ-01 | LoginRequestValidator đang rỗng | Thêm rules và bảo đảm validator được gọi |
| REQ-AUTH-08 | OTP lifecycle đã có | Validate format trước lookup/attempt |
| REQ-AUTH-09 | Service chỉ yêu cầu password >=6 | Policy 8–64, phone/email/name/terms |
| REQ-AUTH-13 | Validation đang rải rác | Shared backend/frontend rules |

## Tái sử dụng được
- `Auth/Validators/LoginRequestValidator.cs`
- `UserAuthenticationTests.cs`
- Frontend Vitest/Testing Library hiện có.

## Xung đột / rủi ro
- [HIGH — Đã xử lý] Specs cũ bị mất → Đã phục hồi.
- [HIGH — Theo task] `AgreeTerms = true` mặc định phải bỏ.
- [HIGH — Theo task] Validator phải thực sự được gọi, không chỉ đăng ký DI.
- [MEDIUM — Theo task] Sửa regex phone frontend và test malformed OTP không tiêu hao attempt.

## Kết luận: Khả thi
