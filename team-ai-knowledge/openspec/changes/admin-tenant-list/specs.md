# Specs: Màn hình Danh sách & Quản lý Gian hàng Thuê (Tenant Management) (`admin-tenant-list`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `POST` | `/api/admin/tenants` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/tenants` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/tenants/{id}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/admin/tenants/{id}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/admin/tenants/{id}/lock` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/admin/tenants/{id}/unlock` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/admin/tenants/{id}/extend-grace` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-ADMI-TENA-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách & Quản lý Gian hàng Thuê (Tenant Management)** (`/admin/tenants`): Hiển thị danh sách Tenants từ `GET /api/admin/tenants` kèm đầy đủ Mã số thuế, Chủ sở hữu, Gói dịch vụ, Số chi nhánh, Số nhân sự, Hạn hợp đồng và Trạng thái.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-TENA-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/tenants` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-TENA-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `AdminTenantsController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-TENA-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-TENA-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/tenants` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-TENA-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách & Quản lý Gian hàng Thuê (Tenant Management)** (`/admin/tenants`): Cho phép tạo mới gian hàng qua `POST /api/admin/tenants` (`CreateTenantModal`) và xuất danh sách kết quả lọc ra tệp CSV/Excel.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-TENA-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/tenants` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-TENA-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `AdminTenantsController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-TENA-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-TENA-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/tenants` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-TENA-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách & Quản lý Gian hàng Thuê (Tenant Management)** (`/admin/tenants`): Khi khóa gian hàng (`POST /api/admin/tenants/{id}/lock`) bắt buộc nhập lý do tối thiểu 10 ký tự; mở khóa qua `POST /api/admin/tenants/{id}/unlock`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-TENA-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/tenants` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-TENA-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `AdminTenantsController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-TENA-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-TENA-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/tenants` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-TENA-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách & Quản lý Gian hàng Thuê (Tenant Management)** (`/admin/tenants`): Cho phép gia hạn thời gian ân hạn (`POST /api/admin/tenants/{id}/extend-grace`) và ghi nhận đầy đủ vào `AuditLog`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-TENA-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/tenants` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-TENA-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `AdminTenantsController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-TENA-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-TENA-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/tenants` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-ADMI-TENA-LIST-01`: Hiển thị danh sách Tenants từ `GET /api/admin/tenants` kèm đầy đủ Mã số thuế, Chủ sở hữu, Gói dịch vụ, Số chi ...
- [x] `REQ-ADMI-TENA-LIST-02`: Cho phép tạo mới gian hàng qua `POST /api/admin/tenants` (`CreateTenantModal`) và xuất danh sách kết quả lọc r...
- [x] `REQ-ADMI-TENA-LIST-03`: Khi khóa gian hàng (`POST /api/admin/tenants/{id}/lock`) bắt buộc nhập lý do tối thiểu 10 ký tự; mở khóa qua `...
- [x] `REQ-ADMI-TENA-LIST-04`: Cho phép gia hạn thời gian ân hạn (`POST /api/admin/tenants/{id}/extend-grace`) và ghi nhận đầy đủ vào `AuditL...
