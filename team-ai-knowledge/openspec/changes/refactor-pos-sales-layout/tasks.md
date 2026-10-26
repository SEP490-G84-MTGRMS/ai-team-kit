# Tasks: Tối ưu Bố cục Màn hình Bán hàng POS

- [ ] T1: Tạo component `PosCatalogModal.tsx` bọc `PosCatalogGrid` dạng dialog modal chuẩn MT-GRMS với nút đóng ✕, phím ESC và hỗ trợ phím tắt F3. (REQ-POS-LAYOUT-01)
- [ ] T2: Cập nhật `PosCheckoutPage.tsx`: kết nối state mở `PosCatalogModal`, tích hợp toggle F3 và đóng ESC, gỡ bỏ grid inline chèn ép cột trái. (REQ-POS-LAYOUT-01)
- [ ] T3: Cập nhật `pos.css` cho bảng giỏ hàng: bỏ giới hạn cứng 380px, tối ưu padding hàng giỏ hàng để hiển thị thoải mái $\ge 7$ mặt hàng cùng lúc. (REQ-POS-LAYOUT-02)
- [ ] T4: Cập nhật `pos.css` và `PosPaymentPanel.tsx`: mở rộng chiều rộng cột phải lên 450px, tối ưu khoảng cách nội bộ và fieldset chống tràn đáy màn hình. (REQ-POS-LAYOUT-03)
- [ ] T5: Kiểm tra toàn diện giao diện và chạy `npm run build` để xác minh không có lỗi TypeScript hay layout breaking. (REQ-POS-LAYOUT-01, REQ-POS-LAYOUT-02, REQ-POS-LAYOUT-03)
