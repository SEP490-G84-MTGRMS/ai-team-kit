---
capability: pos-sales-order
change: pos-order-promo-audit-bogo-and-preorder-promo
dependencies:
  - exploration.md
  - design-brief.md
status: draft
---

# Delta Specification: pos-sales-order (pos-order-promo-audit-bogo-and-preorder-promo)

## Capability Summary
Bổ sung lưu vết minh bạch nguồn ưu đãi (Khuyến mãi tự động, mã Voucher, Điểm thưởng) trên đơn hàng POS và màn hình Quản lý đơn hàng; đồng bộ tự động lượt dùng & ngân sách khuyến mãi; khép kín luồng `Mua X tặng Y` (`BUY_X_GET_Y`) từ cấu hình chọn sản phẩm mua, giải quyết xung đột `Best-Offer`, trừ kho FEFO dòng quà tặng `0 đ`, đến khóa hoàn tiền `0 đ` khi Đổi/Trả; và tự động áp dụng Khuyến mãi chương trình ngay khi tạo Đơn đặt trước (không áp dụng mã Voucher dùng 1 lần).

## Architecture Map
`PromotionModal / PosCheckoutPage / CreatePreOrderModal / InvoiceManagementPage / ReturnExchangeModal (React TS)` → `PromotionsController & PosOrdersController (ASP.NET Core API)` → `PromotionService & OrderService (Application)` → `Orders, OrderDetails, Promotions, PromotionConditions, VoucherCodes, BranchStocks (EF Core / PostgreSQL)`.

---

## ADDED Requirements

### Requirement: REQ-ORD-PROMO-01 Lưu vết phân rã Khuyến mãi, Voucher, Điểm thưởng trên Hóa đơn và Quản lý đơn hàng
- Hệ thống **MUST** lưu trữ bền vững trên bảng `Orders` (cô lập theo `TenantId`) các thông tin phân rã ưu đãi gồm: `AppliedPromotionId`, `AppliedPromotionSummary`, `PromotionDiscountAmount`, `AppliedVoucherCode`, `VoucherDiscountAmount`, `PointsRedeemed`, `PointsDiscountAmount` và cột `Note`.
- Tổng tiền giảm trên đơn `Order.DiscountAmount` **MUST** bằng tổng giảm giá dòng hàng không phải quà tặng + `PromotionDiscountAmount` (hoặc chiết khấu tay lớn hơn) + `VoucherDiscountAmount` + `PointsDiscountAmount`, và không vượt quá `TotalAmount`.
- Màn hình **Quản lý đơn hàng** (`InvoiceManagementPage`) và mẫu in hóa đơn (K80 / POS-58) **SHALL** hiển thị rõ tên chương trình Khuyến mãi đã áp dụng, mã Voucher đã dùng, số điểm & tiền quy đổi Điểm thưởng; đối với hóa đơn lịch sử không có dữ liệu phân rã chi tiết, hệ thống **MUST** hiển thị an toàn tổng `DiscountAmount` mà không gây lỗi giao diện.

#### Scenario: Thanh toán đơn bán lẻ POS có cả Khuyến mãi tự động và Mã Voucher
**GIVEN** Chi nhánh thuộc `Tenant A` có chương trình giảm giá hóa đơn `"Tuần lễ vàng"` đang hoạt động giảm `20.000 đ` và mã Voucher hợp lệ `"VC-SALE10"` giảm `10.000 đ`  
**WHEN** Thu ngân thanh toán đơn hàng tổng tiền hàng `250.000 đ` có áp dụng `"VC-SALE10"`  
**THEN** Hệ thống lưu `Order` với `PromotionDiscountAmount = 20000`, `AppliedPromotionSummary` chứa `"Tuần lễ vàng"`, `AppliedVoucherCode = "VC-SALE10"`, `VoucherDiscountAmount = 10000`, `DiscountAmount = 30000`, `FinalAmount = 220000`  
**AND** Khi mở chi tiết hóa đơn hoặc xem trước bản in K80 tại Quản lý đơn hàng, người dùng nhìn thấy tách biệt dòng Khuyến mãi `"Tuần lễ vàng (-20.000 đ)"` và `"Voucher VC-SALE10 (-10.000 đ)"`.

