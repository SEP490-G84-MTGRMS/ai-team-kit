# Spec: saas-master-admin-portal

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

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

## Lịch sử
- 2026-10-10 · `saas-master-admin-portal` · +0 ~0 -0
- 2026-10-29 · `master-admin-backend-crud` · +4 ~0 -0
