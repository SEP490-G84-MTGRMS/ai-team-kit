# Design Brief: Màn hình Quản lý Chi phí Vận hành & Mua sắm Dịch vụ Ngoài (`service-expenses`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/expenses`, `/expenses`
- **Entry Page**: `src/features/service-expenses/pages/ServiceExpensesPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `ExpenseFilterBar`
  - `ExpenseTable`
  - `CreateExpenseModal`
  - `PayExpenseModal`
  - `BillPreviewModal`
  - `ConfirmModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `POST` | `/api/expenses` | `ExpensesController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/expenses/{id:guid}/approve` | `ExpensesController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/expenses/{id:guid}/reject` | `ExpensesController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/expenses/{id:guid}/cancel` | `ExpensesController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/expenses/{id:guid}/disburse` | `ExpensesController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/expenses/summary` | `ExpensesController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/expenses/{id:guid}` | `ExpensesController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/expenses` | `ExpensesController.Execute` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `ExpenseVoucher`, `CashbookEntry`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
