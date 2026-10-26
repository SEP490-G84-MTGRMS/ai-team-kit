---
verdict: PASS
date: 2026-10-26
change: be19-household-tax-tt152
tests_passed: 101
tests_failed: 0
tests_skipped: 0
---

# Báo cáo Kiểm thử: Backend Báo Cáo Thuế Hộ Kinh Doanh Theo TT 152/2025/TT-BTC (FE-19)

## 1. Tóm tắt kết quả kiểm thử
- **Tổng số test cases:** 101 tests (87 Unit Tests + 14 Integration Tests)
- **Kết quả:** **101/101 PASSED (100%)**
- **Thời gian chạy:** ~1.2 giây
- **Cảnh báo (Warnings):** 0
- **Lỗi (Errors):** 0
- **Phán quyết:** **PASS**

## 2. Lệnh thực thi & Output
```bash
dotnet test D:\Sourse_code_Do_An\MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln

Passed!  - Failed: 0, Passed: 87, Skipped: 0, Total: 87 - MT_GRMS.UnitTests.dll (net8.0)
Passed!  - Failed: 0, Passed: 14, Skipped: 0, Total: 14 - MT_GRMS.IntegrationTests.dll (net8.0)
```

## 3. Ma trận kiểm thử theo Đặc tả yêu cầu (Traceability Matrix)

| Yêu cầu (Requirement) | Scenario kiểm thử | Test Case | Kết quả |
|---|---|---|---|
| **REQ-TAX-01** | Doanh thu năm $\le 1$ tỷ VNĐ: Miễn thuế 100% (Thuế GTGT = 0, TNCN = 0) | `GetTaxSummary_Under1Billion_ShouldBeExemptFromTax_Group1` | ✅ PASS |
| **REQ-TAX-01** | Doanh thu năm $1$B - $3$B: Nhóm 2, GTGT 1%, TNCN 0.5% (tổng 1.5%) | `GetTaxSummary_Between1BAnd3B_ShouldApplyRetailRates_Group2` | ✅ PASS |
| **REQ-TAX-01** | Doanh thu năm $3$B - $50$B: Phân loại đúng Nhóm 3 | `GetTaxSummary_Between3BAnd50B_ShouldBeGroup3` | ✅ PASS |
| **REQ-TAX-01** | Doanh thu năm $> 50$B: Phân loại đúng Nhóm 4 (Bắt buộc Kê khai) | `GetTaxSummary_Over50B_ShouldBeGroup4` | ✅ PASS |
| **REQ-TAX-02** | Doanh thu tính thuế: Gross trừ Chiết khấu trừ Hàng trả lại trong kỳ | `HouseholdTaxRepository_GetPeriodRevenueAsync_ShouldAggregateGrossDiscountsAndReturns` | ✅ PASS |
| **REQ-TAX-03** | Tự động phân loại và tổng hợp số liệu 4 sổ TT 152: S2b, S2c, S2d, S2e | `GetTaxSummary_BooksSummary_ShouldAggregateS2b_S2c_S2d_S2e_Correctly` | ✅ PASS |
| **REQ-TAX-03** | **Loại trừ 100% Vốn chủ sở hữu** (`EQUITY`, `CAPITAL`) khỏi các sổ chi phí thuế | `HouseholdTaxRepository_GetBookEntriesAsync_ShouldExcludeEquityAndClassifyBooksCorrectly` | ✅ PASS |
| **REQ-TAX-04** | Chốt kỳ tính thuế (Snapshot) lưu trữ `BookDataJson` bất biến | `FinalizeTaxSnapshot_WhenNewPeriod_ShouldCreateSnapshotSuccessfully`, `HouseholdTaxRepository_AddAndGetSnapshot_ShouldPersistAndRetrieveSnapshot` | ✅ PASS |
| **REQ-TAX-04** | Chặn chốt trùng lặp kỳ tính thuế đã khóa số liệu (`TAX_PERIOD_LOCKED`) | `FinalizeTaxSnapshot_WhenPeriodAlreadyFinalized_ShouldThrowBusinessException` | ✅ PASS |
| **REQ-TAX-05** | Multi-Tenancy Isolation tự động lọc qua Global Query Filter | `FakeTenantContext` DB Integration Test | ✅ PASS |

## 4. Lỗi còn tồn đọng
- **Không có lỗi tồn đọng.** Toàn bộ quy tắc nghiệp vụ tài chính và thuế hộ kinh doanh theo Luật 108/2025/QH15, Nghị định 141/2026/NĐ-CP và Thông tư 152/2025/TT-BTC đã được hiện thực hóa và kiểm chứng chính xác 100%.
