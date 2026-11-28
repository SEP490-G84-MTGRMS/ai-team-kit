# Specs: Multi-Branch Management (Quản lý đa chi nhánh)

## API / Contract

| Method | Path | Request Body | Response Body | HTTP Status / Lỗi |
|---|---|---|---|---|
| `GET` | `/api/v1/branches/quota` | — | `ApiResponse<BranchQuotaDto>` | 200 OK |
| `GET` | `/api/v1/branches` | Query: `keyword`, `status`, `pageIndex`, `pageSize` | `ApiResponse<PagedResult<BranchDto>>` | 200 OK |
| `GET` | `/api/v1/branches/{id}` | — | `ApiResponse<BranchDto>` | 200 OK, 404 Not Found |
| `POST` | `/api/v1/branches` | `CreateBranchRequest` | `ApiResponse<BranchDto>` | 201 Created, 400 Bad Request (`QUOTA_EXCEEDED`, `DUPLICATE_CODE`) |
| `PUT` | `/api/v1/branches/{id}` | `UpdateBranchRequest` | `ApiResponse<BranchDto>` | 200 OK, 404 Not Found, 400 Bad Request |
| `PATCH` | `/api/v1/branches/{id}/status` | `UpdateBranchStatusRequest` | `ApiResponse<BranchDto>` | 200 OK, 404 Not Found |

---

## ADDED Requirements

### Requirement: REQ-BR-01 Kiểm tra & Thực thi Hạn mức Chi nhánh (Subscription Quota)
Hệ thống **MUST** xác định số lượng chi nhánh đang hoạt động của Tenant và so sánh với hạn mức `MaxBranches` được cấu hình trong gói thuê bao (Subscription Plan) hiện tại của chuỗi.

#### Scenario: Lấy thông tin hạn mức thành công
- **GIVEN** Tenant đang sử dụng gói `PRO` có `MaxBranches = 3` và đã tạo 2 chi nhánh
- **WHEN** Người dùng gửi yêu cầu `GET /api/v1/branches/quota`
- **THEN** Hệ thống trả về HTTP 200 OK với `usedBranches = 2`, `maxBranches = 3`, `canAddMore = true`.

#### Scenario: Tenant đã sử dụng hết số lượng chi nhánh cho phép
- **GIVEN** Tenant đang sử dụng gói `STARTER` có `MaxBranches = 1` và đã có 1 chi nhánh
- **WHEN** Người dùng gửi yêu cầu `GET /api/v1/branches/quota`
- **THEN** Hệ thống trả về HTTP 200 OK với `usedBranches = 1`, `maxBranches = 1`, `canAddMore = false`.

---

### Requirement: REQ-BR-02 Tạo mới Chi nhánh (Create Branch)
Hệ thống **MUST** cho phép người dùng có vai trò `StoreOwner` hoặc `Admin` tạo mới chi nhánh khi chưa vượt quá hạn mức quota, và mã chi nhánh (`BranchCode`) **MUST** là duy nhất trong phạm vi Tenant.

#### Scenario: Tạo mới chi nhánh thành công khi còn quota
- **GIVEN** Tenant có `usedBranches = 1`, `maxBranches = 3`
- **WHEN** Người dùng gửi `POST /api/v1/branches` với `BranchCode = "CN-BT-02"`, `Name = "MT-Mart Bình Thạnh"`, `Address = "456 Xô Viết Nghệ Tĩnh"`, `Phone = "0987654321"`
- **THEN** Hệ thống lưu chi nhánh mới vào cơ sở dữ liệu với `IsActive = true`, liên kết đúng `TenantId` và trả về HTTP 201 Created.

#### Scenario: Chặn tạo chi nhánh khi đã đạt trần quota (Edge case: Vượt giới hạn)
- **GIVEN** Tenant có `usedBranches = 3`, `maxBranches = 3`
- **WHEN** Người dùng gửi `POST /api/v1/branches` để tạo thêm chi nhánh
- **THEN** Hệ thống từ chối yêu cầu, trả về HTTP 400 Bad Request với errorCode `QUOTA_EXCEEDED` và message `Chuỗi cửa hàng của bạn đã đạt giới hạn tối đa 3 chi nhánh của gói hiện tại. Vui lòng nâng cấp gói cước để tiếp tục thêm chi nhánh.`

#### Scenario: Chặn tạo chi nhánh khi trùng mã (Edge case: Trùng lặp)
- **GIVEN** Tenant đã có chi nhánh mang mã `CN-Q1`
- **WHEN** Người dùng gửi `POST /api/v1/branches` với `BranchCode = "CN-Q1"`
- **THEN** Hệ thống từ chối và trả về HTTP 400 Bad Request với errorCode `DUPLICATE_CODE` và message `Mã chi nhánh 'CN-Q1' đã tồn tại trong chuỗi cửa hàng.`