#### Scenario: Tương thích ngược với hóa đơn lịch sử chưa có metadata phân rã
**GIVEN** Một hóa đơn cũ trong CSDL có `DiscountAmount = 15000` nhưng `AppliedPromotionSummary = null` và `AppliedVoucherCode = null`  
**WHEN** Người dùng mở danh sách và chi tiết hóa đơn trên Quản lý đơn hàng  
**THEN** Hệ thống hiển thị bình thường cột `Giảm giá = 15.000 đ` mà không phát sinh lỗi `null` hay lệch số tiền khách đã trả.

---

### Requirement: REQ-ORD-PROMO-02 Đồng bộ nguyên tử lượt dùng (`UsedCount`) và ngân sách (`TotalDiscountGiven`) khi Tạo và Hủy đơn
- Khi đơn bán lẻ POS hoặc Đơn đặt trước được tạo thành công có áp dụng chương trình Khuyến mãi tự động (`AppliedPromotionId != null`), hệ thống **MUST** tăng `Promotion.UsedCount` thêm `1` và cộng giá trị ưu đãi thực tế (tiền giảm hoặc giá trị quy đổi quà tặng đã xuất kho) vào `Promotion.TotalDiscountGiven` trong cùng phạm vi `TenantId`.
- Khi mã Voucher được gạch thành công qua `RedeemVoucherCodeAtomicAsync`, hệ thống **MUST** tăng `UsedCount` thêm `1` và cộng số tiền giảm Voucher vào `TotalDiscountGiven` của đợt phát hành Voucher (`Promotion` cha có `Type == "VOUCHER"`), đồng thời từ chối nếu mã đã `USED` hoặc thuộc `TenantId` khác.
- Khi Chủ cửa hàng (`STORE_OWNER`) hủy đơn hàng (`CancelOrderAsync`), hệ thống **MUST** hoàn trả tồn kho cho mọi dòng `OrderDetails` (kể cả dòng quà tặng `IsGift == true`) và khấu trừ hoàn lại `UsedCount` (không âm) cùng `TotalDiscountGiven` (không âm) của chương trình Khuyến mãi tự động đã ghi trên đơn; nhân viên vai trò `CASHIER` / `STAFF` cố tình hủy đơn `Completed` **MUST** bị chặn bởi `UnauthorizedAccessException`.

#### Scenario: Chạm trần ngân sách sau khi cộng dồn `TotalDiscountGiven`
**GIVEN** Chương trình KM `"Giảm 20k"` có `BudgetLimit = 30000` và `TotalDiscountGiven = 0`  
**WHEN** Đơn hàng thứ nhất hoàn tất được giảm `20.000 đ`  
**THEN** Chương trình cập nhật `UsedCount = 1` và `TotalDiscountGiven = 20000`  
**AND** Khi đơn hàng thứ hai gọi `EvaluateCartAsync`, mức giảm tối đa từ chương trình này bị kẹp còn đúng `10.000 đ` ngân sách dư lại.

#### Scenario: Hai giao dịch đồng thời cùng sử dụng một mã Voucher dùng 1 lần
**GIVEN** Mã Voucher `"VC-ONCE01"` đang ở trạng thái `UNUSED`  
**WHEN** Hai yêu cầu thanh toán đồng thời gửi `"VC-ONCE01"`  
**THEN** Chỉ đúng một giao dịch gạch mã sang `USED` thành công và tăng `UsedCount` của đợt Voucher lên `1`; giao dịch còn lại **MUST** bị từ chối sử dụng lặp lại mã đã `USED`.

#### Scenario: Chủ cửa hàng hủy đơn có áp dụng Khuyến mãi hoàn lại lượt dùng và ngân sách
**GIVEN** Đơn hàng đã tạo có `AppliedPromotionId = P1`, `PromotionDiscountAmount = 20000`, chương trình `P1` hiện có `UsedCount = 3` và `TotalDiscountGiven = 60000`  
**WHEN** `STORE_OWNER` gọi `CancelOrderAsync` cho đơn hàng trên  
**THEN** Trạng thái đơn chuyển thành `Cancelled`, tồn kho các dòng hàng được cộng trả lại, và chương trình `P1` được cập nhật về `UsedCount = 2`, `TotalDiscountGiven = 40000`.

