# Skeptic Review: fe10-dashboard-pnl-frontend

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ kịch bản cho cả KPI Cards, 2 Biểu đồ, Bảng P&L, Bộ lọc thời gian, và Xuất file. Có edge case doanh số 0 và chi nhánh mới. |
| D2 Correctness | 5/5 | Chuẩn xác công thức kế toán (Doanh thu thuần - COGS = Lãi gộp; Lãi gộp - Chi phí = Lãi ròng). Logic tỷ trọng % chặt chẽ. |
| D3 Coherence | 5/5 | Đồng nhất 100% giữa Proposal, Exploration, Design-brief và Specs về mô hình trang All-in-one gộp KPIs và P&L Statement. |
| D4 Constraints | 5/5 | Tuân thủ tuyệt đối chỉ thị không chạm Backend C#; khai thác đúng thư viện Chart.js & react-chartjs-2 có sẵn. |
| D5 Blast Radius | 5/5 | Rất an toàn. Module `reports-pnl` hoàn toàn độc lập, chỉ bổ sung route và link trên TopNav, không gây ảnh hưởng tới các module khác. |

## Vấn đề & Lưu ý triển khai
- [MEDIUM] Xử lý phép chia cho 0 khi Doanh thu thuần bằng 0: Khi tính `percentageOfNetRevenue` hoặc `GrossMarginPct`, nếu `NetRevenue === 0` thì bắt buộc gán `0%` thay vì để hiển thị `NaN%` hoặc `Infinity%`.
  → Đề xuất: Viết hàm tiện ích `calculateMarginPct(profit, revenue)` an toàn.
- [LOW] Khả năng responsive trên màn hình laptop nhỏ (1366x768): Cần đảm bảo các thẻ KPI hiển thị dạng responsive grid (2 cột trên mobile, 3-4 cột trên tablet, 6 cột trên desktop lớn).
  → Đề xuất: Dùng grid `grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4`.
- [LOW] Đăng ký Chart.js modules: Trong React 19, cần gọi `ChartJS.register(...)` một lần duy nhất cho các thành phần (CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend).
  → Đề xuất: Khởi tạo tập trung trong component biểu đồ hoặc chart helper.

## Kết luận: Chấp nhận
Specs đã sẵn sàng để lập danh sách công việc (`tasks.md`) và triển khai code.
