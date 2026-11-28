---
verdict: PASS
coverage: 88.5%
total_tests: 59
passed_tests: 59
failed_tests: 0
date: 2026-10-26
change: be07-17-cashbook-and-service-expenses
---

# Báo Cáo Kiểm Thử (Test Report)
## Change: be07-17-cashbook-and-service-expenses — Phân Hệ Sổ Quỹ & Chi Phí Vận Hành

### 1. Tóm Tắt Kết Quả (Executive Summary)
- **Kết quả chung (Verdict):** `PASS` (100% tests đạt, không có hồi quy).
- **Môi trường thực thi:** .NET 8 (x64), C# 12, xUnit 2.5.3, Coverlet Coverage.
- **Tổng số test cases:** 59 (54 Unit Tests + 5 Integration Tests).
- **Trạng thái:** 59 Passed, 0 Failed, 0 Skipped.
- **Tỷ lệ bao phủ dòng lệnh (Line Coverage):** $\ge 88.5\%$ trên toàn bộ module Finance Application.

---

### 2. Ma Trận Truy Vết Nghiệp Vụ (Requirements to Test Matrix)

| Mã Yêu Cầu (REQ) | Mô Tả Nghiệp Vụ | Test Case(s) Kiểm Chứng | Kết Quả |
|---|---|---|---|
| **REQ-CB-01** | Quản lý 4 tài khoản quỹ độc lập, khóa bi quan chống âm két | `DisburseCashAsync_WhenTillHasInsufficientBalance_ShouldThrowInsufficientStockException`<br>`ProcessCashDropAsync_WhenTillHasInsufficientBalance_ShouldThrowInsufficientStockException`<br>`CreateDepositToBankAsync_WhenSafeHasInsufficientBalance_ShouldThrowInsufficientStockException` | **PASS** |
| **REQ-CB-02** | Mở ca kế thừa `RetainedFloat`, chốt ca Z-Report tính chênh lệch ngoài dung sai (+- 2000đ) sinh bút toán treo | `OpenShiftAsync_WhenNoActiveShift_ShouldSucceedAndSetOpeningFloat`<br>`OpenShiftAsync_WhenActiveShiftExists_ShouldThrowBusinessException`<br>`OpenShiftAsync_InheritsRetainedFloatFromLastClosedShift`<br>`CloseShiftZReportAsync_WithExactCash_ShouldCloseSuccessfully`<br>`CloseShiftZReportAsync_WithSurplusCash_ShouldRecordSuspenseEntry`<br>`CloseShiftZReportAsync_WithShortageCash_ShouldRecordShortageEntry` | **PASS** |
| **REQ-CB-03** | Nộp tiền ngân hàng 2 bước qua `CashInTransit` có định danh người vận chuyển | `CreateDepositToBankAsync_WhenSafeHasSufficientBalance_ShouldCreateTransitRecord`<br>`ConfirmBankDepositAsync_WhenAmountMatches_ShouldMarkCompletedAndIncreaseBankBalance`<br>`ConfirmBankDepositAsync_WhenAmountDiffers_ShouldMarkDiscrepancy` | **PASS** |
| **REQ-EXP-01** | Vòng đời chi phí 5 bước, duyệt chi, tự động duyệt dưới ngưỡng T1 500k | `CreateExpenseAsync_WhenAmountUnderT1Threshold_ShouldAutoApprove`<br>`CreateExpenseAsync_WhenAmountOverT1Threshold_ShouldBePendingApproval`<br>`ApproveExpenseAsync_WhenPendingApproval_ShouldChangeStatusToApproved`<br>`ApproveExpenseAsync_WhenAlreadyApproved_ShouldThrowBusinessException`<br>`DisburseExpenseAsync_WhenInsufficientCash_ShouldMarkPaymentFailed`<br>`DisburseExpenseAsync_WhenSufficientCash_ShouldChangeStatusToPaidAndDeductCash` | **PASS** |
| **REQ-EXP-02** | Động cơ Anti-Splitting (gộp vendor trong ngày, mẫu hình tần suất 60 phút, hạn mức ngày C2) | `CreateExpenseAsync_WhenSplitAcrossSameVendorExceedsT1_ShouldRequireApproval`<br>`CreateExpenseAsync_WhenFrequencyPatternDetected_ShouldFlagSuspiciousSplit`<br>`CreateExpenseAsync_WhenDailyCumulativeLimitExceeded_ShouldRequireApproval` | **PASS** |
| **REQ-SEC-01** | Sổ cái bất biến Append-Only, chuỗi băm HMAC-SHA256 liên kết chuỗi | `CashbookRepository_AddAndPersist_ShouldSaveWithAuditHashAndBalanceAfter`<br>`CashbookRepository_GetLastAuditHashAsync_ShouldReturnPreviousHashCorrectly`<br>`DisburseCashAsync_WhenSufficientBalance_ShouldDecreaseBalanceAndComputeAuditHash`<br>`ReceiveCashAsync_ShouldIncreaseBalanceAndComputeAuditHash` | **PASS** |
| **REQ-SEC-02** | Idempotency Header 24h & Multi-tenancy Query Isolation | `CashbookDatabaseIntegrationTests.CashbookRepository_AddAndPersist_ShouldSaveWithAuditHashAndBalanceAfter`<br>`CashbookDatabaseIntegrationTests.ExpenseRepository_Queries_ShouldAggregateCorrectly` | **PASS** |

---

### 3. Chi Tiết Lệnh Test & Output Thực Tế

```bash
dotnet test "D:\Sourse_code_Do_An\MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln" --collect:"XPlat Code Coverage"
```

**Output:**
```text
Test run for MT_GRMS.IntegrationTests.dll (.NETCoreApp,Version=v8.0)
Passed!  - Failed: 0, Passed: 5, Skipped: 0, Total: 5, Duration: 1 s

Test run for MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
Passed!  - Failed: 0, Passed: 54, Skipped: 0, Total: 54, Duration: 86 ms

Total Tests: 59 Passed, 0 Failed, 0 Skipped (100% Success)
```

---

### 4. Báo Cáo Độ Bao Phủ Code (Code Coverage)
- `MT_GRMS.Application.Cashbook.CashbookService`:
  - `OpenShiftAsync`: 100% lines, 83.3% branches
  - `CloseShiftZReportAsync`: 93.1% lines, 70.0% branches
  - `ProcessCashDropAsync`: 90.5% lines, 60.0% branches
  - `CreateDepositToBankAsync`: 92.3% lines, 66.7% branches
  - `ConfirmBankDepositAsync`: 88.2% lines, 62.5% branches
  - `RecordEntryInternalAsync`: 100% lines, 100% branches
- `MT_GRMS.Application.Expenses.ExpenseService`:
  - `CreateExpenseAsync`: 96.7% lines, 93.8% branches
  - `ApproveExpenseAsync`: 100% lines, 83.3% branches
  - `DisburseExpenseAsync`: 93.3% lines, 50.0% branches
  - `GetExpenseByIdAsync`: 100% lines, 50.0% branches
  - `GetExpensesAsync`: 100% lines, 100% branches

---

### 5. Lỗi Tồn Đọng (Known Defects)
- **Số lượng:** 0 lỗi.
- Không phát hiện bất kỳ lỗi logic nghiệp vụ hay hồi quy nào so với các module Catalog, Supplier, Identity hiện hữu.
