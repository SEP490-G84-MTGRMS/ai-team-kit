# Design Brief: Màn hình Quản lý Gói cước SaaS & Hạn ngạch Dịch vụ (`admin-subscription-plans`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/admin/subscriptions`, `/admin/subscriptions/create`, `/admin/subscriptions/:id`, `/admin/subscriptions/:id/edit`
- **Entry Page**: `src/pages/admin/SubscriptionPlanPage.tsx`, `src/pages/admin/SubscriptionPlanCreatePage.tsx`, `src/pages/admin/SubscriptionPlanDetailPage.tsx`, `src/pages/admin/SubscriptionPlanEditPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `PlanKPIBanner`
  - `PlanFilterToolbar`
  - `PlanDataTable`
  - `PlanBasicInfoForm`
  - `PlanQuotasForm`
  - `PlanFeaturesForm`
  - `PlanLivePreviewCard`
  - `PlanTenantsCard`
  - `PlanDangerZone`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/admin/plans` | `AdminPlansController.GetPlans` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/plans/kpis` | `AdminPlansController.GetKpis` | JSON DTO / ProblemDetails |
| `GET` | `/api/admin/plans/{id}` | `AdminPlansController.GetById` | JSON DTO / ProblemDetails |
| `POST` | `/api/admin/plans` | `AdminPlansController.CreatePlan` | JSON DTO / ProblemDetails |
| `PUT` | `/api/admin/plans/{id}` | `AdminPlansController.UpdatePlan` | JSON DTO / ProblemDetails |
| `PATCH` | `/api/admin/plans/{id}/status` | `AdminPlansController.ToggleStatus` | JSON DTO / ProblemDetails |
| `DELETE` | `/api/admin/plans/{id}` | `AdminPlansController.DeletePlan` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `SubscriptionPlan`, `Tenant`.
- **Vai trò được phép truy cập**: `MasterAdmin`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
