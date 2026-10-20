---
verdict: PASS
date: 2026-10-18
tester: @minhduc118a
capability: supplier
project: MT-GRMS
---

# Test Report: master-supplier-management

## Tóm tắt kết quả
- **Verdict**: **PASS** (100% Passed, 0 Failed, 0 Flaky, 0 Pending)
- **Backend Tests**: 17/17 tests passed (15 Unit Tests + 2 Integration Tests)
- **Frontend Tests**: 43/43 tests passed (Vitest)
- **Database Status**: Migration `20261018042814_AddSupplierModule` đã apply thành công trên PostgreSQL container (`mtgrms-postgres`).

---

## 1. Bảng Ma trận Kiểm thử Requirements / Scenarios

| Mã Yêu cầu | Scenario / Test Case | Mô tả kiểm thử | Loại kiểm thử | Kết quả |
|---|---|---|---|---|
| **REQ-01** | `REQ01_CreateSupplier_ValidData_GeneratesCodeAndSucceeds` | Tạo mới NCC với thông tin hợp lệ, tự sinh mã `SUP-{YYYYMMDD}-{XXXX}` và lưu đúng Tenant | Unit Test | **PASS** ✅ |
| **REQ-01** | `REQ01_CreateSupplier_DuplicateCode_ThrowsBusinessException` | Chặn trùng mã `Code` trong cùng một Tenant (BR-S01) | Unit Test | **PASS** ✅ |
| **REQ-02** | `REQ02_UpdateSupplier_ExpandGoodsToBoth_Succeeds` | Mở rộng loại NCC từ `Goods` (1) sang `Both` (3) hợp lệ | Unit Test | **PASS** ✅ |
| **REQ-02** | `REQ02_UpdateSupplier_NarrowBothToGoods_WhenServiceInvoiceExists_ThrowsBusinessException` | Chặn thu hẹp loại NCC từ `Both` về `Goods` khi đã có hóa đơn dịch vụ trong lịch sử (BR-S07) | Unit Test | **PASS** ✅ |
| **REQ-03** | `REQ03_UpdateStatus_ToInactive_WhenDebtIsZero_Succeeds` | Chuyển trạng thái sang `Inactive` khi công nợ AP = 0 | Unit Test | **PASS** ✅ |
| **REQ-03** | `REQ03_UpdateStatus_ToInactive_WhenDebtExists_ThrowsBusinessException` | Chặn chuyển trạng thái `Inactive` hoặc xóa khi còn nợ AP > 0 (BR-S03) | Unit Test | **PASS** ✅ |
| **REQ-03** | `REQ03_DeleteSupplier_WhenDebtExists_ThrowsBusinessException` | Chặn xóa NCC khi còn nợ công nợ AP > 0 (BR-S03) | Unit Test | **PASS** ✅ |
| **REQ-04** | `REQ04_RecordAPTransaction_IncreasesDebtAndUpdatesBalanceAfter` | Ghi nhận biến động công nợ AP tăng, cập nhật chính xác `CurrentDebt` và `BalanceAfter` | Unit Test | **PASS** ✅ |
| **REQ-04** | `REQ04_RecordAPTransaction_DuplicateIdempotencyKey_ReturnsExistingWithoutDoubleCount` | Chống trùng lặp giao dịch tài chính qua `IdempotencyKey` (BR-S08, Idempotent replay) | Unit Test | **PASS** ✅ |
| **REQ-05** | `REQ05_LinkCustomer_DualRole_SucceedsWithoutInterferingDebt` | Liên kết hồ sơ khách hàng đối tác kép (Dual-role BR-S11) và duy trì độc lập công nợ AP/AR | Unit Test | **PASS** ✅ |
| **REQ-06** | `MultiTenantDataIsolation_EFCoreQueryFilters` | Global Query Filter `TenantId` tự động áp dụng trên tất cả truy vấn Supplier, AP Ledger, Delivery Config | Integration / EF Core Filter | **PASS** ✅ |
| **REQ-DEL01** | `REQDEL01_CalculateEarliestDeliveryDate_AfterCutoffOnFriday_SkipsSundayAndSelectsNextMonday` | Đơn tạo sau Cutoff Time (16:30 > 16:00) ngày Thứ 6 dời qua Thứ 7, cộng 24h lead time rơi vào Chủ nhật nghỉ -> tự động dời sang Thứ 2 kế tiếp (BR-S12) | Unit Test | **PASS** ✅ |
| **REQ-DEL02** | `REQDEL02_CalculateEarliestDeliveryDate_WhenHolidayBlackoutDatesExist_SkipsHolidays` | Tự động loại trừ các ngày rơi vào kỳ nghỉ lễ / Blackout Dates khi tính ngày giao hàng khả dụng (BR-S13) | Unit Test | **PASS** ✅ |

---

## 2. Chi tiết Lệnh Test Đã Chạy

### Backend Tests (xUnit)
```powershell
dotnet test MT_GRMS_BACKEND.sln
```
Output:
```text
Passed!  - Failed:     0, Passed:    15, Skipped:     0, Total:    15, Duration: 42 ms - MT_GRMS.UnitTests.dll (net8.0)
Passed!  - Failed:     0, Passed:     2, Skipped:     0, Total:     2, Duration: 621 ms - MT_GRMS.IntegrationTests.dll (net8.0)
```

### Frontend Tests (Vitest)
```powershell
npx vitest run
```
Output:
```text
Test Files  6 passed (6)
     Tests  43 passed (43)
  Duration  2.00s
```

---

## 3. Lỗi Còn Tồn Đọng (Outstanding Issues)
- **Không có**: Tất cả các trường hợp kiểm thử, quy tắc nghiệp vụ (BR-S01, BR-S03, BR-S07, BR-S08, BR-S11, BR-S12, BR-S13) và cô lập dữ liệu đa người thuê (Multi-tenancy) đều hoạt động chính xác và đạt tiêu chuẩn chất lượng.
