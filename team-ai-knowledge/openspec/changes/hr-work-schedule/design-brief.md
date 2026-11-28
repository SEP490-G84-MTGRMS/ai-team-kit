# Design Brief: Màn hình Xếp lịch Phân ca Nhân viên Định kỳ & Kiểm soát Xung đột Ca (`hr-work-schedule`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/employees/schedule`, `/employees/schedule`
- **Entry Page**: `src/features/employee/pages/WorkSchedulePage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `AddScheduleModal`
  - `ScheduleScopeConfirmModal`
  - `CreateScheduleRequestModal`
  - `ScheduleRequestsHistoryModal`
  - `TablePagination`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/schedules` | `SchedulesController.GetSchedules` | JSON DTO / ProblemDetails |
| `GET` | `/api/schedules/my-schedule` | `SchedulesController.GetMySchedule` | JSON DTO / ProblemDetails |
| `GET` | `/api/schedules/{id:guid}` | `SchedulesController.GetById` | JSON DTO / ProblemDetails |
| `POST` | `/api/schedules` | `SchedulesController.Create` | JSON DTO / ProblemDetails |
| `POST` | `/api/schedules/batch` | `SchedulesController.BatchCreate` | JSON DTO / ProblemDetails |
| `POST` | `/api/schedules/recurring` | `SchedulesController.CreateRecurring` | JSON DTO / ProblemDetails |
| `GET` | `/api/schedules/recurring-series` | `SchedulesController.GetRecurringSeries` | JSON DTO / ProblemDetails |
| `PUT` | `/api/schedules/recurring-sync` | `SchedulesController.SyncRecurring` | JSON DTO / ProblemDetails |
| `PUT` | `/api/schedules/{id:guid}` | `SchedulesController.Update` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/schedules/{id:guid}` | `SchedulesController.Delete` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `EmployeeSchedule`, `ShiftConfig`, `Payslip`, `Employee`.
- **Vai trò được phép truy cập**: `StoreOwner`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
