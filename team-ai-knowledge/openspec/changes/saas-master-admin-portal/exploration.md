# Exploration: Kiến Trúc Phân Hệ SaaS Master Admin tại MT_GRMS_FRONTEND

## 1. Phương Án Thiết Kế & Kiến Trúc
- **Giải Pháp Bố Cục**:
  - Tách biệt `AdminLayout` kế thừa từ thiết kế mẫu `Html/dev/admin.html` nhưng viết bằng React 19 + TypeScript.
  - Sidebar bên trái (260px) có Menu chuyển hướng React Router (`NavLink`), Topbar (70px) có ô tìm kiếm toàn cục, chuông thông báo và profile Super Admin.
- **Cấu Trúc Thư Mục Component Hóa (RULE_UI_DESIGN_SYSTEM)**:
  - `src/layouts/AdminLayout.tsx` + `AdminSidebar.tsx` + `AdminTopbar.tsx`
  - `src/features/admin/types/admin.types.ts`
  - `src/features/admin/data/mockAdminData.ts`
  - `src/features/admin/components/` (Bóc tách 8 component độc lập)
  - `src/pages/admin/AdminDashboardPage.tsx`
  - `src/pages/admin/TenantManagementPage.tsx`
  - `src/styles/admin.css` (Tích hợp design tokens chuẩn KiotViet)
- **Đánh Giá Rủi Ro**:
  - Không ảnh hưởng đến các layout hiện có (`PosLayout`, `WebStoreLayout`, `AuthLayout`).
  - Đảm bảo 100% tuân thủ TypeScript, không dùng `any`, hỗ trợ đầy đủ các props.
