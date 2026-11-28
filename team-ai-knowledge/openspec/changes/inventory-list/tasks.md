# Tasks: Màn hình Tồn kho Thời gian thực & Nhập đổi Trực tiếp Sales Nhà cung cấp (`inventory-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `StockOnHand`, `BranchStock`, `GoodsReceipt`, `SupplierReturn`, `SupplierAPLedger` đảm bảo lọc `TenantId` (`REQ-INVE-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `inventory-list` (`REQ-INVE-LIST-02`, `REQ-INVE-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `InventoryController.cs`, `SupplierDirectVisitsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-INVE-LIST-01`, `REQ-INVE-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/inventory/pages/InventoryListPage.tsx` tại route `/store-owner/inventory` và kết nối API thời gian thực (`REQ-INVE-LIST-01` → `REQ-INVE-LIST-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-04-01` (`REQ-INVE-LIST-01` → `REQ-INVE-LIST-04`).
