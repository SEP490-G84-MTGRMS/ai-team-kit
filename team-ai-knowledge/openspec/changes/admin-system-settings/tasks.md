# Tasks: Màn hình Cấu hình Hệ thống Nền tảng & Tài khoản Thụ hưởng SaaS (`admin-system-settings`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `PlatformSetting` đảm bảo lọc `TenantId` (`REQ-ADMI-SYST-SETT-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `admin-system-settings` (`REQ-ADMI-SYST-SETT-02`, `REQ-ADMI-SYST-SETT-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AdminSettingsController.cs`, `PlatformPublicConfigController.cs` kèm kiểm soát phân quyền RBAC (MasterAdmin) (`REQ-ADMI-SYST-SETT-01`, `REQ-ADMI-SYST-SETT-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/admin/AdminSettingsPage.tsx` tại route `/admin/settings` và kết nối API thời gian thực (`REQ-ADMI-SYST-SETT-01` → `REQ-ADMI-SYST-SETT-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-07` (`REQ-ADMI-SYST-SETT-01` → `REQ-ADMI-SYST-SETT-04`).
