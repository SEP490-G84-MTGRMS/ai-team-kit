# Spec: saas-master-admin-portal

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-DASH-ADMIN-01 Thống kê vận hành SaaS trên Dashboard Admin
Dashboard Admin **MUST** hiển thị tối thiểu:

1. Tổng doanh thu subscription thu được từ các tenant.
2. Tổng số tenant trong hệ thống.
3. Tổng số yêu cầu nâng cấp subscription plan.

Các số liệu **MUST** được lấy từ dữ liệu hệ thống, có trạng thái tải, rỗng và lỗi rõ ràng; không sử dụng số liệu mock.

#### Scenario: Admin xem thống kê SaaS
- **GIVEN** Admin có quyền truy cập `/admin/dashboard`
- **WHEN** Dashboard tải dữ liệu thành công
- **THEN** hệ thống hiển thị doanh thu subscription, số tenant và số yêu cầu nâng cấp gói
- **AND** doanh thu được định dạng tiền tệ nhất quán
- **AND** các số đếm phản ánh dữ liệu hiện có trong hệ thống

#### Scenario: Không có dữ liệu thống kê
- **GIVEN** chưa có doanh thu, tenant hoặc yêu cầu nâng cấp
- **WHEN** Admin mở Dashboard
- **THEN** hệ thống hiển thị giá trị `0`
- **AND** không hiển thị dữ liệu mẫu gây hiểu nhầm

#### Scenario: Không tải được dữ liệu
- **GIVEN** API thống kê trả lỗi
- **WHEN** Dashboard tải dữ liệu
- **THEN** hệ thống hiển thị trạng thái lỗi rõ ràng
- **AND** cho phép Admin thực hiện tải lại

### Requirement: REQ-DASH-01 Phân tách Tổng quan Chủ tiệm và Tổng quan Admin SaaS
- Hệ thống **MUST** phân tách màn hình Tổng quan Chủ cửa hàng (`/store-owner/dashboard`) và Tổng quan Quản trị hệ thống (`/admin/dashboard`).
- `/store-owner` và `/store-owner/dashboard` **SHALL** render `StoreOwnerDashboardPage`.
- `/admin/dashboard` **SHALL** render `AdminDashboardPage`.
- Dashboard Admin **MUST** chỉ hiển thị số liệu quản trị SaaS và không trộn lẫn KPI bán lẻ của từng cửa hàng.

#### Scenario: Truy cập đúng dashboard theo vai trò
- **GIVEN** người dùng đã đăng nhập với vai trò phù hợp
- **WHEN** truy cập dashboard tương ứng
- **THEN** hệ thống hiển thị đúng dashboard theo route và vai trò
- **AND** Dashboard Admin không hiển thị KPI bán lẻ của Store Owner

## Lịch sử
- 2026-11-14 · `sep-refactor:Tách-rõ-Dashboard-Admin-SaaS-khỏi-KPI-bá` · +1 ~1 -0
