# Tasks: Màn hình Hồ sơ Tài khoản Cá nhân, Bảo mật 2FA & Trung tâm Thông báo (`store-account-profile`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `User`, `Notification` đảm bảo lọc `TenantId` (`REQ-STOR-ACCO-PROF-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `store-account-profile` (`REQ-STOR-ACCO-PROF-02`, `REQ-STOR-ACCO-PROF-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AuthController.cs`, `NotificationsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee, MasterAdmin) (`REQ-STOR-ACCO-PROF-01`, `REQ-STOR-ACCO-PROF-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/store/AccountManagementPage.tsx` tại route `/store-owner/account` và kết nối API thời gian thực (`REQ-STOR-ACCO-PROF-01` → `REQ-STOR-ACCO-PROF-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-20-04` (`REQ-STOR-ACCO-PROF-01` → `REQ-STOR-ACCO-PROF-04`).
