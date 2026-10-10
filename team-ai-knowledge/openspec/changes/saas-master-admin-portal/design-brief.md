# Design Brief: Giao Diện SaaS Master Admin Chuẩn KiotViet

## 1. Phong Cách Thị Giác & Bảng Màu
- **Mã màu**: KiotViet Electric Blue
  - Primary: `#0066FF`, Hover: `#0052CC`, Dark: `#003D99`, Nền nhạt: `#F0F6FF`
  - Nền trang Canvas: `#F4F7FC` / `#F7FAFF`
  - Thẻ Card: `#FFFFFF` tinh khôi, viền `#EDF2F9`
  - Trạng thái: Xanh lá `#00C853` (Active), Cam `#FF9500` (Expiring/Grace), Đỏ `#FF3B30` (Locked/Overdue)
- **Typography**:
  - `Be Vietnam Pro` cho toàn bộ nhãn, tiêu đề, văn bản.
  - `JetBrains Mono` với `tabular-nums` cho subdomain, mã số thuế, hạn ngạch quota, doanh thu.
- **Bo tròn & Không gian**:
  - Full Pill (`border-radius: 9999px`) cho tất cả buttons, badges, quick filter tabs, search bars.
  - Bo góc `20px - 24px` cho các thẻ KPI, khối phân bổ gói, bảng dữ liệu và modal.
- **Solid & Stable**:
  - Không sử dụng bất kỳ hiệu ứng rung lắc, floating bồng bềnh hay pulse animation nào.

## 2. Các Khối UI Cốt Lõi
1. **Sidebar Navigation**: Cố định bên trái, logo SVG, link có active indicator dạng pill xanh.
2. **Topbar**: Tìm kiếm toàn cục, chuông thông báo có chấm đỏ, avatar Super Admin.
3. **Master Dashboard**: 4 KPI cards, thanh tiến trình gói cước, 4 thẻ sức khỏe cronjob, bảng cảnh báo khẩn cấp.
4. **Tenant Management**: Tabs lọc trạng thái, ô tìm kiếm thời gian thực, bảng dữ liệu phân trang KiotViet phẳng, tag subdomain độc quyền.
5. **Interactive Modals**: Hộp thoại xem chi tiết Tenant (Quota & 6 feature flags), Modal gia hạn ân hạn, Modal khóa tài khoản.
