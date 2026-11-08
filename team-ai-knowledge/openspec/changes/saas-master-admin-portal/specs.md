# Specs Delta: SaaS Master Admin Capability

## ADDED REQUIREMENTS

### REQ-ADMIN-01: Admin Layout & Navigation
Hệ thống cung cấp `AdminLayout` với:
- Sidebar trái 260px có Logo MT-GRMS, các menu Tổng quan (`/admin/dashboard`), Khách hàng thuê (`/admin/tenants`), Nút Về Trang Chủ (`/`).
- Header trên 70px với tìm kiếm toàn cục, nút thông báo, Profile Super Admin.

### REQ-ADMIN-02: Master Admin Dashboard
Trang `/admin/dashboard` hiển thị:
- 4 thẻ KPI số liệu (Tổng khách hàng: 128, Đang hoạt động: 114, Sắp hết hạn/Khóa: 14, Doanh thu định kỳ: 148.5M đ).
- Thanh tiến trình phân bổ tỷ trọng 3 gói cước (Basic, Advanced, Enterprise).
- Giám sát trạng thái 4 tác vụ tự động (`JOB-01` đến `JOB-04`).
- Bảng danh sách cảnh báo khẩn cấp các chuỗi cửa hàng còn $\le 7$ ngày cần can thiệp.

### REQ-ADMIN-03: Tenant Management
Trang `/admin/tenants` cung cấp:
- Hàng tab lọc theo trạng thái: Tất cả (128), Đang hoạt động (114), Sắp hết hạn $\le 30d$ (9), Đang ân hạn (3), Chờ kích hoạt (2), Bị khóa (5).
- Tìm kiếm theo từ khóa (tên chuỗi, subdomain, email, MST) và lọc theo gói cước.
- Bảng dữ liệu Tenant với các cột: Checkbox, Mã Subdomain, Tên Chuỗi, Chủ Sở Hữu, Gói Cước, Chi Nhánh, Nhân Sự, Hạn Hợp Đồng, Trạng Thái, Hành Động.
- Hộp thoại modal xem chi tiết quota và 6 feature flags của tenant.
- Hộp thoại modal gia hạn ân hạn và modal áp dụng lệnh khóa.

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: master-admin-backend-crud -->
# Specs: master-admin-backend-crud

## API / Contract

| Method | Path | Request Body | Response Body | HTTP Status / Lỗi |
|---|---|---|---|---|
| `GET` | `/api/admin/plans` | Query params (`keyword`, `status`) | `ApiResponse<List<PlanSummaryResponse>>` | 200 OK, 401 Unauthorized, 403 Forbidden |
| `GET` | `/api/admin/plans/kpis` | Không | `ApiResponse<PlanKpiBannerResponse>` | 200 OK, 401 Unauthorized |
| `GET` | `/api/admin/plans/{id}` | Không | `ApiResponse<PlanDetailResponse>` | 200 OK, 404 Not Found, 401 Unauthorized |
| `POST` | `/api/admin/plans` | `CreatePlanRequest` | `ApiResponse<PlanDetailResponse>` | 201 Created, 400 Bad Request, 409 Conflict |
| `PUT` | `/api/admin/plans/{id}` | `UpdatePlanRequest` | `ApiResponse<PlanDetailResponse>` | 200 OK, 400 Bad Request, 404 Not Found |
| `PATCH` | `/api/admin/plans/{id}/status` | `UpdatePlanStatusRequest` | `ApiResponse<bool>` | 200 OK, 400 Bad Request, 404 Not Found |
| `DELETE` | `/api/admin/plans/{id}` | Không | `ApiResponse<bool>` | 200 OK, 400 Bad Request, 404 Not Found |
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
Hệ thống MUST cung cấp trọn vẹn các API CRUD cho phép Master Admin xem danh sách, thẻ chỉ số KPI, xem chi tiết, tạo mới, chỉnh sửa, đổi trạng thái và xóa gói cước.

#### Scenario: Lấy danh sách gói cước kèm số lượng tenant
- **GIVEN** Master Admin đã đăng nhập với vai trò ADMIN
- **WHEN** Gọi `GET /api/admin/plans?status=Active`
- **THEN** Hệ thống trả về danh sách các gói cước đang kích hoạt, mỗi gói có đầy đủ hạn mức Quotas, tính năng Features và số lượng tenant đang dùng (`ActiveTenantCount`).

