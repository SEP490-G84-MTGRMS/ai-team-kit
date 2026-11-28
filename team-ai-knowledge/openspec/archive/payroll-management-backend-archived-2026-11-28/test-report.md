---
verdict: PASS
tested_at: 2026-11-07
---
# Test Report: payroll-management-backend

## Tổng quan kết quả
- **Verdict:** **PASS**
- **Tổng số Scenarios trong specs:** 9/9 Scenarios được kiểm chứng tự động.
- **Unit Tests:** 486 / 486 passed (100%).
- **Integration Tests:** 44 / 44 passed (100%).
- **Build Status:** 0 Errors, 0 Warnings liên quan đến phân hệ Payroll.

---

## Chi tiết Scenario Specs ↔ Test Case

| REQ | Scenario | Test Case | Kết quả |
|---|---|---|---|
| **REQ-PAY-01** | Tính lương nhân viên Monthly có OT ngày thường & CN, trích 10.5% BHXH | `MT_GRMS.UnitTests.PayslipServiceTests.GenerateMonthlyPayroll_MonthlySalary_CalculatesStandardWorkDaysAndSocialInsurance`<br>`MT_GRMS.UnitTests.PayslipServiceTests.GenerateMonthlyPayroll_ApprovedOvertime_CalculatesWeekdayAndWeekendOt` | ✅ PASS |
| **REQ-PAY-01** | Tính lương nhân viên Part-time theo ca (Shift), không trích BHXH | `MT_GRMS.UnitTests.PayslipServiceTests.GenerateMonthlyPayroll_ShiftSalary_NoInsurance_CalculatesShiftPay` | ✅ PASS |
| **REQ-PAY-01** | Tính lương nhân viên Part-time theo giờ (Hourly), không trích BHXH | `MT_GRMS.UnitTests.PayslipServiceTests.GenerateMonthlyPayroll_HourlySalary_NoInsurance_CalculatesHourlyWages` | ✅ PASS |
| **REQ-PAY-02** | Khấu trừ nợ tạm ứng, chặn âm thực lĩnh (`NetSalary >= 0`), kết chuyển `RemainingDebt` | `MT_GRMS.UnitTests.PayslipServiceTests.GenerateMonthlyPayroll_AdvanceDebtDeduction_EnforcesZeroFloor` | ✅ PASS |
| **REQ-PAY-03** | Khởi tạo lại bảng lương bảo toàn phiếu lương đã `Paid`, không ghi đè | `MT_GRMS.UnitTests.PayslipServiceTests.GenerateMonthlyPayroll_ExistingPaidPayslip_PreservesAndDoesNotOverwrite` | ✅ PASS |
| **REQ-PAY-03** | Chặn xóa phiếu lương đã ở trạng thái `Paid` (ném `BusinessException`) | `MT_GRMS.UnitTests.PayslipServiceTests.DeletePayslip_PaidPayslip_ThrowsBusinessException` | ✅ PASS |
| **REQ-PAY-04** | Chi trả phiếu lương đơn lẻ, chuyển `Status = Paid`, tự động sinh phiếu chi Sổ quỹ `PC-yyyyMM-xxxx` | `MT_GRMS.UnitTests.PayslipServiceTests.PayPayslip_UnpaidPayslip_MarksPaidAndGeneratesCashbookTransaction` | ✅ PASS |
| **REQ-PAY-04** | Chặn thanh toán lại phiếu lương đã `Paid` | `MT_GRMS.UnitTests.PayslipServiceTests.PayPayslip_AlreadyPaid_ThrowsBusinessException` | ✅ PASS |
| **REQ-PAY-04** | Chi trả lương theo lô (`Batch Pay`), cập nhật trạng thái đồng loạt và sinh phiếu chi | `MT_GRMS.UnitTests.PayslipServiceTests.BatchPayPayslips_MultipleUnpaidPayslips_MarksAllPaidAndGeneratesCashbook` | ✅ PASS |

---

## Lệnh đã chạy

1. **Biên dịch toàn bộ giải pháp:**
   ```bash
   dotnet build MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln
   ```
   *Kết quả:* Build succeeded. 0 Error(s).

2. **Chạy Unit Tests:**
   ```bash
   dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\MT_GRMS.UnitTests.csproj
   ```
   *Kết quả:* Passed! - Failed: 0, Passed: 486, Skipped: 0, Total: 486, Duration: 4 s.

3. **Chạy Integration Tests:**
   ```bash
   dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.IntegrationTests\MT_GRMS.IntegrationTests.csproj
   ```
   *Kết quả:* Passed! - Failed: 0, Passed: 44, Skipped: 0, Total: 44, Duration: 4 s.

---

## Đối chiếu Specs ↔ Code

- **Đầy đủ 4 REQs cốt lõi:**
  - `REQ-PAY-01`: Đã kiểm chứng công thức tính lương 3 loại hình, hệ số OT 1.5x ngày thường / 2.0x Chủ nhật, BHXH 10.5% nhân viên tháng.
  - `REQ-PAY-02`: Đã kiểm chứng cấn trừ nợ tạm ứng `DebtAmount` với trần bảo vệ không cho `NetSalary` âm và tính chính xác `RemainingDebt`.
  - `REQ-PAY-03`: Đã kiểm chứng kiểm soát trạng thái phiếu lương, chống ghi đè hoặc xóa phiếu đã thanh toán `Paid`.
  - `REQ-PAY-04`: Đã kiểm chứng quy trình thanh toán gắn mã chứng từ tự sinh `PC-yyyyMM-xxxx` vào thực thể `CashbookTransaction` (Sổ quỹ).
- **Phạm vi tác động:** Chỉ thao tác đúng trên domain HR/Payslips, CashbookTransaction, Schedule, Employee, không làm phát sinh side effects sang các module khác.
- **Code reviews:** Các điểm nghi vấn từ persona skeptic (chặn âm thực lĩnh, chống trùng lặp, bảo toàn số liệu đã chốt) đều đã được cài đặt và pass 100% qua test tự động.

---

## Lỗi còn tồn đọng
- Không có lỗi tồn đọng (0 bug / 0 failing test). Phân hệ sẵn sàng đưa vào vận hành và lưu trữ (Archive).
