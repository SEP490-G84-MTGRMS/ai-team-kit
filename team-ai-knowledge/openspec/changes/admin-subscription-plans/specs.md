# Specs: Màn hình Quản lý Gói cước SaaS & Hạn ngạch Dịch vụ (`admin-subscription-plans`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/admin/plans` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/plans/kpis` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/plans/{id}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/admin/plans` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/admin/plans/{id}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PATCH` | `/api/admin/plans/{id}/status` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `DELETE` | `/api/admin/plans/{id}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-ADMI-SUBS-PLAN-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Gói cước SaaS & Hạn ngạch Dịch vụ** (`/admin/subscriptions`, `/admin/subscriptions/create`, `/admin/subscriptions/:id`, `/admin/subscriptions/:id/edit`): Quản lý danh sách và KPIs gói cước qua `GET /api/admin/plans` và `GET /api/admin/plans/kpis`; kiểm tra tên gói 2–100 ký tự, đơn giá và hạn ngạch không âm qua FluentValidation.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-SUBS-PLAN-01)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/subscriptions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-SUBS-PLAN-01.
- **THEN** Hệ thống xử lý thành công qua `AdminPlansController`, cập nhật chính xác dữ liệu `SubscriptionPlan` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-SUBS-PLAN-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-SUBS-PLAN-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/subscriptions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-SUBS-PLAN-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Gói cước SaaS & Hạn ngạch Dịch vụ** (`/admin/subscriptions`, `/admin/subscriptions/create`, `/admin/subscriptions/:id`, `/admin/subscriptions/:id/edit`): Hỗ trợ cấu hình chi tiết hạn ngạch số chi nhánh tối đa, số nhân viên tối đa, tính năng mở khóa (HR/Payroll, Multi-branch) trên `SubscriptionPlanCreatePage` và `SubscriptionPlanDetailPage`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-SUBS-PLAN-02)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/subscriptions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-SUBS-PLAN-02.
- **THEN** Hệ thống xử lý thành công qua `AdminPlansController`, cập nhật chính xác dữ liệu `SubscriptionPlan` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-SUBS-PLAN-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-SUBS-PLAN-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/subscriptions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-SUBS-PLAN-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Gói cước SaaS & Hạn ngạch Dịch vụ** (`/admin/subscriptions`, `/admin/subscriptions/create`, `/admin/subscriptions/:id`, `/admin/subscriptions/:id/edit`): Cho phép bật/tắt trạng thái mở bán gói (`PATCH /api/admin/plans/{id}/status`); gói ngừng mở bán không hiển thị cho khách mới nhưng không làm gián đoạn khách đang còn hạn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-SUBS-PLAN-03)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/subscriptions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-SUBS-PLAN-03.
- **THEN** Hệ thống xử lý thành công qua `AdminPlansController`, cập nhật chính xác dữ liệu `SubscriptionPlan` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-SUBS-PLAN-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-SUBS-PLAN-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/subscriptions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-SUBS-PLAN-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Gói cước SaaS & Hạn ngạch Dịch vụ** (`/admin/subscriptions`, `/admin/subscriptions/create`, `/admin/subscriptions/:id`, `/admin/subscriptions/:id/edit`): Chặn xóa vật lý gói cước (`DELETE /api/admin/plans/{id}`) nếu đang có bất kỳ Tenant nào đăng ký sử dụng gói đó.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-SUBS-PLAN-04)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/subscriptions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-SUBS-PLAN-04.
- **THEN** Hệ thống xử lý thành công qua `AdminPlansController`, cập nhật chính xác dữ liệu `SubscriptionPlan` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-SUBS-PLAN-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-SUBS-PLAN-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/subscriptions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-ADMI-SUBS-PLAN-01`: Quản lý danh sách và KPIs gói cước qua `GET /api/admin/plans` và `GET /api/admin/plans/kpis`; kiểm tra tên gói...
- [x] `REQ-ADMI-SUBS-PLAN-02`: Hỗ trợ cấu hình chi tiết hạn ngạch số chi nhánh tối đa, số nhân viên tối đa, tính năng mở khóa (HR/Payroll, Mu...
- [x] `REQ-ADMI-SUBS-PLAN-03`: Cho phép bật/tắt trạng thái mở bán gói (`PATCH /api/admin/plans/{id}/status`); gói ngừng mở bán không hiển thị...
- [x] `REQ-ADMI-SUBS-PLAN-04`: Chặn xóa vật lý gói cước (`DELETE /api/admin/plans/{id}`) nếu đang có bất kỳ Tenant nào đăng ký sử dụng gói đó...
