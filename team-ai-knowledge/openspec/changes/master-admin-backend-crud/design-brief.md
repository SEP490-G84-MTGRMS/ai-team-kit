# Design Brief: SaaS Master Admin Backend CRUD & Dashboard Capability

## 1. Kiến trúc tổng thể (Architecture Design)
Tuân thủ kiến trúc Clean Architecture 4 tầng của dự án `MT_GRMS_BACKEND`:
```
MT_GRMS.Api (Controllers: AdminPlans, AdminTenants, AdminDashboard)
    ↓ phụ thuộc
MT_GRMS.Application (Interfaces, Services, DTOs, Validators)
    ↓ phụ thuộc
MT_GRMS.Domain (Entities: SubscriptionPlan, Tenant, TenantUser, ValueObjects)
    ↑ được hiện thực bởi
MT_GRMS.Infrastructure (Repositories, EF Core AppDbContext, PostgreSQL)
```

---

## 2. Danh sách Chi tiết DTOs và Endpoint (API Contracts)

### Phân hệ 1: Quản lý Gói cước SaaS (`/api/admin/plans`)

| Phương thức | Đường dẫn API | Request DTO | Response DTO | Mô tả nghiệp vụ |
|---|---|---|---|---|
| `GET` | `/api/admin/plans` | `(None)` | `ApiResponse<List<PlanSummaryResponse>>` | Lấy danh sách toàn bộ gói cước kèm số tenant đang dùng |
| `GET` | `/api/admin/plans/{id}` | `(Path: id)` | `ApiResponse<PlanDetailResponse>` | Lấy chi tiết gói cước và danh sách tenant liên kết |
| `POST` | `/api/admin/plans` | `CreatePlanRequest` | `ApiResponse<PlanDetailResponse>` | Tạo gói cước mới (mã không được trùng) |
| `PUT` | `/api/admin/plans/{id}` | `UpdatePlanRequest` | `ApiResponse<PlanDetailResponse>` | Cập nhật thông tin, hạn mức, tính năng gói |
| `PATCH`| `/api/admin/plans/{id}/status` | `UpdatePlanStatusRequest`| `ApiResponse<bool>` | Bật hoặc tắt trạng thái kích hoạt của gói cước |

#### Chi tiết DTOs Gói cước:
- **`PlanQuotaDto`**:
  ```csharp
  public record PlanQuotaDto(
      int MaxBranches,        // -1: Không giới hạn
      int MaxEmployees,       // -1: Không giới hạn
      int MaxStorageGb,
      string BackupFrequency  // "Daily", "Weekly", "Hourly"
  );
  ```
- **`PlanFeatureDto`**:
  ```csharp
  public record PlanFeatureDto(
      bool FefoExpiryAlert,
      bool MultiUnitConversion,
      bool VietQrDynamic,
      bool DebtZaloBook,
      bool BarcodeScanning,
      bool FinancialReporting
  );
  ```
- **`CreatePlanRequest`**:
  ```csharp
  public record CreatePlanRequest(
      string Code,
      string Name,
      string Description,
      decimal MonthlyPrice,
      decimal YearlyPrice,
      PlanQuotaDto Quotas,
      PlanFeatureDto Features
  );
  ```
- **`UpdatePlanRequest`**:
  ```csharp
  public record UpdatePlanRequest(
      string Name,
      string Description,
      decimal MonthlyPrice,
      decimal YearlyPrice,
      PlanQuotaDto Quotas,
      PlanFeatureDto Features
  );
  ```
- **`PlanSummaryResponse`**:
  ```csharp
  public record PlanSummaryResponse(
      string Id,
      string Code,
      string Name,
      string Description,
      decimal MonthlyPrice,
      decimal YearlyPrice,
      string Status,         // "Active" | "Inactive"
      int ActiveTenantCount,
      PlanQuotaDto Quotas,
      PlanFeatureDto Features,
      DateTime CreatedAt,
      DateTime? UpdatedAt
  );
  ```

---

### Phân hệ 2: Quản lý Khách thuê (`/api/admin/tenants`)

