# Tasks: Màn hình Xác nhận Nhận hàng Điều chuyển & Ghi nhận Chênh lệch (`transfer-receive`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Transfer`, `TransferDetail`, `BranchStock`, `StockOnHand` đảm bảo lọc `TenantId` (`REQ-TRAN-RECE-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `transfer-receive` (`REQ-TRAN-RECE-02`, `REQ-TRAN-RECE-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `TransfersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-TRAN-RECE-01`, `REQ-TRAN-RECE-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/transfer/pages/ReceiveTransferPage.tsx` tại route `/store-owner/transfers/:id/receive` và kết nối API thời gian thực (`REQ-TRAN-RECE-01` → `REQ-TRAN-RECE-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-15-03` (`REQ-TRAN-RECE-01` → `REQ-TRAN-RECE-04`).
