# Design Brief: Màn hình Quản lý Ca làm POS, Bàn giao Z-Report & Khóa sổ Doanh thu Ngày (`pos-shift-management`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/shifts`, `/shifts`
- **Entry Page**: `src/features/pos/pages/PosShiftPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `TablePagination`
  - `SortableHeader`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `POST` | `/api/pos/shifts/open` | `ShiftsController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/pos/shifts/current` | `ShiftsController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/pos/shifts/{id:guid}` | `ShiftsController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/pos/shifts/{id:guid}/cash-movements` | `ShiftsController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/pos/shifts/{id:guid}/close` | `ShiftsController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/pos/shifts/{id:guid}/confirm-handover` | `ShiftsController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/pos/shifts/{id:guid}/z-report` | `ShiftsController.Execute` | JSON DTO / ProblemDetails |
| `GET` | `/api/pos/shifts/history` | `ShiftsController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/pos/shifts/api/pos/cash-movements/{id:guid}/approve` | `ShiftsController.Execute` | JSON DTO / ProblemDetails |
| `POST` | `/api/pos/shifts/api/pos/cash-movements/{id:guid}/reject` | `ShiftsController.Execute` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `ShiftZReport`, `ShiftCashMovement`, `BusinessDayClosing`, `CashbookEntry`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
