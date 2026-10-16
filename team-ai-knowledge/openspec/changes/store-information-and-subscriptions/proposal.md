# Proposal: store-information-and-subscriptions

## Vấn đề
Hiện tại trong hệ thống MT-GRMS, Chủ cửa hàng (Store Owner) sau khi đăng ký vận hành tiệm tạp hóa chưa có phân hệ chuyên biệt để:
1. Xem và cập nhật Thông tin gian hàng (Tên chuỗi/tiệm, Mã gian hàng/Subdomain, Mã số thuế, Hotline, Ngành hàng "Tạp hóa & Siêu thị", Địa chỉ).
2. Theo dõi gói cước hiện tại (`Gói dùng thử` / `Gói chuyên nghiệp`), số chi nhánh đang dùng và đồng hồ đếm ngược hạn sử dụng còn lại (cảnh báo đỏ ví dụ "3 ngày" trước khi bị Soft-Lock theo GB-13).
3. **Quy trình Mua gói dịch vụ & Gia hạn thuê bao (Purchase Subscription Flow)**:
   - Chưa có giao diện so sánh 3 gói cước SaaS chuẩn KiotViet (Gói Hỗ trợ 270.000 đ, Gói Chuyên nghiệp 330.000 đ, Gói Cao cấp 490.000 đ).
   - Chưa có luồng chọn kỳ hạn thanh toán (6 tháng, 1 năm tặng thêm tháng, 2 năm) và cấu hình mua thêm chi nhánh (+270k/chi nhánh) hoặc thêm kho (+150k/kho).
   - Chưa có cổng thanh toán VietQR Pro tự động khớp mã đơn và cập nhật hạn hợp đồng tức thì sau khi chuyển khoản.
   - Chưa có mục tra cứu Lịch sử mua hàng (Billing History) và Bản xác nhận dịch vụ.

## Mục tiêu
Xây dựng phân hệ hoàn chỉnh "Quản lý Gian hàng, Gói Dịch Vụ SaaS & Đặt Mua Thuê Bao" (Store Information & Subscription Purchase Hub) cho Store Owner theo đúng chuẩn giao diện thực tế của KiotViet:

### 1. Thanh Menu Điều Hướng (Sidebar Navigation)
- Nhóm 1: Gian hàng $\rightarrow$ `Thông tin gian hàng`.
- Nhóm 2: Gói dịch vụ KiotViet $\rightarrow$ `Gói dịch vụ` (Tab hiển thị chính), `Lịch sử mua hàng`, `Bản xác nhận dịch vụ`.
- Nhóm 3: Khác $\rightarrow$ `Điều khoản sử dụng`, `Thanh toán`.

### 2. Thanh Tóm Tắt Trạng Thái (Top Summary Bar)
- Gói hiện tại: Badge `Gói dùng thử` hoặc `Gói chuyên nghiệp`.
- Số chi nhánh: `1` hoặc `99+`.
- Ngành hàng: `Tạp hóa & Siêu thị`.
- Hạn sử dụng còn: Badge đếm ngược đỏ nổi bật `3 ngày` (cảnh báo cận hạn theo GB-13).

### 3. Bảng So Sánh 3 Gói Cước & Luồng Đặt Mua Dịch Vụ
- **Gói hỗ trợ (270.000 đ/tháng)**: Dành cho tiệm nhỏ, 1 chi nhánh, 3 tài khoản, VietQR, nút "Mua ngay" xanh mint.
- **Gói chuyên nghiệp (330.000 đ/tháng)**: Quản lý đa chi nhánh (+270k), đa kho (+150k), không giới hạn tài khoản, nút "Mua ngay" xanh KiotViet Blue.
- **Gói cao cấp (490.000 đ/tháng)**: Bán hàng đa kênh sàn TMĐT, TikTok, Zalo, nút "Mua ngay" cam nổi bật.

### 4. Quy Trình Mua Gói Dịch Vụ Của Chủ Cửa Hàng (Subscription Checkout & Payment Flow)
- **Bước 1 — Chọn cấu hình mua**:
  - Kỳ hạn thanh toán: 1 năm (Khuyến mãi tặng 1 tháng), 2 năm (Tặng 3 tháng), 6 tháng.
  - Mua thêm chi nhánh: Bộ chọn số lượng chi nhánh phụ (+270.000 đ/chi nhánh/tháng).
  - Mua thêm kho: Bộ chọn số lượng kho phụ (+150.000 đ/kho/tháng).
- **Bước 2 — Tóm tắt đơn hàng & Mã giảm giá**:
  - Chi tiết từng khoản phí, chiết khấu khuyến mại, thuế GTGT (nếu có xuất hóa đơn VAT).
  - Tổng số tiền cần thanh toán hiển thị to, rõ theo chuẩn `font-mono tabular-nums`.
