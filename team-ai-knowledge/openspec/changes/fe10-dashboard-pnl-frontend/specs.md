# Delta Specifications: FE-10 Dashboard KPIs & Báo Cáo P&L (Frontend)

## ADDED Requirements

### Requirement: REQ-FE10-01 Hiển Thị Dashboard KPIs Tổng Quan
The system MUST display high-level KPI cards summarizing financial health in the selected period and branch scope.
The KPI cards MUST include: Doanh thu thuần (Net Revenue), Giá vốn (COGS), Lợi nhuận gộp (Gross Profit), Chi phí vận hành (Operating Expenses), Lợi nhuận ròng (Net Profit), Tổng số đơn hàng (Total Orders), and Giá trị trung bình đơn (AOV).
Each KPI card SHALL display the growth rate percentage compared to the immediately preceding equivalent period.

#### Scenario: Xem KPIs toàn chuỗi trong tháng này
**GIVEN** Người dùng đăng nhập với vai trò `StoreOwner` đang ở trang `/store-owner/reports/pnl`  
**WHEN** Người dùng chọn chi nhánh "Tất cả chi nhánh" và khoảng thời gian "Tháng này"  
**THEN** Hệ thống hiển thị 6 thẻ KPI tổng hợp toàn chuỗi với các số liệu tiền tệ VNĐ được định dạng ngăn cách hàng nghìn  
**AND** Hiển thị nhãn tăng trưởng so với tháng trước (màu xanh lá nếu tăng trưởng dương, màu đỏ nếu giảm).

#### Scenario: Chi nhánh mới chưa có dữ liệu giao dịch (Edge Case)
**GIVEN** Chi nhánh "CN-03" mới khai trương hôm nay và chưa có bất kỳ đơn hàng hay chi phí nào  
**WHEN** Người dùng chọn lọc chi nhánh "CN-03" và khoảng thời gian "Hôm nay"  
**THEN** Các thẻ KPI hiển thị giá trị `0 đ`, số đơn hàng là `0`, và tỷ lệ tăng trưởng hiển thị `0%` mà không gây ra lỗi chia cho 0 (NaN/Infinity).

---

### Requirement: REQ-FE10-02 Trực Quan Hóa Bằng Biểu Đồ Tương Tác
The system MUST render two interactive charts:
1. `TrendChart`: Biểu đồ kết hợp cột và đường hiển thị biến động Doanh thu, Chi phí, và Lợi nhuận theo ngày/tháng.
2. `ExpenseStructureChart`: Biểu đồ tròn/Donut thể hiện tỷ trọng phần trăm của các nhóm chi phí (Mặt bằng, Điện nước, Nhân sự, Hao hụt kho, v.v.).
The charts SHALL support tooltips on hover with formatted currency amounts and allow clicking legend items to toggle visibility of data series.

#### Scenario: Rê chuột xem chi tiết số liệu trên biểu đồ xu hướng
**GIVEN** Biểu đồ xu hướng đang hiển thị dữ liệu 7 ngày qua  
**WHEN** Người dùng rê chuột vào cột ngày "12/10/2026"  
**THEN** Tooltip nổi lên hiển thị chính xác: Doanh thu: `15.500.000 đ`, Chi phí: `8.200.000 đ`, Lợi nhuận ròng: `7.300.000 đ`.

#### Scenario: Ẩn/hiện chuỗi dữ liệu trên biểu đồ
**GIVEN** Biểu đồ đang hiển thị cả 3 chuỗi số liệu: Doanh thu, Chi phí, Lợi nhuận  
**WHEN** Người dùng bấm vào chú thích (Legend) "Chi phí"  
**THEN** Chuỗi đường Chi phí bị gạch ngang và ẩn khỏi đồ thị; biểu đồ tự động scale lại trục tung Y-axis.

---

### Requirement: REQ-FE10-03 Bảng Báo Cáo P&L Phân Cấp Chuẩn Kế Toán
The system MUST provide a structured, hierarchical Profit & Loss Statement table.
The table MUST follow the accounting structure:
- I. Doanh thu bán hàng gộp -> Giảm trừ (Chiết khấu, Trả hàng) -> **Doanh thu thuần** (100%)
- II. Giá vốn hàng bán (COGS) -> **Lợi nhuận gộp** (% Gross Margin)
- III. Chi phí hao hụt kho + Chi phí dịch vụ ngoài -> **Tổng chi phí vận hành**
- IV. **Lợi nhuận ròng** (% Net Margin)
The table SHALL allow expanding/collapsing child rows for detailed breakdowns.