#### Scenario: Lấy 4 chỉ số KPI trên màn hình gói cước
- **WHEN** Gọi `GET /api/admin/plans/kpis`
- **THEN** Hệ thống trả về: `TotalPlans` (tổng gói), `ActivePlans` (gói đang bật), `TotalActiveTenants` (tổng cửa hàng đang thuê), `EstimatedMrr` (doanh thu hàng tháng ước tính).

#### Scenario: Tạo gói cước mới thành công
- **GIVEN** Dữ liệu `CreatePlanRequest` có mã `Code = "PLAN_SUPER_MART"` theo đúng regex `^[A-Z0-9_]+$` chưa từng tồn tại trong hệ thống, giá tháng và giá năm không âm
- **WHEN** Gọi `POST /api/admin/plans`
- **THEN** Hệ thống lưu gói cước mới vào bảng `SubscriptionPlans`, đóng gói Quotas và Features vào `EnabledModulesJson` và trả về mã 201 Created.

#### Scenario: Từ chối tạo gói cước khi trùng mã Code (Edge Case)
- **GIVEN** Mã `Code = "PLAN_STARTER"` đã tồn tại trong CSDL
- **WHEN** Gọi `POST /api/admin/plans` với mã `Code = "PLAN_STARTER"`
- **THEN** Hệ thống MUST từ chối và trả về mã HTTP 409 Conflict với thông báo "Mã gói cước đã tồn tại trên hệ thống".

#### Scenario: Từ chối xóa gói cước khi đang có cửa hàng sử dụng (Edge Case)
- **GIVEN** Gói cước đang có `ActiveTenantCount = 42` (> 0)
- **WHEN** Gọi `DELETE /api/admin/plans/{id}`
- **THEN** Hệ thống MUST chặn hành động xóa và trả về HTTP 400 Bad Request với thông báo: "Không thể xóa gói dịch vụ đang có 42 cửa hàng sử dụng".

#### Scenario: Xóa thành công gói cước không có cửa hàng sử dụng
- **GIVEN** Gói cước có `ActiveTenantCount = 0`
- **WHEN** Gọi `DELETE /api/admin/plans/{id}`
- **THEN** Hệ thống thực hiện Soft Delete (`IsDeleted = true`) và trả về HTTP 200 OK.

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
- [ ] REQ-ADMIN-BE-01: API lấy danh sách gói cước (`GET /api/admin/plans`) lọc theo keyword và status.
- [ ] REQ-ADMIN-BE-01: API thống kê KPI gói cước (`GET /api/admin/plans/kpis`) tính toán đúng TotalPlans, ActivePlans, ActiveTenants, MRR.
- [ ] REQ-ADMIN-BE-01: API tạo mới (`POST /api/admin/plans`) kiểm tra định dạng regex mã gói và chặn trùng lặp.
- [ ] REQ-ADMIN-BE-01: API cập nhật (`PUT /api/admin/plans/{id}`) và bật/tắt kích hoạt (`PATCH /api/admin/plans/{id}/status`).
- [ ] REQ-ADMIN-BE-01: API xóa gói cước (`DELETE /api/admin/plans/{id}`) chặn xóa khi đang có khách thuê sử dụng.
- [ ] REQ-ADMIN-BE-02: API danh sách khách thuê hỗ trợ lọc theo trạng thái (`active`, `expiring`, `grace`, `locked`) và phân trang.
- [ ] REQ-ADMIN-BE-02: API khóa Soft/Hard lock lưu trữ đầy đủ lý do và người khóa.
- [ ] REQ-ADMIN-BE-02: API mở khóa và gia hạn ân hạn (Extend Grace) cập nhật chính xác ngày tháng trong CSDL.
- [ ] REQ-ADMIN-BE-03: API KPI, phân bổ gói cước và cảnh báo khẩn cấp tính toán chính xác từ CSDL PostgreSQL.
- [ ] REQ-ADMIN-BE-04: 100% endpoint `/api/admin/*` được bảo vệ bằng `[Authorize(Roles = "ADMIN")]`.


<!-- Sáp nhập từ change: admin-service-plans-management -->
# Specs: admin-service-plans-management

