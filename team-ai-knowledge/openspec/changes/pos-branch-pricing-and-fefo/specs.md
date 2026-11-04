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
