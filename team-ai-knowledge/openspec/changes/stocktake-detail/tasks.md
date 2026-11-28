# Tasks: Màn hình Đối chiếu Chênh lệch, Phê duyệt Cân bằng Kho & Tạo Trả hàng từ Kiểm kê (`stocktake-detail`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Stocktake`, `BranchStock`, `StockOnHand`, `SupplierReturn` đảm bảo lọc `TenantId` (`REQ-STOC-DETA-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `stocktake-detail` (`REQ-STOC-DETA-02`, `REQ-STOC-DETA-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `StocktakesController.cs`, `SupplierReturnsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-STOC-DETA-01`, `REQ-STOC-DETA-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/stocktake/pages/StocktakeDetailPage.tsx` tại route `/store-owner/stocktakes/:id` và kết nối API thời gian thực (`REQ-STOC-DETA-01` → `REQ-STOC-DETA-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-04-06` (`REQ-STOC-DETA-01` → `REQ-STOC-DETA-04`).
