# Design Brief: Ghi vết Khuyến mãi & Voucher trên Quản lý đơn hàng, hoàn thiện Mua X tặng Y và tự động áp Khuyến mãi cho Đơn đặt trước

## 1. Luồng người dùng (User Flows)

### 1.1. Luồng cấu hình & áp dụng `Mua X tặng Y` (`BUY_X_GET_Y`) đến Thanh toán POS
1. **Chủ cửa hàng (`STORE_OWNER`)** mở `PromotionModal` chọn hình thức `Mua X tặng Y`:
   - Tại mỗi bậc thang, chọn **Sản phẩm mua (X)** (hoặc để `"Bất kỳ sản phẩm trong giỏ"` nếu áp dụng theo tổng số lượng mua), nhập `Mua SL (X)`, chọn **Sản phẩm quà tặng (Y)** từ kho, đơn vị tính và `SL Tặng`.
   - Khi lưu, `PromotionListPage` ghi cả metadata `[TIERS_JSON]` (chứa `buyProductId`, `buyProductName`, `requiredQty`, `giftProductId`, `giftProductName`, `giftUnit`, `giftQty`) lẫn các bản ghi `PromotionCondition` (`BUY` và `GIFT`).
2. **Thu ngân / Chủ cửa hàng tại quầy POS (`PosCheckoutPage`)**:
   - Khi thêm hàng vào giỏ, `promotionApi.evaluateCart` chạy tự động:
     - Đánh giá các bậc của `ORDER_DISCOUNT`, `PRODUCT_DISCOUNT`, và `BUY_X_GET_Y` (chọn bậc cao nhất đạt điều kiện của từng chương trình).
     - Quy đổi giá trị quà tặng (`giftQty × giá bán sản phẩm tặng`) và kiểm tra ngân sách còn lại (`BudgetLimit - TotalDiscountGiven`).
     - Chọn **1 chương trình KM tự động duy nhất có lợi nhất (`Best-Offer`)** trên toàn bộ giỏ hàng. Nếu `BUY_X_GET_Y` thắng cuộc, trả về `AppliedPromotionId`, `AppliedPromotions`, `GiftItems` (kèm `PromotionId`, `UnitName`), `TotalDiscountAmount = 0` (chưa tính Voucher). Nếu khách nhập thêm mã Voucher hợp lệ, cộng thêm giảm giá Voucher.
   - Khi bấm **Thanh toán**:
     - `PosCheckoutPage` gửi danh sách `items` gồm hàng mua chính (`isGift: false`) **kèm các dòng `giftItems` (`isGift: true`, `unitPrice: 0`, `promotionId`)**, cộng với các trường phân rã ưu đãi (`appliedPromotionId`, `appliedPromotionSummary`, `promotionDiscountAmount`, `voucherCode`, `voucherDiscountAmount`, `pointsRedeemed`, `pointsDiscountAmount`).
     - Backend `OrderService.CreateOrderAsync`:
       1. Trừ tồn kho lô FEFO cho hàng mua chính (`IsGift = false`) trước; nếu thiếu kho hàng mua chính thì trả lỗi tồn kho chuẩn.
       2. Với dòng quà tặng (`IsGift = true`): kiểm tra tồn kho FEFO còn lại của sản phẩm tặng. Cấp phát `actualGiftQty = Math.Min(requestedGiftQty, availableStock)`. Nếu `actualGiftQty > 0`, trừ kho FEFO và ghi `OrderDetail` với `IsGift = true`, `UnitPrice = resolvedUnitPrice`, `DiscountAmount = resolvedUnitPrice * actualGiftQty`, `ActualPrice = 0`, `CostPriceAtSale = prod.CostPrice ?? 0m` (Lưu ý: dòng `IsGift = true` **không** cộng vào `TotalAmount` hay `orderDiscount` của khách để không làm lệch tiền phải thu, hoặc nếu cộng vào `TotalAmount` thì đối ứng 100% ở `itemDiscountTotal` — thiết kế chọn `UnitPrice = resolvedUnitPrice`, `DiscountAmount = resolvedUnitPrice * actualGiftQty`, `ActualPrice = 0`, còn `TotalAmount` của hóa đơn chỉ tính tổng tiền hàng khách mua chính để khớp 100% với hiển thị `Tổng tiền hàng` trên POS & Quản lý đơn hàng). Nếu `actualGiftQty < requestedGiftQty`, ghi chú cảnh báo thiếu quà vào `AppliedPromotionSummary` / `GiftStockWarning` mà không chặn đơn.
       3. Cộng tăng `UsedCount` và `TotalDiscountGiven` cho `Promotion` tự động và/hoặc Đợt phát hành Voucher (`RedeemVoucherCodeAtomicAsync`).

