# Design Brief: Màn hình Xác nhận Nhận hàng Điều chuyển & Ghi nhận Chênh lệch (`transfer-receive`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/transfers/:id/receive`, `/transfers/:id/receive`, `/employee/transfers/:id/receive`
- **Entry Page**: `src/features/transfer/pages/ReceiveTransferPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - Khung bố cục trang chuẩn của Portal kèm bảng/biểu mẫu dữ liệu.

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/transfers` | `TransfersController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/transfers/{id:guid}` | `TransfersController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/transfers/stock-batches` | `TransfersController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/transfers` | `TransfersController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/transfers/{id:guid}/submit` | `TransfersController.Execute` | JSON DTO / ProblemDetails |
| `PUT` | `/api/transfers/{id:guid}/receive` | `TransfersController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/transfers/{id:guid}/dispatch` | `TransfersController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/transfers/{id:guid}/cancel` | `TransfersController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/transfers/{id:guid}/return` | `TransfersController.Execute` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Transfer`, `TransferDetail`, `BranchStock`, `StockOnHand`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
