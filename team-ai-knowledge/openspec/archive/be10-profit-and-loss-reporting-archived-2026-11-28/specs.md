# Đặc Tả Kỹ Thuật (Specs): Phân Hệ Báo Cáo P&L (FE-10)
## Capability: profit-and-loss

## ADDED Requirements

### REQ-PNL-01: Tính Toán Doanh Thu Thuần Chuẩn Kế Toán (Net Revenue Calculation)
- Hệ thống tổng hợp doanh số từ tất cả các đơn hàng bán lẻ có `Status == Completed`:
  - `GrossRevenue` = $\sum (\text{SubTotal})$ của các đơn hàng trong kỳ.
  - `Discounts` = $\sum (\text{DiscountAmount})$ chiết khấu thương mại, coupon.
  - `SalesReturns` = $\sum (\text{RefundAmount})$ của các phiếu trả hàng được duyệt trong kỳ.
  - $\text{NetRevenue} = \text{GrossRevenue} - \text{Discounts} - \text{SalesReturns}$.
- Tách biệt tuyệt đối các khoản thu tiền nợ cũ hoặc tiền chủ góp vốn, không được tính vào doanh thu kỳ này.

### REQ-PNL-02: Xác Định Giá Vốn & Lợi Nhuận Gộp (COGS & Gross Profit)
- Giá vốn hàng bán (Cost of Goods Sold - COGS) được tính bằng giá nhập thực tế theo từng lô hàng xuất kho (Batch Inventory):
  - $\text{GrossCOGS} = \sum (\text{QuantitySold} \times \text{CostPrice})$.
  - $\text{ReturnedCOGS} = \sum (\text{QuantityReturned} \times \text{CostPrice})$ (nhập lại kho).
  - $\text{NetCOGS} = \text{GrossCOGS} - \text{ReturnedCOGS}$.
- Lợi nhuận gộp: $\text{GrossProfit} = \text{NetRevenue} - \text{NetCOGS}$.
- Tỷ suất lợi nhuận gộp: $\text{GrossMarginPercentage} = \frac{\text{GrossProfit}}{\text{NetRevenue}} \times 100\%$ (trả về 0% nếu $\text{NetRevenue} \le 0$).

### REQ-PNL-03: Phân Loại & Tích Hợp Chi Phí Vận Hành (Operating Expenses - OPEX)
- Hệ thống tự động truy vấn từ phân hệ Chi Phí Vận Hành (`FE-07` - bảng `ExpenseVoucher`):
  - Điều kiện lọc: `Status IN [Approved, Paid]` và `ExpenseDate` (hoặc `CreatedAt`) nằm trong khoảng thời gian báo cáo.
  - Phân rã chi tiết theo danh mục: Mặt bằng, Điện nước, Tiện ích, Lương/Nhân công, Bao bì, Vận chuyển, Chi phí khác.
  - Tính toán tỷ trọng của từng nhóm chi phí trên tổng doanh thu thuần: $\text{ExpenseRatio} = \frac{\text{CategoryExpense}}{\text{NetRevenue}} \times 100\%$.

### REQ-PNL-04: Tích Hợp Chi Phí Nợ Xấu (Bad Debt Expense Integration)
- Hệ thống tự động truy vấn từ phân hệ Công Nợ Khách Hàng (`FE-08` - bảng `CustomerDebtEntry`):
  - Điều kiện lọc: `EntryType == BadDebtWriteOff` và `OccurredAtUtc` nằm trong khoảng thời gian báo cáo.
  - Tính vào chi phí khác / chi phí tổn thất tài chính của kỳ kinh doanh.

### REQ-PNL-05: Tính Toán Lợi Nhuận Thuần & Biên Lợi Nhuận Ròng (Net Profit & Net Margin)
- Lợi nhuận thuần trước thuế: $\text{NetProfit} = \text{GrossProfit} - \text{TotalOPEX} - \text{BadDebtExpense}$.
- Tỷ suất lợi nhuận ròng: $\text{NetMarginPercentage} = \frac{\text{NetProfit}}{\text{NetRevenue}} \times 100\%$ (trả về 0% nếu $\text{NetRevenue} \le 0$).

### REQ-PNL-06: Đa Chiều Phân Tích & So Sánh Kỳ (Multi-dimensional & Period Comparison)
- Hỗ trợ xem báo cáo theo từng chi nhánh cụ thể (`BranchId`) hoặc hợp nhất toàn chuỗi (`BranchId == null`).
- Cung cấp API so sánh kỳ trước (MoM - Tháng trước hoặc YoY - Cùng kỳ năm ngoái) tính toán % tăng trưởng doanh thu và lợi nhuận.

## MODIFIED Requirements
- Không có (Phân hệ báo cáo tài chính mới, tích hợp dữ liệu từ POS, Inventory, FE-07, FE-08).

## REMOVED Requirements
- Không có.
