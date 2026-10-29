# Specs: master-admin-backend-crud

## API / Contract

| Method | Path | Request Body | Response Body | HTTP Status / Lỗi |
|---|---|---|---|---|
| `GET` | `/api/admin/plans` | Không | `ApiResponse<List<PlanSummaryResponse>>` | 200 OK, 401 Unauthorized, 403 Forbidden |
| `GET` | `/api/admin/plans/{id}` | Không | `ApiResponse<PlanDetailResponse>` | 200 OK, 404 Not Found, 401 Unauthorized |
| `POST` | `/api/admin/plans` | `CreatePlanRequest` | `ApiResponse<PlanDetailResponse>` | 201 Created, 400 Bad Request, 409 Conflict |
| `PUT` | `/api/admin/plans/{id}` | `UpdatePlanRequest` | `ApiResponse<PlanDetailResponse>` | 200 OK, 400 Bad Request, 404 Not Found |
| `PATCH` | `/api/admin/plans/{id}/status` | `UpdatePlanStatusRequest` | `ApiResponse<bool>` | 200 OK, 400 Bad Request, 404 Not Found |
| `GET` | `/api/admin/tenants` | Query params (`TenantFilterRequest`) | `ApiResponse<PagedResult<TenantSummaryResponse>>` | 200 OK, 401 Unauthorized, 403 Forbidden |
| `GET` | `/api/admin/tenants/{id}` | Không | `ApiResponse<TenantDetailResponse>` | 200 OK, 404 Not Found |
| `PUT` | `/api/admin/tenants/{id}` | `UpdateTenantRequest` | `ApiResponse<TenantDetailResponse>` | 200 OK, 400 Bad Request, 404 Not Found |
| `POST` | `/api/admin/tenants/{id}/lock` | `LockTenantRequest` | `ApiResponse<bool>` | 200 OK, 400 Bad Request, 404 Not Found |
| `POST` | `/api/admin/tenants/{id}/unlock` | Không | `ApiResponse<bool>` | 200 OK, 404 Not Found |
| `POST` | `/api/admin/tenants/{id}/extend-grace` | `ExtendGraceRequest` | `ApiResponse<DateTime>` | 200 OK, 400 Bad Request, 404 Not Found |
| `GET` | `/api/admin/dashboard/kpis` | Không | `ApiResponse<List<KpiMetricResponse>>` | 200 OK, 401 Unauthorized |
| `GET` | `/api/admin/dashboard/plan-distribution` | Không | `ApiResponse<List<PlanDistributionResponse>>` | 200 OK, 401 Unauthorized |
| `GET` | `/api/admin/dashboard/urgent-alerts` | Không | `ApiResponse<List<UrgentAlertResponse>>` | 200 OK, 401 Unauthorized |

---

## ADDED Requirements

### Requirement: REQ-ADMIN-BE-01: Quản lý Gói cước SaaS (Subscription Plans)
Hệ thống MUST cung cấp các API cho phép Master Admin xem danh sách, chi tiết, tạo mới, cập nhật và bật/tắt kích hoạt các gói cước dịch vụ SaaS.

#### Scenario: Lấy danh sách gói cước kèm số lượng tenant
- **GIVEN** Master Admin đã đăng nhập và gửi token hợp lệ
- **WHEN** Gọi `GET /api/admin/plans`
- **THEN** Hệ thống trả về mã 200 OK cùng danh sách gói cước, mỗi gói có đầy đủ hạn mức (Quotas), tính năng (Features) và số khách thuê đang dùng (`ActiveTenantCount`).

#### Scenario: Tạo gói cước mới thành công
- **GIVEN** Dữ liệu `CreatePlanRequest` có mã `Code = "PLAN_PREMIUM"` chưa tồn tại trong hệ thống, giá tháng và giá năm hợp lệ (≥ 0)
- **WHEN** Gọi `POST /api/admin/plans`
- **THEN** Hệ thống lưu gói cước mới vào cơ sở dữ liệu và trả về mã 201 Created cùng thông tin gói cước vừa tạo.

#### Scenario: Từ chối tạo gói cước khi trùng mã Code (Edge Case)
- **GIVEN** Mã `Code = "FREE"` đã tồn tại trong bảng `SubscriptionPlans`
- **WHEN** Gọi `POST /api/admin/plans` với mã `Code = "FREE"`
- **THEN** Hệ thống MUST từ chối lưu và trả về mã HTTP 409 Conflict với thông báo "Mã gói cước đã tồn tại trong hệ thống".

#### Scenario: Bật/Tắt trạng thái kích hoạt của gói
- **GIVEN** Gói cước đang ở trạng thái `IsActive = true`
- **WHEN** Gọi `PATCH /api/admin/plans/{id}/status` với `IsActive = false`
- **THEN** Hệ thống cập nhật trạng thái gói thành Inactive và trả về mã 200 OK.

---

### Requirement: REQ-ADMIN-BE-02: Quản lý Vòng đời Khách thuê SaaS (Tenants)
Hệ thống MUST cung cấp các API để Master Admin tra cứu, lọc, xem chi tiết, can thiệp khóa/mở khóa chuỗi cửa hàng và gia hạn thời gian ân hạn thanh toán.

