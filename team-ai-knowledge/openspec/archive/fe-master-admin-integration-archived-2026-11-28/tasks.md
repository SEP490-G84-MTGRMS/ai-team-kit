# Tasks: fe-master-admin-integration

## Frontend API Client & Master Admin Core
- [x] T1 — Tạo `src/features/admin/api/adminApi.ts` định nghĩa các hàm gọi API REST: `planApi` (7 methods), `tenantApi` (6 methods), `dashboardApi` (4 methods) sử dụng `httpClient` (REQ-FE-ADMIN-01)
- [x] T2 — Tạo tiện ích Mapper `src/features/admin/api/adminMappers.ts` chuẩn hóa kiểu dữ liệu giữa Backend DTOs (`PlanSummaryResponse`, `TenantSummaryResponse`) và Frontend Models (`SubscriptionPlan`, `Tenant`) (REQ-FE-ADMIN-01)

## Frontend Pages Integration (Plans, Tenants, Dashboard)
- [x] T3 — Cập nhật `SubscriptionPlanPage.tsx` và các Modals (Create, Update, Delete) để fetch danh sách và KPI banner thật, gửi mutation API và xử lý lỗi nghiệp vụ chặn xóa `PLAN_IN_USE` (REQ-FE-ADMIN-02)
- [x] T4 — Cập nhật `TenantManagementPage.tsx` để fetch danh sách gian hàng với bộ lọc từ khóa, tab trạng thái (`ACTIVE`, `EXPIRING`, `GRACE`, `LOCKED`), phân trang server-side và xử lý các modal Khóa Soft/Hard, Mở khóa, Gia hạn ân hạn (REQ-FE-ADMIN-03)
- [x] T5 — Cập nhật `TenantDetailPage.tsx` nạp thông tin chi tiết gian hàng và danh sách chi nhánh trực thuộc từ backend (REQ-FE-ADMIN-03)
- [x] T6 — Cập nhật `AdminDashboardPage.tsx` nạp 4 thẻ KPI thật, biểu đồ phân tích doanh thu 6 tháng, cơ cấu gói cước và bảng cảnh báo khẩn cấp (REQ-FE-ADMIN-04)
- [x] T7 — Chạy kiểm tra build `npm run build` trên `MT_GRMS_FRONTEND` để đảm bảo 0 lỗi TypeScript và bundle thành công (REQ-FE-ADMIN-01, REQ-FE-ADMIN-02, REQ-FE-ADMIN-03, REQ-FE-ADMIN-04)

## Cấu hình Nền tảng Toàn cục (/admin/settings)
- [x] T8 — Backend: Tạo Entity `PlatformSetting`, Seed Singleton Data, DTOs, Validator, Service và Controller `AdminSettingsController` (`GET/PUT /api/v1/admin/settings`, `GET /api/v1/platform/public-config`) (REQ-FE-ADMIN-05)
- [x] T9 — Backend: Thay thế cấu hình hardcode trong `TenantBranchAddonController`, `TenantStorageController`, `WalletService`, `AuthService` bằng dữ liệu động từ `PlatformSettings` (REQ-FE-ADMIN-05)
- [x] T10 — Frontend API: Định nghĩa Types `settings.types.ts` và tích hợp `settingsApi` (`getSettings`, `updateSettings`) trong `adminApi.ts` (REQ-FE-ADMIN-05)
- [x] T11 — Frontend Components: Bóc tách các thẻ UI độc lập theo chuẩn KiotViet Design System (`PlatformSettingsHeader`, `SubscriptionPolicyCard`, `MasterBeneficiaryCard`, `SupportContactCard`, `MaintenanceModeCard`, `SettingsSummarySidebar`) (REQ-FE-ADMIN-05)
- [x] T12 — Frontend Page & Router: Tạo `AdminSettingsPage.tsx`, cấu hình route `/admin/settings` trong `router.tsx` và thêm menu item trong `AdminSidebar.tsx` (REQ-FE-ADMIN-05)
- [x] T13 — Verification & Worklog: Chạy `dotnet test`, `npm run build`, tạo worklog và cập nhật `CHANGELOG.md` theo quy định SEP (REQ-FE-ADMIN-05)
