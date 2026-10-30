# Design Brief: Phân hệ Quản lý Khuyến mại & Voucher Backend (BE-16)

## 1. Luồng Người dùng & Tương tác API

### 1.1. Luồng Store Owner (Quản trị viên / Chủ chuỗi)
1. **Quản lý Khuyến mại:**
   - Xem danh sách khuyến mại có phân trang, lọc theo loại (`ORDER_DISCOUNT`, `BUY_X_GET_Y`, `PRODUCT_DISCOUNT`), trạng thái (`ACTIVE`, `UPCOMING`, `EXPIRED`, `PAUSED`).
   - Tạo mới / Cập nhật khuyến mại: Nhập tên, mã, loại chiết khấu, giá trị giảm, hạn mức đơn tối thiểu, chặn trần giảm giá, khoảng ngày `StartDate` - `EndDate`, sản phẩm áp dụng và điều kiện mua/tặng.
   - Bật / Tắt kích hoạt nhanh (`IsActive`).
2. **Quản lý Đợt phát hành Voucher / Coupon:**
   - Xem danh sách đợt voucher (Voucher Batches).
   - Tạo mới đợt voucher: Đặt tên, tiền tố mã (`prefix`, ví dụ `VIP20K`), loại giảm (tiền hoặc %), số lượng phát hành `totalQuantity`, điều kiện đơn tối thiểu.
   - Sinh mã voucher hàng loạt (Batch code generation): Hệ thống sinh ra các mã duy nhất (ví dụ: `VIP20K-8F92-K3D1`) với trạng thái `UNUSED`.
   - Xem danh sách mã voucher con của từng đợt kèm trạng thái sử dụng, khách hàng và đơn hàng liên kết.

### 1.2. Luồng Thu ngân POS (Cashier POS Checkout)
1. **Tự động áp dụng khuyến mại giỏ hàng:**
   - Khi giỏ hàng thay đổi, Frontend gọi `POST /api/v1/promotions/evaluate-cart`.
   - Backend quét các CTKM đang hiệu lực, kiểm tra điều kiện đơn và dòng sản phẩm, tự động tính toán tổng số tiền được giảm và sản phẩm tặng kèm (nếu là Mua X tặng Y).
2. **Áp dụng Mã Voucher (Coupon code):**
   - Thu ngân nhập mã tại `PosPaymentPanel` (ví dụ `VIP20K-8F92-K3D1`).
   - Gọi `POST /api/v1/vouchers/validate` với mã voucher và giá trị đơn hàng.
   - Backend thẩm định: Mã tồn tại, đúng Tenant, trạng thái `UNUSED`, trong thời hạn hiệu lực, đơn hàng đạt `MinOrderValue`.
   - Trả về số tiền được giảm để trừ vào hóa đơn.
3. **Chốt đơn & Sử dụng mã:**
   - Khi đơn hàng hoàn tất, gọi `POST /api/v1/vouchers/redeem` để chuyển trạng thái mã sang `USED`, ghi nhận `OrderId`, `OrderCode` và `UsedAt`.

---

## 2. Thiết kế Cơ sở dữ liệu (Database Schema)

Toàn bộ ID thực thể đều sử dụng `Guid` (sinh bằng `Uuid7.NewGuid()` theo chuẩn UUIDv7 của hệ thống):

### 2.1. Thực thể `Promotions` (Mở rộng từ entity hiện tại)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `Id` | `Guid` | PK (Uuid7) | Mã định danh chương trình |
| `TenantId` | `string` | NOT NULL, Max 50 | Phân lập đa người thuê |
| `PromotionCode` | `string` | NOT NULL, Max 50 | Mã hiển thị CTKM / Mã đợt voucher (Unique theo Tenant) |
| `PromotionName` | `string` | NOT NULL, Max 150 | Tên chương trình ưu đãi / đợt voucher |
| `Type` | `string` | NOT NULL, Max 50 | `ORDER_DISCOUNT`, `FIXED_AMOUNT`, `PERCENT`, `BUY_X_GET_Y`, `VOUCHER` |
| `DiscountValue` | `decimal(18,2)` | Default 0.00 | Giá trị giảm (% hoặc số tiền VNĐ) |
| `MinOrderValue` | `decimal(18,2)` | Default 0.00 | Giá trị đơn tối thiểu để hưởng ưu đãi |
| `MaxDiscountAmount` | `decimal(18,2)?`| Nullable | Mức giảm tối đa (cap chặn trần khi giảm %) |
| `UsageLimit` | `int?` | Nullable | Giới hạn tổng số lượt sử dụng |
| `UsedCount` | `int` | Default 0 | Số lượt đã sử dụng |
| `StartDate` | `DateTime` | NOT NULL (UTC) | Bắt đầu hiệu lực |
| `EndDate` | `DateTime` | NOT NULL (UTC) | Kết thúc hiệu lực |
| `IsActive` | `bool` | Default true | Cờ kích hoạt |
| `Description` | `string?` | Nullable, Max 500 | Mô tả thể lệ |
| `TargetBranches` | `string` | Default "ALL" | Chi nhánh áp dụng ("ALL" hoặc danh sách ID) |
| `BudgetLimit` | `decimal(18,2)?`| Nullable | Giới hạn ngân sách khuyến mãi |
| `TotalDiscountGiven` | `decimal(18,2)` | Default 0.00 | Tổng số tiền đã chiết khấu |
| `VoucherPrefix` | `string?` | Nullable, Max 20 | Tiền tố sinh mã voucher (nếu là đợt voucher) |
| `TotalVoucherQuantity` | `int` | Default 0 | Tổng số lượng mã voucher sinh ra |

