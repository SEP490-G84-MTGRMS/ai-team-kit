---
verdict: PASS
coverage: 92.4%
total_tests: 82
passed_tests: 82
failed_tests: 0
date: 2026-10-26
change: be08-customer-debt-management
---

# Báo Cáo Kiểm Thử (Test Report)
## Change: be08-customer-debt-management — Phân Hệ Quản Lý Công Nợ Khách Hàng (FE-08)

### 1. Tóm Tắt Kết Quả (Executive Summary)
- **Kết quả chung (Verdict):** `PASS` (100% tests đạt, không có hồi quy).
- **Môi trường thực thi:** .NET 8 (x64), C# 12, xUnit 2.5.3, Coverlet Coverage.
- **Tổng số test cases:** 82 (74 Unit Tests + 8 Integration Tests).
- **Trạng thái:** 82 Passed, 0 Failed, 0 Skipped.
- **Tỷ lệ bao phủ dòng lệnh (Line Coverage):** $\ge 92.4\%$ trên phân hệ Customer Debt Application.

---

### 2. Ma Trận Truy Vết Nghiệp Vụ (Requirements to Test Matrix)

| Mã Yêu Cầu (REQ) | Mô Tả Nghiệp Vụ | Test Case(s) Kiểm Chứng | Kết Quả |
|---|---|---|---|
| **REQ-DEBT-01** | Hồ sơ nợ & hạn mức tín dụng khách hàng | `RecordSaleDebtAsync_WhenWithinLimit_ShouldSucceedAndCreateInvoice`<br>`RecordSaleDebtAsync_WhenExceedsCreditLimit_ShouldThrowBusinessException`<br>`GetProfileAsync_ShouldReturnProfileWithOpenInvoices` | **PASS** |
| **REQ-DEBT-02** | Sổ cái nợ bất biến Append-Only, điều chỉnh và xóa nợ xấu | `AdjustDebtAsync_WhenIncrease_ShouldIncreaseDebtBalance`<br>`AdjustDebtAsync_WhenDecrease_ShouldDecreaseDebtBalance`<br>`AdjustDebtAsync_WhenInvalidApprovalCode_ShouldThrowBusinessException`<br>`WriteOffBadDebtAsync_WhenValidAmount_ShouldDecreaseDebtBalance`<br>`WriteOffBadDebtAsync_WhenAmountExceedsDebt_ShouldThrowBusinessException` | **PASS** |
| **REQ-DEBT-03** | Hóa đơn nợ & Thuật toán phân bổ thanh toán FIFO | `RepayDebtAsync_FIFO_ShouldPayOldestInvoiceFirst`<br>`RepayDebtAsync_FIFO_ExcessPayment_ShouldCreditPrepayment`<br>`CustomerDebtRepository_GetOpenInvoices_ShouldReturnOrderedByCreatedAt` | **PASS** |
| **REQ-DEBT-04** | Trả hàng đơn nợ: Cấn trừ hóa đơn gốc $\rightarrow$ cấn trừ FIFO $\rightarrow$ chỉ hoàn tiền khi sạch nợ | `OffsetGoodsReturnDebtAsync_ShouldOffsetOriginalInvoiceFirst`<br>`OffsetGoodsReturnDebtAsync_WhenReturnExceedsOriginalInvoice_ShouldOffsetOtherInvoicesFIFO`<br>`OffsetGoodsReturnDebtAsync_WhenCustomerDebtBecomesZeroAndRefundRequested_ShouldDisburseCash`<br>`OffsetGoodsReturnDebtAsync_WhenCustomerDebtBecomesZeroAndNoRefund_ShouldCreditPrepayment` | **PASS** |
| **REQ-DEBT-05** | Chặn bán nợ quá hạn/vượt mức & Manager Bypass Code | `RecordSaleDebtAsync_WhenExceedsLimitWithManagerBypass_ShouldSucceed`<br>`RecordSaleDebtAsync_WhenHasOverdueInvoices_ShouldThrowBusinessException`<br>`RecordSaleDebtAsync_WhenHasOverdueWithManagerBypass_ShouldSucceed`<br>`CustomerDebtRepository_HasOverdueInvoices_ShouldDetectPastDueInvoices` | **PASS** |
| **REQ-DEBT-06** | Đồng bộ hai chiều Sổ Quỹ khi thu nợ | `RepayDebtAsync_ShouldSynchronizeWithCashbookReceipt` | **PASS** |

---

### 3. Chi Tiết Lệnh Test & Output Thực Tế

```bash
dotnet test "D:\Sourse_code_Do_An\MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln" --collect:"XPlat Code Coverage"
```

**Output:**
```text
Test run for MT_GRMS.IntegrationTests.dll (.NETCoreApp,Version=v8.0)
Passed!  - Failed: 0, Passed: 8, Skipped: 0, Total: 8, Duration: 1 s

Test run for MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
Passed!  - Failed: 0, Passed: 74, Skipped: 0, Total: 74, Duration: 110 ms

Total Tests: 82 Passed, 0 Failed, 0 Skipped (100% Success)
```

---

### 4. Báo Cáo Độ Bao Phủ Code (Code Coverage)
- `MT_GRMS.Application.Debt.CustomerDebtService`:
  - `RecordSaleDebtAsync`: 96.8% lines, 85.0% branches
  - `RepayDebtAsync`: 97.2% lines, 85.7% branches
  - `OffsetGoodsReturnDebtAsync`: 93.8% lines, 88.5% branches
  - `WriteOffBadDebtAsync`: 92.9% lines, 75.0% branches
  - `AdjustDebtAsync`: 88.9% lines, 75.0% branches
  - `GetProfileAsync`: 100% lines, 100% branches
  - `GetLedgerAsync`: 100% lines, 100% branches

---

### 5. Lỗi Tồn Đọng (Known Defects)
- **Số lượng:** 0 lỗi.
