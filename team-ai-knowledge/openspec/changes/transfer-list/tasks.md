# Tasks: Màn hình Quản lý Danh sách & Chi tiết Phiếu Điều chuyển Liên chi nhánh (`transfer-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Transfer`, `TransferDetail`, `TransferStatusHistory`, `BranchStock` đảm bảo lọc `TenantId` (`REQ-TRAN-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `transfer-list` (`REQ-TRAN-LIST-02`, `REQ-TRAN-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `TransfersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-TRAN-LIST-01`, `REQ-TRAN-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/transfer/pages/TransferListPage.tsx`, `src/features/transfer/pages/TransferDetailPage.tsx` tại route `/store-owner/transfers` và kết nối API thời gian thực (`REQ-TRAN-LIST-01` → `REQ-TRAN-LIST-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-15-01` (`REQ-TRAN-LIST-01` → `REQ-TRAN-LIST-04`).
