# Specs: pos-promotions-vouchers-loyalty-integration

## API / Contract

| Method | Path | Request Body | Response Body | HTTP Status / Errors |
|---|---|---|---|---|
| `GET` | `/api/loyalty-config` | None | `ApiResponse<LoyaltyConfigDto>` | 200 OK, 401 Unauthorized, 403 Forbidden |
| `PUT` | `/api/loyalty-config` | `LoyaltyConfigUpdateDto` | `ApiResponse<LoyaltyConfigDto>` | 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden |
| `POST` | `/api/promotions/evaluate-cart` | `EvaluateCartRequestDto` | `ApiResponse<CartEvaluationResultDto>` | 200 OK, 400 Bad Request |
| `POST` | `/api/vouchers/validate` | `VoucherValidationRequestDto` | `ApiResponse<VoucherValidationResponseDto>` | 200 OK, 400 Bad Request |
| `POST` | `/api/orders` | `CreateOrderRequest` | `ApiResponse<OrderResponse>` | 200 OK, 400 Bad Request, 409 Conflict |

---

## REMOVED Requirements

### Requirement: REQ-LOYALTY-REMOVE-TIERS-01 Gỡ bỏ hoàn toàn phân hạng thẻ thành viên
Hệ thống MUST gỡ bỏ toàn bộ giao diện và logic phân hạng thành viên nhiều cấp bậc (Đồng, Bạc, Vàng, Kim Cương) khỏi màn hình Cấu hình Tích điểm:
- Giao diện `LoyaltyConfigForm.tsx` MUST loại bỏ khối Card 3 (`#membership-tiers-section`) cùng bảng danh sách hạng thẻ và các trường nhập hệ số nhân điểm / chi tiêu tối thiểu.
- Giao diện `LoyaltyConfigPage.tsx` MUST loại bỏ hiệu ứng cuộn tự động đến `#membership-tiers-section` khi có tham số truy vấn `view=tiers`.
- Loại bỏ toàn bộ các state giả lập và hàm xử lý liên quan đến cập nhật hạng thành viên (`handleUpdateTierMultiplier`, `handleUpdateTierMinSpending`).

#### Scenario: Chủ cửa hàng truy cập màn hình Cấu hình Tích điểm
- **GIVEN**: Chủ cửa hàng đăng nhập vào hệ thống và điều hướng tới trang `/loyalty-config`.
- **WHEN**: Trang tải xong dữ liệu cấu hình tích điểm.
- **THEN**:
  - Giao diện CHỈ hiển thị: (1) Trạng thái kích hoạt hệ thống, (2) Quy tắc Tích điểm và (3) Quy tắc Tiêu điểm & Đổi thưởng đồng nhất.
  - Tuyệt đối không còn hiển thị Card 3 phân hạng thẻ (Đồng, Bạc, Vàng, Kim Cương) hay bất kỳ nút chỉnh sửa mức chi tiêu của hạng thẻ.

---

## MODIFIED Requirements

### Requirement: REQ-LOYALTY-POS-DISPLAY-02 Dọn dẹp nhãn phân hạng thành viên trên POS Checkout
Hệ thống MUST chuẩn hóa cách hiển thị thông tin khách hàng tại quầy thu ngân POS:
- Giao diện `PosPaymentPanel.tsx` MUST loại bỏ nhãn hiển thị hạng thành viên giả lập dạng `({customer.membershipTier})`.
- Hệ thống MUST hiển thị chính xác tổng điểm tích lũy hiện có của khách hàng (`customer.rewardPoints`) kèm giá trị quy đổi sang VNĐ dựa trên tỷ lệ `RedemptionRateAmount / RedemptionRatePoints`.
- Nếu khách hàng có số điểm tích lũy $\ge$ `MinRedemptionPoints`, hệ thống MUST cho phép thu ngân tick chọn áp dụng trừ tiền từ điểm tích lũy vào hóa đơn.

#### Scenario: Thu ngân chọn khách hàng thành viên có điểm tích lũy tại quầy POS
- **GIVEN**: Khách hàng A có `RewardPoints = 150` điểm. Cấu hình tiêu điểm là 1 điểm = 1.000 VNĐ, tối thiểu 20 điểm.
- **WHEN**: Thu ngân chọn Khách hàng A tại màn hình bán hàng `PosCheckoutPage`.
- **THEN**:
  - `PosPaymentPanel` hiển thị: "Khách hàng: Nguyễn Văn A | Điểm tích lũy: 150 điểm (Quy đổi: 150.000 đ)".
  - Không có bất kỳ nhãn hạng thẻ nào như `(Đồng)` hay `(Bạc)`.
  - Hiển thị checkbox: `[ ] Dùng điểm tích lũy (-150.000 đ)` cho phép thu ngân kích hoạt.

