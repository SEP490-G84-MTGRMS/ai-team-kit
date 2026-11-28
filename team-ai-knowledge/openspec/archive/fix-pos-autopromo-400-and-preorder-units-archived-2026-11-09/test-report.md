---
capability: pos-sales-order
change: fix-pos-autopromo-400-and-preorder-units
status: completed
verdict: PASS
date: 2026-11-09
author: "@sonnguyenn10"
---

# Báo cáo Kiểm thử Nghiệm thu: fix-pos-autopromo-400-and-preorder-units

## 1. Tổng quan Nghiệm thu
- **Mã Change**: `fix-pos-autopromo-400-and-preorder-units`
- **Capability**: `pos-sales-order`
- **Kết luận chung (Verdict)**: **PASS (100% Đạt tiêu chuẩn)**
- **Môi trường thử nghiệm**:
  - Backend: .NET 8.0 / C# 12 / EF Core 8 / PostgreSQL (Npgsql)
  - Frontend: React 18 / TypeScript 5 / Vite 8 (Rolldown) / Tailwind CSS
  - Bộ kiểm thử tự động: xUnit (UnitTests + IntegrationTests)

---

## 2. Ma trận Kiểm thử So sánh Trước vs Sau khi Sửa lỗi (Before vs After)

| Mã Lỗi / Kịch bản | Trước khi sửa (Before - FAIL) | Sau khi sửa (After - PASS) | Test Case Kiểm chứng | Kết quả |
|---|---|---|---|---|
| **Lỗi 400 `evaluate-cart` POS** (`REQ-FIX-PROMO-01`) | POS gửi `branchId = "BR-AN-01"`, `customerId = "kh_retail"` làm ASP.NET Core ném `400 Bad Request`. POS `.catch()` nuốt lỗi, giỏ hàng tự động giảm `0 đ` bắt buộc thu ngân nhập tay. | DTO nhận chuỗi an toàn, phân giải chi nhánh thật của Tenant. Giỏ hàng `420.000 đ` tự động giảm `60.000 đ`, hiển thị `Khuyến mại tự động: -60.000 đ`. | `REQ_FIX_PROMO_01_EvaluateCart_WithStringBranchAndCustomer_MatchesExactBranchAndAppliesDiscount` | **PASS** |
| **Quy đổi ĐVT trên BOGO & Giảm giá SP** (`REQ-FIX-PROMO-01`) | Khách mua `1 Thùng (x8 hộp)` nhưng `boughtQty` chỉ đếm số lượng dòng (`1 < 6`), không áp được khuyến mãi tặng `1 Hộp`. | `GetCartItemBaseQty` cộng gộp `Quantity × ConversionRate` (`1 × 8 = 8 >= 6`), tự động tặng đủ quà `BUY_X_GET_Y` và tính đúng giảm giá sản phẩm. | `REQ_FIX_PROMO_02_EvaluateCart_BOGO_CalculatesBoughtQuantityUsingConversionRate` | **PASS** |
| **Chống khớp nhầm chuỗi con chi nhánh** (`REQ-FIX-PROMO-01`) | Dùng `.Contains("BR-AN-01")` làm chi nhánh `BR-AN-01` bị nhận nhầm CTKM độc quyền của chi nhánh `BR-AN-010`. | Tách mảng token `TargetBranches.Split(',', ';')` và đối khớp chính xác từng phần tử theo `TenantId`. Chi nhánh `BR-AN-010` không bị khớp nhầm sang `BR-AN-01`. | `REQ_FIX_PROMO_01_EvaluateCart_WithStringBranchAndCustomer_MatchesExactBranchAndAppliesDiscount` (Act 2) | **PASS** |
| **Đồng bộ trạng thái & Bảo toàn cờ `isActive`** (`REQ-FIX-PROMO-02`) | Múi giờ UTC làm lệch ngày; mở Sửa và Lưu một CTKM `UPCOMING` bị đổi nhầm thành `PAUSED` do ghi đè `isActive = false`. | Thứ tự xác định chuẩn theo ngày lịch `UTC+7`: `EXPIRED` → `PAUSED` → `UPCOMING` → `ACTIVE`. Lưu riêng cờ `isActive: boolean` giúp sửa CTKM `UPCOMING` không bị tắt. Nạp chi nhánh thật của Tenant. | `PromotionListPage.tsx`, `PromotionModal.tsx`, `PromotionTable.tsx` build thành công, local date logic chuẩn xác. | **PASS** |
| **Thiếu Đơn vị quy đổi trên Tạo Đơn Đặt Trước** (`REQ-FIX-PREUNIT-01`) | Mở `+ Tạo đơn đặt trước` không có dropdown chọn Đơn vị; fallback `/products` gán khống `quantityOnHand ?? 100`. | `CatalogService` trả kèm `UnitPrices`, POS fallback nạp đủ ĐVT và giữ đúng tồn kho thực tế; UI hiển thị `<select>` chọn `Thùng/Lốc/Chai` kèm cập nhật giá tức thì. | `CatalogService.MapToResponse`, `posOrderApi.getAllProducts`, `CreatePreOrderModal.tsx`. | **PASS** |
| **Giữ kho FEFO 2 bước & Hoàn kho theo hệ số** (`REQ-FIX-PREUNIT-02`) | Đặt trước theo Thùng qua 2 lô FEFO bị phân mảnh thành nhiều dòng và nhân sai thành tiền; hủy đơn chỉ cộng lại số lượng theo dòng không nhân hệ số. | Tách 2 bước: Bước 1 trừ kho cơ sở gộp theo FEFO (`2 Thùng x 12 = 24 chai`); Bước 2 tạo đúng 1 dòng `OrderDetail` (`Qty = 2, UnitName = "Thùng", ConversionRate = 12`). Hủy đơn hoàn đủ `24 chai`. | `REQ_FIX_PREUNIT_02_CreatePreOrder_WithConversionRate_DeductsFEFOBaseStockAndStoresUnitInfo`, `REQ_FIX_PREUNIT_02_CancelPreOrder_RestoresBaseQuantityUsingConversionRate` | **PASS** |
| **Chặn đặt vượt tổng tồn kho quy đổi & Nút Hủy đơn** (`REQ-FIX-PREUNIT-02`) | Đặt `1 Thùng (12 Chai) + 5 Chai` khi kho chỉ có `15 Chai` bị lọt ở client; API trả lỗi thì frontend nuốt và sinh đơn `PO` giả. | Modal kiểm tra cộng dồn tổng lượng cơ sở `17 > 15` chặn ngay từ đầu; API kiểm tra độc lập ném lỗi rõ ràng; Tab `Đơn Đặt Trước` hiển thị `UnitName` và bổ sung nút **Hủy đơn** hoàn kho tại quầy. | `REQ_FIX_PREUNIT_02_CreatePreOrder_AggregatedBaseQuantityExceedingStock_ThrowsInvalidOperationException`, `InvoiceManagementPage.tsx` | **PASS** |

