---
capability: pos-sales-checkout
change: pos-bank-cashbook-promo-conflict-and-ui-polish
schema: bug-fix
dependencies:
  - openspec/changes/pos-bank-cashbook-promo-conflict-and-ui-polish/exploration.md
---

# Specs: pos-bank-cashbook-promo-conflict-and-ui-polish

## Capability Summary
Bản đặc tả delta cho `pos-sales-checkout` nhằm khắc phục triệt để lỗi thiếu tài khoản quỹ Ngân hàng đa tenant khi thanh toán chuyển khoản POS, chuẩn hóa tự động khấu trừ & giải quyết xung đột (Best-Offer + Multi-Tier) chương trình khuyến mãi trên giỏ hàng POS, đồng bộ giao diện Modal Lịch sử biến động giá bán (xóa nhãn kỹ thuật `FE-03`), và dọn dẹp các nút/mục điều hướng dư thừa.

## API / Contract

| Method | Path | Request | Response | Lỗi (RFC 7807 ProblemDetails) |
|---|---|---|---|---|
| `POST` | `/api/v1/pos/orders` | `CreatePosOrderRequest` (`paymentMethod: "BANK" \| "CASH" \| "CREDIT"`, `discountAmount: decimal(18,2)`, ...) | `PosOrderResponse` (`200 OK` / `201 Created`) | `400 Bad Request` (dữ liệu/tồn kho không hợp lệ), `401/403` (sai role/tenant) — **KHÔNG** còn lỗi `404 Không tìm thấy tài khoản quỹ` khi `paymentMethod = "BANK"` |
| `GET` | `/api/v1/cashbook/accounts` | Query `?branchId=<Guid?>` (lọc theo `TenantId` từ JWT) | `List<CashAccountResponse>` (`200 OK`) | `401 Unauthorized` |
| `POST` | `/api/v1/promotions/evaluate-cart` | `EvaluateCartRequest` (`items`, `subTotal: decimal(18,2)`, `couponCode?`, `branchId?`, `customerId?`) | `EvaluateCartResponse` (`totalDiscountAmount`, `finalAmount`, `appliedPromotions`, `giftItems`, `voucherResult`) | `400 Bad Request` |
| `GET` | `/api/v1/catalog/products/{id}/price-history` | Query `?branchId=<Guid?>` (lọc theo `TenantId`) | `List<ProductPriceHistoryDto>` (`200 OK`) | `401 Unauthorized`, `404 Not Found` |

---

## ADDED Requirements

### Requirement: REQ-POS-BANK-01 Tự động phân giải & khởi tạo Tài khoản Quỹ Ngân Hàng đa Tenant khi thanh toán POS không tiền mặt
Hệ thống **MUST** lọc toàn bộ truy vấn tài khoản quỹ theo `TenantId` hiện tại và tuyệt đối **MUST NOT** sử dụng khóa chính `Guid` tĩnh dùng chung giữa nhiều Tenant hoặc fallback về `DefaultBankId` của Tenant khác.
Khi đơn hàng POS thanh toán bằng phương thức không dùng tiền mặt và không phải ghi nợ (`paymentMethod` khác `"CASH"`, `"CREDIT"`, `"DEBT"`, ví dụ `"BANK"` / `"VIETQR"`) với `finalAmount > 0`, hệ thống **SHALL** tự động phân giải tài khoản `FinanceAccountType.Bank` đang hoạt động của Tenant hiện tại; nếu Tenant chưa có tài khoản `Bank` nào (kể cả khi đã có tài khoản `Till` hoặc `Safe`), hệ thống **MUST** tự động khởi tạo một bản ghi `FinanceAccount` kiểu `Bank` với `Id = Guid.NewGuid()` và gán tường minh `TenantId` hiện hành, ưu tiên kế thừa tên ngân hàng, số tài khoản, chủ tài khoản từ `StorePaymentConfig` của Tenant (nếu có), sau đó ghi nhận bút toán thu `CashbookEntryType.Receipt` (`POS_SALE`) với kiểu số tiền `decimal(18,2)` và mốc thời gian `OccurredAtUtc` theo chuẩn UTC.
Khi đơn hàng có `finalAmount == 0` (khấu trừ 100% do khuyến mãi/voucher/điểm thưởng), hệ thống **MUST** bỏ qua lệnh ghi bút toán thu tiền `ReceiveCashAsync` để không gây lỗi `INVALID_AMOUNT`.

