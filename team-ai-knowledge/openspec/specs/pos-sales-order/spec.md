# Spec: pos-sales-order

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

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

### Requirement: REQ-POS-ORDER-MGMT Kết Nối Backend Phân Hệ Quản Lý Đơn Hàng & Đơn Đặt Trước
Hệ thống SHALL kết nối trang `InvoiceManagementPage` với Backend API `GET /api/orders` theo `TenantId` để nạp danh sách thực tế từ CSDL PostgreSQL.

#### Scenario: Tải danh sách hóa đơn bán lẻ và đơn đặt trước của chủ tiệm 0901234567
- **GIVEN** Chủ tiệm `Tran Van Chu` (`0901234567`) thuộc `tenant_mt_mart_01` truy cập `/pos/orders`
- **WHEN** Trang quản lý đơn hàng tải dữ liệu
- **THEN** Tab "Hóa đơn bán lẻ" hiển thị 4 hóa đơn mẫu (Tiền mặt, VietQR, Bán nợ, Đã hủy) và Tab "Đơn đặt trước" hiển thị 3 đơn giữ kho với thông tin tiền cọc, tiền còn lại và lịch hẹn.

#### Scenario: Hoàn tất đơn đặt trước khi khách đến quầy nhận hàng
- **GIVEN** Đơn đặt trước `PO-20261101-001` đang ở trạng thái `PreOrder`
- **WHEN** Thu ngân bấm "Xuất hàng & Nhận thanh toán" và chọn phương thức thanh toán số tiền còn lại
- **THEN** API `PUT /api/orders/{id}/fulfill` được gọi, trạng thái đơn chuyển sang `Completed` và hiển thị thông báo thành công.

---

### Requirement: REQ-POS-DEBT Nghiệp Vụ Bán Nợ Tạp Hóa Không Giới Hạn Hạn Mức Cứng
Hệ thống SHALL cho phép Chủ Cửa Hàng (`role: STORE_OWNER`) bán nợ cho khách hàng định danh mà không bị chặn bởi hạn mức nợ (Debt Limit). Hệ thống MUST hiển thị số lần nợ và tổng số tiền nợ tích lũy của khách hàng.

#### Scenario: Chủ cửa hàng ghi nợ thành công cho khách hàng
- **GIVEN** Tài khoản đăng nhập là Chủ Cửa Hàng (`STORE_OWNER`) và đã chọn khách hàng "Chị Lan"
- **WHEN** Chủ tiệm chọn phương thức thanh toán "Ghi nợ" và xác nhận thanh toán đơn hàng 522.500 đ
- **THEN** Đơn hàng được tạo với `PaymentMethod = "DEBT"`, `PaymentStatus = "UNPAID"`, số tiền nợ của khách hàng được cộng dồn và không bị chặn bởi bất kỳ hạn mức nào.

#### Scenario: Thu ngân không có quyền bán nợ
- **GIVEN** Tài khoản đăng nhập là Thu Ngân (`CASHIER`)
- **WHEN** Thu ngân mở bảng thanh toán `PosPaymentPanel`
- **THEN** Nút phương thức thanh toán "Ghi nợ" bị ẩn hoàn toàn, thu ngân chỉ được chọn Tiền mặt hoặc VietQR.

---

### Requirement: REQ-POS-UI-CLEANUP Tinh Gọn Giao Diện POS & Form Khách Hàng
Hệ thống SHALL loại bỏ các thành phần kiểm thử giả lập trên giao diện người dùng và tinh giản modal thêm khách hàng.

#### Scenario: Thêm khách hàng mới tại quầy POS
- **GIVEN** Thu ngân mở modal `AddCustomerModal`
- **WHEN** Thu ngân xem bảng nhập liệu khách hàng
- **THEN** Trường "Mã KH:" và "Nhóm:" không hiển thị; mã khách hàng được tự động sinh ngầm theo định dạng `KHxxxxxx`.

---

