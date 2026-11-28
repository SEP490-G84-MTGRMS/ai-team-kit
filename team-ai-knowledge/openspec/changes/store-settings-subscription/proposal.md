# Proposal: Màn hình Thiết lập Gian hàng, Gói cước SaaS, Add-on Nhân sự & Lưu trữ (`store-settings-subscription`)

## Vấn đề
Chủ cửa hàng cần cập nhật hồ sơ cửa hàng, nâng cấp từ Gói Thường lên Gói Pro, mua thêm slot nhân viên (Staff Add-on), mua thêm dung lượng lưu trữ và tra cứu lịch sử đơn mua dịch vụ.

## Mục tiêu
Tập trung toàn bộ thiết lập thuê bao gian hàng tại `StoreSettingsHubPage` kết nối trực tiếp với số dư Ví gian hàng và bộ kiểm tra hạn ngạch.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/subscriptions`, `/store-owner/settings` (`src/pages/store/StoreSettingsHubPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `StoreSidebarNav`, `StoreTopStatusBar`, `StoreInfoTab`, `SubscriptionPricingCards`, `SubscriptionCheckoutModal`, `StaffAddonModal`, `OrderHistoryTab`, `TermsOfServiceTab`, `TrialStatusBanner`.
  - Tích hợp đầy đủ với tầng API Backend (`TenantStoreController`, `TenantStorageController`) và thực thể nghiệp vụ (`Tenant`, `SubscriptionPlan`, `WalletTransaction`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/subscriptions`, `/store-owner/settings` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/subscriptions`, `/store-owner/settings`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-08` (FE-21).
