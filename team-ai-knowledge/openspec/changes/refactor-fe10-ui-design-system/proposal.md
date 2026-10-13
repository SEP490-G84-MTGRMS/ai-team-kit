# Đề Xuất Cải Tổ: Đồng Bộ Thiết Kế Chung MT-GRMS Design System & Tích Hợp Shared Components Cho FE-10

## 1. Vấn Đề (Problem Statement)
- Giao diện của phân hệ FE-10 (Dashboard KPIs & Báo Cáo P&L) hiện đang sử dụng styling ad-hoc với màu Emerald, chưa đồng bộ với Design System chuẩn mực của toàn dự án MT-GRMS (đã được áp dụng trên FE-07 Quản lý chi phí và FE-08 Khách hàng CRM).
- Cụ thể:
  1. Chưa có dedicated stylesheet kế thừa các biến CSS toàn cục của MT-GRMS: Màu chủ đạo **Deep Teal (`#0F766E`)**, màu nền dịu nhẹ **Soft Blue/Teal (`#F0FDFA`)**, đường viền xanh ngọc nhạt (`#99F6E4`), và font chữ **Be Vietnam Pro**.
  2. Các nút thao tác chưa áp dụng phong cách KiotViet Pills (`btn-primary-pill`, `btn-secondary-pill`, bo góc tròn 9999px).
  3. Chưa tích hợp hệ thống thông báo trạng thái chuẩn **`AdminToast`** từ `src/features/admin/components` (để phản hồi khi xuất file Excel, kích hoạt in PDF, làm mới số liệu).
  4. Bảng danh sách Top sản phẩm bán chạy chưa tích hợp shared component chuẩn hóa **`TablePagination`** (`src/components/common/TablePagination`).

## 2. Mục Tiêu (Objectives)
1. **Đồng Bộ Hóa 100% Thẩm Mỹ MT-GRMS**:
   - Xây dựng file `reports-pnl.css` chuẩn hóa, khớp màu Deep Teal (`#0F766E`), nút bấm dạng pill bo tròn, card bo viền tròn mềm mại (`20px - 24px`), đổ bóng nhẹ `shadow-sm`.
   - Header trang có icon box màu Deep Teal (`44px x 44px`, bo góc `14px`, bóng đổ teal sang trọng) đồng bộ với FE-07 và FE-08.
2. **Tích Hợp Các Shared Components Cốt Lõi**:
   - Tích hợp `AdminToast` với các trạng thái `success`, `error`, `info`.
   - Tích hợp `TablePagination` cho danh sách chi tiết sản phẩm và các dòng giao dịch.
3. **Bảo Toàn Logic Nghiệp Vụ (Invariants)**:
   - Giữ nguyên 100% logic tính toán tài chính (Doanh thu thuần, Giá vốn FEFO, Chi phí vận hành FE-07, Hao hụt kho FE-06, Lợi nhuận ròng) đã được kiểm chứng.

## 3. Phạm Vi (Scope)
- **In Scope**:
  - Tạo `src/features/reports-pnl/reports-pnl.css`.
  - Refactor các components: `ReportsPnlDashboardPage.tsx`, `PnlFilterToolbar.tsx`, `PnlKpiCard.tsx`, `PnlKpiCardsSection.tsx`, `PnlChartsSection.tsx`, `PnlStatementTable.tsx`, `PnlExportModal.tsx`.
  - Tích hợp `AdminToast` và `TablePagination`.
- **Out of Scope**:
  - Không thay đổi contracts API hay mock service data contracts.
  - Không sửa đổi mã nguồn Backend C#.

## 4. Tiêu Chí Thành Công (Success Criteria)
1. Giao diện FE-10 nhìn liền mạch, sang trọng, cùng một ngôn ngữ thiết kế (Deep Teal KiotViet Style) với FE-07 và FE-08.
2. Tích hợp mượt mà `AdminToast` và `TablePagination`.
3. Toàn bộ unit tests (22/22 tests) và lệnh build `npm run build` tiếp tục PASS 100%.
