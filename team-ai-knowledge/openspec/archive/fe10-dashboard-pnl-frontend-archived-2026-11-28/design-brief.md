# Design Brief: FE-10 Dashboard KPIs & Báo Cáo P&L (UI/UX & Data Contract)

## 1. Luồng Người Dùng (User Flow)
1. **Truy cập**: Người dùng đăng nhập với quyền `StoreOwner` hoặc `StoreManager` -> Chọn menu **Tài chính > Báo cáo Lãi / Lỗ & Dashboard (FE-10)** trên thanh Top Nav (hoặc truy cập `/store-owner/reports/pnl`).
2. **Chọn ngữ cảnh lọc**:
   - Chọn Chi nhánh: Toàn hệ thống (mặc định cho StoreOwner) hoặc chi nhánh cụ thể.
   - Chọn Mốc thời gian: Preset nút bấm (Hôm nay, 7 ngày qua, Tháng này, Tháng trước, Quý này) hoặc Chọn tùy biến ngày bắt đầu - ngày kết thúc.
3. **Quan sát Dashboard KPIs (Khu vực trên)**:
   - 4 Thẻ KPI chính: Doanh thu thuần, Lợi nhuận gộp, Lợi nhuận ròng, Chi phí vận hành (kèm % tăng/giảm so với kỳ đối soát trước).
   - 2 Thẻ phụ: Tổng số đơn hàng & Giá trị trung bình đơn (AOV).
   - Biểu đồ xu hướng (Trend Chart): Quan sát đường Doanh thu, Chi phí, và Lợi nhuận qua các ngày/tháng.
   - Biểu đồ cơ cấu chi phí (Expense Breakdown Donut): Quan sát tỷ trọng các nhóm chi phí (Điện, Nước, Nhân công, Mặt bằng, Hao hụt kho, Dịch vụ khác).
4. **Đối soát Báo Cáo P&L (Khu vực dưới)**:
   - Xem bảng cây phân cấp các khoản mục tài chính chuẩn mực.
   - Click nút mũi tên để mở rộng/thu gọn (Expand/Collapse) từng nhóm chi tiết.
   - Xem tỷ lệ % biên lợi nhuận so với Doanh thu thuần.
5. **Xuất Báo Cáo**:
   - Bấm nút **Xuất Excel**: Tải file `.xlsx` / `.csv` chứa bảng phân tích P&L và chi tiết doanh thu/chi phí.
   - Bấm nút **In / Xuất PDF**: Mở Print Preview khổ A4 chuẩn hóa có tiêu đề cửa hàng, khoảng thời gian báo cáo, người lập biểu, và các bảng số liệu rõ ràng.

## 2. Bố Cục Giao Diện & Component Breakdown
```
src/features/reports-pnl/
├── pages/
│   └── ReportsPnlDashboardPage.tsx       # Trang All-in-one chính
├── components/
│   ├── PnlFilterToolbar.tsx             # Thanh công cụ lọc: Branch selector, Date presets, Custom date range, Nút Xuất
│   ├── PnlKpiCardsSection.tsx           # Hàng 6 thẻ chỉ số tài chính kèm % so sánh
│   ├── PnlChartsSection.tsx             # Grid 2 cột: Biểu đồ Trend đường/cột + Biểu đồ Donut cơ cấu chi phí
│   ├── PnlStatementTable.tsx            # Bảng báo cáo P&L phân cấp cây (Collapsible) chuẩn kế toán
│   ├── PnlExportModal.tsx               # Modal xem trước và cấu hình xuất Excel / In PDF khổ A4
│   └── PnlDrilldownDrawer.tsx           # Drawer trượt từ phải sang xem chi tiết các hóa đơn hoặc chứng từ chi phí
├── types/
│   └── reportsPnl.types.ts              # Định nghĩa Interface dữ liệu (Filter, KpiSummary, PnlItem, ChartData)
├── services/
│   └── reportsPnlService.ts             # Service gọi API hoặc Mock Data chất lượng cao
└── index.ts                             # Export public API của feature
```

