# Tasks: Màn hình Tổng quan Tài chính & Báo cáo Kết quả Kinh doanh Lãi / Lỗ (P&L) (`finance-pnl-overview`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Order`, `OrderDetail`, `ExpenseVoucher`, `CashbookEntry` đảm bảo lọc `TenantId` (`REQ-FINA-PNL-OVER-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `finance-pnl-overview` (`REQ-FINA-PNL-OVER-02`, `REQ-FINA-PNL-OVER-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `FinanceOverviewController.cs`, `PnLReportController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-FINA-PNL-OVER-01`, `REQ-FINA-PNL-OVER-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/finance/pages/FinanceOverviewPage.tsx`, `src/features/reports-pnl/pages/ReportsPnlDashboardPage.tsx` tại route `/store-owner/finance` và kết nối API thời gian thực (`REQ-FINA-PNL-OVER-01` → `REQ-FINA-PNL-OVER-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-10-01` (`REQ-FINA-PNL-OVER-01` → `REQ-FINA-PNL-OVER-04`).
