# Tasks: Màn hình Lập & Xác nhận Phiếu nhập kho GRN Đa lô FEFO & Landed Cost (`grn-form`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `GoodsReceipt`, `GoodsReceiptLine`, `BranchStock`, `StockOnHand`, `SupplierAPLedger`, `PurchaseOrder` đảm bảo lọc `TenantId` (`REQ-GRN-FORM-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `grn-form` (`REQ-GRN-FORM-02`, `REQ-GRN-FORM-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `GoodsReceiptsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-GRN-FORM-01`, `REQ-GRN-FORM-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/goods-receipt/pages/GoodsReceiptFormPage.tsx`, `src/features/goods-receipt/pages/GoodsReceiptDetailPage.tsx` tại route `/store-owner/goods-receipts/create` và kết nối API thời gian thực (`REQ-GRN-FORM-01` → `REQ-GRN-FORM-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-05-06` (`REQ-GRN-FORM-01` → `REQ-GRN-FORM-04`).
