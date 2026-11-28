# Exploration: Thiết Kế Màn Hình Tổng Quan Dành Riêng Cho Chủ Cửa Hàng (Store Owner Dashboard)

## 1. Hiện Trạng Code & Kiến Trúc
- Hiện tại trong `src/app/router.tsx`, route `/store-owner` và `/store-owner/dashboard` đang trỏ thẳng vào component `AdminDashboardPage`.
- `AdminDashboardPage.tsx` được thiết kế phục vụ Master Admin nền tảng SaaS chuỗi bán lẻ đa tenant với các chỉ số:
  - Tổng số chuỗi cửa hàng (Tenants: 128 chuỗi).
  - Doanh thu định kỳ phần mềm (MRR: 148.5M đ, ARR: 1.78 Tỷ đ).
  - Tỷ lệ duy trì & rời bỏ thuê bao (Retention: 96.4%, Churn: 0.6%).
  - Cơ cấu các gói cước dịch vụ (Basic, Pro, Advanced).
- Điều này hoàn toàn không khớp với nhu cầu quản trị bán lẻ thực tế của Chủ cửa hàng tạp hóa (Store Owner):
  - Chủ tiệm cần biết hôm nay bán được bao nhiêu tiền, bao nhiêu khách ghé tiệm, tiền trong két và tiền VietQR bao nhiêu.
  - Chủ tiệm cần cảnh báo date FEFO ngay lập tức để không bị thối hỏng bánh kẹo, sữa tươi, thực phẩm.
  - Chủ tiệm cần biết mặt hàng nào sắp hết hàng và khách nào còn nợ tiền.

## 2. Giả Định (Assumptions)
- Dữ liệu demo/mock của Store Owner Dashboard bám sát mô hình bán lẻ thực tế của tiệm tạp hóa Việt Nam (Doanh thu hàng triệu đồng, phông tabular JetBrains Mono cho tiền tệ VND).
- Toàn bộ component sử dụng Vanilla CSS / CSS Modules kết hợp Design System tại `src/index.css` (`Be Vietnam Pro`, bo tròn KiotViet `radius-pill` và `24px - 28px`, màu Electric Blue `#0066FF`).
- Tuân thủ 100% `RULE_UI_DESIGN_SYSTEM.md`: Không dùng animation floatBounce/nhún nhảy; 100% icon monochrome SVG thanh mảnh.

## 3. Non-Goals (Những gì KHÔNG làm)
- Không thay đổi hoặc ghi đè component `AdminDashboardPage` (vẫn giữ nguyên cho route `/admin/dashboard` của Master Admin).
- Không gọi backend API mới lúc này (dữ liệu mock trực tiếp với state filter linh hoạt: Hôm nay, 7 ngày qua, Tháng này).
- Không can thiệp vào các trang phân hệ khác (Hàng hóa, Nhà cung cấp, Chấm công...).

## 4. Các Phương Án Kỹ Thuật (Options Comparison)

### Phương Án A (Khuyến nghị): Tạo Feature Folder Riêng Biệt `src/features/store-owner-dashboard/`
- **Cách làm**:
  - Tạo cấu trúc:
    - `src/features/store-owner-dashboard/pages/StoreOwnerDashboardPage.tsx`
    - `src/features/store-owner-dashboard/components/StoreOwnerKpiRow.tsx`
    - `src/features/store-owner-dashboard/components/StoreRevenueChartCard.tsx`
    - `src/features/store-owner-dashboard/components/FefoWarningCard.tsx`
    - `src/features/store-owner-dashboard/components/LowStockWarningCard.tsx`
    - `src/features/store-owner-dashboard/components/TopSellingProductsCard.tsx`
    - `src/features/store-owner-dashboard/components/StoreQuickActionsCard.tsx`
    - `src/features/store-owner-dashboard/types/dashboard.types.ts`
- **Ưu điểm**:
  - Tuân thủ triệt để nguyên tắc component hóa của Clean Architecture và `RULE_UI_DESIGN_SYSTEM.md`.
  - Dễ bảo trì, test và mở rộng kết nối API sau này.
  - Mã nguồn gọn gàng, file Page chỉ làm nhiệm vụ kết nối layout.
- **Nhược điểm**: Tạo nhiều file hơn một chút nhưng rất chuyên nghiệp.

### Phương Án B: Viết toàn bộ vào một file duy nhất `StoreOwnerDashboardPage.tsx`
- **Cách làm**: Nhồi nhét hàng nghìn dòng JSX vào một file trong `src/pages/admin/`.
- **Nhược điểm**: Vi phạm nghiêm trọng `RULE_UI_DESIGN_SYSTEM.md` (CẤM code monolithic nguyên khối) và khó kiểm soát lỗi.

## 5. Quyết Định Chọn
- **Chọn Phương Án A**: Bóc tách component độc lập, đặt trong `src/features/store-owner-dashboard/`.

## 6. Rủi Ro & Cách Giảm Thiểu
- **Rủi ro**: Lỗi định tuyến điều hướng khi click tab "Tổng quan" trên navbar.
- **Cách giảm thiểu**: Kiểm tra đồng bộ cả `router.tsx` và `AppTopNav.tsx` để liên kết trỏ chính xác về `/store-owner/dashboard`.
