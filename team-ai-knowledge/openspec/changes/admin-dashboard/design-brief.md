# Design Brief: Màn hình Tổng quan Quản trị Hệ thống SaaS (Master Admin Dashboard) (`admin-dashboard`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/admin`, `/admin/dashboard`
- **Entry Page**: `src/pages/admin/AdminDashboardPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `KpiCard`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/admin/dashboard/kpis` | `AdminDashboardController.GetKpis` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/dashboard/plan-distribution` | `AdminDashboardController.GetPlanDistribution` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/dashboard/urgent-alerts` | `AdminDashboardController.GetUrgentAlerts` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/dashboard/analytics` | `AdminDashboardController.GetMonthlyAnalytics` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/dashboard/overview` | `AdminDashboardOverviewController.Get` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `Tenant`, `SubscriptionPlan`, `PaymentTransaction`.
- **Vai trò được phép truy cập**: `MasterAdmin`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
