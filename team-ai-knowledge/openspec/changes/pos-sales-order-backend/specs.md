# Specifications: Phân Hệ Bán Hàng POS Backend & Tích Hợp Phần Cứng (Tạp Hóa / Siêu Thị Mini)

## ADDED Requirements

### Requirement: REQ-POS-01 Tạo đơn hàng bán lẻ POS
The system MUST provide an API endpoint `POST /api/orders` to create and finalize a retail sales order. The system SHALL calculate item line totals, apply line-level and order-level discounts, compute final amount, validate payment, and record transaction in database.

#### Scenario: Tạo đơn hàng thanh toán tiền mặt thành công
**GIVEN** Thu ngân đã đăng nhập thuộc chi nhánh `BranchId` và giỏ hàng có 2 mặt hàng hợp lệ  
**WHEN** Gửi yêu cầu `POST /api/orders` với `paymentMethod = "CASH"`, tiền khách đưa đủ hoặc lớn hơn tổng tiền  
**THEN** Hệ thống lưu bản ghi `Order` với trạng thái `Completed`, `PaymentStatus = "PAID"`, tính tiền thối `ChangeAmount` chính xác và trả về mã hóa đơn `HD...`

#### Scenario: Báo lỗi khi giỏ hàng rỗng
**GIVEN** Thu ngân gửi yêu cầu thanh toán không có món hàng nào (`items = []`)  
**WHEN** Gửi yêu cầu `POST /api/orders`  
**THEN** Hệ thống MUST từ chối với mã lỗi `400 Bad Request` và thông báo "Giỏ hàng không được để trống"

#### Scenario: Báo lỗi khi tiền khách đưa nhỏ hơn tổng tiền phải trả
**GIVEN** Đơn hàng có tổng thanh toán là `150.000 đ` và phương thức là tiền mặt `CASH`  
**WHEN** Thu ngân gửi `cashTendered = 100.000 đ`  
**THEN** Hệ thống MUST từ chối với mã lỗi `400 Bad Request` và thông báo "Tiền khách đưa không đủ để thanh toán"

---

### Requirement: REQ-POS-02 Trừ tồn kho chi nhánh tự động theo lô (FEFO)
The system MUST deduct inventory quantity from `BranchStocks` upon successful order creation. The system SHALL prioritize batches with earliest expiration date (FEFO rule), decrement `QuantityOnHand`, and record the batch code and cost price into `OrderDetail`.

#### Scenario: Trừ kho thành công khi đủ số lượng tồn
**GIVEN** Sản phẩm "Mì Hảo Hảo" tại chi nhánh `BranchId` có 2 lô: Lô A (hạn 01/2027) còn 10 gói, Lô B (hạn 06/2027) còn 20 gói  
**WHEN** Thu ngân bán 15 gói Mì Hảo Hảo  
**THEN** Hệ thống tự động trừ hết 10 gói ở Lô A (`QuantityOnHand = 0`) và trừ tiếp 5 gói ở Lô B (`QuantityOnHand = 15`), lưu vết thông tin lô vào chi tiết đơn hàng

#### Scenario: Báo lỗi từ chối bán khi tồn kho tại chi nhánh không đủ
**GIVEN** Sản phẩm "Nước ngọt Coca-Cola" tại chi nhánh `BranchId` chỉ còn tổng cộng 3 lon trong kho  
**WHEN** Thu ngân cố gắng bán 5 lon Coca-Cola  
**THEN** Hệ thống MUST từ chối giao dịch với mã lỗi `400 Bad Request` và thông báo "Sản phẩm Nước ngọt Coca-Cola không đủ tồn kho tại chi nhánh (chỉ còn 3)"

---

### Requirement: REQ-POS-03 Tra cứu sản phẩm theo mã vạch Barcode
The system MUST provide an API endpoint `GET /api/products/barcode/{barcode}` allowing POS cashier or barcode scanner to lookup a product by Barcode or SKU within the current tenant.