## API / Contract
| Method | Path | Request Body | Response Body | Error Codes |
|---|---|---|---|---|
| `GET` | `/api/v1/admin/plans` | `?keyword=&status=&page=&pageSize=` | `PlanListResponse` (items, total, summary) | 401, 403 |
| `GET` | `/api/v1/admin/plans/:id` | — | `PlanDetailResponse` (plan, quotas, tenants) | 404, 401 |
| `POST` | `/api/v1/admin/plans` | `CreatePlanPayload` (code, name, prices, quotas, features) | `SubscriptionPlan` | 400 (Validation / Trùng mã), 401 |
| `PUT` | `/api/v1/admin/plans/:id` | `UpdatePlanPayload` (name, prices, quotas, features) | `SubscriptionPlan` | 400, 404, 401 |
| `PATCH` | `/api/v1/admin/plans/:id/status` | `{ status: "Active" \| "Inactive" }` | `{ success: true, status: string }` | 400, 404 |

## ADDED Requirements

### Requirement: REQ-01 Xem danh mục và KPI thống kê gói cước
Hệ thống MUST cung cấp màn hình quản trị `/admin/subscriptions` hiển thị đầy đủ 4 thẻ KPI thống kê (Tổng gói, Đang mở bán, Tạm ngưng, Tổng Tenant đang thuê) và bảng danh sách dữ liệu gói cước.

#### Scenario: Xem danh sách gói cước
- GIVEN Quản trị viên truy cập vào phân hệ `/admin/subscriptions`
- WHEN trang được tải
- THEN hệ thống hiển thị bảng danh sách các gói dịch vụ với đầy đủ các cột: Mã gói (Font Mono), Tên gói, Đơn giá/tháng, Đơn giá/năm, Hạn mức chi nhánh & nhân sự, Số Tenant đang dùng, Huy hiệu trạng thái và các nút hành động.

### Requirement: REQ-02 Lọc & Tìm kiếm gói cước
Hệ thống MUST cho phép tìm kiếm tức thời theo Mã gói hoặc Tên gói cước, đồng thời lọc theo trạng thái mở bán (`Tất cả`, `Đang mở bán`, `Tạm ngừng bán`).

#### Scenario: Tìm kiếm theo mã gói
- GIVEN Quản trị viên nhập từ khóa `PLAN_ADVANCED` vào ô tìm kiếm
- WHEN hoàn tất nhập
- THEN bảng dữ liệu chỉ hiển thị các gói cước có mã hoặc tên khớp với từ khóa tìm kiếm.

#### Scenario: Lọc theo trạng thái
- GIVEN Quản trị viên chọn `Đang mở bán (Active)` trong dropdown trạng thái
- WHEN lựa chọn thay đổi
- THEN bảng dữ liệu chỉ hiển thị các gói có trạng thái `Active`.

### Requirement: REQ-03 Khởi tạo gói dịch vụ mới (Create Plan)
Hệ thống MUST cung cấp Modal Dialog trực quan cho phép Quản trị viên thiết lập đầy đủ thông tin: Thông tin cơ bản & bảng giá, Hạn mức quota tài nguyên, và Bật/tắt 6 module tính năng bán lẻ.

#### Scenario: Tạo gói thành công
- GIVEN Quản trị viên nhấn nút `+ Tạo gói mới`
- WHEN Quản trị viên nhập đầy đủ thông tin hợp lệ (Mã gói không trùng, Tên gói, Đơn giá > 0, Hạn mức quota) và nhấn `Lưu & Công bố gói`
- THEN gói cước mới được bổ sung vào danh sách, hiển thị thông báo toast thành công và cập nhật thẻ KPI.

#### Scenario: Báo lỗi khi thiếu trường bắt buộc hoặc trùng mã
- GIVEN Quản trị viên nhập mã gói đã tồn tại trên hệ thống (ví dụ: `PLAN_BASIC`)
- WHEN Quản trị viên bấm lưu
- THEN hệ thống báo lỗi không cho phép lưu và yêu cầu đổi mã gói khác.

### Requirement: REQ-04 Cập nhật cấu hình gói cước (Update Plan)
Hệ thống MUST cho phép Quản trị viên chỉnh sửa thông tin, bảng giá và các hạn mức quota kỹ thuật của gói dịch vụ đã có.

