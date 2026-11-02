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

### Requirement: REQ-ANNHIEN-01 Nạp Dữ Liệu Cửa Hàng An Nhiên Mart
Hệ thống Frontend SHALL tự động nạp danh mục sản phẩm, khách hàng, hóa đơn và đơn đặt trước của Cửa hàng Thực Phẩm Sạch An Nhiên khi tài khoản người dùng mang `tenantId == 'tenant_an_nhien_02'`.

#### Scenario: Nhân viên hoặc Chủ quán An Nhiên mở màn hình POS
- **GIVEN** Người dùng đăng nhập thành công với tài khoản An Nhiên Mart (`tenant_an_nhien_02`)
- **WHEN** Quầy POS tải dữ liệu sản phẩm
- **THEN** Danh sách hiển thị đủ 5 sản phẩm nông sản sạch (Gạo lứt, Trứng gà, Nước mắm, Táo Envy, Sữa Mộc Châu) kèm tồn kho theo lô FEFO
- **AND** Không bị rơi vào trạng thái giỏ hàng rỗng hoặc lỗi mảng không xác định.

### Requirement: REQ-LOGOUT-01 Nút Đăng Xuất Cho Nhân Viên POS
Hệ thống Frontend MUST cung cấp tùy chọn đăng xuất an toàn cho tài khoản Nhân viên thu ngân (`EMPLOYEE` / `CASHIER`) ngay trong menu popover "Thao tác" của thanh điều hướng `PosHeader`.

#### Scenario: Nhân viên thu ngân hết ca làm việc và đăng xuất
- **GIVEN** Tài khoản người dùng có vai trò Nhân viên (`role !== 'STORE_OWNER'`) đang ở quầy POS
- **WHEN** Nhân viên nhấp chuột vào nút "Thao tác" (hamburger menu) ở góc trên bên phải
- **THEN** Dropdown hiển thị mục "Đăng xuất tài khoản" với biểu tượng `LogOut` màu đỏ
- **WHEN** Nhân viên nhấp chọn "Đăng xuất tài khoản"
- **THEN** Hệ thống dọn sạch token xác thực trong Zustand Auth Store và điều hướng về `/auth/login`.

### Requirement: REQ-PAY-CONFIG-01 Cấu Hình Tài Khoản Ngân Hàng & SePay API Key Cho Chủ Cửa Hàng
Hệ thống **MUST** cung cấp giao diện cấu hình tài khoản ngân hàng và SePay API Key cho Chủ cửa hàng (`STORE_OWNER`) tại nút Bánh răng cài đặt trên Header POS (`PosHeader.tsx`) và trên thanh điều hướng (`AppTopNav.tsx`). API Key **MUST** được che mặt nạ bảo mật (`sepay_apikey_••••••••`) và được mã hóa lưu trữ bằng thuật toán AES-256 ở tầng Backend. Thu ngân (`EMPLOYEE` / `CASHIER`) **MUST NOT** có quyền truy cập hoặc xem cấu hình này.

#### Scenario: Chủ cửa hàng thiết lập và lưu thông tin tài khoản ngân hàng thành công
- **GIVEN** Người dùng đã đăng nhập với vai trò Chủ cửa hàng (`STORE_OWNER`) thuộc Tenant `tenant_an_nhien_02`
- **WHEN** Người dùng bấm vào biểu tượng Bánh răng cài đặt và nhập:
  - Ngân hàng: `MB` (MBBank)
  - Số tài khoản: `0918889999`
  - Tên chủ tài khoản: `NGUYEN AN NHIEN`
  - SePay API Key: `sepay_apikey_example_12345`
  - Bật công tắc "Kích hoạt chuyển khoản tự động"
  - Bấm nút "Lưu Cấu Hình"
- **THEN** Hệ thống lưu cấu hình thành công, gửi thông báo thành công "Đã lưu cấu hình tài khoản thanh toán", hiển thị API Key dưới dạng mặt nạ che giấu `sepay_apikey_••••••••`, và cấp đường dẫn Webhook URL của hệ thống kèm nút Sao chép.

