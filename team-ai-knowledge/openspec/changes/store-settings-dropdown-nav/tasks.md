# Tasks: store-settings-dropdown-nav

## 1. Frontend Development
- [ ] T1: Bổ sung state `settingsMenuOpen`, `settingsMenuRef`, `settingsTimerRef` và các handler hover debounce 220ms trong `AppTopNav.tsx` (REQ-TOPNAV-01).
- [ ] T2: Xây dựng Dropdown Menu UI cho nút Settings gồm 3 nhóm: Cấu hình thanh toán VietQR & SePay, Gói dịch vụ MT-GRMS (Gia hạn gói), và Thông tin gian hàng (REQ-TOPNAV-02).
- [ ] T3: Bổ sung xử lý sự kiện đóng dropdown khi click outside, nhấn phím Escape, và khi URL chuyển trang (REQ-TOPNAV-01).

## 2. Verification & Quality Gate
- [ ] T4: Kiểm tra build TypeScript (`tsc -b && vite build`) đảm bảo 0 lỗi compile (REQ-TOPNAV-03).
- [ ] T5: Kiểm tra xác minh trang `/store-owner/subscriptions` không bị biến đổi và vẫn hoạt động nguyên vẹn (REQ-TOPNAV-03).
