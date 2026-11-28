# Design Brief: Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ (`customer-crm-debt`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/customers`, `/customers`
- **Entry Page**: `src/features/customer-crm/pages/CustomerManagementPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `CustomerFilterBar`
  - `CustomerTable`
  - `CustomerDrawerDetail`
  - `CustomerFormModal`
  - `DebtCollectionModal`
  - `CustomerDebtLedgerDrawer`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/customers` | `CustomersController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/customers/{id:guid}` | `CustomersController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/customers` | `CustomersController.Execute` | JSON DTO / ProblemDetails |
| `PUT` | `/api/customers/{id:guid}` | `CustomersController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/customers/debts/summary` | `CustomersController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/customers/debt/repay` | `CustomerDebtController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/customers/debt/profile/{customerId:guid}` | `CustomerDebtController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/customers/debt/ledger/{customerId:guid}` | `CustomerDebtController.Execute` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Customer`, `CashbookEntry`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
