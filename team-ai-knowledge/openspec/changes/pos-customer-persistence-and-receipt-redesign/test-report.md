---
verdict: PASS
date: 2026-11-05
change: pos-customer-persistence-and-receipt-redesign
author: @sonnguyenn10
---

# Báo cáo kiểm thử: pos-customer-persistence-and-receipt-redesign

## 1. Kết quả tổng quan
- **Verdict**: **PASS** (100% đạt yêu cầu)
- **Frontend**:
  - `npm --prefix MT_GRMS_FRONTEND run build`: Biên dịch TypeScript và build Vite thành công (`✓ built in 691ms`, 0 errors).
  - `npm --prefix MT_GRMS_FRONTEND test -- pos`: 3/3 tests PASS.
  - `npm --prefix MT_GRMS_FRONTEND test -- customer`: 14/14 tests PASS.
- **Backend**:
  - `dotnet build MT_GRMS_BACKEND\src\MT_GRMS.Infrastructure`: Thành công (0 errors).
  - `dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests`: 347/347 tests PASS (`Failed: 0, Passed: 347, Total: 347`).
- **Lỗi tồn đọng**: Không có (0).

---

## 2. Bảng đối chiếu Requirements & Test Cases

| Mã REQ | Kịch bản kiểm thử | Kỳ vọng | Kết quả |
|---|---|---|---|
| **REQ-POS-CUST-01** | Tạo mới khách hàng tại POS | Khi bấm "Lưu khách hàng" trong `AddCustomerModal`, gọi API `POST /api/customers`, lưu vào CSDL PostgreSQL, nhận ID GUID thật và tự chọn vào tab đơn hàng hiện tại | **PASS** |
| **REQ-POS-CUST-01** | Bỏ chọn và tìm lại khách hàng | Bấm `✕` bỏ chọn khách hàng -> Khách hàng vẫn được lưu trong CSDL và state; tìm lại qua SĐT hoặc Tên trong thanh tìm kiếm xuất hiện ngay lập tức | **PASS** |
| **REQ-POS-CUST-01** | Bắt lỗi trùng số điện thoại | Nhập SĐT đã tồn tại -> Backend trả về `PHONE_EXISTS`, modal hiển thị banner lỗi rõ ràng và giữ nguyên form | **PASS** |
| **REQ-POS-VAT-01** | Loại bỏ hoàn toàn dòng VAT | `PosReceiptModal` và `ThermalPrintService` không hiển thị bất kỳ dòng nào về "Tổng tiền chưa VAT" hay "Tiền VAT" / "Thuế VAT" | **PASS** |
| **REQ-POS-DYNAMIC-STORE-01** | Thông tin Tenant & Chi nhánh động | Header hóa đơn hiển thị đúng tên siêu thị/chi nhánh, địa chỉ và hotline theo tài khoản đang đăng nhập (An Nhiên Mart / MT-Mart) thay vì hardcode MT-GROCERY | **PASS** |
| **REQ-POS-RECEIPT-LAYOUT-01** | Form hóa đơn chuẩn siêu thị | Bảng mặt hàng có cột STT, Hàng hóa, SL, Đơn giá, Thành tiền; chân bill có khối THÔNG TIN KHÁCH HÀNG chi tiết (Tên, SĐT, Địa chỉ, Điểm tích lũy) | **PASS** |

---

## 3. Lệnh kiểm thử và Trích xuất log

### A. Frontend Build & Vitest
```bash
npm --prefix MT_GRMS_FRONTEND run build
# > tsc -b && vite build
# ✓ 2535 modules transformed.
# dist/assets/index-BuR6YjRj.css    305.57 kB │ gzip:  47.72 kB
# dist/assets/index-MMnFgbOx.js   3,343.81 kB │ gzip: 815.84 kB
# ✓ built in 691ms

npm --prefix MT_GRMS_FRONTEND test -- pos
# ✓ src/features/pos/__tests__/posOrderApi.test.ts (3 tests)
# Test Files  1 passed (1)
# Tests  3 passed (3)

npm --prefix MT_GRMS_FRONTEND test -- customer
# ✓ src/features/customer-crm/__tests__/customerValidation.test.ts (6 tests)
# ✓ src/features/customer-crm/__tests__/customerApi.test.ts (8 tests)
# Test Files  2 passed (2)
# Tests  14 passed (14)
```

### B. Backend xUnit Unit Tests
```bash
dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests
# Test run for MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
# A total of 1 test files matched the specified pattern.
# Passed!  - Failed:     0, Passed:   347, Skipped:     0, Total:   347, Duration: 859 ms
```

---

## 4. Kết luận
Tất cả các tiêu chí thành công đã được kiểm chứng bằng thực nghiệm. Không có lỗi biên dịch hay lỗi kiểm thử. Sẵn sàng hoàn tất bước Test và lưu trữ (Archive) change.
