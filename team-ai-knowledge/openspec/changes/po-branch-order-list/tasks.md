# Tasks: Màn hình Danh sách Đặt hàng theo Chi nhánh (Branch Purchase Order Overview) (`po-branch-order-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Branch`, `PurchaseOrder` đảm bảo lọc `TenantId` (`REQ-PO-BRAN-ORDE-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `po-branch-order-list` (`REQ-PO-BRAN-ORDE-02`, `REQ-PO-BRAN-ORDE-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `PurchaseOrdersController.cs`, `BranchesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-PO-BRAN-ORDE-01`, `REQ-PO-BRAN-ORDE-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/purchase-order/pages/BranchOrderListPage.tsx` tại route `/store-owner/purchase-orders` và kết nối API thời gian thực (`REQ-PO-BRAN-ORDE-01` → `REQ-PO-BRAN-ORDE-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-05-00` (`REQ-PO-BRAN-ORDE-01` → `REQ-PO-BRAN-ORDE-04`).