#### Scenario: Tái hiện lỗi cũ — Thanh toán chuyển khoản POS trên Tenant thứ 2 đã mở ca (có Till, chưa có Bank)
- **GIVEN** Tenant `"tenant_an_nhien_02"` đã mở ca bán hàng (đã có 1 bản ghi `FinanceAccount` kiểu `Till`, chưa có bản ghi `FinanceAccount` kiểu `Bank` nào) và đã cấu hình `StorePaymentConfig` (`VietinBank`, STK `"102876543210"`)
- **WHEN** Thu ngân gửi `POST /api/v1/pos/orders` với `paymentMethod = "BANK"` và `finalAmount = 150000`
- **THEN** Hệ thống tự động tạo 1 tài khoản `FinanceAccount` kiểu `Bank` riêng cho `"tenant_an_nhien_02"` với `Id` mới (`Guid.NewGuid()`), ghi nhận bút toán thu `+150,000.00` VND vào tài khoản `Bank` đó, và trả về đơn hàng thành công (không ném `NotFoundException: Không tìm thấy tài khoản quỹ.`).

#### Scenario: Regression — Tenant đã có sẵn tài khoản quỹ Ngân hàng
- **GIVEN** Tenant hiện tại đã có tài khoản `FinanceAccount` kiểu `Bank` đang hoạt động với số dư `1,000,000.00` VND
- **WHEN** Thu ngân thanh toán đơn POS chuyển khoản `paymentMethod = "BANK"` trị giá `250,000.00` VND
- **THEN** Hệ thống tái sử dụng đúng tài khoản `Bank` hiện có (không tạo bản ghi trùng lặp) và cập nhật số dư lên `1,250,000.00` VND.

#### Scenario: Edge case — Đơn hàng chuyển khoản hoặc tiền mặt có số tiền cần trả bằng 0 VND
- **GIVEN** Giỏ hàng POS có tổng tiền hàng `50,000` VND và áp dụng mã giảm giá hợp lệ `-50,000` VND dẫn tới `finalAmount = 0`
- **WHEN** Thu ngân hoàn tất thanh toán đơn hàng
- **THEN** Đơn hàng được lưu trạng thái `PAID` thành công mà không gọi `ReceiveCashAsync(amount: 0)` và không phát sinh lỗi `INVALID_AMOUNT`.

---

## MODIFIED Requirements

### Requirement: REQ-POS-PROMO-02 Tự động khấu trừ Khuyến mãi Bậc thang & Giải quyết xung đột Best-Offer trên POS
Khi đánh giá giỏ hàng qua `EvaluateCartAsync` (lọc theo `TenantId`, hiệu lực thời gian UTC, chi nhánh áp dụng, `BudgetLimit` còn lại `BudgetLimit - TotalDiscountGiven` và `UsageLimit`), hệ thống **MUST** giải mã cấu hình bậc thang `[TIERS_JSON]...[/TIERS_JSON]` trong `Promotion.Description` (nếu có) của chương trình `ORDER_DISCOUNT` để xác định **bậc thang cao nhất** có `minOrderValue <= SubTotal`.
Khi có từ 2 chương trình giảm giá tiền tự động (`ORDER_DISCOUNT` / `PERCENT` / `FIXED_AMOUNT` / `PRODUCT_DISCOUNT`) trở lên cùng thỏa điều kiện tại một thời điểm, hệ thống **MUST** giải quyết xung đột theo nguyên tắc **Best-Offer (không cộng dồn)** — chỉ chọn duy nhất 1 chương trình tự động mang lại số tiền giảm thực tế lớn nhất (sau khi đã giới hạn theo ngân sách còn lại và `SubTotal`), đồng thời chỉ trả về `ItemDiscounts` nếu chương trình thắng cuộc là `PRODUCT_DISCOUNT`.
Trên giao diện POS (`PosCheckoutPage`, `PosPaymentPanel`, `OrderDiscountModal`), hệ thống **SHALL** tự động khấu trừ số tiền khuyến mãi tự động (`autoPromoDiscount`, tách biệt không tính trùng với `voucherDiscount`, tự động reset về `0` khi giỏ hàng rỗng hoặc chuyển tab hóa đơn) vào dòng `Giảm giá [KM]` và trừ trực tiếp vào `subTotalBeforePoints` / `finalAmount` gửi lên Backend khi tạo đơn. Khi thu ngân chủ động nhập chiết khấu tay toàn đơn, hệ thống **MUST** lấy mức giảm cao hơn (`Math.max(manualOrderDiscount, autoPromoDiscount)`, không cộng chồng) và hiển thị đúng số tiền khuyến mãi tự động thực tế trong `OrderDiscountModal` (thay cho giá trị giả lập `5%`). Nếu `loyaltyConfig.allowPointsWithPromotions == false` và đơn hàng đang có khuyến mãi hoặc voucher (`orderDiscountAmount > 0 || couponDiscountAmount > 0`), hệ thống **MUST** khóa tùy chọn dùng điểm tích lũy (`pointsDeduction = 0`).

