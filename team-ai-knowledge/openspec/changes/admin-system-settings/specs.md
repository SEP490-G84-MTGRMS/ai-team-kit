# Specs: Màn hình Cấu hình Hệ thống Nền tảng & Tài khoản Thụ hưởng SaaS (`admin-system-settings`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/admin/settings` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/admin/settings` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/platform/public-config` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-ADMI-SYST-SETT-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Hệ thống Nền tảng & Tài khoản Thụ hưởng SaaS** (`/admin/settings`): Tải cấu hình hiện hành từ `GET /api/admin/settings` và lưu cập nhật qua `PUT /api/admin/settings` có kiểm tra quyền `MasterAdmin`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-SYST-SETT-01)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/settings` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-SYST-SETT-01.
- **THEN** Hệ thống xử lý thành công qua `AdminSettingsController`, cập nhật chính xác dữ liệu `PlatformSetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-SYST-SETT-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-SYST-SETT-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/settings` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-SYST-SETT-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Hệ thống Nền tảng & Tài khoản Thụ hưởng SaaS** (`/admin/settings`): Ràng buộc tên ngân hàng/chủ tài khoản tối thiểu 2 ký tự, hotline từ 8–15 chữ số và đơn giá tiền tệ tối đa `decimal(18,2)`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-SYST-SETT-02)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/settings` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-SYST-SETT-02.
- **THEN** Hệ thống xử lý thành công qua `AdminSettingsController`, cập nhật chính xác dữ liệu `PlatformSetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-SYST-SETT-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-SYST-SETT-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/settings` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-SYST-SETT-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Hệ thống Nền tảng & Tài khoản Thụ hưởng SaaS** (`/admin/settings`): Cảnh báo trực quan trạng thái "Có thay đổi chưa được lưu" trên `PlatformSettingsHeader` và `SettingsSummarySidebar`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-SYST-SETT-03)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/settings` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-SYST-SETT-03.
- **THEN** Hệ thống xử lý thành công qua `AdminSettingsController`, cập nhật chính xác dữ liệu `PlatformSetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-SYST-SETT-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-SYST-SETT-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/settings` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-SYST-SETT-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Hệ thống Nền tảng & Tài khoản Thụ hưởng SaaS** (`/admin/settings`): Các thông tin công khai sau khi lưu được đồng bộ tức thời ra `GET /api/platform/public-config` cho Trang chủ và Cổng thanh toán Ví gian hàng.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-SYST-SETT-04)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/settings` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-SYST-SETT-04.
- **THEN** Hệ thống xử lý thành công qua `AdminSettingsController`, cập nhật chính xác dữ liệu `PlatformSetting` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-SYST-SETT-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-SYST-SETT-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/settings` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-ADMI-SYST-SETT-01`: Tải cấu hình hiện hành từ `GET /api/admin/settings` và lưu cập nhật qua `PUT /api/admin/settings` có kiểm tra ...
- [x] `REQ-ADMI-SYST-SETT-02`: Ràng buộc tên ngân hàng/chủ tài khoản tối thiểu 2 ký tự, hotline từ 8–15 chữ số và đơn giá tiền tệ tối đa `dec...
- [x] `REQ-ADMI-SYST-SETT-03`: Cảnh báo trực quan trạng thái "Có thay đổi chưa được lưu" trên `PlatformSettingsHeader` và `SettingsSummarySid...
- [x] `REQ-ADMI-SYST-SETT-04`: Các thông tin công khai sau khi lưu được đồng bộ tức thời ra `GET /api/platform/public-config` cho Trang chủ v...
