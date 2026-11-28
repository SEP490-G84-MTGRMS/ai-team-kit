# Tasks: Màn hình Quản lý Chương trình Khuyến mãi, Chiết khấu Bậc thang & Mua X Tặng Y (`promotion-list`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Promotion`, `PromotionCondition` đảm bảo lọc `TenantId` (`REQ-PROM-LIST-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `promotion-list` (`REQ-PROM-LIST-02`, `REQ-PROM-LIST-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `PromotionsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-PROM-LIST-01`, `REQ-PROM-LIST-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/promotion/pages/PromotionListPage.tsx` tại route `/store-owner/promotions` và kết nối API thời gian thực (`REQ-PROM-LIST-01` → `REQ-PROM-LIST-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-16-01` (`REQ-PROM-LIST-01` → `REQ-PROM-LIST-04`).
