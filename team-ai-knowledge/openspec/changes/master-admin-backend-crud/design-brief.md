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

## 2. Thiết kế Chi tiết Phân hệ Quản lý Gói dịch vụ SaaS (Subscription Plans)

Khớp 100% với hợp đồng dữ liệu phía Frontend (`plan.types.ts`, `mockPlanData.ts`, `planValidation.ts`):

### 2.1. Cấu trúc lưu trữ dữ liệu JSON (`EnabledModulesJson`)
Do bảng `SubscriptionPlans` trong CSDL có sẵn cột `EnabledModulesJson` (text), hệ thống sẽ đóng gói có cấu trúc (Strongly-typed Metadata):
```json
{
  "description": "Mô tả chi tiết gói cước phù hợp đối tượng nào...",
  "quotas": {
    "maxBranches": 1,
    "maxEmployees": 3,
    "maxStorageGb": 5,
    "backupFrequency": "Weekly"
  },
  "features": {
    "fefoExpiryAlert": true,
    "multiUnitConversion": true,
    "vietQrDynamic": true,
    "debtZaloBook": false,
    "barcodeScanning": true,
    "financialReporting": false
  }
}
```
*Đồng thời đồng bộ `MaxBranches` và `MaxStaff` trực tiếp vào 2 cột cùng tên của bảng `SubscriptionPlans` để tăng tốc độ truy vấn.*

---

### 2.2. Danh sách Endpoint API Quản lý Gói dịch vụ (`/api/admin/plans`)

| Phương thức | Đường dẫn API | Request Body | Response DTO | Mô tả nghiệp vụ |
|---|---|---|---|---|
| `GET` | `/api/admin/plans` | `[Query] PlanFilterRequest` | `ApiResponse<List<PlanSummaryResponse>>` | Lấy danh sách gói cước (lọc theo keyword, status) |
| `GET` | `/api/admin/plans/kpis` | `(None)` | `ApiResponse<PlanKpiBannerResponse>` | Lấy số liệu 4 thẻ KPI trên đầu màn hình gói cước |
| `GET` | `/api/admin/plans/{id}` | `(Path: id)` | `ApiResponse<PlanDetailResponse>` | Lấy chi tiết gói cước và danh sách tenant liên kết |
| `POST` | `/api/admin/plans` | `CreatePlanRequest` | `ApiResponse<PlanDetailResponse>` | Tạo mới gói cước SaaS |
| `PUT` | `/api/admin/plans/{id}` | `UpdatePlanRequest` | `ApiResponse<PlanDetailResponse>` | Cập nhật thông tin, giá, hạn mức, tính năng |
| `PATCH`| `/api/admin/plans/{id}/status`| `UpdatePlanStatusRequest` | `ApiResponse<bool>` | Bật hoặc tắt trạng thái kích hoạt (Active/Inactive) |
| `DELETE`| `/api/admin/plans/{id}` | `(None)` | `ApiResponse<bool>` | Xóa gói cước (chặn nếu đang có tenant sử dụng) |

---

### 2.3. Chi tiết DTOs và Quy tắc Validation

#### `PlanQuotaDto`
```csharp
public record PlanQuotaDto(
    int MaxBranches,        // Tối thiểu 1 hoặc -1 (vô hạn)
    int MaxEmployees,       // Tối thiểu 1 hoặc -1 (vô hạn)
    int MaxStorageGb,       // Tối thiểu 1 GB
    string BackupFrequency  // "Daily" | "Weekly" | "Hourly"
);
```

#### `PlanFeatureDto`
```csharp
public record PlanFeatureDto(
    bool FefoExpiryAlert,       // Quản lý date FEFO 3 mức màu
    bool MultiUnitConversion,   // Quy đổi đa đơn vị thùng/lon
    bool VietQrDynamic,         // VietQR động khớp tiền tự động
    bool DebtZaloBook,          // Sổ nợ Zalo & Bán hàng nợ
    bool BarcodeScanning,       // Quét mã vạch Barcode POS
    bool FinancialReporting     // Báo cáo tài chính & Sổ quỹ chuyên sâu
);
```

#### `CreatePlanRequest`
```csharp
public record CreatePlanRequest(
    string Code,                // Regex: ^[A-Z0-9_]+$, ví dụ: PLAN_PRO_MAX
    string Name,                // 3 - 100 ký tự
    string Description,         // Mô tả gói
    decimal MonthlyPrice,       // >= 0 VNĐ
    decimal YearlyPrice,        // >= 0 VNĐ
    PlanQuotaDto Quotas,
    PlanFeatureDto Features
);
```
**Quy tắc kiểm tra (FluentValidation)**:
- `Code`: Bắt buộc, chữ in hoa/số/gạch dưới (`^[A-Z0-9_]+$`), kiểm tra duy nhất trong DB.
- `MonthlyPrice` và `YearlyPrice`: Không được âm (`>= 0`).
- `Quotas.MaxBranches`: `>= 1` hoặc `== -1`.
- `Quotas.MaxEmployees`: `>= 1` hoặc `== -1`.
- `Quotas.MaxStorageGb`: `>= 1`.

