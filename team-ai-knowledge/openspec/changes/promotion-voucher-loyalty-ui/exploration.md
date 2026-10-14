# Exploration: Khuyến mãi, Voucher & Tích điểm UI

## Hiện trạng

- **Design system**: Deep Teal `#0F766E`, Be Vietnam Pro, bo tròn Pills 9999px / 24px, lucide-react icons, CSS variables trong `index.css`.
- **Pattern feature hiện tại**: Mỗi feature là folder `src/features/<tên>/` chứa `pages/`, `components/`, `<tên>.css`, `index.ts`. Trang chính được export qua index.ts.
- **Navigation**: `AppTopNav.tsx` dùng mảng `NAV_GROUPS` với cấu trúc `{ id, label, icon, to?, children? }`. Dropdown render bởi `NavDropdown` component.
- **Icons**: Dùng lucide-react (Users, TrendingUp, Package) và custom SVG icons từ `AdminIcons.tsx`.
- **Layout**: `StoreOwnerLayout` wrap `<Outlet />`, routes khai báo trong `router.tsx` dưới path `/store-owner`.
- **ERD hiện tại**: Entity `Promotion` có: PromotionID, PromotionName, Type, DiscountValue, start_date, end_date. Customer có MembershipTier.

## Giả định

1. Mock data hardcode cho cả 3 trang — chưa cần hook/API.
2. Navigation thêm nhóm mới "Khuyến mãi" với icon `Gift` từ lucide-react.
3. Cả 3 trang đều nằm trong cùng feature folder `src/features/promotion/`.
4. CSS module riêng `promotion.css` — follow pattern của `customer-crm.css`.

## Phương án kỹ thuật

### Phương án A: 1 feature folder chứa cả 3 trang (✅ Chọn)
- Folder: `src/features/promotion/`
- Pages: `PromotionListPage.tsx`, `VoucherListPage.tsx`, `LoyaltyConfigPage.tsx`
- Lý do: 3 trang thuộc cùng domain "Khuyến mãi & Loyalty", share styles chung.

### Phương án B: 3 feature folder riêng (❌ Không chọn)
- `src/features/promotion/`, `src/features/voucher/`, `src/features/loyalty/`
- Quá phân tán cho 3 trang mock data, tăng complexity không cần thiết.

## Rủi ro

1. **Trùng lặp CSS**: Mitigate bằng cách dùng chung CSS variables + prefix class `promo-`.
2. **Accordion state management**: Mỗi accordion row quản lý state riêng bằng `useState` local — đơn giản, đủ cho mock.
3. **Modal overlap**: Mỗi modal có state riêng — không conflict.
