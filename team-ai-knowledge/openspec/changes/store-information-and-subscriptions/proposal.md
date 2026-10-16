# Proposal: store-information-and-subscriptions

## Vấn đề
Hiện tại trong hệ thống MT-GRMS, Chủ cửa hàng (Store Owner) sau khi đăng ký vận hành tiệm tạp hóa chưa có phân hệ chuyên biệt để:
1. Xem và cập nhật Thông tin gian hàng (Tên chuỗi/tiệm, Mã gian hàng/Subdomain, Mã số thuế, Hotline, Ngành hàng "Tạp hóa & Siêu thị", Địa chỉ).
2. Theo dõi gói cước hiện tại (`Gói dùng thử` / `Gói chuyên nghiệp`), số chi nhánh đang dùng và đồng hồ đếm ngược hạn sử dụng còn lại (cảnh báo đỏ ví dụ "3 ngày" trước khi bị Soft-Lock theo GB-13).
3. **Quy trình Mua gói dịch vụ & Gia hạn thuê bao (Purchase Subscription Flow)**:
   - Chưa có giao diện so sánh 3 gói cước SaaS chuẩn KiotViet (Gói Hỗ trợ 270.000 đ, Gói Chuyên nghiệp 330.000 đ, Gói Cao cấp 490.000 đ).
   - Chưa có luồng chọn kỳ hạn thanh toán (6 tháng, 1 năm tặng thêm tháng, 2 năm) và cấu hình mua thêm chi nhánh (+270k/chi nhánh) hoặc thêm kho (+150k/kho).
   - Chưa có mục tra cứu Lịch sử mua hàng (Billing History) và Bản xác nhận dịch vụ.
4. **Ví tiền chủ cửa hàng (Store Owner Wallet / Prepaid Balance)**:
   - Chưa có cơ chế Ví tiền trả trước của gian hàng để nạp tiền sẵn, chủ động thanh toán và trừ tiền tự động khi gia hạn hoặc nâng cấp gói dịch vụ.
   - Chưa có giao diện Nạp tiền vào ví qua VietQR và theo dõi lịch sử biến động số dư ví (Top-up & Deduct History).

## Mục tiêu
Xây dựng phân hệ hoàn chỉnh "Quản lý Gian hàng, Gói Dịch Vụ SaaS, Ví Tiền & Đặt Mua Thuê Bao" (Store Information, Subscription & Wallet Hub) cho Store Owner theo đúng chuẩn giao diện thực tế của KiotViet:

### 1. Thanh Menu Điều Hướng (Sidebar Navigation)
- Nhóm 1: Gian hàng $\rightarrow$ `Thông tin gian hàng`.
- Nhóm 2: Gói dịch vụ KiotViet $\rightarrow$ `Gói dịch vụ` (Tab hiển thị chính), `Lịch sử mua hàng`, `Bản xác nhận dịch vụ`.
- Nhóm 3: Khác $\rightarrow$ `Ví tiền & Thanh toán` (Hiển thị số dư ví), `Điều khoản sử dụng`.

### 2. Thanh Tóm Tắt Trạng Thái (Top Summary Bar)
- Gói hiện tại: Badge `Gói dùng thử` hoặc `Gói chuyên nghiệp`.
- Số chi nhánh: `1` hoặc `99+`.
- Ngành hàng: `Tạp hóa & Siêu thị`.
- Hạn sử dụng còn: Badge đếm ngược đỏ nổi bật `3 ngày` (cảnh báo cận hạn theo GB-13).
- **Thẻ Số Dư Ví Tiền (Tenant Wallet Card)**: Hiển thị số dư khả dụng (VD: `1,500,000 đ`) kèm nút **[Nạp tiền vào ví]**.

### 3. Ví Tiền Chủ Cửa Hàng & Luồng Nạp Tiền (Store Owner Wallet & Top-up Flow)
- **Quản lý số dư ví**: Lưu trữ tiền trả trước của Tenant (`Tenants.WalletBalance`).
- **Nạp tiền vào ví qua VietQR Pro**:
  - Chủ shop chọn hoặc nhập số tiền muốn nạp (Gợi ý nhanh: 500k, 1 triệu, 2 triệu, 5 triệu).
  - Hệ thống sinh mã VietQR Pro động chứa mã nạp tiền `TOPUP-xxxxx` và số tiền chính xác.
  - Sau khi chuyển khoản thành công, hệ thống tự động cộng số dư vào ví ngay lập tức (Real-time balance update).
- **Lịch sử biến động ví (Wallet Ledger)**:
  - Bảng sao kê chi tiết: Mã giao dịch, Thời gian, Loại giao dịch (Nạp tiền, Mua gói, Mua thêm chi nhánh/kho, Hoàn tiền), Số tiền biến động (+/-), Số dư sau giao dịch, Phương thức.

