# Proposal: Phân Hệ SaaS Master Admin (Dashboard & Quản Lý Khách Hàng Thuê)

## 1. Vấn Đề
Dự án `MT_GRMS_FRONTEND` hiện tại chưa có giao diện dành cho tác nhân **SaaS Master Admin (Super Admin)** để theo dõi tổng thể nền tảng và quản trị các chuỗi cửa hàng tạp hóa thuê dịch vụ (Tenants). Trang `/dashboard` hiện tại chỉ là placeholder sơ khai.

## 2. Mục Tiêu
Chuyển hóa thiết kế mẫu chuẩn KiotViet Electric Blue từ `Html/dev/admin.html` sang ứng dụng React 19 / TypeScript / Vite tại `MT_GRMS_FRONTEND`:
- **Admin Layout**: Thanh Sidebar điều hướng bên trái, Topbar với tìm kiếm toàn cục, chuông thông báo và hồ sơ Super Admin.
- **Tổng quan Nền tảng (Master Dashboard)**: 4 Thẻ KPI chính, biểu đồ phân bổ gói cước, giám sát 4 tác vụ Cronjobs, bảng cảnh báo khẩn cấp $\le 7$ ngày.
- **Quản lý Khách hàng thuê (Tenants)**: Bộ lọc Tabs nhanh theo trạng thái, tìm kiếm tức thì theo subdomain/tên chuỗi, bảng dữ liệu chuẩn KiotViet, phân trang và các nút tác vụ (Chi tiết, Khóa, Gia hạn ân hạn).

## 3. Phạm Vi (Scope)
- **In Scope**:
  - `AdminLayout`: Layout chuẩn KiotViet với Sidebar cố định và Header sticky.
  - `AdminDashboardPage`: Màn hình Tổng quan với các thẻ KPI, phân bổ gói cước, giám sát Cronjobs, cảnh báo khẩn cấp.
  - `TenantManagementPage`: Màn hình Quản lý Khách hàng thuê với Tabs lọc, bảng dữ liệu, tags trạng thái, phân trang.
  - Các Component bóc tách độc lập theo `RULE_UI_DESIGN_SYSTEM.md`: `KpiCard`, `PlanDistributionCard`, `CronjobMonitorCard`, `UrgentAlertTable`, `TenantFilterTabs`, `TenantDataTable`, `TenantActionModal`.
  - Cập nhật Routing tại `src/app/router.tsx` cho `/admin` và `/admin/tenants` (kèm alias `/dashboard`).
- **Out of Scope**:
  - Tích hợp trực tiếp với Backend API thật (sử dụng Typed Mock Data hoàn chỉnh và sẵn sàng cắm TanStack Query).

## 4. Người Dùng & Phân Quyền
- Tác nhân: **SaaS Master Admin (Super Admin)**.
- Vai trò: Giám sát toàn bộ hệ thống, quản lý tài nguyên và hợp đồng của tất cả các tenant.

## 5. Tiêu Chí Thành Công
- [x] Tuân thủ 100% `RULE_UI_DESIGN_SYSTEM.md`: Mã màu Electric Blue `#0066FF`, phông `Be Vietnam Pro` + `JetBrains Mono`, Full Pill nút/badges, Card bo tròn `20-24px`, Solid & Stable không rung lắc.
- [x] Mỗi thẻ UI và khối chức năng được bóc tách thành Component riêng biệt.
- [x] Chạy `npm run build` thành công (0 lỗi TypeScript, 0 lỗi Vite).
