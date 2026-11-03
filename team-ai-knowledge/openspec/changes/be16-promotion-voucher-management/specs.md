# Specifications: Phân hệ Quản lý Khuyến mại & Voucher Backend (BE-16)

## ADDED Requirements

### Requirement: REQ-PV01: Quản lý Chương trình Khuyến mại (Promotion CRUD)
Hệ thống **MUST** cho phép Store Owner tạo, xem danh sách có phân trang/lọc, xem chi tiết và cập nhật chương trình khuyến mại trong phạm vi Tenant của mình. ID thực thể **MUST** là `Guid` khởi tạo bằng `Uuid7.NewGuid()`.

#### Scenario: Tạo mới chương trình khuyến mại hợp lệ
- **GIVEN** Store Owner đã đăng nhập thuộc Tenant "tenant-alpha"
- **WHEN** gửi yêu cầu tạo khuyến mại với `PromotionCode` = "KM-HE2026", `Type` = "ORDER_DISCOUNT", `DiscountValue` = 10, `StartDate` nhỏ hơn `EndDate`
- **THEN** hệ thống tạo mới Promotion với ID là GUIDv7, trạng thái `IsActive` = true và trả về mã HTTP 201 Created.

#### Scenario: Từ chối tạo khuyến mại khi mã bị trùng trong cùng Tenant
- **GIVEN** trong Tenant "tenant-alpha" đã tồn tại khuyến mại có mã "KM-HE2026"
- **WHEN** gửi yêu cầu tạo khuyến mại mới cũng có mã "KM-HE2026"
- **THEN** hệ thống **MUST** từ chối với mã lỗi 400 Bad Request và thông báo lỗi trùng mã.

#### Scenario: Từ chối tạo khuyến mại khi ngày bắt đầu lớn hơn hoặc bằng ngày kết thúc
- **GIVEN** Store Owner gửi payload có `StartDate` = 2026-11-01 và `EndDate` = 2026-10-01
- **WHEN** validate qua FluentValidation
- **THEN** hệ thống **MUST** trả về lỗi validation: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu".

---

### Requirement: REQ-PV02: Thiết lập Điều kiện Sản phẩm Khuyến mại (PromotionConditions $M:N$)
Hệ thống **MUST** cho phép gán danh sách sản phẩm tham gia khuyến mại với vai trò `BUY` (hàng mua trigger), `GIFT` (quà tặng 0đ), hoặc `DISCOUNT` (hàng giảm giá riêng) cùng số lượng tối thiểu `MinQty`.

#### Scenario: Gán điều kiện Mua X tặng Y thành công
- **GIVEN** chương trình khuyến mại "BUY_X_GET_Y" có ID "promo-01"
- **WHEN** gán Product A với vai trò "BUY" và `MinQty` = 3, Product B với vai trò "GIFT" và `MinQty` = 1
- **THEN** hệ thống lưu 2 bản ghi `PromotionCondition` với ID GUIDv7 liên kết đúng `PromotionId` và `ProductId`.

---

### Requirement: REQ-PV03: Đánh giá & Tính toán Chiết khấu Giỏ hàng POS (Cart Discount Evaluation)
Hệ thống **MUST** cung cấp API `POST /api/v1/promotions/evaluate-cart` để tính toán số tiền giảm giá và quà tặng tự động cho giỏ hàng bán lẻ.
- Nếu giảm theo %: Chiết khấu = `SubTotal * (DiscountValue / 100)`. Nếu có `MaxDiscountAmount`, chiết khấu **MUST** bị chặn trần không vượt quá `MaxDiscountAmount`.
- Tổng chiết khấu không bao giờ được vượt quá tổng tiền giỏ hàng (`FinalAmount >= 0`).

#### Scenario: Tính toán chiết khấu % có chặn trần tối đa
- **GIVEN** khuyến mại giảm 20% cho đơn từ 200.000đ, mức giảm tối đa (`MaxDiscountAmount`) là 50.000đ
- **WHEN** giỏ hàng có tổng tiền là 500.000đ (20% = 100.000đ)
- **THEN** hệ thống **MUST** tính toán số tiền giảm là 50.000đ (do bị chặn trần 50.000đ).

#### Scenario: Giỏ hàng chưa đạt giá trị đơn hàng tối thiểu
- **GIVEN** khuyến mại yêu cầu `MinOrderValue` = 300.000đ
- **WHEN** giỏ hàng chỉ có tổng tiền là 150.000đ
- **THEN** hệ thống trả về số tiền chiết khấu = 0đ và danh sách quà tặng rỗng.

