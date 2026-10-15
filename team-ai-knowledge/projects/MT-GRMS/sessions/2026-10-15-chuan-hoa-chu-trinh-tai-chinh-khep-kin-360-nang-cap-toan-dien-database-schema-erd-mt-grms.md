---
id: SES-2026-10-15-981
date: '2026-10-15'
author: Des7240
project: MT-GRMS
goals:
  - >-
    Phân tích ma trận liên thông tài chính & vận hành FE-07, FE-08, FE-10,
    FE-17, FE-19 dưới lăng kính kép CFO & FMCG.
  - >-
    Triển khai hoàn thiện 3 giai đoạn liên thông Dòng tiền tự động, Báo cáo P&L
    có Thuế HKD 1.5%, Chuyển quỹ nội bộ đối ứng kép và Chi phí lặp lại định kỳ.
  - >-
    Kiểm thử E2E giao diện bằng Chrome DevTools MCP và build thành công dự án
    Frontend.
  - >-
    Giải trình nguồn gốc và nguyên nhân thiếu sót của Database Design ban đầu;
    chuẩn hóa và đồng bộ 100% CSDL vào Team Knowledge Base.
  - >-
    Hoàn thiện vòng tròn tài chính 360 độ: Móc nối đơn hàng bán lẻ POS (Orders)
    và Chi trả Lương nhân viên (FE-18 Payroll) vào Sổ quỹ và P&L.
status: completed
files_changed:
  - projects/MT-GRMS/design/database-schema.md
  - projects/MT-GRMS/design/erd-diagram.md
  - projects/MT-GRMS/design/financial-system-ui-db-design.md
  - projects/MT-GRMS/context/financial-operational-integration-matrix.md
  - src/features/cashbook/pages/CashbookManagementPage.tsx
  - src/features/customer-crm/components/CustomerDebtLedgerDrawer.tsx
  - src/features/customer-crm/components/DebtCollectionModal.tsx
  - src/features/operating-costs/pages/OperatingCostsPage.tsx
  - src/features/operating-costs/components/ExpensePaymentModal.tsx
  - src/features/tax-accounting/pages/TaxDeclarationPage.tsx
  - src/features/tax-accounting/components/TaxPaymentModal.tsx
  - src/features/financial-reporting/pages/FinancialDashboardPage.tsx
tags:
  - session
  - summary
---

# Session Summary: Chuẩn hóa chu trình tài chính khép kín 360°, nâng cấp toàn diện Database Schema & ERD (MT-GRMS)

### 1. Bối cảnh & Mục tiêu
- Nhận diện 8 điểm gãy luồng tài chính (GAP-01 đến GAP-08) giữa các phân hệ FE-07 (Chi phí), FE-08 (Thu nợ CRM), FE-10 (Báo cáo P&L), FE-17 (Sổ quỹ), FE-19 (Kê khai thuế HKD).
- Xây dựng ma trận liên thông chu trình tài chính khép kín CTX-MT-GRMS-004 và tài liệu thiết kế chi tiết DES-MT-GRMS-004.

### 2. Triển Khai Frontend & Kiểm Chứng E2E (100% PASS)
- **Giai đoạn 1 (Critical)**:
  - FE-07: Bổ sung ExpensePaymentModal chọn tài khoản nguồn (PaidFromAccountId), tự động sinh Phiếu Chi Sổ quỹ.
  - FE-08: Nâng cấp DebtCollectionModal chọn tài khoản quỹ thụ hưởng (TargetAccountId), tự động sinh Phiếu Thu Sổ quỹ.
  - FE-19: Bổ sung TaxPaymentModal trích tiền nộp NSNN, tự động sinh Phiếu Chi trong Sổ quỹ.
  - FE-17: Hiển thị badge nhận diện tự động (POS, CRM_DEBT, SERVICE_OPEX, TAX_SNAPSHOT) và khóa nút sửa/xóa bảo vệ toàn vẹn dữ liệu.
- **Giai đoạn 2 (High)**:
  - FE-10: Thêm dòng Thuế Hộ kinh doanh 1.5% TT 40 (1% GTGT + 0.5% TNCN) và thẻ Lợi nhuận ròng sau thuế thực nhận của chủ tiệm vào P&L.
  - FE-08: Thêm Drawer Lịch sử biến động công nợ (CustomerDebtLedgerDrawer) hiển thị chi tiết 2 chiều phát sinh tăng/giảm nợ và mã phiếu thu liên kết.
- **Giai đoạn 3 (Medium)**:
  - FE-17: Thêm tính năng Chuyển tiền nội bộ giữa các quỹ (Két ⇄ Ngân hàng) với mã đối ứng kép (LinkedTransactionId).
  - FE-07: Thêm tính năng Chi phí lặp lại định kỳ hàng tháng (IsRecurring, RecurringDayOfMonth) cho tiền thuê nhà, internet, vệ sinh.
- **Kiểm thử E2E & Build**: Kiểm thử giao diện thành công bằng Chrome DevTools MCP; chạy `npm run build` (`tsc -b && vite build`) PASS với exit code 0 (2248 modules transformed).

### 3. Chuẩn Hóa Database Schema & ERD Diagram Vào Team Knowledge Base
- **Làm rõ nguồn gốc**: Bản cũ sinh ra từ sơ đồ tĩnh Draw.io XML sơ khởi ngày 12/10/2026, chỉ là Conceptual Data Model nên thiếu các ràng buộc liên thông dòng tiền.
- **Đồng bộ hóa 100% vào database-schema.md & erd-diagram.md**:
  - Bổ sung bảng mới `CustomerDebtLedgers` (Nhật ký công nợ 2 chiều).
  - Nâng cấp bảng `LedgerTransactions`: Bổ sung `SourceModuleName`, `LinkedTransactionId`, khóa tự động `IsAutomated`.
  - Nâng cấp bảng `ServiceExpenses`: Bổ sung `PaidFromAccountId`, `IsRecurring`, `RecurringDayOfMonth`.
  - Nâng cấp bảng `TaxSnapshots`: Bổ sung `PaidFromAccountId`, `CashTransactionId`.
  - Nâng cấp bảng `DailySalesSummaries`: Bổ sung `OperatingProfitEbt`, `TaxEstimatedAmount`, `VatEstimatedAmount`, `PitEstimatedAmount`, `NetProfitAfterTax`.

### 4. Hoàn Thiện Vòng Tròn Tài Chính Khép Kín 360° (POS & Payroll)
- **Móc nối Đơn hàng POS (Orders)**:
  - Khi khách thanh toán đủ (không nợ) bằng tiền mặt/VietQR: Bổ sung `CashAccountId`, `CashTransactionId`, `PaidAmount`, `DebtAmount`. Tiền chạy vào Sổ quỹ, sinh Phiếu Thu bán lẻ tự động và kết xuất doanh thu sang P&L và Thuế TT 40.
- **Bổ sung Phân hệ Chi trả Lương nhân viên (FE-18 Payroll)**:
  - Thêm 2 bảng thực thể: `PayrollPeriods` (Kỳ lương chi nhánh) và `Payslips` (Phiếu lương từng nhân viên, cấu phần lương, tài khoản trích tiền, liên kết Phiếu Chi Sổ quỹ).
  - Bổ sung chỉ số `PayrollExpenses` vào Báo cáo P&L `DailySalesSummaries` để loại bỏ rủi ro lãi ảo.
  - Cập nhật sơ đồ Mermaid ERD và Data Dictionary trong toàn bộ Team Knowledge Base.
