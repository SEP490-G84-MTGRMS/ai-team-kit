# Tasks: pos-receipt-layout-cashier-and-preorder-units

- [ ] T1: Viết Unit Test kiểm thử bố cục in 2 dòng trên khổ 40 ký tự và tính tỷ lệ quy đổi trong `CreatePreOrderAsync` (tham chiếu REQ-POS-PRINT-01, REQ-POS-PREORDER-BACKEND-01)
- [ ] T2: Nâng cấp `ThermalPrintService.cs` và `IThermalPrintService.cs`: layout 2 dòng cho mặt hàng (`stt. name` + `qty x price` và `lineTotal` căn phải tại cột 40), nhận `cashierName` động (tham chiếu REQ-POS-PRINT-01, REQ-POS-CASHIER-01)
- [ ] T3: Cập nhật `OrderDtos.cs` và `OrdersController.cs`: bổ sung `CashierName` vào `PrintOrderRequest` và `OrderCreateRequest`, truyền vào `PrintOrderInvoiceAsync` (tham chiếu REQ-POS-CASHIER-01)
- [ ] T4: Cập nhật `OrderService.cs` method `CreatePreOrderAsync`: tính `baseQty = item.Quantity * conversionRate` khi giữ tồn kho FEFO (tham chiếu REQ-POS-PREORDER-BACKEND-01)
- [ ] T5: Cập nhật Frontend `PosCheckoutPage.tsx` và `PosReceiptModal.tsx`: gửi `cashierName` khi tạo đơn/in hóa đơn và hiển thị nhãn theo vai trò (Chủ cửa hàng / Nhân viên) (tham chiếu REQ-POS-CASHIER-01)
- [ ] T6: Cập nhật Frontend `InvoiceManagementPage.tsx`: hiển thị động Người tạo / Thu ngân theo vai trò người dùng thay vì chuỗi gán cứng (tham chiếu REQ-POS-CASHIER-01)
- [ ] T7: Cập nhật Frontend `CreatePreOrderModal.tsx`: thêm dropdown chọn đơn vị tính (`unitPrices`), tự động tính đơn giá, thành tiền và chặn tồn kho theo `floor(tồn / rate)` (tham chiếu REQ-POS-PREORDER-UNIT-01)
- [ ] T8: Chạy kiểm thử tự động `dotnet test` và `npm run build` để xác minh toàn bộ tiêu chí nghiệm thu (Acceptance Criteria)
