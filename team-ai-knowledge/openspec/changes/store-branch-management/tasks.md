# Tasks: Màn hình Quản lý Đa Chi nhánh & Mua thêm Hạn mức Chi nhánh (`store-branch-management`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Branch`, `Tenant` đảm bảo lọc `TenantId` (`REQ-STOR-BRAN-MANA-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `store-branch-management` (`REQ-STOR-BRAN-MANA-02`, `REQ-STOR-BRAN-MANA-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `BranchesController.cs`, `TenantBranchAddonController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-STOR-BRAN-MANA-01`, `REQ-STOR-BRAN-MANA-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/store/StoreSettingsHubPage.tsx` tại route `/store-owner/settings?tab=branches` và kết nối API thời gian thực (`REQ-STOR-BRAN-MANA-01` → `REQ-STOR-BRAN-MANA-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-09` (`REQ-STOR-BRAN-MANA-01` → `REQ-STOR-BRAN-MANA-04`).
