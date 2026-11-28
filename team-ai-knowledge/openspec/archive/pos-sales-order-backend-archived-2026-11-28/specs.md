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

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: pos-annhien-data-and-staff-logout -->
# Đặc Tả Kỹ Thuật (Specs): pos-annhien-data-and-staff-logout

## ADDED Requirements

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

## REMOVED Requirements

### Requirement: REQ-BANNER-01 Loại Bỏ Banner Cảnh Báo Phân Lập Kho Rỗng
Hệ thống Frontend MUST loại bỏ hoàn toàn khối banner màu xanh cảnh báo "🏪 Cửa hàng của bạn: Dữ liệu phân lập an toàn (Multi-tenant). Kho hàng của tiệm này chưa có sản phẩm nào..." khỏi giao diện `PosCheckoutPage`.

#### Scenario: Không hiển thị banner kho rỗng
- **GIVEN** Người dùng mở giao diện POS Checkout
- **THEN** Không có bất kỳ khối banner thông báo cảnh báo kho rỗng màu xanh nào ở đầu trang.

---

## Acceptance Checklist
- [ ] `posOrderApi.getAllProducts` phân giải đúng mảng dữ liệu từ `res.data?.data?.items` hoặc `res.data?.data`.
- [ ] Đăng nhập `0917778888` / `123456` hoặc `0918889999` / `123456` hiển thị đầy đủ 5 sản phẩm của An Nhiên Mart.
- [ ] Xóa bỏ 100% dòng banner thông báo kho hàng chưa có sản phẩm.
- [ ] Bấm nút "Thao tác" tại POS có mục "Đăng xuất tài khoản", bấm vào đăng xuất thành công.
- [ ] Build Frontend `npm run build` đạt 0 lỗi.


<!-- Sáp nhập từ change: pos-branch-pricing-and-fefo -->
# Specification: pos-branch-pricing-and-fefo (Delta Specs)

## Capability Summary
Cung cấp cơ chế định giá bán chi nhánh (`BranchProduct`), định giá theo đơn vị tính quy đổi (`BranchProductUnitPrice`), và khấu trừ tồn kho thực tế (`BranchStocks`) theo nguyên tắc FEFO khi thanh toán đơn hàng tại quầy thu ngân POS. Hỗ trợ dropdown chọn đơn vị tính trên giao diện POS và nạp dữ liệu kiểm thử thực tế cho cửa hàng An Nhiên.

---

## ADDED Requirements

### Requirement: REQ-POS-09 Branch Product Selling Price Resolution
Hệ thống **MUST** ưu tiên lấy đơn giá bán lẻ từ cấu hình chi nhánh `BranchProducts.SellingPriceOverride`. Nếu chi nhánh không cấu hình override (giá trị `NULL`), hệ thống **SHALL** tự động kế thừa đơn giá niêm yết từ `Products.SellingPrice`.

#### Scenario: Bán sản phẩm có giá override tại chi nhánh
**GIVEN** Sản phẩm "Bia Hà Nội Sleek" có `Products.SellingPrice = 14.000 đ`  
**AND** Chi nhánh Ba Đình cấu hình `BranchProducts.SellingPriceOverride = 13.500 đ`  
**WHEN** Thu ngân thêm sản phẩm vào đơn hàng tại Chi nhánh Ba Đình với đơn vị cơ bản  
**THEN** Đơn giá được áp dụng trên dòng đơn hàng là `13.500 đ`  

#### Scenario: Bán sản phẩm không có giá override tại chi nhánh
**GIVEN** Sản phẩm "Muối chấm Hảo Hảo" có `Products.SellingPrice = 16.000 đ`  
**AND** Chi nhánh Ba Đình có `BranchProducts.SellingPriceOverride = NULL`  
**WHEN** Thu ngân thêm sản phẩm vào đơn hàng tại Chi nhánh Ba Đình  
**THEN** Đơn giá được áp dụng trên dòng đơn hàng là `16.000 đ`  

---

### Requirement: REQ-POS-10 Multi-Unit Pricing and Conversion in POS Order
Khi khách hàng mua sản phẩm theo đơn vị quy đổi (ví dụ: Lốc, Thùng), hệ thống **MUST** áp dụng đơn giá theo thứ tự ưu tiên:
1. `BranchProductUnitPrices.SellingPriceOverride` của chi nhánh (nếu có và $> 0$).
2. `ProductUnits.Price` cấu hình sẵn trên đơn vị tính Master.
3. `(BranchProduct.SellingPriceOverride ?? Product.SellingPrice) * ProductUnit.ConversionRate`.

