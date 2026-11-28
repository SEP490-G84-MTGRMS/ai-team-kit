# Specs: Màn hình Tổng quan Quản trị Hệ thống SaaS (Master Admin Dashboard) (`admin-dashboard`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/admin/dashboard/kpis` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/dashboard/plan-distribution` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/dashboard/urgent-alerts` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/dashboard/analytics` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/dashboard/overview` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

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

## Acceptance checklist
- [x] `REQ-ADMI-DASH-01`: Chỉ vai trò `ADMIN` (Master Admin) mới được phép truy cập các endpoint `/api/admin/dashboard/*`.
- [x] `REQ-ADMI-DASH-02`: Tổng hợp chính xác KPIs số khách thuê hoạt động, doanh thu gói cước, cơ cấu tỷ lệ từng gói (`plan-distribution...
- [x] `REQ-ADMI-DASH-03`: Hiển thị danh sách cảnh báo gian hàng sắp hết hạn hợp đồng hoặc quá hạn thanh toán từ `GET /api/admin/dashboar...
- [x] `REQ-ADMI-DASH-04`: Hỗ trợ nút làm mới dữ liệu theo thời gian thực và xử lý độc lập lỗi từng khối dữ liệu để không làm trắng toàn ...
