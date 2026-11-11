# Codebase Review: auth-login-integration

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa |
|---|---|---|
| REQ-AUTH-08 | `MT_GRMS_BACKEND/src/MT_GRMS.Application/Auth/AuthService.cs`; `MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/AuthController.cs`; `MT_GRMS_FRONTEND/src/pages/auth/LoginPage.tsx` | Nhánh login khi 2FA tắt; giữ OTP khi bật. |
| REQ-AUTH-12 | `MT_GRMS_BACKEND/src/MT_GRMS.Domain/Entities/Identity/User.cs` có `IsEmailVerified` nhưng chưa có cờ 2FA; `MT_GRMS_FRONTEND/src/pages/store/StoreSettingsHubPage.tsx` | Cờ + migration, API Settings, challenge, audit, UI. |

## Tái sử dụng được
- `User.IsEmailVerified` cho điều kiện bật.
- OTP login và EmailService hiện có cần đối chiếu trước khi dùng lại; Settings phải có challenge riêng.

## Xung đột / rủi ro
- [HIGH đã chuyển thành task] Tasks cũ đều tick, chưa bao phủ REQ-AUTH-12; thêm checklist mới chưa tick.
- [MEDIUM] Settings hiện là hub của store; cần bảo đảm UI tự phục vụ của mọi vai trò có đường vào phù hợp.

## Kết luận: Khả thi sau khi bổ sung tasks