#### Scenario: Lọc danh sách khách thuê theo trạng thái
- **GIVEN** Trong hệ thống có các khách thuê ở trạng thái Active, Expiring, Grace, và Locked
- **WHEN** Gọi `GET /api/admin/tenants?status=locked&page=1&pageSize=10`
- **THEN** Hệ thống MUST chỉ trả về các khách thuê đang bị khóa (`LockType != null`), phân trang chính xác và tính toán đúng số ngày quá hạn.

#### Scenario: Khóa chuỗi cửa hàng (Soft Lock hoặc Hard Lock)
- **GIVEN** Khách thuê có Id hợp lệ và đang hoạt động bình thường
- **WHEN** Gọi `POST /api/admin/tenants/{id}/lock` với `LockType = "soft"` và `Reason = "Chậm thanh toán cước phí tháng 10"`
- **THEN** Hệ thống MUST cập nhật `Status = "LOCKED"`, `LockType = "soft"`, `LockReason`, `LockedAt = DateTime.UtcNow`, `LockedBy = AdminUsername` và trả về 200 OK.

#### Scenario: Mở khóa chuỗi cửa hàng
- **GIVEN** Khách thuê đang trong trạng thái bị khóa
- **WHEN** Gọi `POST /api/admin/tenants/{id}/unlock`
- **THEN** Hệ thống MUST xóa bỏ các trường `LockType`, `LockReason`, `LockedAt`, `LockedBy` và đưa `Status` về trạng thái hoạt động bình thường.

#### Scenario: Gia hạn ngày ân hạn (Extend Grace Period)
- **GIVEN** Khách thuê sắp hoặc đã hết hạn gói cước
- **WHEN** Gọi `POST /api/admin/tenants/{id}/extend-grace` với `AdditionalDays = 7`
- **THEN** Hệ thống MUST cộng thêm 7 ngày vào `GracePeriodExpiresAt`, cập nhật trạng thái `Status = "GRACE"` và trả về mốc thời gian hết hạn ân hạn mới.

---

### Requirement: REQ-ADMIN-BE-03: Thống kê Master Dashboard & Báo cáo Vận hành
Hệ thống MUST cung cấp các chỉ số đo lường tài chính (MRR, ARR) và chỉ số hoạt động tổng thể theo thời gian thực từ cơ sở dữ liệu.

#### Scenario: Lấy các thẻ chỉ số KPI
- **GIVEN** CSDL có dữ liệu khách thuê, chi nhánh và gói cước
- **WHEN** Gọi `GET /api/admin/dashboard/kpis`
- **THEN** Hệ thống trả về 4 thẻ KPI: Doanh thu định kỳ hàng tháng (MRR), Số khách thuê hoạt động (Active Tenants), Tổng chi nhánh toàn hệ thống (Total Branches), và Số chuỗi cần lưu ý (Expiring/Grace).

#### Scenario: Lấy danh sách cảnh báo khẩn cấp (Urgent Alerts)
- **GIVEN** Có các chuỗi khách thuê sắp hết hạn trong vòng 7 ngày hoặc đang bị khóa
- **WHEN** Gọi `GET /api/admin/dashboard/urgent-alerts`
- **THEN** Hệ thống trả về danh sách sắp xếp ưu tiên theo mức độ khẩn cấp (Locked -> Grace -> Expiring).

---

### Requirement: REQ-ADMIN-BE-04: Phân quyền & Bảo mật Endpoint Master Admin
Hệ thống MUST ngăn chặn mọi truy cập trái phép hoặc không có quyền Admin vào các API quản trị.

#### Scenario: Từ chối truy cập khi không có JWT Token (Edge Case)
- **WHEN** Client gọi bất kỳ endpoint `/api/admin/*` mà không đính kèm header `Authorization: Bearer <token>`
- **THEN** Hệ thống MUST trả về mã HTTP 401 Unauthorized.

#### Scenario: Từ chối truy cập khi Token không có Role ADMIN (Edge Case)
- **GIVEN** Token JWT hợp lệ nhưng Claim `role` là `STAFF` hoặc `CASHIER`
- **WHEN** Client gọi endpoint `/api/admin/*`
- **THEN** Hệ thống MUST trả về mã HTTP 403 Forbidden.

---

## Acceptance checklist
- [ ] REQ-ADMIN-BE-01: API lấy danh sách gói cước trả về đầy đủ Quotas, Features và số Active Tenants.
- [ ] REQ-ADMIN-BE-01: API tạo mới và cập nhật gói cước validate dữ liệu chặt chẽ, kiểm tra trùng mã.
- [ ] REQ-ADMIN-BE-01: API bật/tắt kích hoạt gói cước hoạt động chính xác.
- [ ] REQ-ADMIN-BE-02: API danh sách khách thuê hỗ trợ lọc theo trạng thái (`active`, `expiring`, `grace`, `locked`) và phân trang.
- [ ] REQ-ADMIN-BE-02: API khóa Soft/Hard lock lưu trữ đầy đủ lý do và người khóa.
- [ ] REQ-ADMIN-BE-02: API mở khóa và gia hạn ân hạn (Extend Grace) cập nhật chính xác ngày tháng trong CSDL.
- [ ] REQ-ADMIN-BE-03: API KPI, phân bổ gói cước và cảnh báo khẩn cấp tính toán chính xác từ CSDL PostgreSQL.
- [ ] REQ-ADMIN-BE-04: 100% endpoint `/api/admin/*` được bảo vệ bằng `[Authorize(Roles = "ADMIN")]`.
