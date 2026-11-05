---
verdict: PASS
date: 2026-11-05
change: pos-debt-checkout-and-multi-lot-fefo
capability: pos-sales-order
---

# Test Report: POS Debt Checkout, Print Decoupling & Multi-Lot FEFO

## 1. Tóm tắt kết quả kiểm thử (Summary)
- **Verdict**: **PASS**
- **Mục tiêu**: Xác minh việc khắc phục lỗi bán nợ POS (`column c.LastRepaymentAtUtc does not exist`), đảm bảo đơn hàng hoàn tất độc lập với in ấn hóa đơn và kiểm chứng tính đúng đắn của thuật toán FEFO đa lô.
- **Kết quả tổng quát**:
  - Backend Unit Tests: 347/347 tests passed (100%).
  - Frontend Vitest: 3/3 tests passed (100%).
  - Frontend Production Build (`tsc -b && vite build`): Succeeded cleanly in 756ms.
  - Live Integration Verification: Tạo đơn hàng bán nợ `CREDIT` trị giá `58,000 VND` trên CSDL thực tế thành công, ghi sổ nợ và cập nhật dư nợ khách hàng chính xác.

## 2. Ma trận kiểm thử yêu cầu (Requirement & Scenario Test Matrix)

| Requirement | Kịch bản (Scenario) | Test Case / Phương thức kiểm thử | Kết quả |
|---|---|---|---|
| **REQ-POS-DEBT-01** (Thanh toán bán nợ) | Bán nợ thành công cho khách hàng có hạn mức (`KH-AN-001`, 58,000đ) | Live API Call: `POST /api/v1/orders` với `paymentMethod: CREDIT` | **PASS** (Đơn `HD261105072516474` thành công, `TotalDebt` = 58,000đ) |
| **REQ-POS-DEBT-01** (Từ chối vượt hạn mức) | Khách hàng vượt quá `DebtLimit` | `CustomerDebtServiceTests` & Domain validation | **PASS** |
| **REQ-POS-PRINT-02** (Độc lập in bill) | Tạo đơn hàng thành công khi không có máy in hoặc máy in lỗi | Code analysis & Vitest `executeCompleteCheckout` tách rời `printDirect` chạy nền | **PASS** |
| **REQ-POS-FEFO-03** (FEFO đa lô) | Khấu trừ 40 sản phẩm qua Lô A (tồn 20, HSD 12/2026) và Lô B (tồn 30, HSD 06/2027) | `OrderServiceTests` & thuật toán `GetBranchStocksForProductFefoAsync` | **PASS** (Lô A về 0, Lô B còn 10, sinh đủ 2 `StockTransaction`) |
| **Toàn bộ hệ thống** | Regression testing toàn bộ các tính năng POS và phân hệ liên quan | `dotnet test MT_GRMS.UnitTests` (347 tests) + `npm test -- pos` | **PASS** (347/347 unit tests pass) |

## 3. Nhật ký thực thi lệnh kiểm thử (Command Execution Logs)

### 3.1. Frontend Unit Tests & Build
```text
> frontend@0.0.0 test
> vitest run pos

 RUN  v5.0.4 D:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND

 ✓ src/features/pos/__tests__/posOrderApi.test.ts (3 tests) 7ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  823ms

> frontend@0.0.0 build
> tsc -b && vite build
✓ 2535 modules transformed.
✓ built in 756ms
```

### 3.2. Backend Unit Tests
```text
Passed!  - Failed:     0, Passed:   347, Skipped:     0, Total:   347, Duration: 1 s - MT_GRMS.UnitTests.dll (net8.0)
```

### 3.3. Live API Credit Order Verification
```json
{
  "orderId": "6b3602d1-be61-464a-a92c-5b23d9b4b008",
  "orderCode": "HD261105072516474",
  "totalAmount": 58000.0,
  "paymentMethod": "CREDIT",
  "status": "COMPLETED",
  "customerId": "d4e2fa8a-6b5d-4f1b-bfa1-e6d30bcfbf47"
}
```

## 4. Tồn đọng (Known Issues)
- Không có lỗi tồn đọng.
