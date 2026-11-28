# Proposal: Màn hình Hồ sơ Tài khoản Cá nhân, Bảo mật 2FA & Trung tâm Thông báo (`store-account-profile`)

## Vấn đề
Người dùng cần quản lý thông tin cá nhân, bật/tắt xác thực 2 lớp (2FA Email OTP), kiểm soát phiên thiết bị đăng nhập và nhận thông báo nghiệp vụ thời gian thực trên thanh Header.

## Mục tiêu
Cung cấp trang quản lý hồ sơ & bảo mật tài khoản kết hợp Trung tâm thông báo (Popover chuông thông báo & đánh dấu đã đọc).

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/account`, `/store-owner/profile` (`src/pages/store/AccountManagementPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `AccountSidebarNav`, `AccountProfileTab`, `TermsOfServiceTab`.
  - Tích hợp đầy đủ với tầng API Backend (`AuthController`, `NotificationsController`) và thực thể nghiệp vụ (`User`, `Notification`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/account`, `/store-owner/profile` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**
- **Quản trị viên nền tảng (Master Admin)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/account`, `/store-owner/profile`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-20-04` (FE-20).
