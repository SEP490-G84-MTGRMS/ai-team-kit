# Proposal: store-information-and-subscriptions

## Vấn đề
Hiện tại trong hệ thống MT-GRMS, Chủ cửa hàng (Store Owner) sau khi đăng ký vận hành tiệm tạp hóa chưa có màn hình chuyên biệt để quản lý Hồ sơ gian hàng và theo dõi Gói thuê bao SaaS. Cụ thể:
1. Chưa có màn hình xem và cập nhật Thông tin gian hàng (Tên chuỗi/tiệm, Mã gian hàng/Subdomain, Mã số thuế, Hotline, Ngành hàng "Tạp hóa & Siêu thị", Địa chỉ).
2. Chưa có thanh trạng thái theo dõi gói cước hiện tại (`Gói dùng thử` / `Gói chuyên nghiệp`), số chi nhánh đang dùng và đồng hồ đếm ngược hạn sử dụng còn lại (cảnh báo đỏ ví dụ "3 ngày").
3. Chưa có bảng giá so sánh trực quan 3 gói dịch vụ SaaS tiêu chuẩn (Gói Hỗ trợ 270.000 đ, Gói Chuyên nghiệp 330.000 đ, Gói Cao cấp 490.000 đ) để chủ tiệm chủ động nâng cấp hoặc gia hạn gói cước qua VietQR.
4. Chưa có mục tra cứu Lịch sử mua hàng và Bản xác nhận dịch vụ theo chuẩn KiotViet.

## Mục tiêu
Xây dựng phân hệ "Quản lý Gian hàng & Gói Dịch Vụ SaaS" (Store Information & Subscription Hub) cho Store Owner theo chuẩn giao diện thực tế của KiotViet (đường dẫn `https://thuymoclaocai.kiotviet.vn/man/#/AccountManagement?AccountType=account-info`):
- **Thanh menu điều hướng bên trái (Sidebar Navigation)** gồm 3 nhóm:
  - Nhóm 1: Gian hàng $\rightarrow$ `Thông tin gian hàng`.
  - Nhóm 2: Gói dịch vụ KiotViet $\rightarrow$ `Gói dịch vụ` (Tab hiển thị chính), `Lịch sử mua hàng`, `Bản xác nhận dịch vụ`.
  - Nhóm 3: Khác $\rightarrow$ `Điều khoản sử dụng`, `Thanh toán`.
- **Thanh tóm tắt trạng thái trên cùng (Top Summary Bar)**:
  - Gói hiện tại: Badge `Gói dùng thử` hoặc `Gói chuyên nghiệp`.
  - Số chi nhánh: `1` hoặc `99+`.
  - Ngành hàng: `Tạp hóa & Siêu thị`.
  - Hạn sử dụng còn: Badge đếm ngược đỏ nổi bật `3 ngày` (cảnh báo nguy cơ Soft-Lock theo GB-13).
- **Bảng so sánh 3 gói cước SaaS (3 Pricing Cards)**:
  - **Gói hỗ trợ (270.000 đ/tháng)**: Dành cho tiệm nhỏ, 1 chi nhánh, 3 tài khoản, VietQR, nút "Mua ngay" xanh mint.
  - **Gói chuyên nghiệp (330.000 đ/tháng)**: Quản lý đa chi nhánh (+270k), đa kho (+150k), không giới hạn tài khoản, nút "Mua ngay" xanh KiotViet Blue.
  - **Gói cao cấp (490.000 đ/tháng)**: Bán hàng đa kênh sàn TMĐT, TikTok, Zalo, nút "Mua ngay" cam nổi bật.
- **Tab Thông tin gian hàng**:
  - Xem và chỉnh sửa thông tin pháp lý doanh nghiệp/tiệm: Tên cửa hàng, Subdomain, Mã số thuế (GB-08), Hotline, Địa chỉ, Email tiếp nhận hóa đơn.
- **Nút tổng đài hỗ trợ khẩn cấp**: Huy hiệu nổi góc dưới phải `1900 6522`.

## Phạm vi
- **In scope**:
  - **Frontend React 19 / TypeScript**:
    - Trang `StoreSettingsHubPage.tsx` tại `src/pages/store/` hoặc `src/features/tenant/`.
    - Bóc tách component độc lập: `StoreSidebarNav.tsx`, `StoreTopStatusBar.tsx`, `SubscriptionPricingCards.tsx`, `StoreInfoTab.tsx`, `BillingHistoryTab.tsx`.
    - Modal thanh toán VietQR Pro khi bấm "Mua ngay" hoặc "Gia hạn".
    - Tích hợp liên kết điều hướng vào Topbar / Header của Store Owner (`StoreOwnerTopbar.tsx`).
  - **Database & Data Dictionary**:
    - Sử dụng các trường đã chuẩn hóa trong bảng `Tenants`: `Name`, `Subdomain`, `TaxCode`, `Hotline`, `Address`, `City`, `CurrentPlan`, `SubscriptionExpiresAt`, `GracePeriodExpiresAt`.
    - Kết nối bảng `SubscriptionPlans` và `CashBooks` / hóa đơn dịch vụ.
  - **Backend API**:
    - `GET /api/v1/tenant/store-info`: Lấy thông tin chi tiết gian hàng.
    - `PUT /api/v1/tenant/store-info`: Cập nhật thông tin gian hàng.
    - `GET /api/v1/tenant/subscription-status`: Lấy gói hiện tại, số chi nhánh, số ngày còn lại.
    - `GET /api/v1/tenant/pricing-plans`: Lấy danh sách 3 gói dịch vụ đang mở bán.
    - `POST /api/v1/tenant/purchase-plan`: Khởi tạo đơn thanh toán gia hạn gói qua VietQR.
- **Out of scope**:
  - Tích hợp cổng thanh toán ngân hàng trực tiếp qua thẻ quốc tế Visa/Master thật (giai đoạn này mô phỏng VietQR động).

## Người dùng liên quan
- **Store Owner (Chủ chuỗi / Chủ cửa hàng)**: Người sở hữu toàn quyền quản trị gian hàng và chi trả phí dịch vụ SaaS.
- **Store Manager (Quản lý cửa hàng)**: Xem thông tin gian hàng và hạn sử dụng (Read-only).

## Tiêu chí thành công
- [ ] Tái hiện chuẩn xác 100% bố cục màn hình KiotViet trong ảnh đính kèm (Sidebar điều hướng, Thanh KPI trên cùng, Bảng 3 gói dịch vụ 270k - 330k - 490k).
- [ ] Bóc tách đầy đủ thành các component độc lập (`StoreSidebarNav`, `StoreTopStatusBar`, `SubscriptionPricingCards`, `StoreInfoTab`), không viết monolithic.
- [ ] Hiển thị chính xác gói hiện tại, số chi nhánh, ngành hàng và số ngày sử dụng còn lại với badge màu cảnh báo tương ứng.
- [ ] Bấm nút "Mua ngay" / "Gia hạn" mở modal VietQR thanh toán tự động khớp tiền.
- [ ] Tab "Thông tin gian hàng" cho phép xem và cập nhật thông tin cửa hàng.
- [ ] Đạt chuẩn 100% `RULE_UI_DESIGN_SYSTEM.md`: Phông `Be Vietnam Pro` + `JetBrains Mono`, bo tròn Full Pill (`9999px`) cho nút bấm, Card bo góc `24px - 28px`, 100% Monochrome SVG icon, giao diện tĩnh vững chãi, không nhún nhảy.
