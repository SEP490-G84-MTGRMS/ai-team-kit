# Design Brief: store-information-and-subscriptions

## 1. Luồng Trải Nghiệm Người Dùng (User Flows)

### Luồng 1: Xem Thông Tin & Trạng Thái Gói Dịch Vụ
1. Store Owner đăng nhập, bấm vào Avatar hoặc Menu "Gói dịch vụ" $\rightarrow$ Điều hướng tới `/store-owner/subscriptions` (Store Settings Hub).
2. Thanh trạng thái trên cùng hiển thị:
   - Gói hiện tại: `Gói dùng thử`
   - Số chi nhánh: `99+`
   - Ngành hàng: `Tạp hóa & Siêu thị`
   - Hạn sử dụng còn: `3 ngày` (Badge đỏ cảnh báo cận hạn)
   - Số dư ví tiền: `1.500.000 đ` kèm nút `[+ Nạp tiền]`.
3. Bảng hiển thị trực quan 3 gói dịch vụ KiotViet với đầy đủ tính năng và nút [Mua ngay].

### Luồng 2: Nạp Tiền Vào Ví Trả Trước (Wallet Top-up Flow)
1. Chủ shop bấm nút **[+ Nạp tiền]** bên cạnh số dư ví.
2. Mở modal `StoreWalletTopupModal`:
   - Chọn nhanh mệnh giá: 500k, 1 triệu, 2 triệu, 5 triệu hoặc nhập số tiền tùy chọn (tối thiểu 100.000 đ).
   - Bấm **"Tiếp tục"**: Hệ thống sinh mã VietQR Pro chứa số tiền và nội dung chuyển khoản `TOPUP {TenantCode}`.
3. Chủ shop quét mã chuyển khoản qua app ngân hàng bất kỳ (Napas 24/7).
4. Hệ thống xác nhận giao dịch thành công: Số dư ví tăng ngay lập tức, ghi vào lịch sử biến động ví.

### Luồng 3: Đặt Mua & Thanh Toán Gói Dịch Vụ (Checkout Flow)
1. Chủ shop bấm **[Mua ngay]** trên gói mong muốn (ví dụ: *Gói chuyên nghiệp 330.000 đ/tháng*).
2. Mở modal `SubscriptionCheckoutModal`:
   - Chọn kỳ hạn: `1 năm` (Tặng 1 tháng $\rightarrow$ tính tiền 12 tháng, dùng 13 tháng), `2 năm` (Tặng 3 tháng), hoặc `6 tháng`.
   - Chọn thêm chi nhánh phụ: +270.000 đ/chi nhánh/tháng.
   - Chọn thêm kho phụ: +150.000 đ/kho/tháng.
   - Nhập mã giảm giá Voucher (nếu có).
   - Tóm tắt tổng tiền: `Thành tiền = (Giá gói + Tiện ích thêm) * Số tháng - Giảm giá`.
3. Chọn Phương thức thanh toán:
   - **Tùy chọn A — Trừ tiền từ Ví**:
     - Nếu số dư ví $\ge$ Tổng tiền: Nút **"Thanh toán ngay bằng Ví"** sáng lên. Bấm xác nhận $\rightarrow$ Trừ số dư ví, tự động gia hạn gói ngay lập tức!
     - Nếu số dư ví < Tổng tiền: Hiển thị thông báo "Số dư ví không đủ (còn thiếu X đ)", kèm nút "Nạp thêm tiền" hoặc chuyển sang VietQR.
   - **Tùy chọn B — Quét mã VietQR Pro trực tiếp**: Sinh mã QR đơn hàng để thanh toán từng lần.
4. Sau khi thanh toán thành công:
   - `Tenants.CurrentPlan` cập nhật gói mới.
   - `Tenants.SubscriptionExpiresAt` được cộng dồn thêm số ngày tương ứng (ví dụ: +395 ngày cho gói 1 năm tặng 1 tháng).
   - Cảnh báo đỏ đếm ngược ngày chuyển về màu xanh an toàn (ví dụ: "còn 398 ngày").
   - Ghi bản ghi vào `Lịch sử mua hàng` và `TenantWalletTransactions`.

---

## 2. Cấu Trúc Component Giao Diện (React 19 / TypeScript)