#### Scenario: Khách hàng chưa đủ điều kiện điểm tối thiểu để tiêu
- **GIVEN**: Khách hàng B có `RewardPoints = 10` điểm trong khi `MinRedemptionPoints = 20`.
- **WHEN**: Thu ngân chọn Khách hàng B.
- **THEN**:
  - Checkbox dùng điểm tích lũy bị vô hiệu hóa (disabled).
  - Hiển thị gợi ý: *"Tối thiểu 20 điểm để áp dụng đổi thưởng"*.

---

## ADDED Requirements

### Requirement: REQ-LOYALTY-CONFIG-03 Quản lý cấu hình Tích điểm & Đổi thưởng theo Tenant
Hệ thống MUST cung cấp API và giao diện quản lý cấu hình tích điểm cho từng cửa hàng (Tenant):
- Dữ liệu cấu hình bao gồm:
  - `IsEnabled`: Bật / tắt chương trình tích điểm.
  - `EarningRateAmount`: Số tiền chi tiêu tương ứng (VNĐ).
  - `EarningPoints`: Số điểm nhận được cho mỗi mức chi tiêu `EarningRateAmount`.
  - `RedemptionRatePoints`: Số điểm dùng để quy đổi.
  - `RedemptionRateAmount`: Số tiền giảm giá tương ứng với `RedemptionRatePoints`.
  - `MinRedemptionPoints`: Số điểm tối thiểu để bắt đầu được tiêu điểm.
  - `AllowPointsWithPromotions`: Cho phép hoặc không cho phép dùng điểm chung với khuyến mãi khác.
- Dữ liệu MUST được thẩm định hợp lệ (`EarningRateAmount > 0`, `EarningPoints > 0`, `RedemptionRatePoints > 0`, `RedemptionRateAmount > 0`, `MinRedemptionPoints >= 0`).

#### Scenario: Chủ cửa hàng lưu cấu hình tích điểm mới
- **GIVEN**: Chủ cửa hàng nhập tỷ lệ tích điểm: 100.000 VNĐ được 1 điểm; tỷ lệ đổi điểm: 1 điểm = 1.000 VNĐ; điểm tối thiểu đổi là 50 điểm.
- **WHEN**: Chủ cửa hàng bấm nút [Lưu cấu hình].
- **THEN**:
  - Frontend gọi `PUT /api/loyalty-config` với dữ liệu cập nhật.
  - Backend lưu thành công vào bảng `LoyaltySettings` của Tenant.
  - Trả về mã HTTP 200 OK và hiển thị toast thông báo cập nhật thành công.

---

### Requirement: REQ-POS-LOYALTY-REDEMPTION-04 Tích điểm và Tiêu điểm nguyên tử khi Bán hàng POS
Hệ thống MUST xử lý chính xác việc tiêu điểm và cộng điểm tích lũy trong giao dịch tạo đơn hàng POS:
- **Tiêu điểm**: Khi `request.PointsRedeemed > 0`:
  - Khách hàng MUST có `RewardPoints >= request.PointsRedeemed`.
  - Số điểm tiêu bị trừ trực tiếp vào số dư điểm của khách hàng trong giao dịch CSDL (`customer.RewardPoints -= pointsToDeduct`).
  - Số tiền giảm giá từ điểm được ghi nhận vào `order.DiscountAmount` và trừ vào `order.TotalAmount`.
- **Cộng điểm**: Sau khi đơn hàng hoàn tất thanh toán thành công:
  - Nếu đơn hàng có gắn khách hàng thành viên (`CustomerId != null`) và chương trình tích điểm đang bật:
  - Hệ thống tính điểm tích lũy mới dựa trên số tiền khách thực trả:
    $$\text{EarnedPoints} = \left\lfloor \frac{\text{FinalAmount}}{\text{EarningRateAmount}} \right\rfloor \times \text{EarningPoints}$$
  - Điểm mới được cộng vào tài khoản khách hàng: `customer.RewardPoints += earnedPoints`.
  - Khách lẻ (`CustomerId == null`) tuyệt đối không được cộng điểm.

