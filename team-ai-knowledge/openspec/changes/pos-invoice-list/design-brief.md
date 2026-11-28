# Design Brief: Màn hình Quản lý Hóa đơn Bán lẻ, Đơn Đặt trước & Đổi trả Hàng tại Quầy (`pos-invoice-list`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/invoices`, `/store-owner/orders`, `/pos/invoices`, `/pos/orders`, `/employee/pos/invoices`
- **Entry Page**: `src/features/pos/pages/InvoiceManagementPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `ReturnExchangeModal`
  - `CreatePreOrderModal`
  - `FulfillPreOrderModal`
  - `PosReceiptModal`
  - `TablePagination`
  - `SortableHeader`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `POST` | `/api/orders` | `OrdersController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/orders/{id:guid}` | `OrdersController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/orders` | `OrdersController.GetOrders` | JSON DTO / ProblemDetails |
| `POST` | `/api/orders/pre-orders` | `OrdersController.CreatePreOrder` | JSON DTO / ProblemDetails |
| `PUT` | `/api/orders/{id:guid}/fulfill` | `OrdersController.FulfillPreOrder` | JSON DTO / ProblemDetails |
| `PUT` | `/api/orders/{id:guid}/cancel` | `OrdersController.CancelOrder` | JSON DTO / ProblemDetails |
| `POST` | `/api/orders/{id:guid}/return-exchange` | `OrdersController.ReturnExchange` | JSON DTO / ProblemDetails |
| `GET` | `/api/orders/summary` | `OrdersController.GetSummary` | JSON DTO / ProblemDetails |
| `POST` | `/api/orders/{id:guid}/print` | `OrdersController.PrintOrder` | JSON DTO / ProblemDetails |
| `POST` | `/api/orders/{id:guid}/confirm-payment` | `OrdersController.ConfirmOrderPayment` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Order`, `OrderDetail`, `BranchStock`, `ShiftCashMovement`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
