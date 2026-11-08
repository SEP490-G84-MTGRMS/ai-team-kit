# Tasks: Tích hợp SaaS Master Admin Portal vào MT_GRMS_FRONTEND

## 1. Types & Data Mock
- [x] 1.1 Tạo types `src/features/admin/types/admin.types.ts` (Tenant, KpiData, CronjobData, PlanDistribution).
- [x] 1.2 Tạo mock data phong phú `src/features/admin/data/mockAdminData.ts` (128 tenants, 4 KPIs, 4 cronjobs, 3 gói).

## 2. Design System & Styles
- [x] 2.1 Tạo `src/styles/admin.css` chứa layout sidebar, topbar, metric cards, badges, dialogs chuẩn KiotViet Electric Blue.

## 3. Layout Components
- [x] 3.1 Tạo `src/layouts/AdminLayout/AdminSidebar.tsx` với Logo MT-GRMS SVG, NavLinks, Về Trang Chủ.
- [x] 3.2 Tạo `src/layouts/AdminLayout/AdminTopbar.tsx` với Search box, chuông thông báo, Profile Super Admin.
- [x] 3.3 Tạo `src/layouts/AdminLayout/AdminLayout.tsx` bọc Outlet cho các trang admin.

## 4. Dashboard Components
- [x] 4.1 Tạo `src/features/admin/components/KpiCard.tsx` hiển thị thẻ chỉ số lớn.
- [x] 4.2 Tạo `src/features/admin/components/PlanDistributionCard.tsx` hiển thị thanh tiến trình 3 gói cước.
- [x] 4.3 Tạo `src/features/admin/components/CronjobMonitorCard.tsx` giám sát sức khỏe 4 tác vụ tự động.
- [x] 4.4 Tạo `src/features/admin/components/UrgentAlertTable.tsx` bảng cảnh báo $\le 7$ ngày.
- [x] 4.5 Tạo trang `src/pages/admin/AdminDashboardPage.tsx` lắp ráp Dashboard.

## 5. Tenant Management Components & Modals
- [x] 5.1 Tạo `src/features/admin/components/TenantFilterTabs.tsx` hàng tabs lọc kèm số đếm.
- [x] 5.2 Tạo `src/features/admin/components/TenantSearchToolbar.tsx` ô tìm kiếm và select gói cước.
- [x] 5.3 Tạo `src/features/admin/components/TenantDataTable.tsx` bảng dữ liệu khách thuê, tags subdomain, badges và phân trang.
- [x] 5.4 Tạo `src/features/admin/components/TenantDetailModal.tsx` xem chi tiết Quota và 6 feature flags.
- [x] 5.5 Tạo `src/features/admin/components/ExtendGraceModal.tsx` modal gia hạn ân hạn.
- [x] 5.6 Tạo `src/features/admin/components/ApplyLockModal.tsx` modal khóa tài khoản.
- [x] 5.7 Tạo trang `src/pages/admin/TenantManagementPage.tsx` lắp ráp Quản lý khách thuê.
- [x] 5.8 Loại bỏ hardcode tĩnh trong `TenantDataTable.tsx`, tích hợp `TablePagination` động, làm phẳng text Subdomain/Gói dịch vụ và đồng bộ màu nút Primary `#0F766E` (REQ-ADMIN-PAGE-01)

## 6. Routing & Navigation Link
- [x] 6.1 Cập nhật `src/app/router.tsx` bổ sung routes `/admin`, `/admin/dashboard`, `/admin/tenants`.
- [x] 6.2 Cập nhật `Navbar` và `Footer` trong `HomePage` dẫn liên kết tới `/admin/dashboard`.
- [x] 6.3 Chạy `npm run build` xác minh 0 lỗi TypeScript và bundle thành công.

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: master-admin-backend-crud -->
# Tasks: master-admin-backend-crud

## DB
- [x] T0 — Xác nhận CSDL: Bảng `SubscriptionPlans` và `Tenants` đã tồn tại đầy đủ trên PostgreSQL (không cần tạo migration mới).

