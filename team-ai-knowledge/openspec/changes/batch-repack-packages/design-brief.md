# Design Brief: Màn hình Đóng khay Chia nhỏ Hàng tươi sống Cân ký & In Tem Barcode Khay (`batch-repack-packages`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/batches/:batchId/packages`, `/employee/batches/:batchId/packages`
- **Entry Page**: `src/features/batch/pages/BatchPackageManagePage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `BatchRepackModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/packages/scan` | `RepackOrdersController.ScanPackage` | JSON DTO / ProblemDetails |
| `GET` | `/api/packages/search` | `RepackOrdersController.SearchPackages` | JSON DTO / ProblemDetails |
| `GET` | `/api/branch-stocks/{branchStockId:guid}/packages` | `RepackOrdersController.GetPackages` | JSON DTO / ProblemDetails |
| `POST` | `/api/repack-orders` | `RepackOrdersController.Create` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/packages/{id:guid}/price` | `RepackOrdersController.UpdatePrice` | JSON DTO / ProblemDetails |
| `POST` | `/api/packages/{id:guid}/quarantine` | `RepackOrdersController.Quarantine` | JSON DTO / ProblemDetails |
| `POST` | `/api/packages/{id:guid}/release` | `RepackOrdersController.Release` | JSON DTO / ProblemDetails |
| `POST` | `/api/packages/{id:guid}/void` | `RepackOrdersController.Void` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `RepackOrder`, `Package`, `BranchStock`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