---

### Requirement: REQ-BR-03 Chỉnh sửa Thông tin Chi nhánh (Update Branch)
Hệ thống **MUST** cho phép người dùng có quyền cập nhật Tên chi nhánh, Địa chỉ, Số điện thoại và Tên người quản lý phụ trách của chi nhánh.

#### Scenario: Cập nhật thông tin chi nhánh thành công
- **GIVEN** Chi nhánh có ID `branch-01` thuộc quyền sở hữu của Tenant hiện tại
- **WHEN** Người dùng gửi `PUT /api/v1/branches/branch-01` với `Name = "MT-Mart Quận 1 - Flagship"`, `Phone = "0901234567"`
- **THEN** Hệ thống cập nhật các trường thông tin trong cơ sở dữ liệu và trả về HTTP 200 OK kèm thông tin mới nhất.

#### Scenario: Không tìm thấy hoặc chi nhánh thuộc Tenant khác (Edge case: Khác tenant)
- **GIVEN** Chi nhánh `branch-99` không tồn tại hoặc thuộc quyền sở hữu của Tenant khác
- **WHEN** Người dùng gửi `PUT /api/v1/branches/branch-99`
- **THEN** Hệ thống trả về HTTP 404 Not Found.

---

### Requirement: REQ-BR-04 Bật/Tắt Trạng thái Hoạt động Chi nhánh (Toggle Branch Status)
Hệ thống **MUST** cho phép chuyển đổi trạng thái `Active` / `Inactive` của chi nhánh mà không xóa dữ liệu đơn hàng và lịch sử kiểm kê kho.

#### Scenario: Tạm ngưng hoạt động của chi nhánh
- **GIVEN** Chi nhánh đang ở trạng thái `IsActive = true`
- **WHEN** Người dùng gửi `PATCH /api/v1/branches/{id}/status` với `isActive = false`
- **THEN** Hệ thống cập nhật `IsActive = false` và trả về HTTP 200 OK.

---

### Requirement: REQ-BR-05 Giao diện Quản lý Chi nhánh & Điểm chạm Tương tác (UI & Touchpoints)
Giao diện ứng dụng **MUST** cung cấp tab `Quản lý chi nhánh` trong trang Store Settings Hub, thanh Quota Bar trực quan, và các nút điều hướng nhanh từ Menu `Cửa hàng` và TopBar `Số chi nhánh`.

#### Scenario: Điều hướng đến tab Quản lý chi nhánh từ TopBar
- **GIVEN** Người dùng đang ở bất kỳ tab nào của `StoreSettingsHubPage`
- **WHEN** Người dùng click vào widget `Số chi nhánh: 2` trên thanh trạng thái `StoreTopStatusBar`
- **THEN** Hệ thống kích hoạt tab `Quản lý chi nhánh` (`?tab=branches`) hiển thị danh sách chi nhánh và Quota Bar.

#### Scenario: Nút Thêm chi nhánh hiển thị theo trạng thái Quota
- **GIVEN** Hạn mức chi nhánh còn trống (`usedBranches < maxBranches`)
- **WHEN** Người dùng xem thanh Quota Bar
- **THEN** Nút `+ Thêm chi nhánh mới` ở trạng thái kích hoạt, khi bấm sẽ mở `BranchFormModal`.

#### Scenario: Nút Thêm chi nhánh khi đã hết hạn mức
- **GIVEN** Hạn mức chi nhánh đã đầy (`usedBranches >= maxBranches`)
- **WHEN** Người dùng bấm nút `+ Thêm chi nhánh mới`
- **THEN** Hệ thống mở `BranchUpgradeModal` giải thích lý do đã đạt giới hạn quota và cung cấp nút chuyển nhanh sang tab `Gói dịch vụ` để nâng cấp.

---

## Acceptance Checklist
- [ ] `GET /api/v1/branches/quota` trả về đúng số chi nhánh đang dùng và giới hạn gói cước.
- [ ] `POST /api/v1/branches` tạo thành công chi nhánh mới khi còn slot và chặn tạo khi vượt quota.
- [ ] `POST /api/v1/branches` chặn khi trùng mã chi nhánh trong cùng tenant.
- [ ] `PUT /api/v1/branches/{id}` cập nhật thông tin chi nhánh thành công.
- [ ] `PATCH /api/v1/branches/{id}/status` đổi trạng thái Active/Inactive an toàn.
- [ ] Tab `Quản lý chi nhánh` (`branches`) hiển thị đầy đủ danh sách, Quota Bar, bộ lọc tìm kiếm.
- [ ] Nút `Số chi nhánh` trên `StoreTopStatusBar` và menu `Chi nhánh` trên `AppTopNav` chuyển tab mượt mà.
- [ ] Bộ kiểm thử Unit & Integration Tests cho API và Frontend đạt 100% pass.
