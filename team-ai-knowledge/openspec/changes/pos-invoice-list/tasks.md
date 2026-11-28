# Tasks: Màn hình Quản lý Hóa đơn Bán lẻ, Đơn Đặt trước & Đổi trả Hàng tại Quầy (`pos-invoice-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Order`, `OrderDetail`, `BranchStock`, `ShiftCashMovement` đảm bảo lọc `TenantId` (`REQ-POS-INVO-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `pos-invoice-list` (`REQ-POS-INVO-LIST-02`, `REQ-POS-INVO-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `OrdersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-POS-INVO-LIST-01`, `REQ-POS-INVO-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/pos/pages/InvoiceManagementPage.tsx` tại route `/store-owner/invoices` và kết nối API thời gian thực (`REQ-POS-INVO-LIST-01` → `REQ-POS-INVO-LIST-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-03-04` (`REQ-POS-INVO-LIST-01` → `REQ-POS-INVO-LIST-04`).
