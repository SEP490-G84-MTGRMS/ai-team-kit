# Spec: admin-dashboard

> Spec gốc (Living Source of Truth) của capability `admin-dashboard`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-ADMI-DASH-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Quản trị Hệ thống SaaS (Master Admin Dashboard)** (`/admin`, `/admin/dashboard`): Chỉ vai trò `ADMIN` (Master Admin) mới được phép truy cập các endpoint `/api/admin/dashboard/*`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-DASH-01)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-DASH-01.
- **THEN** Hệ thống xử lý thành công qua `AdminDashboardController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-DASH-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-DASH-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-DASH-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Quản trị Hệ thống SaaS (Master Admin Dashboard)** (`/admin`, `/admin/dashboard`): Tổng hợp chính xác KPIs số khách thuê hoạt động, doanh thu gói cước, cơ cấu tỷ lệ từng gói (`plan-distribution`) và biểu đồ tăng trưởng theo tháng (`analytics`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-DASH-02)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-DASH-02.
- **THEN** Hệ thống xử lý thành công qua `AdminDashboardController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-DASH-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-DASH-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-DASH-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Quản trị Hệ thống SaaS (Master Admin Dashboard)** (`/admin`, `/admin/dashboard`): Hiển thị danh sách cảnh báo gian hàng sắp hết hạn hợp đồng hoặc quá hạn thanh toán từ `GET /api/admin/dashboard/urgent-alerts` kèm liên kết sang hồ sơ Tenant.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-DASH-03)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-DASH-03.
- **THEN** Hệ thống xử lý thành công qua `AdminDashboardController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-DASH-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-DASH-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-DASH-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tổng quan Quản trị Hệ thống SaaS (Master Admin Dashboard)** (`/admin`, `/admin/dashboard`): Hỗ trợ nút làm mới dữ liệu theo thời gian thực và xử lý độc lập lỗi từng khối dữ liệu để không làm trắng toàn trang.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-DASH-04)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-DASH-04.
- **THEN** Hệ thống xử lý thành công qua `AdminDashboardController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-DASH-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-DASH-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `admin-dashboard (baseline AS-IS)` · +4 ~0 -0
