# Báo Cáo Khảo Sát Kỹ Thuật & Kiến Trúc (Exploration)
## Change: be10-profit-and-loss-reporting — Phân Hệ Báo Cáo P&L (FE-10)

### 1. Phân Tích Thực Trạng & Kiến Trúc Dữ Liệu Hiện Tại
- **Hệ thống đơn hàng (POS Orders):** Bảng `Order` (hoặc `Orders`) chứa thông tin doanh số bán hàng, chiết khấu và trạng thái hoàn thành.
- **Phân hệ Chi phí vận hành (`FE-07`):** Bảng `ExpenseVoucher` đã được triển khai tại Phase 1 với đầy đủ trạng thái `Approved`, `Paid`, phân loại theo `Category` (Mặt bằng, Điện nước, Nhân sự, Vận chuyển, Khác) và cờ thuế `IsTaxDeductible`.
- **Phân hệ Công nợ khách hàng (`FE-08`):** Bảng `CustomerDebtEntry` đã được triển khai tại Phase 2 với bút toán `BadDebtWriteOff` ghi nhận tổn thất nợ xấu.
- **Phân hệ Sổ quỹ (`FE-17`):** Chứa các dòng tiền nộp/rút vốn của chủ sở hữu (`CAPITAL_INJECTION`, `OWNER_WITHDRAWAL`). Cần bộ lọc loại trừ tuyệt đối các dòng này khỏi P&L.

---

### 2. So Sánh Các Phương Án Tổng Hợp Số Liệu

| Tiêu Chí Đánh Giá | Phương Án 1: Bảng Snapshot Độc Lập Chốt Cuối Ngày | Phương Án 2: Real-time Dynamic Aggregation ⭐ *(Được chọn)* |
|---|---|---|
| **Độ chính xác** | ⚠️ Độ trễ 1 ngày, không thấy số liệu hôm nay | ✅ Real-time 100%, phản ánh tức thì từng đơn hàng vừa bán |
| **Độ linh hoạt bộ lọc** | ❌ Bị cố định theo từng ngày chốt | ✅ Linh hoạt tùy biến: theo giờ, ca làm việc, ngày, tuần, tháng, quý |
| **Phân tích đa chi nhánh** | ⚠️ Cần job chạy tổng hợp định kỳ cho từng branch | ✅ Truy vấn tức thời theo `BranchId` hoặc hợp nhất (`Consolidated`) |
| **Hiệu năng thực thi** | Nhanh ($< 50\text{ms}$) | Cực nhanh ($< 150\text{ms}$) nhờ Composite Indexes trên `AppDbContext` |

---

### 3. Công Thức & Luồng Tính Toán Chuẩn Mực

```text
1. DOANH THU THUẦN (Net Sales / Net Revenue):
   GrossRevenue       = SUM(Orders.SubTotal)
   Discounts          = SUM(Orders.DiscountAmount)
   SalesReturns       = SUM(Returns.RefundAmount)
   NetRevenue         = GrossRevenue - Discounts - SalesReturns

2. GIÁ VỐN HÀNG BÁN (COGS):
   GrossCOGS          = SUM(OrderItems.Quantity * OrderItems.CostPrice)
   ReturnedCOGS       = SUM(ReturnItems.Quantity * ReturnItems.CostPrice)
   NetCOGS            = GrossCOGS - ReturnedCOGS

3. LỢI NHUẬN GỘP (Gross Profit):
   GrossProfit        = NetRevenue - NetCOGS
   GrossMarginPct     = (GrossProfit / NetRevenue) * 100%

4. CHI PHÍ VẬN HÀNH (Operating Expenses - OPEX):
   OPEX               = SUM(ExpenseVouchers.Amount) WHERE Status IN [Approved, Paid]
   Chi tiết theo Category: Rent, Utilities, Labor, Packaging, Logistics, Others

5. CHI PHÍ NỢ XẤU (Bad Debt Expense):
   BadDebtExpense     = SUM(CustomerDebtEntries.Amount) WHERE EntryType == BadDebtWriteOff

6. LỢI NHUẬN THUẦN / TRƯỚC THUẾ (Net Profit / EBT):
   NetProfit          = GrossProfit - OPEX - BadDebtExpense
   NetMarginPct       = (NetProfit / NetRevenue) * 100%
```

---

### 4. Phân Tích Rủi Ro & Phòng Ngừa
- **Rủi ro 1: Phép chia cho 0 khi `NetRevenue == 0`.**
  - *Giải pháp:* Kiểm tra điều kiện biên, nếu `NetRevenue <= 0` thì `GrossMarginPct = 0%` và `NetMarginPct = 0%`.
- **Rủi ro 2: Lẫn lộn tiền cọc nợ hoặc dòng vốn chủ vào doanh thu.**
  - *Giải pháp:* Chỉ lấy nguồn từ đơn hàng POS đã hoàn thành (`Status == Completed`), không lấy từ bảng `CashbookEntry` để tránh cộng nhầm tiền chủ nộp quỹ.
