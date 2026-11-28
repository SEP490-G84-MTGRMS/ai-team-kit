# Specs: Màn hình Đăng nhập Đa vai trò & Xác thực 2FA OTP (`auth-login`)

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

### Requirement: REQ-AUTH-LOGI-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đăng nhập Đa vai trò & Xác thực 2FA OTP** (`/auth/login`, `/login`): Xác thực thông tin đăng nhập qua `POST /api/auth/login`; nếu tài khoản bật 2FA thì hiển thị `LoginOtpModal` gửi/xác minh mã 6 chữ số qua `POST /api/auth/login/send-otp` và `POST /api/auth/login/verify-otp`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-LOGI-01)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest / MasterAdmin / StoreOwner / Employee) đang truy cập màn hình `/auth/login` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-LOGI-01.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-LOGI-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-LOGI-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/login` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-AUTH-LOGI-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đăng nhập Đa vai trò & Xác thực 2FA OTP** (`/auth/login`, `/login`): Nếu gian hàng đang bị khóa (`Tenant.IsLocked = true`), hệ thống chặn cấp phiên làm việc và trả thông báo lý do khóa dịch vụ rõ ràng.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-LOGI-02)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest / MasterAdmin / StoreOwner / Employee) đang truy cập màn hình `/auth/login` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-LOGI-02.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-LOGI-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-LOGI-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/login` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-AUTH-LOGI-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đăng nhập Đa vai trò & Xác thực 2FA OTP** (`/auth/login`, `/login`): Sau khi đăng nhập thành công, hệ thống tự động điều hướng `ADMIN` sang `/admin/dashboard`, `STORE_OWNER` sang `/store-owner/dashboard` và `STAFF` sang `/employee/attendance` hoặc `/pos`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-LOGI-03)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest / MasterAdmin / StoreOwner / Employee) đang truy cập màn hình `/auth/login` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-LOGI-03.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-LOGI-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-LOGI-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/login` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-AUTH-LOGI-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đăng nhập Đa vai trò & Xác thực 2FA OTP** (`/auth/login`, `/login`): Hỗ trợ làm mới phiên tự động qua `POST /api/auth/refresh` và thu hồi phiên qua `POST /api/auth/logout`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-LOGI-04)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest / MasterAdmin / StoreOwner / Employee) đang truy cập màn hình `/auth/login` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-LOGI-04.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `User` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-LOGI-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-LOGI-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/login` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-AUTH-LOGI-01`: Xác thực thông tin đăng nhập qua `POST /api/auth/login`; nếu tài khoản bật 2FA thì hiển thị `LoginOtpModal` gử...
- [x] `REQ-AUTH-LOGI-02`: Nếu gian hàng đang bị khóa (`Tenant.IsLocked = true`), hệ thống chặn cấp phiên làm việc và trả thông báo lý do...
- [x] `REQ-AUTH-LOGI-03`: Sau khi đăng nhập thành công, hệ thống tự động điều hướng `ADMIN` sang `/admin/dashboard`, `STORE_OWNER` sang ...
- [x] `REQ-AUTH-LOGI-04`: Hỗ trợ làm mới phiên tự động qua `POST /api/auth/refresh` và thu hồi phiên qua `POST /api/auth/logout`.
