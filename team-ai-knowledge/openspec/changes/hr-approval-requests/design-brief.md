# Design Brief: Màn hình Quản lý & Phê duyệt 4 Loại Đơn từ Ca làm việc Nhân viên (`hr-approval-requests`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/employees/approval-requests`
- **Entry Page**: `src/features/employee/pages/ApprovalRequestsPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `ApprovalRequestsModal`
  - `TablePagination`
  - `NotificationModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `POST` | `/api/schedule-approval-requests` | `ScheduleApprovalRequestsController.CreateRequest` | JSON DTO / ProblemDetails |
| `POST` | `/api/schedule-approval-requests/upload-evidences` | `ScheduleApprovalRequestsController.UploadEvidenceImages` | JSON DTO / ProblemDetails |
| `GET` | `/api/schedule-approval-requests` | `ScheduleApprovalRequestsController.GetAllRequests` | JSON DTO / ProblemDetails |
| `GET` | `/api/schedule-approval-requests/pending` | `ScheduleApprovalRequestsController.GetPendingRequests` | JSON DTO / ProblemDetails |
| `POST` | `/api/schedule-approval-requests/{requestId:guid}/peer-confirm` | `ScheduleApprovalRequestsController.PeerConfirmShiftSwap` | JSON DTO / ProblemDetails |
| `POST` | `/api/schedule-approval-requests/{requestId:guid}/review` | `ScheduleApprovalRequestsController.ReviewRequest` | JSON DTO / ProblemDetails |
| `PUT` | `/api/schedule-approval-requests/{requestId:guid}` | `ScheduleApprovalRequestsController.UpdateRequest` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/schedule-approval-requests/{requestId:guid}` | `ScheduleApprovalRequestsController.DeleteRequest` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `ScheduleApprovalRequest`, `EmployeeSchedule`, `Notification`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
