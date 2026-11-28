# Proposal: Màn hình Tổng quan Tài chính & Báo cáo Kết quả Kinh doanh Lãi / Lỗ (P&L) (`finance-pnl-overview`)

## Vấn đề
Chủ chuỗi tạp hóa cần biết chính xác lãi gộp và lợi nhuận ròng thực tế sau khi trừ giá vốn hàng bán FEFO, chiết khấu khuyến mãi, hàng hủy kiểm kê và chi phí vận hành ở từng chi nhánh.

## Mục tiêu
Hợp nhất bức tranh Sức khỏe dòng tiền các chi nhánh (`BranchCashHealthPanel`) và Báo cáo Kết quả kinh doanh P&L đa kỳ (So sánh kỳ trước, Cơ cấu chi phí, Xu hướng lãi/lỗ).

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/finance`, `/store-owner/reports/pnl`, `/store-owner/pnl`, `/pnl` (`src/features/finance/pages/FinanceOverviewPage.tsx`, `src/features/reports-pnl/pages/ReportsPnlDashboardPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `FinanceHeader`, `FinanceOverviewFilterBar`, `BranchCashHealthPanel`, `FinancePnlOverviewPanel`, `PnlReportSection`.
  - Tích hợp đầy đủ với tầng API Backend (`FinanceOverviewController`, `PnLReportController`) và thực thể nghiệp vụ (`Order`, `OrderDetail`, `ExpenseVoucher`, `CashbookEntry`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/finance`, `/store-owner/reports/pnl`, `/store-owner/pnl`, `/pnl` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/finance`, `/store-owner/reports/pnl`, `/store-owner/pnl`, `/pnl`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-10-01` (FE-10).
