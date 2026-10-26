# Bản Thiết Kế Giao Diện & API Contract (Design Brief)
## Change: be10-profit-and-loss-reporting — Phân Hệ Báo Cáo P&L (FE-10)

### 1. Cấu Trúc Dữ Liệu Báo Cáo P&L (Hierarchical P&L Structure)

```text
[+] 1. TỔNG DOANH THU (Gross Revenue)
    [-] Chiết khấu thương mại (Discounts)
    [-] Hàng bán bị trả lại (Sales Returns)
(=) DOANH THU THUẦN (Net Revenue)
    [-] Giá vốn hàng bán (Cost of Goods Sold - COGS)
(=) LỢI NHUẬN GỘP (Gross Profit) [Biên LN Gộp: Gross Margin %]
    [-] CHI PHÍ VẬN HÀNH (Operating Expenses - OPEX):
        * Chi phí mặt bằng (Rent)
        * Chi phí điện nước & tiện ích (Utilities)
        * Chi phí nhân sự & lương (Labor)
        * Chi phí vật tư & bao bì (Packaging)
        * Chi phí vận chuyển & giao hàng (Logistics)
        * Chi phí khác (Others)
    [-] CHI PHÍ NỢ XẤU (Bad Debt Write-off)
(=) LỢI NHUẬN THUẦN TRƯỚC THUẾ (Net Profit) [Biên LN Ròng: Net Margin %]
```

---

### 2. Thiết Kế API Endpoints (RESTful Contract)

#### Base Route: `/api/finance/reports/pnl`

| Method | Endpoint | Quyền / Vai Trò | Mô Tả Nghiệp Vụ |
|:---|:---|:---|:---|
| `GET` | `/summary` | Manager, Owner | Báo cáo P&L tổng quan theo khoảng thời gian (hỗ trợ lọc BranchId hoặc Toàn chuỗi). |
| `GET` | `/breakdown/expenses` | Manager, Owner | Phân rã chi phí vận hành chi tiết theo danh mục, tỷ trọng % trên doanh thu. |
| `GET` | `/comparison` | Manager, Owner | So sánh P&L kỳ này với kỳ trước (MoM - tháng trước, hoặc YoY - cùng kỳ năm trước). |
| `GET` | `/trend` | Manager, Owner | Dữ liệu xu hướng P&L theo từng mốc thời gian (ngày/tuần/tháng) phục vụ biểu đồ Waterfall/Cột. |

---

### 3. Quy Ước Request Filters & Response Contract

#### Query Parameters:
- `branchId` (`Guid?`): Bỏ trống = Hợp nhất toàn chuỗi (`Consolidated`).
- `fromDate` (`DateTime`): Mốc bắt đầu (mặc định đầu tháng hiện tại).
- `toDate` (`DateTime`): Mốc kết thúc (mặc định thời điểm hiện tại).

#### DTOs Mẫu:
```json
{
  "period": { "fromDate": "2026-10-01T00:00:00Z", "toDate": "2026-10-31T23:59:59Z" },
  "branchId": null,
  "branchName": "Toàn chuỗi (Consolidated)",
  "grossRevenue": 150000000.0,
  "discounts": 3000000.0,
  "salesReturns": 2000000.0,
  "netRevenue": 145000000.0,
  "cogs": 105000000.0,
  "grossProfit": 40000000.0,
  "grossMarginPercentage": 27.59,
  "operatingExpenses": {
    "total": 18500000.0,
    "categories": [
      { "category": "Mặt bằng", "amount": 10000000.0, "percentageOfRevenue": 6.9 },
      { "category": "Điện nước", "amount": 3500000.0, "percentageOfRevenue": 2.41 },
      { "category": "Bao bì", "amount": 2000000.0, "percentageOfRevenue": 1.38 },
      { "category": "Khác", "amount": 3000000.0, "percentageOfRevenue": 2.07 }
    ]
  },
  "badDebtExpense": 500000.0,
  "netProfit": 21000000.0,
  "netMarginPercentage": 14.48
}
```