#### Scenario: Mở rộng xem chi tiết nhóm chi phí dịch vụ
**GIVEN** Bảng P&L đang ở trạng thái thu gọn tại mục "3.2 Chi phí dịch vụ ngoài (FE-07)"  
**WHEN** Người dùng nhấn vào biểu tượng mũi tên mở rộng cạnh dòng chi phí  
**THEN** Hệ thống mở rộng các dòng con: Tiền thuê mặt bằng, Tiền điện nước mạng, Lương nhân viên, Sửa chữa bảo trì  
**AND** Mỗi dòng con hiển thị đúng số tiền và tỷ trọng % tương ứng so với Doanh thu thuần.

---

### Requirement: REQ-FE10-04 Bộ Lọc Thời Gian & Chi Nhánh Linh Hoạt
The system MUST provide a filter toolbar allowing users to switch date periods quickly:
`Hôm nay`, `7 ngày qua`, `Tháng này`, `Tháng trước`, `Quý này`, or `Tùy chọn ngày`.
The system SHALL remember the selected filter state during the session.

#### Scenario: Chọn khoảng ngày tùy chỉnh
**GIVEN** Người dùng đang ở màn hình báo cáo  
**WHEN** Người dùng chọn preset "Tùy chọn", nhập ngày bắt đầu `01/10/2026` và ngày kết thúc `10/10/2026`  
**THEN** Hệ thống tự động làm mới toàn bộ thẻ KPI, hai biểu đồ và bảng P&L theo khoảng thời gian đã chọn trong vòng dưới 200ms.

---

### Requirement: REQ-FE10-05 Xuất Dữ Liệu Excel & In/Xuất PDF Chuẩn A4
The system MUST support exporting the P&L report into:
1. File Excel/CSV chứa bảng biểu phân tích và các chỉ số tài chính.
2. Bản in / PDF khổ A4 chuyên nghiệp có tiêu đề cửa hàng, mã số thuế, khoảng thời gian báo cáo, và ngày giờ xuất báo cáo.

#### Scenario: Bấm xuất file Excel
**GIVEN** Người dùng đã lọc xong báo cáo P&L tháng 10/2026  
**WHEN** Người dùng bấm nút "Xuất Excel"  
**THEN** Trình duyệt tải xuống file `BaoCao_PNL_Thang10_2026.csv` chứa đầy đủ cấu trúc các cột: Mã khoản mục, Tên khoản mục, Số tiền (VNĐ), Tỷ lệ %/Doanh thu.

#### Scenario: Bấm in báo cáo PDF
**GIVEN** Người dùng bấm nút "In / Xuất PDF"  
**WHEN** Modal Print Preview mở lên và người dùng bấm "Xác nhận in"  
**THEN** Hộp thoại in trình duyệt kích hoạt với định dạng A4 gọn gàng, ẩn các nút bấm điều hướng không cần thiết.

---

### Requirement: REQ-FE10-06 Phân Quyền Vai Trò Người Dùng (RBAC)
The system MUST enforce role-based access control:
- `StoreOwner`: Được chọn xem Toàn chuỗi ("Tất cả chi nhánh") hoặc lọc bất kỳ chi nhánh nào.
- `StoreManager`: Cố định chi nhánh được gán công việc, selector chi nhánh bị khóa (Disabled) hoặc chỉ hiển thị chi nhánh phụ trách.
- `Cashier` & `InventoryStaff`: Bị chặn truy cập trang báo cáo này (chuyển hướng về trang POS hoặc thông báo 403 Forbidden).

#### Scenario: Quản lý chi nhánh truy cập báo cáo
**GIVEN** Người dùng đăng nhập tài khoản Quản lý chi nhánh "CN-Cầu Giấy"  
**WHEN** Người dùng truy cập trang Báo cáo P&L  
**THEN** Dropdown chọn chi nhánh cố định là "CN-Cầu Giấy" và không thể đổi sang chi nhánh khác.

---

## Acceptance Checklist
- [ ] Màn hình All-in-one tích hợp đầy đủ KPI Cards, Biểu đồ Trend/Donut, và Bảng P&L.
- [ ] Biểu đồ Chart.js hiển thị sắc nét, tương tác mượt mà, đổi filter tự cập nhật.
- [ ] Bảng P&L phân cấp mở rộng/thu gọn chuẩn mực kế toán.
- [ ] Bộ lọc ngày (Preset + Date Range) và Chi nhánh hoạt động tức thì.
- [ ] Tính năng Xuất Excel và In PDF hoạt động ổn định.
- [ ] Hỗ trợ đầy đủ trạng thái Loading skeleton, Empty state khi không có dữ liệu.
- [ ] Tích hợp mượt mà vào TopNav và Router của hệ thống.
