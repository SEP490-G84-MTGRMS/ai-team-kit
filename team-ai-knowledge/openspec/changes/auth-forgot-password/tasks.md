# Tasks: Màn hình Khôi phục Mật khẩu qua Email OTP (`auth-forgot-password`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `User` đảm bảo lọc `TenantId` (`REQ-AUTH-FORG-PASS-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `auth-forgot-password` (`REQ-AUTH-FORG-PASS-02`, `REQ-AUTH-FORG-PASS-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AuthController.cs` kèm kiểm soát phân quyền RBAC (Guest) (`REQ-AUTH-FORG-PASS-01`, `REQ-AUTH-FORG-PASS-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/auth/ForgotPasswordPage.tsx` tại route `/auth/forgot-password` và kết nối API thời gian thực (`REQ-AUTH-FORG-PASS-01` → `REQ-AUTH-FORG-PASS-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-20-03` (`REQ-AUTH-FORG-PASS-01` → `REQ-AUTH-FORG-PASS-04`).
