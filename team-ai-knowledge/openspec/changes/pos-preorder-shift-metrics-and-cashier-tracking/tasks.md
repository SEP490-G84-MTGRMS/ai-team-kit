# Danh sách công việc (Tasks) — pos-preorder-shift-metrics-and-cashier-tracking

- [x] T1: Bổ sung `FulfilledByCashierName`, `FulfilledAtUtc` vào `Order.cs` và `DbInitializer.cs`, thêm `PREORDER_PICKUP` vào `FinanceEnums.cs` [REQ-POS-PREORDER-CASHIER-SNAPSHOT-02]
- [x] T2: Bổ sung `CashierName` vào `PreOrderCreateRequest`, `PreOrderFulfillRequest`, cập nhật `OrderService.CreatePreOrderAsync` và `OrderService.FulfillPreOrderAsync` ghi nhận tiền thu phần còn lại vào ca giao hàng [REQ-POS-PREORDER-CASHIER-SNAPSHOT-02, REQ-POS-PREORDER-FULFILL-SHIFT-04]
- [x] T3: Cập nhật `ShiftRepository.GetShiftSalesMetricsAsync` tính doanh số theo `DepositAmount` cho các đơn ở trạng thái `PendingPickup` [REQ-POS-PREORDER-SHIFT-METRICS-03]
- [x] T4: Bổ sung `cashierName`, `fulfilledByCashierName` vào `PreOrderDTO` (`inventory.types.ts`) và truyền `cashierName` trong `posOrderApi.ts` [REQ-POS-PREORDER-CASHIER-UI-01]
- [x] T5: Thêm cột "Người tạo / Giao hàng" vào bảng danh sách Đơn đặt trước trong `InvoiceManagementPage.tsx` [REQ-POS-PREORDER-CASHIER-UI-01]
- [x] T6: Chạy kiểm thử tự động Backend (`dotnet test`), build kiểm tra Frontend (`npm run build`) và đối soát toàn diện [REQ-POS-PREORDER-CASHIER-UI-01, REQ-POS-PREORDER-CASHIER-SNAPSHOT-02, REQ-POS-PREORDER-SHIFT-METRICS-03, REQ-POS-PREORDER-FULFILL-SHIFT-04]
