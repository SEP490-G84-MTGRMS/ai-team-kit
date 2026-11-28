# Proposal: Màn hình Danh sách & Quản lý Gian hàng Thuê (Tenant Management) (`admin-tenant-list`)

## Vấn đề
Master Admin cần tra cứu toàn bộ chuỗi cửa hàng thuê trên nền tảng, khởi tạo gian hàng mới, khóa/mở khóa gian hàng vi phạm và gia hạn thời gian ân hạn thanh toán.

## Mục tiêu
Cung cấp bảng quản trị danh sách Tenants có bộ lọc đa tiêu chí, xuất CSV/Excel và các thao tác quản trị vòng đời hợp đồng thuê.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/admin/tenants` (`src/pages/admin/TenantManagementPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `TenantSearchToolbar`, `TenantDataTable`, `CreateTenantModal`, `ExtendGraceModal`, `ApplyLockModal`.
  - Tích hợp đầy đủ với tầng API Backend (`AdminTenantsController`) và thực thể nghiệp vụ (`Tenant`, `SubscriptionPlan`, `Branch`, `User`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/admin/tenants` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Quản trị viên nền tảng (Master Admin)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/admin/tenants`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-02` (FE-21).
