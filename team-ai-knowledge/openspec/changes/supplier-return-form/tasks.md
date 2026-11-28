# Tasks: Màn hình Lập Phiếu Yêu cầu Trả / Đổi hàng Nhà cung cấp (`supplier-return-form`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `SupplierReturn`, `SupplierReturnPolicy`, `GoodsReceipt`, `BranchStock` đảm bảo lọc `TenantId` (`REQ-SUPP-RETU-FORM-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `supplier-return-form` (`REQ-SUPP-RETU-FORM-02`, `REQ-SUPP-RETU-FORM-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `SupplierReturnsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-SUPP-RETU-FORM-01`, `REQ-SUPP-RETU-FORM-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/supplier-return/pages/SupplierReturnFormPage.tsx` tại route `/store-owner/supplier-returns/create` và kết nối API thời gian thực (`REQ-SUPP-RETU-FORM-01` → `REQ-SUPP-RETU-FORM-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-09-09` (`REQ-SUPP-RETU-FORM-01` → `REQ-SUPP-RETU-FORM-04`).
