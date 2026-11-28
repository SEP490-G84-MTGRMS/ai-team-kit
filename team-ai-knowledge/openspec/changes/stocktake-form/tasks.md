# Tasks: Màn hình Tạo Phiên Kiểm kê & Nhập Số đếm Thực tế theo Lô (`stocktake-form`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Stocktake`, `BranchStock`, `Product` đảm bảo lọc `TenantId` (`REQ-STOC-FORM-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `stocktake-form` (`REQ-STOC-FORM-02`, `REQ-STOC-FORM-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `StocktakesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-STOC-FORM-01`, `REQ-STOC-FORM-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/stocktake/pages/StocktakeFormPage.tsx` tại route `/store-owner/stocktakes/create` và kết nối API thời gian thực (`REQ-STOC-FORM-01` → `REQ-STOC-FORM-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-04-04` (`REQ-STOC-FORM-01` → `REQ-STOC-FORM-04`).