### 1.2. Luồng Quản lý đơn hàng, In hóa đơn & Đổi/Trả hàng
1. **Màn hình Quản lý đơn hàng (`InvoiceManagementPage.tsx`)**:
   - Cột **Giảm giá** hiển thị tổng giảm kèm badge nhỏ (VD: `[KM]`, `[VC: ...]` hoặc `🎁 Quà tặng` nếu có dòng `isGift`).
   - Khi mở rộng **Chi tiết hóa đơn**:
     - Hiển thị hộp **Thông tin ưu đãi & Khuyến mãi áp dụng** (Chương trình KM, Mã Voucher đã áp, Điểm thưởng đã đổi).
     - Bảng mặt hàng hiển thị dòng quà tặng với badge `🎁 Quà tặng KM`, đơn giá gốc gạch ngang / chiết khấu 100%, thành tiền **`0 đ`**.
   - **Xem trước & In bill K80 / POS-58**: In rõ dòng hàng `[Quà tặng KM] ... 0 đ` và tách dòng `Khuyến mãi`, `Voucher [MÃ]`, `Đổi điểm thưởng`.
2. **Modal Đổi/Trả hàng (`ReturnExchangeModal.tsx` & `ProcessReturnExchangeAsync`)**:
   - Liệt kê từng dòng theo `itemId` (`OrderDetail.Id`) thay vì gộp theo `productId`.
   - Dòng `isGift = true` gắn nhãn `🎁 Quà tặng KM (Hoàn 0 đ)`: khi chọn số lượng trả, tiền hoàn cộng thêm **`0 đ`**, chỉ phục hồi tồn kho nếu tình trạng `Restock`.
   - Backend `ProcessReturnExchangeAsync` đối chiếu theo `OrderDetailId` (fallback `ProductId + IsGift`), ép cứng số tiền hoàn của dòng `IsGift` bằng `0m` và trần hoàn của dòng thường không vượt quá `ActualPrice`.

### 1.3. Luồng Tạo Đơn đặt trước tự động áp Khuyến mãi (`CreatePreOrderModal.tsx`)
1. Khi thu ngân chọn mặt hàng / đổi số lượng trong `CreatePreOrderModal`:
   - Debounce `300ms` gọi `promotionApi.evaluateCart({ items, subTotal, branchId, customerId })` (**không** truyền `couponCode` và **không** có ô nhập Voucher).
   - Hiển thị ngay trên modal:
     - `Tổng tiền hàng gốc`
     - `Khuyến mãi tự động [KM]` (tên chương trình + số tiền giảm tự động)
     - Danh sách `🎁 Quà tặng giữ kho kèm theo (0 đ)` (nếu chương trình thắng cuộc là `Mua X tặng Y`)
     - `Tổng thanh toán sau KM (FinalAmount)`
     - `Tiền đặt cọc tối thiểu (10% × FinalAmount)`
2. Khi xác nhận đặt trước (`OrderService.CreatePreOrderAsync`):
   - Truyền kèm `discountAmount`, `appliedPromotionId`, `appliedPromotionSummary`, và các dòng `giftItems` (`isGift: true`).
   - Backend trích giữ kho lô FEFO cho cả hàng đặt mua chính và hàng quà tặng (cấp phát theo tồn khả dụng nếu thiếu quà), kiểm tra `DepositAmount >= 10% FinalAmount`, cộng `UsedCount`/`TotalDiscountGiven` cho chương trình KM.
   - Tab **Đơn đặt trước & Giữ kho** trên `InvoiceManagementPage` nhận diện chuẩn `status === 'PendingPickup' || status === 'PreOrder' || orderCode.startsWith('PO')`, hiển thị `Tổng tiền đơn = finalAmount` (kèm ghi chú giảm giá/quà tặng nếu có) và `Còn phải thu = finalAmount - depositAmount`.