### Requirement: REQ_POS_RET_01 Order Return and Exchange Processing
Hệ thống MUST cho phép thu ngân hoặc quản lý thực hiện nghiệp vụ Đổi / Trả hàng từ một hóa đơn đã hoàn thành (`Status = Completed`).
Hệ thống MUST tự động hoàn trả số lượng hàng khách trả lại vào `BranchStocks` của chi nhánh.
Nếu có hàng khách đổi mới, hệ thống MUST kiểm tra tồn kho và trừ tồn kho `BranchStocks` theo nguyên tắc FEFO.
Hệ thống MUST tự động tính bù trừ chênh lệch (Net Amount):
* Nếu Tổng tiền hàng mới > Tổng tiền hàng trả: Khách hàng MUST thanh toán thêm phần chênh lệch (CASH, VIETQR, DEBT).
* Nếu Tổng tiền hàng mới < Tổng tiền hàng trả: Cửa hàng MUST hoàn lại tiền thừa (tiền mặt) hoặc giảm trừ công nợ khách hàng (nếu khách có nợ).
Hóa đơn gốc MUST được giữ nguyên trạng thái `Completed`; hệ thống sinh ra chứng từ giao dịch mới có ghi chú tham chiếu đến mã hóa đơn gốc.

#### Scenario: Đổi hàng có giá trị cao hơn, khách thanh toán thêm phần chênh lệch
* **GIVEN** Hóa đơn `HD-001` đã hoàn thành chứa sản phẩm `SP-A` (đơn giá 100.000đ, số lượng 1)
* **WHEN** Thu ngân chọn trả 1 sản phẩm `SP-A` và chọn đổi sang sản phẩm `SP-B` (đơn giá 150.000đ, số lượng 1, tồn kho khả dụng $\ge 1$)
* **THEN** Hệ thống tính số tiền khách cần trả thêm là 50.000đ
* **AND** Sau khi xác nhận thanh toán, tồn kho `SP-A` tại chi nhánh tăng 1, tồn kho `SP-B` giảm 1
* **AND** Một đơn hàng mới được tạo ghi nhận thanh toán 50.000đ kèm ghi chú tham chiếu `HD-001`.

#### Scenario: Trả hàng và cấn trừ vào Sổ nợ của khách hàng
* **GIVEN** Khách hàng `Chị Lan` có số nợ hiện tại là 200.000đ và có hóa đơn mua hàng `HD-002` gồm `SP-C` (trị giá 80.000đ)
* **WHEN** Thu ngân chọn trả sản phẩm `SP-C` và chọn hình thức "Trừ vào sổ nợ"
* **THEN** Tồn kho `SP-C` tại chi nhánh tăng 1
* **AND** Số nợ của khách hàng `Chị Lan` giảm từ 200.000đ xuống còn 120.000đ
* **AND** Hệ thống không phát sinh dòng tiền mặt chi ra.

#### Scenario: Đổi hàng nhưng sản phẩm mới không đủ tồn kho tại chi nhánh
* **GIVEN** Hóa đơn `HD-003` có sản phẩm cần trả
* **WHEN** Thu ngân chọn đổi sang sản phẩm `SP-D` với số lượng 5, nhưng tồn kho khả dụng tại chi nhánh chỉ còn 2
* **THEN** Hệ thống MUST từ chối giao dịch và hiển thị thông báo lỗi "Sản phẩm SP-D không đủ tồn kho tại chi nhánh để đổi".

---

### Requirement: REQ_POS_SEC_02 Role-Based Order Cancellation Permission
Hệ thống MUST kiểm soát phân quyền khi thực hiện hủy hóa đơn đã thanh toán (`Status = Completed`).
Tài khoản mang vai trò Thu ngân (`CASHIER`) MUST NOT được phép tự ý hủy hóa đơn đã hoàn thành.
Chỉ tài khoản mang vai trò Chủ cửa hàng (`STORE_OWNER`), Quản lý (`MANAGER`), hoặc `ADMIN` MUST được phép thực hiện hủy hóa đơn đã hoàn thành và MUST nhập lý do hủy.

#### Scenario: Thu ngân cố gắng hủy hóa đơn đã thanh toán
* **GIVEN** Người dùng đang đăng nhập với vai trò `CASHIER`
* **WHEN** Người dùng cố gắng gọi API hủy hoặc bấm hủy trên hóa đơn có trạng thái `Completed`
* **THEN** Hệ thống MUST từ chối với mã lỗi `403 Forbidden` và thông báo "Thu ngân không có quyền hủy hóa đơn đã thanh toán. Vui lòng liên hệ Quản lý hoặc Chủ cửa hàng."
* **AND** Trạng thái hóa đơn và tồn kho không bị thay đổi.