## Backend
- [x] T1 — Tạo DTOs và FluentValidation cho Subscription Plans (`CreatePlanRequest`, `UpdatePlanRequest`, `PlanQuotaDto`, `PlanFeatureDto`, `PlanSummaryResponse`, `PlanDetailResponse`, `PlanKpiBannerResponse`) (REQ-ADMIN-BE-01)
- [x] T2 — Tạo DTOs và FluentValidation cho Tenants (`TenantFilterRequest`, `TenantSummaryResponse`, `TenantDetailResponse`, `LockTenantRequest`, `ExtendGraceRequest`) (REQ-ADMIN-BE-02)
- [x] T3 — Tạo DTOs cho Master Dashboard (`KpiMetricResponse`, `PlanDistributionResponse`, `UrgentAlertResponse`, `MonthlyAnalyticsResponse`) (REQ-ADMIN-BE-03)
- [x] T4 — Triển khai Repositories (`ISubscriptionPlanRepository`, `SubscriptionPlanRepository`, `ITenantRepository`, `TenantRepository`) trong `MT_GRMS.Infrastructure` (REQ-ADMIN-BE-01, REQ-ADMIN-BE-02)
- [x] T5 — Triển khai `SubscriptionPlanService` xử lý nghiệp vụ CRUD gói cước, KPI banner, deserialize/serialize JSON Quotas & Features, chặn xóa gói đang có tenant sử dụng (REQ-ADMIN-BE-01)
- [x] T6 — Triển khai `TenantService` xử lý nghiệp vụ lọc trạng thái, phân trang, khóa Soft/Hard lock, mở khóa, gia hạn ân hạn (REQ-ADMIN-BE-02)
- [x] T7 — Triển khai `AdminDashboardService` tính toán MRR, Active Tenants, phân bổ gói cước và danh sách cảnh báo khẩn cấp (REQ-ADMIN-BE-03)
- [x] T8 — Đăng ký DI trong `DependencyInjection.cs` cho các Service và Repository mới (REQ-ADMIN-BE-01, REQ-ADMIN-BE-02, REQ-ADMIN-BE-03)
- [x] T9 — Xây dựng `AdminPlansController` cung cấp 7 endpoints quản lý gói cước với `[Authorize(Roles = "ADMIN")]` (REQ-ADMIN-BE-01, REQ-ADMIN-BE-04)
- [x] T10 — Xây dựng `AdminTenantsController` cung cấp 6 endpoints quản lý khách thuê với `[Authorize(Roles = "ADMIN")]` (REQ-ADMIN-BE-02, REQ-ADMIN-BE-04)
- [x] T11 — Xây dựng `AdminDashboardController` cung cấp 4 endpoints thống kê Dashboard với `[Authorize(Roles = "ADMIN")]` (REQ-ADMIN-BE-03, REQ-ADMIN-BE-04)

## Test
- [x] T12 — Viết Unit Tests kiểm thử nghiệp vụ CRUD Subscription Plans và validation (kiểm tra trùng mã, chặn xóa gói đang có tenant) (REQ-ADMIN-BE-01)
- [x] T13 — Viết Unit Tests kiểm thử nghiệp vụ Tenant (lọc trạng thái, khóa Soft/Hard, mở khóa, gia hạn ngày ân hạn) (REQ-ADMIN-BE-02)
- [x] T14 — Viết Integration Tests kiểm thử Controller và phân quyền `[Authorize(Roles = "ADMIN")]` (chặn 401 khi không có token, chặn 403 khi role không phải ADMIN) (REQ-ADMIN-BE-04)


<!-- Tasks sáp nhập từ: admin-service-plans-management -->
# Tasks: admin-service-plans-management

