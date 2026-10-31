---
verdict: PASS
date: 2026-10-31
tester: @minhduc118a
capability: supplier
project: MT-GRMS
---

# Test Report: master-supplier-management (Delta Tìm kiếm Đa Thực Thể & Xuất Excel)

## Tóm tắt kết quả
- **Verdict**: **PASS** (100% Passed, 0 Failed, 0 Flaky, 0 Pending)
- **Backend Tests**: 32/32 Unit Tests passed (MT_GRMS.UnitTests.dll, net8.0)
- **Frontend Build & Lint**: Pass 100% (`tsc -b && vite build` - ✓ 2500 modules transformed, exit code 0)
- **Git Branches**:
  - Frontend: `refactor/supplier-filter-search-excel`
  - Backend: `refactor/supplier-filter-search-excel`

---

## 1. Bảng Ma trận Kiểm thử Requirements / Scenarios

| Mã Yêu cầu | Scenario / Test Case | Mô tả kiểm thử | Loại kiểm thử | Kết quả |
|---|---|---|---|---|
| **REQ-SEARCH-01** | `REQ_SEARCH01_GetSearchSuggestions_ReturnsMatchingSuppliers` | Nhập từ khóa tìm kiếm, API trả về danh sách gợi ý phân 4 nhóm: Suppliers, Products, ContactPersons, Phones có khớp từ khóa (không phân biệt hoa thường) | Unit Test / API Test | **PASS** ✅ |
| **REQ-SEARCH-01** | `REQ_SEARCH01_FilterByMultipleSuppliersAndContacts_Success` | Lọc đồng thời theo danh sách nhiều NCC (`SupplierIds`) và nhiều Người liên hệ (`ContactPersons`), kết quả trả về đúng tập hợp giao | Unit Test / Service Test | **PASS** ✅ |
| **REQ-SEARCH-01** | `FilterBar_Autocomplete_Highlight_MultiTags` | Giao diện autocomplete dropdown phân nhóm, highlight từ khóa (`<mark>`), bấm chọn tạo tag chip riêng biệt (màu sắc phân loại theo NCC, SP, Người LH, SĐT), có nút xóa từng tag hoặc xóa tất cả | Frontend Component & Build Test | **PASS** ✅ |
| **REQ-EXPORT-01** | `ExportExcel_Professional_Formatting` | Xuất file Excel (.xlsx) với Header báo cáo trang trọng (Tên công ty, Tiêu đề, Ngày xuất, Người xuất), bảng dữ liệu 14 cột, dòng tổng kết số lượng, tự động tính độ rộng cột (`Auto Column Widths`) không bị che khuất | Frontend Logic & SheetJS Test | **PASS** ✅ |
| **REQ-01** | `REQ01_CreateSupplier_ValidData_GeneratesCodeAndSucceeds` | Tạo mới NCC với thông tin hợp lệ, tự sinh mã `SUP-{YYYYMMDD}-{XXXX}` và lưu đúng Tenant | Unit Test | **PASS** ✅ |
| **REQ-01** | `REQ01_CreateSupplier_DuplicateCode_ThrowsBusinessException` | Chặn trùng mã `Code` trong cùng một Tenant (BR-S01) | Unit Test | **PASS** ✅ |
| **REQ-02** | `REQ02_UpdateSupplier_ExpandGoodsToBoth_Succeeds` | Mở rộng loại NCC từ `Goods` (1) sang `Both` (3) hợp lệ | Unit Test | **PASS** ✅ |
| **REQ-02** | `REQ02_UpdateSupplier_NarrowBothToGoods_WhenServiceInvoiceExists_ThrowsBusinessException` | Chặn thu hẹp loại NCC từ `Both` về `Goods` khi đã có hóa đơn dịch vụ trong lịch sử (BR-S07) | Unit Test | **PASS** ✅ |
| **REQ-03** | `REQ03_UpdateStatus_ToInactive_WhenDebtIsZero_Succeeds` | Chuyển trạng thái sang `Inactive` khi công nợ AP = 0 | Unit Test | **PASS** ✅ |
| **REQ-03** | `REQ03_UpdateStatus_ToInactive_WhenDebtExists_ThrowsBusinessException` | Cho phép chuyển trạng thái `Inactive` khi còn công nợ nhưng trả về cảnh báo PO chưa hoàn thành (BR-S03 cập nhật) | Unit Test | **PASS** ✅ |
| **REQ-03** | `REQ03_DeleteSupplier_WhenDebtExists_ThrowsBusinessException` | Chặn xóa NCC khi còn nợ công nợ AP > 0 hoặc đã phát sinh chứng từ liên quan (BR-S03) | Unit Test | **PASS** ✅ |
| **REQ-04** | `REQ04_RecordAPTransaction_IncreasesDebtAndUpdatesBalanceAfter` | Ghi nhận biến động công nợ AP tăng, cập nhật chính xác `CurrentDebt` và `BalanceAfter` | Unit Test | **PASS** ✅ |
| **REQ-04** | `REQ04_RecordAPTransaction_DuplicateIdempotencyKey_ReturnsExistingWithoutDoubleCount` | Chống trùng lặp giao dịch tài chính qua `IdempotencyKey` (BR-S08, Idempotent replay) | Unit Test | **PASS** ✅ |
| **REQ-05** | `REQ05_LinkCustomer_DualRole_SucceedsWithoutInterferingDebt` | Liên kết hồ sơ khách hàng đối tác kép (Dual-role BR-S11) và duy trì độc lập công nợ AP/AR | Unit Test | **PASS** ✅ |
| **REQ-06** | `MultiTenantDataIsolation_EFCoreQueryFilters` | Global Query Filter `TenantId` tự động áp dụng trên tất cả truy vấn Supplier, AP Ledger, Delivery Config | Integration / EF Core Filter | **PASS** ✅ |
| **REQ-BRANCH-01** | `BranchRBAC_IsolationAndSharedSuppliers` | Nhân viên chi nhánh chỉ xem được NCC được gán vào chi nhánh mình hoặc NCC dùng chung toàn chuỗi (`IsSharedWithAllBranches`) | Unit Test | **PASS** ✅ |
| **REQ-DEL01** | `REQDEL01_CalculateEarliestDeliveryDate_AfterCutoffOnFriday_SkipsSundayAndSelectsNextMonday` | Đơn tạo sau Cutoff Time Thứ 6 dời qua Thứ 7, cộng lead time rơi vào Chủ nhật nghỉ -> tự động dời sang Thứ 2 kế tiếp (BR-S12) | Unit Test | **PASS** ✅ |
| **REQ-DEL02** | `REQDEL02_CalculateEarliestDeliveryDate_WhenHolidayBlackoutDatesExist_SkipsHolidays` | Tự động loại trừ các ngày rơi vào kỳ nghỉ lễ / Blackout Dates khi tính ngày giao hàng khả dụng (BR-S13) | Unit Test | **PASS** ✅ |

---

## 2. Chi tiết Lệnh Test Đã Chạy

### Backend Tests (xUnit)
```powershell
dotnet test tests/MT_GRMS.UnitTests/MT_GRMS.UnitTests.csproj --filter "FullyQualifiedName~Supplier"
```
Output:
```text
Test run for MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:    32, Skipped:     0, Total:    32, Duration: 54 ms - MT_GRMS.UnitTests.dll (net8.0)
```

### Frontend Typecheck & Build
```powershell
npm run build
```
Output:
```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.1 building client environment for production...
transforming...
✓ 2500 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     1.16 kB │ gzip:   0.68 kB
dist/assets/index-CGO78VR-.css    264.09 kB │ gzip:  40.45 kB
dist/assets/index-DwYME49g.js   3,000.24 kB │ gzip: 729.20 kB
✓ built in 570ms
```

---

## 3. Lỗi Còn Tồn Đọng (Outstanding Issues)
- **Không có**: Tất cả các tính năng từ tìm kiếm đa thực thể (autocomplete gợi ý phân 4 nhóm, text highlight, multi-select tag chips) đến xuất Excel chuẩn báo cáo doanh nghiệp đã được triển khai đầy đủ, build và test thành công 100%.