#### Scenario: Bán sản phẩm theo đơn vị Thùng có giá override riêng tại chi nhánh
**GIVEN** Sản phẩm "Bia Hà Nội Sleek" có ĐVT quy đổi là "Thùng" (`ConversionRate = 24`)  
**AND** Chi nhánh Ba Đình cấu hình `BranchProductUnitPrices.SellingPriceOverride = 320.000 đ` cho đơn vị Thùng  
**WHEN** Thu ngân chọn đơn vị tính "Thùng" với số lượng `2`  
**THEN** Đơn giá dòng hàng là `320.000 đ`  
**AND** Thành tiền trước chiết khấu là `640.000 đ`  

---

### Requirement: REQ-POS-11 FEFO Inventory Deduction with Unit Conversion
Khi đơn hàng được xác nhận thanh toán thành công, hệ thống **MUST** quy đổi số lượng bán sang đơn vị cơ sở (`BaseQty = Quantity * ConversionRate`) và khấu trừ tồn kho trong bảng `BranchStocks` theo nguyên tắc FEFO (`ExpiryDate ASC`).

#### Scenario: Trừ tồn kho FEFO gối đầu qua nhiều lô khi bán đơn vị Thùng
**GIVEN** Sản phẩm "Bia Hà Nội Sleek" có 2 lô tại chi nhánh:  
  - Lô A: HSD 2026-11-20, tồn kho `10` lon  
  - Lô B: HSD 2026-12-20, tồn kho `50` lon  
**WHEN** Thu ngân bán `1` Thùng (tương đương `24` lon)  
**THEN** Hệ thống trừ toàn bộ `10` lon của Lô A (tồn kho Lô A về `0`)  
**AND** Hệ thống trừ tiếp `14` lon của Lô B (tồn kho Lô B còn `36`)  
**AND** Thông tin đơn hàng được lưu đầy đủ vào `Orders` và `OrderDetails`  

#### Scenario: Bán vượt quá tổng tồn kho quy đổi của tất cả các lô
**GIVEN** Sản phẩm "Cà phê G7 3in1" chỉ còn tồn tổng cộng `30` hộp rải rác các lô tại chi nhánh  
**WHEN** Thu ngân cố gắng bán `2` Thùng (tương đương `48` hộp)  
**THEN** Hệ thống chặn giao dịch và báo lỗi: "Sản phẩm 'Cà phê hòa tan G7 3in1' không đủ tồn kho tại chi nhánh (Hiện còn: 30, Cần bán: 48)."  
**AND** Không có bản ghi nào bị thay đổi trong CSDL  

---

### Requirement: REQ-POS-12 POS UI Multi-Unit Selector Dropdown in Cart
Giao diện giỏ hàng POS (`PosCartTable`) **MUST** cung cấp dropdown chọn đơn vị tính tại cột "ĐVT" cho các sản phẩm có từ 2 đơn vị tính trở lên. Khi người dùng chọn đơn vị mới, hệ thống **SHALL** tự động cập nhật đơn giá `unitPrice`, đơn giá thực tế `actualPrice` và thành tiền `totalAmount` của dòng hàng đó tức thời.

#### Scenario: Thu ngân đổi đơn vị tính trên giỏ hàng POS
**GIVEN** Sản phẩm "Muối chấm Hảo Hảo" đang có trong giỏ hàng với ĐVT "Hũ" và đơn giá `16.000 đ`  
**WHEN** Thu ngân bấm vào dropdown ĐVT và chọn "Lốc (x6 hũ)"  
**THEN** Đơn vị dòng hàng chuyển thành "Lốc"  
**AND** Đơn giá dòng hàng tự động đổi sang `90.000 đ`  
**AND** Thành tiền và tổng thanh toán của giỏ hàng tự động tính lại theo đơn giá mới  

---