#### Scenario: Chỉnh sửa gói cước
- GIVEN Quản trị viên chọn nút `Chỉnh sửa` trên một dòng gói cước
- WHEN Quản trị viên điều chỉnh lại đơn giá hoặc tăng số chi nhánh tối đa và nhấn `Lưu thay đổi`
- THEN thông tin mới được cập nhật vào bảng dữ liệu và hiển thị thông báo toast thành công.

### Requirement: REQ-05 Xem chi tiết kỹ thuật & danh sách Tenant đang thuê (Plan Detail)
Hệ thống MUST hiển thị Modal xem chi tiết gồm 2 phần: Thông số kỹ thuật/tính năng và Danh sách các Tenant đang sử dụng gói cước.

#### Scenario: Xem hồ sơ chi tiết gói cước
- GIVEN Quản trị viên nhấn nút `Chi tiết` trên dòng gói `Gói Nâng Cao`
- WHEN modal hiển thị
- THEN Quản trị viên xem được toàn bộ định ngạch quota (chi nhánh, nhân sự, dung lượng database, chu kỳ sao lưu), danh mục các tính năng được bật và danh sách các cửa hàng đang đăng ký gói này.

### Requirement: REQ-06 Chuyển đổi trạng thái mở bán (Toggle Status)
Hệ thống MUST cho phép Quản trị viên nhanh chóng chuyển trạng thái gói cước giữa `Active` (Đang mở bán) và `Inactive` (Tạm ngừng bán).

#### Scenario: Tạm ngừng bán gói cước
- GIVEN Quản trị viên nhấn nút `Ngừng bán` trên gói cước đang `Active`
- WHEN xác nhận thao tác
- THEN trạng thái gói cước chuyển sang `Inactive`, badge đổi màu và số lượng trên KPI banner được cập nhật tương ứng.

### Requirement: REQ-07 Tích hợp điều hướng & Đồng bộ phong cách CSS
Hệ thống MUST đăng ký route `/admin/subscriptions` trong `src/app/router.tsx`, hiển thị liên kết trên thanh menu điều hướng và sử dụng đồng bộ 100% các class CSS từ `src/styles/admin.css`.

## Acceptance checklist
- [ ] REQ-01: Hiển thị đầy đủ KPI banner và bảng danh sách gói cước tại `/admin/subscriptions`.
- [ ] REQ-02: Bộ lọc trạng thái và ô tìm kiếm hoạt động chính xác.
- [ ] REQ-03: Modal tạo mới gói cước nhập đủ 3 phần (Thông tin, Quota, Tính năng) và lưu thành công.
- [ ] REQ-04: Modal chỉnh sửa cập nhật đúng thông tin gói cước.
- [ ] REQ-05: Modal xem chi tiết hiển thị đầy đủ thông số kỹ thuật và danh sách tenant đang thuê.
- [ ] REQ-06: Chức năng bật/tắt trạng thái Active/Inactive hoạt động mượt mà.
- [ ] REQ-07: Route `/admin/subscriptions` tích hợp hoàn chỉnh vào router và thanh menu, đồng bộ giao diện KiotViet Style.
- [ ] `npm run build` và `npm test` vượt qua 100% không có lỗi.


<!-- Sáp nhập từ change: dynamic-subscription-plans-from-db -->
# Specs: dynamic-subscription-plans-from-db

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/v1/tenant/pricing-plans` | — | `ApiResponse<IReadOnlyList<PlanSummaryResponse>>` | 401 Unauthorized |
| `POST` | `/api/v1/tenant/subscriptions/purchase` | `PurchaseSubscriptionRequest` | `ApiResponse<PurchaseSubscriptionResponse>` | 400 Bad Request, 404 Not Found |

## MODIFIED Requirements

### Requirement: REQ-SUB-01 Dynamic Subscription Plans Loading
Hệ thống Frontend MUST tải danh sách gói cước trực tiếp từ API Backend `GET /api/v1/tenant/pricing-plans`.
Hệ thống Frontend MUST NOT sử dụng mảng tĩnh hardcode `SUBSCRIPTION_PLANS` để render danh sách thẻ cước. Số lượng thẻ cước hiển thị trên màn hình MUST khớp chính xác 1:1 với số lượng bản ghi `IsActive = true` trả về từ Backend.

#### Scenario: Hiển thị đúng số lượng gói cước khớp với Database hiện tại
- **GIVEN** Cơ sở dữ liệu Postgres `mtgrms_db` hiện có 2 gói cước đang hoạt động: `FREE` (0 đ) và `PRO` (999.000 đ).
- **WHEN** Chủ gian hàng truy cập màn hình `http://localhost:5173/store-owner/subscriptions?tab=subscriptions`.
- **THEN** Giao diện chỉ hiển thị đúng 2 thẻ cước tương ứng là "Gói Cơ Bản (Miễn Phí) 01" và "Gói Doanh Nghiệp (Toàn Năng)".
- **AND** Không xuất hiện các thẻ ảo không tồn tại trong DB như "Gói hỗ trợ 270k" hay "Gói cao cấp 490k".

