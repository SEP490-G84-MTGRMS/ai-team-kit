# Tasks: Màn hình Bán hàng & Thu ngân Quầy POS (Barcode, FEFO, Khuyến mãi, VietQR & Bán nợ) (`pos-checkout`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Order`, `OrderDetail`, `BranchStock`, `Package`, `Promotion`, `VoucherCode`, `Customer` đảm bảo lọc `TenantId` (`REQ-POS-CHEC-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `pos-checkout` (`REQ-POS-CHEC-02`, `REQ-POS-CHEC-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `OrdersController.cs`, `PromotionsController.cs`, `VouchersController.cs`, `ProductsController.cs`, `RepackOrdersController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-POS-CHEC-01`, `REQ-POS-CHEC-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/pos/pages/PosCheckoutPage.tsx` tại route `/pos` và kết nối API thời gian thực (`REQ-POS-CHEC-01` → `REQ-POS-CHEC-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-03-01` (`REQ-POS-CHEC-01` → `REQ-POS-CHEC-04`).