### Requirement: REQ-POS-13 Seed Data for An Nhien Store with 4 Sample Products
Hệ thống **MUST** cung cấp script seed dữ liệu hoàn chỉnh cho cửa hàng An Nhiên (`tenant_an_nhien_02`, Chi nhánh Ba Đình `b1000000-0000-0000-0000-000000000001`) bao gồm 4 sản phẩm thực tế:
1. Cà phê hòa tan G7 3in1 (Barcode: `8935024122310`)
2. Bánh Orion Choco-Pie truyền thống (Barcode: `8936036020380`)
3. Muối chấm Hảo Hảo tôm chua cay (Barcode: `8934563065249`)
4. Bia Hà Nội Sleek (Barcode: `8936000440824`)  
Mỗi sản phẩm phải có đầy đủ:
- Bản ghi `Products` chuẩn mã vạch và thông tin quy cách.
- Bản ghi `ProductUnits` với các đơn vị quy đổi (Hộp, Lốc, Thùng).
- Bản ghi `BranchProducts` gán vào chi nhánh với giá override.
- Bản ghi `BranchProductUnitPrices` cho từng đơn vị quy đổi.
- Bản ghi `BranchStocks` với ít nhất 2 lô hàng có hạn sử dụng khác nhau để kiểm thử FEFO.

---

## Acceptance Checklist
- [ ] Gửi request `POST /api/orders` với `UnitId` của Thùng hoặc Lốc, server trừ đúng số lượng cơ sở `Quantity * ConversionRate` trên `BranchStocks`.
- [ ] Bán hết lô cận date trước mới trừ sang lô tiếp theo (FEFO).
- [ ] Giao diện POS `PosCartTable` hiển thị dropdown ĐVT mượt mà, đổi ĐVT tự nhảy đúng giá.
- [ ] Toàn bộ 6 kịch bản Unit Tests trong `PosOrderServiceTests` đều PASS.
- [ ] Đăng nhập tài khoản Trần Quốc An (`0918889999`) quét thử mã vạch 4 sản phẩm nhận diện ngay lập tức.


<!-- Sáp nhập từ change: pos-customer-api-route-and-field-mapping-fix -->
# Specification: pos-customer-api-route-and-field-mapping-fix

## Capability Summary
Đảm bảo POS nạp đúng 100% dữ liệu khách hàng thực tế từ PostgreSQL cho từng Tenant, sửa lỗi 404 route và lỗi ánh xạ trường dữ liệu giữa Backend và Frontend.

## Architecture Map
- **Backend API**:
  - `CustomersController.cs` (`src/MT_GRMS.Api/Controllers/CustomersController.cs`)
  - `CustomerDebtController.cs` (`src/MT_GRMS.Api/Controllers/CustomerDebtController.cs`)
- **Frontend POS**:
  - `posOrderApi.ts` (`src/features/pos/api/posOrderApi.ts`)
  - `PosCheckoutPage.tsx` (`src/features/pos/pages/PosCheckoutPage.tsx`)

---

## MODIFIED Requirements

### Requirement: REQ-CUST-ROUTE-01 Định tuyến API Khách hàng (Dual Routing)
1. `CustomersController` **MUST** hỗ trợ cả hai route: `[Route("api/[controller]")]` và `[Route("api/v1/[controller]")]`.
2. `CustomerDebtController` **MUST** hỗ trợ cả hai route: `[Route("api/customers/debt")]` và `[Route("api/v1/customers/debt")]`.
3. Request gửi tới `GET /api/v1/customers` với header `X-Tenant-Id` **MUST** trả về danh sách khách hàng thuộc tenant đó từ CSDL PostgreSQL (HTTP 200 OK).

#### Scenario: Gọi API lấy danh sách khách hàng qua route v1
- **GIVEN** Tenant `tenant_an_nhien_02` có 3 khách hàng trong PostgreSQL (gồm khách hàng `KH26110509554270` - Sơn)
- **WHEN** Frontend POS gửi request `GET /api/v1/customers` kèm header tenant
- **THEN** Backend trả về HTTP 200 OK với danh sách 3 khách hàng và không trả về lỗi 404 Not Found.

---

### Requirement: REQ-CUST-MAP-02 Ánh xạ dữ liệu khách hàng Frontend POS
1. Hàm `posOrderApi.getAllCustomers()` **MUST** ánh xạ chính xác các trường dữ liệu từ DTO backend:
   - `name: c.fullName || c.name || ''`
   - `phone: c.phoneNumber || c.phone || ''`
   - `code: c.customerCode || c.code || ''`
   - `loyaltyPoints: c.loyaltyPoints ?? c.rewardPoints ?? 0`
   - `currentDebt: c.currentDebtAR ?? c.currentDebt ?? c.totalDebt ?? 0`
