# Design Brief: Màn hình Tổng quan Tài chính & Báo cáo Kết quả Kinh doanh Lãi / Lỗ (P&L) (`finance-pnl-overview`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/finance`, `/store-owner/reports/pnl`, `/store-owner/pnl`, `/pnl`
- **Entry Page**: `src/features/finance/pages/FinanceOverviewPage.tsx`, `src/features/reports-pnl/pages/ReportsPnlDashboardPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `FinanceHeader`
  - `FinanceOverviewFilterBar`
  - `BranchCashHealthPanel`
  - `FinancePnlOverviewPanel`
  - `PnlReportSection`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/finance/overview` | `FinanceOverviewController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/finance/reports/pnl/summary` | `PnLReportController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/finance/reports/pnl/breakdown/expenses` | `PnLReportController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/finance/reports/pnl/comparison` | `PnLReportController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/finance/reports/pnl/trend` | `PnLReportController.Execute` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Order`, `OrderDetail`, `ExpenseVoucher`, `CashbookEntry`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