#### Scenario: Tái hiện lỗi cũ — Khuyến mãi bậc thang tự động trừ tiền ngay trên dòng Giảm giá [KM]
- **GIVEN** Cửa hàng có chương trình `ORDER_DISCOUNT` đang hoạt động chứa 2 bậc thang trong `[TIERS_JSON]`: Bậc 1 từ `100,000` đ giảm `5%`, Bậc 2 từ `300,000` đ giảm `10%` (tối đa `50,000` đ), và thu ngân chưa nhập chiết khấu tay (`orderDiscountPercent = 0`)
- **WHEN** Thu ngân thêm sản phẩm vào giỏ hàng POS đạt `totalItemAmount = 350,000` đ
- **THEN** API `evaluate-cart` chọn Bậc 2 giảm `35,000` đ; trên `PosPaymentPanel` dòng `Giảm giá [KM]` tự động hiển thị `-35.000 đ` và `KHÁCH CẦN TRẢ` tự động giảm còn `315.000 đ`.

#### Scenario: Conflict Resolution — Hai chương trình giảm giá chạy song song chọn Best-Offer (không cộng dồn)
- **GIVEN** Tenant có đồng thời Chương trình A (Đơn từ `200,000` đ giảm `10%` = `20,000` đ) và Chương trình B (Đơn từ `200,000` đ giảm cố định `30,000` đ) cùng đang `Active`
- **WHEN** Giỏ hàng có `SubTotal = 200,000` đ được gửi tới `POST /api/v1/promotions/evaluate-cart`
- **THEN** Hệ thống chỉ áp dụng Chương trình B với `totalDiscountAmount = 30,000` đ (tuyệt đối không cộng dồn thành `50,000` đ) và chỉ liệt kê Chương trình B trong `appliedPromotions`.

#### Scenario: Edge case — Chặn dùng điểm thưởng đồng thời khi `allowPointsWithPromotions = false`
- **GIVEN** Cấu hình `LoyaltyConfig` của Tenant đặt `allowPointsWithPromotions = false` và khách hàng có `500` điểm tích lũy
- **WHEN** Giỏ hàng đang được hưởng khuyến mãi tự động `-20,000` đ
- **THEN** Checkbox `Dùng điểm` trên POS bị vô hiệu hóa kèm chú thích rõ lý do và `pointsDeduction` bằng `0` đ.

---

### Requirement: REQ-PROD-UI-03 Chuẩn hóa Giao diện Modal Lịch sử biến động giá bán & Gỡ bỏ nhãn kỹ thuật FE-03
Giao diện `PriceHistoryModal` **MUST** sử dụng hệ thống khung modal chuẩn của ứng dụng (`modal-overlay`, `modal-content`, header/body/footer đồng bộ với `EditStoreProductModal` và `ProductFormModal`), đảm bảo nút đóng `✕`, nút `Đóng`, huy hiệu tên chi nhánh và bảng lịch sử giá hiển thị cân đối, sắc nét, không đè chữ và không lộ viền button mặc định của trình duyệt.
Hệ thống **MUST NOT** hiển thị các mã tài liệu kỹ thuật nội bộ `(FE-03)`, `(FE-03.1)`, `(FE-03.2)` trên bất kỳ tiêu đề hay thông báo cảnh báo nào thuộc `PriceHistoryModal`, `ProductFormModal` và `EditStoreProductModal`.

#### Scenario: Mở Modal Lịch sử giá từ màn hình Chỉnh sửa sản phẩm tại chi nhánh
- **GIVEN** Người dùng mở popup `Chỉnh sửa sản phẩm tại chi nhánh` cho sản phẩm `"Gạo lứt huyết rồng An Nhiên 2kg"` tại `"An Nhiên Mart - Chi nhánh Ba Đình"`
- **WHEN** Người dùng nhấn nút `Lịch sử giá`
- **THEN** Modal hiển thị tiêu đề sạch `"Lịch sử biến động giá bán"` (không có `(FE-03.2)`), tên sản phẩm và badge chi nhánh tách dòng/khoảng cách rõ ràng không đè lên nhau, các nút `✕` và `Đóng` mang style chuẩn của hệ thống.

