# Design Brief: Màn hình Cấu hình Ca làm việc Mẫu & Chính sách Chấm công Chi nhánh (`hr-shift-config`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/employees/shifts`, `/employees/shifts`
- **Entry Page**: `src/features/employee/pages/ShiftConfigPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `AttendanceConfigModal`
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
| `GET` | `/api/shift-configs` | `ShiftConfigsController.GetShiftConfigs` | JSON DTO / ProblemDetails |
| `GET` | `/api/shift-configs/{id:guid}` | `ShiftConfigsController.GetById` | JSON DTO / ProblemDetails |
| `POST` | `/api/shift-configs` | `ShiftConfigsController.Create` | JSON DTO / ProblemDetails |
| `PUT` | `/api/shift-configs/{id:guid}` | `ShiftConfigsController.Update` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/shift-configs/{id:guid}/status` | `ShiftConfigsController.UpdateStatus` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/shift-configs/{id:guid}` | `ShiftConfigsController.Delete` | JSON DTO / ProblemDetails |
| `GET` | `/api/attendance-policies/branch/{branchId:guid}` | `BranchAttendancePoliciesController.GetByBranch` | JSON DTO / ProblemDetails |
| `PUT` | `/api/attendance-policies/branch/{branchId:guid}` | `BranchAttendancePoliciesController.UpsertPolicy` | JSON DTO / ProblemDetails |
| `POST` | `/api/attendance-policies/copy` | `BranchAttendancePoliciesController.CopyPolicy` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `ShiftConfig`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