- **Bước 3 — Cổng thanh toán VietQR Pro Động**:
  - Sinh mã VietQR động chứa số tài khoản thụ hưởng của nền tảng, số tiền chính xác và cú pháp chuyển khoản định danh duy nhất (VD: `SUB 89210`).
  - Hỗ trợ thanh toán qua Napas, Visa / MasterCard, hoặc Chuyển khoản ngân hàng.
- **Bước 4 — Xác nhận & Tự động gia hạn**:
  - Hệ thống nhận tín hiệu thanh toán $\rightarrow$ Tự động cộng thêm ngày sử dụng vào `Tenants.SubscriptionExpiresAt`, cập nhật `CurrentPlan`, giải tỏa trạng thái ân hạn/Soft-Lock (nếu có), và ghi vết hóa đơn vào Lịch sử mua hàng.

### 5. Tab Thông Tin Gian Hàng
- Xem và chỉnh sửa thông tin pháp lý doanh nghiệp/tiệm: Tên cửa hàng, Subdomain, Mã số thuế (GB-08), Hotline, Địa chỉ, Email tiếp nhận hóa đơn.

## Phạm vi
- **In scope**:
  - **Frontend React 19 / TypeScript**:
    - Trang `StoreSettingsHubPage.tsx` tại `src/pages/store/`.
    - Bóc tách component độc lập: `StoreSidebarNav.tsx`, `StoreTopStatusBar.tsx`, `SubscriptionPricingCards.tsx`, `SubscriptionCheckoutModal.tsx`, `StoreInfoTab.tsx`, `BillingHistoryTab.tsx`.
    - Modal thanh toán VietQR Pro tự động khớp tiền khi bấm "Mua ngay" / "Gia hạn".
    - Tích hợp liên kết điều hướng vào Topbar / Header của Store Owner (`StoreOwnerTopbar.tsx`).
  - **Database & Data Dictionary**:
    - Sử dụng các trường đã chuẩn hóa trong bảng `Tenants`: `Name`, `Subdomain`, `TaxCode`, `Hotline`, `Address`, `City`, `CurrentPlan`, `SubscriptionExpiresAt`, `GracePeriodExpiresAt`.
    - Kết nối bảng `SubscriptionPlans` và `CashBooks` / hóa đơn dịch vụ.
  - **Backend API**:
    - `GET /api/v1/tenant/store-info`: Lấy thông tin chi tiết gian hàng.
    - `PUT /api/v1/tenant/store-info`: Cập nhật thông tin gian hàng.
    - `GET /api/v1/tenant/subscription-status`: Lấy gói hiện tại, số chi nhánh, số ngày còn lại.
    - `GET /api/v1/tenant/pricing-plans`: Lấy danh sách 3 gói dịch vụ đang mở bán.
    - `POST /api/v1/tenant/checkout/calculate`: Tính toán chi phí đơn mua gói (gồm số tháng, chi nhánh phụ, kho phụ, mã giảm giá).
    - `POST /api/v1/tenant/checkout/create-order`: Khởi tạo đơn hàng thanh toán và sinh mã VietQR Pro.
    - `POST /api/v1/tenant/checkout/confirm-payment`: Giả lập/Xác nhận thanh toán và tự động gia hạn hợp đồng.
- **Out of scope**:
  - Tích hợp cổng thẻ quốc tế Visa/Master thật với ngân hàng trung gian (mô phỏng VietQR động).

## Người dùng liên quan
- **Store Owner (Chủ chuỗi / Chủ cửa hàng)**: Người sở hữu toàn quyền quản trị gian hàng và thanh toán tiền mua gói SaaS.
- **Store Manager (Quản lý cửa hàng)**: Xem thông tin gian hàng và hạn sử dụng (Read-only).

## Tiêu chí thành công
- [ ] Tái hiện chuẩn xác 100% bố cục màn hình KiotViet trong ảnh đính kèm (Sidebar điều hướng, Thanh KPI trên cùng, Bảng 3 gói dịch vụ 270k - 330k - 490k).
- [ ] Bóc tách đầy đủ thành các component độc lập, không viết monolithic.
- [ ] Bấm nút "Mua ngay" mở Modal Đặt mua & Thanh toán cho phép chọn kỳ hạn (6T/1N/2N), thêm chi nhánh/kho, xem tổng tiền minh bạch.
- [ ] Tích hợp mã VietQR Pro sinh động kèm đồng hồ đếm ngược chờ chuyển khoản.
- [ ] Sau khi xác nhận thanh toán thành công, hệ thống tự động gia hạn ngày hết hạn trên thanh trạng thái và chuyển gói dịch vụ tương ứng.
- [ ] Tab "Thông tin gian hàng" cho phép xem và cập nhật thông tin cửa hàng.
- [ ] Đạt chuẩn 100% `RULE_UI_DESIGN_SYSTEM.md`: Phông `Be Vietnam Pro` + `JetBrains Mono`, bo tròn Full Pill (`9999px`) cho nút bấm, Card bo góc `24px - 28px`, 100% Monochrome SVG icon, giao diện tĩnh không nhún nhảy/rung lắc.
