# Tasks: Màn hình Tạo Phiếu Điều chuyển FEFO & Yêu cầu Xin hàng Khẩn cấp (`transfer-create-request`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Transfer`, `TransferDetail`, `TransferRequest`, `TransferRequestDetail`, `BranchStock` đảm bảo lọc `TenantId` (`REQ-TRAN-CREA-REQU-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `transfer-create-request` (`REQ-TRAN-CREA-REQU-02`, `REQ-TRAN-CREA-REQU-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `TransfersController.cs`, `TransferRequestsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-TRAN-CREA-REQU-01`, `REQ-TRAN-CREA-REQU-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/transfer/pages/CreateTransferPage.tsx`, `src/features/transfer/pages/CreateUrgentTransferRequestPage.tsx` tại route `/store-owner/transfers/create` và kết nối API thời gian thực (`REQ-TRAN-CREA-REQU-01` → `REQ-TRAN-CREA-REQU-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-15-02` (`REQ-TRAN-CREA-REQU-01` → `REQ-TRAN-CREA-REQU-04`).
