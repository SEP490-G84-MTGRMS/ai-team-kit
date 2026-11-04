# Tasks: wallet-topup-sepay-integration

Checklist các tác vụ triển khai chức năng Nạp ví gian hàng qua VietQR SePay và nâng cấp giao diện Deep Teal.

---

## DB & Domain
- [ ] T1 — Cập nhật Entity `Tenant` (thêm trường `WalletBalance`), tạo Entity `WalletTopupOrder` và `WalletTransaction` trong tầng Domain (REQ-WAL-01, REQ-WAL-03)
- [ ] T2 — Cấu hình EF Core Fluent API trong `AppDbContext` và tạo migration / cập nhật schema database PostgreSQL (REQ-WAL-01, REQ-WAL-03)

## Backend
- [ ] T3 — Cấu hình `SePaySettings` trong `appsettings.json`, `appsettings.Development.json` và đăng ký Dependency Injection (REQ-WAL-01, REQ-WAL-03)
- [ ] T4 — Xây dựng DTOs, Repository và Service `IWalletService` / `WalletService` xử lý nghiệp vụ tạo đơn nạp, kiểm tra trạng thái đơn, lấy số dư và sổ cái giao dịch (REQ-WAL-01, REQ-WAL-02, REQ-WAL-05)
- [ ] T5 — Xây dựng `WalletController` (`/api/v1/tenant/wallet/*`) cung cấp các API tạo đơn nạp, kiểm tra trạng thái, tra cứu số dư và lịch sử giao dịch (REQ-WAL-01, REQ-WAL-02, REQ-WAL-05)
- [ ] T6 — Xây dựng `SepayWebhookController` (`/api/v1/webhooks/sepay`): xác thực token, kiểm tra Idempotency chống nạp trùng, phân tích nội dung, cộng số dư ví và lưu sổ cái (REQ-WAL-03)
- [ ] T7 — Cập nhật API `TenantStoreController.PurchaseSubscription`: khấu trừ số dư ví và lưu giao dịch `PURCHASE_PLAN` khi thanh toán bằng `WALLET` (REQ-WAL-04)

## Frontend
- [ ] T8 — Xây dựng API client service `walletApi.ts` trong `src/pages/store/api/` kết nối các endpoint nạp ví, kiểm tra trạng thái và lịch sử sổ cái (REQ-WAL-01, REQ-WAL-02, REQ-WAL-05)
- [ ] T9 — Tái thiết kế giao diện `StoreWalletTopupModal.tsx`: áp dụng theme Deep Teal `#0F766E`, font `Be Vietnam Pro`, hiển thị VietQR động thật từ SePay, nút 1-click copy và cơ chế tự động Polling trạng thái (REQ-WAL-01, REQ-WAL-02)
- [ ] T10 — Đồng bộ `WalletLedgerTab.tsx` và `StoreSettingsHubPage.tsx`: hiển thị số dư ví thật từ backend, 3 thẻ tóm tắt và bảng lịch sử giao dịch nạp/chi (REQ-WAL-05)
- [ ] T11 — Đồng bộ `SubscriptionCheckoutModal.tsx`: kiểm tra số dư ví khả dụng thực tế khi chọn thanh toán bằng ví (REQ-WAL-04)

## Test & Verification
- [ ] T12 — Viết Unit Tests / Integration Tests kiểm thử Webhook Idempotency, cộng số dư ví, và khấu trừ số dư khi mua gói dịch vụ (REQ-WAL-01, REQ-WAL-03, REQ-WAL-04)
- [ ] T13 — Kiểm thử End-to-End: Chạy build Backend (.NET `dotnet build`), Frontend (`npm run build`), kiểm tra giao diện và API flow (REQ-WAL-01, REQ-WAL-02, REQ-WAL-03)
