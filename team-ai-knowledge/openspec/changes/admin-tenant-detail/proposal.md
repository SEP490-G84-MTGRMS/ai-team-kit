# Proposal: Màn hình Chi tiết Hồ sơ Gian hàng Thuê & Lịch sử Giao dịch SaaS (`admin-tenant-detail`)

## Vấn đề
Master Admin cần xem sâu thông tin pháp lý, hạn ngạch sử dụng thực tế (chi nhánh, nhân sự, dung lượng DB), hồ sơ giao dịch mua gói/nạp ví và thao tác khóa/gia hạn ngay trên trang chi tiết Tenant.

## Mục tiêu
Thiết kế đồng bộ trang chi tiết Tenant hiển thị toàn cảnh trạng thái thuê bao, bản ghi chi nhánh/giao dịch (`TenantRecords`) và các hành động điều khiển dịch vụ.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/admin/tenants/:id` (`src/pages/admin/TenantDetailPage.tsx`, `src/pages/admin/AdminBillingPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `TenantRecords`, `BillingDataTable`, `InvoiceDetailModal`, `ReconcileModal`.
  - Tích hợp đầy đủ với tầng API Backend (`AdminTenantsController`, `AdminTenantRecordsController`) và thực thể nghiệp vụ (`Tenant`, `Branch`, `WalletTransaction`, `AuditLog`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/admin/tenants/:id` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Quản trị viên nền tảng (Master Admin)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/admin/tenants/:id`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-03` (FE-21).
