# Specs: Màn hình Nhật ký Kiểm toán Hệ thống (Platform Audit Logs) (`admin-audit-logs`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/admin/audit-logs` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-ADMI-AUDI-LOGS-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Nhật ký Kiểm toán Hệ thống (Platform Audit Logs)** (`/admin/audit-logs`, `/admin/system-logs`): Truy vấn phân trang danh sách nhật ký từ `GET /api/admin/audit-logs` theo từ khóa (người thực hiện, hành động, mã đối tượng, địa chỉ IP), loại hành động và khoảng thời gian.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-AUDI-LOGS-01)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/audit-logs` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-AUDI-LOGS-01.
- **THEN** Hệ thống xử lý thành công qua `AdminAuditLogsController`, cập nhật chính xác dữ liệu `AuditLog` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-AUDI-LOGS-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-AUDI-LOGS-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/audit-logs` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-AUDI-LOGS-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Nhật ký Kiểm toán Hệ thống (Platform Audit Logs)** (`/admin/audit-logs`, `/admin/system-logs`): Hiển thị thời gian quy đổi chuẩn múi giờ `Asia/Ho_Chi_Minh` cùng vai trò người thực hiện và mã cửa hàng liên quan.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-AUDI-LOGS-02)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/audit-logs` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-AUDI-LOGS-02.
- **THEN** Hệ thống xử lý thành công qua `AdminAuditLogsController`, cập nhật chính xác dữ liệu `AuditLog` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-AUDI-LOGS-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-AUDI-LOGS-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/audit-logs` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-AUDI-LOGS-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Nhật ký Kiểm toán Hệ thống (Platform Audit Logs)** (`/admin/audit-logs`, `/admin/system-logs`): Khi mở `AuditLogDetailModal`, hiển thị đầy đủ thông tin chi tiết bản ghi thay đổi và metadata truy vết.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-AUDI-LOGS-03)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/audit-logs` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-AUDI-LOGS-03.
- **THEN** Hệ thống xử lý thành công qua `AdminAuditLogsController`, cập nhật chính xác dữ liệu `AuditLog` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-AUDI-LOGS-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-AUDI-LOGS-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/audit-logs` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-AUDI-LOGS-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Nhật ký Kiểm toán Hệ thống (Platform Audit Logs)** (`/admin/audit-logs`, `/admin/system-logs`): Nhật ký kiểm toán là bất biến (Append-only) — hệ thống tuyệt đối không cung cấp API sửa hoặc xóa dòng nhật ký.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-AUDI-LOGS-04)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/audit-logs` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-AUDI-LOGS-04.
- **THEN** Hệ thống xử lý thành công qua `AdminAuditLogsController`, cập nhật chính xác dữ liệu `AuditLog` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-AUDI-LOGS-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-AUDI-LOGS-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/audit-logs` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-ADMI-AUDI-LOGS-01`: Truy vấn phân trang danh sách nhật ký từ `GET /api/admin/audit-logs` theo từ khóa (người thực hiện, hành động,...
- [x] `REQ-ADMI-AUDI-LOGS-02`: Hiển thị thời gian quy đổi chuẩn múi giờ `Asia/Ho_Chi_Minh` cùng vai trò người thực hiện và mã cửa hàng liên q...
- [x] `REQ-ADMI-AUDI-LOGS-03`: Khi mở `AuditLogDetailModal`, hiển thị đầy đủ thông tin chi tiết bản ghi thay đổi và metadata truy vết.
- [x] `REQ-ADMI-AUDI-LOGS-04`: Nhật ký kiểm toán là bất biến (Append-only) — hệ thống tuyệt đối không cung cấp API sửa hoặc xóa dòng nhật ký.