## Frontend
- [x] T1 — Định nghĩa TypeScript types (`plan.types.ts`) và Mock Data 4 gói cước chuẩn (`mockPlanData.ts`) (REQ-01)
- [x] T2 — Xây dựng component `PlanKPIBanner.tsx` hiển thị 4 thẻ thống kê tổng quan (REQ-01)
- [x] T3 — Xây dựng component `PlanFilterToolbar.tsx` tìm kiếm, dropdown trạng thái và nút hành động (REQ-02, REQ-07)
- [x] T4 — Xây dựng component `PlanDataTable.tsx` hiển thị bảng dữ liệu gói cước kèm phân trang chuẩn KiotViet (REQ-01, REQ-06)
- [x] T5 — Xây dựng component `CreatePlanModal.tsx` popup 3 phần khởi tạo gói cước mới kèm validation (REQ-03)
- [x] T6 — Xây dựng component `UpdatePlanModal.tsx` popup chỉnh sửa thông tin & hạn mức quota gói cước (REQ-04)
- [x] T7 — Xây dựng component `PlanDetailModal.tsx` popup xem chi tiết kỹ thuật và danh sách Tenant đang thuê (REQ-05)
- [x] T8 — Xây dựng trang quản trị chính `SubscriptionPlanPage.tsx` tích hợp logic CRUD và toast thông báo (REQ-01)
- [x] T9 — Cập nhật `src/app/router.tsx` đăng ký route `/admin/subscriptions` và tích hợp link điều hướng (REQ-07)
- [x] T12 — Chuyển đổi xem chi tiết sang Trang chuyên dụng `SubscriptionPlanDetailPage.tsx` bố cục 2 cột bóc tách 7 subcomponents theo demo `subscription_detail.html` (REQ-05)

## Test & Validation
- [x] T10 — Viết unit test `src/features/admin/__tests__/planValidation.test.ts` kiểm tra logic tính toán quota và validation
- [x] T11 — Chạy kiểm thử tự động `npm run build` và `npm test` xác minh toàn bộ test pass 100%


<!-- Tasks sáp nhập từ: dynamic-subscription-plans-from-db -->
# Tasks: dynamic-subscription-plans-from-db

## 1. Helper & Data Transformation (Frontend)
- [x] T1 — Xây dựng hàm helper `mapBackendPlanToCardItem(backendPlan, currentPlanName, index)` trong `SubscriptionPricingCards.tsx`, trích xuất an toàn danh sách tính năng từ `features`, giới hạn chi nhánh từ `quotas`, format giá tiền, sinh theme color và gán cờ `highlight` (REQ-SUB-01, REQ-SUB-02).

## 2. Dynamic Pricing Component Rendering (Frontend)
- [x] T2 — Cập nhật component `SubscriptionPricingCards.tsx`: loại bỏ hoàn toàn mảng tĩnh `SUBSCRIPTION_PLANS`, gọi `storeApi.getPricingPlans()` và render động 100% danh sách trả về từ API Backend (REQ-SUB-01).
- [x] T3 — Thêm trạng thái Skeleton Loader khi đang tải dữ liệu và Empty State rõ ràng nếu danh sách trả về rỗng (REQ-SUB-03).
- [x] T4 — Xử lý nút hành động trên thẻ: nếu gói đang dùng thì hiển thị "Gói đang dùng" (disabled), nếu gói trả phí thì nút "Mua ngay" mở `SubscriptionCheckoutModal.tsx` (REQ-SUB-02, REQ-SUB-04).

## 3. Modal & Store Hub Integration (Frontend)
- [x] T5 — Kiểm tra và đảm bảo `SubscriptionCheckoutModal.tsx` nhận gói cước động, hiển thị thông tin tính tiền chính xác và gửi `planCode` hợp lệ lên `storeApi.purchaseSubscription` (REQ-SUB-04).

## 4. Verification & Testing
- [x] T6 — Chạy kiểm thử tự động Frontend (`npm test` vitest) và Backend (`dotnet test`) để đảm bảo không phát sinh regression (REQ-SUB-01, REQ-SUB-02, REQ-SUB-04).
- [x] T7 — Kiểm tra trực tiếp trên giao diện trình duyệt: xác nhận hiển thị đúng 2 thẻ cước từ Database (`FREE` và `PRO`) khớp với dữ liệu thực tế (REQ-SUB-01).


<!-- Tasks sáp nhập từ: store-information-and-subscriptions -->
# Tasks: store-information-and-subscriptions

## Database Design & Data Dictionary
- [x] T1 — Cập nhật `Database_Design_Data_Dictionary.md` bổ sung cột `WalletBalance` vào bảng `Tenants` và định nghĩa bảng thực thể mới `TenantWalletTransactions` (REQ-03, REQ-04).

