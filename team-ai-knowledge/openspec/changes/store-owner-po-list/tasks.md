# Tasks: store-owner-po-list

## Frontend
- [x] T1 — Tạo kiểu dữ liệu `PurchaseOrderListItem`, `PurchaseOrderItemDetail`, `PoListFilterState` trong `src/features/purchase-order/types/po-list.types.ts` (REQ-01, REQ-02)
- [x] T2 — Xây dựng Mock Data phong phú `mockPoListData.ts` với các đơn hàng PO đa dạng trạng thái SENT, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED (REQ-01, REQ-05)
- [x] T3 — Phát triển component `PoListFilterBar.tsx` với bộ lọc hợp nhất gồm Chi nhánh, Nhà cung cấp, Trạng thái PO, Khoảng ngày, Ô tìm kiếm và nút Tìm kiếm/Đặt lại (REQ-02)
- [x] T4 — Phát triển component `PoListTable.tsx` hiển thị bảng 10 cột dữ liệu, sticky header, sort indicators, badge màu trạng thái và footer phân trang (REQ-01, REQ-03, REQ-05)
- [x] T5 — Phát triển component `PoDetailDrawer.tsx` trượt từ bên phải hiển thị danh sách chi tiết mặt hàng, số lượng đặt, đơn giá, thành tiền và ghi chú đơn hàng (REQ-04)
- [x] T6 — Tích hợp container page `StoreOwnerPurchaseOrderListPage.tsx`, quản lý state bộ lọc, phân trang, hiển thị Drawer chi tiết và thông báo Toast (REQ-01, REQ-02, REQ-03, REQ-04)
- [x] T7 — Đăng ký route `/store-owner/purchase-orders/list` và alias trong `src/app/router.tsx`, export các components trong `src/features/purchase-order/index.ts` (REQ-01)
- [x] T8 — Bổ sung liên kết điều hướng từ màn hình Chi nhánh (`BranchOrderListPage`) nút "Lịch sử đơn hàng" chuyển sang màn hình danh sách PO (REQ-01)

## Verification & Build
- [x] T9 — Kiểm tra biên dịch `npm run build` đảm bảo không có lỗi TypeScript hoặc lint (REQ-01 đến REQ-05)
- [x] T10 — Kiểm thử các luồng nghiệp vụ: lọc đa tiêu chí, phân trang, mở Drawer xem chi tiết PO, đóng drawer (REQ-01 đến REQ-05)

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: branch-order-management -->
# Tasks: branch-order-management

## DB
- [x] T1 — Tạo Entity `Branch` kế thừa `BaseTenantEntity` trong `MT_GRMS.Domain/Entities/SaaS/` (REQ-BR-01)
- [x] T2 — Cấu hình Fluent API `BranchConfiguration` với Unique Index `(TenantId, Code)` trong `MT_GRMS.Infrastructure/Persistence/Configurations/SaaS/` (REQ-BR-01)
- [x] T3 — Đăng ký `DbSet<Branch>` vào `AppDbContext` và tạo Migration EF Core `AddBranchModule` có kèm seed data 5 chi nhánh mẫu (REQ-BR-01)

## Backend
- [x] T4 — Định nghĩa DTOs `BranchDto`, `BranchFilterQuery` trong `MT_GRMS.Application/Branches/Dtos/` (REQ-BR-01)
- [x] T5 — Tạo interface `IBranchRepository` và triển khai `BranchRepository` hỗ trợ phân trang, tìm kiếm từ khóa đa trường, lọc mã/trạng thái và cô lập multi-tenant (REQ-BR-01, REQ-BR-02)
- [x] T6 — Xây dựng `IBranchService` và `BranchService` xử lý nghiệp vụ phân trang và tra cứu chi tiết chi nhánh theo ID (REQ-BR-01, REQ-BR-02)
- [x] T7 — Đăng ký Dependency Injection cho `IBranchRepository` và `IBranchService` trong `DependencyInjection.cs` (REQ-BR-01)
- [x] T8 — Tạo Thin Controller `BranchesController` tại `/api/v1/branches` hỗ trợ `GET /` và `GET /{id}` (REQ-BR-01, REQ-BR-02)

## Frontend
- [x] T9 — Tạo types `branch.types.ts` và API Client `branchApi.ts` kết nối backend `/api/v1/branches` với cơ chế fallback mock data an toàn (REQ-BR-03)
- [x] T10 — Tách và xây dựng component `BranchFilterBar.tsx` với ô tìm kiếm từ khóa, dropdown mã chi nhánh, dropdown trạng thái và các nút bấm Tìm kiếm/Đặt lại (REQ-BR-03)
- [x] T11 — Tái cấu trúc component `BranchOrderTable.tsx` theo chuẩn `SupplierTable` với Sticky Header, vùng tbody cuộn độc lập, badge trạng thái và Footer phân trang tích hợp (REQ-BR-03)
- [x] T12 — Cập nhật `BranchOrderListPage.tsx` theo khung `po-matrix-container`, kết nối state API và toast feedback (REQ-BR-03)

## Test
- [x] T13 — Viết bộ Unit Tests xUnit `BranchManagementTests.cs` kiểm thử tìm kiếm, lọc, phân trang và cô lập đa người thuê (REQ-BR-01, REQ-BR-02)
- [x] T14 — Chạy `dotnet test`, `npm run lint`, `npm run build` xác minh giải pháp đạt 100% chất lượng không lỗi