#### Scenario: Tìm thấy sản phẩm theo mã vạch hợp lệ
**GIVEN** Sản phẩm "Nước ngọt Coca-Cola 330ml" có mã vạch `8935049500123` tồn tại trong kho của Tenant  
**WHEN** Gửi yêu cầu `GET /api/products/barcode/8935049500123`  
**THEN** Hệ thống trả về `200 OK` kèm thông tin `id`, `name`, `retailPrice`, `stockQuantity`, `sku`, `unitName`

#### Scenario: Không tìm thấy sản phẩm theo mã vạch
**GIVEN** Mã vạch `9999999999999` không tồn tại trong hệ thống  
**WHEN** Gửi yêu cầu `GET /api/products/barcode/9999999999999`  
**THEN** Hệ thống trả về `404 Not Found` kèm thông báo "Không tìm thấy sản phẩm với mã vạch này"

---

### Requirement: REQ-POS-04 In hóa đơn nhiệt 1-Click (Chuẩn 43mm - Siêu Thị Mini / Cửa Hàng Tạp Hóa)
The system MUST provide an API endpoint `POST /api/orders/{id}/print` that converts the order into an ESC/POS binary byte stream formatted for 43mm printable area on 58mm thermal rolls (~32-38 characters per line, Font B / ~7.5pt small compact font) following grocery / mini-supermarket bill layout and sends it directly to Windows Print Spooler (`winspool.drv`) using `RAW` mode without showing browser print dialogs.

#### Layout hóa đơn siêu thị mini / tạp hóa:
1. **Header**:
   - Tên cửa hàng / siêu thị mini: "SIÊU THỊ MINI MT-GROCERY" (Căn giữa, in hoa đậm)
   - Địa chỉ chi nhánh & Hotline CSKH
   - Wifi / Mật khẩu (dành cho khách hàng)
2. **Metadata**:
   - Dòng phân cách nét đứt: `--------------------------------` (32 ký tự)
   - Mã hóa đơn & Mã vạch hóa đơn (Barcode Code128 ESC/POS hoặc text)
   - Thời gian mua hàng: dd/MM/yyyy HH:mm:ss
   - Thu ngân: Tên thu ngân
   - Khách hàng: Tên KH & Điểm thưởng hiện tại
3. **Chi tiết hàng hóa (Căn lề khổ 43mm compact ~7.5pt)**:
   - Dòng 1: Tên sản phẩm rút gọn
   - Dòng 2: `[SL] x [Đơn giá]` (căn trái) ........... `[Thành tiền]` (căn phải)
4. **Tổng thanh toán**:
   - Phân cách nét đứt: `--------------------------------`
   - Tổng tiền hàng: `... đ`
   - Giảm giá / Chiết khấu: `- ... đ`
   - Thuế GTGT (VAT): `... đ`
   - **TỔNG THANH TOÁN**: `... đ` (In hoa, Double-Width / In đậm)
   - Tiền khách đưa: `... đ` (nếu tiền mặt)
   - Tiền trả lại: `... đ` (nếu tiền mặt)
   - Hình thức: Tiền mặt / Chuyển khoản VietQR / Nợ
5. **Footer & Chính sách cửa hàng**:
   - Điểm tích lũy mới sau giao dịch
   - "Quý khách vui lòng kiểm tra lại hóa đơn và hàng hóa trước khi rời quầy."
   - "Đổi trả hàng trong 24h kèm hóa đơn (chưa bóc seal)."
   - "CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!"
   - Đẩy giấy 4 dòng (`LF`) và Lệnh cắt giấy tự động (`0x1D 0x56 0x42 0x00`).

#### Scenario: In hóa đơn siêu thị mini 43mm thành công
**GIVEN** Đơn hàng `HD001` đã thanh toán và máy in `POS-58` đã cắm cổng USB máy tính  
**WHEN** Gửi yêu cầu `POST /api/orders/{id}/print`  
**THEN** Hệ thống tạo luồng byte ESC/POS layout siêu thị mini khổ 43mm và gửi trực tiếp qua `winspool.drv` RAW, máy in in ngay lập tức không bật hộp thoại trình duyệt