#### Scenario: Cảnh báo nhập giá bán thấp hơn giá vốn không còn nhãn FE-03.1
- **GIVEN** Chủ cửa hàng nhập `Giá bán` thấp hơn `Giá vốn` trên `ProductFormModal` hoặc `EditStoreProductModal`
- **WHEN** Khối cảnh báo vàng xuất hiện dưới ô nhập giá
- **THEN** Nội dung cảnh báo hiển thị sạch sẽ, chuyên nghiệp mà không chứa chuỗi `(FE-03.1)`.

---

## REMOVED Requirements

### Requirement: REQ-UI-NAV-04 Loại bỏ nút Về Dashboard dư thừa ngoài Header POS & 3 mục con thừa trên Top Nav Khuyến mãi
Trên màn hình bán hàng POS (`PosHeader`), hệ thống **MUST** gỡ bỏ nút rời `← Về Dashboard` nằm bên ngoài cạnh chip tên nhân viên, giữ duy nhất lối điều hướng về Dashboard bên trong menu `☰ Thao tác` để thanh công cụ POS gọn gàng.
Trên thanh điều hướng ngang của Chủ cửa hàng (`AppTopNav`), nhóm menu **Khuyến mãi** **MUST** gỡ bỏ 3 mục con dư thừa (`Khuyến mãi theo khung giờ`, `Phát hành mã quà tặng`, `Hạng thành viên & Chiết khấu`), chỉ giữ lại đúng 3 mục nghiệp vụ chính (`Chương trình khuyến mãi`, `Danh sách Voucher & Coupon`, `Thiết lập tích điểm`).

#### Scenario: Thu ngân / Quản lý quan sát thanh Header trên màn hình POS
- **GIVEN** Nhân viên (`CASHIER` hoặc `BRANCH_MANAGER`) đăng nhập vào màn hình bán hàng POS
- **WHEN** Thanh `PosHeader` hiển thị ở góc phải
- **THEN** Giữa chip `"Nhân viên: <Họ tên>"` và nút `"☰ Thao tác"` không còn nút `"← Về Dashboard"` nằm rời bên ngoài, nhưng khi mở `"☰ Thao tác"` vẫn có mục điều hướng về Dashboard hoạt động bình thường.

#### Scenario: Chủ cửa hàng mở thanh điều hướng phân hệ Khuyến mãi
- **GIVEN** Người dùng vai trò `STORE_OWNER` truy cập mục Khuyến mãi trên `AppTopNav`
- **WHEN** Thanh sub-navigation hiển thị danh sách tab con
- **THEN** Chỉ hiển thị 3 tab (`Chương trình khuyến mãi`, `Danh sách Voucher & Coupon`, `Thiết lập tích điểm`) và không còn xuất hiện `Khuyến mãi theo khung giờ`, `Phát hành mã quà tặng`, `Hạng thành viên & Chiết khấu`.

---

## Acceptance checklist
- [ ] **REQ-POS-BANK-01**: Thanh toán POS bằng Chuyển khoản (`BANK` / `VietQR`) tự động phân giải/khởi tạo tài khoản `FinanceAccountType.Bank` riêng cho đúng `TenantId` (dùng `Guid.NewGuid()`, đồng bộ `StorePaymentConfig` nếu có), không còn lỗi `"Không tìm thấy tài khoản quỹ."` và an toàn khi `finalAmount == 0`.
- [ ] **REQ-POS-PROMO-02**: `PromotionService.EvaluateCartAsync` đọc đầy đủ `[TIERS_JSON]` chọn bậc cao nhất, kẹp trần ngân sách còn lại và giải quyết xung đột nhiều chương trình giảm tiền theo nguyên tắc **Best-Offer**; giao diện POS tự động trừ tiền khuyến mãi vào dòng `Giảm giá [KM]`, cập nhật `OrderDiscountModal` theo số thực tế và tuân thủ `allowPointsWithPromotions`.
- [ ] **REQ-PROD-UI-03**: `PriceHistoryModal` được chuẩn hóa giao diện đồng nhất với hệ thống modal sản phẩm, không đè badge chi nhánh, và xóa sạch chuỗi `(FE-03.1)`, `(FE-03.2)` trên toàn bộ modal sản phẩm.
- [ ] **REQ-UI-NAV-04**: Đã xóa nút `← Về Dashboard` rời bên ngoài `PosHeader` (giữ trong `☰ Thao tác`) và xóa 3 mục con dư thừa trên `AppTopNav` phân hệ Khuyến mãi.
