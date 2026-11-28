# Design Brief: Màn hình Gán Sản phẩm vào Chi nhánh, Giá bán Riêng & Định mức Tồn (`branch-product-catalog`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/stores/products`, `/store-owner/stores/:id/products`, `/store-owner/branches/products`
- **Entry Page**: `src/features/product/pages/StoreProductManagementPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `StoreProductContextCard`
  - `StoreProductFilterBar`
  - `StoreProductTable`
  - `AssignStoreProductModal`
  - `EditStoreProductModal`
  - `StoreProductImportResultModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/branches/quota` | `BranchesController.GetQuota` | JSON DTO / ProblemDetails |
| `GET` | `/api/branches` | `BranchesController.GetBranches` | JSON DTO / ProblemDetails |
| `GET` | `/api/branches/summaries` | `BranchesController.GetBranchSummaries` | JSON DTO / ProblemDetails |
| `GET` | `/api/branches/{id:guid}` | `BranchesController.GetById` | JSON DTO / ProblemDetails |
| `GET` | `/api/branches/{id:guid}/detail` | `BranchesController.GetDetail` | JSON DTO / ProblemDetails |
| `POST` | `/api/branches` | `BranchesController.Create` | JSON DTO / ProblemDetails |
| `PUT` | `/api/branches/{id:guid}` | `BranchesController.Update` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/branches/{id:guid}/status` | `BranchesController.ToggleStatus` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/branches/{id:guid}` | `BranchesController.Delete` | JSON DTO / ProblemDetails |
| `GET` | `/api/branches/products` | `BranchesController.GetAllBranchProducts` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `BranchProduct`, `BranchProductUnitPrice`, `Branch`, `Product`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