#### Scenario: Khách hàng mua đơn hàng 500.000 VNĐ, tiêu 50 điểm và tích điểm mới
- **GIVEN**: Khách hàng C có số dư 100 điểm. Cửa hàng cấu hình: 1 điểm = 1.000 VNĐ; 100.000 VNĐ = 1 điểm.
- **WHEN**: Khách hàng chọn dùng 50 điểm (giảm 50.000 VNĐ). Số tiền thanh toán cuối cùng là 450.000 VNĐ. Đơn hàng hoàn tất thanh toán tiền mặt.
- **THEN**:
  - Điểm của khách bị trừ 50 điểm: $100 - 50 = 50$ điểm.
  - Khách được tích thêm điểm mới từ 450.000 VNĐ: $\lfloor 450.000 / 100.000 \rfloor \times 1 = 4$ điểm.
  - Số dư điểm cuối cùng của khách hàng là $50 + 4 = 54$ điểm.
  - Hóa đơn lưu vết rõ số điểm đã tiêu và số điểm tích lũy mới.

---

### Requirement: REQ-POS-PROMO-VOUCHER-05 Tự động Đánh giá Khuyến mãi & Thẩm định Voucher trên POS
Hệ thống MUST hỗ trợ tự động đánh giá khuyến mãi giỏ hàng và áp dụng mã voucher hợp lệ:
- Khi giỏ hàng thay đổi (thêm/sửa số lượng sản phẩm), POS Client gọi `POST /api/promotions/evaluate-cart` để tính toán chiết khấu tự động, quà tặng hoặc giảm giá trực tiếp trên dòng hàng.
- Khi thu ngân nhập mã voucher, POS Client gọi `POST /api/vouchers/validate` với mã voucher và giá trị đơn hàng.
  - Nếu voucher không tồn tại, hết hạn, chưa kích hoạt hoặc đã dùng hết lượt, hệ thống MUST trả lỗi kèm thông điệp rõ ràng.
  - Nếu voucher hợp lệ, hệ thống trả về số tiền giảm và chiết khấu tương ứng.
- Khi hoàn tất thanh toán đơn hàng POS:
  - Hệ thống gọi hàm nguyên tử `RedeemVoucherCodeAtomicAsync` để đổi trạng thái voucher thành `USED` và gắn với `OrderId`.
  - Ngăn chặn tuyệt đối việc sử dụng đồng thời một mã voucher cho hai đơn hàng khác nhau.

#### Scenario: Áp dụng mã Voucher giảm giá hợp lệ vào đơn hàng POS
- **GIVEN**: Giỏ hàng có tổng tiền 300.000 VNĐ. Có mã voucher "DISCOUNT20" giảm 20.000 VNĐ cho đơn từ 200.000 VNĐ.
- **WHEN**: Thu ngân nhập mã "DISCOUNT20" và bấm [Áp dụng].
- **THEN**:
  - Backend trả về hợp lệ với số tiền giảm 20.000 VNĐ.
  - POS cập nhật tổng thanh toán còn 280.000 VNĐ.
  - Khi hoàn tất thanh toán đơn hàng, mã "DISCOUNT20" chuyển sang trạng thái đã sử dụng (`Redeemed`).

#### Scenario: Cố tình sử dụng mã Voucher đã hết hạn
- **GIVEN**: Mã voucher "SUMMER2025" có hạn sử dụng đến ngày 31/08/2025.
- **WHEN**: Thu ngân nhập mã "SUMMER2025" vào đơn hàng ngày 09/11/2026.
- **THEN**:
  - Backend trả về kết quả không hợp lệ kèm thông điệp: *"Mã voucher đã hết hạn sử dụng!"*.
  - POS hiển thị cảnh báo lỗi màu đỏ và không giảm trừ tiền đơn hàng.

---

## Acceptance Criteria Checklist

- [ ] 1. Màn hình Cấu hình Tích điểm (`LoyaltyConfigForm.tsx` & `LoyaltyConfigPage.tsx`) không còn bất kỳ thành phần nào của 4 Hạng thẻ thành viên (Đồng, Bạc, Vàng, Kim Cương).
- [ ] 2. Màn hình bán hàng POS (`PosPaymentPanel.tsx`) không còn hiển thị nhãn hạng thẻ bên cạnh tên khách hàng.
- [ ] 3. Khách hàng thành viên có đủ số điểm tối thiểu có thể sử dụng điểm tích lũy để thanh toán đơn hàng POS; số điểm tiêu được trừ chính xác vào số dư.
- [ ] 4. Điểm tích lũy mới được tự động tính và cộng vào tài khoản khách hàng sau khi thanh toán đơn hàng thành công.
- [ ] 5. Mã voucher được thẩm định hợp lệ và đổi trạng thái nguyên tử (`USED`) khi tạo đơn hàng.
- [ ] 6. Toàn bộ Unit Test Backend (bao gồm kiểm tra tích điểm, tiêu điểm, áp dụng voucher) và Frontend build vượt qua 100% không có lỗi.
