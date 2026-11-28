# Tasks: Màn hình Kho Danh mục Hàng hóa Mẫu Toàn cầu FMCG (`admin-master-catalog`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `MasterProduct`, `MasterProductUnit` đảm bảo lọc `TenantId` (`REQ-ADMI-MAST-CATA-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `admin-master-catalog` (`REQ-ADMI-MAST-CATA-02`, `REQ-ADMI-MAST-CATA-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AdminMasterCatalogController.cs` kèm kiểm soát phân quyền RBAC (MasterAdmin) (`REQ-ADMI-MAST-CATA-01`, `REQ-ADMI-MAST-CATA-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/admin/MasterCatalogPage.tsx` tại route `/admin/master-catalog` và kết nối API thời gian thực (`REQ-ADMI-MAST-CATA-01` → `REQ-ADMI-MAST-CATA-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-04` (`REQ-ADMI-MAST-CATA-01` → `REQ-ADMI-MAST-CATA-04`).
