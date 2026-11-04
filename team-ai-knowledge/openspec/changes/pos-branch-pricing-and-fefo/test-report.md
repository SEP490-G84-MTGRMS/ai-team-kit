---
change: pos-branch-pricing-and-fefo
verdict: PASS
date: 2026-11-04
tester: @sonnguyenn10
---

# Test Report: pos-branch-pricing-and-fefo

## 1. Tổng quan kiểm thử
Báo cáo kiểm thử toàn diện cho chức năng phân giải giá bán chi nhánh (`BranchProduct`), giá bán theo đơn vị tính quy đổi (`BranchProductUnitPrice`), và khấu trừ tồn kho thực tế (`BranchStocks`) theo nguyên tắc FEFO trên hệ thống MT-GRMS. Kiểm thử bao gồm backend unit tests (`xUnit`), frontend build verification (`Vite + TypeScript`), tích hợp giao diện POS giỏ hàng và dữ liệu thực tế tại CSDL PostgreSQL.

---

## 2. Bảng đối chiếu Yêu cầu (Requirements / Scenarios) và Kết quả

| REQ / Scenario | Mô tả kịch bản kiểm thử | Test Case / Phương pháp | Kết quả |
|---|---|---|:---:|
| **REQ-POS-09** | Bán sản phẩm có giá override tại chi nhánh (`SellingPriceOverride = 13.500 đ`) | `REQ_POS_09_CreateOrder_BranchProduct_PriceOverride_AppliesBranchPrice` | **PASS** |
| **REQ-POS-09** | Bán sản phẩm không có giá override tại chi nhánh (`SellingPriceOverride = NULL`, kế thừa giá Master `16.000 đ`) | `REQ_POS_09_CreateOrder_BranchProduct_NoOverride_FallsBackToMasterPrice` | **PASS** |
| **REQ-POS-10** | Bán sản phẩm theo đơn vị Thùng có giá override riêng tại chi nhánh (`320.000 đ` cho 1 Thùng x24 lon) | `REQ_POS_10_CreateOrder_MultiUnit_BranchProductUnitPrice_Override_AppliesOverride` | **PASS** |
| **REQ-POS-11** | Trừ tồn kho FEFO gối đầu qua nhiều lô khi bán đơn vị Thùng (Lô A cận date trừ hết 10 lon, Lô B trừ tiếp 14 lon còn lại) | `REQ_POS_11_CreateOrder_MultiUnit_DeductsBaseQuantity_FromBranchStocks_FEFO` | **PASS** |
| **REQ-POS-11** | Bán vượt quá tổng tồn kho quy đổi của tất cả các lô (tổng kho 30 gói, cố mua 2 thùng = 48 gói $\rightarrow$ chặn và báo lỗi) | `REQ_POS_11_CreateOrder_MultiUnit_InsufficientTotalBaseStock_ThrowsException` | **PASS** |
| **REQ-POS-11** | Hoàn trả tồn kho về `BranchStocks` khi Chủ cửa hàng hủy đơn hàng | `REQ_POS_11_CancelOrder_RestoresBranchStock` | **PASS** |
| **REQ-POS-12** | POS Cart hiển thị dropdown chọn ĐVT khi sản phẩm có nhiều đơn vị, tự động cập nhật đơn giá và thành tiền | `PosCartTable.tsx`, `PosCheckoutPage.tsx` | **PASS** |
| **REQ-POS-13** | Nạp dữ liệu 4 sản phẩm mẫu thực tế (G7, Choco-Pie, Muối Hảo Hảo, Bia Hà Nội) cho cửa hàng An Nhiên (`tenant_an_nhien_02`) | PostgreSQL `seed_an_nhien_4_products.sql` & `posMockData.ts` | **PASS** |

---

## 3. Lệnh kiểm thử đã thực thi và Output tóm tắt

### 3.1 Backend Unit Tests (xUnit)
- **Lệnh chạy**: `dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\MT_GRMS.UnitTests.csproj`
- **Kết quả**:
  ```text
  Test run for D:\FPT\FPT_Ky9\SEP490\PhanMen\Code\MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\bin\Debug\net8.0\MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
  Passed!  - Failed: 0, Passed: 347, Skipped: 0, Total: 347, Duration: 793 ms - MT_GRMS.UnitTests.dll (net8.0)
  ```
- **Đánh giá**: Toàn bộ 341 tests cũ và 6 tests mới đều chạy thành công 100%.

### 3.2 Frontend Build & TypeScript Check
- **Lệnh chạy**: `cd MT_GRMS_FRONTEND; npm run build`
- **Kết quả**:
  ```text
  > frontend@0.0.0 build
  > tsc -b && vite build
  ✓ 2535 modules transformed.
  dist/index.html                     1.16 kB
  dist/assets/index-BuR6YjRj.css    305.57 kB
  dist/assets/index-KWBdn1qg.js   3,338.72 kB
  ✓ built in 757ms
  ```
- **Đánh giá**: 0 lỗi biên dịch TypeScript, Vite build production thành công.

### 3.3 Frontend POS Unit Tests
- **Lệnh chạy**: `cd MT_GRMS_FRONTEND; npx vitest run src/features/pos`
- **Kết quả**:
  ```text
  Test Files  1 passed (1)
  Tests       3 passed (3)
  ```

### 3.4 Kiểm tra dữ liệu CSDL PostgreSQL
- Đã kiểm tra qua `psql`:
  - 4 sản phẩm liên kết với chi nhánh Ba Đình `b1000000-0000-0000-0000-000000000001`.
  - 10 bản ghi đơn vị quy đổi `ProductUnits`.
  - 6 bản ghi override giá chi nhánh `BranchProductUnitPrices`.
  - 8 lô tồn kho `BranchStocks` với ngày hết hạn và số lượng cụ thể.

---

## 4. Lỗi còn tồn đọng (Known Issues)
- **Không có**: Toàn bộ chức năng hoạt động đúng theo spec, không có lỗi tồn đọng hoặc hồi quy.

---

## 5. Kết luận
- **Verdict**: **PASS**
- Sẵn sàng duyệt bước Test và lưu trữ (Archive) change `pos-branch-pricing-and-fefo`.