#### Scenario: Thu ngân cố gắng truy cập cấu hình thanh toán
- **GIVEN** Người dùng đăng nhập với vai trò Thu ngân (`EMPLOYEE` / `CASHIER`)
- **WHEN** Người dùng quan sát giao diện Header POS hoặc gọi API `GET /api/v1/payments/config`
- **THEN** Biểu tượng Bánh răng cài đặt không hiển thị cấu hình nhạy cảm, và API trả về `403 Forbidden`.

---

### Requirement: REQ-SEPAY-GUIDE-01 Cẩm Nang Hướng Dẫn Đăng Ký SePay Chi Tiết 5 Bước
Hệ thống **MUST** cung cấp một Tab riêng biệt "Hướng Dẫn Đăng Ký SePay" ngay bên trong Modal Cài đặt thanh toán. Hướng dẫn **SHALL** trình bày rõ ràng 5 bước từng bước từ đăng ký tài khoản, liên kết ngân hàng, tạo API Key, sao chép Webhook URL và thực hiện kiểm thử, giải thích rõ quyền hạn Read-only để Chủ tiệm hoàn toàn yên tâm.

#### Scenario: Chủ cửa hàng xem cẩm nang hướng dẫn đăng ký SePay
- **GIVEN** Modal Cài đặt thanh toán đang mở
- **WHEN** Chủ cửa hàng bấm sang Tab "Hướng Dẫn Đăng Ký SePay"
- **THEN** Giao diện hiển thị đầy đủ 5 thẻ bước trực quan:
  1. Đăng ký tài khoản miễn phí tại `my.sepay.vn`
  2. Thêm tài khoản ngân hàng cá nhân
  3. Lấy SePay API Key và dán vào Tab Cấu Hình
  4. Tạo Webhook trên SePay và dán đường dẫn Webhook của cửa hàng
  5. Thử nghiệm thanh toán quét mã QR tại quầy POS
  kèm nút bấm mở link trang chủ SePay và nút sao chép nhanh Webhook URL.

---

### Requirement: REQ-VIETQR-CHECKOUT-01 Sinh Mã VietQR Động Chuẩn Napas 247 Tại Quầy POS
Khi thu ngân hoặc chủ cửa hàng chọn phương thức thanh toán "Chuyển khoản" tại quầy POS, hệ thống **MUST** hiển thị Modal Thanh toán VietQR chứa mã QR động chuẩn Napas 247 với cú pháp nội dung chuyển khoản chứa tiền tố phân lập theo Tenant (`<TENANT_PREFIX>_<ORDER_CODE>`) và số tiền chính xác cần thanh toán (`FinalAmount`).

#### Scenario: Khách hàng thanh toán đơn hàng bằng chuyển khoản quét mã VietQR
- **GIVEN** Quầy POS đang có giỏ hàng với tổng tiền thanh toán là 250.000 VNĐ, mã hóa đơn `HD1005` tại Tenant `tenant_an_nhien_02`
- **WHEN** Thu ngân bấm chọn phương thức "Chuyển khoản"
- **THEN** Modal VietQR xuất hiện hiển thị:
  - Mã QR động chứa link QuickLink chuẩn Napas 247
  - Số tiền: `250.000 đ`
  - Số tài khoản và Tên chủ tài khoản ngân hàng của cửa hàng
  - Nội dung chuyển khoản: `AN02_HD1005`
  - Vòng xoay trạng thái: "Đang chờ khách quét mã thanh toán..."
  - Nút "Kiểm tra thanh toán ngay" và nút "Xác nhận thu tiền thủ công" (dự phòng).

---