---

### Requirement: REQ-ORD-BOGO-03 Khóa cứng hoàn tiền `0 đ` cho dòng quà tặng khi Đổi/Trả hàng
- Màn hình `ReturnExchangeModal` **SHALL** hiển thị tách biệt từng dòng chi tiết theo `OrderDetail.Id` (`itemId`), gắn nhãn nhận diện `🎁 Quà tặng KM` cho dòng có `IsGift == true` và tính giá trị hoàn tiền của dòng đó bằng `0 đ`.
- Backend `OrderService.ProcessReturnExchangeAsync` **MUST** đối chiếu dòng trả theo `OrderDetailId` (hoặc cặp `ProductId` + `IsGift` nếu không truyền `OrderDetailId`); đối với dòng gốc có `IsGift == true`, hệ thống **MUST** tính số tiền hoàn trả = `0 đ` bất kể `UnitPrice` client gửi lên, nhưng vẫn cộng trả tồn kho `BranchStock` nếu tình trạng hàng trả là `Restock`.

#### Scenario: Khách trả lại sản phẩm trùng mã giữa hàng mua chính và hàng quà tặng
**GIVEN** Hóa đơn gốc gồm 2 dòng cùng mã sản phẩm `Sữa tươi` (`15.000 đ/hộp`): Dòng 1 là hàng mua (`Qty = 2, IsGift = false, ActualPrice = 15000`) và Dòng 2 là quà tặng KM (`Qty = 1, IsGift = true, ActualPrice = 0`)  
**WHEN** Thu ngân thực hiện trả Dòng 2 (`OrderDetailId` của dòng quà tặng, `Quantity = 1`, `Condition = "Restock"`) ngay cả khi payload cố tình truyền `UnitPrice = 15000`  
**THEN** Backend tính `totalReturnAmount = 0 đ` (không hoàn tiền mặt, không trừ công nợ) và cộng trả `1` hộp vào tồn kho `BranchStock`.

---

### Requirement: REQ-ORD-PRE-01 Tự động áp dụng Khuyến mãi chương trình cho Đơn đặt trước và chặn mã Voucher
- Trên `CreatePreOrderModal`, khi người dùng thêm/sửa mặt hàng, hệ thống **SHALL** tự động gọi thẩm định khuyến mãi chương trình (không truyền mã Voucher và không hiển thị ô nhập Voucher), hiển thị số tiền giảm tự động và/hoặc danh sách quà tặng giữ kho `0 đ`, đồng thời tính tiền cọc tối thiểu `minDeposit = Math.Round(finalAmount * 0.10m)` theo tổng tiền sau khuyến mãi.
- Backend `OrderService.CreatePreOrderAsync` **MUST** từ chối yêu cầu nếu truyền `VoucherCode` khác rỗng; **MUST** tính `FinalAmount` đã trừ khuyến mãi chương trình, kiểm tra `DepositAmount >= 10% * FinalAmount` và `DepositAmount <= FinalAmount`, đồng thời trích giữ kho lô FEFO cho cả mặt hàng đặt mua lẫn mặt hàng quà tặng `0 đ` (cấp phát theo tồn khả dụng nếu thiếu quà).
- Danh sách **Đơn đặt trước & Giữ kho** trên `InvoiceManagementPage` **MUST** hiển thị đúng các đơn có `Status == "PendingPickup"` (cùng mã `PO...`) và tính `Còn phải thu = FinalAmount - DepositAmount` dựa trên giá đã trừ khuyến mãi.

#### Scenario: Tạo đơn đặt trước đủ điều kiện giảm giá hóa đơn bậc thang
**GIVEN** Chi nhánh có chương trình giảm `20.000 đ` cho đơn từ `200.000 đ`  
**WHEN** Thu ngân tạo Đơn đặt trước gồm hàng hóa trị giá `220.000 đ` và nhập tiền cọc `20.000 đ` (`10%` của `200.000 đ` sau KM)  
**THEN** Hệ thống lưu Đơn đặt trước với `TotalAmount = 220000`, `DiscountAmount = 20000`, `FinalAmount = 200000`, `DepositAmount = 20000`, `Status = "PendingPickup"` và hiển thị `Còn phải thu = 180.000 đ` tại tab Đơn đặt trước.

