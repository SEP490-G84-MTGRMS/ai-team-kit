# Đề Xuất Kỹ Thuật (Proposal): Phân Hệ Báo Cáo Kết Quả Kinh Doanh P&L (FE-10)
## Change: be10-profit-and-loss-reporting

### 1. Bối Cảnh & Vấn Đề (Problem Statement)
- Hiện nay, tại các cửa hàng tạp hóa bán lẻ đa chi nhánh MT-GRMS, chủ hộ kinh doanh đang gặp phải các vấn đề nghiêm trọng trong việc nắm bắt sức khỏe tài chính:
  1. **Lẫn lộn giữa Dòng tiền (Cash Flow) và Lợi nhuận thực tế (Profit):** Tiền trong két nhiều không đồng nghĩa với việc kinh doanh có lãi (vì có thể là tiền khách trả nợ cũ, nợ nhà cung cấp chưa trả, hoặc tiền chủ mới rót vốn). Ngược lại, két hết tiền có thể do vừa nhập lô hàng lớn chứ không phải lỗ.
  2. **Giá vốn hàng bán (COGS) bị tính sai lệch:** Khi không tích hợp chặt chẽ với lô hàng (Batch Inventory) và không trừ giá vốn của hàng bị trả lại, biên lợi nhuận gộp bị bóp méo.
  3. **Chi phí bị phân tán:** Chi phí vận hành nằm rải rác, chi phí nợ xấu bị bỏ quên, dẫn đến báo cáo lãi ảo, đến cuối năm kiểm tra mới thấy thâm hụt vốn.
  4. **Không có khả năng phân tích đa chi nhánh:** Không so sánh được hiệu quả kinh doanh giữa các chi nhánh để biết cửa hàng nào sinh lời, cửa hàng nào đang gánh chi phí quá cao.

### 2. Mục Tiêu (Objectives)
- Xây dựng phân hệ Backend Báo Cáo Kết Quả Kinh Doanh P&L (`FE-10`) chuẩn mực, tự động tổng hợp số liệu theo thời gian thực:
  - Tính toán chính xác **Doanh thu thuần** (Net Revenue = Doanh thu gộp - Chiết khấu - Hàng trả lại).
  - Xác định chuẩn xác **Giá vốn hàng bán (COGS)** và **Lợi nhuận gộp (Gross Profit)**.
  - Tích hợp tự động **Chi phí vận hành (OPEX)** từ phân hệ `FE-07` theo từng nhóm chi phí chuẩn hóa.
  - Tích hợp **Chi phí nợ xấu (Bad Debt Expense)** từ phân hệ `FE-08` khi có bút toán xóa nợ xấu.
  - Tính toán **Lợi nhuận thuần (Net Profit)** và các chỉ số biên lợi nhuận (`Gross Margin %`, `Net Margin %`).
  - Tách biệt 100% dòng tiền vốn chủ sở hữu (`Equity`) khỏi P&L theo nguyên tắc bất biến INV-05.
  - Hỗ trợ báo cáo theo từng chi nhánh (`Branch`) hoặc hợp nhất toàn chuỗi (`Consolidated`), linh hoạt theo mốc thời gian (ngày, tháng, quý, năm, tùy chọn).

### 3. Phạm Vi (Scope)
- **In Scope (Thuộc phạm vi Phase 3):**
  - Công thức tính toán P&L chuẩn kế toán bán lẻ: Revenue, COGS, Gross Profit, OPEX, Bad Debt, Net Profit.
  - Bộ lọc đa chiều: Theo chi nhánh, khoảng thời gian (FromDate - ToDate), so sánh kỳ trước (MoM, YoY).
  - Phân rã chi phí chi tiết theo hạng mục (Mặt bằng, Điện nước, Nhân sự, Vận chuyển, Khác).
  - Báo cáo cơ cấu doanh thu theo nhóm hàng/danh mục sản phẩm.
  - Cung cấp RESTful API hiệu năng cao cho Dashboard và Báo cáo tài chính.
- **Out of Scope (Dành cho Phase 4 & tương lai):**
  - Tính toán nghĩa vụ thuế Hộ kinh doanh theo Thông tư 152/2025/TT-BTC (sẽ làm trong Phase 4 - `FE-19`).
  - Dự báo tài chính bằng AI (Financial Forecasting AI - dành cho phân hệ phân tích nâng cao).

### 4. Người Dùng & Vai Trò (Actors & Roles)
- **Chủ hộ kinh doanh / Ban giám đốc (Owner / Executive):** Xem bức tranh tài chính toàn diện toàn chuỗi, biên lợi nhuận gộp/ròng, ra quyết định đầu tư hoặc cắt giảm chi phí.
- **Cửa hàng trưởng (Store Manager):** Xem báo cáo P&L riêng của chi nhánh mình phụ trách, theo dõi chi phí vận hành và tỷ lệ hoàn hàng.
- **Kế toán tổng hợp (Accountant):** Đối chiếu số liệu doanh thu, giá vốn, chi phí, chuẩn bị dữ liệu cho quyết toán thuế.

### 5. Tiêu Chí Thành Công Đo Được (Success Criteria)
- [x] Báo cáo P&L tính toán khớp 100% về mặt toán học giữa Doanh thu, Giá vốn, Chi phí và Lợi nhuận.
- [x] Tách biệt hoàn toàn 100% các khoản nộp/rút vốn của chủ cửa hàng ra khỏi P&L.
- [x] Thời gian phản hồi API báo cáo P&L $< 300\text{ms}$ ngay cả khi tổng hợp hàng chục nghìn đơn hàng.
- [x] 100% Unit Tests & Integration Tests đạt PASS, Code Coverage $\ge 85\%$.
- [x] Hoàn thành trọn vẹn 6 bước SEP Kit và merge spec vào capability `profit-and-loss`.
