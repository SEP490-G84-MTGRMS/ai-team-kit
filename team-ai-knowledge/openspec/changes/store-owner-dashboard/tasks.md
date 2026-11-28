# Tasks: Màn hình Tổng quan Chủ cửa hàng (Store Owner Dashboard) (`store-owner-dashboard`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Order`, `CashbookEntry`, `GoodsReceipt`, `BranchStock`, `StockOnHand` đảm bảo lọc `TenantId` (`REQ-STOR-OWNE-DASH-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `store-owner-dashboard` (`REQ-STOR-OWNE-DASH-02`, `REQ-STOR-OWNE-DASH-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `StoreOwnerDashboardController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-STOR-OWNE-DASH-01`, `REQ-STOR-OWNE-DASH-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/store-owner-dashboard/pages/StoreOwnerDashboardPage.tsx` tại route `/store-owner` và kết nối API thời gian thực (`REQ-STOR-OWNE-DASH-01` → `REQ-STOR-OWNE-DASH-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-10-00` (`REQ-STOR-OWNE-DASH-01` → `REQ-STOR-OWNE-DASH-04`).
