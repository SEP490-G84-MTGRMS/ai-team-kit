# Đặc Tả Yêu Cầu (Delta Specs): Tối Ưu Nút Bánh Răng & Mockup SePay Trực Quan (pos-sepay-ui-and-nav-refinement)

## ADDED Requirements

### Requirement: REQ-NAV-SETTINGS-01 Dropdown Tùy Chọn Nút Bánh Răng TopBar
Hệ thống **MUST** hiển thị Dropdown Menu khi người dùng bấm vào nút Bánh Răng trên thanh TopBar (`AppTopNav.tsx`). Menu này **MUST** cung cấp 2 tùy chọn phân định rõ ràng:
1. "Cấu hình Thanh toán VietQR & SePay" (mở `PaymentConfigModal`).
2. "Gói dịch vụ MT-GRMS & Gia hạn" (điều hướng sang `/store-owner/subscriptions`).

#### Scenario: Chủ cửa hàng bấm nút Bánh Răng để chọn chức năng
- **GIVEN** Người dùng đang ở bất kỳ trang quản trị nào có thanh `AppTopNav`
- **WHEN** Người dùng click vào icon Bánh Răng cài đặt
- **THEN** Dropdown menu hiển thị ngay dưới nút với 2 mục: Cấu hình thanh toán và Gói dịch vụ. Bấm vào Gói dịch vụ thì chuyển đến trang `/store-owner/subscriptions`; bấm vào Cấu hình thanh toán thì mở modal `PaymentConfigModal`.

---

### Requirement: REQ-STORE-HUB-PAYMENT-01 Tab Cấu Hình Thanh Toán Trong StoreSettingsHubPage
Hệ thống **MUST** bổ sung thêm Tab "Tài khoản thanh toán VietQR" (`payment-config`) vào thanh menu bên trái của trang `StoreSettingsHubPage.tsx`. Tab này **SHALL** cho phép Chủ cửa hàng xem và chỉnh sửa thông tin tài khoản ngân hàng, SePay API Key, và xem hướng dẫn kết nối trực tiếp trên trang quản trị gian hàng.

#### Scenario: Chủ cửa hàng truy cập Tab Cấu hình thanh toán trong Store Hub
- **GIVEN** Chủ cửa hàng đang ở trang `StoreSettingsHubPage.tsx`
- **WHEN** Người dùng bấm vào mục "Tài khoản thanh toán VietQR" trên thanh sidebar bên trái
- **THEN** Giao diện hiển thị form cấu hình ngân hàng thụ hưởng, số tài khoản, tên chủ tài khoản, API Key SePay và nút xem hướng dẫn đăng ký SePay trực quan.

---

### Requirement: REQ-SEPAY-VISUAL-MOCKUP-01 Mockup Giao Diện SePay Trực Quan Chân Thực
Tab Hướng Dẫn Đăng Ký SePay trong `PaymentConfigModal` **MUST** tích hợp các khối mockup mô phỏng chân thực giao diện bảng điều khiển SePay (`my.sepay.vn`):
1. Mockup màn hình **Tích hợp Web → API Key**: Thể hiện rõ thanh menu bên trái của SePay, nút `+ Tạo API Key`, ô hiển thị key và nút `Sao chép` kèm callout chỉ dẫn nổi bật.
2. Mockup màn hình **Tích hợp Web → Webhooks**: Thể hiện form tạo webhook với ô nhập URL, chọn tài khoản nhận tiền và sự kiện nhận tiền.

#### Scenario: Chủ cửa hàng xem hướng dẫn đăng ký SePay có mockup giao diện
- **GIVEN** Modal `PaymentConfigModal` đang mở ở Tab "Hướng Dẫn Đăng Ký SePay"
- **WHEN** Người dùng cuộn xuống xem các bước 3 và 4
- **THEN** Người dùng nhìn thấy khung mô phỏng trực quan chuẩn màu sắc và layout của SePay, có mũi tên chỉ dẫn nổi bật: "👉 BƯỚC 3: Bấm Copy mã này dán sang MT-Mart" và "👉 BƯỚC 4: Dán link Webhook vào đây", giúp người dùng thao tác chính xác 100% khi sang trang SePay thật.

---

## Acceptance Checklist
- [ ] Nút Bánh Răng trên TopBar có menu dropdown không làm mất lối vào trang Gói dịch vụ.
- [ ] Trang `StoreSettingsHubPage.tsx` có thêm Tab "Tài khoản thanh toán VietQR".
- [ ] Cẩm nang hướng dẫn SePay hiển thị khung Mockup giao diện thực tế rõ ràng, trực quan.
- [ ] Build Frontend thành công 100% (0 lỗi).