#### Scenario: Tạo đơn đặt trước cố tình đính kèm mã Voucher dùng 1 lần bị từ chối
**GIVEN** Khách đặt cọc đơn đặt trước và payload API cố truyền `VoucherCode = "VC-123456"`  
**WHEN** Gọi `CreatePreOrderAsync`  
**THEN** Hệ thống ném ngoại lệ nghiệp vụ từ chối áp dụng mã Voucher trên Đơn đặt trước.

---

## MODIFIED Requirements

### Requirement: REQ-ORD-BOGO-01 Cấu hình sản phẩm mua (X) → tặng sản phẩm (Y) và giải quyết xung đột `Best-Offer` toàn cục
- Giao diện `PromotionModal` và `PromotionListPage` khi chọn loại `BUY_X_GET_Y` **SHALL** cho phép chọn **Sản phẩm mua (X)** (sản phẩm cụ thể từ kho hoặc tùy chọn bất kỳ sản phẩm trong giỏ), số lượng cần mua `X`, **Sản phẩm quà tặng (Y)**, đơn vị tính và số lượng tặng `Y`, đồng bộ lưu vào cả `[TIERS_JSON]` lẫn `PromotionConditions`.
- `PromotionService.EvaluateCartAsync` **MUST** hỗ trợ đánh giá `BUY_X_GET_Y` theo cả bậc thang `[TIERS_JSON]` (chọn bậc cao nhất đạt điều kiện và nhân theo bội số nếu là bậc đơn) lẫn `PromotionConditions` truyền thống (`BUY` / `GIFT`); **MUST** quy đổi giá trị gói quà tặng (`giftQty × giá bán sản phẩm tặng`), kẹp số lượng quà theo ngân sách còn lại `BudgetLimit`, và đưa chung vào bộ chọn **Best-Offer** với `ORDER_DISCOUNT` và `PRODUCT_DISCOUNT` sao cho chỉ **1 chương trình KM tự động có giá trị ưu đãi lớn nhất** được áp dụng trên giỏ hàng.

#### Scenario: So sánh `Best-Offer` giữa `Mua X tặng Y` và `Chiết khấu hóa đơn`
**GIVEN** Cùng một chi nhánh có Chương trình A (`ORDER_DISCOUNT`: giảm `15.000 đ` cho đơn từ `100.000 đ`) và Chương trình B (`BUY_X_GET_Y`: mua 2 lốc sữa `120.000 đ` tặng 1 hộp bánh trị giá bán `25.000 đ`) cùng đang hoạt động  
**WHEN** Giỏ hàng có 2 lốc sữa tổng `120.000 đ` gọi `EvaluateCartAsync`  
**THEN** Chương trình B thắng `Best-Offer` (`25.000 đ > 15.000 đ`): kết quả trả về `GiftItems` có `1` hộp bánh, `TotalDiscountAmount = 0` (không cộng dồn thêm `15.000 đ` của Chương trình A) và `AppliedPromotionId = B.Id`.

#### Scenario: Chương trình giảm tiền cao hơn giá trị quà tặng thắng `Best-Offer`
**GIVEN** Chương trình A giảm `30.000 đ` và Chương trình B tặng 1 món quà trị giá `20.000 đ` cùng thỏa điều kiện giỏ hàng  
**WHEN** Gọi `EvaluateCartAsync`  
**THEN** Chương trình A thắng `Best-Offer`: kết quả trả về `TotalDiscountAmount = 30000`, `GiftItems` rỗng (`[]`), khách không nhận trùng cả tiền giảm lẫn quà tặng.

---

