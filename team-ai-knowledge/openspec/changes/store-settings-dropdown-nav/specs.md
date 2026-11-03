# Specs: Nâng cấp Nút Cài Đặt TopBar thành Dropdown Menu Điều Hướng Đa Năng

## ADDED Requirements

### Requirement: REQ-TOPNAV-01 Dropdown Menu Cài Đặt Tương Tác
Hệ thống **MUST** thay thế thẻ `<Link>` tĩnh của icon Bánh Răng trên thanh TopBar (`AppTopNav.tsx`) bằng một Dropdown Menu tương tác.
Khi người dùng rê chuột (hover) hoặc click vào icon Bánh Răng, menu cài đặt **SHALL** mở ra ngay phía dưới với độ trễ đóng (debounce) 220ms để chống giật chuột.

#### Scenario: Chủ cửa hàng rê chuột vào icon bánh răng trên TopBar
- **GIVEN** Người dùng đăng nhập với vai trò `STORE_OWNER` và đang ở trang quản trị bất kỳ.
- **WHEN** Người dùng di chuột (hover) vào icon Bánh Răng ở góc phải TopBar.
- **THEN** Menu Dropdown Cài đặt mở ra mượt mà, icon bánh răng sáng nhẹ.
- **AND** Khi rê chuột ra ngoài khu vực menu, menu đóng lại sau 220ms.

#### Scenario: Đóng menu bằng phím Escape hoặc click ngoài
- **GIVEN** Dropdown Menu Cài đặt đang mở.
- **WHEN** Người dùng bấm phím `Escape` hoặc click chuột ra ngoài vùng menu.
- **THEN** Dropdown Menu Cài đặt lập tức đóng lại mà không gây ảnh hưởng đến trang hiện tại.

---

### Requirement: REQ-TOPNAV-02 Phân Nhóm và Điều Hướng Chuẩn Xác
Dropdown Menu Cài Đặt **MUST** hiển thị đầy đủ 2 nhóm tính năng chính:
1. **Thanh toán & Thu ngân**:
   - Mục `Cấu hình VietQR & SePay` **SHALL** trỏ tới `/store-owner/payment-config`.
2. **Gói dịch vụ MT-GRMS (Gia hạn gói)**:
   - Mục `Gói dịch vụ & Nâng cấp` **SHALL** trỏ tới `/store-owner/subscriptions?tab=subscriptions`.
   - Mục `Lịch sử mua hàng` **SHALL** trỏ tới `/store-owner/subscriptions?tab=order-history`.
   - Mục `Bản xác nhận dịch vụ` **SHALL** trỏ tới `/store-owner/subscriptions?tab=service-confirm`.
3. **Gian hàng**:
   - Mục `Thông tin gian hàng & Chi nhánh` **SHALL** trỏ tới `/store-owner/subscriptions?tab=store-info`.

#### Scenario: Bấm chọn Cấu hình VietQR & SePay
- **GIVEN** Dropdown Menu Cài đặt đang mở.
- **WHEN** Người dùng click vào mục "Cấu hình VietQR & SePay".
- **THEN** Hệ thống điều hướng sang trang `/store-owner/payment-config`.
- **AND** Dropdown Menu tự động đóng lại.

#### Scenario: Bấm chọn Gói dịch vụ & Nâng cấp
- **GIVEN** Dropdown Menu Cài đặt đang mở.
- **WHEN** Người dùng click vào mục "Gói dịch vụ & Nâng cấp".
- **THEN** Hệ thống điều hướng sang trang `/store-owner/subscriptions?tab=subscriptions`.
- **AND** Không gây ảnh hưởng hay lỗi logic ở trang quản lý gói của thành viên khác.

---

### Requirement: REQ-TOPNAV-03 Bảo Toàn Mã Nguồn và Không Xung Đột
Hệ thống **MUST NOT** sửa đổi hay can thiệp vào các component `StoreSettingsHubPage.tsx` và `StoreSidebarNav.tsx`.

#### Scenario: Kiểm tra trang Quản lý Gói dịch vụ
- **GIVEN** Người dùng mở URL `/store-owner/subscriptions`.
- **WHEN** Kiểm tra cấu trúc các tab và giao diện của trang.
- **THEN** Trang hiển thị 100% nguyên bản của module Subscription, không bị xáo trộn hay chứa tab dư thừa.

---

## Acceptance Checklist
- [ ] Dropdown Menu mở khi hover/click icon Bánh Răng.
- [ ] Tự động đóng sau 220ms khi rời chuột hoặc nhấn Escape.
- [ ] Mục "Cấu hình VietQR & SePay" mở đúng trang `/store-owner/payment-config`.
- [ ] Mục "Gói dịch vụ & Nâng cấp" mở đúng trang `/store-owner/subscriptions?tab=subscriptions`.
- [ ] Build Frontend thành công không lỗi TypeScript.
