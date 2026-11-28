# Specification: Quản Lý Khuyến Mãi, Voucher và Cấu Hình Tích Điểm

## ADDED Requirements

### Requirement: REQ-PROMO-01 Thiết lập và quản lý chương trình khuyến mại
The system MUST allow Store Owners to create, update, toggle status, and delete promotional campaigns with three core types: `ORDER_DISCOUNT`, `PRODUCT_DISCOUNT`, and `BUY_X_GET_Y`.
The system MUST enforce tenant isolation (`TenantId`), validate that `StartDate` is before `EndDate`, and verify that `DiscountValue` is greater than 0.

#### Scenario: Tạo thành công chương trình giảm % đơn hàng
**GIVEN** Store Owner đã đăng nhập và đang ở trang Quản lý Khuyến mại  
**WHEN** Người dùng tạo mới chương trình loại `ORDER_DISCOUNT`, giá trị giảm 10%, đơn tối thiểu 500.000 VNĐ, giảm tối đa 100.000 VNĐ  
**THEN** Hệ thống lưu chương trình vào CSDL với trạng thái `ACTIVE` và hiển thị trên bảng danh sách.

#### Scenario: Tạo chương trình Mua X tặng Y (Buy X Get Y)
**GIVEN** Store Owner muốn triển khai chương trình "Mua 2 chai Dầu Ăn Neptune 1L tặng 1 gói Hạt nêm Knorr 400g"  
**WHEN** Người dùng cấu hình điều kiện: Sản phẩm điều kiện `Dầu Ăn Neptune 1L` với `MinQty = 2` (`ProductRole = BUY`), sản phẩm tặng `Hạt nêm Knorr 400g` với `MinQty = 1` (`ProductRole = GIFT`)  
**THEN** Hệ thống lưu `Promotion` kèm 2 bản ghi `PromotionCondition` liên kết tương ứng.

---

### Requirement: REQ-PROMO-02 Thẩm định tự động giỏ hàng bán lẻ POS
The system MUST provide an evaluation endpoint (`POST /api/promotions/evaluate-cart`) that computes item-level discounts, order-level discounts, and gift items for any given cart.
The system MUST guarantee that the total calculated discount does not exceed the cart subtotal (`FinalAmount >= 0`).

#### Scenario: Quét giỏ hàng đủ điều kiện nhận quà tặng Buy X Get Y
**GIVEN** Cửa hàng có chương trình "Mua 2 Dầu ăn Neptune tặng 1 Hạt nêm"  
**WHEN** Thu ngân thêm 4 chai Dầu ăn Neptune vào giỏ hàng POS  
**THEN** Hệ thống tự động trả về danh sách quà tặng gồm 2 gói Hạt nêm Knorr với đơn giá 0đ (`IsGift = true`) và hiển thị trên giỏ hàng POS.

#### Scenario: Áp dụng giảm giá trực tiếp theo sản phẩm (PRODUCT_DISCOUNT)
**GIVEN** Có chương trình giảm 20.000đ cho sản phẩm `Nước ngọt Cocacola lốc 6 lon`  
**WHEN** Thu ngân thêm 2 lốc Cocacola vào giỏ hàng  
**THEN** Hệ thống áp dụng mức giảm 40.000đ trực tiếp vào dòng sản phẩm tương ứng.

---

### Requirement: REQ-VOUCHER-01 Quản lý đợt phát hành và sinh mã Voucher
The system MUST allow Store Owners to create voucher batches with predefined discount rules (`FIXED_AMOUNT` or `PERCENT`), validity periods, and prefix.
The system MUST generate unique voucher codes on demand, initialized with status `UNUSED`.

#### Scenario: Tạo đợt voucher và tự động sinh 100 mã
**GIVEN** Store Owner tạo đợt voucher tên "Tri ân khách hàng tháng 11", mã tiền tố `TRIAN11`, số lượng 100 mã, giảm 50.000đ cho đơn từ 300.000đ  
**WHEN** Hệ thống xử lý yêu cầu tạo đợt  
**THEN** 100 bản ghi `VoucherCode` duy nhất được tạo ra với tiền tố `TRIAN11-XXXXXX`, trạng thái `UNUSED`.

---

