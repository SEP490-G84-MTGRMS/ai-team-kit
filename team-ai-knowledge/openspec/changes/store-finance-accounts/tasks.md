# Tasks: Màn hình Cấu hình Tài khoản Ngân hàng, Két quỹ & Kết nối SePay Cửa hàng (`store-finance-accounts`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `FinanceAccount`, `PaymentTransaction` đảm bảo lọc `TenantId` (`REQ-STOR-FINA-ACCO-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `store-finance-accounts` (`REQ-STOR-FINA-ACCO-02`, `REQ-STOR-FINA-ACCO-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `FinanceAccountsController.cs`, `PaymentsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-STOR-FINA-ACCO-01`, `REQ-STOR-FINA-ACCO-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/finance-accounts/pages/FinanceAccountsSettingsPage.tsx`, `src/features/pos/pages/StorePaymentConfigPage.tsx` tại route `/store-owner/subscriptions?tab=finance-accounts` và kết nối API thời gian thực (`REQ-STOR-FINA-ACCO-01` → `REQ-STOR-FINA-ACCO-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-17-02` (`REQ-STOR-FINA-ACCO-01` → `REQ-STOR-FINA-ACCO-04`).
