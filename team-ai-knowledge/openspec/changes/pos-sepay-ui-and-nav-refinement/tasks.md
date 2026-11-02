# Tasks: Tinh chỉnh Giao diện Cấu hình SePay thành Trang Độc Lập & Khôi phục Giao diện Gói dịch vụ

## 1. Khôi phục nguyên bản Giao diện Gói dịch vụ
- [x] Khôi phục `StoreSettingsHubPage.tsx` về nguyên trạng (chỉ còn tab `subscriptions`, xóa import tab payment config).
- [x] Khôi phục `StoreSidebarNav.tsx` về danh sách tab ban đầu.
- [x] Khôi phục `AppTopNav.tsx` (nút bánh răng trỏ về `/store-owner/subscriptions`).
- [x] Xóa bỏ file `StorePaymentConfigTab.tsx` thừa.

## 2. Xây dựng Trang Độc Lập Cấu hình SePay
- [x] Tạo component `StorePaymentConfigPage.tsx` tại `src/features/pos/pages/`.
- [x] Thiết kế Form bên trái: Chọn ngân hàng (VietinBank, Vietcombank, BIDV, MB...), số tài khoản, tên chủ thẻ, SePay API Key (ẩn/hiện mắt xem, sao chép nhanh, bảo mật).
- [x] Tích hợp Cẩm nang SePay 5 bước bên phải có Mockup UI SePay chân thực (màn hình API Key và Webhook trên my.sepay.vn).
- [x] Đăng ký route độc lập `/store-owner/payment-config` và `/pos/payment-config` trong `router.tsx`.

## 3. Cập nhật Điều hướng POS
- [x] Cập nhật `PosHeader.tsx`: Nút bánh răng và menu Cấu hình VietQR & SePay điều hướng trực tiếp bằng `navigate('/store-owner/payment-config')`.

## 4. Kiểm thử & Đảm bảo chất lượng (Quality Gate)
- [x] Dọn sạch các import không dùng (`Radio`, `Info`).
- [x] Chạy `tsc -b && vite build` kiểm tra toàn diện, build thành công 100%.
