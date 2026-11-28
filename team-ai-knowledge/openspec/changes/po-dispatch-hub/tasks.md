# Tasks: Màn hình Trung tâm Điều phối, Chốt gửi & Theo dõi Gói PO Nhà cung cấp (`po-dispatch-hub`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `PurchaseOrder`, `SupplierDispatchPackage`, `PurchaseOrderRevision` đảm bảo lọc `TenantId` (`REQ-PO-DISP-HUB-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `po-dispatch-hub` (`REQ-PO-DISP-HUB-02`, `REQ-PO-DISP-HUB-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `PurchaseOrdersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-PO-DISP-HUB-01`, `REQ-PO-DISP-HUB-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/purchase-order/pages/SupplierOrderDispatchHubPage.tsx`, `src/features/purchase-order/pages/SupplierDispatchDetailPage.tsx` tại route `/store-owner/purchase-orders/dispatch-hub` và kết nối API thời gian thực (`REQ-PO-DISP-HUB-01` → `REQ-PO-DISP-HUB-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-05-03` (`REQ-PO-DISP-HUB-01` → `REQ-PO-DISP-HUB-04`).
