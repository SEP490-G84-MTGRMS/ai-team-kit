# Tasks: Màn hình Kiểm soát Két tiền mặt Quầy POS, Hạn mức & Phê duyệt Chi két (`pos-cash-control`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `ShiftCashMovement`, `CashbookEntry` đảm bảo lọc `TenantId` (`REQ-POS-CASH-CONT-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `pos-cash-control` (`REQ-POS-CASH-CONT-02`, `REQ-POS-CASH-CONT-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `ShiftsController.cs`, `CashbookController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-POS-CASH-CONT-01`, `REQ-POS-CASH-CONT-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/pos/pages/StorePosCashControlPage.tsx` tại route `/store-owner/pos-cash-control` và kết nối API thời gian thực (`REQ-POS-CASH-CONT-01` → `REQ-POS-CASH-CONT-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-03-05` (`REQ-POS-CASH-CONT-01` → `REQ-POS-CASH-CONT-04`).