#### Scenario: Tự động cập nhật khi Database thay đổi số lượng gói cước
- **GIVEN** Admin thêm mới 1 gói cước `VIP` (490.000 đ) hoặc kích hoạt thêm gói cước trong Database.
- **WHEN** Người dùng làm mới hoặc tải trang Gói dịch vụ.
- **THEN** Giao diện tự động render thành 3 thẻ cước mà không cần sửa code hay rebuild Frontend.

---

### Requirement: REQ-SUB-02 Plan Presentation & Feature Mapping
Hệ thống MUST tự động trích xuất các thuộc tính hiển thị trực quan từ đối tượng `PlanSummaryResponse`:
1. **Giá tiền**: Nếu `MonthlyPrice == 0` thì hiển thị "0 đ" (Miễn phí); nếu `> 0` thì format chuẩn tiếng Việt (vd `999.000 đ`).
2. **Quy mô chi nhánh / kho**: Trích xuất từ `Quotas.MaxBranches` (vd: "Tối đa 10 chi nhánh" hoặc "1 chi nhánh/tháng").
3. **Danh sách tính năng**: Trích xuất các tính năng `true` từ `Features` (Cảnh báo cận date FEFO, Quy đổi Thùng sang Lon, Thanh toán VietQR Napas247, Sổ nợ & CSKH Zalo, Quét barcode bán hàng, Báo cáo tài chính & P&L).
4. **Nút hành động (CTA)**:
   - Với gói đang sử dụng (trùng tên với `storeInfo.currentPlan`): Hiển thị nút "Gói hiện tại" (disabled hoặc viền xám).
   - Với gói miễn phí khác: Hiển thị nút "Dùng ngay".
   - Với gói trả phí: Hiển thị nút "Mua ngay" / "Nâng cấp".

#### Scenario: Gói cước hiển thị đầy đủ tính năng và hạn mức từ DB
- **GIVEN** Dữ liệu gói `PRO` có `MaxBranches = 10`, `MaxEmployees = 100`, và các module nghiệp vụ `true`.
- **WHEN** Thẻ cước `PRO` hiển thị.
- **THEN** Thẻ cước liệt kê rõ ràng hạn mức chi nhánh, tài khoản truy cập và các tính năng nghiệp vụ đã bật.

---

### Requirement: REQ-SUB-03 Loading & Empty State
Hệ thống MUST hiển thị hiệu ứng Skeleton Loader trong thời gian chờ API trả về dữ liệu.
Hệ thống MUST hiển thị Empty State nếu Backend trả về mảng rỗng (không có gói cước nào kích hoạt).

#### Scenario: Hiển thị Skeleton khi đang tải
- **GIVEN** Người dùng vừa chuyển sang tab Gói dịch vụ.
- **WHEN** API `GET /api/v1/tenant/pricing-plans` đang thực thi.
- **THEN** Giao diện hiển thị các khung Skeleton màu xám chuyển động nhẹ, không bị giật trang.

---

### Requirement: REQ-SUB-04 Checkout Modal Integration
Hộp thoại `SubscriptionCheckoutModal.tsx` MUST nhận đối tượng gói cước động từ thẻ cước được click, hiển thị đúng giá cước và tính năng, và gửi đúng `planCode` lên API `POST /api/v1/tenant/subscriptions/purchase`.

