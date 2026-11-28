# Specs: Màn hình Quản lý & Phê duyệt 4 Loại Đơn từ Ca làm việc Nhân viên (`hr-approval-requests`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `POST` | `/api/schedule-approval-requests` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/schedule-approval-requests/upload-evidences` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/schedule-approval-requests` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/schedule-approval-requests/pending` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/schedule-approval-requests/{requestId:guid}/peer-confirm` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/schedule-approval-requests/{requestId:guid}/review` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/schedule-approval-requests/{requestId:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `DELETE` | `/api/schedule-approval-requests/{requestId:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-HR-APPR-REQU-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý & Phê duyệt 4 Loại Đơn từ Ca làm việc Nhân viên** (`/store-owner/employees/approval-requests`): Hỗ trợ tạo đơn kèm tải ảnh minh chứng (`POST /api/schedule-approval-requests`, `POST .../upload-evidences`) và lọc danh sách đơn chờ duyệt qua `GET .../pending`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-APPR-REQU-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/approval-requests` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-APPR-REQU-01.
- **THEN** Hệ thống xử lý thành công qua `ScheduleApprovalRequestsController`, cập nhật chính xác dữ liệu `ScheduleApprovalRequest` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-APPR-REQU-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-APPR-REQU-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/approval-requests` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-APPR-REQU-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý & Phê duyệt 4 Loại Đơn từ Ca làm việc Nhân viên** (`/store-owner/employees/approval-requests`): Đối với đơn Đổi ca (`Shift Swap`), bắt buộc nhân viên được đề nghị đổi ca xác nhận đồng ý trước (`POST .../{requestId}/peer-confirm`) rồi mới chuyển lên Store Owner phê duyệt cuối.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-APPR-REQU-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/approval-requests` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-APPR-REQU-02.
- **THEN** Hệ thống xử lý thành công qua `ScheduleApprovalRequestsController`, cập nhật chính xác dữ liệu `ScheduleApprovalRequest` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-APPR-REQU-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-APPR-REQU-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/approval-requests` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-APPR-REQU-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý & Phê duyệt 4 Loại Đơn từ Ca làm việc Nhân viên** (`/store-owner/employees/approval-requests`): Khi Store Owner phê duyệt (`POST .../{requestId}/review`): kiểm tra số phút OT phê duyệt nằm trong khoảng `0–480` phút; nếu từ chối bắt buộc nhập lý do phản hồi (tối đa 500 ký tự).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-APPR-REQU-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/approval-requests` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-APPR-REQU-03.
- **THEN** Hệ thống xử lý thành công qua `ScheduleApprovalRequestsController`, cập nhật chính xác dữ liệu `ScheduleApprovalRequest` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-APPR-REQU-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-APPR-REQU-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/approval-requests` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-APPR-REQU-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý & Phê duyệt 4 Loại Đơn từ Ca làm việc Nhân viên** (`/store-owner/employees/approval-requests`): Ngay sau khi duyệt, hệ thống tự động cập nhật trạng thái ca làm/số giờ công tương ứng trong `EmployeeSchedule` và bắn thông báo thời gian thực cho nhân viên.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-APPR-REQU-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/approval-requests` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-APPR-REQU-04.
- **THEN** Hệ thống xử lý thành công qua `ScheduleApprovalRequestsController`, cập nhật chính xác dữ liệu `ScheduleApprovalRequest` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-APPR-REQU-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-APPR-REQU-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/approval-requests` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-HR-APPR-REQU-01`: Hỗ trợ tạo đơn kèm tải ảnh minh chứng (`POST /api/schedule-approval-requests`, `POST .../upload-evidences`) và...
- [x] `REQ-HR-APPR-REQU-02`: Đối với đơn Đổi ca (`Shift Swap`), bắt buộc nhân viên được đề nghị đổi ca xác nhận đồng ý trước (`POST .../{re...
- [x] `REQ-HR-APPR-REQU-03`: Khi Store Owner phê duyệt (`POST .../{requestId}/review`): kiểm tra số phút OT phê duyệt nằm trong khoảng `0–4...
- [x] `REQ-HR-APPR-REQU-04`: Ngay sau khi duyệt, hệ thống tự động cập nhật trạng thái ca làm/số giờ công tương ứng trong `EmployeeSchedule`...
