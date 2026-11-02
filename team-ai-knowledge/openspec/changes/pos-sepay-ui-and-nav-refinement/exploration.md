# Khảo Sát Kỹ Thuật (Exploration): Tối Ưu Nút Bánh Răng & Mô Phỏng Giao Diện SePay Trực Quan (EXP-2026-11-02-002)

## 1. Vấn Đề (Problem Statement)
- Nút Bánh Răng trên thanh TopBar quản trị (`AppTopNav.tsx`) vốn là lối tắt chính của Chủ tiệm để vào trang **Gói dịch vụ & Thiết lập gian hàng** (`/store-owner/subscriptions`). Nếu gán việc click nút này chỉ mở modal cài đặt thanh toán thì người dùng mất đi lối vào trang quản lý và gia hạn gói dịch vụ SaaS.
- Phần hướng dẫn đăng ký SePay hiện tại chỉ là văn bản 5 bước, chưa có giao diện mô phỏng thực tế bảng điều khiển SePay (`my.sepay.vn`). Người dùng khi truy cập trang web SePay thật gặp khó khăn trong việc tìm kiếm menu "Tích hợp Web", vị trí nút "Tạo API Key", và form tạo "Webhook".

## 2. Bối Cảnh & Hiện Trạng Code (Context & Background)
- `src/layouts/StoreOwnerLayout/AppTopNav.tsx`: Chứa nút icon Bánh Răng (line 1466-1490).
- `src/pages/store/StoreSettingsHubPage.tsx`: Là trang tổng hợp thiết lập của gian hàng, hiện có các tab: `store-info`, `subscriptions`, `order-history`, `service-confirm`.
- `src/pages/store/components/StoreSidebarNav.tsx`: Thanh điều hướng bên trái của StoreSettingsHubPage.
- `src/features/pos/components/modals/PaymentConfigModal.tsx`: Chứa Tab 2 "Hướng dẫn đăng ký SePay".

## 3. Ràng Buộc (Constraints)
- Giữ nguyên các chức năng cốt lõi của trang Gói dịch vụ (`subscriptions`) và nạp ví gian hàng.
- Nút Bánh Răng trên TopBar phải phục vụ đa mục đích một cách tiện lợi, không gây xung đột UX.
- Mockup giao diện SePay phải được vẽ bằng SVG / Tailwind CSS thuần để tải nhanh tức thì, không phụ thuộc vào ảnh ngoài (tránh lỗi 404 hoặc mạng chập chờn khi offline).

## 4. Giả Định (Assumptions)
- **[ASSUMPTION-01]**: Người dùng khi hover hoặc click vào nút Bánh Răng trên TopBar muốn thấy menu popover thả xuống cho phép chọn giữa "Cấu hình Thanh toán VietQR & SePay" và "Gói dịch vụ MT-GRMS".
- **[ASSUMPTION-02]**: Mô phỏng giao diện SePay có màu sắc, thanh sidebar và form mẫu giống thực tế `my.sepay.vn` sẽ giúp người dùng nhận diện và thao tác thành công 100% ngay từ lần đầu.

## 5. Đề Xuất & So Sánh Phương Án

### Phương án A (Chọn): Dropdown Popover tại Nút Bánh Răng + Tab Mới Trong Store Hub + Mockup UI SePay Chuẩn
- **Ưu điểm**:
  * Giải quyết trọn vẹn cả 2 nhu cầu: Vừa vào được trang Gói dịch vụ, vừa mở được Cấu hình thanh toán.
  * Thêm Tab "Tài khoản thanh toán VietQR" vào `StoreSettingsHubPage.tsx` giúp hệ thống quản trị chuyên nghiệp, đầy đủ.
  * Mockup giao diện SePay chi tiết bằng component React có các badge "👉 Bấm vào đây", "👉 Copy mã này" cực kỳ trực quan, dễ hiểu.
- **Nhược điểm**: Cần cập nhật thêm `StoreSettingsHubPage.tsx` và `StoreSidebarNav.tsx`.

### Phương án B: Giữ nút bánh răng chỉ vào trang Subscriptions, chuyển nút SePay vào trang cá nhân
- **Ưu điểm**: Không cần làm dropdown trên header.
- **Nhược điểm**: Chủ tiệm khó tìm thấy chỗ cấu hình tài khoản nhận tiền chuyển khoản, phân tán chức năng.

👉 **Lựa chọn**: Phương án A là giải pháp hoàn hảo nhất.
