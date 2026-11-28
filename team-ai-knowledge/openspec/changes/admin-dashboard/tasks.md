# Tasks: Màn hình Tổng quan Quản trị Hệ thống SaaS (Master Admin Dashboard) (`admin-dashboard`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Tenant`, `SubscriptionPlan`, `PaymentTransaction` đảm bảo lọc `TenantId` (`REQ-ADMI-DASH-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `admin-dashboard` (`REQ-ADMI-DASH-02`, `REQ-ADMI-DASH-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AdminDashboardController.cs`, `AdminDashboardOverviewController.cs` kèm kiểm soát phân quyền RBAC (MasterAdmin) (`REQ-ADMI-DASH-01`, `REQ-ADMI-DASH-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/admin/AdminDashboardPage.tsx` tại route `/admin` và kết nối API thời gian thực (`REQ-ADMI-DASH-01` → `REQ-ADMI-DASH-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-01` (`REQ-ADMI-DASH-01` → `REQ-ADMI-DASH-04`).
