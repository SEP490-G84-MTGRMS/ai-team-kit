# Design Brief: Màn hình Đối chiếu Chênh lệch, Phê duyệt Cân bằng Kho & Tạo Trả hàng từ Kiểm kê (`stocktake-detail`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/stocktakes/:id`, `/stocktakes/:id`, `/employee/stocktakes/:id`
- **Entry Page**: `src/features/stocktake/pages/StocktakeDetailPage.tsx`
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
| `GET` | `/api/stocktakes` | `StocktakesController.GetPaged` | JSON DTO / ProblemDetails |
| `GET` | `/api/stocktakes/{id:guid}` | `StocktakesController.GetById` | JSON DTO / ProblemDetails |
| `POST` | `/api/stocktakes` | `StocktakesController.Create` | JSON DTO / ProblemDetails |
| `PUT` | `/api/stocktakes/{id:guid}` | `StocktakesController.Update` | JSON DTO / ProblemDetails |
| `POST` | `/api/stocktakes/{id:guid}/submit` | `StocktakesController.Submit` | JSON DTO / ProblemDetails |
| `POST` | `/api/stocktakes/{id:guid}/review` | `StocktakesController.Review` | JSON DTO / ProblemDetails |
| `POST` | `/api/stocktakes/{id:guid}/create-return` | `StocktakesController.CreateReturnFromStocktake` | JSON DTO / ProblemDetails |
| `GET` | `/api/supplier-returns` | `SupplierReturnsController.GetPaged` | JSON DTO / ProblemDetails |
| `GET` | `/api/supplier-returns/{id:guid}` | `SupplierReturnsController.GetById` | JSON DTO / ProblemDetails |
| `GET` | `/api/supplier-returns/eligible-grns` | `SupplierReturnsController.GetEligibleGrns` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Stocktake`, `BranchStock`, `StockOnHand`, `SupplierReturn`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
