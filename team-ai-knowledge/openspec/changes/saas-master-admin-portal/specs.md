# Specs Delta: SaaS Master Admin Capability

## ADDED REQUIREMENTS

### REQ-ADMIN-01: Admin Layout & Navigation
Hệ thống cung cấp `AdminLayout` với:
- Sidebar trái 260px có Logo MT-GRMS, các menu Tổng quan (`/admin/dashboard`), Khách hàng thuê (`/admin/tenants`), Nút Về Trang Chủ (`/`).
- Header trên 70px với tìm kiếm toàn cục, nút thông báo, Profile Super Admin.

### REQ-ADMIN-02: Master Admin Dashboard
Trang `/admin/dashboard` hiển thị:
- 4 thẻ KPI số liệu (Tổng khách hàng: 128, Đang hoạt động: 114, Sắp hết hạn/Khóa: 14, Doanh thu định kỳ: 148.5M đ).
- Thanh tiến trình phân bổ tỷ trọng 3 gói cước (Basic, Advanced, Enterprise).
- Giám sát trạng thái 4 tác vụ tự động (`JOB-01` đến `JOB-04`).
- Bảng danh sách cảnh báo khẩn cấp các chuỗi cửa hàng còn $\le 7$ ngày cần can thiệp.

### REQ-ADMIN-03: Tenant Management
Trang `/admin/tenants` cung cấp:
- Hàng tab lọc theo trạng thái: Tất cả (128), Đang hoạt động (114), Sắp hết hạn $\le 30d$ (9), Đang ân hạn (3), Chờ kích hoạt (2), Bị khóa (5).
- Tìm kiếm theo từ khóa (tên chuỗi, subdomain, email, MST) và lọc theo gói cước.
- Bảng dữ liệu Tenant với các cột: Checkbox, Mã Subdomain, Tên Chuỗi, Chủ Sở Hữu, Gói Cước, Chi Nhánh, Nhân Sự, Hạn Hợp Đồng, Trạng Thái, Hành Động.
- Hộp thoại modal xem chi tiết quota và 6 feature flags của tenant.
- Hộp thoại modal gia hạn ân hạn và modal áp dụng lệnh khóa.