| Phương thức | Đường dẫn API | Request DTO | Response DTO | Mô tả nghiệp vụ |
|---|---|---|---|---|
| `GET` | `/api/admin/tenants` | `(Query: TenantFilterRequest)` | `ApiResponse<PagedResult<TenantSummaryResponse>>` | Tìm kiếm, phân trang và lọc tenant theo trạng thái |
| `GET` | `/api/admin/tenants/{id}` | `(Path: id)` | `ApiResponse<TenantDetailResponse>` | Xem hồ sơ chi tiết chuỗi, chi nhánh, chủ sở hữu |
| `PUT` | `/api/admin/tenants/{id}` | `UpdateTenantRequest` | `ApiResponse<TenantDetailResponse>` | Cập nhật thông tin hành chính của khách thuê |
| `POST` | `/api/admin/tenants/{id}/lock` | `LockTenantRequest` | `ApiResponse<bool>` | Khóa hoạt động của khách thuê (Soft hoặc Hard) |
| `POST` | `/api/admin/tenants/{id}/unlock` | `(None)` | `ApiResponse<bool>` | Mở khóa và khôi phục hoạt động cho khách thuê |
| `POST` | `/api/admin/tenants/{id}/extend-grace` | `ExtendGraceRequest` | `ApiResponse<DateTime>` | Gia hạn thêm ngày ân hạn thanh toán cho tenant |

#### Chi tiết DTOs Khách thuê:
- **`TenantFilterRequest`**:
  ```csharp
  public record TenantFilterRequest(
      string? Keyword,
      string? Status,        // "all", "active", "expiring", "grace", "locked"
      string? PlanCode,
      int Page = 1,
      int PageSize = 10
  );
  ```
- **`TenantSummaryResponse`**:
  ```csharp
  public record TenantSummaryResponse(
      string Id,
      string Subdomain,
      string Name,
      string TaxCode,
      string City,
      string OwnerName,
      string OwnerEmail,
      string OwnerPhone,
      string Plan,
      int BranchCount,
      int MaxBranches,
      int StaffCount,
      int MaxStaff,
      DateTime? ExpiryDate,
      string Status,
      string? LockType,
      int? GraceDaysRemaining,
      int? DaysUntilExpiry
  );
  ```
- **`LockTenantRequest`**:
  ```csharp
  public record LockTenantRequest(
      string LockType,       // "soft" hoặc "hard"
      string Reason          // Lý do khóa
  );
  ```
- **`ExtendGraceRequest`**:
  ```csharp
  public record ExtendGraceRequest(
      int AdditionalDays,    // Số ngày gia hạn thêm (vd: 7, 14, 30)
      string Reason
  );
  ```

---

### Phân hệ 3: Master Dashboard & KPI Thống kê (`/api/admin/dashboard`)

| Phương thức | Đường dẫn API | Request | Response DTO | Mô tả nghiệp vụ |
|---|---|---|---|---|
| `GET` | `/api/admin/dashboard/kpis` | `(None)` | `ApiResponse<List<KpiMetricResponse>>` | 4 chỉ số tài chính và vận hành cốt lõi |
| `GET` | `/api/admin/dashboard/plan-distribution` | `(None)` | `ApiResponse<List<PlanDistributionResponse>>` | Tỷ trọng khách thuê và doanh thu theo gói |
| `GET` | `/api/admin/dashboard/urgent-alerts` | `(None)` | `ApiResponse<List<UrgentAlertResponse>>` | Cảnh báo khẩn cấp các tenant cần can thiệp |
| `GET` | `/api/admin/dashboard/analytics` | `(None)` | `ApiResponse<List<MonthlyAnalyticsResponse>>` | Doanh thu MRR/ARR và tăng trưởng 12 tháng |

---

## 3. Phân tích Chi tiết Logic Nghiệp vụ của các Services

### A. Logic Service Gói cước (`SubscriptionPlanService`)
1. **Lấy danh sách (`GetAllPlansAsync`)**:
   - Query toàn bộ `SubscriptionPlans` từ DB.
   - Với mỗi gói cước, đếm số `Tenants` đang liên kết có `Status == "ACTIVE"`.
   - Parse `EnabledModulesJson` để ánh xạ ra `PlanQuotaDto` và `PlanFeatureDto`.
2. **Tạo mới gói (`CreatePlanAsync`)**:
   - Kiểm tra `PlanCode` có bị trùng trong DB không (nếu trùng throw `ConflictException`).
   - Validate giá: `MonthlyPrice >= 0`, `YearlyPrice >= 0`.
   - Đóng gói Quotas và Features thành chuỗi JSON lưu vào `EnabledModulesJson`.
   - Lưu vào DB, trả về thông tin gói vừa tạo.
3. **Cập nhật gói (`UpdatePlanAsync`)**:
   - Tìm gói theo Id, nếu không thấy throw `NotFoundException`.
   - Giữ nguyên `PlanCode` (không cho sửa mã để tránh gãy liên kết dữ liệu lịch sử).
   - Cập nhật `PlanName`, `Description`, `PriceMonthly`, `PriceYearly`, `MaxBranches`, `MaxStaff`, `EnabledModulesJson`, `UpdatedAt = DateTime.UtcNow`.
