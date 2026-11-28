# Design Brief: Màn Hình Tổng Quan Dành Riêng Cho Chủ Cửa Hàng (Store Owner Dashboard)

## 1. Luồng Người Dùng (User Flow)
1. Chủ cửa hàng đăng nhập vào hệ thống hoặc click tab **"Tổng quan"** trên thanh điều hướng Topbar.
2. Trình duyệt tải trang `/store-owner/dashboard` hiển thị ngay bức tranh toàn cảnh của tiệm tạp hóa:
   - Header: Lời chào chủ cửa hàng (ví dụ: *"Xin chào Minh Đức • Cửa hàng Tạp Hóa Minh Đức - Chi nhánh 1"*), bộ chọn khoảng thời gian (`Hôm nay`, `Hôm qua`, `7 ngày qua`, `Tháng này`), nút hành động nhanh *"Bán hàng POS"* và *"Kiểm kho"*.
   - Khối KPI (4 thẻ): Doanh thu bán hàng hôm nay, Số lượng đơn hàng & Giá trị trung bình/đơn, Phân bổ tiền mặt vs VietQR, Sổ nợ khách quen chưa thanh toán.
   - Hàng 2 (Layout 2 cột 60/40):
     - Cột trái (60%): Biểu đồ biến động doanh thu 7 ngày qua với các cột giờ cao điểm bán lẻ.
     - Cột phải (40%): Bảng cảnh báo hạn sử dụng FEFO với 3 mức màu: Khẩn cấp ($\le 7$ ngày), Cảnh báo (8-15 ngày), An toàn (>15 ngày) kèm nút bấm *"Xả hàng giảm giá"*.
   - Hàng 3 (Layout 3 cột cân đối):
     - Cột 1: Cảnh báo hàng hóa chạm/dưới định mức tồn an toàn cần nhập kho khẩn cấp.
     - Cột 2: Top 5 mặt hàng bán chạy nhất hôm nay kèm tỷ trọng đóng góp doanh thu.
     - Cột 3: Bảng phím tắt thao tác nhanh & Sổ nợ khách hàng cần thu hôm nay.

## 2. Danh Sách Component Chi Tiết (Tuân thủ RULE_UI_DESIGN_SYSTEM)
1. `StoreOwnerDashboardPage.tsx`: Layout chính, quản lý state bộ lọc thời gian (`timeFilter`).
2. `StoreOwnerHeader.tsx`: Thanh tiêu đề, thông tin cửa hàng, badge trạng thái ca làm việc và bộ lọc thời gian Pill button.
3. `StoreOwnerKpiRow.tsx`:
   - Thẻ 1: Doanh thu hôm nay (ví dụ: `18.650.000 đ`, tăng +12.5% so với hôm qua).
   - Thẻ 2: Hóa đơn bán lẻ (ví dụ: `142 đơn`, trung bình `131.000 đ/đơn`).
   - Thẻ 3: Tiền mặt vs VietQR (ví dụ: `Tiền mặt: 8.2M đ` | `VietQR: 10.45M đ`).
   - Thẻ 4: Sổ nợ khách cần thu (ví dụ: `4.820.000 đ` từ 7 khách hàng ghi sổ).
4. `StoreRevenueChartCard.tsx`: Card doanh thu trực quan, hover hiển thị doanh số từng ngày, toggle xem theo Giờ bán / Ngày bán.
5. `FefoWarningCard.tsx`: Danh sách các lô hàng cận hạn date theo FEFO (Bánh mì tươi, Sữa tươi tiệt trùng, Sữa chua, Xúc xích...).
6. `LowStockWarningCard.tsx`: Cảnh báo các mặt hàng tồn kho còn ít (Kẹo mè xửng, Nước ngọt lon, Dầu ăn...).
7. `TopSellingProductsCard.tsx`: Danh sách top mặt hàng doanh số cao nhất.
8. `StoreQuickActionsCard.tsx`: 4 nút Full Pill thao tác tức thì.

## 3. Màu Sắc & Typography
- Font chính: `'Be Vietnam Pro', -apple-system, sans-serif`.
- Font số tiền: `'JetBrains Mono', Consolas, monospace`, căn chỉnh `tabular-nums`.
- Bo tròn: Full Pill `border-radius: 9999px` cho nút, badges; Card lớn bo góc `24px`.
- Icons: 100% Monochrome SVG Icons đơn sắc, thanh mảnh (`stroke-width: 1.8 - 2.0`), màu ăn theo text hoặc xanh thương hiệu. CẤM EMOJI và cấm màu mè sặc sỡ.
- Hiệu ứng: Tĩnh, vững chãi; hover đổi nhẹ viền hoặc shadow mềm; cấm animation nhún nhảy hoặc floatBounce.
