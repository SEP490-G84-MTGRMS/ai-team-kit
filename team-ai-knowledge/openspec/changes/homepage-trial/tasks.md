# Tasks: Trang chủ Nền tảng SaaS & Kích hoạt Dùng thử 3 ngày (`homepage-trial`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `PlatformSetting`, `Tenant`, `SubscriptionPlan` đảm bảo lọc `TenantId` (`REQ-HOME-TRIA-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `homepage-trial` (`REQ-HOME-TRIA-02`, `REQ-HOME-TRIA-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `PlatformPublicConfigController.cs`, `TenantStoreController.cs` kèm kiểm soát phân quyền RBAC (Guest, StoreOwner) (`REQ-HOME-TRIA-01`, `REQ-HOME-TRIA-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/HomePage/HomePage.tsx` tại route `/` và kết nối API thời gian thực (`REQ-HOME-TRIA-01` → `REQ-HOME-TRIA-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-00` (`REQ-HOME-TRIA-01` → `REQ-HOME-TRIA-04`).
