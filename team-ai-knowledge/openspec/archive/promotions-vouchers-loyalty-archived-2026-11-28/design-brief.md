# Design Brief: Thiết Kế Khuyến Mãi, Voucher và Cấu Hình Tích Điểm

## 1. Luồng Người Dùng & Giao Diện (User & UI Flows)

### 1.1. Luồng Chủ Cửa Hàng (Store Owner)
1. **Quản lý Khuyến Mại (`/promotions`)**:
   - Truy cập `PromotionListPage`: Xem danh sách chương trình, lọc theo loại (`ORDER_DISCOUNT`, `PRODUCT_DISCOUNT`, `BUY_X_GET_Y`) và trạng thái (`ACTIVE`, `UPCOMING`, `EXPIRED`, `PAUSED`).
   - Mở `PromotionModal`:
     - Nhập thông tin chung: Tên chương trình, Mã CT, Thời gian bắt đầu - kết thúc, Giới hạn ngân sách / lượt dùng.
     - Chọn Loại khuyến mại:
       - *Giảm giá đơn hàng*: Nhập giá trị giảm (% hoặc số tiền), giá trị đơn hàng tối thiểu (`MinOrderValue`), mức giảm tối đa (`MaxDiscountAmount`).
       - *Giảm giá sản phẩm*: Chọn danh sách sản phẩm áp dụng và mức chiết khấu (% hoặc tiền mặt).
       - *Mua X tặng Y*: Chọn sản phẩm điều kiện (Mua `MinQty` SP A) và sản phẩm quà tặng (Tặng `MinQty` SP B).
   - Nút bật/tắt (Toggle Switch) cập nhật trạng thái tức thời qua `PATCH /api/promotions/{id}/status`.
2. **Quản lý Voucher (`/vouchers`)**:
   - Truy cập `VoucherListPage`: Thống kê KPI (Tổng đợt, Tổng mã đã phát hành, Đã dùng, Tỷ lệ đổi).
   - Mở `VoucherBatchModal`: Thiết lập đợt voucher mới (Tên đợt, Loại giảm FIXED/PERCENT, Giá trị giảm, Tiền tố mã Prefix, Số lượng phát hành, Hạn sử dụng).
   - Mở `GenerateCodesModal`: Sinh bổ sung mã voucher tự động theo tiền tố đợt.
   - Xem chi tiết danh sách mã con: Xem từng mã, trạng thái (`UNUSED`, `USED`, `EXPIRED`), khách hàng đã dùng và mã hóa đơn liên quan.
3. **Cấu hình Tích Điểm (`/loyalty-config`)**:
   - Truy cập `LoyaltyConfigPage`:
     - Công tắc Bật/Tắt hệ thống tích điểm (`isEnabled`).
     - Tỷ lệ tích điểm: Cứ mỗi `EarningRateAmount` VNĐ (mặc định 10.000 đ) nhận được `EarningPoints` điểm (mặc định 1 điểm).
     - Tỷ lệ tiêu điểm: Cứ mỗi `RedemptionRatePoints` điểm (mặc định 1 điểm) quy đổi thành `RedemptionRateAmount` VNĐ (mặc định 1.000 đ).
     - Điều kiện tiêu điểm: Điểm tích lũy tối thiểu để được phép tiêu (`MinRedemptionPoints`, mặc định 20 điểm).
     - Cho phép tiêu điểm cùng với khuyến mãi (`AllowPointsWithPromotions`).
   - Nhấn "Lưu cấu hình": Gọi `PUT /api/loyalty-config` lưu vào CSDL backend.

### 1.2. Luồng Thu Ngân Bán Hàng POS (Cashier POS Checkout)
1. **Quét / Chọn sản phẩm vào giỏ hàng**:
   - Giao diện POS tự động gọi ngầm `POST /api/promotions/evaluate-cart` (kèm debounce 300ms).
   - Nếu đủ điều kiện khuyến mãi đơn hàng hoặc sản phẩm: Hiển thị badge xanh và số tiền chiết khấu tự động.
   - Nếu đạt điều kiện Mua X tặng Y: Tự động bổ sung dòng sản phẩm quà tặng với `IsGift = true` và đơn giá 0đ.
