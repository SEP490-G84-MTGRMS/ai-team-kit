# Tasks: Màn hình Danh sách Phiên Kiểm kê Kho Đa Chi nhánh (`stocktake-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Stocktake`, `Branch` đảm bảo lọc `TenantId` (`REQ-STOC-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `stocktake-list` (`REQ-STOC-LIST-02`, `REQ-STOC-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `StocktakesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-STOC-LIST-01`, `REQ-STOC-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/stocktake/pages/StocktakeListPage.tsx` tại route `/store-owner/stocktakes` và kết nối API thời gian thực (`REQ-STOC-LIST-01` → `REQ-STOC-LIST-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-04-03` (`REQ-STOC-LIST-01` → `REQ-STOC-LIST-04`).
