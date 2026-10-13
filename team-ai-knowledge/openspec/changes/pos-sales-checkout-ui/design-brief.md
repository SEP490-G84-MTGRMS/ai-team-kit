# Design Brief: pos-sales-checkout-ui

## Luồng người dùng (User Flow)
1. **Truy cập & Khởi tạo phiên**:
   - Thu ngân truy cập `/pos`. Màn hình toàn diện của Quầy Bán Hàng POS hiện ra.
   - Phiên "Hóa đơn 1" sẵn sàng nhận dữ liệu. Thu ngân có thể bấm `[+] [F1]` để mở thêm phiên "Hóa đơn 2", "Hóa đơn 3" để phục vụ song song nhiều khách chờ.
2. **Nhập hàng vào giỏ**:
   - **Chế độ Bán nhanh (Barcode)**: Thu ngân quét mã vạch hoặc gõ SKU/tên vào ô tìm kiếm F2 -> Nhấn Enter -> Sản phẩm tự động nạp vào giỏ hàng. Nếu sản phẩm đã có thì tăng số lượng lên +1.
   - **Chế độ Bán thường (Touch Screen)**: Thu ngân bấm nút "Bán thường" -> Khối danh mục sản phẩm hiển thị -> Lọc theo tab danh mục (`Tất cả`, `Đồ uống`, `Mì & Thực phẩm`, `Bánh kẹo`, `Sữa`) -> Xem phân trang (Trang 1, Trang 2) -> Bấm nút `[+] Thêm` để nạp vào giỏ.
   - **Thêm nhanh hàng mới**: Nếu quét mã không tìm thấy -> Bấm "Thêm nhanh mặt hàng mới" -> Mở Modal nhập Tên, Mã, ĐVT, Giá bán, Tồn kho -> Lưu và tự động thêm vào giỏ.
3. **Điều chỉnh giỏ hàng**:
   - Thu ngân chỉnh số lượng trực tiếp trong ô `input number` hoặc bấm +/-.
   - Chỉnh chiết khấu món: Bấm icon tùy chọn `⋮` -> Mở popover nhập giảm giá (VND hoặc %).
   - Kiểm soát giá vốn: Nếu giá bán sau giảm thấp hơn giá vốn (`CostPrice`), hệ thống cảnh báo và yêu cầu mở Modal xác nhận mã PIN Quản lý (mặc định PIN `8888`) mới cho phép áp dụng.
4. **Gắn khách hàng & Tích điểm (F4)**:
   - Thu ngân nhập SĐT hoặc tên khách hàng vào ô F4 -> Chọn khách hàng -> Thẻ thông tin khách hàng xuất hiện với Điểm tích lũy (ví dụ: `200 điểm`).
   - Nếu là khách hàng mới -> Bấm `+` mở Modal "Thêm khách hàng mới" (Mã, Tên, SĐT, Ngày sinh, Địa chỉ, Phường xã).
5. **Tính toán & Khuyến mại**:
   - Hệ thống tự động tính:
     - `Tổng tiền hàng` = tổng thành tiền các món.
     - `Giảm giá khuyến mại` = tự động áp dụng % khuyến mại theo chương trình (có dải thông báo trực quan).
     - `Mã coupon`: Hỗ trợ nhập mã coupon giảm thêm.
     - `Dùng điểm tích lũy`: Checkbox cho phép trừ điểm (1 điểm = 100 đ hoặc 1,000 đ) vào số tiền cần trả.
     - `Khách cần trả` = Tổng tiền - Giảm giá - Dùng điểm.
6. **Thanh toán & In hóa đơn K80**:
   - **Tiền mặt (F8)**: Nhập số tiền khách đưa -> Hệ thống tự động tính tiền thừa trả lại khách.
   - **Chuyển khoản VietQR**: Bấm chọn VietQR -> Mở Modal Dynamic VietQR Napas 247 -> Hiển thị QR Code theo chuẩn VietQR, ngân hàng nhận tiền, số tiền chính xác và mã hóa đơn -> Bấm "Xác nhận đã nhận tiền & In hóa đơn K80".
   - Bấm nút **THANH TOÁN**: Đơn hàng chuyển trạng thái hoàn tất, mở Modal Mẫu In Hóa Đơn K80 hiển thị bản xem trước hóa đơn nhiệt chuẩn 80mm có nút in trực tiếp `window.print()`.

---

## Cấu trúc Màn hình & Component (Component Architecture)

