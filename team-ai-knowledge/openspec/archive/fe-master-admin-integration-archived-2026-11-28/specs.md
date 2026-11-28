# Spec: saas-master-admin-portal

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-FE-ADMIN-02 Tích hợp trang Quản lý Gói cước (Subscription Plans)
Trang `SubscriptionPlanPage` và các Form Modals/Pages SHALL nạp và đồng bộ dữ liệu thật với Backend qua `planApi`:
- Nạp danh sách gói cước và KPI banner từ Backend.
- Tạo mới gói cước với hạn ngạch Quotas và Features JSON.
- Trang chỉnh sửa `/admin/subscriptions/:id` MUST gọi API chi tiết theo `id`, ánh xạ đầy đủ các trường gói cước, hạn ngạch và tính năng vào form; hiển thị trạng thái đang tải, lỗi và không tìm thấy gói; lưu thay đổi qua API cập nhật và phản ánh dữ liệu mới.
- Giao diện quản lý/chỉnh sửa gói admin MUST đồng bộ bố cục và phong cách với giao diện admin hiện có.
- Bật/tắt kích hoạt trạng thái (`IsActive`).
- Xóa gói cước kèm xử lý bắt lỗi nghiệp vụ.

#### Scenario: Nạp danh sách gói cước thật
- GIVEN Trang `SubscriptionPlanPage` được mount.
- WHEN Gọi `planApi.getPlans()` và `planApi.getKpis()`.
- THEN Giao diện hiển thị danh sách gói cước và 4 chỉ số KPI thật từ PostgreSQL.

#### Scenario: Chỉnh sửa gói từ dữ liệu API
- GIVEN Admin mở `/admin/subscriptions/:id` với `id` hợp lệ.
- WHEN API chi tiết trả về dữ liệu gói.
- THEN form hiển thị đúng thông tin, hạn ngạch và tính năng từ API; sau khi lưu thành công giao diện phản ánh dữ liệu mới.

#### Scenario: Không tải được gói
- GIVEN Admin mở trang chỉnh sửa nhưng API lỗi hoặc không tìm thấy `id`.
- WHEN yêu cầu hoàn tất.
- THEN giao diện hiển thị thông báo phù hợp và không cho lưu dữ liệu mặc định thay cho gói thực.

### Requirement: REQ-FE-ADMIN-05 Cấu hình Nền tảng Toàn cục (/admin/settings)
Trang `/admin/settings` và Backend APIs SHALL cung cấp giao diện và dịch vụ quản lý tập trung cấu hình SaaS toàn hệ thống, loại bỏ cấu hình cứng (hardcode) trong mã nguồn và appsettings:
1. **Chính sách thuê bao & Ân hạn**:
   - Cấu hình số ngày dùng thử mặc định (`TrialDays`: 1 - 30 ngày, mặc định 3 ngày).
   - Số ngày ân hạn trước khi khóa (`GracePeriodDays`: 1 - 60 ngày, mặc định 7 ngày).
   - Đơn giá mua thêm 1 chi nhánh/tháng (`BranchAddonPriceMonthly`: >= 0 đ/tháng, mặc định 80.000 đ/tháng).
   - Đơn giá mua thêm dung lượng lưu trữ (`StorageAddonPricePerGbMonthly`: >= 0 đ/GB/tháng, mặc định 15.000 đ/GB/tháng).
2. **Tài khoản thụ hưởng Master (Master VietQR Beneficiary)**:
   - Ngân hàng thụ hưởng (`MasterBankCode`, `MasterBankName`).
   - Số tài khoản thụ hưởng (`MasterAccountNumber`).
   - Tên chủ tài khoản thụ hưởng (`MasterAccountName`) dùng để sinh mã VietQR nhận thanh toán kích hoạt gói cước và nạp tiền ví từ mọi khách hàng thuê.
3. **Cấu hình liên hệ & CSKH**:
   - Hotline hỗ trợ (`SupportHotline`: ví dụ "1900 6522").
   - Email hỗ trợ kỹ thuật (`SupportEmail`: định dạng email hợp lệ).
   - Zalo hỗ trợ (`SupportZalo`: link hoặc số điện thoại Zalo).
4. **Bật/Tắt chế độ bảo trì (Maintenance Mode)**:
   - Toggle switch kích hoạt chế độ bảo trì toàn hệ thống (`IsMaintenanceMode`).
   - Thông điệp bảo trì (`MaintenanceMessage`) hiển thị trên banner hoặc màn hình thông báo người dùng.
   - Thời gian dự kiến hoàn tất bảo trì (`MaintenanceExpectedEndTime`).

#### Scenario: Xem và lưu cấu hình nền tảng thành công
- GIVEN Master Admin truy cập trang `/admin/settings`.
- WHEN Dữ liệu cấu hình tải về thành công và Admin điều chỉnh các thông số rồi bấm "Lưu thay đổi".
- THEN Dữ liệu được xác thực hợp lệ qua Backend API, lưu trữ vào PostgreSQL và hiển thị thông báo thành công.

## Lịch sử
- 2026-11-11 · `sep-refactor:Bổ-sung-yêu-cầu-trang-edit-gói-admin-map` · +0 ~1 -0
- 2026-11-15 · `Bổ sung REQ-FE-ADMIN-05 Cấu hình Nền tảng Toàn cục (/admin/settings)` · +1 ~0 -0
