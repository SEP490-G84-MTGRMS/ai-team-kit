# Tasks: Màn hình Đăng nhập Đa vai trò & Xác thực 2FA OTP (`auth-login`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `User`, `TenantUser`, `Tenant` đảm bảo lọc `TenantId` (`REQ-AUTH-LOGI-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `auth-login` (`REQ-AUTH-LOGI-02`, `REQ-AUTH-LOGI-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AuthController.cs` kèm kiểm soát phân quyền RBAC (Guest, MasterAdmin, StoreOwner, Employee) (`REQ-AUTH-LOGI-01`, `REQ-AUTH-LOGI-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/auth/LoginPage.tsx` tại route `/auth/login` và kết nối API thời gian thực (`REQ-AUTH-LOGI-01` → `REQ-AUTH-LOGI-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-20-01` (`REQ-AUTH-LOGI-01` → `REQ-AUTH-LOGI-04`).
