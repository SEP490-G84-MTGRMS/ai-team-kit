# Tasks: Màn hình Ma trận Đặt hàng Nhiều ngày & Kiểm soát Cut-off / MOQ (`po-order-matrix`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `PurchaseOrder`, `PurchaseOrderDetail`, `SupplierBranchAssignment`, `SupplierBlackoutDate`, `SupplierProduct` đảm bảo lọc `TenantId` (`REQ-PO-ORDE-MATR-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `po-order-matrix` (`REQ-PO-ORDE-MATR-02`, `REQ-PO-ORDE-MATR-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `PurchaseOrdersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-PO-ORDE-MATR-01`, `REQ-PO-ORDE-MATR-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/purchase-order/pages/OrderMatrixPage.tsx`, `src/features/purchase-order/pages/EmployeeOrderMatrixPage.tsx` tại route `/store-owner/purchase-orders/create-matrix` và kết nối API thời gian thực (`REQ-PO-ORDE-MATR-01` → `REQ-PO-ORDE-MATR-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-05-02` (`REQ-PO-ORDE-MATR-01` → `REQ-PO-ORDE-MATR-04`).
