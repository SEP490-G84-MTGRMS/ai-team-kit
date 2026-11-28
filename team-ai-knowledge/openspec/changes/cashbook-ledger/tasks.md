# Tasks: Màn hình Sổ quỹ Tiền mặt & Ngân hàng, Chuyển quỹ Nội bộ & Chuỗi Hash Kiểm toán (`cashbook-ledger`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `CashbookEntry`, `FinanceAccount` đảm bảo lọc `TenantId` (`REQ-CASH-LEDG-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `cashbook-ledger` (`REQ-CASH-LEDG-02`, `REQ-CASH-LEDG-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `CashbookController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-CASH-LEDG-01`, `REQ-CASH-LEDG-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/cashbook/pages/CashbookPage.tsx` tại route `/store-owner/cashbook` và kết nối API thời gian thực (`REQ-CASH-LEDG-01` → `REQ-CASH-LEDG-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-17-01` (`REQ-CASH-LEDG-01` → `REQ-CASH-LEDG-04`).
