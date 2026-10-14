# Delta Specs: Màn Hình Tổng Quan Dành Riêng Cho Chủ Cửa Hàng (Store Owner Dashboard)

## ADDED Requirements

### Requirement: REQ-DASH-01 Phân tách Tổng quan Chủ tiệm và Tổng quan Admin SaaS
- Hệ thống **MUST** phân tách rõ ràng màn hình Tổng quan của Chủ cửa hàng (`/store-owner/dashboard`) và Tổng quan của Quản trị hệ thống (`/admin/dashboard`).
- Khi người dùng truy cập `/store-owner` hoặc `/store-owner/dashboard`, hệ thống **SHALL** render `StoreOwnerDashboardPage`.
- Khi người dùng truy cập `/admin/dashboard`, hệ thống **SHALL** tiếp tục render `AdminDashboardPage`.

#### Scenario: Truy cập đúng dashboard theo vai trò
- **GIVEN** Người dùng là Chủ cửa hàng đang làm việc trên portal Store Owner
- **WHEN** Người dùng click tab "Tổng quan" trên navbar hoặc truy cập URL `/store-owner/dashboard`
- **THEN** Hệ thống hiển thị giao diện Store Owner Dashboard với các chỉ số bán lẻ tại quầy
- **AND** Không hiển thị các chỉ số SaaS như MRR/ARR/Tenants

### Requirement: REQ-DASH-02 Hiển thị 4 thẻ KPI bán lẻ hàng đầu
- Hệ thống **MUST** hiển thị 4 thẻ KPI cốt lõi của tiệm tạp hóa:
  1. Doanh thu bán hàng trong kỳ + tỷ lệ tăng trưởng.
  2. Số lượng hóa đơn thanh toán thành công + giá trị trung bình mỗi hóa đơn.
  3. Cơ cấu dòng tiền bán lẻ (Tiền mặt tại két vs Chuyển khoản ngân hàng VietQR).
  4. Tổng dư nợ sổ mua chịu của khách hàng kèm số lượng khách đang nợ.

#### Scenario: Xem các chỉ số KPI bán hàng hôm nay
- **GIVEN** Chủ cửa hàng đang ở trang Store Owner Dashboard
- **WHEN** Bộ lọc thời gian chọn là "Hôm nay"
- **THEN** Cả 4 thẻ KPI cập nhật tương ứng theo ngày hôm nay
- **AND** Số tiền được định dạng VND chuẩn với phông số JetBrains Mono căn thẳng hàng

### Requirement: REQ-DASH-03 Bảng cảnh báo hạn dùng FEFO 3 mức màu
- Hệ thống **MUST** hiển thị danh sách các lô hàng cận hạn sử dụng theo nguyên tắc FEFO (First-Expired, First-Out).
- Phân loại trực quan 3 mức độ:
  - Khẩn cấp ($\le 7$ ngày): Badge đỏ (`#FF3B30`, nền `#FFF0F0`).
  - Trung bình (8 - 15 ngày): Badge vàng cam (`#FF9500`, nền `#FFF8EB`).
  - An toàn (> 15 ngày): Badge xanh lá (`#00C853`, nền `#E8F9EE`).

#### Scenario: Kiểm tra lô hàng cận hạn để xả hàng
- **GIVEN** Có các lô hàng bánh mì tươi còn 3 ngày và sữa chua còn 10 ngày
- **WHEN** Chủ tiệm xem khối cảnh báo FEFO
- **THEN** Lô bánh mì tươi hiển thị badge đỏ khẩn cấp "Còn 3 ngày" kèm nút "Giảm giá xả hàng"
- **AND** Lô sữa chua hiển thị badge cam "Còn 10 ngày"

### Requirement: REQ-DASH-04 Cảnh báo tồn kho dưới định mức và Top hàng bán chạy
- Hệ thống **MUST** hiển thị danh sách sản phẩm tồn kho chạm ngưỡng tối thiểu để chủ tiệm kịp thời tạo đơn nhập hàng NCC.
- Hệ thống **MUST** hiển thị Top 5 sản phẩm bán chạy nhất trong kỳ.

#### Scenario: Thao tác đặt hàng nhanh từ cảnh báo tồn kho
- **GIVEN** Mặt hàng "Dầu ăn Simply 1L" tồn kho còn 3 chai (dưới mức tối thiểu 10)
- **WHEN** Chủ tiệm click nút "Nhập hàng" tại dòng cảnh báo
- **THEN** Hệ thống điều hướng sang trang tạo đơn nhập hàng với nhà cung cấp

---

## Acceptance Checklist
- [ ] Màn hình `StoreOwnerDashboardPage` được tạo độc lập tại `src/features/store-owner-dashboard/pages/StoreOwnerDashboardPage.tsx`.
- [ ] Toàn bộ các thẻ UI được bóc tách thành các component riêng trong `src/features/store-owner-dashboard/components/`.
- [ ] Không có bất kỳ icon emoji nào; 100% monochrome SVG icons.
- [ ] Không có bất kỳ animation nhún nhảy / floatBounce nào.
- [ ] Nút bấm và badge bo tròn Full Pill (`border-radius: 9999px`).
- [ ] Tuyến đường `/store-owner` và `/store-owner/dashboard` trong `router.tsx` trỏ đúng vào `StoreOwnerDashboardPage`.
- [ ] Tuyến đường `/admin/dashboard` không bị ảnh hưởng.
- [ ] Chạy `npm run build` thành công 100% không có lỗi TypeScript.
