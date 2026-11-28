# Tasks: Màn hình Đóng khay Chia nhỏ Hàng tươi sống Cân ký & In Tem Barcode Khay (`batch-repack-packages`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `RepackOrder`, `Package`, `BranchStock` đảm bảo lọc `TenantId` (`REQ-BATC-REPA-PACK-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `batch-repack-packages` (`REQ-BATC-REPA-PACK-02`, `REQ-BATC-REPA-PACK-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `RepackOrdersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-BATC-REPA-PACK-01`, `REQ-BATC-REPA-PACK-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/batch/pages/BatchPackageManagePage.tsx` tại route `/store-owner/batches/:batchId/packages` và kết nối API thời gian thực (`REQ-BATC-REPA-PACK-01` → `REQ-BATC-REPA-PACK-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-02-07` (`REQ-BATC-REPA-PACK-01` → `REQ-BATC-REPA-PACK-04`).
