# Tasks: Tích hợp SaaS Master Admin Portal vào MT_GRMS_FRONTEND

## 1. Types & Data Mock
- [x] 1.1 Tạo types `src/features/admin/types/admin.types.ts` (Tenant, KpiData, CronjobData, PlanDistribution).
- [x] 1.2 Tạo mock data phong phú `src/features/admin/data/mockAdminData.ts` (128 tenants, 4 KPIs, 4 cronjobs, 3 gói).

## 2. Design System & Styles
- [x] 2.1 Tạo `src/styles/admin.css` chứa layout sidebar, topbar, metric cards, badges, dialogs chuẩn KiotViet Electric Blue.

## 3. Layout Components
- [x] 3.1 Tạo `src/layouts/AdminLayout/AdminSidebar.tsx` với Logo MT-GRMS SVG, NavLinks, Về Trang Chủ.
- [x] 3.2 Tạo `src/layouts/AdminLayout/AdminTopbar.tsx` với Search box, chuông thông báo, Profile Super Admin.
- [x] 3.3 Tạo `src/layouts/AdminLayout/AdminLayout.tsx` bọc Outlet cho các trang admin.

## 4. Dashboard Components
- [x] 4.1 Tạo `src/features/admin/components/KpiCard.tsx` hiển thị thẻ chỉ số lớn.
- [x] 4.2 Tạo `src/features/admin/components/PlanDistributionCard.tsx` hiển thị thanh tiến trình 3 gói cước.
- [x] 4.3 Tạo `src/features/admin/components/CronjobMonitorCard.tsx` giám sát sức khỏe 4 tác vụ tự động.
- [x] 4.4 Tạo `src/features/admin/components/UrgentAlertTable.tsx` bảng cảnh báo $\le 7$ ngày.
- [x] 4.5 Tạo trang `src/pages/admin/AdminDashboardPage.tsx` lắp ráp Dashboard.

## 5. Tenant Management Components & Modals
- [x] 5.1 Tạo `src/features/admin/components/TenantFilterTabs.tsx` hàng tabs lọc kèm số đếm.
- [x] 5.2 Tạo `src/features/admin/components/TenantSearchToolbar.tsx` ô tìm kiếm và select gói cước.
- [x] 5.3 Tạo `src/features/admin/components/TenantDataTable.tsx` bảng dữ liệu khách thuê, tags subdomain, badges và phân trang.
- [x] 5.4 Tạo `src/features/admin/components/TenantDetailModal.tsx` xem chi tiết Quota và 6 feature flags.
- [x] 5.5 Tạo `src/features/admin/components/ExtendGraceModal.tsx` modal gia hạn ân hạn.
- [x] 5.6 Tạo `src/features/admin/components/ApplyLockModal.tsx` modal khóa tài khoản.
- [x] 5.7 Tạo trang `src/pages/admin/TenantManagementPage.tsx` lắp ráp Quản lý khách thuê.

## 6. Routing & Navigation Link
- [x] 6.1 Cập nhật `src/app/router.tsx` bổ sung routes `/admin`, `/admin/dashboard`, `/admin/tenants`.
- [x] 6.2 Cập nhật `Navbar` và `Footer` trong `HomePage` dẫn liên kết tới `/admin/dashboard`.
- [x] 6.3 Chạy `npm run build` xác minh 0 lỗi TypeScript và bundle thành công.
