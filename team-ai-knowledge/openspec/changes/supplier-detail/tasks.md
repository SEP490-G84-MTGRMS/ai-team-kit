# Tasks: Màn hình Chi tiết Hồ sơ Nhà cung cấp, Chính sách Đổi trả & Sổ cái Công nợ AP (`supplier-detail`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Supplier`, `SupplierReturnPolicy`, `SupplierReturnPolicyCategoryCostShare`, `SupplierBlackoutDate`, `SupplierAPLedger` đảm bảo lọc `TenantId` (`REQ-SUPP-DETA-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `supplier-detail` (`REQ-SUPP-DETA-02`, `REQ-SUPP-DETA-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `SuppliersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-SUPP-DETA-01`, `REQ-SUPP-DETA-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/supplier/pages/SupplierDetailPage.tsx` tại route `/store-owner/suppliers/:id` và kết nối API thời gian thực (`REQ-SUPP-DETA-01` → `REQ-SUPP-DETA-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-09-03` (`REQ-SUPP-DETA-01` → `REQ-SUPP-DETA-04`).