2. `PosCheckoutPage` **MUST** cập nhật danh sách `customers` state bằng dữ liệu nhận được từ API backend, và chỉ dùng mock data khi API thực sự không có kết nối.

#### Scenario: Tìm kiếm khách hàng mới tạo trong POS
- **GIVEN** Khách hàng "Sơn" (Mã `KH26110509554270`, SĐT `0961934104`) vừa được tạo trong CSDL
- **WHEN** Thu ngân mở màn hình POS hoặc gõ "Sơn" / "0961934104"
- **THEN** Dropdown hiển thị khách hàng "Sơn" với mã `KH26110509554270`
- **AND** Không bị rơi vào dữ liệu mock mặc định.


<!-- Sáp nhập từ change: pos-debt-checkout-and-multi-lot-fefo -->
# Specification Delta: POS Debt Checkout, Print Decoupling & Multi-Lot FEFO

## Capability: pos-sales-order

## MODIFIED Requirements

### Requirement: REQ-POS-DEBT-01 Thanh toán ghi nợ khách hàng (Credit Sale)
Hệ thống **MUST** cho phép nhân viên bán hàng POS hoàn tất đơn hàng với phương thức thanh toán `CREDIT` (Bán nợ) đối với khách hàng đã được cấu hình cho phép ghi nợ (`AllowDebt = true`) và số tiền nợ còn nằm trong hạn mức (`DebtLimit`).
Hệ thống **MUST** đồng bộ các thuộc tính công nợ của thực thể `Customer` xuống bảng cơ sở dữ liệu `Customers`, bao gồm cột `LastRepaymentAtUtc`, `Notes` và `RowVersion`. Khi đơn hàng nợ tạo thành công, hệ thống **MUST** cập nhật tăng `TotalDebt` của khách hàng và tự động tạo bản ghi trong bảng `CustomerDebtInvoices` và `CustomerDebtEntries`.

#### Scenario: Thanh toán bán nợ thành công cho khách hàng có hạn mức
- **GIVEN** Khách hàng Bác Minh (`KH-AN-001`) thuộc tenant `tenant_an_nhien_02` có `AllowDebt = true`, `DebtLimit = 5,000,000 VND`, và dư nợ hiện tại `TotalDebt = 0 VND`.
- **WHEN** Nhân viên POS tạo đơn hàng tổng trị giá `58,000 VND` và chọn phương thức thanh toán `CREDIT`.
- **THEN** Hệ thống **MUST** tạo đơn hàng trạng thái `Completed`, không ném lỗi missing column `LastRepaymentAtUtc`.
- **AND** Hệ thống **MUST** tăng `TotalDebt` của khách hàng lên `58,000 VND`.
- **AND** Hệ thống **MUST** tạo bản ghi hóa đơn nợ trong `CustomerDebtInvoices` với số tiền nợ bằng `58,000 VND`.

#### Scenario: Từ chối thanh toán bán nợ khi vượt quá hạn mức nợ cho phép
- **GIVEN** Khách hàng có `AllowDebt = true`, `DebtLimit = 1,000,000 VND`, và dư nợ hiện tại `TotalDebt = 950,000 VND`.
- **WHEN** Nhân viên POS tạo đơn hàng bán nợ trị giá `100,000 VND`.
- **THEN** Hệ thống **MUST** từ chối đơn hàng và trả về thông báo lỗi vi phạm hạn mức nợ.

---

### Requirement: REQ-POS-PRINT-02 Độc lập giữa tạo đơn hàng và in hóa đơn (Print Decoupling)
Hệ thống POS Frontend **MUST** thực hiện lưu đơn hàng thành công trên máy chủ trước khi gửi lệnh in hóa đơn.
Nếu quá trình in hóa đơn thất bại, máy in ngoại vi mất kết nối, hoặc nhân viên không in bill, hệ thống **MUST** giữ nguyên trạng thái đơn hàng đã hoàn tất thành công trong CSDL, không được hủy hoặc rollback đơn hàng.

#### Scenario: Hoàn tất đơn hàng thành công khi không có máy in hoặc máy in lỗi
- **GIVEN** Giỏ hàng POS có sản phẩm hợp lệ và khách hàng thanh toán thành công (tiền mặt/chuyển khoản/nợ).
- **WHEN** Lệnh in hóa đơn `posOrderApi.printDirect` bị lỗi hoặc người dùng đóng trình duyệt trước khi in.
- **THEN** Đơn hàng tại máy chủ **MUST** vẫn ở trạng thái `Completed`.
- **AND** Tồn kho và sổ quỹ / công nợ **MUST** được ghi nhận đầy đủ, không bị ảnh hưởng bởi tiến trình in hóa đơn.

