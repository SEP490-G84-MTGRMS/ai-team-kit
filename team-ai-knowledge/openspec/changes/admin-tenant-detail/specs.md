# Specs: Màn hình Chi tiết Hồ sơ Gian hàng Thuê & Lịch sử Giao dịch SaaS (`admin-tenant-detail`)

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
| `GET` | `/api/admin/tenants/{tenantId}/records` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-ADMI-TENA-DETA-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Hồ sơ Gian hàng Thuê & Lịch sử Giao dịch SaaS** (`/admin/tenants/:id`): Nạp thông tin định danh và hạn ngạch của Tenant qua `GET /api/admin/tenants/{id}` cùng lịch sử bản ghi qua `GET /api/admin/tenants/{tenantId}/records`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-TENA-DETA-01)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/tenants/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-TENA-DETA-01.
- **THEN** Hệ thống xử lý thành công qua `AdminTenantsController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-TENA-DETA-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-TENA-DETA-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/tenants/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-TENA-DETA-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Hồ sơ Gian hàng Thuê & Lịch sử Giao dịch SaaS** (`/admin/tenants/:id`): Hiển thị trực quan trạng thái thuê bao (`Hoạt động`, `Sắp hết hạn`, `Chờ kích hoạt`, `Đã khóa`) và mức tiêu thụ hạn ngạch chi nhánh/nhân sự.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-TENA-DETA-02)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/tenants/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-TENA-DETA-02.
- **THEN** Hệ thống xử lý thành công qua `AdminTenantsController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-TENA-DETA-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-TENA-DETA-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/tenants/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-TENA-DETA-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Hồ sơ Gian hàng Thuê & Lịch sử Giao dịch SaaS** (`/admin/tenants/:id`): Cho phép thực hiện trực tiếp Khóa dịch vụ, Mở khóa dịch vụ (bắt buộc nhập lý do >= 10 ký tự) và Gia hạn ân hạn ngay trên trang chi tiết.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-TENA-DETA-03)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/tenants/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-TENA-DETA-03.
- **THEN** Hệ thống xử lý thành công qua `AdminTenantsController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-TENA-DETA-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-TENA-DETA-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/tenants/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-TENA-DETA-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Hồ sơ Gian hàng Thuê & Lịch sử Giao dịch SaaS** (`/admin/tenants/:id`): Mọi thao tác can thiệp trạng thái dịch vụ của Tenant đều tự động cập nhật lại giao diện và lưu vết kiểm toán.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-TENA-DETA-04)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/tenants/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-TENA-DETA-04.
- **THEN** Hệ thống xử lý thành công qua `AdminTenantsController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-TENA-DETA-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-TENA-DETA-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/tenants/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-ADMI-TENA-DETA-01`: Nạp thông tin định danh và hạn ngạch của Tenant qua `GET /api/admin/tenants/{id}` cùng lịch sử bản ghi qua `GE...
- [x] `REQ-ADMI-TENA-DETA-02`: Hiển thị trực quan trạng thái thuê bao (`Hoạt động`, `Sắp hết hạn`, `Chờ kích hoạt`, `Đã khóa`) và mức tiêu th...
- [x] `REQ-ADMI-TENA-DETA-03`: Cho phép thực hiện trực tiếp Khóa dịch vụ, Mở khóa dịch vụ (bắt buộc nhập lý do >= 10 ký tự) và Gia hạn ân hạn...
- [x] `REQ-ADMI-TENA-DETA-04`: Mọi thao tác can thiệp trạng thái dịch vụ của Tenant đều tự động cập nhật lại giao diện và lưu vết kiểm toán.