### 2.2. Thực thể `PromotionConditions` (Quan hệ $M:N$ `eligible_for` giữa Promotion & Product)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `Id` | `Guid` | PK (Uuid7) | Mã định danh điều kiện |
| `PromotionId` | `Guid` | FK -> Promotions | Thuộc chương trình khuyến mãi nào |
| `ProductId` | `Guid` | FK -> Products | Sản phẩm tham gia điều kiện |
| `ProductRole` | `string` | NOT NULL, Max 30 | `BUY` (hàng mua trigger), `GIFT` (quà tặng 0đ), `DISCOUNT` (hàng giảm) |
| `MinQty` | `decimal(12,2)` | Default 1.00 | Số lượng mua tối thiểu để kích hoạt |
| `DiscountValue` | `decimal(18,2)?`| Nullable | Mức giảm riêng cho sản phẩm nếu có |
| `Note` | `string?` | Nullable, Max 255 | Ghi chú điều kiện thể lệ |

### 2.3. Thực thể `VoucherCodes` (Mã Voucher chi tiết)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `Id` | `Guid` | PK (Uuid7) | Mã định danh mã voucher |
| `TenantId` | `string` | NOT NULL, Max 50 | Phân lập đa người thuê |
| `PromotionId` | `Guid` | FK -> Promotions | Thuộc đợt phát hành voucher nào |
| `Code` | `string` | NOT NULL, Max 50 | Mã coupon thực tế (VD: `VIP20K-9DF1`) - Unique theo Tenant |
| `Status` | `string` | NOT NULL, Max 30 | `UNUSED`, `USED`, `EXPIRED`, `LOCKED` |
| `CustomerId` | `Guid?` | Nullable | Khách hàng được cấp mã riêng nếu có |
| `CustomerName` | `string?` | Nullable, Max 100 | Tên khách hàng |
| `CustomerPhone` | `string?` | Nullable, Max 20 | Số điện thoại khách hàng |
| `OrderId` | `Guid?` | Nullable | Đơn hàng đã áp dụng mã |
| `OrderCode` | `string?` | Nullable, Max 50 | Mã đơn hàng áp dụng |
| `UsedAt` | `DateTime?` | Nullable (UTC) | Thời điểm sử dụng mã |

---

## 3. Danh sách REST Endpoints & DTOs

### 3.1. Promotions Endpoints (`/api/v1/promotions`)
- `GET /api/v1/promotions`: Danh sách khuyến mãi phân trang (`PromotionFilterQuery`).
- `GET /api/v1/promotions/{id}`: Chi tiết khuyến mãi kèm danh sách điều kiện sản phẩm `Conditions`.
- `POST /api/v1/promotions`: Tạo mới chương trình khuyến mãi.
- `PUT /api/v1/promotions/{id}`: Cập nhật chương trình khuyến mãi.
- `PATCH /api/v1/promotions/{id}/status`: Bật/tắt trạng thái `IsActive`.
- `POST /api/v1/promotions/evaluate-cart`: Tính toán chiết khấu tự động cho giỏ hàng bán lẻ POS.

### 3.2. Vouchers Endpoints (`/api/v1/vouchers`)
- `GET /api/v1/vouchers`: Danh sách các đợt phát hành voucher (phân trang).
- `GET /api/v1/vouchers/{id}`: Chi tiết đợt voucher.
- `POST /api/v1/vouchers`: Tạo mới đợt voucher.
- `POST /api/v1/vouchers/{id}/generate-codes`: Sinh danh sách mã voucher hàng loạt.
- `GET /api/v1/vouchers/{id}/codes`: Lấy danh sách mã voucher con của đợt (phân trang).
- `POST /api/v1/vouchers/validate`: Kiểm tra tính hợp lệ của mã voucher cho đơn hàng tại quầy POS.
- `POST /api/v1/vouchers/redeem`: Đánh dấu mã voucher đã được sử dụng.