## Frontend Components & Layout
- [x] T2 — Xây dựng trang Hub trung tâm `StoreSettingsHubPage.tsx` và thanh điều hướng bên trái `StoreSidebarNav.tsx` 3 nhóm (Gian hàng, Gói dịch vụ, Khác) (REQ-01).
- [x] T3 — Xây dựng thanh trạng thái tóm tắt `StoreTopStatusBar.tsx` (Gói hiện tại, Số chi nhánh, Ngành hàng, Đếm ngược hạn dùng cảnh báo đỏ, Thẻ số dư ví kèm nút Nạp tiền) (REQ-01, REQ-03).
- [x] T4 — Xây dựng bảng 3 thẻ so sánh gói dịch vụ `SubscriptionPricingCards.tsx` (Gói Hỗ trợ 270k, Gói Chuyên nghiệp 330k, Gói Cao cấp 490k) chuẩn KiotViet (REQ-02).
- [x] T5 — Xây dựng hộp thoại Đặt mua & Thanh toán `SubscriptionCheckoutModal.tsx` (chọn kỳ hạn 6T/1N/2N, thêm tiện ích chi nhánh/kho, hỗ trợ thanh toán trừ tiền ví và quét VietQR) (REQ-04).
- [x] T6 — Xây dựng hộp thoại Nạp tiền vào ví `StoreWalletTopupModal.tsx` qua mã VietQR và tab sao kê biến động ví `WalletLedgerTab.tsx` (REQ-03).
- [x] T7 — Xây dựng tab Thông tin gian hàng `StoreInfoTab.tsx` cho phép xem và cập nhật thông tin cửa hàng (REQ-01).
- [x] T8 — Đăng ký route `/store-owner/subscriptions` và `/store-owner/settings` trong `src/app/router.tsx`, gắn link điều hướng từ `StoreOwnerTopbar.tsx` (REQ-01).

## Backend APIs & Integration
- [x] T10 — Xây dựng `TenantStoreController.cs` cung cấp `GET /api/v1/tenant/store-info`, `PUT /api/v1/tenant/store-info` và `GET /api/v1/tenant/pricing-plans`.
- [x] T11 — Viết bộ unit tests `TenantStoreControllerTests.cs` (105/105 backend tests passed).
- [x] T12 — Xây dựng frontend client `storeApi.ts` và tích hợp gọi API thật vào `StoreSettingsHubPage.tsx` và `StoreInfoTab.tsx`.

## Verification & Interactive Testing
- [x] T9 — Kiểm thử giao diện trên trình duyệt (thay đổi kỳ hạn tính tiền, nạp tiền ví, thanh toán trừ số dư ví, cập nhật ngày hết hạn, kiểm tra responsive mobile/desktop) (REQ-01, REQ-02, REQ-03, REQ-04).


<!-- Tasks sáp nhập từ: consolidate-database-seeders -->
# Kế Hoạch Thực Hiện (Tasks) - Refactor Database Seeders

- [x] T1: Tích hợp dữ liệu nghiệp vụ Thuế NQ 204, Doanh thu Q3 (385tr), Sổ quỹ (Till, Safe, Bank), Công nợ FIFO và PO Matrix từ `DatabaseSeeder.cs` vào `DbInitializer.cs` theo các hàm phân hệ sạch sẽ. (Tham chiếu: REQ-SEED-02, REQ-SEED-03)
- [x] T2: Cập nhật `src/MT_GRMS.Api/Program.cs` chỉ gọi duy nhất `await DbInitializer.InitializeAsync(dbContext, logger);`. (Tham chiếu: REQ-SEED-01)
- [x] T3: Xóa bỏ tệp `src/MT_GRMS.Infrastructure/Persistence/DatabaseSeeder.cs` khỏi dự án. (Tham chiếu: REQ-SEED-01)
- [x] T4: Chạy `dotnet build` và kiểm thử toàn bộ `dotnet test` (yêu cầu 451/451 tests PASS). (Tham chiếu: REQ-SEED-01)
- [x] T5: Lập worklog chi tiết trong `project/MT_GRMS_BACKEND/docs/worklogs/` và cập nhật `CHANGELOG.md`. (Tham chiếu: REQ-SEED-01)