---

## 2. Màn hình / Component & Trạng thái giao diện

| Component | Vai trò thay đổi | Trạng thái Loading / Empty / Error / Warning |
|---|---|---|
| `PromotionModal.tsx` & `PromotionListPage.tsx` | Thêm ô chọn **Sản phẩm cần mua (X)** cho bậc `BUY_X_GET_Y` (mặc định có tùy chọn `-- Bất kỳ sản phẩm trong giỏ --` hoặc chọn SP cụ thể từ kho) | Loading danh mục SP kho; fallback cho phép lưu điều kiện `BUY` + `GIFT` đồng bộ `[TIERS_JSON]`. |
| `PosCheckoutPage.tsx`, `PosPaymentPanel.tsx`, `PosReceiptModal.tsx` | Truyền `giftItems` & phân rã KM/Voucher/Điểm vào `createOrder` và `ReceiptData`; cảnh báo toast nếu kho thiếu một phần/hết quà tặng | Debounce thẩm định KM; toast thông báo rõ nếu quà tặng hết tồn kho tại chi nhánh. |
| `InvoiceManagementPage.tsx` | Hiển thị phân rã KM / Mã Voucher / Điểm thưởng + dòng `🎁 Quà tặng KM (0 đ)` ở chi tiết hóa đơn, bản in K80 và sửa mapping Đơn đặt trước (`PendingPickup`, `finalAmount`) | Null-safe cho đơn lịch sử chưa có chi tiết KM (vẫn hiện tổng `Giảm giá`). |
| `CreatePreOrderModal.tsx` | Gọi `evaluateCart` tự động, hiển thị ưu đãi KM & quà tặng giữ kho, tính `minDeposit = 10% × finalAmount`, không hiển thị ô Voucher | Trạng thái `"Đang tính khuyến mãi..."` nhẹ dưới khung tổng tiền; nếu giỏ rỗng thì ẩn khối KM; nếu lỗi mạng fallback về giá gốc `0 đ` giảm. |
| `ReturnExchangeModal.tsx` | Quản lý số lượng trả theo `item.itemId`, hiển thị badge `🎁 Quà tặng KM — Hoàn 0 đ` và khóa giá hoàn `0 đ` | Chặn nhập vượt số lượng dòng gốc; cảnh báo rõ dòng quà tặng chỉ nhập lại kho, không hoàn tiền. |

---

## 3. API Endpoints & DTO Contracts

### 3.1. `POST /api/promotions/evaluate-cart` (`PromotionService.EvaluateCartAsync`)
- **Mở rộng `CartGiftItemDto`:**
  - `Guid ProductId`, `string ProductName`, `decimal Quantity`, `string Reason`, `Guid? PromotionId = null`, `string? UnitName = null`, `decimal EquivalentValue = 0m`
- **Mở rộng `EvaluateCartResponse`:**
  - Bổ sung `Guid? AppliedPromotionId = null` (ID chương trình KM tự động thắng cuộc `Best-Offer`).

### 3.2. `POST /api/pos/orders` (`OrderCreateRequest`) & `POST /api/pos/orders/pre-order` (`PreOrderCreateRequest`)
- **Mở rộng `OrderItemCreateDto`:**
  - Bổ sung `bool IsGift = false`, `Guid? PromotionId = null`
- **Mở rộng `OrderCreateRequest`:**
  - Bổ sung tùy chọn (mặc định `null` để tương thích ngược 100%):
    - `Guid? AppliedPromotionId = null`
    - `string? AppliedPromotionSummary = null`
    - `decimal? PromotionDiscountAmount = null`
    - `decimal? VoucherDiscountAmount = null`
    - `decimal? PointsDiscountAmount = null`
- **Mở rộng `PreOrderCreateRequest`:**
  - Bổ sung tùy chọn:
    - `decimal? DiscountAmount = null`
    - `Guid? AppliedPromotionId = null`
    - `string? AppliedPromotionSummary = null`
    - `string? VoucherCode = null` *(nếu truyền khác rỗng vào Pre-Order, Backend chủ động từ chối bằng `ValidationException` / `InvalidOperationException` theo quy tắc nghiệp vụ không áp Voucher cho đơn đặt trước)*.
