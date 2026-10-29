# EXP-2026-10-29: SaaS Master Admin Backend CRUD & Dashboard Capability

## 1. Hiện trạng code liên quan (Current State)
- **Domain Entities (`MT_GRMS.Domain/Entities/SaaS`)**:
  - `SubscriptionPlan.cs`: Đã có các trường `Id`, `PlanCode`, `PlanName`, `PriceMonthly`, `PriceYearly`, `MaxBranches`, `MaxStaff`, `EnabledModulesJson`, `IsActive`.
  - `Tenant.cs`: Đã có các trường `Id`, `Name`, `Subdomain`, `Code`, `TaxCode`, `Hotline`, `Address`, `City`, `Status`, `CurrentPlan`, `SubscriptionExpiresAt`, `GracePeriodExpiresAt`, `LockType`, `LockReason`, `LockedAt`, `LockedBy`.
- **Database (`PostgreSQL 16`)**:
  - Đã có sẵn 2 bảng `"SubscriptionPlans"` và `"Tenants"` cùng dữ liệu mẫu (Seed Data) chuẩn thông qua migration `InitialPostgreSqlFull34Tables`.
- **Infrastructure & Application**:
  - Đã có `AppDbContext` quản lý `DbSet<SubscriptionPlan>` và `DbSet<Tenant>`.
  - Đã có JWT Bearer Authentication chuẩn xác thực role `ADMIN`.
  - **Khoảng trống (Gap)**: Chưa có `ITenantService`, `ISubscriptionPlanService`, `IAdminDashboardService`, chưa có các DTOs chuyên biệt và các Controller tương ứng ở tầng `MT_GRMS.Api`.

## 2. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Tài khoản gọi vào các API Master Admin phải mang Claim `Role = "ADMIN"` (được mã hóa trong JWT token cấp khi đăng nhập tài khoản hệ thống).
- **[ASSUMPTION-02]**: Hạn mức chi nhánh (`MaxBranches`) và nhân sự (`MaxStaff`) nếu có giá trị `-1` thì được quy ước là "Không giới hạn" (Unlimited).
- **[ASSUMPTION-03]**: Các tính năng mở rộng của gói cước (FEFO, VietQR, Sổ nợ, Báo cáo chuyên sâu...) được đóng gói lưu trữ dạng JSON trong cột `EnabledModulesJson` của bảng `SubscriptionPlans`.
- **[ASSUMPTION-04]**: Trạng thái tenant tính toán động theo thời gian:
  - Nếu `LockType != null` -> `locked`
  - Nếu `Now <= SubscriptionExpiresAt` và cách ngày hết hạn ≤ 7 ngày -> `expiring`
  - Nếu `SubscriptionExpiresAt < Now <= GracePeriodExpiresAt` -> `grace`
  - Còn lại -> `active`

## 3. Scope & Non-Goals
### In Scope
- Xây dựng trọn bộ DTOs (Request / Response) và FluentValidation cho:
  1. Quản lý gói cước SaaS (Plans): Xem danh sách, xem chi tiết, tạo mới, chỉnh sửa, bật/tắt kích hoạt.
  2. Quản lý khách thuê (Tenants): Xem danh sách (phân trang, lọc, tìm kiếm), xem chi tiết, khóa chuỗi (Soft/Hard lock kèm lý do), mở khóa, gia hạn ân hạn (Extend Grace).
  3. Thống kê Master Dashboard (KPIs, Plan Distribution, Urgent Alerts, Analytics).
- Triển khai Repositories (`ISubscriptionPlanRepository`, `ITenantRepository`) và Services tương ứng.
- Cung cấp Controllers RESTful: `AdminPlansController`, `AdminTenantsController`, `AdminDashboardController`.
- Bảo vệ endpoint bằng `[Authorize(Roles = "ADMIN")]`.

### Out of Scope (Non-Goals)
- Tích hợp cổng thanh toán trực tuyến tự động (VNPay/Momo/Stripe).
- Worker cron job định kỳ chạy ngầm hàng đêm để tự động chuyển trạng thái database.
- Thay đổi code React UI của Frontend (Frontend đã có sẵn giao diện).

## 4. Các phương án kiến trúc & Lựa chọn (Options & Trade-offs)
- **Phương án 1 (Monolithic Admin Service)**: Gộp toàn bộ nghiệp vụ Plans, Tenants, Dashboard vào một service duy nhất `IAdminService`.
  - *Ưu điểm*: Ít file, triển khai nhanh trong ngắn hạn.
  - *Nhược điểm*: Vi phạm nguyên tắc Single Responsibility (SRP) của Clean Architecture; file service sẽ phình to hàng nghìn dòng.
- **Phương án 2 (Modular Domain Services - ĐƯỢC CHỌN ⭐)**: Tách thành 3 service độc lập:
  - `ISubscriptionPlanService` & `SubscriptionPlanService`: Chuyên trách gói cước SaaS.
  - `ITenantService` & `TenantService`: Chuyên trách khách thuê và vòng đời tài khoản chuỗi.
  - `IAdminDashboardService` & `AdminDashboardService`: Chuyên trách tính toán chỉ số KPI và tổng hợp phân tích.
  - *Lý do chọn*: Tuân thủ chặt chẽ Clean Architecture, dễ viết Unit Test riêng lẻ với Mock Repository, dễ bảo trì và mở rộng khi thêm các tính năng thanh toán/cronjob sau này.

## 5. Rủi ro & Giải pháp giảm thiểu (Risks & Mitigations)
- **Rủi ro 1: Xung đột Multi-tenant Global Query Filter**:
  - *Nguy cơ*: `Tenant` và `SubscriptionPlan` là các thực thể toàn cục (Global SaaS Entities kế thừa `BaseEntity`, không kế thừa `BaseTenantEntity`), nhưng nếu truy vấn bảng con như `Branches` hoặc `Users` có thể bị filter chặn.
  - *Giải pháp*: Trong `AppDbContext`, các bảng `Tenants` và `SubscriptionPlans` không bị áp `TenantId` Query Filter; khi đếm `Branches` của Tenant thì truy vấn trực tiếp qua `TenantID` hoặc `IgnoreQueryFilters()`.
- **Rủi ro 2: Dữ liệu JSON tính năng (EnabledModulesJson) bị lỗi định dạng**:
  - *Giải pháp*: Xây dựng lớp Value Object / DTO `PlanFeatureConfig` và `PlanQuotaConfig` có strongly-typed mapping; sử dụng `System.Text.Json` đóng gói an toàn.