---

### Requirement: REQ-POS-FEFO-03 Khấu trừ tồn kho tự động theo hạn dùng FEFO vắt qua nhiều lô (Multi-Lot FEFO)
Hệ thống **MUST** tự động trừ tồn kho theo nguyên tắc Hạn dùng trước - Xuất trước (First Expired, First Out - FEFO).
Khi số lượng sản phẩm khách mua lớn hơn số lượng tồn của lô hàng có hạn dùng gần nhất, hệ thống **MUST** khấu trừ hết toàn bộ số lượng của lô gần nhất (về 0), sau đó tiếp tục khấu trừ số lượng còn lại vào lô kế tiếp theo thứ tự hạn dùng tăng dần (`ExpiryDate ASC`).

#### Scenario: Bán 40 sản phẩm cấn trừ liên hoàn qua Lô A (tồn 20) và Lô B (tồn 30)
- **GIVEN** Sản phẩm X tại chi nhánh có 2 lô hàng còn hạn dùng:
  - Lô A: hạn dùng `2026-12-01`, số lượng tồn `QuantityOnHand = 20`.
  - Lô B: hạn dùng `2027-06-01`, số lượng tồn `QuantityOnHand = 30`.
- **WHEN** Khách hàng mua `40` sản phẩm X tại quầy POS.
- **THEN** Hệ thống **MUST** khấu trừ `20` sản phẩm từ Lô A, đưa tồn kho Lô A về `0`.
- **AND** Hệ thống **MUST** khấu trừ tiếp `20` sản phẩm từ Lô B, đưa tồn kho Lô B về `10`.
- **AND** Hệ thống **MUST** tạo 2 bản ghi giao dịch kho `StockTransaction` tương ứng cho cả 2 lô với tổng số lượng xuất là `40`.


<!-- Sáp nhập từ change: pos-debt-validation-and-receipt-hotline-fix -->
# Specification: pos-debt-validation-and-receipt-hotline-fix

## Capability Summary
Đặc tả chi tiết việc sửa lỗi và chuẩn hóa các luồng nghiệp vụ liên quan đến Modal Thu Nợ, Tìm kiếm khách hàng đa tiêu chí ở POS và Chuẩn hóa nội dung hóa đơn bán lẻ (giao diện web và máy in nhiệt POS-58).

## Architecture Map
- **Frontend Components**:
  - `CollectDebtModal.tsx` (`src/features/pos/components/modals/CollectDebtModal.tsx`)
  - `InvoiceManagementPage.tsx` (`src/features/pos/pages/InvoiceManagementPage.tsx`)
  - `PosPaymentPanel.tsx` (`src/features/pos/components/PosPaymentPanel.tsx`)
  - `PosReceiptModal.tsx` (`src/features/pos/components/PosReceiptModal.tsx`)
  - `PosCheckoutPage.tsx` (`src/features/pos/pages/PosCheckoutPage.tsx`)
- **Backend Services**:
  - `ThermalPrintService.cs` (`MT_GRMS.Infrastructure/Services/Printer/ThermalPrintService.cs`)

---

## MODIFIED Requirements

### Requirement: REQ-POS-DEBT-01 Modal thu nợ và quản lý trạng thái nợ hóa đơn
1. Hệ thống **MUST** xác định hóa đơn có nợ chỉ khi `remainingDebt > 0` (hoặc `debtAmount > 0`). Các hóa đơn đã tất toán nợ đủ (`paidDebtAmount >= totalAmount` hoặc `debtAmount <= 0`) **MUST NOT** hiển thị nút "Thu nợ", và trạng thái **MUST** hiển thị là "Hoàn thành" (hoặc "Đã tất toán nợ").
2. Tại `CollectDebtModal`, thẻ nhập số tiền `<input type="number">` **MUST NOT** có thuộc tính `min` lớn hơn `max`. Khi `remainingDebt <= 0`, ô nhập **MUST** được vô hiệu hóa (`disabled`) và hệ thống **MUST** hiển thị thông báo rõ ràng: *"Hóa đơn này đã được tất toán toàn bộ nợ, không còn khoản nợ cần thu."*.

