# Specs: store-information-and-subscriptions

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| GET | `/api/v1/tenant/store-info` | — | `{ name, subdomain, taxCode, hotline, address, city, industry }` | 401 (Chưa đăng nhập) |
| PUT | `/api/v1/tenant/store-info` | `{ name, taxCode, hotline, address, city }` | `{ success: true, message }` | 400 (Sai MST/Hotline) |
| GET | `/api/v1/tenant/subscription-status` | — | `{ currentPlan, branchCount, daysRemaining, expiresAt, walletBalance }` | 401 |
| GET | `/api/v1/tenant/pricing-plans` | — | `[ { planCode, name, priceMonthly, priceYearly, features } ]` | — |
| POST | `/api/v1/tenant/wallet/topup` | `{ amount }` | `{ transactionCode, qrImageUrl, expiresAt }` | 400 (Số tiền < 100k) |
| GET | `/api/v1/tenant/wallet/transactions` | `?page=1&pageSize=10` | `{ items: [...], totalCount }` | — |
| POST | `/api/v1/tenant/checkout/pay-by-wallet` | `{ planCode, months, extraBranches, extraWarehouses, voucherCode }` | `{ success: true, newExpiresAt, newBalance }` | 400 (Số dư ví không đủ) |
| POST | `/api/v1/tenant/checkout/create-qr-order`| `{ planCode, months, extraBranches, extraWarehouses, voucherCode }` | `{ orderCode, qrImageUrl, totalAmount }` | 400 (Dữ liệu không hợp lệ) |

---

## ADDED Requirements

### Requirement: REQ-01 Bố cục Store Settings Hub & Thanh trạng thái đếm ngược
Hệ thống MUST cung cấp giao diện quản lý gian hàng dạng Hub 2 cột theo chuẩn KiotViet: Sidebar bên trái điều hướng giữa các tab (Thông tin gian hàng, Gói dịch vụ, Lịch sử mua hàng, Ví tiền), và Thanh tóm tắt trạng thái trên cùng hiển thị gói hiện tại, số chi nhánh, ngành hàng, đồng hồ đếm ngược ngày sử dụng (cảnh báo đỏ nếu $\le 7$ ngày) và số dư ví.

#### Scenario: Hiển thị cảnh báo cận hạn khi còn 3 ngày
- **GIVEN** Tenant đang sử dụng gói dùng thử và thời hạn còn lại là 3 ngày
- **WHEN** Chủ cửa hàng truy cập tab "Gói dịch vụ"
- **THEN** Thanh trạng thái MUST hiển thị badge `3 ngày` với màu đỏ cảnh báo (`#FF3B30`), nền đỏ nhạt (`#FFF0F0`) và viền (`#FFD6D6`).

---

### Requirement: REQ-02 Bảng so sánh 3 gói cước SaaS chuẩn KiotViet
Hệ thống MUST hiển thị bảng so sánh 3 gói cước (*Gói hỗ trợ 270.000 đ*, *Gói chuyên nghiệp 330.000 đ*, *Gói cao cấp 490.000 đ*) với đầy đủ mô tả quy mô chi nhánh, hạn mức tài khoản, tính năng và nút [Mua ngay].

#### Scenario: Bấm Mua ngay trên Gói Chuyên Nghiệp
- **GIVEN** Chủ shop xem bảng giá gói dịch vụ
- **WHEN** Bấm nút [Mua ngay] trên thẻ "Gói chuyên nghiệp"
- **THEN** Hệ thống MUST mở modal Đặt mua `SubscriptionCheckoutModal` với gói mặc định được chọn là Gói Chuyên Nghiệp (330.000 đ/tháng).

---

### Requirement: REQ-03 Ví tiền chủ cửa hàng & Nạp tiền qua VietQR Pro
Hệ thống MUST cung cấp Ví tiền trả trước cho Tenant (`Tenants.WalletBalance`) và cho phép nạp tiền thông qua quét mã Napas VietQR Pro tự động khớp tiền 24/7.

#### Scenario: Nạp tiền vào ví thành công
- **GIVEN** Chủ shop chọn mệnh giá nạp `1.000.000 đ` tại modal nạp tiền
- **WHEN** Chuyển khoản thành công qua mã VietQR
- **THEN** Hệ thống MUST cộng `1.000.000 đ` vào `WalletBalance`, ghi 1 bản ghi vào `TenantWalletTransactions` với `TransactionType = 'TOPUP'`, và cập nhật số dư hiển thị tức thì.

---

### Requirement: REQ-04 Đặt mua & Thanh toán gói dịch vụ bằng Ví tiền hoặc VietQR
Hệ thống MUST cho phép chủ cửa hàng chọn kỳ hạn (6 tháng, 1 năm tặng 1 tháng, 2 năm tặng 3 tháng), mua thêm tiện ích chi nhánh/kho, và hỗ trợ thanh toán trừ tiền trực tiếp từ số dư ví hoặc quét VietQR trực tiếp.

#### Scenario: Thanh toán mua gói thành công bằng Số Dư Ví
- **GIVEN** Tổng tiền gói dịch vụ cần thanh toán là `3.960.000 đ` và số dư ví của Tenant là `5.000.000 đ`
- **WHEN** Chủ shop bấm "Thanh toán bằng Ví" và xác nhận
- **THEN** Hệ thống MUST:
  1. Trừ `3.960.000 đ` từ `Tenants.WalletBalance`.
  2. Ghi 1 bản ghi vào `TenantWalletTransactions` với `TransactionType = 'PURCHASE_PLAN'`.
  3. Cộng thêm 13 tháng vào `Tenants.SubscriptionExpiresAt`.
  4. Cập nhật `Tenants.CurrentPlan`.
  5. Cập nhật số ngày còn lại trên thanh trạng thái chuyển sang trạng thái an toàn.

#### Scenario: Số dư ví không đủ khi thanh toán
- **GIVEN** Tổng tiền thanh toán là `3.960.000 đ` nhưng số dư ví chỉ có `1.000.000 đ`
- **WHEN** Chủ shop chọn phương thức thanh toán bằng ví
- **THEN** Hệ thống MUST thông báo rõ "Số dư ví không đủ (còn thiếu 2.960.000 đ)", vô hiệu hóa nút thanh toán ví và gợi ý nạp thêm tiền hoặc chuyển sang quét mã VietQR trực tiếp.

---

## Acceptance checklist
- [ ] Giao diện Hub 2 cột chuẩn KiotViet hiển thị mượt mà trên `/store-owner/subscriptions`.
- [ ] Thanh trạng thái hiển thị đúng Gói hiện tại, Ngành hàng, Số chi nhánh, Số ngày đếm ngược và Số dư ví.
- [ ] 3 thẻ gói dịch vụ (270k, 330k, 490k) hiển thị chuẩn phông chữ Be Vietnam Pro, tiền tệ JetBrains Mono, bo tròn Full Pill.
- [ ] Modal nạp tiền ví hoạt động trơn tru với các mệnh giá nhanh và mã VietQR.
- [ ] Modal thanh toán mua gói tính toán chính xác tổng tiền khi thay đổi số tháng và tiện ích phụ.
- [ ] Hỗ trợ thanh toán trừ tiền ví thành công và cập nhật tức thì hạn dùng của shop.
- [ ] Tab Thông tin gian hàng cho phép xem và sửa thông tin cửa hàng.
