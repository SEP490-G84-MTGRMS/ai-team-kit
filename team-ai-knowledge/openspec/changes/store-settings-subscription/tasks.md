# Tasks: Màn hình Thiết lập Gian hàng, Gói cước SaaS, Add-on Nhân sự & Lưu trữ (`store-settings-subscription`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `Tenant`, `SubscriptionPlan`, `WalletTransaction` đảm bảo lọc `TenantId` (`REQ-STOR-SETT-SUBS-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `store-settings-subscription` (`REQ-STOR-SETT-SUBS-02`, `REQ-STOR-SETT-SUBS-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `TenantStoreController.cs`, `TenantStorageController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-STOR-SETT-SUBS-01`, `REQ-STOR-SETT-SUBS-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/store/StoreSettingsHubPage.tsx` tại route `/store-owner/subscriptions` và kết nối API thời gian thực (`REQ-STOR-SETT-SUBS-01` → `REQ-STOR-SETT-SUBS-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-08` (`REQ-STOR-SETT-SUBS-01` → `REQ-STOR-SETT-SUBS-04`).
