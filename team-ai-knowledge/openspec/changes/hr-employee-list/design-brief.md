# Design Brief: Màn hình Danh sách Hồ sơ Nhân viên, Cấp Tài khoản Đăng nhập & Phân quyền RBAC (`hr-employee-list`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/employees`, `/employees`
- **Entry Page**: `src/features/employee/pages/EmployeeListPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `EmployeeFormModal`
  - `EmployeeDetailModal`
  - `ImportEmployeeModal`
  - `TablePagination`
  - `ConfirmModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/employees` | `EmployeesController.GetEmployees` | JSON DTO / ProblemDetails |
| `GET` | `/api/employees/me` | `EmployeesController.GetMyProfile` | JSON DTO / ProblemDetails |
| `GET` | `/api/employees/{id:guid}` | `EmployeesController.GetById` | JSON DTO / ProblemDetails |
| `POST` | `/api/employees` | `EmployeesController.Create` | JSON DTO / ProblemDetails |
| `PUT` | `/api/employees/{id:guid}` | `EmployeesController.Update` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/employees/{id:guid}/status` | `EmployeesController.UpdateStatus` | JSON DTO / ProblemDetails |
| `POST` | `/api/employees/{id:guid}/identity-account` | `EmployeesController.CreateIdentityAccount` | JSON DTO / ProblemDetails |
| `PUT` | `/api/employees/{id:guid}/identity-account` | `EmployeesController.UpdateIdentityAccount` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/employees/{id:guid}` | `EmployeesController.Delete` | JSON DTO / ProblemDetails |
| `POST` | `/api/employees/{id:guid}/face-descriptor` | `EmployeesController.RegisterFaceDescriptor` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Employee`, `EmployeeAllowance`, `User`, `TenantUser`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
