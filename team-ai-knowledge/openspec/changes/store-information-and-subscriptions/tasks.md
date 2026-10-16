# Tasks: store-information-and-subscriptions

## Database Design & Data Dictionary
- [x] T1 — Cập nhật `Database_Design_Data_Dictionary.md` bổ sung cột `WalletBalance` vào bảng `Tenants` và định nghĩa bảng thực thể mới `TenantWalletTransactions` (REQ-03, REQ-04).

## Frontend Components & Layout
- [x] T2 — Xây dựng trang Hub trung tâm `StoreSettingsHubPage.tsx` và thanh điều hướng bên trái `StoreSidebarNav.tsx` 3 nhóm (Gian hàng, Gói dịch vụ, Khác) (REQ-01).
- [x] T3 — Xây dựng thanh trạng thái tóm tắt `StoreTopStatusBar.tsx` (Gói hiện tại, Số chi nhánh, Ngành hàng, Đếm ngược hạn dùng cảnh báo đỏ, Thẻ số dư ví kèm nút Nạp tiền) (REQ-01, REQ-03).
- [x] T4 — Xây dựng bảng 3 thẻ so sánh gói dịch vụ `SubscriptionPricingCards.tsx` (Gói Hỗ trợ 270k, Gói Chuyên nghiệp 330k, Gói Cao cấp 490k) chuẩn KiotViet (REQ-02).
- [x] T5 — Xây dựng hộp thoại Đặt mua & Thanh toán `SubscriptionCheckoutModal.tsx` (chọn kỳ hạn 6T/1N/2N, thêm tiện ích chi nhánh/kho, hỗ trợ thanh toán trừ tiền ví và quét VietQR) (REQ-04).
- [x] T6 — Xây dựng hộp thoại Nạp tiền vào ví `StoreWalletTopupModal.tsx` qua mã VietQR và tab sao kê biến động ví `WalletLedgerTab.tsx` (REQ-03).
- [x] T7 — Xây dựng tab Thông tin gian hàng `StoreInfoTab.tsx` cho phép xem và cập nhật thông tin cửa hàng (REQ-01).
- [x] T8 — Đăng ký route `/store-owner/subscriptions` và `/store-owner/settings` trong `src/app/router.tsx`, gắn link điều hướng từ `StoreOwnerTopbar.tsx` (REQ-01).

## Verification & Interactive Testing
- [x] T9 — Kiểm thử giao diện trên trình duyệt (thay đổi kỳ hạn tính tiền, nạp tiền ví, thanh toán trừ số dư ví, cập nhật ngày hết hạn, kiểm tra responsive mobile/desktop) (REQ-01, REQ-02, REQ-03, REQ-04).
