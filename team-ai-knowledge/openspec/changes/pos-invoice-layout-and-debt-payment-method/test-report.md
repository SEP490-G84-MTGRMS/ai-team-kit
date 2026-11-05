---
verdict: PASS
date: 2026-11-05
change: pos-invoice-layout-and-debt-payment-method
capability: pos-sales-order
---

# Test Report: POS Invoice Layout & Credit Debt Payment Method

## 1. Tóm tắt kết quả kiểm thử (Summary)
- **Verdict**: **PASS**
- **Mục tiêu**: Xác minh việc khắc phục lỗi hiển thị phương thức bán nợ `CREDIT` bị nhầm thành tiền mặt, căn chỉnh lại độ rộng các cột bảng hóa đơn bán lẻ và loại bỏ dấu ngoặc đơn rỗng ở phần thông tin thu ngân.
- **Kết quả tổng quát**:
  - Frontend Vitest: 3/3 tests passed (100%).
  - Frontend Build (`tsc -b && vite build`): Succeeded cleanly in 749ms, 0 errors.
  - Ánh xạ dữ liệu: Hóa đơn bán nợ `HD261105073958260` (và mọi hóa đơn có `PaymentMethod: CREDIT`) hiển thị chuẩn xác phương thức "Ghi nợ", trạng thái "Còn nợ", khách đã trả "0 đ", và thanh theo dõi nợ hiển thị đúng dư nợ.

## 2. Ma trận kiểm thử yêu cầu (Requirement & Scenario Test Matrix)

| Requirement | Kịch bản (Scenario) | Test Case / Phương thức kiểm thử | Kết quả |
|---|---|---|---|
| **REQ-POS-INVOICE-01** | Hiển thị đúng hóa đơn mua nợ `CREDIT` | Đơn hàng `HD261105073958260` với `PaymentMethod: CREDIT` | **PASS** (Hiển thị nhãn `Ghi nợ` màu cam/vàng, trạng thái `Còn nợ 474.000 đ`, "Khách đã trả: 0 đ") |
| **REQ-POS-INVOICE-01** | Theo dõi công nợ chi tiết của hóa đơn | Mở rộng chi tiết hóa đơn nợ tại sub-table | **PASS** (Thanh vàng hiển thị `Đã thanh toán: 0 đ • Còn nợ lại: 474.000 đ` kèm nút `[Thu Nợ Ngay]`) |
| **REQ-POS-INVOICE-01** | Lọc hóa đơn theo phương thức "Ghi nợ / Mua nợ" | Chọn bộ lọc `paymentMethodFilter = 'DEBT'` | **PASS** (Lọc đúng tất cả đơn `CREDIT` và `DEBT`) |
| **REQ-POS-INVOICE-02** | Cân đối bố cục bảng danh sách hóa đơn | Kiểm tra các cột `pos-shift-table` | **PASS** (`Mã hóa đơn` rộng 185px, `Thao tác` rộng 220px, các cột số tiền căn phải thẳng hàng) |
| **REQ-POS-INVOICE-02** | Xử lý hiển thị thông tin thu ngân | Mở rộng chi tiết hóa đơn khi `cashierId` rỗng | **PASS** (Hiển thị `Thu ngân: Thu ngân quầy`, không còn cặp ngoặc rỗng `()`) |
| **Toàn bộ hệ thống** | Regression test và kiểm tra biên dịch | `npm test -- pos` + `npm run build` | **PASS** (3/3 tests pass, built cleanly in 749ms) |

## 3. Nhật ký thực thi kiểm thử (Command Execution Logs)

### 3.1. Frontend Vitest
```text
> frontend@0.0.0 test
> vitest run pos

 RUN  v5.0.4 D:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND

 ✓ src/features/pos/__tests__/posOrderApi.test.ts (3 tests) 5ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  835ms
```

### 3.2. Frontend Production Build
```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.1 building client environment for production...
transforming...
✓ 2535 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     1.16 kB │ gzip:   0.68 kB
dist/assets/index-BuR6YjRj.css    305.57 kB │ gzip:  47.72 kB
dist/assets/index-B6OrqdLN.js   3,340.43 kB │ gzip: 815.07 kB
✓ built in 749ms
```

## 4. Tồn đọng (Known Issues)
- Không có lỗi tồn đọng.