### Requirement: REQ-VOUCHER-02 Thẩm định và đổi mã Voucher tại quầy POS
The system MUST validate coupon codes via `POST /api/vouchers/validate` against expiration date, minimum cart value, and `UNUSED` status.
When the order is successfully paid, the system MUST mark the code as `USED`, recording `OrderId` and `UsedAt`.

#### Scenario: Áp dụng mã Voucher hợp lệ thành công
**GIVEN** Thu ngân nhập mã `TRIAN11-AB12CD` cho đơn hàng có tổng tiền 350.000 VNĐ  
**WHEN** Nhấn nút "Áp dụng" trên giao diện POS  
**THEN** Hệ thống xác nhận mã hợp lệ, trừ 50.000 VNĐ vào tổng tiền thanh toán còn 300.000 VNĐ.

#### Scenario: Mã Voucher đã qua sử dụng
**GIVEN** Mã `TRIAN11-AB12CD` đã có trạng thái `USED` từ đơn hàng trước  
**WHEN** Thu ngân nhập lại mã này  
**THEN** Hệ thống từ chối và hiển thị thông báo lỗi "Mã voucher này đã được sử dụng trước đó".

---

### Requirement: REQ-LOYALTY-01 Cấu hình hệ thống tích điểm và tiêu điểm
The system MUST allow Store Owners to view and update loyalty point rules per tenant via `GET /api/loyalty-config` and `PUT /api/loyalty-config`.
The configuration MUST include: `IsEnabled`, `EarningRateAmount` (VNĐ/point), `EarningPoints`, `RedemptionRatePoints`, `RedemptionRateAmount` (point/VNĐ), and `MinRedemptionPoints`.

#### Scenario: Cập nhật tỷ lệ tích điểm và đổi điểm của cửa hàng
**GIVEN** Store Owner muốn cấu hình quy đổi: 20.000đ doanh số = 1 điểm, và 1 điểm = 2.000đ khi tiêu  
**WHEN** Người dùng điều chỉnh biểu mẫu trên `LoyaltyConfigPage` và nhấn "Lưu cấu hình"  
**THEN** Hệ thống cập nhật bảng `LoyaltySettings` của tenant hiện tại, các giao dịch POS sau đó sẽ áp dụng theo tỷ lệ mới này.

---

### Requirement: REQ-LOYALTY-02 Tích điểm và tiêu điểm thưởng tại quầy POS
The POS checkout interface MUST display the customer's available reward points when a customer is selected.
The cashier SHALL be able to redeem customer points if the balance satisfies `MinRedemptionPoints`.
Upon order completion, the system MUST deduct redeemed points and grant new reward points calculated from `FinalAmount` based on the configured earning rate.

#### Scenario: Khách hàng tiêu 50 điểm thưởng để giảm 50.000 VNĐ
**GIVEN** Khách hàng "Nguyễn Văn A" có 100 điểm thưởng khả dụng, tỷ lệ đổi 1 điểm = 1.000 VNĐ  
**WHEN** Thu ngân chọn tiêu 50 điểm cho đơn hàng 200.000 VNĐ  
**THEN** Số tiền thanh toán giảm còn 150.000 VNĐ; sau khi thanh toán thành công, số điểm còn lại của khách hàng là 50 + số điểm tích lũy mới từ đơn hàng 150.000 VNĐ.

---

## Acceptance Checklist
- [ ] CRUD chương trình Khuyến mãi hoạt động đầy đủ trên Frontend và Backend.
- [ ] Hỗ trợ đầy đủ 3 loại khuyến mãi: `% đơn hàng`, `giảm giá sản phẩm`, `mua X tặng Y`.
- [ ] Tạo đợt voucher và sinh mã tự động hàng loạt thành công.
- [ ] Nhập mã voucher tại POS thẩm định đúng, trừ tiền và cập nhật trạng thái `USED`.
- [ ] Cấu hình tích/tiêu điểm lưu trữ bền vững trong CSDL theo Tenant.
- [ ] Quầy POS hiển thị điểm thưởng và cho phép tiêu điểm giảm trừ thanh toán.
- [ ] Backend kiểm thử `dotnet test` đạt 100% PASS.
- [ ] Frontend build `npm run build` không lỗi.