- **Mở rộng `OrderResponse` & `OrderItemResponse`:**
  - `OrderItemResponse`: bổ sung `bool IsGift = false`, `Guid? PromotionId = null`
  - `OrderResponse`: bổ sung `Guid? AppliedPromotionId = null`, `string? AppliedPromotionSummary = null`, `decimal PromotionDiscountAmount = 0m`, `string? AppliedVoucherCode = null`, `decimal VoucherDiscountAmount = 0m`, `int PointsRedeemed = 0`, `decimal PointsDiscountAmount = 0m`, `string? GiftStockWarning = null`.

### 3.3. `POST /api/pos/orders/{id}/return-exchange` (`ReturnExchangeRequest`)
- **Mở rộng `ReturnItemDto`:**
  - Bổ sung `Guid? OrderDetailId = null`, `bool IsGift = false`.

---

## 4. Thay đổi Cơ sở dữ liệu (Database Schema & Migration)

### Bảng `Orders` (`Order.cs` & `OrderConfiguration.cs`)
- Chuyển `Note` từ `[NotMapped]` thành cột lưu trữ thực sự (`character varying(1000) NULL`).
- Bổ sung các cột nullable / có giá trị mặc định an toàn:
  - `AppliedPromotionId` (`uuid NULL`)
  - `AppliedPromotionSummary` (`character varying(300) NULL`)
  - `PromotionDiscountAmount` (`decimal(18,2) NOT NULL DEFAULT 0`)
  - `AppliedVoucherCode` (`character varying(50) NULL`)
  - `VoucherDiscountAmount` (`decimal(18,2) NOT NULL DEFAULT 0`)
  - `PointsRedeemed` (`integer NOT NULL DEFAULT 0`)
  - `PointsDiscountAmount` (`decimal(18,2) NOT NULL DEFAULT 0`)
- Tạo chỉ mục không duy nhất `IX_Orders_AppliedPromotionId` và `IX_Orders_AppliedVoucherCode` phục vụ truy vấn đối soát.
- **Bảng `OrderDetails`:** Đã có sẵn cột `PromotionID` (`uuid NULL`) và `IsGift` (`boolean NOT NULL DEFAULT false`) — giữ nguyên schema, chỉ kết nối tầng Application & API.
- **Migration & Khởi tạo:** Tạo EF Core Migration mới trong `MT_GRMS.Infrastructure/Migrations` và bổ sung khối `ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS ...` trong `DbInitializer.cs`.

---

## 5. Quy tắc nghiệp vụ & Phân quyền (Business Rules & RBAC)
1. **Cô lập Đa Tenant (`TenantId`):** Mọi truy vấn `Promotions`, `VoucherCodes`, `BranchStocks`, `Orders` lọc chặt theo `TenantId` hiện tại; nghiêm cấm dùng chương trình KM hoặc mã Voucher của tenant khác.
2. **Giải quyết xung đột `Best-Offer` toàn cục cho KM tự động:**
   - Giá trị ưu đãi của `BUY_X_GET_Y` = `số lượng tặng khả dụng theo ngân sách × đơn giá bán của sản phẩm tặng`.
   - So sánh giá trị của tất cả ứng viên `ORDER_DISCOUNT`, `PRODUCT_DISCOUNT`, `BUY_X_GET_Y`; chỉ chọn **1 chương trình duy nhất** có giá trị quy đổi lớn nhất (`> 0`).
3. **Ưu tiên tồn kho FEFO:** Dòng hàng khách mua trả tiền (`IsGift = false`) luôn được trừ kho FEFO trước; dòng quà tặng (`IsGift = true`) chỉ trừ trên phần tồn kho FEFO còn dư.
4. **Phân quyền Hủy & Đổi/Trả:**
   - Hủy hóa đơn đã hoàn thành (`Completed`): chỉ `STORE_OWNER` được phép thực hiện (giữ nguyên chốt chặn RBAC `REQ-POS-SEC-02`); khi hủy tự động hoàn kho cả dòng mua lẫn dòng tặng và giảm lại `UsedCount` / `TotalDiscountGiven` của chương trình KM.
   - Đổi/Trả hàng: Thu ngân / Quản lý / Chủ cửa hàng thực hiện tại quầy, nhưng hệ thống khóa cứng tiền hoàn `0 đ` đối với mọi dòng `IsGift = true`.
