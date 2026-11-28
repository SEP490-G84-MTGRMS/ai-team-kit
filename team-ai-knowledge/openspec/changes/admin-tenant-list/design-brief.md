# Design Brief: Màn hình Danh sách & Quản lý Gian hàng Thuê (Tenant Management) (`admin-tenant-list`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/admin/tenants`
- **Entry Page**: `src/pages/admin/TenantManagementPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `TenantSearchToolbar`
  - `TenantDataTable`
  - `CreateTenantModal`
  - `ExtendGraceModal`
  - `ApplyLockModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `POST` | `/api/admin/tenants` | `AdminTenantsController.CreateTenant` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/tenants` | `AdminTenantsController.GetTenants` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/tenants/{id}` | `AdminTenantsController.GetById` | JSON DTO / ProblemDetails |
| `PUT` | `/api/admin/tenants/{id}` | `AdminTenantsController.UpdateTenant` | JSON DTO / ProblemDetails |
| `POST` | `/api/admin/tenants/{id}/lock` | `AdminTenantsController.LockTenant` | JSON DTO / ProblemDetails |
| `POST` | `/api/admin/tenants/{id}/unlock` | `AdminTenantsController.UnlockTenant` | JSON DTO / ProblemDetails |
| `POST` | `/api/admin/tenants/{id}/extend-grace` | `AdminTenantsController.ExtendGracePeriod` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Tenant`, `SubscriptionPlan`, `Branch`, `User`.
- **Vai trò được phép truy cập**: `MasterAdmin`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
