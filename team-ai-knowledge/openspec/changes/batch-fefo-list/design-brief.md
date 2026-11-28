# Design Brief: Màn hình Sổ lô Hàng hóa FEFO, Cảnh báo Hạn dùng & Giảm giá Xả hàng (`batch-fefo-list`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/batches`, `/store-owner/expiry`, `/batches`, `/expiry`, `/employee/batches`
- **Entry Page**: `src/features/batch/pages/BatchListPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `BatchFilterBar`
  - `BatchTable`
  - `BatchDetailDrawer`
  - `BatchExpiryAlertModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/batches` | `BatchesController.GetBatches` | JSON DTO / ProblemDetails |
| `GET` | `/api/batches/{id:guid}` | `BatchesController.GetById` | JSON DTO / ProblemDetails |
| `GET` | `/api/batches/alerts` | `BatchesController.GetExpiryAlerts` | JSON DTO / ProblemDetails |
| `POST` | `/api/batches` | `BatchesController.CreateBatch` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/batches/{id:guid}/fefo-discount` | `BatchesController.ApplyFefoDiscount` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `BranchStock`, `Product`, `Supplier`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
