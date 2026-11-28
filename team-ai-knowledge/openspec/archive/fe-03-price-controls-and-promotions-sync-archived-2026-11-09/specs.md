# Specs: fe-03-price-controls-and-promotions-sync

## API / Contract

| Method | Path | Request Body | Response Body | HTTP Status / Errors |
|---|---|---|---|---|
| `GET` | `/api/products/{id}/price-history` | None (Query: `branchId?: Guid`) | `ApiResponse<List<ProductPriceHistoryDto>>` | 200 OK, 401 Unauthorized, 404 Not Found |
| `PUT` | `/api/products/{id}` | `ProductUpdatePayload` | `ApiResponse<ProductResponse>` | 200 OK, 400 Bad Request, 403 Forbidden |
| `PUT` | `/api/branches/{branchId}/products/{productId}` | `EditStoreProductInput` | `ApiResponse<BranchProductItem>` | 200 OK, 400 Bad Request, 404 Not Found |
| `POST` | `/api/vouchers/validate` | `{ code: string, cartTotal: number }` | `ApiResponse<ValidateVoucherResponse>` | 200 OK, 400 Bad Request |
| `POST` | `/api/promotions` | `PromotionCreateRequest` | `ApiResponse<PromotionResponse>` | 200 OK, 400 Bad Request |
| `PUT` | `/api/promotions/{id}` | `PromotionUpdateRequest` | `ApiResponse<PromotionResponse>` | 200 OK, 400 Bad Request, 404 Not Found |

---

## ADDED Requirements

### Requirement: REQ-PRICE-CONTROL-01 Below-Cost Warning & Permission Controls (FE-03.1)
Hệ thống **MUST** tự động đối chiếu giá bán mới với giá vốn (`CostPrice`) hoặc giá nhập lô gần nhất khi người dùng chỉnh sửa giá:
- Nếu `NewPrice < CostPrice`: Hệ thống **MUST** kích hoạt cảnh báo trực quan mức độ cao (Below-Cost Warning).
- Nếu người thực hiện không có vai trò Quản lý (`BRANCH_MANAGER`) hoặc Chủ cửa hàng (`STORE_OWNER`), hệ thống **MUST** chặn lưu.
- Nếu người thực hiện có quyền Quản lý/Chủ cửa hàng, hệ thống cho phép xác nhận duyệt giá bán lỗ, đánh dấu `IsBelowCost = true` và ghi nhận người duyệt vào lịch sử.

#### Scenario: Chủ cửa hàng đặt giá bán thấp hơn giá vốn để xả hàng
- **GIVEN**: Sản phẩm Sữa tươi Vinamilk có giá vốn `CostPrice = 28.000 đ`.
- **WHEN**: Chủ cửa hàng sửa giá bán thành `25.000 đ` (thấp hơn giá vốn).
- **THEN**: Giao diện hiển thị cảnh báo: *"Giá bán mới thấp hơn giá vốn 3.000 đ"*. Khi bấm [Xác nhận duyệt giá], hệ thống lưu thành công với cờ `IsBelowCost = true`.

---

### Requirement: REQ-PRICE-HISTORY-02 Price Change History Tracking (FE-03.2)
Hệ thống **MUST** tự động ghi nhận nhật ký audit log vào bảng `ProductPriceHistories` mỗi khi giá bán thay đổi:
- Ghi nhận đầy đủ: `ProductId`, `BranchId?`, `PriceScope` (`MASTER` | `BRANCH`), `OldPrice`, `NewPrice`, `CostPriceSnapshot`, `ChangedByUserId`, `ChangedByUserName`, `CreatedAt`.
- **Zero-Friction UX**: Hệ thống **MUST** tự động gán `Reason = "Điều chỉnh giá bán"` mà **KHÔNG** bắt buộc người dùng phải gõ lý do thủ công khi đổi giá thông thường.
- Cung cấp giao diện xem lịch sử biến động giá (Drawer/Modal) thể hiện chi tiết các lần tăng/giảm giá, tỷ lệ chênh lệch và phạm vi áp dụng.

#### Scenario: Thay đổi giá bán Master của sản phẩm
- **GIVEN**: Sản phẩm Nước mắm Nam Ngư đang có giá bán `35.000 đ`.
- **WHEN**: Chủ cửa hàng đổi giá bán thành `38.000 đ` và bấm [Lưu thay đổi] mà không nhập bất kỳ ghi chú nào.
- **THEN**:
  - Hệ thống tự động ghi 1 bản ghi vào `ProductPriceHistories` với `OldPrice = 35.000`, `NewPrice = 38.000`, `PriceScope = "MASTER"`, `Reason = "Điều chỉnh giá bán"`.
  - Mở modal Lịch sử giá hiển thị dòng tăng giá `+3.000 đ (+8.57%)` với thời gian thực tế.

