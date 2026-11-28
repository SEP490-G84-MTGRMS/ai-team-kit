# Tasks: Màn hình Danh sách Phiếu Trả / Đổi hàng Nhà cung cấp (RTV List) (`supplier-return-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `SupplierReturn`, `Supplier`, `GoodsReceipt` đảm bảo lọc `TenantId` (`REQ-SUPP-RETU-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `supplier-return-list` (`REQ-SUPP-RETU-LIST-02`, `REQ-SUPP-RETU-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `SupplierReturnsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-SUPP-RETU-LIST-01`, `REQ-SUPP-RETU-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/supplier-return/pages/SupplierReturnListPage.tsx` tại route `/store-owner/supplier-returns` và kết nối API thời gian thực (`REQ-SUPP-RETU-LIST-01` → `REQ-SUPP-RETU-LIST-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-09-08` (`REQ-SUPP-RETU-LIST-01` → `REQ-SUPP-RETU-LIST-04`).
