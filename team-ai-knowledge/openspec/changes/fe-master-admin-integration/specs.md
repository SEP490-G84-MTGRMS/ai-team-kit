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

## Lịch sử
- 2026-11-11 · `sep-refactor:Bổ-sung-yêu-cầu-trang-edit-gói-admin-map` · +0 ~1 -0
