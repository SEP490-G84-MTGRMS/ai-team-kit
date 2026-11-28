# Tasks: Màn hình Đăng ký Khởi tạo Gian hàng & Xác thực Email OTP (`auth-register`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Tenant`, `User`, `TenantUser`, `Branch` đảm bảo lọc `TenantId` (`REQ-AUTH-REGI-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `auth-register` (`REQ-AUTH-REGI-02`, `REQ-AUTH-REGI-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AuthController.cs`, `TenantStoreController.cs` kèm kiểm soát phân quyền RBAC (Guest) (`REQ-AUTH-REGI-01`, `REQ-AUTH-REGI-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/auth/RegisterPage.tsx` tại route `/auth/register` và kết nối API thời gian thực (`REQ-AUTH-REGI-01` → `REQ-AUTH-REGI-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-20-02` (`REQ-AUTH-REGI-01` → `REQ-AUTH-REGI-04`).
