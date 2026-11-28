# Tasks: Màn hình Phân bổ Nhà cung cấp Phụ trách Chi nhánh & Lịch Giao hàng (`supplier-branch-assignment`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `SupplierBranchAssignment`, `Supplier`, `Branch` đảm bảo lọc `TenantId` (`REQ-SUPP-BRAN-ASSI-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `supplier-branch-assignment` (`REQ-SUPP-BRAN-ASSI-02`, `REQ-SUPP-BRAN-ASSI-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `SuppliersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-SUPP-BRAN-ASSI-01`, `REQ-SUPP-BRAN-ASSI-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/supplier/pages/SupplierBranchManagementPage.tsx` tại route `/store-owner/suppliers/branches` và kết nối API thời gian thực (`REQ-SUPP-BRAN-ASSI-01` → `REQ-SUPP-BRAN-ASSI-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-09-05` (`REQ-SUPP-BRAN-ASSI-01` → `REQ-SUPP-BRAN-ASSI-04`).
