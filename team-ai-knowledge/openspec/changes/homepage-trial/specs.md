# Specs: Trang chủ Nền tảng SaaS & Kích hoạt Dùng thử 3 ngày (`homepage-trial`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/platform/public-config` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tenant/subscriptions/staff-addon/quote` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tenant/subscriptions/staff-addon/purchase` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tenant/store-info` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/tenant/store-info` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tenant/pricing-plans` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tenant/subscriptions/pro-quote` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tenant/subscriptions/purchase` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tenant/subscriptions/trial` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tenant/subscriptions/trial-status` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-HOME-TRIA-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Trang chủ Nền tảng SaaS & Kích hoạt Dùng thử 3 ngày** (`/`): Tải cấu hình công khai (hotline hỗ trợ, thông tin gói cước niêm yết, trạng thái bảo trì) từ `GET /api/platform/public-config` và `GET /api/tenant/pricing-plans`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HOME-TRIA-01)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest / StoreOwner) đang truy cập màn hình `/` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HOME-TRIA-01.
- **THEN** Hệ thống xử lý thành công qua `PlatformPublicConfigController`, cập nhật chính xác dữ liệu `PlatformSetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HOME-TRIA-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HOME-TRIA-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HOME-TRIA-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Trang chủ Nền tảng SaaS & Kích hoạt Dùng thử 3 ngày** (`/`): Khi người dùng chưa đăng nhập bấm "Dùng thử miễn phí 3 ngày", hệ thống điều hướng sang `/auth/register?trial=1` và giữ ngữ cảnh đăng ký dùng thử.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HOME-TRIA-02)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest / StoreOwner) đang truy cập màn hình `/` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HOME-TRIA-02.
- **THEN** Hệ thống xử lý thành công qua `PlatformPublicConfigController`, cập nhật chính xác dữ liệu `PlatformSetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HOME-TRIA-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HOME-TRIA-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HOME-TRIA-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Trang chủ Nền tảng SaaS & Kích hoạt Dùng thử 3 ngày** (`/`): Khi chủ cửa hàng đủ điều kiện (`trialStatus.state === "ELIGIBLE"`) bấm kích hoạt, hệ thống gọi `POST /api/tenant/subscriptions/trial` cấp quyền dùng thử 3 ngày và chuyển vào `/store-owner/dashboard`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HOME-TRIA-03)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest / StoreOwner) đang truy cập màn hình `/` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HOME-TRIA-03.
- **THEN** Hệ thống xử lý thành công qua `PlatformPublicConfigController`, cập nhật chính xác dữ liệu `PlatformSetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HOME-TRIA-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HOME-TRIA-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HOME-TRIA-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Trang chủ Nền tảng SaaS & Kích hoạt Dùng thử 3 ngày** (`/`): Mỗi Tenant chỉ được kích hoạt gói dùng thử miễn phí tối đa 01 lần duy nhất trong suốt vòng đời gian hàng.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HOME-TRIA-04)
- **GIVEN** Người dùng có vai trò hợp lệ (Guest / StoreOwner) đang truy cập màn hình `/` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HOME-TRIA-04.
- **THEN** Hệ thống xử lý thành công qua `PlatformPublicConfigController`, cập nhật chính xác dữ liệu `PlatformSetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HOME-TRIA-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HOME-TRIA-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-HOME-TRIA-01`: Tải cấu hình công khai (hotline hỗ trợ, thông tin gói cước niêm yết, trạng thái bảo trì) từ `GET /api/platform...
- [x] `REQ-HOME-TRIA-02`: Khi người dùng chưa đăng nhập bấm "Dùng thử miễn phí 3 ngày", hệ thống điều hướng sang `/auth/register?trial=1...
- [x] `REQ-HOME-TRIA-03`: Khi chủ cửa hàng đủ điều kiện (`trialStatus.state === "ELIGIBLE"`) bấm kích hoạt, hệ thống gọi `POST /api/tena...
- [x] `REQ-HOME-TRIA-04`: Mỗi Tenant chỉ được kích hoạt gói dùng thử miễn phí tối đa 01 lần duy nhất trong suốt vòng đời gian hàng.
