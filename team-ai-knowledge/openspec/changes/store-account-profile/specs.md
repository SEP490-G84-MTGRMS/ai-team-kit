# Specs: Màn hình Hồ sơ Tài khoản Cá nhân, Bảo mật 2FA & Trung tâm Thông báo (`store-account-profile`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/auth/login/send-otp` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/auth/login/verify-otp` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/auth/register/send-otp` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/auth/register/verify-otp` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/auth/register` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/auth/refresh` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/auth/me` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/auth/me/2fa` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/auth/me/2fa/challenge` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-STOR-ACCO-PROF-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Hồ sơ Tài khoản Cá nhân, Bảo mật 2FA & Trung tâm Thông báo** (`/store-owner/account`, `/store-owner/profile`): Hiển thị thông tin người dùng hiện tại từ `GET /api/auth/me` và trạng thái bảo mật hai lớp từ `GET /api/auth/me/2fa`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-ACCO-PROF-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee / MasterAdmin) đang truy cập màn hình `/store-owner/account` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-ACCO-PROF-01.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-ACCO-PROF-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-ACCO-PROF-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/account` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-ACCO-PROF-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Hồ sơ Tài khoản Cá nhân, Bảo mật 2FA & Trung tâm Thông báo** (`/store-owner/account`, `/store-owner/profile`): Khi bật/tắt 2FA, bắt buộc tạo thử thách xác thực qua `POST /api/auth/me/2fa/challenge` và xác nhận mã OTP qua `POST /api/auth/me/2fa/confirm`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-ACCO-PROF-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee / MasterAdmin) đang truy cập màn hình `/store-owner/account` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-ACCO-PROF-02.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-ACCO-PROF-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-ACCO-PROF-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/account` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-ACCO-PROF-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Hồ sơ Tài khoản Cá nhân, Bảo mật 2FA & Trung tâm Thông báo** (`/store-owner/account`, `/store-owner/profile`): Trung tâm thông báo nạp danh sách thông báo theo người dùng/chi nhánh qua `GET /api/notifications`, hỗ trợ đánh dấu đã đọc từng mục (`PATCH /api/notifications/{id}/read`) hoặc tất cả (`read-all`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-ACCO-PROF-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee / MasterAdmin) đang truy cập màn hình `/store-owner/account` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-ACCO-PROF-03.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-ACCO-PROF-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-ACCO-PROF-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/account` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-ACCO-PROF-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Hồ sơ Tài khoản Cá nhân, Bảo mật 2FA & Trung tâm Thông báo** (`/store-owner/account`, `/store-owner/profile`): Bấm vào thông báo nghiệp vụ (duyệt chi, cảnh báo hạn dùng, bảng lương, ca làm) điều hướng chính xác tới màn hình đích tương ứng.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-ACCO-PROF-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee / MasterAdmin) đang truy cập màn hình `/store-owner/account` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-ACCO-PROF-04.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-ACCO-PROF-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-ACCO-PROF-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/account` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-STOR-ACCO-PROF-01`: Hiển thị thông tin người dùng hiện tại từ `GET /api/auth/me` và trạng thái bảo mật hai lớp từ `GET /api/auth/m...
- [x] `REQ-STOR-ACCO-PROF-02`: Khi bật/tắt 2FA, bắt buộc tạo thử thách xác thực qua `POST /api/auth/me/2fa/challenge` và xác nhận mã OTP qua ...
- [x] `REQ-STOR-ACCO-PROF-03`: Trung tâm thông báo nạp danh sách thông báo theo người dùng/chi nhánh qua `GET /api/notifications`, hỗ trợ đán...
- [x] `REQ-STOR-ACCO-PROF-04`: Bấm vào thông báo nghiệp vụ (duyệt chi, cảnh báo hạn dùng, bảng lương, ca làm) điều hướng chính xác tới màn hì...