2. **Nhập mã Voucher**:
   - Tại panel thanh toán POS, thu ngân nhập mã vào ô "Mã Voucher / Coupon" và nhấn "Áp dụng".
   - Gọi `POST /api/vouchers/validate`:
     - Nếu hợp lệ: Hiển thị badge mã voucher thành công và trừ tiền tương ứng.
     - Nếu không hợp lệ: Hiển thị thông báo lỗi rõ ràng (Mã không tồn tại, đã sử dụng, hoặc đơn hàng chưa đạt giá trị tối thiểu).
3. **Tích & Tiêu điểm Khách hàng**:
   - Khi chọn khách hàng (tìm theo SĐT hoặc tên): Hiển thị số điểm thưởng hiện có (`RewardPoints`).
   - Nếu khách hàng có đủ điểm tối thiểu (`>= MinRedemptionPoints`): Hiển thị tùy chọn "Dùng điểm tích lũy".
   - Thu ngân nhập/chọn số điểm muốn tiêu ➔ Tự động tính tiền giảm trừ tương ứng.
4. **Hoàn tất thanh toán**:
   - Thu ngân nhấn "Thanh toán": Payload `OrderCreateRequest` gửi lên kèm `VoucherCode` và `PointsRedeemed`.
   - Backend xử lý nguyên tử (Atomic transaction):
     - Tạo hóa đơn `Order` và các dòng `OrderDetail`.
     - Xuất trừ tồn kho FEFO theo lô.
     - Đánh dấu mã Voucher thành `USED`, lưu `OrderId` và `UsedAt`.
     - Khấu trừ điểm tiêu và cộng điểm thưởng mới theo tỷ lệ cấu hình vào tài khoản `Customer`.
     - In hóa đơn hiển thị chi tiết tiền giảm khuyến mãi, voucher và điểm tích lũy.

---

## 2. Thiết Kế API & DTOs

### 2.1. Nhóm Khuyến Mại (`/api/promotions`)
- `GET /api/promotions`: Lấy danh sách (hỗ trợ phân trang, tìm kiếm, lọc theo Type, Status).
- `GET /api/promotions/{id}`: Chi tiết kèm danh sách sản phẩm điều kiện (`Conditions`).
- `POST /api/promotions`: Tạo mới chương trình.
- `PUT /api/promotions/{id}`: Cập nhật chương trình.
- `PATCH /api/promotions/{id}/status`: Bật/tắt kích hoạt.
- `DELETE /api/promotions/{id}`: Xóa mềm chương trình.
- `POST /api/promotions/evaluate-cart`: Thẩm định giỏ hàng POS:
  ```json
  // Request
  {
    "items": [
      { "productId": "guid", "productName": "Sữa tươi", "unitPrice": 30000, "quantity": 3 }
    ],
    "subTotal": 90000,
    "couponCode": "CHAOMUAHE",
    "branchId": "guid",
    "customerId": "guid"
  }
  // Response
  {
    "subTotal": 90000,
    "totalDiscountAmount": 10000,
    "finalAmount": 80000,
    "appliedPromotions": ["Giảm 10.000đ cho đơn từ 50.000đ"],
    "giftItems": [],
    "voucherResult": { "isValid": true, "discountAmount": 10000, "code": "CHAOMUAHE" }
  }
  ```

### 2.2. Nhóm Voucher (`/api/vouchers`)
- `GET /api/vouchers`: Danh sách đợt phát hành voucher (phân trang, tìm kiếm).
- `GET /api/vouchers/{id}`: Chi tiết đợt voucher.
- `POST /api/vouchers`: Tạo đợt phát hành mới và tự động sinh mã ban đầu.
- `POST /api/vouchers/{id}/generate-codes`: Sinh thêm mã cho đợt.
- `GET /api/vouchers/{id}/codes`: Xem danh sách các mã con trong đợt.
- `POST /api/vouchers/validate`: Kiểm tra tính hợp lệ của mã.
- `POST /api/vouchers/redeem`: Đổi mã / đánh dấu đã sử dụng.

