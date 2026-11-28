# Tasks: Màn hình Quản lý Danh sách Đơn mua hàng PO Toàn chuỗi (`po-store-order-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `PurchaseOrder`, `PurchaseOrderDetail`, `PurchaseOrderRevision` đảm bảo lọc `TenantId` (`REQ-PO-STOR-ORDE-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `po-store-order-list` (`REQ-PO-STOR-ORDE-02`, `REQ-PO-STOR-ORDE-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `PurchaseOrdersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-PO-STOR-ORDE-01`, `REQ-PO-STOR-ORDE-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/purchase-order/pages/StoreOwnerPurchaseOrderListPage.tsx` tại route `/store-owner/purchase-orders/list` và kết nối API thời gian thực (`REQ-PO-STOR-ORDE-01` → `REQ-PO-STOR-ORDE-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-05-01` (`REQ-PO-STOR-ORDE-01` → `REQ-PO-STOR-ORDE-04`).
