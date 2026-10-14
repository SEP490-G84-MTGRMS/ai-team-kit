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