### Requirement: REQ-ORD-BOGO-02 Lên đơn dòng quà tặng `0 đ` (`IsGift = true`), ưu tiên trừ tồn kho lô FEFO và xử lý khi thiếu quà
- Khi tạo đơn bán lẻ (`CreateOrderAsync`) hoặc đơn đặt trước (`CreatePreOrderAsync`) có dòng hàng `IsGift == true`, hệ thống **MUST** phân bổ và trừ tồn kho lô FEFO cho toàn bộ mặt hàng khách mua chính (`IsGift == false`) trước; sau đó mới kiểm tra tồn kho FEFO còn lại cho mặt hàng quà tặng.
- Nếu tồn kho sản phẩm quà tặng đủ, hệ thống **MUST** trừ kho FEFO và lưu `OrderDetail` với `IsGift = true`, `ActualPrice = 0`, `TotalLineAmount = 0`, `CostPriceAtSale = giá vốn sản phẩm tặng`, và **MUST NOT** cộng giá dòng quà tặng vào `FinalAmount` thu khách.
- Nếu tồn kho sản phẩm quà tặng chỉ còn ít hơn số lượng được tặng hoặc bằng `0`, hệ thống **MUST** cấp phát tối đa số lượng còn tồn (`0 <= actualGiftQty < requestedGiftQty`), **MUST NOT** ném lỗi chặn đơn hàng mua chính, và trả về thông tin cảnh báo `GiftStockWarning` để POS thông báo cho thu ngân.

#### Scenario: Mua 2 tặng 1 cùng sản phẩm khi tồn kho chỉ còn đúng 2 sản phẩm
**GIVEN** Kho chi nhánh chỉ còn tổng cộng `2` chai Nước cam; khách mua `2` chai Nước cam (`IsGift = false`) và đủ điều kiện tặng `1` chai Nước cam (`IsGift = true`)  
**WHEN** Thu ngân bấm Thanh toán đơn hàng  
**THEN** Hệ thống ưu tiên trừ `2` chai cho dòng mua chính, thấy tồn kho còn lại bằng `0` nên cấp `0` chai quà tặng (bỏ qua dòng `IsGift`), lưu thành công hóa đơn thanh toán `2` chai chính và trả về `GiftStockWarning` báo hết tồn kho quà tặng.

#### Scenario: Tồn kho đủ cho cả hàng mua và hàng tặng
**GIVEN** Kho chi nhánh có `10` gói Mì và `5` xúc xích; khách mua `4` gói Mì được tặng `1` xúc xích (`IsGift = true`)  
**WHEN** Thu ngân bấm Thanh toán đơn hàng  
**THEN** Tồn kho Mì giảm `4`, tồn kho xúc xích giảm `1` theo lô FEFO; hóa đơn lưu 2 dòng `OrderDetail` trong đó dòng xúc xích có `IsGift = true`, `ActualPrice = 0`, `TotalLineAmount = 0`, và hiển thị nhãn `🎁 Quà tặng KM (0 đ)` trên Quản lý đơn hàng và phiếu in.

---

## Acceptance Checklist
- [ ] `Order` lưu và trả về đầy đủ phân rã KM (`AppliedPromotionId`, `AppliedPromotionSummary`, `PromotionDiscountAmount`), Voucher (`AppliedVoucherCode`, `VoucherDiscountAmount`), Điểm thưởng (`PointsRedeemed`, `PointsDiscountAmount`) và `Note` bền vững trong DB.
- [ ] Màn Quản lý đơn hàng & mẫu in hóa đơn hiển thị rõ tên KM, mã Voucher, điểm đổi và badge `🎁 Quà tặng KM (0 đ)`.
- [ ] `UsedCount` & `TotalDiscountGiven` tự động tăng khi tạo đơn (KM tự động & đợt Voucher) và giảm lại khi `STORE_OWNER` hủy đơn.
- [ ] `PromotionModal` cho phép chọn Sản phẩm mua (X) cho `BUY_X_GET_Y`; `EvaluateCartAsync` xét `Best-Offer` quy đổi giá trị quà tặng không cộng dồn với giảm giá tiền.
- [ ] Thanh toán POS và Đơn đặt trước trừ tồn kho FEFO ưu tiên hàng mua trước, hàng tặng sau; không sập đơn chính khi kho thiếu/hết quà tặng.
- [ ] Đổi/Trả hàng tách theo `OrderDetailId` và khóa cứng hoàn tiền `0 đ` cho dòng `IsGift == true`.
- [ ] Tạo Đơn đặt trước tự động áp KM chương trình, tính cọc tối thiểu `10%` trên `FinalAmount`, chặn mã Voucher dùng 1 lần và hiển thị đúng ở tab Đơn đặt trước.
