# Design Brief: Màn hình Ma trận Đặt hàng Nhiều ngày & Kiểm soát Cut-off / MOQ (`po-order-matrix`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/purchase-orders/create-matrix`, `/branch/purchase-orders/create-matrix`, `/employee/purchase-orders/create-matrix`
- **Entry Page**: `src/features/purchase-order/pages/OrderMatrixPage.tsx`, `src/features/purchase-order/pages/EmployeeOrderMatrixPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `OrderMatrixHeader`
  - `OrderMatrixFilterBar`
  - `OrderMatrixTable`
  - `OrderMatrixSplitModal`
  - `OrderMatrixImportPreviewModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/purchase-orders` | `PurchaseOrdersController.GetPurchaseOrders` | JSON DTO / ProblemDetails |
| `GET` | `/api/purchase-orders/{id:guid}` | `PurchaseOrdersController.GetById` | JSON DTO / ProblemDetails |
| `GET` | `/api/purchase-orders/matrix` | `PurchaseOrdersController.GetOrderMatrix` | JSON DTO / ProblemDetails |
| `POST` | `/api/purchase-orders/matrix/suggestions` | `PurchaseOrdersController.GetOrderMatrixSuggestions` | JSON DTO / ProblemDetails |
| `GET` | `/api/purchase-orders/dispatch-hub` | `PurchaseOrdersController.GetDispatchHub` | JSON DTO / ProblemDetails |
| `GET` | `/api/purchase-orders/dispatch-hub/suppliers` | `PurchaseOrdersController.GetDispatchSupplierHub` | JSON DTO / ProblemDetails |
| `GET` | `/api/purchase-orders/dispatch-hub/suppliers/{supplierId:guid}` | `PurchaseOrdersController.GetDispatchSupplierDetail` | JSON DTO / ProblemDetails |
| `POST` | `/api/purchase-orders/matrix/draft` | `PurchaseOrdersController.SaveMatrixDraft` | JSON DTO / ProblemDetails |
| `POST` | `/api/purchase-orders/matrix/excel/preview` | `PurchaseOrdersController.PreviewMatrixExcel` | JSON DTO / ProblemDetails |
| `POST` | `/api/purchase-orders/matrix/excel/import` | `PurchaseOrdersController.ImportMatrixExcel` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `PurchaseOrder`, `PurchaseOrderDetail`, `SupplierBranchAssignment`, `SupplierBlackoutDate`, `SupplierProduct`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
