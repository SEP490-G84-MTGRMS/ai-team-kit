# Tasks: Phân Hệ Bán Hàng POS Backend & Tích Hợp Thiết Bị Phần Cứng

## 1. Backend Infrastructure & Printer Service
- [ ] T1: Hiện thực hóa `RawPrinterHelper` (P/Invoke Win32 Spooler `winspool.drv` gửi byte nhị phân RAW) tại `MT_GRMS.Infrastructure/Services/Printer/RawPrinterHelper.cs` (REQ-POS-04).
- [ ] T2: Hiện thực hóa `ThermalPrintService` (ESC/POS 58mm, 32 ký tự/dòng, in đậm, căn lề, format 2 cột, ngắt dòng tiền tỷ, cắt giấy tự động) tại `MT_GRMS.Infrastructure/Services/Printer/ThermalPrintService.cs` (REQ-POS-04).

## 2. Backend Application Layer (Logic Nghiệp Vụ)
- [ ] T3: Bổ sung DTOs đầy đủ cho đơn hàng POS (`OrderCreateRequest`, `OrderItemCreateDto`, `OrderResponse`, `OrderItemResponse`, `OrderFilterRequest`) và Validator FluentValidation tại `MT_GRMS.Application/PosOrders/` (REQ-POS-01).
- [ ] T4: Định nghĩa và hiện thực hóa `IOrderService` và `OrderService` (Xử lý tạo đơn hàng, tính chiết khấu, VAT, tính tiền thối, cộng dồn điểm thưởng, cập nhật nợ khách hàng khi bán nợ có kiểm tra `DebtLimit`) tại `MT_GRMS.Application/PosOrders/OrderService.cs` (REQ-POS-01, REQ-POS-05, REQ-POS-06).
- [ ] T5: Hiện thực hóa logic Trừ tồn kho tự động trong `OrderService` (Truy vấn `BranchStocks` theo `BranchId` + `ProductId` theo FEFO, trừ `QuantityOnHand`, gắn `BatchCode` & `CostPrice` vào `OrderDetail`, ném lỗi nếu không đủ tồn kho) (REQ-POS-02).
- [ ] T6: Hiện thực hóa `IOrderRepository` và `OrderRepository` (EF Core query có include Details, Branch, Customer) tại `MT_GRMS.Infrastructure/Repositories/OrderRepository.cs` (REQ-POS-01).

## 3. Backend API Controllers & Đăng Ký DI
- [ ] T7: Hoàn thiện `OrdersController` (`POST /api/orders`, `GET /api/orders/{id}`, `GET /api/orders`, `POST /api/orders/{id}/print`) tại `MT_GRMS.Api/Controllers/OrdersController.cs` (REQ-POS-01, REQ-POS-04).
- [ ] T8: Thêm endpoint tra cứu sản phẩm theo mã vạch `GET /api/products/barcode/{barcode}` vào `ProductsController` (REQ-POS-03).
- [ ] T9: Đăng ký DI cho `IThermalPrintService`, `IOrderService`, `IOrderRepository` vào `Program.cs` và kiểm tra `dotnet build` 0 lỗi.

## 4. Backend Unit Tests (Đầy Đủ Test Cases)
- [ ] T10: Viết Unit Tests `PosOrderServiceTests.cs` bao phủ đầy đủ các ca:
  - Tạo đơn thành công với tiền mặt và tính đúng tiền thối `ChangeAmount`.
  - Tạo đơn thành công với chuyển khoản VietQR.
  - Tạo đơn bán nợ thành công cho khách hàng có hạn mức hợp lệ.
  - Báo lỗi từ chối khi giỏ hàng rỗng (`ValidationException`).
  - Báo lỗi khi tiền khách đưa nhỏ hơn tổng tiền phải trả.
  - Báo lỗi khi khách bán nợ vượt quá hạn mức nợ `DebtLimit`.
  - Báo lỗi khi sản phẩm không đủ tồn kho tại chi nhánh `BranchStocks`.
  - Trừ tồn kho thành công theo đúng thứ tự lô hạn sử dụng FEFO.
  - Tích điểm thành công cho khách hàng sau khi thanh toán.
  - Kiểm thử `ThermalPrintService` sinh đúng mã lệnh nhị phân ESC/POS và cắt giấy.
- [ ] T11: Chạy `dotnet test` và xác nhận đạt 100% Pass.

## 5. Frontend Hardware Hook & Tích Hợp Giao Diện
- [ ] T12: Tạo React Hook `useBarcodeScanner.ts` tại `MT_GRMS_FRONTEND/src/hooks/useBarcodeScanner.ts` bắt sự kiện máy quét USB HID gõ nhanh (<50ms) + Enter (REQ-POS-03).
- [ ] T13: Tích hợp hook quét mã vạch và API `POST /api/orders` vào `PosCheckoutPage.tsx` thay thế dữ liệu mock, tích hợp nút in 1-Click gọi `POST /api/orders/{id}/print` (REQ-POS-01, REQ-POS-04).
- [ ] T14: Chạy `npm run build` trên Frontend xác nhận 0 lỗi TypeScript / CSS.
