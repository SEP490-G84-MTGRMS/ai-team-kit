# Specs: Màn hình Đăng ký Khởi tạo Gian hàng & Xác thực Email OTP (`auth-register`)

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

### Requirement: REQ-AUTH-REGI-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đăng ký Khởi tạo Gian hàng & Xác thực Email OTP** (`/auth/register`, `/register`): Kiểm tra mật khẩu từ 8–64 ký tự gồm chữ hoa, chữ thường, chữ số, ký tự đặc biệt và bắt buộc đồng ý điều khoản dịch vụ (`AuthPolicyModal`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-REGI-01)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest) đang truy cập màn hình `/auth/register` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-REGI-01.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-REGI-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-REGI-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/register` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-AUTH-REGI-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đăng ký Khởi tạo Gian hàng & Xác thực Email OTP** (`/auth/register`, `/register`): Gửi mã OTP xác thực về email đăng ký qua `POST /api/auth/register/send-otp` và xác minh qua `POST /api/auth/register/verify-otp` trước khi tạo Tenant.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-REGI-02)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest) đang truy cập màn hình `/auth/register` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-REGI-02.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-REGI-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-REGI-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/register` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-AUTH-REGI-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đăng ký Khởi tạo Gian hàng & Xác thực Email OTP** (`/auth/register`, `/register`): Khi gọi `POST /api/auth/register`, hệ thống tạo mới `Tenant`, tài khoản `STORE_OWNER` và chi nhánh gốc đầu tiên trong cùng một giao dịch nguyên tử.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-REGI-03)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest) đang truy cập màn hình `/auth/register` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-REGI-03.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-REGI-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-REGI-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/register` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-AUTH-REGI-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Đăng ký Khởi tạo Gian hàng & Xác thực Email OTP** (`/auth/register`, `/register`): Chặn đăng ký trùng Email hoặc Số điện thoại đã tồn tại và hiển thị thông báo lỗi chuẩn RFC 7807 ProblemDetails.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-AUTH-REGI-04)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest) đang truy cập màn hình `/auth/register` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-AUTH-REGI-04.
- **THEN** Hệ thống xử lý thành công qua `AuthController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-AUTH-REGI-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-AUTH-REGI-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/auth/register` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-AUTH-REGI-01`: Kiểm tra mật khẩu từ 8–64 ký tự gồm chữ hoa, chữ thường, chữ số, ký tự đặc biệt và bắt buộc đồng ý điều khoản ...
- [x] `REQ-AUTH-REGI-02`: Gửi mã OTP xác thực về email đăng ký qua `POST /api/auth/register/send-otp` và xác minh qua `POST /api/auth/re...
- [x] `REQ-AUTH-REGI-03`: Khi gọi `POST /api/auth/register`, hệ thống tạo mới `Tenant`, tài khoản `STORE_OWNER` và chi nhánh gốc đầu tiê...
- [x] `REQ-AUTH-REGI-04`: Chặn đăng ký trùng Email hoặc Số điện thoại đã tồn tại và hiển thị thông báo lỗi chuẩn RFC 7807 ProblemDetails...