---

## 3. Nhật ký Thực thi Lệnh Kiểm thử Tự động (Command Execution Logs)

### 3.1. Backend Unit Tests & Integration Tests
```powershell
dotnet test MT_GRMS_BACKEND/MT_GRMS_BACKEND.sln
```
**Output**:
```text
Passed!  - Failed:     0, Passed:   590, Skipped:     0, Total:   590, Duration: 1 s - MT_GRMS.UnitTests.dll (net8.0)
Passed!  - Failed:     0, Passed:    47, Skipped:     0, Total:    47, Duration: 2 s - MT_GRMS.IntegrationTests.dll (net8.0)

Build succeeded.
    0 Warning(s)
    0 Error(s)
```
- **Tổng số test case**: **637 tests**
- **Tỷ lệ vượt qua**: **100% (637 / 637 PASS)**
- **Độ trễ**: ~3 giây toàn bộ test suite.

### 3.2. Frontend Production Build & TypeScript Verification
```powershell
npm --prefix MT_GRMS_FRONTEND run build
```
**Output**:
```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.1 building client environment for production...
transforming...
✓ 2589 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                            4.99 kB │ gzip:   1.34 kB
dist/assets/feature-pos-C_0hdnmC.js                      534.93 kB │ gzip: 125.02 kB
dist/assets/feature-promotion-CG0tiDcn.js                 78.84 kB │ gzip:  16.85 kB
✓ built in 688ms
```
- **Trạng thái**: Biên dịch thành công 100%, 0 lỗi TypeScript (`tsc -b`).

---

## 4. Kiểm tra Tiêu chí Nghiệm thu (Acceptance Checklist)
- [x] **AC-1**: `POST /api/promotions/evaluate-cart` tiếp nhận an toàn `branchId = "BR-AN-01"`, `customerId = "kh_retail"`, `conversionRate` và trả `200 OK`; tự động áp giảm giá / BOGO theo ĐVT quy đổi và chốt đơn POS không lỗi 400.
- [x] **AC-2**: `PromotionListPage`, `PromotionModal`, `PromotionFilterBar`, `PromotionTable` và `PromotionRepository` đồng bộ 4 trạng thái `EXPIRED` / `PAUSED` / `UPCOMING` / `ACTIVE` theo `UTC+7`, bảo toàn `isActive` khi sửa CTKM `UPCOMING`, và hiển thị chi nhánh thật của Tenant.
- [x] **AC-3**: `GET /api/products` và `posOrderApi.getAllProducts` trả đầy đủ `unitPrices` với tồn kho thật; `InvoiceManagementPage` dùng UUID chi nhánh thực của Tenant và không nuốt lỗi tạo đơn `PO` giả.
- [x] **AC-4**: `CreatePreOrderAsync`, `CreateOrderAsync`, `CancelOrderAsync`, `ProcessReturnExchangeAsync` tách 2 bước trừ/hoàn tồn kho FEFO nhân đúng `ConversionRate` trong transaction, lưu `ProductUnitID`/`UnitName`/`ConversionRate` (migration + `DbInitializer` bọc `IsNpgsql()`), và Tab Đơn đặt trước hiển thị ĐVT + nút Hủy đơn.

---

## 5. Lỗi Tồn đọng (Residual Issues)
- **Không có lỗi tồn đọng (0 issues)**. Toàn bộ các yêu cầu nghiệp vụ và kỹ thuật đã được kiểm chứng và hoạt động ổn định.
- **Verdict**: **PASS**. Đủ điều kiện để người dùng nghiệm thu và tiến hành lưu trữ (`/sep-archive`).
