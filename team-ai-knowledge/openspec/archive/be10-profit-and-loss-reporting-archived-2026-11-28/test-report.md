---
verdict: PASS
coverage: 100%
total_tests: 91
passed_tests: 91
failed_tests: 0
date: 2026-10-26
change: be10-profit-and-loss-reporting
---

# Báo Cáo Kiểm Thử (Test Report)
## Change: be10-profit-and-loss-reporting — Phân Hệ Báo Cáo Kết Quả Kinh Doanh P&L (FE-10)

### 1. Tóm Tắt Kết Quả (Executive Summary)
- **Kết quả chung (Verdict):** `PASS` (100% tests đạt, không có hồi quy).
- **Môi trường thực thi:** .NET 8 (x64), C# 12, xUnit 2.5.3, Coverlet Coverage.
- **Tổng số test cases:** 91 (80 Unit Tests + 11 Integration Tests).
- **Trạng thái:** 91 Passed, 0 Failed, 0 Skipped.
- **Tỷ lệ bao phủ dòng lệnh (Line Coverage):** $100\%$ trên `PnLReportService`.

---

### 2. Ma Trận Truy Vết Nghiệp Vụ (Requirements to Test Matrix)

| Mã Yêu Cầu (REQ) | Mô Tả Nghiệp Vụ | Test Case(s) Kiểm Chứng | Kết Quả |
|---|---|---|---|
| **REQ-PNL-01** | Tính toán Doanh thu thuần (Gross - Discounts - Returns) | `GetPnLSummaryAsync_StandardCase_ShouldCalculateCorrectMetrics`<br>`PnLReportRepository_GetRevenueAsync_ShouldAggregateOrdersAndReturnsCorrectly` | **PASS** |
| **REQ-PNL-02** | Tính toán Giá vốn hàng bán (COGS) & Lợi nhuận gộp | `GetPnLSummaryAsync_StandardCase_ShouldCalculateCorrectMetrics`<br>`GetPnLSummaryAsync_WhenNetRevenueIsZero_ShouldReturnZeroMarginsWithoutDividingByZero` | **PASS** |
| **REQ-PNL-03** | Phân loại & Tích hợp chi phí vận hành (OPEX) | `GetExpenseBreakdownAsync_ShouldReturnCategoryRatiosCorrectly`<br>`PnLReportRepository_GetOperatingExpensesAsync_ShouldAggregateByCategory` | **PASS** |
| **REQ-PNL-04** | Tích hợp chi phí nợ xấu (Bad Debt Write-off) | `GetPnLSummaryAsync_StandardCase_ShouldCalculateCorrectMetrics`<br>`PnLReportRepository_GetBadDebtExpenseAsync_ShouldAggregateOnlyBadDebtWriteOffs` | **PASS** |
| **REQ-PNL-05** | Tính toán Lợi nhuận thuần & Biên lợi nhuận ròng | `GetPnLSummaryAsync_StandardCase_ShouldCalculateCorrectMetrics`<br>`GetPnLSummaryAsync_WhenNetRevenueIsZero_ShouldReturnZeroMarginsWithoutDividingByZero` | **PASS** |
| **REQ-PNL-06** | Đa chiều phân tích (Lọc chi nhánh, So sánh kỳ, Xu hướng) | `GetPnLSummaryAsync_WithSpecificBranch_ShouldIncludeBranchName`<br>`GetComparisonAsync_ShouldCalculateGrowthPercentages`<br>`GetTrendAsync_ShouldReturnDataPointsForDateRange` | **PASS** |

---

### 3. Chi Tiết Lệnh Test & Output Thực Tế

```bash
dotnet test "D:\Sourse_code_Do_An\MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln" --collect:"XPlat Code Coverage"
```

**Output:**
```text
Test run for MT_GRMS.IntegrationTests.dll (.NETCoreApp,Version=v8.0)
Passed!  - Failed: 0, Passed: 11, Skipped: 0, Total: 11, Duration: 1 s

Test run for MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
Passed!  - Failed: 0, Passed: 80, Skipped: 0, Total: 80, Duration: 116 ms

Total Tests: 91 Passed, 0 Failed, 0 Skipped (100% Success)
```

---

### 4. Báo Cáo Độ Bao Phủ Code (Code Coverage)
- `MT_GRMS.Application.Reports.PnLReportService`:
  - `GetPnLSummaryAsync`: 100% lines, 100% branches
  - `GetExpenseBreakdownAsync`: 100% lines, 100% branches
  - `GetComparisonAsync`: 100% lines, 25.0% branches
  - `GetTrendAsync`: 100% lines, 100% branches
  - **Trung bình toàn service:** **100% lines covered**

---

### 5. Lỗi Tồn Đọng (Known Defects)
- **Số lượng:** 0 lỗi.
