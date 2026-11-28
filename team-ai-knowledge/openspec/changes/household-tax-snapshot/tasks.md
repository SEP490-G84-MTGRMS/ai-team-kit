# Tasks: Màn hình Kê khai & Chốt sổ Thuế Hộ kinh doanh TT 152 (7 Sổ Kế toán & XML 01/CNKD) (`household-tax-snapshot`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `HouseholdTaxSnapshot`, `TaxFilingConfirmation` đảm bảo lọc `TenantId` (`REQ-HOUS-TAX-SNAP-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `household-tax-snapshot` (`REQ-HOUS-TAX-SNAP-02`, `REQ-HOUS-TAX-SNAP-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `HouseholdTaxController.cs`, `TaxFilingConfirmationsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-HOUS-TAX-SNAP-01`, `REQ-HOUS-TAX-SNAP-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/tax-snapshot/pages/TaxSnapshotPage.tsx` tại route `/store-owner/tax-snapshots` và kết nối API thời gian thực (`REQ-HOUS-TAX-SNAP-01` → `REQ-HOUS-TAX-SNAP-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-19-01` (`REQ-HOUS-TAX-SNAP-01` → `REQ-HOUS-TAX-SNAP-04`).