## 3. Data Contracts & TypeScript Interfaces
```typescript
export interface PnlFilterParams {
  tenantId?: string;
  branchId?: string | 'ALL';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  presetPeriod?: 'TODAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'CUSTOM';
}

export interface KpiSummaryData {
  grossSales: number;
  discounts: number;
  returns: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number;
  shrinkageLoss: number;
  netProfit: number;
  netMarginPct: number;
  totalOrders: number;
  averageOrderValue: number;
  // So sánh cùng kỳ trước (% tăng trưởng)
  netRevenueGrowthPct: number;
  grossProfitGrowthPct: number;
  netProfitGrowthPct: number;
  ordersGrowthPct: number;
}

export interface PnlLineItem {
  id: string;
  code: string;
  title: string;
  level: number; // 1: Khoản mục chính, 2: Nhóm con, 3: Chi tiết
  amount: number;
  percentageOfNetRevenue: number;
  isHeader?: boolean;
  isTotal?: boolean;
  isNegative?: boolean;
  children?: PnlLineItem[];
}

export interface ExpenseCategoryBreakdown {
  categoryName: string;
  categoryCode: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface PnlTrendPoint {
  dateLabel: string;
  netRevenue: number;
  cogs: number;
  expenses: number;
  netProfit: number;
}
```

## 4. Các Trạng Thái Giao Diện (State Handling)
- **Loading State**: Sử dụng Skeleton cards cho các thẻ KPI và Skeleton table cho bảng P&L, tránh hiện tượng layout shift giật màn hình.
- **Empty State**: Khi một chi nhánh mới mở chưa phát sinh hóa đơn bán lẻ hoặc chi phí, hiển thị thông báo thân thiện: "Chưa có phát sinh giao dịch trong kỳ này" kèm gợi ý chọn mốc thời gian khác.
- **Error State**: Banner cảnh báo màu đỏ/cam nhẹ nhàng với nút "Thử lại (Retry)".
- **Interactive State**: Tooltip hiển thị giá trị tiền tệ đầy đủ khi hover vào các điểm trên biểu đồ Chart.js; toggle ẩn/hiện từng chuỗi số liệu (Revenue, Expenses, Profit).

## 5. Quy Tắc Nghiệp Vụ & Bảng Đối Soát P&L
Bảng báo cáo P&L được bố cục tuần tự theo đúng chuẩn mực kế toán tài chính:
1. **I. DOANH THU BÁN HÀNG & DỊCH VỤ**
   - 1.1 Doanh thu bán lẻ gộp (Gross Sales từ Orders)
   - 1.2 Giảm trừ doanh thu:
     + Chiết khấu & Khuyến mãi đơn hàng
     + Trả hàng & Hoàn tiền (Sales Returns - FE-13)
   - **==> (1) DOANH THU THUẦN = 1.1 - 1.2** (100.0%)
2. **II. GIÁ VỐN HÀNG BÁN (COGS)**
   - 2.1 Giá vốn hàng hóa đã bán (FEFO xuất kho từ OrderItem.CostPrice)
   - **==> (2) LỢI NHUẬN GỘP = (1) - 2.1** (Gross Margin %)
3. **III. CHI PHÍ VẬN HÀNH & HAO HỤT**
   - 3.1 Tổn thất hao hụt kho / Hủy hàng (Goods Disposal - FE-06)
   - 3.2 Chi phí dịch vụ ngoài (Operating Expenses - FE-07):
     + Chi phí mặt bằng / Thuê điểm bán
     + Chi phí điện thoại / Internet / Điện nước
     + Chi phí nhân sự / Nhân công cửa hàng
     + Chi phí sửa chữa / Bảo trì thiết bị
     + Chi phí tiếp thị & Khác
   - **==> (3) TỔNG CHI PHÍ VẬN HÀNH = 3.1 + 3.2**
4. **IV. KẾT QUẢ KINH DOANH**
   - **==> LỢI NHUẬN RÒNG TRƯỚC THUẾ (EBIT / Net Profit) = (2) - (3)** (Net Margin %)