---

### Requirement: REQ-PV04: Quản lý Đợt Voucher & Sinh mã Tự động Hàng loạt (Batch Voucher Generation)
Hệ thống **MUST** cho phép tạo đợt voucher và tự động sinh danh sách mã voucher ngẫu nhiên theo số lượng chỉ định (`totalQuantity`) và tiền tố (`prefix`).

#### Scenario: Sinh 50 mã voucher hàng loạt thành công
- **GIVEN** đợt voucher có ID "batch-01", `prefix` = "VIP50K", `totalQuantity` = 50
- **WHEN** gọi API sinh mã `POST /api/v1/vouchers/batch-01/generate-codes`
- **THEN** hệ thống sinh đúng 50 bản ghi `VoucherCode` duy nhất, trạng thái `UNUSED`, liên kết `PromotionId` = "batch-01", ID mỗi mã là GUIDv7.

---

### Requirement: REQ-PV05: Thẩm định & Sử dụng Mã Voucher tại Quầy POS (Validate & Redeem Voucher)
Hệ thống **MUST** cung cấp API kiểm tra tính hợp lệ của mã voucher (`POST /api/v1/vouchers/validate`) và đánh dấu sử dụng (`POST /api/v1/vouchers/redeem`).

#### Scenario: Xác thực mã voucher hợp lệ tại quầy POS
- **GIVEN** mã voucher "VIP50K-ABC123" tồn tại, trạng thái `UNUSED`, hạn sử dụng đến 2026-12-31, `MinOrderValue` = 100.000đ, giảm 50.000đ
- **WHEN** thu ngân nhập mã với giỏ hàng có tổng tiền 200.000đ
- **THEN** hệ thống trả về kết quả: `IsValid = true`, `DiscountAmount = 50000`, `Message = "Áp dụng voucher thành công"`.

#### Scenario: Từ chối mã voucher đã qua sử dụng
- **GIVEN** mã voucher "VIP50K-ABC123" có trạng thái `USED`
- **WHEN** thu ngân thử áp dụng mã
- **THEN** hệ thống trả về `IsValid = false`, `DiscountAmount = 0`, lỗi "Mã voucher này đã được sử dụng".

#### Scenario: Đổi trạng thái mã sang USED khi hoàn tất đơn hàng
- **GIVEN** mã voucher "VIP50K-ABC123" đang ở trạng thái `UNUSED`
- **WHEN** thu ngân hoàn tất hóa đơn "HD-00123" và gọi `redeem`
- **THEN** hệ thống cập nhật `Status = 'USED'`, `OrderCode = 'HD-00123'`, `UsedAt = DateTime.UtcNow`.

---

### Requirement: REQ-PV06: Cô lập Đa người thuê & Chuẩn hóa Khóa chính UUIDv7
Hệ thống **MUST** đảm bảo toàn bộ dữ liệu Khuyến mại, Điều kiện và Mã Voucher thuộc Tenant này tuyệt đối không thể bị truy vấn hoặc sửa đổi bởi Tenant khác.
- Mọi ID thực thể (`Promotion`, `PromotionCondition`, `VoucherCode`) **MUST** sử dụng `Guid` tạo bằng `Uuid7.NewGuid()`.

#### Scenario: Ngăn chặn Tenant B truy cập mã Voucher của Tenant A
- **GIVEN** mã voucher "PROMO-99" thuộc về Tenant "tenant-A"
- **WHEN** một yêu cầu từ Tenant "tenant-B" kiểm tra hoặc đổi mã "PROMO-99"
- **THEN** hệ thống trả về lỗi 404 Not Found hoặc thông báo mã không tồn tại.

---

## Acceptance Checklist
- [ ] 1. Entity `Promotion` đầy đủ các trường 3NF và ID là GUIDv7.
- [ ] 2. Entity `PromotionCondition` thể hiện quan hệ $M:N$ `eligible_for` với `ProductRole` và `MinQty`.
- [ ] 3. Entity `VoucherCode` quản lý trạng thái từng mã phát hành (`UNUSED`, `USED`, `EXPIRED`).
- [ ] 4. `PromotionRepository` triển khai đầy đủ các query phân trang, lọc và quan hệ.
- [ ] 5. `PromotionService` tính toán chính xác chiết khấu đơn, chặn trần max discount, mua X tặng Y, sinh mã và thẩm định mã.
- [ ] 6. Controllers `PromotionsController` và `VouchersController` expose REST APIs chuẩn.
- [ ] 7. 100% Unit Tests viết mới đạt PASS.
