# Tasks: Màn hình Quản lý Ca làm POS, Bàn giao Z-Report & Khóa sổ Doanh thu Ngày (`pos-shift-management`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `ShiftZReport`, `ShiftCashMovement`, `BusinessDayClosing`, `CashbookEntry` đảm bảo lọc `TenantId` (`REQ-POS-SHIF-MANA-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `pos-shift-management` (`REQ-POS-SHIF-MANA-02`, `REQ-POS-SHIF-MANA-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `ShiftsController.cs`, `BusinessDaysController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-POS-SHIF-MANA-01`, `REQ-POS-SHIF-MANA-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/pos/pages/PosShiftPage.tsx` tại route `/store-owner/shifts` và kết nối API thời gian thực (`REQ-POS-SHIF-MANA-01` → `REQ-POS-SHIF-MANA-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-03-02` (`REQ-POS-SHIF-MANA-01` → `REQ-POS-SHIF-MANA-04`).
