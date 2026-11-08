# Tasks: FE-10 Dashboard KPIs & Báo Cáo P&L (Frontend)

- [x] T1: Tạo Types & Data Contracts (`reportsPnl.types.ts`) và Service Layer với Mock Data thực tế (`reportsPnlService.ts`) <!-- id: T1, ref: REQ-FE10-01, REQ-FE10-03 -->
- [x] T2: Xây dựng thanh công cụ bộ lọc `PnlFilterToolbar.tsx` hỗ trợ lọc theo chi nhánh và các khoảng thời gian linh hoạt <!-- id: T2, ref: REQ-FE10-04, REQ-FE10-06 -->
- [x] T3: Xây dựng khu vực thẻ chỉ số điều hành `PnlKpiCardsSection.tsx` & `PnlKpiCard.tsx` với badge tăng trưởng <!-- id: T3, ref: REQ-FE10-01 -->
- [x] T4: Xây dựng khu vực biểu đồ tương tác `PnlChartsSection.tsx` (Trend Chart đường/cột + Expense Donut Chart) dùng Chart.js <!-- id: T4, ref: REQ-FE10-02 -->
- [x] T5: Xây dựng bảng báo cáo P&L phân cấp cây mở rộng `PnlStatementTable.tsx` với đầy đủ công thức chuẩn kế toán <!-- id: T5, ref: REQ-FE10-03 -->
- [x] T6: Xây dựng modal xuất dữ liệu và xem trước in ấn khổ A4 `PnlExportModal.tsx` (Excel & PDF Print) <!-- id: T6, ref: REQ-FE10-05 -->
- [x] T7: Hoàn thiện trang `ReportsPnlDashboardPage.tsx`, cấu hình định tuyến trong `router.tsx` và cập nhật menu `AppTopNav.tsx` <!-- id: T7, ref: REQ-FE10-01, REQ-FE10-06 -->
- [x] T8: Viết test unit kiểm chứng tính toán tài chính và chạy kiểm tra `npm run build` <!-- id: T8, ref: REQ-FE10-01, REQ-FE10-03 -->

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: refactor-fe10-ui-design-system -->
# Tasks: Đồng Bộ MT-GRMS Design System & Shared Components Cho FE-10

- [x] T1: Xây dựng stylesheet chuẩn hóa `reports-pnl.css` kế thừa biến CSS MT-GRMS (Deep Teal, KiotViet Pills, bo góc 20px) <!-- id: T1, ref: REQ-FE10-DESIGN-01 -->
- [x] T2: Mở rộng mock data `buildMockTopProducts()` trong `reportsPnlService.ts` lên 10+ sản phẩm để phục vụ phân trang <!-- id: T2, ref: REQ-FE10-SHARED-03 -->
- [x] T3: Refactor `PnlChartsSection.tsx` tích hợp shared component `TablePagination` cho danh sách Top sản phẩm bán chạy <!-- id: T3, ref: REQ-FE10-SHARED-03 -->
- [x] T4: Refactor `PnlFilterToolbar.tsx` và `PnlKpiCard.tsx` áp dụng styling pills và tone màu Deep Teal đồng bộ <!-- id: T4, ref: REQ-FE10-DESIGN-01 -->
- [x] T5: Refactor `ReportsPnlDashboardPage.tsx` tích hợp shared component `AdminToast` và layout topbar chuẩn MT-GRMS <!-- id: T5, ref: REQ-FE10-SHARED-02 -->
- [x] T6: Refactor `PnlExportModal.tsx` và `PnlStatementTable.tsx` đồng bộ tone màu Deep Teal và toast feedback <!-- id: T6, ref: REQ-FE10-DESIGN-01, REQ-FE10-SHARED-02 -->
- [x] T7: Chạy kiểm thử tự động `npm test` và kiểm tra biên dịch `npm run build` <!-- id: T7, ref: INV-03 -->