#### Scenario: Chủ cửa hàng hủy hóa đơn đã thanh toán kèm lý do
* **GIVEN** Người dùng đang đăng nhập với vai trò `STORE_OWNER`
* **WHEN** Người dùng bấm hủy hóa đơn `HD-004` và nhập lý do "Khách hủy nhầm đơn tại quầy"
* **THEN** Hệ thống cập nhật trạng thái hóa đơn thành `Cancelled`
* **AND** Toàn bộ sản phẩm trong hóa đơn được hoàn trả lại tồn kho `BranchStocks`
* **AND** Nếu hóa đơn có ghi nợ, số nợ của khách hàng được hoàn tác giảm tương ứng.

---

### Requirement: REQ_POS_PRE_03 Pre-Order Minimum Deposit Validation
Khi tạo đơn đặt trước giữ kho (Pre-Order), số tiền đặt cọc (`DepositAmount`) MUST đạt tối thiểu $10\%$ của tổng giá trị thanh toán cuối cùng (`FinalAmount`).
Nếu `DepositAmount < 0.10 * FinalAmount`, hệ thống MUST từ chối tạo đơn và yêu cầu bổ sung tiền cọc.
Hệ thống MUST ghi nhận `BranchId` và hiển thị chi nhánh tiếp nhận đặt hàng làm chi nhánh nhận hàng mặc định.

#### Scenario: Tạo đơn đặt trước với số tiền cọc hợp lệ (>= 10%)
* **GIVEN** Đơn hàng đặt trước có tổng giá trị `FinalAmount = 1.000.000đ`
* **WHEN** Người dùng nhập số tiền đặt cọc là 150.000đ (15%) và các thông tin khách hàng, ngày hẹn
* **THEN** Hệ thống chấp nhận tạo đơn với mã `POxxxxxx`, trạng thái `PendingPickup`, và khóa tồn kho tương ứng theo FEFO tại chi nhánh tiếp nhận.

#### Scenario: Tạo đơn đặt trước với số tiền cọc không đủ (< 10%)
* **GIVEN** Đơn hàng đặt trước có tổng giá trị `FinalAmount = 1.000.000đ`
* **WHEN** Người dùng nhập số tiền đặt cọc là 50.000đ (5%)
* **THEN** Hệ thống MUST từ chối lưu và hiển thị thông báo lỗi "Tiền đặt cọc tối thiểu phải bằng 10% tổng giá trị đơn hàng (tối thiểu: 100.000 đ)".

---

### Requirement: REQ-POS-PRE-04 Multi-Batch FEFO Allocation for Pre-Orders
The system MUST prioritize reserving stock from the batch with the earliest expiration date (FEFO - First Expired, First Out) when creating a pre-order.

#### Scenario: Pre-order qty spans across multiple batches
- GIVEN a branch with Product P having:
  - Batch 1: ExpireDate = Today + 5 days, QuantityOnHand = 3
  - Batch 2: ExpireDate = Today + 20 days, QuantityOnHand = 5
- WHEN a customer creates a pre-order for 4 units of Product P with a valid deposit (≥ 10%)
- THEN the system MUST deduct 3 units from Batch 1 (leaving 0)
- AND deduct 1 unit from Batch 2 (leaving 4)
- AND the pre-order status SHALL be `PendingPickup` with 2 OrderDetail line items corresponding to the allocated batches.

### Requirement: REQ-POS-PRE-05 Smart Product Autocomplete Selector for Pre-Orders
The system SHALL provide an instant autocomplete search input to filter and pick products within the Create Pre-Order modal.

#### Scenario: Cashier searches product by name or barcode
- GIVEN the Create Pre-Order modal is opened
- WHEN the cashier types a keyword or barcode into the search box
- THEN the system MUST display a dropdown list of matching products showing name, unit price, and available shelf stock
- AND clicking an item SHALL immediately add it to the selected items table
- AND the search box SHALL reset to empty and focus for the next input.

#### Scenario: Cashier adjusts item quantity using inline controls
- GIVEN an item exists in the pre-order table
- WHEN the cashier clicks the `+` or `-` button
- THEN the quantity SHALL increment or decrement accordingly
- AND the line item total amount and minimum required deposit SHALL update immediately.

## Lịch sử
- 2026-11-01 · `pos-sales-order-backend` · +4 ~0 -0
- 2026-11-01 · `pos-order-management-debt-refinement` · +1 ~2 -0
- 2026-11-01 · `pos-return-exchange-and-preorder` · +2 ~1 -0
- 2026-11-01 · `preorder-fefo-tests-and-ux` · +2 ~0 -0
