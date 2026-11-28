# Proposal: Màn hình Cấu hình Hệ thống Nền tảng & Tài khoản Thụ hưởng SaaS (`admin-system-settings`)

## Vấn đề
Master Admin cần cấu hình tập trung tài khoản ngân hàng thụ hưởng phí thuê bao SaaS, đơn giá add-on chi nhánh/nhân sự, thông tin hotline hỗ trợ và chế độ bảo trì hệ thống.

## Mục tiêu
Cho phép xem và cập nhật an toàn các tham số vận hành toàn cục của nền tảng với cảnh báo thay đổi chưa lưu và kiểm tra dữ liệu chặt chẽ.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/admin/settings` (`src/pages/admin/AdminSettingsPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `PlatformSettingsHeader`, `SubscriptionPolicyCard`, `MasterBeneficiaryCard`, `SupportContactCard`, `MaintenanceModeCard`, `SettingsSummarySidebar`.
  - Tích hợp đầy đủ với tầng API Backend (`AdminSettingsController`, `PlatformPublicConfigController`) và thực thể nghiệp vụ (`PlatformSetting`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/admin/settings` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Quản trị viên nền tảng (Master Admin)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/admin/settings`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-21-07` (FE-21).