#### Scenario: Thanh toán thành công gói cước động
- **GIVEN** Người dùng chọn mua gói cước động `PRO` (999.000 đ/tháng).
- **WHEN** Người dùng chọn kỳ hạn 12 tháng và xác nhận thanh toán qua Ví hoặc VietQR.
- **THEN** Request gửi đi có `planCode = "PRO"`, `months = 12`, nhận về phản hồi gia hạn thành công từ Backend và cập nhật giao diện ngay lập tức.

## Acceptance Checklist
- [ ] REQ-SUB-01: Loại bỏ mảng tĩnh `SUBSCRIPTION_PLANS`, hiển thị đúng số lượng gói từ Database (2 gói hiện tại).
- [ ] REQ-SUB-02: Map động tên gói, giá cước, hạn mức quotas và danh sách features.
- [ ] REQ-SUB-03: Có trạng thái Skeleton loading và Empty state.
- [ ] REQ-SUB-04: Mua và kích hoạt gói cước động thành công qua modal.


<!-- Sáp nhập từ change: store-information-and-subscriptions -->
# Specs: store-information-and-subscriptions

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| GET | `/api/v1/tenant/store-info` | — | `{ name, subdomain, taxCode, hotline, address, city, industry }` | 401 (Chưa đăng nhập) |
| PUT | `/api/v1/tenant/store-info` | `{ name, taxCode, hotline, address, city }` | `{ success: true, message }` | 400 (Sai MST/Hotline) |
| GET | `/api/v1/tenant/subscription-status` | — | `{ currentPlan, branchCount, daysRemaining, expiresAt, walletBalance }` | 401 |
| GET | `/api/v1/tenant/pricing-plans` | — | `[ { planCode, name, priceMonthly, priceYearly, features } ]` | — |
| POST | `/api/v1/tenant/wallet/topup` | `{ amount }` | `{ transactionCode, qrImageUrl, expiresAt }` | 400 (Số tiền < 100k) |
| GET | `/api/v1/tenant/wallet/transactions` | `?page=1&pageSize=10` | `{ items: [...], totalCount }` | — |
| POST | `/api/v1/tenant/checkout/pay-by-wallet` | `{ planCode, months, extraBranches, extraWarehouses, voucherCode }` | `{ success: true, newExpiresAt, newBalance }` | 400 (Số dư ví không đủ) |
| POST | `/api/v1/tenant/checkout/create-qr-order`| `{ planCode, months, extraBranches, extraWarehouses, voucherCode }` | `{ orderCode, qrImageUrl, totalAmount }` | 400 (Dữ liệu không hợp lệ) |

---

## ADDED Requirements

### Requirement: REQ-01 Bố cục Store Settings Hub & Thanh trạng thái đếm ngược
Hệ thống MUST cung cấp giao diện quản lý gian hàng dạng Hub 2 cột theo chuẩn KiotViet: Sidebar bên trái điều hướng giữa các tab (Thông tin gian hàng, Gói dịch vụ, Lịch sử mua hàng, Ví tiền), và Thanh tóm tắt trạng thái trên cùng hiển thị gói hiện tại, số chi nhánh, ngành hàng, đồng hồ đếm ngược ngày sử dụng (cảnh báo đỏ nếu $\le 7$ ngày) và số dư ví.

#### Scenario: Hiển thị cảnh báo cận hạn khi còn 3 ngày
- **GIVEN** Tenant đang sử dụng gói dùng thử và thời hạn còn lại là 3 ngày
- **WHEN** Chủ cửa hàng truy cập tab "Gói dịch vụ"
- **THEN** Thanh trạng thái MUST hiển thị badge `3 ngày` với màu đỏ cảnh báo (`#FF3B30`), nền đỏ nhạt (`#FFF0F0`) và viền (`#FFD6D6`).

---

### Requirement: REQ-02 Bảng so sánh 3 gói cước SaaS chuẩn KiotViet
Hệ thống MUST hiển thị bảng so sánh 3 gói cước (*Gói hỗ trợ 270.000 đ*, *Gói chuyên nghiệp 330.000 đ*, *Gói cao cấp 490.000 đ*) với đầy đủ mô tả quy mô chi nhánh, hạn mức tài khoản, tính năng và nút [Mua ngay].

