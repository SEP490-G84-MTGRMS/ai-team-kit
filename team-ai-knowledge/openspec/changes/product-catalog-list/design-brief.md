# Design Brief: Màn hình Quản lý Danh mục Hàng hóa Master, Đa Đơn vị tính & Bảng giá (`product-catalog-list`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/products`, `/products`
- **Entry Page**: `src/features/product/pages/ProductListPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `MasterProductFilterBar`
  - `MasterProductTable`
  - `ProductFormModal`
  - `ProductDetailModal`
  - `ProductDeleteConfirmModal`
  - `CategoryModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/products` | `ProductsController.GetProducts` | JSON DTO / ProblemDetails |
| `GET` | `/api/products/{id:guid}` | `ProductsController.GetById` | JSON DTO / ProblemDetails |
| `GET` | `/api/products/barcode/{barcode}` | `ProductsController.GetByBarcode` | JSON DTO / ProblemDetails |
| `GET` | `/api/products/lookup-master` | `ProductsController.LookupMaster` | JSON DTO / ProblemDetails |
| `POST` | `/api/products` | `ProductsController.Create` | JSON DTO / ProblemDetails |
| `PUT` | `/api/products/{id:guid}` | `ProductsController.Update` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/products/{id:guid}` | `ProductsController.Delete` | JSON DTO / ProblemDetails |
| `GET` | `/api/products/{id:guid}/suppliers` | `ProductsController.GetSuppliersForProduct` | JSON DTO / ProblemDetails |
| `GET` | `/api/products/{id:guid}/price-history` | `ProductsController.GetPriceHistory` | JSON DTO / ProblemDetails |
| `GET` | `/api/products/{productId:guid}/units` | `ProductUnitsController.GetUnitsByProductId` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Product`, `ProductUnit`, `ProductPriceHistory`, `Category`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
