# Thiết Kế Chi Tiết (Design Brief): Tích hợp Frontend Master Admin Portal

## 1. Kiến trúc Tầng Tích hợp API (API Integration Architecture)

```
[React Admin Pages / Components]
              │
              ▼
[src/features/admin/api/adminApi.ts] (planApi, tenantApi, dashboardApi)
              │
              ▼
[src/api/httpClient.ts] (Axios + JWT Bearer Interceptor)
              │
              ▼
[Backend ASP.NET Core Web API: /api/v1/admin/*]
              │
              ▼
[PostgreSQL Database: MT-GRMS]
```

## 2. Đặc tả API Client Module (`adminApi.ts`)

### 2.1. `planApi`
- `getPlans(filter?: PlanFilterRequest): Promise<ApiResponse<PlanSummaryResponse[]>>` $\to$ `GET /api/v1/admin/plans`
- `getKpis(): Promise<ApiResponse<PlanKpiBannerResponse>>` $\to$ `GET /api/v1/admin/plans/kpis`
- `getById(id: string): Promise<ApiResponse<PlanDetailResponse>>` $\to$ `GET /api/v1/admin/plans/${id}`
- `create(data: CreatePlanRequest): Promise<ApiResponse<PlanDetailResponse>>` $\to$ `POST /api/v1/admin/plans`
- `update(id: string, data: UpdatePlanRequest): Promise<ApiResponse<PlanDetailResponse>>` $\to$ `PUT /api/v1/admin/plans/${id}`
- `toggleStatus(id: string): Promise<ApiResponse<boolean>>` $\to$ `PATCH /api/v1/admin/plans/${id}/status`
- `delete(id: string): Promise<ApiResponse<boolean>>` $\to$ `DELETE /api/v1/admin/plans/${id}`

### 2.2. `tenantApi`
- `getTenants(filter?: TenantFilterRequest): Promise<ApiResponse<PagedResult<TenantSummaryResponse>>>` $\to$ `GET /api/v1/admin/tenants`
- `getById(id: string): Promise<ApiResponse<TenantDetailResponse>>` $\to$ `GET /api/v1/admin/tenants/${id}`
- `update(id: string, data: UpdateTenantRequest): Promise<ApiResponse<TenantDetailResponse>>` $\to$ `PUT /api/v1/admin/tenants/${id}`
- `lock(id: string, data: LockTenantRequest): Promise<ApiResponse<boolean>>` $\to$ `POST /api/v1/admin/tenants/${id}/lock`
- `unlock(id: string): Promise<ApiResponse<boolean>>` $\to$ `POST /api/v1/admin/tenants/${id}/unlock`
- `extendGrace(id: string, data: ExtendGraceRequest): Promise<ApiResponse<boolean>>` $\to$ `POST /api/v1/admin/tenants/${id}/extend-grace`

### 2.3. `dashboardApi`
- `getKpis(): Promise<ApiResponse<KpiMetricResponse[]>>` $\to$ `GET /api/v1/admin/dashboard/kpis`
- `getPlanDistribution(): Promise<ApiResponse<PlanDistributionResponse[]>>` $\to$ `GET /api/v1/admin/dashboard/plan-distribution`
- `getUrgentAlerts(): Promise<ApiResponse<UrgentAlertResponse[]>>` $\to$ `GET /api/v1/admin/dashboard/urgent-alerts`
- `getMonthlyAnalytics(): Promise<ApiResponse<MonthlyAnalyticsResponse[]>>` $\to$ `GET /api/v1/admin/dashboard/analytics`

## 3. Quy tắc Màn hình & Xử lý Trạng thái (UI State Transitions)
- **Loading State**: Khi component mount hoặc chuyển trang/tab lọc, bật cờ `isLoading: true` hiển thị Skeleton hoặc Spinner.
- **Empty State**: Khi danh sách trả về rỗng (`items.length === 0`), hiển thị `Empty` state thân thiện kèm nút reset bộ lọc.
- **Error Feedback**:
  - Khi xóa gói cước đang có tenant: Backend trả HTTP 400 + `PLAN_IN_USE` $\to$ UI hiển thị Alert đỏ: *"Không thể xóa gói dịch vụ đang có X cửa hàng sử dụng"*.
  - Khi tạo trùng mã gói cước: Backend trả HTTP 400 + `PLAN_DUPLICATE_CODE` $\to$ UI hiển thị thông báo lỗi trên trường mã gói.
- **Data Refresh**: Sau mỗi thao tác Mutation thành công (Tạo gói, Sửa gói, Khóa gian hàng, Mở khóa, Gia hạn), tự động kích hoạt tải lại danh sách mới nhất từ server.