4. **Bật/Tắt kích hoạt (`ToggleStatusAsync`)**:
   - Nếu chuyển từ Active sang Inactive: Kiểm tra xem có Tenant nào đang Active trên gói này không. Nếu có, vẫn cho phép đổi trạng thái nhưng gói sẽ không hiển thị cho Tenant mới đăng ký.

---

### B. Logic Service Khách thuê (`TenantService`)
1. **Truy vấn danh sách có phân trang và bộ lọc (`GetPagedTenantsAsync`)**:
   - Query `Tenants` kèm `SubscriptionPlan`, `Branches`, `TenantUsers`.
   - Áp dụng lọc theo từ khóa: tìm kiếm gần đúng trên `Name`, `Subdomain`, `TaxCode`, `Code`.
   - Áp dụng logic lọc theo trạng thái tính toán động:
     - `locked`: `LockType != null`
     - `expiring`: Chưa bị khóa và `SubscriptionExpiresAt` còn lại từ 0 đến 7 ngày.
     - `grace`: Chưa bị khóa, đã quá hạn thuê nhưng còn trong thời gian ân hạn (`SubscriptionExpiresAt < Now <= GracePeriodExpiresAt`).
     - `active`: Đang hoạt động bình thường và chưa đến hạn cảnh báo.
   - Phân trang chuẩn: `Skip((page - 1) * pageSize).Take(pageSize)`.
2. **Khóa khách thuê (`LockTenantAsync`)**:
   - Tìm tenant theo Id. Nếu không tồn tại throw `NotFoundException`.
   - Ghi nhận `LockType` ("soft" / "hard"), `LockReason` (lý do do Admin nhập), `LockedAt = DateTime.UtcNow`, `LockedBy = currentAdminUser`.
   - Cập nhật `Status = "LOCKED"`.
3. **Mở khóa khách thuê (`UnlockTenantAsync`)**:
   - Xóa bỏ `LockType = null`, `LockReason = null`, `LockedAt = null`, `LockedBy = null`.
   - Tính toán lại `Status`: Nếu còn hạn thì trả về `"ACTIVE"`, nếu đang trong ân hạn thì `"GRACE"`.
4. **Gia hạn ân hạn (`ExtendGracePeriodAsync`)**:
   - Xác định mốc thời gian bắt đầu gia hạn: Nếu `GracePeriodExpiresAt` hiện tại lớn hơn `DateTime.UtcNow` thì cộng tiếp từ mốc đó, ngược lại cộng từ `DateTime.UtcNow`.
   - Cập nhật `GracePeriodExpiresAt = baseDate.AddDays(additionalDays)`.
   - Cập nhật `Status = "GRACE"` nếu trước đó bị quá hạn.

---

### C. Logic Service Thống kê (`AdminDashboardService`)
1. **Tính toán KPIs (`GetKpisAsync`)**:
   - **MRR**: Tổng `PriceMonthly` của tất cả tenant đang `Status == "ACTIVE"`.
   - **Active Tenants**: Đếm số tenant có trạng thái Active.
   - **Total Branches**: Đếm tổng số chi nhánh của toàn bộ các chuỗi cửa hàng trong hệ thống.
   - **Expiring / Grace Tenants**: Đếm số tenant có nguy cơ ngưng hoạt động để Admin chủ động hỗ trợ.
2. **Phân bổ gói cước (`GetPlanDistributionAsync`)**:
   - Gom nhóm (Group by) các tenant theo `CurrentPlan` hoặc `SubscriptionPlan.PlanName`.
   - Tính tỷ lệ phần trăm tenant và tổng doanh thu ước tính theo từng gói.
3. **Cảnh báo khẩn cấp (`GetUrgentAlertsAsync`)**:
   - Lọc ra Top các tenant có `Status` là `locked`, `grace`, hoặc `expiring` sắp xếp theo mức độ ưu tiên thời gian hết hạn gần nhất.

---

## 4. Bảo mật & Phân quyền (Security & Authorization)
- Tất cả các Controller `AdminPlansController`, `AdminTenantsController`, `AdminDashboardController` đều được gán thuộc tính:
  ```csharp
  [Authorize(Roles = "ADMIN")]
  ```
- Token JWT khi gửi lên bắt buộc phải chứa Claim `"role": "ADMIN"`. Nếu sai quyền -> trả về HTTP 403 Forbidden; nếu thiếu token -> trả về HTTP 401 Unauthorized.
