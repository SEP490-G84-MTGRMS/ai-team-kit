---
verdict: PASS
date: 2026-11-06
change: pos-lookup-branch-scoping-and-loyalty-rules
author: sonnguyenn10
---

# Báo Cáo Kiểm Thử (Test Report): Phân Quyền Tra Cứu Chi Nhánh & Hoàn Thiện Tích - Tiêu Điểm FE-16

## 1. Kết Quả Kiểm Thử Theo Yêu Cầu (Requirements / Scenarios)

| Yêu cầu (REQ/Scenario) | Mô tả & Tiêu chí kiểm thử | Test Case / Phương thức | Kết quả |
|---|---|---|---|
| **REQ-LOOKUP-DEL-01** | Xóa nút "Tra cứu Lô FEFO" trên thanh công cụ PosHeader; thêm `stopPropagation` trên dropdown chi nhánh | UI Inspection & `npm run build` | **PASS** |
| **REQ-LOOKUP-SCOPE-02** | Phân quyền chi nhánh tại `InventoryLookupPage.tsx`: `STORE_OWNER` chọn được 3 chi nhánh An Nhiên Mart; `EMPLOYEE` bị khóa cố định theo chi nhánh trực thuộc | State & Role UI Scoping, `npm run build` | **PASS** |
| **REQ-FE16-LOYALTY-03** | Khách hàng tiêu điểm thưởng tích lũy (`PointsRedeemed`) khi thanh toán đơn hàng POS: trừ điểm cũ và tích điểm mới từ số tiền thực trả | Backend Unit Test: `REQ_FE16_RedeemRewardPoints_DeductsPointsAndEarnsNewPoints` | **PASS** |
| **REQ-FE16-PROMO-FULL** | Rà soát phân hệ khuyến mãi voucher (FE-16.1, FE-16.2, FE-16.3): giảm giá %, Mua X tặng Y, voucher mã code, tích điểm 10k/điểm | Backend Unit Tests: `PromotionEvaluationTests`, `PromotionManagementTests`, `VoucherManagementTests` | **PASS** |

## 2. Chi Tiết Các Lệnh Kiểm Thử Đã Chạy

### A. Backend Unit Tests (.NET 8)
- **Lệnh thực thi**: `dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\MT_GRMS.UnitTests.csproj --no-build`
- **Tóm tắt output**:
  ```text
  Test run for MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
  Starting test execution, please wait...
  A total of 1 test files matched the specified pattern.
  Passed! - Failed: 0, Passed: 353, Skipped: 0, Total: 353, Duration: 824 ms
  ```
- **Kiểm thử trực tiếp case tiêu điểm FE-16**:
  ```text
  dotnet test ... --filter "FullyQualifiedName~REQ_FE16_RedeemRewardPoints_DeductsPointsAndEarnsNewPoints"
  Passed! - Failed: 0, Passed: 1, Skipped: 0, Total: 1, Duration: 77 ms
  ```

### B. Frontend TypeScript & Production Build (Vite)
- **Lệnh thực thi**: `npm --prefix MT_GRMS_FRONTEND run build`
- **Tóm tắt output**:
  ```text
  > tsc -b && vite build
  ✓ 2536 modules transformed.
  dist/index.html                     1.16 kB │ gzip:   0.68 kB
  dist/assets/index-BuR6YjRj.css    305.57 kB │ gzip:  47.72 kB
  dist/assets/index-Bt8pjKKW.js   3,362.72 kB │ gzip: 820.46 kB
  ✓ built in 853ms
  ```

### C. Frontend Unit Tests (Vitest)
- **Lệnh thực thi**: `npm --prefix MT_GRMS_FRONTEND test -- src/features/pos`
- **Tóm tắt output**:
  ```text
  ✓ src/features/pos/__tests__/posOrderApi.test.ts (3 tests)
  Test Files  1 passed (1)
  Tests  3 passed (3)
  ```

## 3. Lỗi Còn Tồn Đọng
- **Không có lỗi tồn đọng** (0 bug, 0 compile/lint errors, 100% tests PASS).
