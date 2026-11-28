# Tasks: Màn hình Ví Gian hàng & Nạp tiền Tự động qua SePay VietQR (`store-wallet-sepay`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Tenant`, `WalletTransaction`, `IdempotencyRecord` đảm bảo lọc `TenantId` (`REQ-STOR-WALL-SEPA-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `store-wallet-sepay` (`REQ-STOR-WALL-SEPA-02`, `REQ-STOR-WALL-SEPA-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `WalletController.cs`, `SepayWebhookController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-STOR-WALL-SEPA-01`, `REQ-STOR-WALL-SEPA-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/store/StoreSettingsHubPage.tsx`, `src/pages/store/AccountManagementPage.tsx` tại route `/store-owner/settings?tab=wallet` và kết nối API thời gian thực (`REQ-STOR-WALL-SEPA-01` → `REQ-STOR-WALL-SEPA-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-10` (`REQ-STOR-WALL-SEPA-01` → `REQ-STOR-WALL-SEPA-04`).
