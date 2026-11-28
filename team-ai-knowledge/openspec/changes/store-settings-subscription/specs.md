# Specs: Màn hình Thiết lập Gian hàng, Gói cước SaaS, Add-on Nhân sự & Lưu trữ (`store-settings-subscription`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/tenant/subscriptions/staff-addon/quote` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tenant/subscriptions/staff-addon/purchase` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tenant/store-info` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/tenant/store-info` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tenant/pricing-plans` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tenant/subscriptions/pro-quote` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tenant/subscriptions/purchase` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/tenant/subscriptions/trial` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tenant/subscriptions/trial-status` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/tenant/subscriptions/access-status` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-STOR-SETT-SUBS-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Thiết lập Gian hàng, Gói cước SaaS, Add-on Nhân sự & Lưu trữ** (`/store-owner/subscriptions`, `/store-owner/settings`): Cập nhật thông tin gian hàng qua `GET/PUT /api/tenant/store-info`; hiển thị rõ trạng thái gói hiện tại, số ngày còn lại và banner dùng thử (`TrialStatusBanner`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-SETT-SUBS-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/subscriptions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-SETT-SUBS-01.
- **THEN** Hệ thống xử lý thành công qua `TenantStoreController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-SETT-SUBS-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-SETT-SUBS-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/subscriptions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-SETT-SUBS-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Thiết lập Gian hàng, Gói cước SaaS, Add-on Nhân sự & Lưu trữ** (`/store-owner/subscriptions`, `/store-owner/settings`): Tính giá nâng cấp Pro bù trừ theo ngày còn lại (`POST /api/tenant/subscriptions/pro-quote`) và thanh toán kích hoạt tức thời qua `POST /api/tenant/subscriptions/purchase`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-SETT-SUBS-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/subscriptions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-SETT-SUBS-02.
- **THEN** Hệ thống xử lý thành công qua `TenantStoreController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-SETT-SUBS-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-SETT-SUBS-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/subscriptions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-SETT-SUBS-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Thiết lập Gian hàng, Gói cước SaaS, Add-on Nhân sự & Lưu trữ** (`/store-owner/subscriptions`, `/store-owner/settings`): Hỗ trợ báo giá và mua thêm hạn mức nhân viên (`GET /api/tenant/subscriptions/staff-addon/quote`, `POST .../purchase`) cũng như dung lượng lưu trữ (`TenantStorageController`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-SETT-SUBS-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/subscriptions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-SETT-SUBS-03.
- **THEN** Hệ thống xử lý thành công qua `TenantStoreController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-SETT-SUBS-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-SETT-SUBS-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/subscriptions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOR-SETT-SUBS-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Thiết lập Gian hàng, Gói cước SaaS, Add-on Nhân sự & Lưu trữ** (`/store-owner/subscriptions`, `/store-owner/settings`): Lưu đầy đủ lịch sử hóa đơn mua gói/add-on tại tab `OrderHistoryTab` (`GET /api/tenant/subscriptions/history`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOR-SETT-SUBS-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/subscriptions` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOR-SETT-SUBS-04.
- **THEN** Hệ thống xử lý thành công qua `TenantStoreController`, cập nhật chính xác dữ liệu `Tenant` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOR-SETT-SUBS-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOR-SETT-SUBS-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/subscriptions` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-STOR-SETT-SUBS-01`: Cập nhật thông tin gian hàng qua `GET/PUT /api/tenant/store-info`; hiển thị rõ trạng thái gói hiện tại, số ngà...
- [x] `REQ-STOR-SETT-SUBS-02`: Tính giá nâng cấp Pro bù trừ theo ngày còn lại (`POST /api/tenant/subscriptions/pro-quote`) và thanh toán kích...
- [x] `REQ-STOR-SETT-SUBS-03`: Hỗ trợ báo giá và mua thêm hạn mức nhân viên (`GET /api/tenant/subscriptions/staff-addon/quote`, `POST .../pur...
- [x] `REQ-STOR-SETT-SUBS-04`: Lưu đầy đủ lịch sử hóa đơn mua gói/add-on tại tab `OrderHistoryTab` (`GET /api/tenant/subscriptions/history`).
