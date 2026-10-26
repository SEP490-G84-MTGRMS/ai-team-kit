# Đánh Giá Phản Biện Chuyên Sâu (Skeptic Review)
## Change: be10-profit-and-loss-reporting — Phân Hệ Báo Cáo P&L (FE-10)

### 1. Phân Tích 5 Tiêu Chí Độc Lập

#### Tiêu chí 1: Tính Khả Thi Kỹ Thuật (Technical Feasibility) — Đạt 5/5 ⭐
- Dữ liệu đầu vào cho P&L đã sẵn sàng 100%: Doanh thu từ `PosOrders`, Chi phí vận hành từ `ExpenseVouchers` (`FE-07`), Chi phí nợ xấu từ `CustomerDebtEntries` (`FE-08`).
- EF Core LINQ truy vấn tổng hợp kết hợp các composite index đã tạo tại Phase 1 và Phase 2 giúp câu lệnh tổng hợp chạy cực nhanh ($< 150\text{ms}$).

#### Tiêu chí 2: Tính Đơn Giản & Tối Giản Mã Nguồn (Simplicity & Minimalism) — Đạt 5/5 ⭐
- Không cần tạo thêm bảng dữ liệu mới trong database gây phình to và rủi ro out-of-sync dữ liệu; chỉ cần xây dựng `IPnLReportService` tổng hợp từ các bảng gốc nguồn sự thật (Single Source of Truth).
- Trả về DTOs có cấu trúc dạng phân cấp rõ ràng, dễ dàng map lên các widget giao diện (Waterfall chart, Margin gauges).

#### Tiêu chí 3: Nhận Diện Rủi Ro & Góc Khuất Thực Tế (Edge Cases & Risk Mitigation) — Đạt 5/5 ⭐
- **Góc khuất 1: Phép chia cho 0 khi Doanh thu thuần $\le 0$** (kỳ mới mở hoặc cửa hàng mới lập chưa có đơn).
  - Giải pháp: Kiểm tra biên chặt chẽ, trả về tỷ suất biên $0\%$ thay vì ném lỗi `DivideByZeroException`.
- **Góc khuất 2: Trùng lặp chi phí hoặc tính nhầm vốn chủ sở hữu.**
  - Giải pháp: Chỉ lấy chi phí có trạng thái `Approved` hoặc `Paid` từ bảng `ExpenseVoucher`, tuyệt đối không truy vấn bảng `CashbookEntry` để tránh bị dính bút toán nộp/rút vốn của chủ.
- **Góc khuất 3: Chi phí nợ xấu bị tính 2 lần (lúc nợ và lúc xóa nợ).**
  - Giải pháp: Khi bán nợ, doanh thu đã được ghi nhận. Khi xóa nợ xấu, ghi nhận một khoản chi phí tài chính (`BadDebtExpense`) để giảm trừ lợi nhuận thực tế. Không tính khoản này vào chi phí vận hành thường xuyên.

#### Tiêu chí 4: Kiến Trúc Sạch & Cô Lập Dữ Liệu Đa Chi Nhánh (Clean Architecture & Multi-Tenancy) — Đạt 5/5 ⭐
- Các câu truy vấn đều tuân thủ Global Query Filter của `BaseTenantEntity`, bảo đảm tuyệt đối không lộ dữ liệu doanh thu, chi phí giữa các Tenant/Cửa hàng khác nhau.
- Tách bạch rõ ràng `IPnLReportRepository` và `IPnLReportService`.

#### Tiêu chí 5: Tính Kiểm Chứng Được (Testability) — Đạt 5/5 ⭐
- Toàn bộ các công thức tính toán: Gross Revenue, Net Revenue, COGS, Gross Profit, OPEX categories, Bad Debt, Net Profit, Margins % đều có thể viết Unit Tests và Integration Tests xác thực từng con số với độ chính xác số thập phân tuyệt đối (`decimal(18,2)`).

---

### 2. Kết Luận & Khuyến Nghị
- **Đánh giá chung:** Đạt điểm tuyệt đối **5/5**.
- **Khuyến nghị:** Phân chia `tasks.md` thành 4 Phase chuẩn mực:
  - Phase 1: Core Models & DTOs Contracts (T1–T4).
  - Phase 2: Application Report Service & Aggregation Engine (T5–T8).
  - Phase 3: API Controller & Dependency Injection (T9–T12).
  - Phase 4: Unit Testing & Verification (T13–T16).
