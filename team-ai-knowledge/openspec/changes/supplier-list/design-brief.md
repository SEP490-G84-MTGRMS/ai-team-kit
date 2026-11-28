# Design Brief: Màn hình Danh mục Nhà cung cấp & Quản lý Hồ sơ Chung (`supplier-list`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/suppliers`, `/suppliers`
- **Entry Page**: `src/features/supplier/pages/SupplierListPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `SupplierFilterBar`
  - `SupplierTable`
  - `CreateSupplierModal`
  - `EditSupplierModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/suppliers` | `SuppliersController.GetSuppliers` | JSON DTO / ProblemDetails |
| `GET` | `/api/suppliers/search-suggestions` | `SuppliersController.GetSearchSuggestions` | JSON DTO / ProblemDetails |
| `GET` | `/api/suppliers/{id:guid}` | `SuppliersController.GetById` | JSON DTO / ProblemDetails |
| `POST` | `/api/suppliers` | `SuppliersController.Create` | JSON DTO / ProblemDetails |
| `PUT` | `/api/suppliers/{id:guid}` | `SuppliersController.Update` | JSON DTO / ProblemDetails |
| `PUT` | `/api/suppliers/{id:guid}/basic` | `SuppliersController.UpdateBasic` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/suppliers/{id:guid}/basic` | `SuppliersController.UpdateBasic` | JSON DTO / ProblemDetails |
| `PUT` | `/api/suppliers/{id:guid}/bank` | `SuppliersController.UpdateBank` | JSON DTO / ProblemDetails |
| `PUT` | `/api/suppliers/{id:guid}/vat` | `SuppliersController.UpdateVat` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/suppliers/{id:guid}/status` | `SuppliersController.UpdateStatus` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Supplier`, `SupplierAPLedger`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
