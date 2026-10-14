# Tasks: promotion-voucher-loyalty-ui

Thay đổi UI 3 màn hình Khuyến mãi, Quản lý Voucher/Coupon và Cấu hình tích điểm cho Store Owner.

## 1. Domain Types & Mock Data (Frontend)
- [ ] T1 — Tạo types định nghĩa cho Promotion, Voucher, Loyalty tại `src/features/promotion/types/promotion.types.ts`
- [ ] T2 — Tạo mock data phong phú, chuẩn nghiệp vụ bán lẻ tạp hóa tại `src/features/promotion/mock/promotionMockData.ts`

## 2. Shared & Component Primitives (Frontend)
- [ ] T3 — Tạo file CSS `src/features/promotion/promotion.css` tuân thủ design system MT-GRMS (Teal #0F766E, pill buttons, tables, badges)
- [ ] T4 — Tạo component KPI Summary Cards cho cả 3 trang tại `src/features/promotion/components/common/PromotionKpiCards.tsx`

## 3. Màn hình Khuyến mãi - Promotions (Frontend)
- [ ] T5 — Tạo `PromotionFilterBar.tsx` và `PromotionTable.tsx` (kèm Accordion chi tiết thể lệ bậc thang)
- [ ] T6 — Tạo `PromotionModal.tsx` hỗ trợ tạo mới / chỉnh sửa chương trình khuyến mãi (chiết khấu đơn hàng, mua X tặng Y)
- [ ] T7 — Hoàn thiện trang `PromotionListPage.tsx` tại `src/features/promotion/pages/PromotionListPage.tsx`

## 4. Màn hình Quản lý Voucher / Coupon (Frontend)
- [ ] T8 — Tạo `VoucherBatchTable.tsx` (kèm Accordion danh sách mã code, copy code, trạng thái đã dùng/chưa dùng)
- [ ] T9 — Tạo `VoucherBatchModal.tsx` và `GenerateCodesModal.tsx` phát hành đợt voucher mới
- [ ] T10 — Hoàn thiện trang `VoucherListPage.tsx` tại `src/features/promotion/pages/VoucherListPage.tsx`

## 5. Màn hình Cấu hình Tích điểm & Hạng thẻ (Frontend)
- [ ] T11 — Tạo `LoyaltyConfigForm.tsx` (tỉ lệ quy đổi điểm, hạn dùng, các hạng thẻ Thành viên / Bạc / Vàng / Kim cương)
- [ ] T12 — Tạo `LoyaltyLedgerTable.tsx` (lịch sử biến động điểm khách hàng) và `AdjustPointsModal.tsx`
- [ ] T13 — Hoàn thiện trang `LoyaltyConfigPage.tsx` tại `src/features/promotion/pages/LoyaltyConfigPage.tsx`

## 6. Tích hợp Router & Navigation (Frontend)
- [ ] T14 — Tạo barrel export tại `src/features/promotion/index.ts`
- [ ] T15 — Đăng ký 3 route mới (`promotions`, `vouchers`, `loyalty-config`) trong `src/app/router.tsx`
- [ ] T16 — Bổ sung menu item "Khuyến mãi" (dropdown 3 chức năng con) vào `src/layouts/StoreOwnerLayout/AppTopNav.tsx`

## 7. Kiểm thử & Đánh giá (Test)
- [ ] T17 — Chạy `npm run build` để kiểm tra TypeScript và Lint đảm bảo 0 lỗi
- [ ] T18 — Kiểm thử hiển thị responsive và luồng thao tác trực quan trên trình duyệt