#### `UpdatePlanRequest`
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
*(Không cho phép sửa `Code` để bảo toàn tính toàn vẹn liên kết tenant).*

#### `PlanKpiBannerResponse`
```csharp
public record PlanKpiBannerResponse(
    int TotalPlans,             // Tổng số gói hiện có
    int ActivePlans,            // Số gói đang mở kích hoạt
    int TotalActiveTenants,     // Tổng số cửa hàng đang thuê gói
    decimal EstimatedMrr        // Doanh thu định kỳ hàng tháng ước tính
);
```

#### `PlanSummaryResponse` & `PlanDetailResponse`
```csharp
public record PlanTenantSummaryDto(
    string Id,
    string Name,
    string Subdomain,
    int ActiveBranches,
    int ActiveEmployees,
    DateTime JoinedDate,
    DateTime? ExpiryDate
);

public record PlanSummaryResponse(
    string Id,
    string Code,
    string Name,
    string Description,
    decimal MonthlyPrice,
    decimal YearlyPrice,
    string Status,             // "Active" | "Inactive"
    int ActiveTenantCount,
    PlanQuotaDto Quotas,
    PlanFeatureDto Features,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record PlanDetailResponse(
    string Id,
    string Code,
    string Name,
    string Description,
    decimal MonthlyPrice,
    decimal YearlyPrice,
    string Status,
    int ActiveTenantCount,
    PlanQuotaDto Quotas,
    PlanFeatureDto Features,
    List<PlanTenantSummaryDto> Tenants,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
```

---

### 2.4. Logic Chi tiết trong `SubscriptionPlanService`

1. **Lấy danh sách gói (`GetAllPlansAsync`)**:
   - Query danh sách `SubscriptionPlans` chưa bị xóa (`IsDeleted == false`).
   - Hỗ trợ lọc theo `Keyword` (tìm trong `PlanCode`, `PlanName`) và `Status` (`Active` / `Inactive`).
   - Đếm số `Tenants` liên kết đang hoạt động (`Status == "ACTIVE"`).
   - Parse `EnabledModulesJson` để trích xuất `Description`, `Quotas`, `Features`.
2. **Lấy số liệu KPI Banner (`GetPlanKpisAsync`)**:
   - Đếm tổng số gói, số gói `IsActive == true`.
   - Tính tổng số tenant active và tổng doanh thu ước tính `EstimatedMrr = SUM(PriceMonthly của các tenant active)`.
3. **Xem chi tiết gói (`GetPlanByIdAsync`)**:
   - Tìm gói theo Id (nếu không thấy throw `NotFoundException`).
   - Lấy danh sách tenant đang dùng gói này kèm số chi nhánh và nhân sự thực tế.
4. **Tạo mới gói (`CreatePlanAsync`)**:
   - Chuyển `Code` về chữ hoa, kiểm tra trùng lặp trong CSDL (nếu trùng throw `409 Conflict`).
   - Đóng gói DTO thành chuỗi JSON `EnabledModulesJson`.
   - Lưu vào DB, trả về thông tin chi tiết gói vừa tạo (`201 Created`).
5. **Cập nhật gói (`UpdatePlanAsync`)**:
   - Tìm gói theo Id, cập nhật các trường thông tin và serialize lại `EnabledModulesJson`.
6. **Bật/Tắt kích hoạt (`TogglePlanStatusAsync`)**:
   - Cập nhật cờ `IsActive = request.IsActive`, gán `UpdatedAt = DateTime.UtcNow`.
7. **Xóa gói cước (`DeletePlanAsync`)**:
   - **Quy tắc an toàn**: Đếm số `Tenants` đang liên kết với gói cước này. Nếu `ActiveTenantCount > 0`, hệ thống **CHẶN XÓA** và ném lỗi nghiệp vụ:
     `"Không thể xóa gói dịch vụ đang có {activeTenantCount} cửa hàng sử dụng."` (HTTP 400 Bad Request).
   - Nếu `ActiveTenantCount == 0`, tiến hành Soft Delete (`IsDeleted = true`).

---

## 3. Phân hệ Quản lý Khách thuê & Dashboard (Tổng hợp tóm tắt)
*(Chi tiết như đã thiết lập: `AdminTenantsController` cho vòng đời khách thuê Soft/Hard Lock/Gia hạn ân hạn và `AdminDashboardController` cho KPI/Alerts/Analytics).*
