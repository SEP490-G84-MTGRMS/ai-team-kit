# Design Brief: pos-promotions-vouchers-loyalty-integration

## 1. Luồng Người Dùng (User Flows)

### Flow 1: Chủ cửa hàng cấu hình Tích điểm & Đổi thưởng
```mermaid
sequenceDiagram
    autonumber
    actor Owner as Chủ cửa hàng
    participant UI as LoyaltyConfigPage
    participant API as LoyaltyConfigController
    participant DB as LoyaltySettings (DB)

    Owner->>UI: Truy cập trang Cấu hình Tích điểm (/loyalty-config)
    UI->>API: GET /api/loyalty-config
    API->>DB: Truy vấn LoyaltySetting theo TenantId
    DB-->>API: Trả về cấu hình hiện tại
    API-->>UI: LoyaltyConfigDto (Rate Tích, Rate Tiêu, Min Điểm)
    UI-->>Owner: Hiển thị form (Đã gỡ bỏ khối Hạng thẻ)
    Owner->>UI: Thay đổi tỷ lệ tích/tiêu điểm và bấm "Lưu cấu hình"
    UI->>API: PUT /api/loyalty-config (LoyaltyConfigUpdateDto)
    API->>DB: Cập nhật bản ghi LoyaltySetting
    DB-->>API: Thành công
    API-->>UI: 200 OK + Toast thông báo thành công
```

### Flow 2: Bán hàng POS tích hợp Khuyến mãi, Voucher & Tiêu điểm
```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Thu ngân POS
    participant POS as PosCheckoutPage
    participant PromoAPI as PromotionsController
    participant VoucherAPI as VouchersController
    participant OrderAPI as OrdersController
    participant DB as CSDL MT-GRMS

    Cashier->>POS: Quét mã vạch / Thêm sản phẩm vào giỏ
    POS->>PromoAPI: POST /api/promotions/evaluate-cart (Items, Total)
    PromoAPI-->>POS: Trả về chiết khấu tự động & quà tặng
    Cashier->>POS: Tìm và chọn Khách hàng thành viên
    POS-->>Cashier: Hiển thị số điểm tích lũy hiện có của khách
    Cashier->>POS: Tick chọn "Tiêu điểm tích lũy" (nếu đủ điểm tối thiểu)
    Cashier->>POS: Nhập mã Voucher (nếu khách cung cấp)
    POS->>VoucherAPI: POST /api/vouchers/validate (code, orderAmount)
    VoucherAPI-->>POS: VoucherValidationResponse (isValid, discountAmount)
    POS-->>Cashier: Hiển thị tiền giảm Voucher & Tổng thanh toán cuối
    Cashier->>POS: Bấm [F10] Thanh toán đơn hàng
    POS->>OrderAPI: POST /api/orders (Items, VoucherCode, PointsRedeemed...)
    OrderAPI->>DB: Trừ điểm tiêu của khách (customer.RewardPoints -= pointsRedeemed)
    OrderAPI->>DB: Đổi mã voucher thành USED (RedeemVoucherCodeAtomicAsync)
    OrderAPI->>DB: Tính & cộng điểm mới cho khách (customer.RewardPoints += earnedPoints)
    DB-->>OrderAPI: Đơn hàng hoàn tất
    OrderAPI-->>POS: OrderResponse + In hóa đơn K80
```

---

## 2. Thiết Kế Màn Hình & Thành Phần UI (Frontend Components)

### 1. `LoyaltyConfigForm.tsx` (Dọn dẹp triệt để)
- **Giữ lại**:
  - `Card 1`: Trạng thái kích hoạt hệ thống tích điểm (Toggle Switch).
  - `Card 2`: Quy tắc Tích điểm (Cứ mỗi `X` VNĐ chi tiêu tích lũy được `Y` điểm thưởng).
  - `Card 3`: Quy tắc Tiêu điểm (Mỗi `1` điểm tương ứng `Z` VNĐ tiền mặt; Số điểm tối thiểu để bắt đầu tiêu là `MinRedemptionPoints`).
- **Xóa bỏ**:
  - Khối Card 3 cũ: `#membership-tiers-section` (Bảng 4 Hạng thẻ Đồng, Bạc, Vàng, Kim Cương, hệ số nhân và mức chi tiêu).
  - Loại bỏ các state và hàm xử lý `handleUpdateTierMultiplier`, `handleUpdateTierMinSpending`.

### 2. `PosPaymentPanel.tsx` (Dọn dẹp nhãn hạng)
- Dòng thông tin khách hàng:
  - Trước đây: `Điểm: 150 điểm (Bạc)`
  - Cập nhật: `Điểm tích lũy: 150 điểm` (Quy đổi: `150.000 đ`)
  - Checkbox tiêu điểm: `[ ] Dùng điểm tích lũy (-X đ)` kèm gợi ý nếu chưa đủ điểm tối thiểu (`Tối thiểu 20 điểm`).

### 3. `PosCheckoutPage.tsx` (Khép kín luồng API)
- Khi gọi `createOrder`:
  - `voucherCode`: Mã voucher đã áp dụng thành công.
  - `pointsRedeemed`: Số điểm khách hàng đã tick chọn tiêu.

---

## 3. Thiết Kế Backend API & DTOs

### 1. Endpoint Tích điểm: `LoyaltyConfigController`
- `GET /api/loyalty-config`: Lấy cấu hình của Tenant hiện tại.
- `PUT /api/loyalty-config`: Cập nhật cấu hình tích điểm.
  - Request DTO:
    ```csharp
    public record LoyaltyConfigUpdateDto(
        bool IsEnabled,
        decimal EarningRateAmount,
        int EarningPoints,
        int RedemptionRatePoints,
        decimal RedemptionRateAmount,
        int MinRedemptionPoints,
        bool AllowPointsWithPromotions
    );
    ```

### 2. Endpoint Khuyến mãi & Voucher:
- `POST /api/promotions/evaluate-cart`: Đánh giá khuyến mãi tự động cho giỏ hàng.
- `POST /api/vouchers/validate`: Thẩm định tính hợp lệ của mã voucher.
- `POST /api/orders`: Tạo đơn hàng POS, tiếp nhận `PointsRedeemed` và `VoucherCode`.

---

## 4. Quy Tắc Nghiệp Vụ (Business Rules)
1. **Quy tắc tích điểm**:
   - Chỉ áp dụng tích điểm cho đơn hàng gắn với Khách hàng (`CustomerId != null`).
   - Khách vãng lai ("Khách lẻ") không tích điểm.
   - Điểm tích lũy = $\lfloor \text{Số tiền thanh toán thực tế} / \text{EarningRateAmount} \rfloor \times \text{EarningPoints}$.
2. **Quy tắc tiêu điểm**:
   - Khách hàng phải có số điểm khả dụng $\ge$ `MinRedemptionPoints`.
   - Tiền giảm từ điểm không được vượt quá số tiền của đơn hàng.
3. **Quy tắc Voucher**:
   - Mỗi đơn hàng chỉ áp dụng 1 mã voucher duy nhất.
   - Khi đơn hàng hoàn tất, mã voucher đổi trạng thái thành `USED` và gắn với `OrderId`.
