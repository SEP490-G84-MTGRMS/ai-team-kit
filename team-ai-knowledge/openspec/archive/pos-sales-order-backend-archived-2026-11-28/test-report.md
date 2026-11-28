---
verdict: PASS
change: pos-sales-order-backend
capability: pos-sales-order
tested_at: 2026-11-01T14:55:00+07:00
tested_by: sonnguyenn10
---

# Báo Cáo Kiểm Thử (Test Report) — Phân Hệ Bán Hàng POS Backend & Tích Hợp Phần Cứng

## 1. Tổng quan kết quả (Verdict)
- **Kết luận:** **PASS** (100% Passed)
- **Số lượng Unit Tests Backend:** 162/162 tests đạt (0 Failed, 0 Skipped).
- **Frontend Build & Typecheck:** 0 lỗi (Vite + TypeScript biên dịch thành công 100%).

## 2. Bảng ma trận kiểm thử theo Requirements & Scenarios (Traceability Matrix)

| REQ ID | Kịch bản kiểm thử (Scenario) | Test Case tương ứng | Kết quả | Ghi chú |
| :--- | :--- | :--- | :---: | :--- |
| **REQ-POS-01** | Tạo đơn hàng tiền mặt thành công, tính tiền thừa | `REQ_POS_01_CreateOrder_Cash_Success_ComputesChange` | **PASS** | Tiền thừa `changeAmount` tính chính xác, trạng thái PAID |
| **REQ-POS-01** | Tạo đơn hàng chuyển khoản VietQR | `REQ_POS_01_CreateOrder_VietQr_Success_ZeroChange` | **PASS** | Thanh toán thành công, không phát sinh tiền thừa |
| **REQ-POS-01** | Báo lỗi khi giỏ hàng rỗng | `REQ_POS_01_CreateOrder_EmptyItems_ThrowsValidationException` | **PASS** | FluentValidation ném `ValidationException` |
| **REQ-POS-01** | Báo lỗi khi tiền khách đưa nhỏ hơn tổng tiền | `REQ_POS_01_CreateOrder_CashTenderedInsufficient_ThrowsInvalidOperationException` | **PASS** | Chặn lỗi không đủ tiền thanh toán |
| **REQ-POS-02** | Trừ tồn kho chi nhánh theo hạn dùng sớm nhất (FEFO) | `REQ_POS_02_CreateOrder_DeductsInventory_ByFEFO` | **PASS** | Lô hạn gần được trừ trước, cập nhật `BatchCode` vào chi tiết đơn |
| **REQ-POS-02** | Báo lỗi từ chối bán khi tồn kho không đủ | `REQ_POS_02_CreateOrder_InsufficientStock_ThrowsInvalidOperationException` | **PASS** | Báo rõ tên mặt hàng và số lượng tồn còn lại |
| **REQ-POS-03** | Tra cứu sản phẩm theo mã vạch Barcode / SKU | `GetByBarcode_ValidBarcode_ReturnsProduct` | **PASS** | Phục vụ quét mã vạch USB HID tốc độ cao (<50ms) |
| **REQ-POS-04** | In nhiệt ESC/POS chuẩn 43mm siêu thị mini không qua trình duyệt | `REQ_POS_04_PrintOrder_GeneratesEscPosBinary_WithCorrectLayout` | **PASS** | WinSpool RAW mode, cắt giấy tự động, Font B ~7.5pt |
| **REQ-POS-05** | Bán nợ (Ghi nợ) thành công, cập nhật nợ khách hàng | `REQ_POS_05_CreateOrder_Debt_Success_IncrementsCustomerDebt` | **PASS** | Tăng nợ `TotalDebt` của khách hàng chính xác |
| **REQ-POS-05** | Báo lỗi khi vượt quá hạn mức nợ `DebtLimit` | `REQ_POS_05_CreateOrder_DebtExceedsLimit_ThrowsInvalidOperationException` | **PASS** | Kiểm soát trần rủi ro công nợ khách hàng |
| **REQ-POS-05** | Báo lỗi khi khách hàng đang bị khóa nợ | `REQ_POS_05_CreateOrder_DebtBlockedCustomer_ThrowsInvalidOperationException` | **PASS** | Chặn khách hàng bị khóa sổ nợ |
| **REQ-POS-05** | Phân quyền: Thu ngân gửi đơn bán nợ bị từ chối 403 | `REQ_POS_05_CreateOrder_DebtByCashier_ThrowsUnauthorizedAccessException` | **PASS** | Thu ngân không được duyệt bán nợ |
| **REQ-POS-05** | Phân quyền: Chủ cửa hàng duyệt đơn bán nợ thành công | `REQ_POS_05_CreateOrder_DebtByStoreOwner_Success` | **PASS** | Chủ cửa hàng toàn quyền duyệt ghi nợ |
| **REQ-POS-06** | Tích điểm thưởng tự động cho khách hàng định danh | `REQ_POS_06_CreateOrder_EarnsRewardPoints_ForCustomer` | **PASS** | Tích lũy 1 điểm cho mỗi 10.000đ doanh số |
| **REQ-MULTI** | Phân lập dữ liệu Multi-tenant giữa các cửa hàng | Frontend Multi-tenant Isolation Test | **PASS** | Chủ cửa hàng khác không thấy sản phẩm, khách, đơn của MT-Mart |

## 3. Lệnh kiểm thử thực tế & Tóm tắt kết quả

### Backend Unit Tests
```powershell
dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\MT_GRMS.UnitTests.csproj
```
**Kết quả:**
```
Starting test execution, please wait...
A total of 1 test files matched the specified pattern.
Passed!  - Failed: 0, Passed: 162, Skipped: 0, Total: 162, Duration: 113 ms - MT_GRMS.UnitTests.dll (net8.0)
```

### Frontend TypeScript & Vite Bundle Build
```powershell
npm --prefix MT_GRMS_FRONTEND run build
```
**Kết quả:**
```
✓ 2462 modules transformed.
rendering chunks...
dist/index.html                     1.16 kB
dist/assets/index-CsVI-QXS.css    263.95 kB
dist/assets/index-Dq51SZ4D.js   2,518.35 kB
✓ built in 556ms with 0 errors.
```

## 4. Lỗi tồn đọng (Known Issues)
- Không có lỗi tồn đọng. Hệ thống vận hành ổn định, sẵn sàng đóng change để chuyển sang sản xuất.
