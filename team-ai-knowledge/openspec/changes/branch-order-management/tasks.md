# Tasks: branch-order-management

## DB
- [ ] T1 — Tạo Entity `Branch` kế thừa `BaseTenantEntity` trong `MT_GRMS.Domain/Entities/SaaS/` (REQ-BR-01)
- [ ] T2 — Cấu hình Fluent API `BranchConfiguration` với Unique Index `(TenantId, Code)` trong `MT_GRMS.Infrastructure/Persistence/Configurations/SaaS/` (REQ-BR-01)
- [ ] T3 — Đăng ký `DbSet<Branch>` vào `AppDbContext` và tạo Migration EF Core `AddBranchModule` có kèm seed data 5 chi nhánh mẫu (REQ-BR-01)

## Backend
- [ ] T4 — Định nghĩa DTOs `BranchDto`, `BranchFilterQuery` trong `MT_GRMS.Application/Branches/Dtos/` (REQ-BR-01)
- [ ] T5 — Tạo interface `IBranchRepository` và triển khai `BranchRepository` hỗ trợ phân trang, tìm kiếm từ khóa đa trường, lọc mã/trạng thái và cô lập multi-tenant (REQ-BR-01, REQ-BR-02)
- [ ] T6 — Xây dựng `IBranchService` và `BranchService` xử lý nghiệp vụ phân trang và tra cứu chi tiết chi nhánh theo ID (REQ-BR-01, REQ-BR-02)
- [ ] T7 — Đăng ký Dependency Injection cho `IBranchRepository` và `IBranchService` trong `DependencyInjection.cs` (REQ-BR-01)
- [ ] T8 — Tạo Thin Controller `BranchesController` tại `/api/v1/branches` hỗ trợ `GET /` và `GET /{id}` (REQ-BR-01, REQ-BR-02)

## Frontend
- [ ] T9 — Tạo types `branch.types.ts` và API Client `branchApi.ts` kết nối backend `/api/v1/branches` với cơ chế fallback mock data an toàn (REQ-BR-03)
- [ ] T10 — Tách và xây dựng component `BranchFilterBar.tsx` với ô tìm kiếm từ khóa, dropdown mã chi nhánh, dropdown trạng thái và các nút bấm Tìm kiếm/Đặt lại (REQ-BR-03)
- [ ] T11 — Tái cấu trúc component `BranchOrderTable.tsx` theo chuẩn `SupplierTable` với Sticky Header, vùng tbody cuộn độc lập, badge trạng thái và Footer phân trang tích hợp (REQ-BR-03)
- [ ] T12 — Cập nhật `BranchOrderListPage.tsx` theo khung `po-matrix-container`, kết nối state API và toast feedback (REQ-BR-03)

## Test
- [ ] T13 — Viết bộ Unit Tests xUnit `BranchManagementTests.cs` kiểm thử tìm kiếm, lọc, phân trang và cô lập đa người thuê (REQ-BR-01, REQ-BR-02)
- [ ] T14 — Chạy `dotnet test`, `npm run lint`, `npm run build` xác minh giải pháp đạt 100% chất lượng không lỗi
