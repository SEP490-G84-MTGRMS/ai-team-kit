# Codebase Review: store-information-and-subscriptions

## 1. Bản Đồ Ảnh Hưởng Mã Nguồn (Code Mapping)

| REQ | Code Hiện Có | Cần Thêm / Chỉnh Sửa | Ghi Chú |
|---|---|---|---|
| **REQ-01** (Store Hub & Status Bar) | `src/layouts/StoreOwnerLayout/StoreOwnerTopbar.tsx` | Tạo `src/pages/store/StoreSettingsHubPage.tsx`<br>Tạo `StoreSidebarNav.tsx`, `StoreTopStatusBar.tsx` | Đặt route `/store-owner/subscriptions` và `/store-owner/settings`. |
| **REQ-02** (Pricing Plans) | `src/pages/admin/SubscriptionPlanPage.tsx` (dành cho Admin) | Tạo `SubscriptionPricingCards.tsx` (dành riêng cho Store Owner theo chuẩn KiotViet) | 3 gói cước 270k - 330k - 490k. |
| **REQ-03** (Tenant Wallet Top-up) | Chưa có | Tạo `StoreWalletTopupModal.tsx`<br>Tạo `WalletLedgerTab.tsx`<br>Thêm API nạp ví VietQR | Quét mã Napas 24/7. |
| **REQ-04** (Checkout & Payment) | Chưa có | Tạo `SubscriptionCheckoutModal.tsx` | Hỗ trợ 2 phương thức: Trừ ví & Quét VietQR. |
| **Database** | `Database_Design_Data_Dictionary.md` | Thêm `WalletBalance` vào `Tenants`<br>Thêm thực thể `TenantWalletTransactions` | Chuẩn hóa C# Entity & Mermaid ERD. |

## 2. Mã Nguồn Tái Sử Dụng Được
- Các token màu chuẩn KiotViet trong `src/index.css`: `--blue-primary` (`#0066FF`), `--bg-soft-blue` (`#F7FAFF`), `var(--radius-pill)` (`9999px`).
- Bộ icon `lucide-react`: `Store`, `CreditCard`, `Wallet`, `QrCode`, `CheckCircle2`, `Clock`, `ShieldCheck`, `AlertTriangle`.
- Cấu trúc Topbar hiện tại trong `StoreOwnerTopbar.tsx`.

## 3. Kết Luận: Khả Thi
Codebase hoàn toàn phù hợp để tích hợp mượt mà.