### Requirement: REQ-WEBHOOK-SECURITY-01 Xử Lý Webhook SePay Với 6 Lớp Bảo Mật & Đối Soát 2 Chiều
Endpoint `POST /api/v1/payments/sepay-webhook` **MUST** thực hiện xác thực theo mô hình phòng thủ 6 lớp:
1. Lớp 1: Kiểm tra Header `Authorization: Apikey <key>`
2. Lớp 2: Kiểm tra Whitelist IP của SePay
3. Lớp 3 (Then chốt): Gọi ngược lại SePay API `GET /userapi/transactions/details/{id}` bằng chính API Key của Cửa hàng để đối soát xem giao dịch có thực sự tồn tại trong sổ cái ngân hàng hay không.
4. Lớp 4: So khớp số tiền thực nhận `amountIn >= order.FinalAmount` và khớp mã đơn hàng phân lập theo Tenant.
5. Lớp 5: Kiểm tra Idempotency qua `bank_transaction_id` để ngăn chặn tấn công gửi lại (Replay attack).
6. Lớp 6: Gạch nợ đơn hàng và bắn tín hiệu cập nhật thời gian thực về màn hình POS.

#### Scenario: Kẻ gian gửi request webhook ảo bằng Postman
- **GIVEN** Kẻ gian có được Webhook URL và cố tình dùng Postman gửi request giả mạo với ID giao dịch ảo `999999` và số tiền 500.000đ
- **WHEN** Endpoint `POST /api/v1/payments/sepay-webhook` tiếp nhận request
- **THEN** Backend gọi ngược sang SePay API để đối soát ID `999999`, SePay báo giao dịch không tồn tại $\rightarrow$ Backend lập tức từ chối với mã lỗi `400 Bad Request` hoặc `404 Not Found`, ghi log cảnh báo và đơn hàng KHÔNG bị gạch nợ.

#### Scenario: Webhook nhận giao dịch thật từ khách hàng
- **GIVEN** Khách hàng chuyển khoản thật 250.000đ cho đơn `AN02_HD1005`
- **WHEN** SePay bắn webhook về hệ thống
- **THEN** Backend đối soát thành công 2 chiều với SePay, số tiền khớp $\rightarrow$ Cập nhật đơn hàng thành `PAID`, lưu vết giao dịch vào `payment_transactions`, và màn hình POS tự động báo "Thanh toán thành công!".

---

### Requirement: REQ-IDEMPOTENCY-01 Chống Tấn Công Lặp Lại Giao Dịch Ngân Hàng
Hệ thống **MUST** lưu trữ duy nhất mã giao dịch ngân hàng (`bank_transaction_id`) trong bảng `payment_transactions`. Mọi yêu cầu webhook gửi lại cùng một mã giao dịch đã từng xử lý **MUST** bị bỏ qua hoặc từ chối để tránh việc một giao dịch ngân hàng được dùng để thanh toán cho nhiều đơn hàng khác nhau.

#### Scenario: Kẻ gian cố gắng dùng lại mã giao dịch ngân hàng cũ
- **GIVEN** Mã giao dịch ngân hàng `FT263068899011` đã được gạch nợ cho đơn hàng `HD1001` trước đó
- **WHEN** SePay hoặc kẻ gian gửi lại webhook mang mã giao dịch này cho đơn hàng `HD1005`
- **THEN** Hệ thống phát hiện mã giao dịch đã tồn tại trong CSDL, từ chối xử lý và không gạch nợ cho đơn hàng mới.

---

## Lịch sử
- 2026-11-01 · `pos-sales-order-backend` · +4 ~0 -0
- 2026-11-01 · `pos-order-management-debt-refinement` · +1 ~2 -0
- 2026-11-01 · `pos-return-exchange-and-preorder` · +2 ~1 -0
- 2026-11-01 · `preorder-fefo-tests-and-ux` · +2 ~0 -0
- 2026-11-02 · `pos-annhien-data-and-staff-logout` · +2 ~0 -1
- 2026-11-02 · `pos-vietqr-sepay-payment-and-settings` · +5 ~0 -0
