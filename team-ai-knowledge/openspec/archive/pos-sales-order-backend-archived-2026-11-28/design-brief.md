# Design Brief: Phân Hệ Bán Hàng POS Backend & Tích Hợp Phần Cứng

## 1. Kiến Trúc Tổng Thể & Luồng Dữ Liệu 5 Tầng
```text
[1. React POS Web (MT_GRMS_FRONTEND)]
      │
      ├── 1a. Quét mã vạch: Hook useBarcodeScanner bắt phím nhanh (<50ms) + Enter
      │        └──► Gọi GET /api/products/barcode/{barcode} ──► Tự động thêm vào Cart
      │
      ├── 1b. Thanh toán: Form PosPaymentPanel (Tiền mặt / VietQR / Bán nợ)
      │        └──► Gọi POST /api/orders ──► Nhận OrderResponse
      │
      └── 1c. In hóa đơn 1-Click: Bấm nút "⚡ In Hóa Đơn (1-Click)"
               └──► Gọi POST /api/orders/{id}/print
                     │
[2. Backend C# .NET Core (MT_GRMS_BACKEND)]
      │  - Lưu Order và OrderDetails trong DbContext Transaction
      │  - TỰ ĐỘNG TRỪ TỒN KHO: Truy vấn BranchStocks theo BranchId + ProductId (FEFO)
      │    Trừ QuantityOnHand -= Qty; gán BatchCode & CostPrice vào OrderDetail
      │  - Biên dịch đơn hàng sang luồng nhị phân ESC/POS (32 ký tự/dòng khổ 58mm)
      │  - Gọi P/Invoke winspool.drv với pDataType = "RAW"
      ▼
[3. Windows Print Spooler (C:\Windows\System32\winspool.drv)]
      │  Bắn thẳng luồng byte nhị phân qua cổng USB001
      ▼
[4. Cáp USB & Driver Máy in POS-58]
      │  Xung điện kích hoạt vi hạt điện trở nhiệt trên đầu in
      ▼
[5. Đầu Kim Nhiệt Máy In POS-58]
      └──► Giấy tự động chạy ra và cắt giấy tự động (0.3s, 100% không hiện popup)
```

## 2. API Endpoints & DTOs

### 2.1. `POST /api/orders`
- **Chức năng**: Tạo đơn hàng POS, tự động trừ kho chi nhánh và lưu cơ sở dữ liệu.
- **Request Body (`OrderCreateRequest`)**:
  ```json
  {
    "branchId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "paymentMethod": "CASH", // CASH | VIETQR | DEBT
    "cashTendered": 400000,
    "orderDiscountPercent": 0,
    "couponCode": "VIP10",
    "usePoints": false,
    "pointsToUse": 0,
    "note": "Ghi chú đơn hàng",
    "items": [
      {
        "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "quantity": 2,
        "unitPrice": 150000,
        "discountAmount": 0
      }
    ]
  }
  ```
- **Response (`ApiResponse<OrderResponse>`)**: Trả về `OrderResponse` gồm `Id`, `OrderCode`, `TotalAmount`, `DiscountAmount`, `FinalAmount`, `ChangeAmount`, `PointsEarned`, `PaymentStatus`, `Status`, `Items`.

### 2.2. `GET /api/orders/{id}`
- **Chức năng**: Lấy thông tin chi tiết hóa đơn theo ID kèm danh sách sản phẩm.

### 2.3. `GET /api/orders`
- **Chức năng**: Lấy danh sách hóa đơn theo chi nhánh, khoảng ngày, trạng thái thanh toán có phân trang (`pageIndex`, `pageSize`).

### 2.4. `POST /api/orders/{id}/print`
- **Chức năng**: Bắn luồng byte nhị phân ESC/POS trực tiếp xuống máy in nhiệt `POS-58` qua `winspool.drv`.

### 2.5. `GET /api/products/barcode/{barcode}`
- **Chức năng**: Tra cứu nhanh sản phẩm trong kho nội bộ của Tenant theo mã vạch `Barcode` hoặc `SKU`.

## 3. Thiết Kế Cơ Sở Dữ Liệu & Nghiệp Vụ Trừ Tồn Kho
1. **Trừ tồn kho `BranchStocks` theo FEFO**:
   - Khi thanh toán, hệ thống tìm các lô hàng của sản phẩm tại chi nhánh:
     `BranchStocks.Where(s => s.BranchId == request.BranchId && s.ProductId == item.ProductId && s.QuantityOnHand > 0).OrderBy(s => s.ExpiryDate)`
   - Trừ dần số lượng yêu cầu `QuantityOnHand -= qty`.
   - Nếu tổng tồn kho của sản phẩm tại chi nhánh < số lượng mua: Ném ngoại lệ `ValidationException` hoặc `InvalidOperationException` thông báo "Sản phẩm [Tên SP] không đủ tồn kho tại chi nhánh (chỉ còn X)".
   - Ghi nhận `OrderDetail.BatchNumber = stock.BatchCode`, `OrderDetail.CostPrice = stock.LandedCostPerUnit`.
2. **`Customer`**:
   - Khi thanh toán thành công: Cập nhật `TotalSpending += FinalAmount`, `RewardPoints += PointsEarned - PointsUsed`.
   - Nếu `paymentMethod == "DEBT"`: Cập nhật `TotalDebt += FinalAmount`.

## 4. Thiết Kế Module In Nhiệt (Hardware ESC/POS)
1. **`RawPrinterHelper` (`MT_GRMS.Infrastructure/Services/Printer/RawPrinterHelper.cs`)**:
   - Sử dụng Windows Spooler API qua `[DllImport("winspool.Drv")]`.
   - `OpenPrinter`, `StartDocPrinter` với `DOCINFOA.pDataType = "RAW"`.
   - `WritePrinter` ghi trực tiếp `byte[]` nhị phân xuống máy in vật lý.
2. **`ThermalPrintService` (`MT_GRMS.Infrastructure/Services/Printer/ThermalPrintService.cs`)**:
   - Căn lề khổ giấy 58mm: chuẩn 32 ký tự / dòng.
   - Hàm `RemoveAccents`: Chuyển đổi tiếng Việt có dấu sang không dấu (`normalize FormD`) để hiển thị sắc nét trên phần cứng máy in nhiệt.
   - Định dạng 2 cột thông minh `FormatTwoColumns(left, right, 32)`.
   - Số tiền hàng tỷ tự động xuống dòng (`TONG CONG:` dòng 1, số tiền căn phải dòng 2) để không bị đè chữ.
   - Gửi lệnh cắt giấy tự động: `0x1D, 0x56, 0x42, 0x00`.

## 5. Thiết Kế Phía Frontend React
1. **`useBarcodeScanner.ts` (`MT_GRMS_FRONTEND/src/hooks/useBarcodeScanner.ts`)**:
   - Lắng nghe sự kiện `window.addEventListener('keydown')`.
   - Xác định tín hiệu máy quét phần cứng: Chuỗi ký tự độ trễ gõ giữa 2 phím `< 50ms` kết thúc bằng phím `Enter`.
   - Gọi callback `onScanSuccess(barcode)` để tự động thêm sản phẩm vào giỏ hàng.
2. **`PosCheckoutPage.tsx`**:
   - Gọi API `POST /api/orders` khi thu ngân bấm Thanh toán.
   - Tích hợp nút in hóa đơn 1-Click gọi `POST /api/orders/{id}/print`. Có fallback `window.print()` nếu máy in chưa cắm cáp USB.