### 2.3. Nhóm Cấu Hình Tích Điểm (`/api/loyalty-config`)
- `GET /api/loyalty-config`: Lấy cấu hình tích điểm của Tenant hiện tại.
- `PUT /api/loyalty-config`: Cập nhật cấu hình tích điểm:
  ```json
  {
    "isEnabled": true,
    "earningRateAmount": 10000,
    "earningPoints": 1,
    "redemptionRatePoints": 1,
    "redemptionRateAmount": 1000,
    "minRedemptionPoints": 20,
    "allowPointsWithPromotions": true
  }
  ```

---

## 3. Thiết Kế Cơ Sở Dữ Liệu (Database Schema Changes)

### 3.1. Bảng Mới: `LoyaltySettings`
| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Mô tả |
|---|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | `NEWID()` | Khóa chính |
| `TenantId` | `uniqueidentifier` | ❌ | — | Khóa ngoại Tenant (Multi-tenant partition) |
| `IsEnabled` | `bit` | ❌ | `1` | Kích hoạt hệ thống tích điểm |
| `EarningRateAmount` | `decimal(18,2)` | ❌ | `10000.00` | Số tiền VNĐ để nhận được EarningPoints |
| `EarningPoints` | `int` | ❌ | `1` | Số điểm nhận được ứng với EarningRateAmount |
| `RedemptionRatePoints`| `int` | ❌ | `1` | Số điểm quy đổi ra tiền mặt |
| `RedemptionRateAmount`| `decimal(18,2)` | ❌ | `1000.00` | Số tiền VNĐ được giảm ứng với RedemptionRatePoints |
| `MinRedemptionPoints` | `int` | ❌ | `20` | Điểm tối thiểu khách hàng phải có để được tiêu |
| `AllowPointsWithPromotions` | `bit` | ❌ | `1` | Cho phép tiêu điểm khi đơn đã có khuyến mãi/voucher |
| `CreatedAt` | `datetime2` | ❌ | `GETUTCDATE()`| Thời gian tạo |
| `UpdatedAt` | `datetime2` | ❌ | `GETUTCDATE()`| Thời gian cập nhật |

*Index*: `UX_LoyaltySettings_TenantId` (Unique Clustered/Non-Clustered theo TenantId, mỗi Tenant có đúng 1 bản ghi cấu hình).

### 3.2. Cập nhật Bảng & Quan hệ Hiện Tại
- `OrderCreateRequest` bổ sung `VoucherCode`: Cho phép chuyển mã voucher trực tiếp khi lập đơn để `OrderService` tự động hoàn tất đổi mã trong cùng một transaction.
- `PromotionCondition`: Giữ nguyên cấu trúc M:N với `ProductRole` gồm `BUY`, `GIFT`, `DISCOUNT`.

---

## 4. Phân Quyền & Quy Tắc An Toàn (Security & Business Constraints)
- **Role StoreOwner (`STORE_OWNER`)**: Có toàn quyền tạo, sửa, xóa, bật/tắt Khuyến mãi, Voucher và cấu hình Tích điểm.
- **Role Cashier (`EMPLOYEE`)**: Chỉ có quyền đọc danh sách khuyến mãi hợp lệ, gọi thẩm định giỏ hàng, validate voucher và áp dụng trên đơn POS.
- **Bảo toàn số dư két tiền & Sổ quỹ**: Khuyến mãi, voucher và tiêu điểm làm giảm `FinalAmount` của hóa đơn, từ đó số tiền thực thu vào két (`CashTill`) ghi nhận chính xác theo số tiền khách thực trả sau giảm trừ.
