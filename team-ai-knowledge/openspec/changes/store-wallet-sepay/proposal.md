# Proposal: Màn hình Ví Gian hàng & Nạp tiền Tự động qua SePay VietQR (`store-wallet-sepay`)

## Vấn đề
Chủ cửa hàng cần nạp tiền vào Ví gian hàng bằng quét mã VietQR ngân hàng để hệ thống tự động cộng số dư tức thời phục vụ mua/gia hạn gói cước và add-on.

## Mục tiêu
Tích hợp khép kín lệnh tạo mã nạp tiền VietQR, đối soát tự động qua `SepayWebhookController` chống cộng trùng và sổ cái biến động số dư Ví.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/settings?tab=wallet`, `/store-owner/account?tab=wallet` (`src/pages/store/StoreSettingsHubPage.tsx`, `src/pages/store/AccountManagementPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `WalletLedgerTab`, `StoreWalletTopupModal`.
  - Tích hợp đầy đủ với tầng API Backend (`WalletController`, `SepayWebhookController`) và thực thể nghiệp vụ (`Tenant`, `WalletTransaction`, `IdempotencyRecord`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/settings?tab=wallet`, `/store-owner/account?tab=wallet` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/settings?tab=wallet`, `/store-owner/account?tab=wallet`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-10` (FE-21).
