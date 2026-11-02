# Exploration: Nâng cấp Nút Cài Đặt TopBar thành Dropdown Menu Điều Hướng

## 1. Hiện trạng Code (Current State)
- **File liên quan**: `MT_GRMS_FRONTEND/src/layouts/StoreOwnerLayout/AppTopNav.tsx` (dòng 1466-1490).
- Nút Bánh Răng hiện tại là thẻ `<Link to="/store-owner/subscriptions">` đơn lẻ.
- Người dùng không có cách nào từ thanh TopBar để mở trang cấu hình thanh toán `/store-owner/payment-config`.
- Trang `StoreSettingsHubPage.tsx` và `StoreSidebarNav.tsx` đang quản lý các tab gói dịch vụ, lịch sử mua hàng, bản xác nhận của thành viên khác trong team, không được can thiệp vào để tránh xung đột mã nguồn.

## 2. Giả định (Assumptions)
- Chủ cửa hàng (`STORE_OWNER`) khi làm việc trên hệ thống quản trị cần một lối tắt cài đặt tập trung ngay trên thanh TopBar.
- Dropdown menu khi hover chuột vào nút Settings phải có độ trễ tắt (debounce timeout ~220ms) tương tự như dropdown Tài khoản để tránh chuột bị tuột khi di chuyển.

## 3. Non-Goals (Những gì KHÔNG làm)
- Không chỉnh sửa file `StoreSettingsHubPage.tsx` hay `StoreSidebarNav.tsx`.
- Không thay đổi các route hiện có của hệ thống.
- Không thay đổi hành vi của các menu khác trên TopBar (Hàng hóa, Tài chính, Nhân viên...).

## 4. Các Phương Án Kỹ Thuật (Options Comparison)

### Phương án A: Giữ icon bánh răng làm link trực tiếp, thêm mục vào MegaMenu "Cửa hàng"
- **Ưu điểm**: Không cần sửa đổi nút Bánh Răng.
- **Nhược điểm**: Nút Bánh Răng vẫn trỏ cứng vào trang của người khác; người dùng khó tìm thấy vì phải vào menu "Cửa hàng" trong hàng loạt mục con; không đúng với kỳ vọng của user là hover vào icon cài đặt bánh răng.

### Phương án B (CHỌN): Biến icon Bánh Răng thành Dropdown Menu (Hover & Click)
- **Ưu điểm**:
  - Đúng chuẩn UX hệ thống: Hover vào icon Cài Đặt xổ ra menu phân nhóm rõ ràng (Cấu hình VietQR & SePay, Gói dịch vụ & Gia hạn, Thông tin gian hàng).
  - Không động chạm đến code của bạn khác: Nhánh gói dịch vụ trỏ thẳng tới route `/store-owner/subscriptions?tab=...` của bạn ấy.
  - Nhánh cấu hình VietQR trỏ thẳng tới `/store-owner/payment-config`.
  - Tái sử dụng logic debounce timer và click-outside y như menu Tài khoản trên TopNav.
- **Nhược điểm**: Cần thêm state và hiệu ứng dropdown nhỏ cho nút Settings trong `AppTopNav.tsx`.

## 5. Rủi ro & Cách giảm thiểu
- **Rủi ro**: Dropdown bị tràn ra ngoài màn hình do nút Settings nằm sát cạnh phải.
  - **Cách giảm thiểu**: Neo dropdown với `right: 0` (căn lề phải khớp với icon), độ rộng vừa vặn 300-320px.
- **Rủi ro**: Xung đột timer khi di chuột giữa nút Settings và nút Profile.
  - **Cách giảm thiểu**: Định danh riêng `settingsTimerRef` và dọn sạch timer độc lập khi unmount hoặc chuyển trang.
