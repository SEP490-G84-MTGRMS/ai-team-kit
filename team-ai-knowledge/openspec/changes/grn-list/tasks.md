# Tasks: Màn hình Danh sách Phiếu nhập kho (GRN) & Lịch Nhận hàng Hôm nay (`grn-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `GoodsReceipt`, `GoodsReceiptLine`, `PurchaseOrder` đảm bảo lọc `TenantId` (`REQ-GRN-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `grn-list` (`REQ-GRN-LIST-02`, `REQ-GRN-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `GoodsReceiptsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-GRN-LIST-01`, `REQ-GRN-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/goods-receipt/pages/GoodsReceiptListPage.tsx` tại route `/store-owner/goods-receipts` và kết nối API thời gian thực (`REQ-GRN-LIST-01` → `REQ-GRN-LIST-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-05-05` (`REQ-GRN-LIST-01` → `REQ-GRN-LIST-04`).
