# Proposal: Trang chủ Nền tảng SaaS & Kích hoạt Dùng thử 3 ngày (`homepage-trial`)

## Vấn đề
Khách hàng tiềm năng truy cập trang chủ cần nắm bắt hệ sinh thái quản lý chuỗi tạp hóa MT-GRMS, bảng giá gói dịch vụ động từ nền tảng và kích hoạt nhanh gói dùng thử miễn phí 3 ngày.

## Mục tiêu
Cung cấp Landing Page tốc độ cao tích hợp cấu hình công khai từ Backend và luồng điều hướng kích hoạt dùng thử 3 ngày liền mạch cho cả khách chưa đăng nhập lẫn chủ gian hàng mới.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/` (`src/pages/HomePage/HomePage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `TopAnnouncementBar`, `Navbar`, `HeroSection`, `FloatingFeaturesCard`, `SolutionShowcaseSection`, `ServicesEcosystemSection`, `FaqSection`, `CtaBanner`, `Footer`.
  - Tích hợp đầy đủ với tầng API Backend (`PlatformPublicConfigController`, `TenantStoreController`) và thực thể nghiệp vụ (`PlatformSetting`, `Tenant`, `SubscriptionPlan`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Khách vãng lai / Chưa đăng nhập**
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-00` (FE-21).
