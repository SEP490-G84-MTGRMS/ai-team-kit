# Specs: shift-config-crud

## API / Contract

| Method | Path | Request Body | Response (Success) | Mã lỗi chính |
|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/hr/shift-configs` | Query: `branchId` (Guid, required), `isActive` (bool, optional) | `200 OK`: `List<ShiftConfigResponse>` | `400` (Thiếu branchId), `401` |
| `GET` | `/api/v1/hr/shift-configs/{id}` | None | `200 OK`: `ShiftConfigResponse` | `404` (Không tìm thấy), `401` |
| `POST` | `/api/v1/hr/shift-configs` | `CreateShiftConfigRequest` | `201 Created`: `ShiftConfigResponse` | `400` (Validation), `409` (Trùng mã ca), `401`, `403` |
| `PUT` | `/api/v1/hr/shift-configs/{id}` | `UpdateShiftConfigRequest` | `200 OK`: `ShiftConfigResponse` | `400` (Validation), `404`, `401`, `403` |
| `PATCH` | `/api/v1/hr/shift-configs/{id}/status` | Body: `{ "isActive": boolean }` | `200 OK`: `ShiftConfigResponse` | `404`, `401`, `403` |
| `DELETE` | `/api/v1/hr/shift-configs/{id}` | None | `204 No Content` | `404`, `401`, `403` |

---

## ADDED Requirements

### Requirement: REQ-SHF-01 Tạo mới ca làm việc mẫu (Create Shift Config)
Hệ thống **MUST** cho phép người dùng có quyền quản lý (`Store Owner`, `Store Manager`) tạo một ca làm việc mẫu cho một chi nhánh xác định. Hệ thống **MUST** xác thực mã ca (`ShiftCode`) không được trùng lặp trong cùng một chi nhánh của cùng Tenant.

#### Scenario: Tạo mới ca làm việc thành công với đầy đủ thông tin
- **GIVEN** Người dùng đăng nhập với quyền `Store Owner` của Tenant hiện tại
- **WHEN** Gửi request `POST /api/v1/hr/shift-configs` với thông tin hợp lệ:
  - `BranchId` = chi nhánh hợp lệ
  - `ShiftCode` = `"SANG"`
  - `ShiftName` = `"Ca sáng"`
  - `StartTime` = `"06:00:00"`
  - `EndTime` = `"14:00:00"`
- **THEN** Hệ thống lưu bản ghi vào bảng `ShiftConfigs` với `TenantId` tự động inject từ context
- **AND** Hệ thống tự động tính `DurationHours = 8.00`, `AllowedCheckInStart = 05:30:00`, `AllowedCheckInEnd = 07:00:00` (nếu không truyền)
- **AND** Trả về mã phản hồi `201 Created` kèm thông tin chi tiết ca vừa tạo.

#### Scenario: Báo lỗi khi tạo ca bị trùng mã trong cùng chi nhánh (Edge Case)
- **GIVEN** Chi nhánh `B1` đã có ca với `ShiftCode = "SANG"` chưa bị xóa
- **WHEN** Người dùng gửi request `POST /api/v1/hr/shift-configs` cho chi nhánh `B1` với `ShiftCode = "SANG"`
- **THEN** Hệ thống chặn lại, không ghi vào database
- **AND** Trả về mã phản hồi `409 Conflict` (hoặc `400 Bad Request`) với mã lỗi `DUPLICATE_SHIFT_CODE` và thông báo `"Mã ca 'SANG' đã tồn tại trong chi nhánh này."`

#### Scenario: Tạo ca vắt đêm thành công (Overnight Shift Edge Case)
- **GIVEN** Ca tối bắt đầu lúc 22:00 và kết thúc lúc 06:00 sáng hôm sau (`StartTime = 22:00:00`, `EndTime = 06:00:00`)
- **WHEN** Người dùng gửi request tạo ca
- **THEN** Hệ thống chấp nhận và tính đúng `DurationHours = 8.00 giờ` thay vì ra số âm.

---

### Requirement: REQ-SHF-02 Lấy danh sách & Tra cứu ca làm việc (Query Shift Configs)
Hệ thống **SHALL** cho phép người dùng tra cứu danh sách các ca làm việc của một chi nhánh theo `branchId` và lọc theo trạng thái hoạt động `isActive`. Mọi truy vấn **MUST** tự động lọc theo `TenantId` và loại trừ các bản ghi đã xóa mềm (`IsDeleted = false`).

#### Scenario: Lấy danh sách các ca đang hoạt động của chi nhánh
- **GIVEN** Chi nhánh `B1` có 3 ca làm việc (`SANG` active, `CHIEU` active, `TOI` inactive)
- **WHEN** Gửi request `GET /api/v1/hr/shift-configs?branchId=B1&isActive=true`
- **THEN** Hệ thống trả về `200 OK` với danh sách gồm đúng 2 ca `SANG` và `CHIEU`
- **AND** Không bao gồm ca `TOI` và không bao gồm ca của chi nhánh khác hoặc tenant khác.

#### Scenario: Lỗi khi không truyền branchId bắt buộc
- **WHEN** Gửi request `GET /api/v1/hr/shift-configs` không có query param `branchId`
- **THEN** Hệ thống trả về mã lỗi `400 Bad Request` kèm thông báo `"BranchId là tham số bắt buộc."`

---

### Requirement: REQ-SHF-03 Cập nhật cấu hình ca làm việc (Update Shift Config)
Hệ thống **MUST** cho phép Chủ cửa hàng cập nhật tên ca, khung giờ làm việc, thời lượng và ghi chú của một ca làm việc đang tồn tại.

#### Scenario: Cập nhật thành công khung giờ ca làm việc
- **GIVEN** Bản ghi ca làm việc `Id = C1` tồn tại trong tenant hiện tại
- **WHEN** Gửi request `PUT /api/v1/hr/shift-configs/C1` thay đổi `EndTime` từ `"14:00:00"` thành `"14:30:00"`
- **THEN** Hệ thống cập nhật các trường mới, cập nhật `UpdatedAt = UtcNow`
- **AND** Trả về `200 OK` kèm bản ghi đã cập nhật.

#### Scenario: Báo lỗi khi cập nhật ca không tồn tại (Edge Case)
- **WHEN** Gửi request `PUT /api/v1/hr/shift-configs/{random_guid}`
- **THEN** Hệ thống trả về `404 Not Found` kèm thông báo `"Không tìm thấy ca làm việc với ID đã cung cấp."`

---

### Requirement: REQ-SHF-04 Bật/Tắt trạng thái hoạt động & Xóa mềm ca làm việc (Status & Soft Delete)
Hệ thống **MUST** hỗ trợ chuyển đổi trạng thái `IsActive` (bật/tắt) và xóa mềm (`IsDeleted = true`) một ca làm việc.

#### Scenario: Bật/tắt kích hoạt ca làm việc
- **GIVEN** Ca làm việc `C1` đang có `IsActive = true`
- **WHEN** Gửi request `PATCH /api/v1/hr/shift-configs/C1/status` với body `{"isActive": false}`
- **THEN** Hệ thống cập nhật `IsActive = false` và trả về `200 OK`. Ca này sẽ không xuất hiện trong danh sách chọn ca của phân hệ xếp lịch tuần nữa.

#### Scenario: Xóa mềm ca làm việc
- **GIVEN** Ca làm việc `C1` tồn tại
- **WHEN** Gửi request `DELETE /api/v1/hr/shift-configs/C1`
- **THEN** Hệ thống cập nhật `IsDeleted = true`, `DeletedAt = UtcNow`
- **AND** Trả về `204 No Content`. Bản ghi không bị xóa vĩnh viễn khỏi CSDL để bảo toàn dữ liệu lịch sử.

---

## MODIFIED Requirements
*(Không có — Đây là tính năng mới mở rộng thêm Master Data cho phân hệ HR)*

## REMOVED Requirements
*(Không có)*

---

## Acceptance Checklist
- [ ] **REQ-SHF-01:** API `POST /api/v1/hr/shift-configs` tạo mới ca thành công, tự động tính thời lượng, chặn trùng mã trong cùng chi nhánh.
- [ ] **REQ-SHF-02:** API `GET /api/v1/hr/shift-configs` trả về danh sách ca theo chi nhánh, hỗ trợ lọc `isActive`, tự động phân lập theo `TenantId`.
- [ ] **REQ-SHF-03:** API `PUT /api/v1/hr/shift-configs/{id}` cập nhật đúng dữ liệu và lưu thời điểm sửa đổi `UpdatedAt`.
- [ ] **REQ-SHF-04:** API `PATCH /api/v1/hr/shift-configs/{id}/status` và `DELETE /api/v1/hr/shift-configs/{id}` hoạt động đúng chuẩn soft-delete.
- [ ] **Unit Tests:** Viết đầy đủ bộ test cases xUnit cho `ShiftConfigService` (Create, Update, Delete, Duplicate Check, Overnight Duration) đạt 100% pass.
