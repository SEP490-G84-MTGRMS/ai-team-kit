# Specs: Màn hình Danh sách Hồ sơ Nhân viên, Cấp Tài khoản Đăng nhập & Phân quyền RBAC (`hr-employee-list`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/employees` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/employees/me` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/employees/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/employees` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/employees/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PATCH` | `/api/employees/{id:guid}/status` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/employees/{id:guid}/identity-account` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/employees/{id:guid}/identity-account` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `DELETE` | `/api/employees/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/employees/{id:guid}/face-descriptor` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-HR-EMPL-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Hồ sơ Nhân viên, Cấp Tài khoản Đăng nhập & Phân quyền RBAC** (`/store-owner/employees`, `/employees`): Truy vấn và quản lý CRUD hồ sơ nhân viên qua `GET/POST/PUT /api/employees` có kiểm tra hạn ngạch số nhân sự tối đa của Tenant.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-EMPL-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-EMPL-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `EmployeesController`, cập nhật chính xác dữ liệu `Employee` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-EMPL-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-EMPL-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-EMPL-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Hồ sơ Nhân viên, Cấp Tài khoản Đăng nhập & Phân quyền RBAC** (`/store-owner/employees`, `/employees`): Liên kết tạo/cập nhật tài khoản đăng nhập hệ thống cho nhân viên ngay trên hồ sơ (`POST/PUT /api/employees/{id}/identity-account`); khi chuyển trạng thái nhân viên sang `Nghỉ việc` (`PATCH .../status`), hệ thống tự động khóa tài khoản đăng nhập liên kết.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-EMPL-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-EMPL-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `EmployeesController`, cập nhật chính xác dữ liệu `Employee` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-EMPL-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-EMPL-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-EMPL-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Hồ sơ Nhân viên, Cấp Tài khoản Đăng nhập & Phân quyền RBAC** (`/store-owner/employees`, `/employees`): Lưu trữ véc-tơ đặc trưng khuôn mặt phục vụ chấm công qua `POST /api/employees/{id}/face-descriptor` và cấu hình mức lương/phụ cấp `EmployeeAllowance`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-EMPL-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-EMPL-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `EmployeesController`, cập nhật chính xác dữ liệu `Employee` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-EMPL-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-EMPL-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-EMPL-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Hồ sơ Nhân viên, Cấp Tài khoản Đăng nhập & Phân quyền RBAC** (`/store-owner/employees`, `/employees`): Áp dụng phân quyền RBAC & Row-Level Security: nhân viên thường chỉ được đọc hồ sơ của chính mình qua `GET /api/employees/me`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-EMPL-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-EMPL-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `EmployeesController`, cập nhật chính xác dữ liệu `Employee` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-EMPL-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-EMPL-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-HR-EMPL-LIST-01`: Truy vấn và quản lý CRUD hồ sơ nhân viên qua `GET/POST/PUT /api/employees` có kiểm tra hạn ngạch số nhân sự tố...
- [x] `REQ-HR-EMPL-LIST-02`: Liên kết tạo/cập nhật tài khoản đăng nhập hệ thống cho nhân viên ngay trên hồ sơ (`POST/PUT /api/employees/{id...
- [x] `REQ-HR-EMPL-LIST-03`: Lưu trữ véc-tơ đặc trưng khuôn mặt phục vụ chấm công qua `POST /api/employees/{id}/face-descriptor` và cấu hìn...
- [x] `REQ-HR-EMPL-LIST-04`: Áp dụng phân quyền RBAC & Row-Level Security: nhân viên thường chỉ được đọc hồ sơ của chính mình qua `GET /api...
