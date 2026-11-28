# Tasks: Màn hình Cấu hình Chính sách Tích điểm, Đổi thưởng & Sổ cái Điểm Thành viên (`loyalty-config`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `LoyaltySetting`, `LoyaltyPointAdjustment`, `Customer` đảm bảo lọc `TenantId` (`REQ-LOYA-CONF-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `loyalty-config` (`REQ-LOYA-CONF-02`, `REQ-LOYA-CONF-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `LoyaltyConfigController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-LOYA-CONF-01`, `REQ-LOYA-CONF-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/promotion/pages/LoyaltyConfigPage.tsx` tại route `/store-owner/loyalty-config` và kết nối API thời gian thực (`REQ-LOYA-CONF-01` → `REQ-LOYA-CONF-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-16-03` (`REQ-LOYA-CONF-01` → `REQ-LOYA-CONF-04`).
