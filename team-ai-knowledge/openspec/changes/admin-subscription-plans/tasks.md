# Tasks: Màn hình Quản lý Gói cước SaaS & Hạn ngạch Dịch vụ (`admin-subscription-plans`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `SubscriptionPlan`, `Tenant` đảm bảo lọc `TenantId` (`REQ-ADMI-SUBS-PLAN-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `admin-subscription-plans` (`REQ-ADMI-SUBS-PLAN-02`, `REQ-ADMI-SUBS-PLAN-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AdminPlansController.cs` kèm kiểm soát phân quyền RBAC (MasterAdmin) (`REQ-ADMI-SUBS-PLAN-01`, `REQ-ADMI-SUBS-PLAN-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/admin/SubscriptionPlanPage.tsx`, `src/pages/admin/SubscriptionPlanCreatePage.tsx`, `src/pages/admin/SubscriptionPlanDetailPage.tsx`, `src/pages/admin/SubscriptionPlanEditPage.tsx` tại route `/admin/subscriptions` và kết nối API thời gian thực (`REQ-ADMI-SUBS-PLAN-01` → `REQ-ADMI-SUBS-PLAN-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-05` (`REQ-ADMI-SUBS-PLAN-01` → `REQ-ADMI-SUBS-PLAN-04`).
