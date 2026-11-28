# Tasks: Màn hình Chi tiết Duyệt Phản hồi NCC, Sinh PO Đổi hàng & Bàn giao RTV (`supplier-return-detail`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `SupplierReturn`, `PurchaseOrder`, `SupplierAPLedger`, `BranchStock` đảm bảo lọc `TenantId` (`REQ-SUPP-RETU-DETA-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `supplier-return-detail` (`REQ-SUPP-RETU-DETA-02`, `REQ-SUPP-RETU-DETA-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `SupplierReturnsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-SUPP-RETU-DETA-01`, `REQ-SUPP-RETU-DETA-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/supplier-return/pages/SupplierReturnDetailPage.tsx` tại route `/store-owner/supplier-returns/:id` và kết nối API thời gian thực (`REQ-SUPP-RETU-DETA-01` → `REQ-SUPP-RETU-DETA-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-09-10` (`REQ-SUPP-RETU-DETA-01` → `REQ-SUPP-RETU-DETA-04`).
