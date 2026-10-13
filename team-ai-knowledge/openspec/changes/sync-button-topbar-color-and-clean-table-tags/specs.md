# Specs: sync-button-topbar-color-and-clean-table-tags

## MODIFIED Requirements

### Requirement: REQ-UI-01 Đồng bộ màu sắc nút Primary với Topbar
Tất cả các nút Primary (nút chính) trong hệ thống MUST sử dụng màu Deep Teal (`#0F766E`) trùng với thanh điều hướng Topbar.

#### Scenario: Hiển thị và tương tác với nút Primary
- GIVEN người dùng truy cập trang Dashboard, Tenant, Supplier hoặc Expense
- WHEN quan sát các nút chính như "Chi tiết", "Xuất báo cáo", "+ Thêm mới", "Chỉnh sửa" và số trang phân trang active
- THEN màu nền nút MUST là `#0F766E` (`var(--blue-primary)`), chữ và icon trắng `#FFFFFF`
- AND khi hover, màu nền chuyển sang `#115E59` (`var(--blue-hover)`).

### Requirement: REQ-UI-02 Loại bỏ viền và khung bọc quanh chữ trong bảng dữ liệu
Các nhãn text trong bảng dữ liệu (Subdomain, Gói dịch vụ, Trạng thái) MUST hiển thị dạng plain-text phẳng, không có đường viền `border` và không có nền hộp capsule.

#### Scenario: Hiển thị nhãn trong bảng dữ liệu
- GIVEN người dùng xem bảng danh sách khách hàng thuê hoặc bảng cảnh báo khẩn cấp
- WHEN quan sát các cột "Subdomain", "Gói Dịch Vụ" (Nâng Cao, Cơ Bản), và "Trạng Thái"
- THEN các chữ MUST KHÔNG có đường viền (`border: none`) bao quanh
- AND nền của các chữ MUST trong suốt (`background: transparent`), hòa nhập sạch sẽ vào nền trắng của bảng.
