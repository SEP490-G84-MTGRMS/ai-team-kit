# Proposal: Màn hình Tổng quan Dành Riêng Cho Chủ Cửa Hàng (Store Owner Dashboard)

## 1. Vấn Đề (Problem Statement)
- Hiện tại cả hai phân hệ Quản trị nền tảng SaaS (`/admin`) và Cổng chủ cửa hàng (`/store-owner`) đều đang trỏ chung về một component duy nhất là `AdminDashboardPage`.
- Màn hình hiện tại hiển thị các chỉ số vĩ mô của Master Admin nền tảng SaaS (Tổng khách hàng chuỗi/tenant, Doanh thu định kỳ MRR/ARR, Cơ cấu gói cước thuê bao, tỷ lệ rời bỏ Churn...).
- Chủ tiệm tạp hóa bán lẻ thực tế (Store Owner) không cần các chỉ số SaaS đó mà cần một **Bảng điều khiển kinh doanh thực tế tại cửa hàng**:
  - Doanh thu bán hàng hôm nay, số hóa đơn xuất quầy POS, lợi nhuận gộp tạm tính.
  - Cảnh báo tồn kho nguy cơ: Hàng hóa cận hạn dùng FEFO (3 mức màu đỏ/vàng/xanh), hàng hóa chạm mức tồn tối thiểu cần nhập gấp.
  - Dòng tiền & Sổ nợ khách mua quen cần thu hồi.
  - Top mặt hàng bán chạy trong ngày/tuần.

## 2. Mục Tiêu (Goals)
- Xây dựng màn hình `StoreOwnerDashboardPage` hoàn toàn tách biệt với `AdminDashboardPage`.
- Cấu hình lại điều hướng Route:
  - `/admin/dashboard`: Giữ nguyên cho Quản trị viên hệ thống SaaS.
  - `/store-owner` & `/store-owner/dashboard`: Trỏ về màn hình `StoreOwnerDashboardPage` mới.
- Thiết kế chuẩn mực theo `RULE_UI_DESIGN_SYSTEM.md`:
  - Phong cách KiotViet: Phông `Be Vietnam Pro`, `JetBrains Mono` cho tiền tệ, bo tròn toàn diện (`radius-pill` và card `24px - 28px`).
  - Giao diện tĩnh, chắc chắn, cấm tuyệt đối animation nhún nhảy / float bounce.
  - 100% Monochrome SVG Icons thanh mảnh, không emoji, không icon màu mè lòe loẹt.
  - Component hóa: Mỗi thẻ KPI, biểu đồ, danh sách cảnh báo là một component riêng biệt trong `src/features/dashboard/components/`.

## 3. Phạm Vi (Scope)
- **In-Scope**:
  - Tạo `StoreOwnerDashboardPage.tsx` tại `src/pages/admin/StoreOwnerDashboardPage.tsx` (hoặc `src/features/dashboard/pages/`).
  - Bóc tách các component độc lập:
    - `StoreKpiCardGroup.tsx`: 4 thẻ KPI hàng đầu (Doanh thu hôm nay, Đơn bán ra, Tiền mặt/VietQR, Sổ nợ khách cần thu).
    - `SalesRevenueChartCard.tsx`: Biểu đồ cột/đường doanh thu theo ngày/giờ trong tuần.
    - `FefoExpiryWarningCard.tsx`: Bảng cảnh báo hạn dùng FEFO 3 cấp độ (Khẩn cấp $\le 7$ ngày, Trung bình 8-15 ngày).
    - `LowStockAlertCard.tsx`: Cảnh báo các mặt hàng tồn kho dưới định mức an toàn.
    - `TopSellingProductsCard.tsx`: Top mặt hàng bán chạy tại cửa hàng.
    - `QuickActionPanel.tsx`: Phím tắt thao tác nhanh (Mở POS bán hàng, Nhập hàng nhanh, Kiểm kho, Tạo hóa đơn).
  - Cập nhật định tuyến trong `src/app/router.tsx`.
  - Cập nhật tab "Tổng quan" trên thanh `AppTopNav.tsx` cho Store Owner trỏ về `/store-owner/dashboard`.
- **Out-of-Scope**:
  - Không sửa đổi database backend hay API endpoint lúc này; sử dụng mock data nghiệp vụ bán lẻ thực tế của tiệm tạp hóa.

## 4. Người Dùng & Vai Trò (Users & Roles)
- **Chủ cửa hàng (Store Owner)**: Theo dõi sức khỏe kinh doanh hàng ngày, kiểm soát hạn date và quyết định nhập hàng.
- **Cửa hàng trưởng / Quản lý ca**: Theo dõi doanh thu ca làm và hàng cận date để ưu tiên xả hàng.

## 5. Tiêu Chí Thành Công (Success Criteria)
1. Truy cập `/store-owner` hoặc `/store-owner/dashboard` hiển thị đúng giao diện Tổng quan bán lẻ của chủ tiệm.
2. Truy cập `/admin/dashboard` vẫn hiển thị nguyên vẹn màn hình Quản trị SaaS nền tảng.
3. Tuân thủ 100% `RULE_UI_DESIGN_SYSTEM.md` (bo tròn, monochrome icons, không nhún nhảy, component hóa sạch sẽ).
4. Build `npm run build` hoàn thành với mã 0 (không có bất kỳ lỗi TypeScript nào).
