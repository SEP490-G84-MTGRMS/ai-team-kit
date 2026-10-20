# Exploration: fe-notification-center

## 1. Hiện Trạng Code & Điểm Bắt Đầu
- File điều hướng trung tâm: `src/layouts/StoreOwnerLayout/AppTopNav.tsx`.
- Nút `BellIcon` hiện chỉ là một phần tử giao diện hiển thị button 32x32px với chấm tròn đỏ cố định (`#FF3B30`), không có sự kiện click, không có dropdown và chưa được gắn kết nối dữ liệu.
- Trong thư mục `src/features/` chưa có module `notifications/`. Các phân hệ nghiệp vụ khác (`pos`, `product`, `service-expenses`, `cashbook`, `reports-pnl`, `tax-snapshot`) đang hoạt động độc lập và chưa phát tín hiệu cảnh báo tập trung về thanh điều hướng.

## 2. Giả Định (Assumptions)
- Giai đoạn hiện tại (Iteration Frontend), hệ thống sẽ lưu trữ và quản lý thông báo qua **Client-side Store (`useNotificationStore`)** với persistent cache lưu trong `localStorage`.
- Dữ liệu thông báo ban đầu được sinh ra từ các sự kiện giả lập (mock event triggers) khớp với 5 phân hệ cốt lõi của MT-GRMS:
  + Lô hàng cận date FEFO (< 3 ngày) từ FE-02.
  + Lệch két tiền kiểm kê ca bán hàng từ FE-17.
  + Khách hàng nợ vượt trần credit limit từ FE-08.
  + Hóa đơn dịch vụ điện/mặt bằng đến hạn từ FE-07.
  + Hạn nộp tờ khai thuế Quý 3 từ FE-19.
- Khi người dùng click vào Deep link hoặc nút hành động nhanh, router React sẽ điều hướng ngay đến URL tương ứng.

## 3. Non-Goals (Ngoài Mục Tiêu)
- Không xây dựng hạ tầng WebSocket server-side hay SignalR push real-time trong change này (sẽ tích hợp sau khi backend hoàn tất notification hub).
- Không gửi SMS / Email / Push Notifications ra ngoài trình duyệt.

## 4. Đánh Giá Các Phương Án (Options Analysis)

### Phương án 1: Chỉ dùng Dropdown Popover tĩnh đơn giản
- **Mô tả:** Khi bấm vào chuông, hiển thị một Popover đơn giản chứa danh sách thông báo phẳng. Bấm vào thì chuyển trang.
- **Ưu điểm:** Cực kỳ đơn giản, tốn ít thời gian làm.
- **Nhược điểm:** Khi số lượng thông báo tăng lên theo thời gian, dropdown trở nên quá dài và khó tra cứu; không thể xem lại các thông báo cũ đã trôi; không có phân loại tab rõ ràng; trải nghiệm thiếu chuyên nghiệp.

### Phương án 2 (Được chọn): Kết hợp Popover Dropdown nhanh + Slide Drawer toàn diện, Nút hành động nhanh (Quick Actions) và 2 Tab tối giản
- **Mô tả:**
  - Bấm vào chuông: Mở **Popover Dropdown** nổi ngay bên dưới chuông, chia 2 tab tối giản ("Chưa đọc" và "Tất cả") cùng nút "Đánh dấu tất cả đã đọc".
  - Mỗi card thông báo có icon màu theo mức độ (Đỏ, Vàng, Xanh dương, Lục) và nút bấm hành động nhanh trực tiếp (VD: "Xem lô", "Thu nợ", "Chi tiền").
  - Phía dưới Popover có nút "Xem tất cả" mở **Slide Drawer trượt từ mép phải** toàn màn hình, hỗ trợ lọc theo mức độ cảnh báo, tìm kiếm và xóa thông báo.
- **Ưu điểm:**
  - Trải nghiệm đa tầng hoàn hảo: Xử lý tức thì tại quầy qua Popover, đối soát kiểm tra sâu qua Drawer.
  - Phù hợp với thói quen người dùng Việt Nam (giao diện Facebook, Shopee).
  - Tăng tốc độ phản ứng của chủ tiệm tạp hóa nhờ nút Quick Action.
- **Nhược điểm:** Cần đầu tư viết component Drawer và Popover tỉ mỉ, kiểm soát animation và z-index chính xác.

## 5. Rủi Ro & Biện Pháp Giảm Thiểu
- **Rủi ro 1: Trùng lặp sự kiện click (Bubbling) giữa Card và Nút Action:**
  - *Giải pháp:* Dùng `e.stopPropagation()` khi bấm vào nút Quick Action để tránh việc click vừa chạy action vừa trigger click card.
- **Rủi ro 2: Z-Index xung đột với Modal hoặc Header cố định:**
  - *Giải pháp:* Đặt `z-index: 1050` cho Popover và `z-index: 1100` cho Drawer, sử dụng Backdrop click-outside an toàn.
- **Rủi ro 3: Dữ liệu localStorage bị tràn:**
  - *Giải pháp:* Giới hạn lưu tối đa 50 thông báo gần nhất trong `localStorage`, các tin cũ hơn tự động dọn dẹp.
