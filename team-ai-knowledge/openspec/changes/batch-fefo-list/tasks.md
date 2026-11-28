# Tasks: Màn hình Sổ lô Hàng hóa FEFO, Cảnh báo Hạn dùng & Giảm giá Xả hàng (`batch-fefo-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `BranchStock`, `Product`, `Supplier` đảm bảo lọc `TenantId` (`REQ-BATC-FEFO-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `batch-fefo-list` (`REQ-BATC-FEFO-LIST-02`, `REQ-BATC-FEFO-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `BatchesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-BATC-FEFO-LIST-01`, `REQ-BATC-FEFO-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/batch/pages/BatchListPage.tsx` tại route `/store-owner/batches` và kết nối API thời gian thực (`REQ-BATC-FEFO-LIST-01` → `REQ-BATC-FEFO-LIST-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-02-01` (`REQ-BATC-FEFO-LIST-01` → `REQ-BATC-FEFO-LIST-04`).
