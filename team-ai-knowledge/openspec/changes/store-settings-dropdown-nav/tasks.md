# Tasks: store-settings-dropdown-nav

## 1. Frontend Development & Refinement
- [x] T1: Bổ sung state `settingsMenuOpen`, `settingsMenuRef`, `settingsTimerRef` và logic hover debounce 220ms cho icon Bánh Răng trong `AppTopNav.tsx` (REQ-TOPNAV-01).
- [x] T2: Dựng Dropdown Menu UI tinh gọn chỉ gồm đúng 2 mục: Cấu hình VietQR & SePay (`/store-owner/payment-config`) và Gói dịch vụ MT-GRMS (`/store-owner/subscriptions`), không phát sinh các nút phụ (REQ-TOPNAV-02).
- [x] T3: Bổ sung xử lý sự kiện đóng dropdown khi click outside, nhấn Escape, và khi đổi route (REQ-TOPNAV-01).
- [x] T4: Xóa nút Cài đặt và menu Cấu hình trong màn hình Quầy POS (`PosHeader.tsx`) vì bên ngoài TopNav đã có sẵn (REQ-TOPNAV-01).
- [x] T5: Xóa nút "Quay lại" trong trang độc lập Cấu hình thanh toán (`StorePaymentConfigPage.tsx`) (REQ-TOPNAV-01).

## 2. Verification & Quality Gate
- [x] T6: Kiểm tra biên dịch TypeScript và đóng gói Vite (`tsc -b && vite build`) đạt 100% không lỗi (REQ-TOPNAV-03).
- [x] T7: Đảm bảo giao diện và mã nguồn trang Gói dịch vụ (`StoreSettingsHubPage.tsx`) giữ nguyên bản 100% (REQ-TOPNAV-03).