```
src/pages/store/
├── StoreSettingsHubPage.tsx            # Trang chính (Layout 2 cột: Sidebar trái + Content phải)
└── components/
    ├── StoreSidebarNav.tsx             # Menu điều hướng bên trái 3 nhóm (Gian hàng, Gói cước, Khác)
    ├── StoreTopStatusBar.tsx           # Thanh 4 thẻ tóm tắt (Gói, Chi nhánh, Ngành hàng, Hạn dùng + Ví)
    ├── SubscriptionPricingCards.tsx    # Bảng 3 thẻ so sánh gói cước (270k, 330k, 490k)
    ├── SubscriptionCheckoutModal.tsx   # Modal cấu hình mua gói, tính tiền & chọn thanh toán Ví/QR
    ├── StoreWalletTopupModal.tsx       # Modal nạp tiền vào ví qua VietQR
    ├── StoreInfoTab.tsx                # Tab xem & sửa thông tin gian hàng (Tên, MST, Hotline, Địa chỉ)
    ├── BillingHistoryTab.tsx           # Tab bảng lịch sử hóa đơn mua gói dịch vụ
    └── WalletLedgerTab.tsx             # Tab bảng sao kê lịch sử biến động số dư ví
```

---

## 3. Đặc Tả Thay Đổi Cơ Sở Dữ Liệu (Database Schema Changes)

### 3.1 Bổ sung vào bảng `Tenants`
```sql
ALTER TABLE Tenants ADD WalletBalance DECIMAL(18,2) NOT NULL DEFAULT 0.00;
```
- `WalletBalance`: Lưu trữ số dư tiền trả trước khả dụng của gian hàng.

### 3.2 Bảng Mới: `TenantWalletTransactions` (Sổ quỹ ví trả trước)
| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng buộc | Ý nghĩa nghiệp vụ |
|---|---|:---:|---|---|
| `TransactionID` | `UUID` | ❌ | **PK**, `NEWID()` | Định danh giao dịch ví |
| `TenantID` | `UUID` | ❌ | **FK** $\rightarrow$ `Tenants` | Thuộc gian hàng nào |
| `TransactionCode`| `VARCHAR(30)` | ❌ | **UK**, `UNIQUE` | Mã giao dịch (VD: `WAL-20261016-001`) |
| `TransactionType`| `VARCHAR(30)` | ❌ | `TOPUP`, `PURCHASE_PLAN`, `PURCHASE_ADDON`, `REFUND` | Loại giao dịch biến động |
| `Amount` | `DECIMAL(18,2)`| ❌ | `> 0` | Số tiền giao dịch |
| `BalanceBefore` | `DECIMAL(18,2)`| ❌ | | Số dư ví trước giao dịch |
| `BalanceAfter` | `DECIMAL(18,2)`| ❌ | | Số dư ví sau giao dịch |
| `Description` | `NVARCHAR(255)`| ✔️ | | Mô tả nội dung giao dịch |
| `PaymentMethod` | `VARCHAR(30)` | ❌ | `VietQR`, `Wallet`, `BankTransfer` | Phương thức giao dịch |
| `Status` | `VARCHAR(30)` | ❌ | `Pending`, `Success`, `Failed` | Trạng thái giao dịch |
| `CreatedAt` | `DATETIME2` | ❌ | `GETUTCDATE()` | Thời điểm giao dịch (bất biến) |

---

## 4. Danh Sách Endpoint Backend API

| Method | Endpoint | Mục Đích |
|---|---|---|
| `GET` | `/api/v1/tenant/store-info` | Lấy thông tin gian hàng (Tên, Mã subdomain, MST, Hotline, Địa chỉ) |
| `PUT` | `/api/v1/tenant/store-info` | Cập nhật thông tin gian hàng |
| `GET` | `/api/v1/tenant/subscription-status` | Lấy thông tin gói hiện tại, hạn dùng đếm ngược, số dư ví |
| `GET` | `/api/v1/tenant/pricing-plans` | Lấy danh mục 3 gói dịch vụ SaaS (270k, 330k, 490k) |
| `POST` | `/api/v1/tenant/wallet/topup` | Khởi tạo giao dịch nạp tiền ví, sinh mã VietQR Pro |
| `GET` | `/api/v1/tenant/wallet/transactions` | Lấy danh sách sao kê biến động số dư ví |
| `POST` | `/api/v1/tenant/checkout/calculate` | Tính toán chi phí đơn mua (Số tháng, tiện ích phụ, voucher) |
| `POST` | `/api/v1/tenant/checkout/pay-by-wallet` | Thanh toán mua/gia hạn gói cước trừ trực tiếp từ số dư ví |
| `POST` | `/api/v1/tenant/checkout/create-qr-order`| Tạo đơn thanh toán qua mã VietQR trực tiếp |