---

### Requirement: REQ-PROMO-TIERS-PERSISTENCE-03 Bảo toàn trọn vẹn bậc thang khuyến mãi đa tầng
Hệ thống **MUST** lưu trữ và tái tạo nguyên vẹn 100% tất cả các bậc thang khuyến mãi chiết khấu đơn hàng (`ORDER_DISCOUNT`) và khuyến mãi theo bậc:
- Lưu trữ mảng cấu hình `tiers` vào trường `Description` (định dạng `[TIERS_JSON]...[/TIERS_JSON]`) để bảo toàn các bậc thang tiền mà không vi phạm ràng buộc khóa ngoại `ProductID` trong `PromotionConditions`.
- Khi nạp lại danh sách khuyến mãi (`GET /api/promotions`), hệ thống **MUST** parse và hiển thị đầy đủ số lượng bậc cấu hình (ví dụ: *"3 mức cấu hình"*) trên `PromotionTable` và `PromotionModal`.

#### Scenario: Tạo và tải lại khuyến mãi chiết khấu 3 bậc thang
- **GIVEN**: Người dùng tạo chương trình khuyến mãi với 3 bậc chiết khấu (Bậc 1: 100k - 5%, Bậc 2: 300k - 10%, Bậc 3: 500k - 15%).
- **WHEN**: Bấm [Lưu thay đổi] và tải lại trang (`F5`).
- **THEN**: Dòng chương trình hiển thị: *"Quy tắc bậc thang & Thể lệ áp dụng (3 mức cấu hình)"*, mở chi tiết hiển thị đầy đủ 3 bậc.

---

### Requirement: REQ-PROMO-GIFT-INVENTORY-PICKER-04 Chọn quà tặng & Đơn vị tính từ kho hàng
Hệ thống **MUST** cho phép chọn trực tiếp sản phẩm quà tặng từ danh mục kho hàng cho hình thức Mua X tặng Y (`BUY_X_GET_Y`):
- Khi chọn sản phẩm quà tặng, hệ thống tự động điền `giftProductId`, `giftProductName`, `giftProductSku` và `giftUnit` theo đơn vị cơ bản (`baseUnit`).
- Đảm bảo danh mục sản phẩm quà tặng luôn sẵn sàng nạp từ API kho hàng.

#### Scenario: Tạo mới khuyến mãi Mua 2 tặng 1 quà tặng từ kho
- **GIVEN**: Người dùng mở modal tạo mới khuyến mãi và chọn hình thức "Mua X tặng Y".
- **WHEN**: Chọn sản phẩm quà tặng "Bánh Chocopie" từ dropdown kho hàng.
- **THEN**: Trường quà tặng nhận đúng Product ID và đơn vị tính "Hộp", số lượng tặng "1".

---

### Requirement: REQ-VOUCHER-DATE-VALIDATION-05 Chuẩn hóa ngày hiệu lực Voucher
Hệ thống **MUST** xác thực ngày hiệu lực của voucher theo ngày lịch dương (`Date`):
- Voucher có ngày bắt đầu là hôm nay **MUST** có hiệu lực ngay lập tức tại quầy thu ngân POS (`now.AddHours(7).Date >= promo.StartDate.Date`).
- Không bị chặn bởi sự chênh lệch giờ phút hay lệch múi giờ UTC/Local.

#### Scenario: Áp dụng voucher vừa tạo trong ngày
- **GIVEN**: Đợt voucher "GIAM10K" vừa được tạo với ngày bắt đầu là ngày hôm nay.
- **WHEN**: Thu ngân nhập mã voucher vào đơn hàng tại quầy POS.
- **THEN**: Hệ thống xác nhận mã voucher hợp lệ và áp dụng chiết khấu thành công mà không báo lỗi ngày.

---

## Acceptance Criteria Checklist

- [ ] 1. Sửa giá bán Master hoặc Chi nhánh tự động ghi nhận 1 bản ghi vào `ProductPriceHistories` với `Reason = "Điều chỉnh giá bán"` (không bắt gõ lý do).
- [ ] 2. Đặt giá bán < giá vốn hiển thị cảnh báo mức độ cao Below-Cost Warning và yêu cầu duyệt.
- [ ] 3. Có Drawer/Modal xem lịch sử biến động giá chi tiết theo từng sản phẩm.
- [ ] 4. Thêm 3 bậc khuyến mãi chiết khấu đơn hàng, lưu và F5 hiển thị đủ 3 bậc.
- [ ] 5. Tạo mới khuyến mãi Mua X tặng Y chọn được sản phẩm quà tặng từ kho.
- [ ] 6. Voucher tạo hôm nay áp dụng được ngay tại POS mà không bị chặn ngày.
- [ ] 7. Toàn bộ Backend Tests (577+ tests) và Frontend Build vượt qua 100%.