#### Scenario: Mở modal thu nợ cho đơn hàng đã trả hết nợ
- **GIVEN** Một hóa đơn có tổng tiền `220.000 đ`, đã trả trước đó `220.000 đ` và `remainingDebt = 0 đ`
- **WHEN** Người dùng xem chi tiết hoặc mở modal thu nợ của hóa đơn này
- **THEN** Trình duyệt không xuất hiện lỗi *"Minimum value (1000) must be less than the maximum value (0)."*
- **AND** Nút submit hiển thị trạng thái đã tất toán và không cho phép submit số tiền nợ $\le 0$.

---

### Requirement: REQ-POS-CUST-02 Tìm kiếm khách hàng đa tiêu chí tại POS
1. Ô tìm kiếm khách hàng tại `PosPaymentPanel` **SHALL** cho phép nhập cả chữ cái và số tự do, không được xóa trắng ký tự chữ cái của người dùng.
2. Hệ thống **MUST** hỗ trợ tìm kiếm khách hàng theo:
   - **Tên khách hàng**: Hỗ trợ tìm kiếm không phân biệt chữ hoa/thường và không phân biệt tiếng Việt có dấu/không dấu (ví dụ: gõ "Son" hoặc "Sơn" đều tìm thấy khách hàng "Sơn").
   - **Số điện thoại**: Tìm kiếm theo chuỗi số (ví dụ: gõ "0961" hoặc "0961934104").
   - **Mã khách hàng**: Tìm kiếm theo mã (ví dụ: "KH2611...").
3. Khi khách hàng được tạo mới qua `AddCustomerModal`, khách hàng mới **MUST** ngay lập tức có mặt trong danh sách tìm kiếm của màn hình POS.

#### Scenario: Thu ngân tìm kiếm khách hàng bằng tên tiếng Việt
- **GIVEN** Trong CSDL có khách hàng tên "Sơn" với số điện thoại "0961934104"
- **WHEN** Thu ngân nhập "Sơn" hoặc "son" vào ô tìm kiếm khách hàng ở quầy POS
- **THEN** Danh sách gợi ý hiển thị khách hàng "Sơn" cùng số điện thoại và điểm tích lũy
- **AND** Thu ngân có thể bấm Enter hoặc click để chọn khách hàng đó vào đơn hàng.

---

### Requirement: REQ-POS-PRINT-03 Chuẩn hóa hóa đơn bán lẻ
1. Hóa đơn bán lẻ (cả bản xem trước `PosReceiptModal` lẫn bản in nhiệt `ThermalPrintService`) **MUST NOT** chứa 2 dòng khuyến cáo:
   - *"Quý khách vui lòng kiểm tra kỹ hóa đơn & hàng hóa trước khi rời quầy."*
   - *"[Hóa đơn khởi tạo từ máy tính tiền MT-GRMS]"* (hoặc *"Doi tra trong 24h kem hoa don."*).
2. Chân hóa đơn **MUST** chỉ hiển thị lời cảm ơn: *"CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!"*.
3. Bảng hàng hóa trên hóa đơn bán lẻ **MUST NOT** hiển thị mã lô nội bộ `(LÔ-FEFO)`.
4. Hàng tổng kết chân bảng hàng hóa **MUST** căn thẳng hàng:
   - Cột STT, Hàng hóa, S.Lg, Đơn giá, Thành tiền.
   - Chân bảng: `Tổng cộng:` (cột 1-2) | `<Tổng số lượng>` (cột S.Lg) | | `<Tổng tiền hàng>` (cột Thành tiền).

#### Scenario: In hóa đơn bán lẻ cho khách hàng
- **GIVEN** Một đơn hàng gồm 3 mặt hàng có tổng số lượng 7 sản phẩm và tổng tiền hàng 723.000 đ
- **WHEN** Thu ngân hoàn tất thanh toán và in hóa đơn
- **THEN** Bản in không chứa dòng khuyến cáo thừa hay mã lô kho `(LÔ-FEFO)`
- **AND** Dòng tổng kết chân bảng hiển thị rõ ràng tổng số lượng `7` và tổng tiền hàng `723.000 đ` thẳng cột
- **AND** Chân hóa đơn chỉ có duy nhất lời cảm ơn *"CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!"*.

---

### Requirement: REQ-POS-HOTLINE-04 Hotline và số điện thoại chi nhánh
1. Hotline và số điện thoại in trên hóa đơn **MUST** phản ánh chính xác số điện thoại của chi nhánh đang hoạt động (`activeBranch.phone`) hoặc hotline của tenant (`user.tenantHotline`).
2. Nếu chi nhánh có số điện thoại, hóa đơn **MUST** hiển thị `Hotline: <Số điện thoại chi nhánh>`.

