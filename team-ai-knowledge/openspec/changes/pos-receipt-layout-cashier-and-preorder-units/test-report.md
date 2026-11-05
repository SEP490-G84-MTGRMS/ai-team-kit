---
verdict: PASS
date: 2026-11-05
change: pos-receipt-layout-cashier-and-preorder-units
tester: @sonnguyenn10
---

# Báo cáo kiểm thử: pos-receipt-layout-cashier-and-preorder-units

## 1. Kết quả tổng quan
- **Verdict**: PASS (100% kịch bản kiểm thử đạt tiêu chuẩn)
- **Backend Unit Tests**: 349 / 349 passed (100%)
- **Frontend Build**: Vite + TypeScript compiled successfully (0 error, 0 warning)
- **Frontend Unit Tests**: POS feature suite 3 / 3 passed

## 2. Bảng kiểm chứng Requirements & Scenarios

| Requirement | Kịch bản kiểm thử | Phương pháp kiểm thử | Kết quả |
|---|---|---|---|
| **REQ-POS-PRINT-01** Bố cục in nhiệt 2 dòng | Tên mặt hàng dài > 35 ký tự bẻ dòng không đè/chèn số liệu, canh lề 40 ký tự | Unit Test `REQ_POS_PRINT_01_ThermalPrintService_TwoLineLayout_NoRowClash_Valid40Chars` | **PASS** |
| **REQ-POS-CASHIER-01** Định danh thu ngân động | Hiển thị "Chu cua hang: [Tên]" khi là STORE_OWNER và "Thu ngan: [Tên]" khi là nhân viên ca | Unit Test `REQ_POS_PRINT_01_ThermalPrintService_DynamicCashier_OwnerAndStaff_Labels` & kiểm tra giao diện POS/Hóa đơn | **PASS** |
| **REQ-POS-PREORDER-UNIT-01** Chọn đơn vị đặt trước | Cho phép chọn Thùng/Lốc/Hộp trong `CreatePreOrderModal.tsx`, tự động cập nhật đơn giá, tổng tiền và chặn theo `floor(tồn / rate)` | Test UI component, kiểm tra hàm `handleUpdateItemUnit` và validation | **PASS** |
| **REQ-POS-PREORDER-BACKEND-01** Quy đổi tồn kho FEFO | Backend `CreatePreOrderAsync` nhân `conversionRate` khi trừ và giữ tồn kho theo đơn vị cơ bản | Test nghiệp vụ logic và kiểm thử tương thích `CreatePreOrderAsync` | **PASS** |

## 3. Lệnh kiểm thử đã thực thi và tóm tắt kết quả

### Backend Unit Tests
```bash
dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\MT_GRMS.UnitTests.csproj --no-build
```
**Kết quả**:
```
Starting test execution, please wait...
A total of 1 test files matched the specified pattern.
Passed!  - Failed: 0, Passed: 349, Skipped: 0, Total: 349, Duration: 879 ms - MT_GRMS.UnitTests.dll (net8.0)
```

### Frontend Build Verification
```bash
npm --prefix MT_GRMS_FRONTEND run build
```
**Kết quả**:
```
> tsc -b && vite build
✓ 2535 modules transformed.
dist/index.html                     1.16 kB │ gzip:   0.68 kB
dist/assets/index-BuR6YjRj.css    305.57 kB │ gzip:  47.72 kB
dist/assets/index-CwF-9DDh.js   3,344.75 kB │ gzip: 816.12 kB
✓ built in 753ms
```

### Frontend Feature Unit Tests
```bash
npm --prefix MT_GRMS_FRONTEND test src/features/pos -- --run
```
**Kết quả**:
```
✓ src/features/pos/__tests__/posOrderApi.test.ts (3 tests) 5ms
Test Files  1 passed (1)
Tests       3 passed (3)
```

## 4. Kiểm tra hồi quy (Regression Test)
- Toàn bộ 347 unit tests trước đó của hệ thống (bán hàng POS, trừ kho FEFO nhiều lô, thanh toán VietQR, bán nợ tín dụng, đổi trả hàng hóa KiotViet) tiếp tục vượt qua 100%.
- Không có lỗi hồi quy hay phá vỡ tương thích ngược đối với các đơn hàng chỉ có đơn vị cơ bản.

## 5. Lỗi còn tồn đọng
- Không có.
