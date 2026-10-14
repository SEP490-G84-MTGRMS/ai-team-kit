# Specs Delta: promotion-voucher-loyalty-ui

## ADDED

### Feature: src/features/promotion/
- `index.ts` — Barrel exports cho 3 page components.
- `promotion.css` — CSS module đồng bộ MT-GRMS design system.

### Pages
- `PromotionListPage.tsx` — Trang danh sách khuyến mại + filter sidebar + accordion.
- `VoucherListPage.tsx` — Trang quản lý voucher/coupon + filter sidebar + accordion.
- `LoyaltyConfigPage.tsx` — Trang cấu hình tích điểm + sổ cái hội viên.

### Components
- `PromotionFilterSidebar.tsx` — Bộ lọc sidebar (dùng chung cho KM và Voucher).
- `PromotionTable.tsx` — Bảng dữ liệu KM với accordion chi tiết.
- `PromotionFormModal.tsx` — Modal tạo/sửa cấu hình khuyến mại.
- `VoucherTable.tsx` — Bảng đợt phát hành voucher với accordion mã.
- `VoucherBatchModal.tsx` — Modal tạo/sửa đợt phát hành voucher.
- `VoucherGenerateModal.tsx` — Modal sinh mã voucher batch.
- `LoyaltyConfigForm.tsx` — Form cấu hình quy tắc tích/tiêu điểm.
- `LoyaltyLedgerTable.tsx` — Sổ cái điểm thưởng hội viên CRM.
- `PointAdjustModal.tsx` — Modal điều chỉnh điểm thủ công.

## MODIFIED

### src/app/router.tsx
- Thêm 3 routes con dưới `/store-owner`: `promotions`, `vouchers`, `loyalty-config`.
- Import 3 page components từ `../features/promotion`.

### src/layouts/StoreOwnerLayout/AppTopNav.tsx
- Thêm NavGroup `promotions` vào mảng `NAV_GROUPS` (sau nhóm `finance`).
- Import `Gift` icon từ lucide-react.

## REMOVED
Không có.
