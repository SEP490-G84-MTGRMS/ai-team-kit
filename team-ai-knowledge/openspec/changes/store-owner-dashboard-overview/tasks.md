# Tasks: Màn Hình Tổng Quan Dành Riêng Cho Chủ Cửa Hàng (Store Owner Dashboard)

## Frontend Implementation

- [x] T1 — Tạo kiểu dữ liệu TypeScript tại `src/features/store-owner-dashboard/types/dashboard.types.ts` (REQ-DASH-02, REQ-DASH-03)
- [x] T2 — Tạo component `StoreOwnerHeader.tsx` hiển thị thông tin chi nhánh, ca bán và bộ lọc thời gian Pill button (REQ-DASH-01)
- [x] T3 — Tạo component `StoreOwnerKpiRow.tsx` hiển thị 4 thẻ KPI bán lẻ (Doanh thu hôm nay, Hóa đơn, Tiền mặt/VietQR, Sổ nợ) (REQ-DASH-02)
- [x] T4 — Tạo component `StoreRevenueChartCard.tsx` hiển thị biểu đồ doanh số trực quan 7 ngày (REQ-DASH-02)
- [x] T5 — Tạo component `FefoWarningCard.tsx` hiển thị bảng cảnh báo hạn dùng FEFO 3 mức màu khẩn cấp/cảnh báo/an toàn (REQ-DASH-03)
- [x] T6 — Tạo component `LowStockWarningCard.tsx` hiển thị cảnh báo tồn kho dưới ngưỡng an toàn (REQ-DASH-04)
- [x] T7 — Tạo component `TopSellingProductsCard.tsx` hiển thị Top 5 mặt hàng bán chạy nhất (REQ-DASH-04)
- [x] T8 — Tạo component `StoreQuickActionsCard.tsx` với các phím tắt mở POS, nhập hàng, kiểm kho (REQ-DASH-01)
- [x] T9 — Tạo trang `StoreOwnerDashboardPage.tsx` tại `src/features/store-owner-dashboard/pages/StoreOwnerDashboardPage.tsx` lắp ráp layout (REQ-DASH-01)
- [x] T10 — Cập nhật `src/app/router.tsx` và `src/layouts/StoreOwnerLayout/AppTopNav.tsx` trỏ đúng vào `StoreOwnerDashboardPage` (REQ-DASH-01)
- [x] T11 — Chạy `npm run build` để xác thực 100% không có lỗi TypeScript (REQ-DASH-01)
