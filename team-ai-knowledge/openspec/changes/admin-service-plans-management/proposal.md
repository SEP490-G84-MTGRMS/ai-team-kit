# Proposal: admin-service-plans-management

## Vấn đề
Hiện tại trên hệ thống quản trị nền tảng MT-GRMS (`MT_GRMS_FRONTEND`), Super Admin đã có màn hình Quản lý Khách hàng thuê (`/admin/tenants`) nhưng **chưa có phân hệ Quản lý Gói dịch vụ SaaS (Service Plans & Subscriptions)**. Toàn bộ các luồng nghiệp vụ thiết lập bảng giá thuê bao, chu kỳ thanh toán, cấu hình hạn mức tài nguyên (số chi nhánh, số nhân sự, dung lượng cơ sở dữ liệu, sao lưu) và các module tính năng mở rộng theo gói cước (đã được định hình trong mẫu `Html/demo/admin/subscriptions.html`, `create_plan.html`, `update_plan.html`, `subscription_detail.html`) vẫn chưa được đưa vào mã nguồn React. Điều này khiến Quản trị viên không thể quản lý các gói cước đang mở bán hoặc ngừng cung cấp cho các chuỗi tạp hóa.

## Mục tiêu
Triển khai trọn bộ phân hệ Quản lý Gói dịch vụ SaaS (CRUD Service Plans & Subscriptions) cho Super Admin trên Frontend React 19, tuân thủ đúng chuẩn giao diện UI Design System (màu chủ đạo Deep Teal, bo góc chuẩn 8px - 10px, bảng dữ liệu font JetBrains Mono) và kết nối điều hướng mượt mà trong hệ thống quản trị.

## Phạm vi
### In scope:
1. **Màn hình Danh sách Gói cước (`/admin/subscriptions`)**:
   - Thẻ KPI tổng quan: Tổng số gói cước, Gói đang mở bán (Active), Gói ngừng bán (Inactive), Tổng Tenant đang thuê bao.
   - Thanh tìm kiếm và bộ lọc trạng thái (Active / Inactive).
   - Bảng dữ liệu gói cước: Mã gói, Tên gói, Đơn giá thuê (tháng/năm), Hạn mức chi nhánh & nhân sự, Số Tenant đang dùng, Trạng thái mở bán.
2. **Khởi tạo Gói cước mới (Create Plan)**:
   - Form nhập thông tin cơ bản: Tên gói, Mã gói (`PLAN_...`), Đơn giá theo tháng/năm, Mô tả gói.
   - Thiết lập Định ngạch Kỹ thuật (Quota): Số chi nhánh tối đa, Số nhân sự tối đa, Dung lượng database, Tần suất sao lưu.
   - Bật/tắt 6 Tính năng Nghiệp vụ Cốt lõi (FEFO date, Mã vạch Barcode, Quy đổi Đa đơn vị thùng/lon, VietQR động, Sổ nợ Zalo, Báo cáo tài chính).
3. **Cập nhật Gói cước (Update Plan)**:
   - Cho phép chỉnh sửa đơn giá, hạn mức tài nguyên, mô tả và kích hoạt/ngưng bán gói cước.
4. **Chi tiết Gói cước (Plan Detail Modal/Page)**:
   - Xem tổng quan thông số kỹ thuật, quota tài nguyên, tính năng kích hoạt và danh sách các Tenant đang sử dụng gói.
5. **Điều hướng & Mock Data**:
   - Tích hợp route `/admin/subscriptions` vào router và menu điều hướng quản trị.
   - Mock data chuẩn 3 gói cước nền tảng: Gói Cơ Bản (Basic), Gói Nâng Cao (Advanced), Gói Doanh Nghiệp (Enterprise).

### Out of scope:
- Tích hợp cổng thanh toán trực tuyến tự động (VNPay/Momo/Stripe Webhook) cho khách hàng tự nâng cấp gói (sẽ thực hiện trong sprint thanh toán tự động).
- Hệ thống xuất hóa đơn điện tử VAT tự động cho từng kỳ gia hạn.

## Người dùng liên quan
- **Super Admin / Platform Administrator**: Quản trị viên cao nhất của nền tảng MT-GRMS, chịu trách nhiệm ban hành bảng giá, hạn mức tài nguyên kỹ thuật và chính sách mở bán gói dịch vụ.
- **Sales & Chăm sóc khách hàng nền tảng**: Tra cứu danh mục gói cước, thông số quota và tính năng để tư vấn cho các chủ tiệm tạp hóa đăng ký thuê bao.

## Tiêu chí thành công
- [ ] Bổ sung route `/admin/subscriptions` vào `router.tsx` và hiển thị liên kết trên menu quản trị.
- [ ] Màn hình danh sách gói cước hiển thị đầy đủ KPI, bộ lọc và bảng dữ liệu chuẩn phong cách KiotViet Style (viền `1px solid #cbd5e1`, bo góc `8px - 10px`).
- [ ] Cung cấp đầy đủ các thao tác CRUD: Xem chi tiết gói, Tạo gói mới, Chỉnh sửa thông tin gói, Bật/Tắt trạng thái mở bán.
- [ ] Form nhập liệu có validation đầy đủ (Mã gói in hoa, Đơn giá > 0, Hạn mức hợp lệ).
- [ ] Mã nguồn bóc tách thành các components độc lập (`features/admin/components/subscriptions/`), không viết monolithic.
- [ ] `npm run build` và `npm test` vượt qua 100% không có lỗi.
