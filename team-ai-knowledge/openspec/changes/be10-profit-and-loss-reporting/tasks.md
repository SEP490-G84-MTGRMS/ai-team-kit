# Danh Sách Công Việc Triển Khai (Implementation Tasks)
## Change: be10-profit-and-loss-reporting — Phân Hệ Báo Cáo P&L (FE-10)

### Phase 1: Core Models & DTO Contracts
- [x] T1 — Định nghĩa các DTOs phân cấp báo cáo P&L (`PnLReportDtos.cs`): `PnLSummaryResponse`, `CategoryExpenseBreakdown`, `OperatingExpenseSummary`, `PnLComparisonResponse`, `PnLTrendPointResponse` (REQ-PNL-01, REQ-PNL-02, REQ-PNL-03)
- [x] T2 — Định nghĩa Request Filter DTOs (`PnLFilterRequest.cs`): khoảng thời gian `FromDate`, `ToDate`, chi nhánh `BranchId` tùy chọn (REQ-PNL-06)
- [x] T3 — Xây dựng Interface `IPnLReportRepository.cs` trừu tượng hóa các câu truy vấn tổng hợp từ POS, Inventory, OPEX và Nợ xấu (REQ-PNL-01 - REQ-PNL-05)
- [x] T4 — Xây dựng Interface `IPnLReportService.cs` cung cấp các phương thức tính toán P&L summary, breakdown, comparison và trend (REQ-PNL-01 - REQ-PNL-06)

### Phase 2: Application Report Service & Aggregation Engine
- [x] T5 — Triển khai `PnLReportRepository.cs` trong Infrastructure: LINQ Queries tính GrossRevenue, Discounts, Returns, COGS, OPEX categories, BadDebt (REQ-PNL-01 - REQ-PNL-04)
- [x] T6 — Triển khai `PnLReportService.GetPnLSummaryAsync`: Thuật toán tính toán NetRevenue, NetCOGS, GrossProfit, GrossMargin%, NetProfit, NetMargin% (REQ-PNL-01, REQ-PNL-02, REQ-PNL-05)
- [x] T7 — Triển khai `PnLReportService.GetExpenseBreakdownAsync`: Phân rã chi tiết cơ cấu chi phí vận hành theo danh mục và tỷ trọng % doanh thu (REQ-PNL-03)
- [x] T8 — Triển khai `PnLReportService.GetComparisonAsync` & `GetTrendAsync`: So sánh kỳ trước (MoM/YoY) và chuỗi dữ liệu xu hướng theo thời gian (REQ-PNL-06)

### Phase 3: API Controller & Dependency Injection
- [x] T9 — Xây dựng `PnLReportController.cs` exposing các RESTful endpoints: `/summary`, `/breakdown/expenses`, `/comparison`, `/trend` (REQ-PNL-01 - REQ-PNL-06)
- [x] T10 — Tích hợp phân quyền truy cập: Chỉ Quản lý chi nhánh (`StoreManager`) và Chủ cửa hàng (`Owner`) được truy cập báo cáo tài chính (REQ-PNL-06)
- [x] T11 — Đăng ký DI trong `MT_GRMS.Application/DependencyInjection.cs` và `MT_GRMS.Infrastructure/DependencyInjection.cs`
- [x] T12 — Kiểm tra bảo vệ Multi-tenancy Isolation qua Global Query Filter

### Phase 4: Unit Testing & Verification
- [x] T13 — Viết 12 Unit Tests `PnLReportServiceTests.cs` kiểm chứng tính toán chính xác toán học: Revenue, COGS, Gross Profit, OPEX, Bad Debt, Net Profit, Margins % (REQ-PNL-01, REQ-PNL-02, REQ-PNL-05)
- [x] T14 — Viết Unit Tests kiểm tra các trường hợp biên: Doanh thu = 0 không lỗi chia cho 0, lọc chi nhánh, so sánh tăng trưởng âm/dương (REQ-PNL-02, REQ-PNL-06)
- [x] T15 — Viết Integration Tests `PnLReportDatabaseIntegrationTests.cs` kiểm chứng truy vấn trên cơ sở dữ liệu thật với EF Core InMemory (REQ-PNL-01 - REQ-PNL-06)
- [x] T16 — Chạy toàn bộ test suite, kiểm tra Code Coverage $\ge 85\%$ và xác nhận build 0 Warning, 0 Error