#### Scenario: Hiển thị hotline chi nhánh An Nhiên Mart
- **GIVEN** Thu ngân đang đăng nhập tại chi nhánh "An Nhiên Mart - Chi nhánh Ba Đình" có số điện thoại "024 3822 9988"
- **WHEN** Hóa đơn bán lẻ được khởi tạo và hiển thị
- **THEN** Phần đầu hóa đơn hiển thị đúng số điện thoại/hotline "024 3822 9988".


<!-- Sáp nhập từ change: pos-lookup-branch-scoping-and-loyalty-rules -->
# Specifications (Delta): Tối Ưu Header POS, Phân Quyền Chi Nhánh Tra Cứu Tồn Kho & Tiêu Điểm FE-16

## MODIFIED Requirements

### Requirement: REQ-02 Phân Quyền Điều Chỉnh Chi Nhánh Tại POS & Màn Hình Tra Cứu Tồn Kho
1. Thanh điều hướng bán hàng POS (`PosHeader.tsx`) MUST loại bỏ nút "Tra cứu Lô FEFO".
2. Màn hình Tra Cứu Tồn Kho & Lô FEFO (`InventoryLookupPage.tsx`) MUST phân quyền hiển thị chi nhánh làm việc theo vai trò:
   - Vai trò `STORE_OWNER`: SHALL có thể chọn và chuyển đổi linh hoạt giữa các chi nhánh qua dropdown menu để xem tồn kho từng điểm bán.
   - Vai trò `EMPLOYEE`: MUST bị khóa cố định ở chi nhánh đã được phân công, hiển thị dưới dạng badge chỉ đọc (read-only) và không thể chuyển sang chi nhánh khác.

#### Scenario: STORE_OWNER chuyển đổi chi nhánh trên trang Tra Cứu Tồn Kho
- **GIVEN** Người dùng đăng nhập với vai trò `STORE_OWNER`
- **WHEN** Người dùng truy cập trang Tra Cứu Tồn Kho (`/pos/inventory` hoặc `/employee/pos/inventory`)
- **THEN** Header màn hình hiển thị Dropdown lựa chọn chi nhánh (Ba Đình, Cầu Giấy, Đống Đa)
- **AND WHEN** Chủ tiệm chọn chuyển sang "An Nhiên Mart - Chi nhánh Cầu Giấy"
- **THEN** Thông tin chi nhánh hiện tại được cập nhật sang Cầu Giấy và hiển thị đúng tồn kho của chi nhánh đó.

#### Scenario: EMPLOYEE truy cập Tra Cứu Tồn Kho bị khóa cố định chi nhánh
- **GIVEN** Người dùng đăng nhập với vai trò `EMPLOYEE` (gắn với Ba Đình)
- **WHEN** Người dùng truy cập trang Tra Cứu Tồn Kho
- **THEN** Header màn hình hiển thị Badge tĩnh "An Nhiên Mart - Chi nhánh Ba Đình" kèm icon địa điểm
- **AND** Không xuất hiện dropdown chuyển chi nhánh.

---

## ADDED Requirements

### Requirement: REQ-05 Khấu Trừ Điểm Thưởng Khách Hàng Khi Tiêu Điểm (FE-16.3 Loyalty Redemption)
Khi tạo đơn hàng bán lẻ tại quầy POS (`OrderService.cs`):
1. Yêu cầu tạo đơn `OrderCreateRequest` SHALL hỗ trợ tham số tùy chọn `int? PointsRedeemed`.
2. Nếu `PointsRedeemed > 0` và đơn hàng có gắn `CustomerId`, hệ thống MUST khấu trừ số điểm tương ứng từ `Customer.RewardPoints` (không được trừ quá số điểm hiện có của khách).
3. Hệ thống MUST tiếp tục tích lũy điểm thưởng mới cho đơn hàng dựa trên số tiền thực trả `FinalAmount` (10.000đ = 1 điểm).

