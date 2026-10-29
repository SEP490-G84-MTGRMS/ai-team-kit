# Tasks: master-admin-backend-crud

## DB
- [x] T0 — Xác nhận CSDL: Bảng `SubscriptionPlans` và `Tenants` đã tồn tại đầy đủ trên PostgreSQL (không cần tạo migration mới).

## Backend
- [ ] T1 — Tạo DTOs và FluentValidation cho Subscription Plans (`CreatePlanRequest`, `UpdatePlanRequest`, `PlanQuotaDto`, `PlanFeatureDto`, `PlanSummaryResponse`, `PlanDetailResponse`, `PlanKpiBannerResponse`) (REQ-ADMIN-BE-01)
- [ ] T2 — Tạo DTOs và FluentValidation cho Tenants (`TenantFilterRequest`, `TenantSummaryResponse`, `TenantDetailResponse`, `LockTenantRequest`, `ExtendGraceRequest`) (REQ-ADMIN-BE-02)
- [ ] T3 — Tạo DTOs cho Master Dashboard (`KpiMetricResponse`, `PlanDistributionResponse`, `UrgentAlertResponse`, `MonthlyAnalyticsResponse`) (REQ-ADMIN-BE-03)
- [ ] T4 — Triển khai Repositories (`ISubscriptionPlanRepository`, `SubscriptionPlanRepository`, `ITenantRepository`, `TenantRepository`) trong `MT_GRMS.Infrastructure` (REQ-ADMIN-BE-01, REQ-ADMIN-BE-02)
- [ ] T5 — Triển khai `SubscriptionPlanService` xử lý nghiệp vụ CRUD gói cước, KPI banner, deserialize/serialize JSON Quotas & Features, chặn xóa gói đang có tenant sử dụng (REQ-ADMIN-BE-01)
- [ ] T6 — Triển khai `TenantService` xử lý nghiệp vụ lọc trạng thái, phân trang, khóa Soft/Hard lock, mở khóa, gia hạn ân hạn (REQ-ADMIN-BE-02)
- [ ] T7 — Triển khai `AdminDashboardService` tính toán MRR, Active Tenants, phân bổ gói cước và danh sách cảnh báo khẩn cấp (REQ-ADMIN-BE-03)
- [ ] T8 — Đăng ký DI trong `DependencyInjection.cs` cho các Service và Repository mới (REQ-ADMIN-BE-01, REQ-ADMIN-BE-02, REQ-ADMIN-BE-03)
- [ ] T9 — Xây dựng `AdminPlansController` cung cấp 7 endpoints quản lý gói cước với `[Authorize(Roles = "ADMIN")]` (REQ-ADMIN-BE-01, REQ-ADMIN-BE-04)
- [ ] T10 — Xây dựng `AdminTenantsController` cung cấp 6 endpoints quản lý khách thuê với `[Authorize(Roles = "ADMIN")]` (REQ-ADMIN-BE-02, REQ-ADMIN-BE-04)
- [ ] T11 — Xây dựng `AdminDashboardController` cung cấp 4 endpoints thống kê Dashboard với `[Authorize(Roles = "ADMIN")]` (REQ-ADMIN-BE-03, REQ-ADMIN-BE-04)

## Test
- [ ] T12 — Viết Unit Tests kiểm thử nghiệp vụ CRUD Subscription Plans và validation (kiểm tra trùng mã, chặn xóa gói đang có tenant) (REQ-ADMIN-BE-01)
- [ ] T13 — Viết Unit Tests kiểm thử nghiệp vụ Tenant (lọc trạng thái, khóa Soft/Hard, mở khóa, gia hạn ngày ân hạn) (REQ-ADMIN-BE-02)
- [ ] T14 — Viết Integration Tests kiểm thử Controller và phân quyền `[Authorize(Roles = "ADMIN")]` (chặn 401 khi không có token, chặn 403 khi role không phải ADMIN) (REQ-ADMIN-BE-04)
