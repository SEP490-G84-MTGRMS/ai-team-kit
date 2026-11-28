# Proposal: Màn hình Quản lý Gói cước SaaS & Hạn ngạch Dịch vụ (`admin-subscription-plans`)

## Vấn đề
Master Admin cần thiết lập linh hoạt các gói cước thương mại (Gói Thường, Gói Pro), đơn giá, hạn ngạch chi nhánh/nhân sự/dung lượng lưu trữ và bật/tắt mở bán.

## Mục tiêu
Quản lý trọn vẹn vòng đời gói cước SaaS gồm danh sách KPIs, form tạo mới có xem trước trực quan (`PlanLivePreviewCard`), chi tiết khách đang dùng gói và cập nhật cấu hình.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/admin/subscriptions`, `/admin/subscriptions/create`, `/admin/subscriptions/:id`, `/admin/subscriptions/:id/edit` (`src/pages/admin/SubscriptionPlanPage.tsx`, `src/pages/admin/SubscriptionPlanCreatePage.tsx`, `src/pages/admin/SubscriptionPlanDetailPage.tsx`, `src/pages/admin/SubscriptionPlanEditPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `PlanKPIBanner`, `PlanFilterToolbar`, `PlanDataTable`, `PlanBasicInfoForm`, `PlanQuotasForm`, `PlanFeaturesForm`, `PlanLivePreviewCard`, `PlanTenantsCard`, `PlanDangerZone`.
  - Tích hợp đầy đủ với tầng API Backend (`AdminPlansController`) và thực thể nghiệp vụ (`SubscriptionPlan`, `Tenant`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/admin/subscriptions`, `/admin/subscriptions/create`, `/admin/subscriptions/:id`, `/admin/subscriptions/:id/edit` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Quản trị viên nền tảng (Master Admin)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/admin/subscriptions`, `/admin/subscriptions/create`, `/admin/subscriptions/:id`, `/admin/subscriptions/:id/edit`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-05` (FE-21).
