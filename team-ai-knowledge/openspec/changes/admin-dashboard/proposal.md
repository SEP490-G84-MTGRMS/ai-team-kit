# Proposal: Màn hình Tổng quan Quản trị Hệ thống SaaS (Master Admin Dashboard) (`admin-dashboard`)

## Vấn đề
Quản trị viên nền tảng SaaS cần theo dõi tức thời số lượng gian hàng đang hoạt động, doanh thu bán gói cước, cơ cấu phân bổ gói dịch vụ và các cảnh báo gian hàng sắp hết hạn.

## Mục tiêu
Hiển thị bảng điều khiển tổng hợp KPIs nền tảng theo kỳ (Tháng này, Tháng trước, Quý này), biểu đồ phân bổ gói dịch vụ và danh sách cảnh báo khẩn cấp.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/admin`, `/admin/dashboard` (`src/pages/admin/AdminDashboardPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `KpiCard`.
  - Tích hợp đầy đủ với tầng API Backend (`AdminDashboardController`, `AdminDashboardOverviewController`) và thực thể nghiệp vụ (`Tenant`, `SubscriptionPlan`, `PaymentTransaction`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/admin`, `/admin/dashboard` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Quản trị viên nền tảng (Master Admin)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/admin`, `/admin/dashboard`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-01` (FE-21).