#### Scenario: Bấm Mua ngay trên Gói Chuyên Nghiệp
- **GIVEN** Chủ shop xem bảng giá gói dịch vụ
- **WHEN** Bấm nút [Mua ngay] trên thẻ "Gói chuyên nghiệp"
- **THEN** Hệ thống MUST mở modal Đặt mua `SubscriptionCheckoutModal` với gói mặc định được chọn là Gói Chuyên Nghiệp (330.000 đ/tháng).

---

### Requirement: REQ-03 Ví tiền chủ cửa hàng & Nạp tiền qua VietQR Pro
Hệ thống MUST cung cấp Ví tiền trả trước cho Tenant (`Tenants.WalletBalance`) và cho phép nạp tiền thông qua quét mã Napas VietQR Pro tự động khớp tiền 24/7.

#### Scenario: Nạp tiền vào ví thành công
- **GIVEN** Chủ shop chọn mệnh giá nạp `1.000.000 đ` tại modal nạp tiền
- **WHEN** Chuyển khoản thành công qua mã VietQR
- **THEN** Hệ thống MUST cộng `1.000.000 đ` vào `WalletBalance`, ghi 1 bản ghi vào `TenantWalletTransactions` với `TransactionType = 'TOPUP'`, và cập nhật số dư hiển thị tức thì.

---

### Requirement: REQ-04 Đặt mua & Thanh toán gói dịch vụ bằng Ví tiền hoặc VietQR
Hệ thống MUST cho phép chủ cửa hàng chọn kỳ hạn (6 tháng, 1 năm tặng 1 tháng, 2 năm tặng 3 tháng), mua thêm tiện ích chi nhánh/kho, và hỗ trợ thanh toán trừ tiền trực tiếp từ số dư ví hoặc quét VietQR trực tiếp.

#### Scenario: Thanh toán mua gói thành công bằng Số Dư Ví
- **GIVEN** Tổng tiền gói dịch vụ cần thanh toán là `3.960.000 đ` và số dư ví của Tenant là `5.000.000 đ`
- **WHEN** Chủ shop bấm "Thanh toán bằng Ví" và xác nhận
- **THEN** Hệ thống MUST:
  1. Trừ `3.960.000 đ` từ `Tenants.WalletBalance`.
  2. Ghi 1 bản ghi vào `TenantWalletTransactions` với `TransactionType = 'PURCHASE_PLAN'`.
  3. Cộng thêm 13 tháng vào `Tenants.SubscriptionExpiresAt`.
  4. Cập nhật `Tenants.CurrentPlan`.
  5. Cập nhật số ngày còn lại trên thanh trạng thái chuyển sang trạng thái an toàn.

#### Scenario: Số dư ví không đủ khi thanh toán
- **GIVEN** Tổng tiền thanh toán là `3.960.000 đ` nhưng số dư ví chỉ có `1.000.000 đ`
- **WHEN** Chủ shop chọn phương thức thanh toán bằng ví
- **THEN** Hệ thống MUST thông báo rõ "Số dư ví không đủ (còn thiếu 2.960.000 đ)", vô hiệu hóa nút thanh toán ví và gợi ý nạp thêm tiền hoặc chuyển sang quét mã VietQR trực tiếp.

---

## Acceptance checklist
- [ ] Giao diện Hub 2 cột chuẩn KiotViet hiển thị mượt mà trên `/store-owner/subscriptions`.
- [ ] Thanh trạng thái hiển thị đúng Gói hiện tại, Ngành hàng, Số chi nhánh, Số ngày đếm ngược và Số dư ví.
- [ ] 3 thẻ gói dịch vụ (270k, 330k, 490k) hiển thị chuẩn phông chữ Be Vietnam Pro, tiền tệ JetBrains Mono, bo tròn Full Pill.
- [ ] Modal nạp tiền ví hoạt động trơn tru với các mệnh giá nhanh và mã VietQR.
- [ ] Modal thanh toán mua gói tính toán chính xác tổng tiền khi thay đổi số tháng và tiện ích phụ.
- [ ] Hỗ trợ thanh toán trừ tiền ví thành công và cập nhật tức thì hạn dùng của shop.
- [ ] Tab Thông tin gian hàng cho phép xem và sửa thông tin cửa hàng.


