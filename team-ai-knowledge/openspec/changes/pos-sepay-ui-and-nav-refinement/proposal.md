# Đề Xuất Cải Tiến (Proposal): Tối Ưu Điều Hướng Nút Cài Đặt & Trực Quan Hóa Giao Diện Hướng Dẫn SePay (pos-sepay-ui-and-nav-refinement)

## 1. Vấn Đề (Problem Statement)
1. **Mất lối vào trang Đăng ký gói:** Nút Bánh Răng trên thanh TopBar quản trị (`AppTopNav.tsx`) vốn là lối tắt chính dẫn đến trang **Gói dịch vụ & Thiết lập gian hàng** (`/store-owner/subscriptions`). Khi gán trực tiếp việc bấm nút vào mở modal cài đặt thanh toán, người dùng bị mất lối tắt để gia hạn hoặc đăng ký gói dịch vụ MT-GRMS.
2. **Hướng dẫn SePay thiếu trực quan (chưa có giao diện mẫu):** Cẩm nang 5 bước hiện tại chủ yếu là mô tả văn bản, người dùng chưa thấy được giao diện thực tế của bảng điều khiển SePay (`my.sepay.vn`). Điều này khiến chủ cửa hàng bỡ ngỡ khi đăng nhập SePay thật: không biết menu "Tích hợp Web" nằm ở đâu, nút "Tạo API Key" trông như thế nào và ô cấu hình Webhook hiển thị ra sao.

## 2. Mục Tiêu (Goals)
1. **Điều hướng thông minh tại Nút Bánh Răng TopBar:**
   - Khi hover hoặc click vào nút Bánh Răng trên `AppTopNav`, hiển thị Dropdown Menu tinh tế với 2 lựa chọn:
     * 💳 **Cấu hình Thanh toán VietQR & SePay:** Mở nhanh Modal thiết lập tài khoản & hướng dẫn.
     * 📦 **Gói dịch vụ & Thiết lập gian hàng:** Chuyển đến trang quản lý gói dịch vụ (`/store-owner/subscriptions`).
   - Tích hợp thêm Tab mới **"Tài khoản thanh toán VietQR"** vào thanh menu bên trái của `StoreSettingsHubPage.tsx` (`StoreSidebarNav.tsx`), giúp chủ tiệm có thể truy cập toàn diện từ trung tâm cài đặt.
2. **Mô Phỏng Trực Quan Giao Diện SePay Thực Tế (Visual SePay Mockup):**
   - Thiết kế giao diện mô phỏng chân thực bảng điều khiển SePay (`my.sepay.vn`) ngay trong Tab Hướng dẫn của `PaymentConfigModal`:
     * Mô phỏng menu bên trái của SePay: *Tổng quan, Tài khoản ngân hàng, Giao dịch, Tích hợp Web (API Key, Webhook)*.
     * Mô phỏng màn hình **Lấy API Key**: Khung mã key, nút "Tạo API Key", nút "Sao chép" kèm mũi tên chú thích rõ ràng.
     * Mô phỏng màn hình **Tạo Webhook**: Ô "Nhập Webhook URL", chọn tài khoản nhận tiền, chọn sự kiện "Nhận tiền (Receive Money)".
   - Giúp Chủ cửa hàng nhìn một lần là hiểu và thao tác được ngay mà không cần đọc nhiều chữ.

## 3. Phạm Vi (Scope)
* **Trong phạm vi (In Scope):**
  - Tinh chỉnh `AppTopNav.tsx`: Dropdown popover tại nút Bánh Răng (chọn Cấu hình thanh toán hoặc Trang Gói dịch vụ).
  - Tích hợp Tab `payment-config` vào `StoreSidebarNav.tsx` và `StoreSettingsHubPage.tsx`.
  - Nâng cấp Tab Hướng dẫn trong `PaymentConfigModal.tsx` với các khối Mockup UI SePay chân thực (màu sắc, icon, layout mô phỏng chuẩn SePay).
* **Ngoài phạm vi (Out of Scope):**
  - Không thay đổi cấu trúc Database hay Backend API (vẫn giữ nguyên 6 lớp bảo mật và endpoints đã nghiệm thu).

## 4. Người Dùng Liên Quan
- **Chủ cửa hàng (`STORE_OWNER`):** Vừa có thể truy cập nhanh cấu hình thanh toán chuyển khoản và xem ảnh giao diện mẫu SePay, vừa không bị mất lối tắt vào trang quản lý gói dịch vụ thuê bao SaaS.

## 5. Tiêu Chí Thành Công Đo Được
1. Bấm nút Bánh Răng trên TopBar có thể lựa chọn dễ dàng giữa "Cấu hình thanh toán" và "Gói dịch vụ MT-GRMS".
2. Trang `StoreSettingsHubPage.tsx` có thêm Tab "Tài khoản thanh toán" hoạt động mượt mà.
3. Tab hướng dẫn hiển thị giao diện mô phỏng SePay sinh động, thể hiện rõ vị trí nút "Tạo API Key" và ô "Dán Webhook".
4. Build Frontend đạt 100% thành công không có lỗi.