#### Scenario: Khách hàng sử dụng điểm tích lũy để thanh toán đơn hàng
- **GIVEN** Khách hàng có 100 điểm thưởng (`RewardPoints = 100`)
- **WHEN** Thu ngân tạo đơn hàng trị giá 200.000đ và khách sử dụng 50 điểm (`PointsRedeemed = 50`, giảm 5.000đ, FinalAmount = 195.000đ)
- **THEN** Điểm thưởng của khách hàng được khấu trừ 50 điểm (còn 50 điểm)
- **AND** Đơn hàng 195.000đ tích lũy thêm 19 điểm mới
- **THEN** Tổng điểm cuối cùng của khách hàng sau đơn là: `50 + 19 = 69 điểm`.

---

## Acceptance Checklist
- [ ] Gỡ bỏ hoàn toàn nút "Tra cứu Lô FEFO" khỏi `PosHeader.tsx`.
- [ ] `InventoryLookupPage.tsx` cho phép `STORE_OWNER` chọn chi nhánh qua dropdown.
- [ ] `InventoryLookupPage.tsx` khóa cứng chi nhánh của `EMPLOYEE` (badge tĩnh).
- [ ] `OrderCreateRequest` nhận `PointsRedeemed` và `OrderService.cs` trừ điểm thưởng chính xác.
- [ ] Bổ sung Unit Test kiểm chứng tích/tiêu điểm và chạy toàn bộ tests pass 100%.


<!-- Sáp nhập từ change: pos-order-management-debt-refinement -->
# Đặc Tả Kỹ Thuật (Specs Delta)

## MODIFIED Requirements

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

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: REQ-POS-UI-CLEANUP Tinh Gọn Giao Diện POS & Form Khách Hàng
Hệ thống SHALL loại bỏ các thành phần kiểm thử giả lập trên giao diện người dùng và tinh giản modal thêm khách hàng.

#### Scenario: Thêm khách hàng mới tại quầy POS
- **GIVEN** Thu ngân mở modal `AddCustomerModal`
- **WHEN** Thu ngân xem bảng nhập liệu khách hàng
- **THEN** Trường "Mã KH:" và "Nhóm:" không hiển thị; mã khách hàng được tự động sinh ngầm theo định dạng `KHxxxxxx`.

---

## Acceptance Checklist
- [x] Nút Về Dashboard cạnh tên quầy đã được gỡ bỏ khỏi `PosHeader`.
- [x] Khối chọn nhanh tài khoản kiểm thử đã được gỡ bỏ khỏi `LoginPage`.
- [x] Modal thêm khách hàng không còn hiển thị `Mã KH:` và `Nhóm:`.
- [x] Ghi nợ không bị giới hạn hạn mức; hiển thị số lần nợ và tổng nợ.
- [x] Đã nạp 4 hóa đơn bán lẻ và 3 đơn đặt trước từ CSDL PostgreSQL của tài khoản `0901234567`.
- [x] 162/162 Unit tests Backend và Vite Build Frontend đạt kết quả PASS 100%.


<!-- Sáp nhập từ change: pos-return-exchange-and-preorder -->
# Delta Specs: Đổi Trả Hàng, Phân Quyền Hủy Hóa Đơn & Ràng Buộc Pre-Order

## ADDED Requirements

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

## MODIFIED Requirements

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

## Acceptance Checklist
* [ ] Modal Đổi / Trả hàng hiển thị đầy đủ 3 khối: Hàng trả, Hàng đổi mới, Bù trừ chênh lệch.
* [ ] Đổi hàng bù trừ tự động cộng kho hàng trả và trừ kho hàng mới chính xác.
* [ ] Hóa đơn cũ giữ nguyên `Completed`; đơn đổi trả mới có liên kết tham chiếu rõ ràng.
* [ ] Thu ngân (`CASHIER`) bị chặn quyền hủy hóa đơn `Completed` cả ở UI và API Backend (403).
* [ ] Chủ cửa hàng (`STORE_OWNER`) hủy hóa đơn thành công kèm lý do, kho và nợ được hoàn tác.
* [ ] Đơn đặt trước bắt buộc cọc $\ge 10\%$, validate chặt chẽ ở cả Frontend và Backend.


<!-- Sáp nhập từ change: preorder-fefo-tests-and-ux -->
# Specs: Pre-Order FEFO Allocation & Smart Product Selector UX

## ADDED Requirements

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

## Acceptance Checklist
- [x] Backend Unit Test for multi-batch FEFO deduction passes.
- [x] Pre-order creation correctly calculates deposit minimum (10%).
- [x] Autocomplete search allows 1-click product addition in modal.
- [x] Inline `+` / `-` buttons function cleanly.