<!-- Sáp nhập từ change: consolidate-database-seeders -->
# Đặc Tả Kỹ Thuật (Delta Specs) - Refactor Database Seeders

## MODIFIED Requirements

### Requirement: REQ-SEED-01 Điểm Khởi Tạo Duy Nhất (Single Entrypoint)
Hệ thống Backend MUST chỉ sử dụng duy nhất phương thức `DbInitializer.InitializeAsync(AppDbContext context)` trong `Program.cs` để khởi tạo cấu trúc CSDL và nạp dữ liệu mẫu. Tệp `DatabaseSeeder.cs` SHALL được loại bỏ hoàn toàn khỏi mã nguồn.

#### Scenario: Khởi động API trên máy chủ hoặc Cloud
- **GIVEN** Cơ sở dữ liệu PostgreSQL (mới tinh hoặc đã có dữ liệu từ trước).
- **WHEN** Ứng dụng Backend Web API khởi động và tạo scope service.
- **THEN** Chỉ duy nhất `DbInitializer.InitializeAsync(dbContext)` được thực thi, hoàn thành quá trình nạp dữ liệu mẫu thành công mà không có lỗi ngoại lệ (exception).

---

### Requirement: REQ-SEED-02 Tính Lũy Đẳng Theo Mô-đun (Idempotent Modular Seeding)
Tất cả các khối nạp dữ liệu (SaaS, Identity, Catalog, Thuế, Sổ quỹ, Khách hàng công nợ, Nhà cung cấp, Đơn hàng) MUST kiểm tra tính tồn tại (`!await context.Entities.AnyAsync(...)`) trước khi thực hiện thêm mới (`AddRangeAsync`).

#### Scenario: Khởi động lại ứng dụng lần thứ hai (Restart Idempotency)
- **GIVEN** Cơ sở dữ liệu đã được nạp dữ liệu mẫu thành công ở lần khởi động trước.
- **WHEN** Ứng dụng Backend được restart (ví dụ redeploy trên Render).
- **THEN** Không có bất kỳ lỗi vi phạm ràng buộc Unique Index hay Foreign Key nào xảy ra, và số lượng bản ghi không bị nhân bản (duplicate).

---

### Requirement: REQ-SEED-03 Bảo Toàn Tính Bất Biến Của Dữ Liệu Kiểm Thử (Demo Data Invariants)
Dữ liệu mẫu sau khi gộp MUST giữ nguyên toàn bộ các định danh và thuộc tính nghiệp vụ quan trọng phục vụ kiểm thử giao diện Frontend:
1. Gói cước SaaS: `plan_free`, `plan_pro`, `plan_support`, `plan_vip`.
2. Tài khoản quản trị và người dùng:
   - `admin` / `Admin@123` (SUPER_ADMIN)
   - `store_owner` (Mã PIN 1234 băm PBKDF2 phục vụ xác thực bảo mật)
   - `manager01` / `Manager@123` (Quản lý chi nhánh)
   - `cashier01` / `Cashier@123` (Thu ngân POS)
3. Danh mục & Sản phẩm phân loại thuế:
   - `FMCG-001`, `FMCG-002`, `FMCG-003` gắn `TaxCategory = Standard1Pct` (thuế 0.8%).
   - `ALC-001`, `ALC-002`, `TOB-001` gắn `TaxCategory = NoReduction1Pct` (thuế TTĐB 1.0%).
4. Doanh thu Báo cáo Thuế Q3/2026 (385 triệu VNĐ) và các phiếu chi mặt bằng, điện nước.
5. Tài khoản tài chính `FinanceAccounts` (Két Till, Két Safe, Ngân hàng Bank) và hồ sơ công nợ FIFO khách hàng.
6. Nhà cung cấp và cấu hình ma trận đặt hàng (Lead time, Cutoff time).

#### Scenario: Kiểm thử đăng nhập và tải báo cáo thuế từ Frontend
- **GIVEN** Dữ liệu đã được nạp bởi `DbInitializer`.
- **WHEN** Người dùng đăng nhập tài khoản `admin` hoặc `store_owner` và truy cập màn hình Báo cáo thuế / Sổ quỹ / Đặt hàng.
- **THEN** Dữ liệu mẫu hiển thị đầy đủ, không bị rỗng hoặc lỗi 404/500.