### 4. Bảng So Sánh 3 Gói Cước & Quy Trình Mua Gói Bằng Ví / VietQR
- **Gói hỗ trợ (270.000 đ/tháng)**: Dành cho tiệm nhỏ, 1 chi nhánh, 3 tài khoản, VietQR, nút "Mua ngay" xanh mint.
- **Gói chuyên nghiệp (330.000 đ/tháng)**: Quản lý đa chi nhánh (+270k), đa kho (+150k), không giới hạn tài khoản, nút "Mua ngay" xanh KiotViet Blue.
- **Gói cao cấp (490.000 đ/tháng)**: Bán hàng đa kênh sàn TMĐT, TikTok, Zalo, nút "Mua ngay" cam nổi bật.
- **Phương thức thanh toán linh hoạt khi Mua gói**:
  - **Phương thức 1: Thanh toán bằng Số Dư Ví Tiền**: Trừ trực tiếp số dư ví, kích hoạt tức thì không cần thao tác quét mã (nếu số dư đủ). Nếu số dư thiếu, hiển thị gợi ý nạp bù số tiền chênh lệch.
  - **Phương thức 2: Quét mã VietQR Pro trực tiếp**: Quét mã chuyển khoản ngân hàng 24/7.

### 5. Tab Thông Tin Gian Hàng
- Xem và chỉnh sửa thông tin pháp lý doanh nghiệp/tiệm: Tên cửa hàng, Subdomain, Mã số thuế (GB-08), Hotline, Địa chỉ, Email tiếp nhận hóa đơn.

## Phạm vi
- **In scope**:
  - **Frontend React 19 / TypeScript**:
    - Trang `StoreSettingsHubPage.tsx` tại `src/pages/store/`.
    - Component độc lập: `StoreSidebarNav.tsx`, `StoreTopStatusBar.tsx`, `SubscriptionPricingCards.tsx`, `SubscriptionCheckoutModal.tsx`, `StoreWalletModal.tsx` (Nạp tiền ví), `StoreInfoTab.tsx`, `BillingHistoryTab.tsx`, `WalletLedgerTab.tsx`.
    - Tích hợp số dư ví trên Header Topbar và quy trình thanh toán mua gói bằng số dư ví.
  - **Database & Data Dictionary**:
    - Bổ sung cột `WalletBalance (DECIMAL(18,2), DEFAULT 0.00)` trong bảng `Tenants`.
    - Bổ sung bảng `TenantWalletTransactions` (`TransactionID`, `TenantID`, `TransactionCode`, `TransactionType`, `Amount`, `BalanceBefore`, `BalanceAfter`, `PaymentMethod`, `Status`, `CreatedAt`).
  - **Backend API**:
    - `GET /api/v1/tenant/store-info`: Lấy thông tin chi tiết gian hàng.
    - `PUT /api/v1/tenant/store-info`: Cập nhật thông tin gian hàng.
    - `GET /api/v1/tenant/wallet/balance`: Lấy số dư ví hiện tại.
    - `POST /api/v1/tenant/wallet/topup`: Khởi tạo yêu cầu nạp tiền ví và sinh mã VietQR.
    - `GET /api/v1/tenant/wallet/transactions`: Lịch sử biến động số dư ví.
    - `POST /api/v1/tenant/checkout/pay-by-wallet`: Mua/Gia hạn gói dịch vụ bằng cách trừ tiền trong ví.
    - `POST /api/v1/tenant/checkout/create-order`: Khởi tạo thanh toán VietQR trực tiếp.
- **Out of scope**:
  - Rút tiền từ ví về tài khoản ngân hàng (Ví là tài khoản trả trước chuyên dụng để mua và gia hạn dịch vụ phần mềm).

## Người dùng liên quan
- **Store Owner (Chủ chuỗi / Chủ cửa hàng)**: Nạp tiền vào ví, quản lý số dư, thanh toán mua gói và theo dõi sao kê ví.
- **Store Manager (Quản lý cửa hàng)**: Xem thông tin gian hàng và hạn sử dụng (Read-only).

## Tiêu chí thành công
- [ ] Tái hiện chuẩn xác 100% bố cục màn hình KiotViet trong ảnh đính kèm kèm khối quản lý Ví tiền chủ cửa hàng.
- [ ] Cho phép chủ cửa hàng nạp tiền vào ví với các mệnh giá nhanh và quét mã VietQR Pro tự động khớp tiền.
- [ ] Khi mua gói cước, hỗ trợ lựa chọn trừ tiền trực tiếp từ Số dư ví hoặc quét VietQR trực tiếp.
- [ ] Hiển thị bảng sao kê biến động số dư ví chi tiết, minh bạch (Top-up, Trừ tiền mua gói).
- [ ] Tự động cập nhật gói dịch vụ và cộng thêm ngày sử dụng ngay khi giao dịch thành công.
- [ ] Đạt chuẩn 100% `RULE_UI_DESIGN_SYSTEM.md`: Phông `Be Vietnam Pro` + `JetBrains Mono` cho tiền tệ, bo tròn Full Pill (`9999px`) cho nút bấm, Card bo góc `24px - 28px`, 100% Monochrome SVG icon, giao diện tĩnh không nhún nhảy/rung lắc.
