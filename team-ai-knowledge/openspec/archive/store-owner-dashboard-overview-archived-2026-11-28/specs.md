# Spec: saas-master-admin-portal

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-DASH-ADMIN-01 Thống kê vận hành SaaS trên Dashboard Admin
Dashboard Admin **MUST** hiển thị tối thiểu:

1. MRR dự kiến, tính bằng tổng giá tháng của subscription plan thuộc các tenant đang hoạt động và không bị khóa.
2. Tổng số tenant trong hệ thống.
3. Tổng số giao dịch nâng cấp subscription plan thành công.

Giao dịch nâng cấp thành công là giao dịch chuyển tenant từ plan hiện tại lên plan cao hơn, được lưu với loại `UPGRADE_PLAN` và trạng thái `SUCCESS`. Gia hạn cùng plan, mua plan lần đầu, dùng thử và hạ cấp **MUST NOT** được tính là nâng cấp.

Các số liệu **MUST** được lấy từ dữ liệu hệ thống, có trạng thái tải, rỗng và lỗi rõ ràng; không sử dụng số liệu mock hoặc fallback giả lập.

#### Scenario: Admin xem thống kê SaaS
- **GIVEN** Admin có quyền truy cập `/admin/dashboard`
- **WHEN** Dashboard tải dữ liệu thành công
- **THEN** hệ thống hiển thị MRR dự kiến, tổng số tenant và tổng số giao dịch nâng cấp thành công
- **AND** MRR được định dạng tiền tệ VND nhất quán
- **AND** các số đếm phản ánh dữ liệu hiện có trong hệ thống

#### Scenario: Ghi nhận giao dịch nâng cấp thành công
- **GIVEN** tenant đang sử dụng một plan trả phí
- **WHEN** tenant chuyển lên plan cao hơn và thanh toán thành công
- **THEN** hệ thống lưu giao dịch với loại `UPGRADE_PLAN` và trạng thái `SUCCESS`
- **AND** số giao dịch nâng cấp thành công trên Dashboard Admin tăng tương ứng

#### Scenario: Không tính giao dịch không phải nâng cấp
- **GIVEN** tenant gia hạn cùng plan, mua plan lần đầu, dùng thử hoặc giao dịch thất bại
- **WHEN** Dashboard Admin tổng hợp thống kê
- **THEN** giao dịch đó không được tính vào số giao dịch nâng cấp thành công

#### Scenario: Không có dữ liệu thống kê
- **GIVEN** chưa có tenant hoạt động hoặc giao dịch nâng cấp thành công
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
- 2026-11-15 · `sep-verify-spec` · Làm rõ MRR và giao dịch nâng cấp thành công
