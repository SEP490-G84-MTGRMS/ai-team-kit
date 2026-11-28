# Đề Xuất Chức Năng: Dashboard KPIs & Báo Cáo P&L (FE-10 Frontend)

## 1. Vấn Đề (Problem Statement)
- Chủ chuỗi (`StoreOwner`) và Quản lý chi nhánh (`StoreManager`) hiện chưa có giao diện tổng hợp để giám sát chỉ số sức khỏe tài chính theo thời gian thực.
- Dữ liệu doanh số bán lẻ (Orders), giá vốn hàng bán xuất theo FEFO (COGS), chi phí vận hành dịch vụ ngoài (FE-07 Service Expenses), và tổn thất hao hụt kho (FE-06) hiện đang bị phân mảnh, chưa được quy tụ về một bảng cân đối Lãi / Lỗ (Profit & Loss - P&L Statement) hoàn chỉnh.
- Thiếu công cụ trực quan hóa (biểu đồ doanh thu, cơ cấu chi phí, top sản phẩm bán chạy) và khả năng xuất báo cáo định dạng chuẩn (Excel/PDF) để phục vụ họp chiến lược và đối soát kế toán.

## 2. Mục Tiêu (Objectives)
1. **Dashboard KPIs Tổng Quan**:
   - Trực quan hóa các chỉ số tài chính trọng yếu: Doanh thu thuần (Net Revenue), Lợi nhuận gộp (Gross Profit), Lợi nhuận ròng (Net Profit), Biên lợi nhuận (Profit Margins), Tổng đơn hàng, và Giá trị trung bình đơn (AOV).
   - Biểu đồ doanh thu & chi phí theo thời gian (Line/Bar charts).
   - Cơ cấu chi phí vận hành (Donut/Pie chart).
   - Danh sách Top 5 / Top 10 sản phẩm đóng góp doanh thu & lợi nhuận cao nhất.
2. **Báo Cáo Lãi / Lỗ (P&L Statement Table)**:
   - Xây dựng bảng biểu chuẩn kế toán bán lẻ:
     + Doanh thu gộp (Gross Sales) - Chiết khấu/Khuyến mãi (Discounts) - Hàng trả lại (Sales Returns) = **Doanh thu thuần (Net Sales)**.
     + Doanh thu thuần - Giá vốn hàng bán (COGS - FEFO) = **Lợi nhuận gộp (Gross Profit)** (Gross Margin %).
     + Lợi nhuận gộp - Chi phí hao hụt kho (Shrinkage Loss) - Chi phí dịch vụ ngoài (Operating Expenses FE-07) = **Lợi nhuận ròng (Net Profit / EBIT)** (Net Margin %).
   - Hỗ trợ Drill-down xem cơ cấu chi tiết từng nhóm chi phí hoặc từng nhóm sản phẩm.
3. **Bộ Lọc & Xuất Dữ Liệu Đa Dạng**:
   - Lọc theo khoảng thời gian nhanh (Hôm nay, Hôm qua, 7 ngày qua, Tháng này, Tháng trước, Quý này, Năm nay) hoặc Tùy chọn (Custom Date Range).
   - Lọc theo phạm vi chi nhánh (Toàn chuỗi hoặc Chi nhánh cụ thể).
   - Xuất dữ liệu Excel (.xlsx / .csv) và Xuất/In PDF khổ A4 kèm tiêu đề cửa hàng và dấu xác nhận.

## 3. Phạm Vi (Scope)
### In Scope (Phạm vi thực hiện)
- Giao diện người dùng (UI Components & Pages) hoàn chỉnh trong `MT_GRMS_FRONTEND`:
  + Trang Dashboard KPIs điều hành (`/store-owner/dashboard` hoặc tab trong Hub Báo cáo).
  + Trang Báo cáo P&L chi tiết (`/store-owner/reports/pnl`).
  + Component Bộ lọc thời gian & chi nhánh dùng chung (`PnlDateFilter`, `BranchSelector`).
  + Component Thẻ chỉ số (`KpiStatCard` với badge tăng trưởng % so với kỳ trước).
  + Component Biểu đồ trực quan hóa số liệu (sử dụng thư viện biểu đồ nhẹ, responsive, tương thích cao).
  + Component Bảng phân tích P&L phân cấp mở rộng (Collapsible P&L Tree Table).
  + Modal / Drawer xem chi tiết cấu thành chi phí (Drill-down breakdown).
  + Modal Xuất Báo Cáo & In ấn PDF định dạng chuẩn (Print Preview).
- Mock Data & Data Contracts: Xây dựng mock service bám sát đúng Schema đã thiết kế trong `database-schema.md` để đảm bảo khi backend C# sẵn sàng, chỉ cần thay đổi API endpoint là tích hợp ngay 100%.
- Cập nhật định tuyến (Router) và Menu Điều Hướng (`AppTopNav.tsx`) dưới mục **Tài chính / Báo cáo**.

### Out of Scope (Ngoài phạm vi)
- Chưa can thiệp chỉnh sửa mã nguồn Backend C# (tuân thủ chỉ thị của người dùng).
- Không bao gồm các nghiệp vụ kế toán chuyên sâu như trích khấu hao tài sản cố định nhiều năm (Depreciation), quyết toán thuế TNDN cuối năm.

## 4. Người Dùng & Phân Quyền (RBAC)
- **StoreOwner (Chủ chuỗi)**: Toàn quyền truy cập. Xem toàn chuỗi hoặc lọc từng chi nhánh. Được quyền xem toàn bộ số liệu doanh thu, giá vốn, chi phí và lợi nhuận ròng.
- **StoreManager (Quản lý chi nhánh)**: Chỉ được xem số liệu thuộc chi nhánh mình quản lý.
- **Cashier & Nhân viên kho**: Không có quyền truy cập vào phân hệ này.

## 5. Tiêu Chí Thành Công (Success Criteria)
1. Giao diện đạt chuẩn thẩm mỹ cao cấp (Modern Teal/Emerald palette, trực quan, sắc nét, tương thích theme chung của MT-GRMS).
2. Tốc độ chuyển đổi bộ lọc thời gian và cập nhật biểu đồ < 200ms.
3. Bảng số liệu P&L tính toán chuẩn xác tuyệt đối các công thức tài chính đã quy định.
4. Trực quan hóa dữ liệu sinh động, hỗ trợ tooltip chi tiết khi di chuột.
5. Tính năng xuất Excel và in/xuất PDF hoạt động trơn tru.
6. Tuân thủ 100% quy chuẩn code: 2 spaces, single quotes, comment tiếng Anh, chia nhỏ component < 50 dòng hoặc modular sạch sẽ.