```
src/features/pos/
├── types/
│   └── pos.types.ts             (Interface Order, OrderItem, Product, Customer, CartItem, TabSession)
├── mock/
│   └── posMockData.ts           (Dữ liệu giả lập chuẩn schema: Products, Categories, Customers, InitialBills)
├── components/
│   ├── PosHeader.tsx            (Toolbar: Thông tin chi nhánh/quầy, Tab đơn hàng, chuyển Bán nhanh/thường, Giữ đơn, In bill gần nhất, Chốt ca)
│   ├── PosCartTable.tsx         (Bảng giỏ hàng, danh sách món, số lượng, ĐVT, chiết khấu món, popover giảm giá)
│   ├── PosCatalogGrid.tsx       (Lưới sản phẩm Touch Screen, filter category, card sản phẩm kèm ĐVT/tồn, phân trang chuẩn)
│   ├── PosPaymentPanel.tsx      (Cột phải: Khách hàng F4, Bảng tính tiền, Tiền mặt/VietQR, Tiền thừa, Nút Thanh toán)
│   ├── PosReceiptModal.tsx      (Modal & Mẫu in Hóa đơn K80 nhiệt 80mm ESC/POS, hỗ trợ window.print)
│   └── modals/
│       ├── AddCustomerModal.tsx (Modal thêm khách hàng mới đầy đủ trường)
│       ├── VietQrModal.tsx      (Modal thanh toán Dynamic VietQR Napas 247 đếm ngược)
│       ├── QuickAddProductModal.tsx (Modal thêm nhanh hàng hóa vào hệ thống & giỏ)
│       ├── BelowCostWarningModal.tsx (Modal cảnh báo bán dưới giá vốn & nhập PIN Quản lý)
│       └── OrderDiscountModal.tsx   (Modal chiết khấu toàn đơn hàng)
├── pages/
│   └── PosCheckoutPage.tsx      (Trang chính tích hợp toàn bộ logic và quản lý session giỏ hàng)
├── pos.css                      (Styles cho POS, tối ưu bảng dữ liệu, nút bấm KiotViet, theme Deep Teal)
└── index.ts                     (Public API của feature POS)
```

---

## Trạng thái giao diện (UI States)
- **Empty State**: Khi giỏ hàng chưa có sản phẩm, hiển thị biểu tượng giỏ hàng rỗng và thông điệp: *"Chưa có sản phẩm nào trong đơn hàng. Quét mã vạch [F2] hoặc chọn mặt hàng bên dưới để thêm."*
- **Active Tab Session**: Chuyển đổi mượt mà giữa các tab Hóa đơn 1, Hóa đơn 2, không làm mất giỏ hàng của từng phiên.
- **Hold Order (Giữ đơn / Recall)**: Thông báo trạng thái đơn hàng tạm giữ vào bộ nhớ cục bộ để phục vụ khách tiếp theo.
- **Print Preview**: Cửa sổ in K80 với định dạng chữ đơn cách (Monospace), kẻ bảng nét liền đậm nét, ẩn toàn bộ navigation bar khi thực hiện in thực tế.

---

## Đối chiếu Dữ liệu với Master ERD & Database Schema
1. **Bảng `Orders`**:
   - `OrderCode`: Mã hóa đơn (VD: `HD000043`).
   - `BranchId` & `BranchName`: Chi nhánh thực hiện (VD: `Chi nhánh trung tâm`).
   - `CashierId` & `CashierName`: Thu ngân trực quầy (VD: `Nguyễn Bá Sơn`).
   - `CustomerId`: Khách hàng mua (hoặc null nếu khách vãng lai).
   - `TotalAmount`, `DiscountAmount`, `FinalAmount`: Số tiền trước/sau chiết khấu.
   - `PaymentMethod`: `Cash` | `VietQR`.
   - `PaymentStatus`: `Paid`.
2. **Bảng `OrderItems`**:
   - `ProductId`, `ProductName`, `SKU`, `Barcode`.
   - `UnitName`: Đơn vị tính (Cái, Lon, Hộp, Chai, Gói...).
   - `Quantity`: Số lượng bán.
   - `UnitPrice`: Đơn giá bán.
   - `CostPrice`: Giá vốn dùng để kiểm tra bán dưới giá vốn.
   - `LineTotal`: Thành tiền dòng.
   - `BatchCode` (Lô FEFO): Hiển thị trên hóa đơn in K80.
3. **Bảng `Customers`**:
   - `PhoneNumber`, `FullName`, `LoyaltyPoints`, `MembershipTier`, `Address`.
4. **Bảng `Products` & `Inventory`**:
   - `BasePrice`, `CostPrice`, `QuantityOnHand` (Tồn kho hiển thị).
