# Design Brief: Màn hình Hồ sơ Tài khoản Cá nhân, Bảo mật 2FA & Trung tâm Thông báo (`store-account-profile`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/account`, `/store-owner/profile`
- **Entry Page**: `src/pages/store/AccountManagementPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `AccountSidebarNav`
  - `AccountProfileTab`
  - `TermsOfServiceTab`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `POST` | `/api/auth/login` | `AuthController.Login` | JSON DTO / ProblemDetails |
| `POST` | `/api/auth/login/send-otp` | `AuthController.SendLoginOtp` | JSON DTO / ProblemDetails |
| `POST` | `/api/auth/login/verify-otp` | `AuthController.VerifyLoginOtp` | JSON DTO / ProblemDetails |
| `POST` | `/api/auth/register/send-otp` | `AuthController.SendRegistrationOtp` | JSON DTO / ProblemDetails |
| `POST` | `/api/auth/register/verify-otp` | `AuthController.VerifyRegistrationOtp` | JSON DTO / ProblemDetails |
| `POST` | `/api/auth/register` | `AuthController.Register` | JSON DTO / ProblemDetails |
| `POST` | `/api/auth/refresh` | `AuthController.Refresh` | JSON DTO / ProblemDetails |
| `GET` | `/api/auth/me` | `AuthController.GetMe` | JSON DTO / ProblemDetails |
| `GET` | `/api/auth/me/2fa` | `AuthController.GetTwoFactorStatus` | JSON DTO / ProblemDetails |
| `POST` | `/api/auth/me/2fa/challenge` | `AuthController.CreateTwoFactorChallenge` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `User`, `Notification`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`, `MasterAdmin`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
