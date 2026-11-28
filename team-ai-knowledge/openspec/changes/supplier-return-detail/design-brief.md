# Design Brief: Màn hình Chi tiết Duyệt Phản hồi NCC, Sinh PO Đổi hàng & Bàn giao RTV (`supplier-return-detail`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/supplier-returns/:id`
- **Entry Page**: `src/features/supplier-return/pages/SupplierReturnDetailPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `RecordSupplierResponseModal`
  - `CompleteHandoverModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/supplier-returns` | `SupplierReturnsController.GetPaged` | JSON DTO / ProblemDetails |
| `GET` | `/api/supplier-returns/{id:guid}` | `SupplierReturnsController.GetById` | JSON DTO / ProblemDetails |
| `GET` | `/api/supplier-returns/eligible-grns` | `SupplierReturnsController.GetEligibleGrns` | JSON DTO / ProblemDetails |
| `GET` | `/api/supplier-returns/grn-lines/{grnId:guid}` | `SupplierReturnsController.GetGrnLines` | JSON DTO / ProblemDetails |
| `POST` | `/api/supplier-returns` | `SupplierReturnsController.Create` | JSON DTO / ProblemDetails |
| `POST` | `/api/supplier-returns/{id:guid}/submit` | `SupplierReturnsController.Submit` | JSON DTO / ProblemDetails |
| `POST` | `/api/supplier-returns/{id:guid}/supplier-response` | `SupplierReturnsController.RecordSupplierResponse` | JSON DTO / ProblemDetails |
| `POST` | `/api/supplier-returns/{id:guid}/complete-handover` | `SupplierReturnsController.CompleteHandover` | JSON DTO / ProblemDetails |
| `POST` | `/api/supplier-returns/{id:guid}/cancel` | `SupplierReturnsController.Cancel` | JSON DTO / ProblemDetails |
| `POST` | `/api/supplier-returns/{id:guid}/exchange-purchase-orders` | `SupplierReturnsController.CreateExchangePurchaseOrders` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `SupplierReturn`, `PurchaseOrder`, `SupplierAPLedger`, `BranchStock`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
