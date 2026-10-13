# EXP-2026-10-13-REFACTOR-FE10: Khảo Sát Đồng Bộ MT-GRMS Design System & Shared Components Cho FE-10

## 1. Problem Statement
Phân hệ FE-10 (Dashboard KPIs & Báo Cáo P&L) sau khi hoàn thành chức năng ban đầu cần được nâng cấp thẩm mỹ để hòa hợp 100% với Design System chung của dự án MT-GRMS (như FE-07 và FE-08), đồng thời tích hợp các shared components cốt lõi (`AdminToast`, `TablePagination`) để mang lại trải nghiệm người dùng cao cấp nhất.

## 2. Hiện Trạng Code (Current State)
- Màu sắc hiện tại: Tone màu xanh lá phân mảnh (`emerald-600/700`), chưa sử dụng token màu thương hiệu chuẩn của MT-GRMS: **Deep Teal (`#0F766E`)**, **Dark Teal (`#115E59`)**, nền **Soft Teal (`#F0FDFA`)**, viền **Teal Light (`#99F6E4` / `#CCFBF1`)**.
- Kiểu dáng nút bấm: Đang dùng nút hình chữ nhật bo góc nhẹ (`rounded-lg`), trong khi chuẩn dự án là **KiotViet Pills (`rounded-full`)**.
- Thông báo người dùng: Chưa có Toast feedback chuẩn; khi người dùng bấm "Làm mới số liệu" hoặc "Xuất file CSV", hệ thống chưa có phản hồi Toast nổi trực quan.
- Phân trang dữ liệu: Bảng Top sản phẩm bán chạy đang fix cứng 5 item, chưa tích hợp shared component `TablePagination` đã chuẩn hóa trong dự án.

## 3. Assumptions & Invariants
- **Bất biến logic tài chính**: Đẳng thức kế toán P&L (Doanh thu thuần - COGS = Lãi gộp; Lãi gộp - Chi phí vận hành - Hao hụt kho = Lãi ròng) và xử lý chia cho 0 giữ nguyên 100%.
- **Bảo toàn Test**: Toàn bộ 22 unit tests Vitest và lệnh build `npm run build` tiếp tục PASS.

## 4. Scope & Non-Goals
### In Scope
1. Tạo stylesheet chuyên biệt `reports-pnl.css` với các token và utility classes MT-GRMS Design System.
2. Nâng cấp giao diện Header trang với icon box Deep Teal 44x44px chuẩn hóa.
3. Chuyển đổi toàn bộ nút hành động sang `btn-primary-pill`, `btn-secondary-pill`.
4. Tích hợp `AdminToast` từ `src/features/admin/components` cho mọi hành động của người dùng.
5. Tích hợp `TablePagination` từ `src/components/common/TablePagination` cho Top sản phẩm bán chạy.
6. Cập nhật các thẻ Card thành bo góc `20px` với viền Teal dịu mắt.

### Non-Goals
- Không thay đổi contracts API hay mock service data contracts.
- Không can thiệp Backend C#.

## 5. Phương Án Kỹ Thuật (Architecture Plan)
- **Tập tin CSS mới**: `src/features/reports-pnl/reports-pnl.css` đóng gói namespace `.pnl-page`, `.pnl-card`, `.btn-primary-pill`, `.pnl-kpi-card`.
- **Toast Hook / State**: Khai báo `useState<ToastState | null>` và helper `showToast(msg, type)` trong `ReportsPnlDashboardPage.tsx`, render `<AdminToast toast={toast} onClose={() => setToast(null)} />`.
- **Pagination State**: Bổ sung `currentPage`, `pageSize` trong danh sách Top sản phẩm để điều khiển `TablePagination`.
