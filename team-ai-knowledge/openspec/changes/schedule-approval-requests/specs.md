# Specs: schedule-approval-requests

## API / Contract

| Method | Path | Request Body | Response Body | HTTP Lỗi |
|---|---|---|---|---|
| `POST` | `/api/employee-schedules/{scheduleId}/requests` | `CreateScheduleApprovalRequestDto` | `{ id: Guid, status: string }` | 400 Bad Request, 403 Forbidden, 404 Not Found |
| `GET` | `/api/employee-schedules/{scheduleId}/requests` | — | `ScheduleApprovalRequestDto[]` | 403 Forbidden, 404 Not Found |
| `GET` | `/api/schedule-approval-requests/pending` | Query: `storeId?`, `type?` | `{ total: int, items: PendingRequestDto[] }` | 403 Forbidden |
| `POST` | `/api/schedule-approval-requests/{requestId}/peer-confirm` | `PeerConfirmDto` | `{ success: bool }` | 400 Bad Request, 403 Forbidden, 404 Not Found |
| `POST` | `/api/schedule-approval-requests/{requestId}/review` | `ReviewScheduleApprovalRequestDto` | `{ success: bool }` | 400 Bad Request, 403 Forbidden, 404 Not Found |

---

## ADDED Requirements

### Requirement: REQ-01 Chuẩn hóa Enums & Tạo đơn yêu cầu (Create Schedule Request)
Hệ thống MUST hỗ trợ 4 loại yêu cầu qua Enum `ScheduleRequestType`: `Overtime` (1), `CheckInIncident` (2), `ShiftSwap` (3), `LeaveRequest` (4). Nhân viên (STAFF) SHALL có thể gửi yêu cầu gắn với ca làm việc của mình.

#### Scenario: Gửi đơn thành công
- **GIVEN** Nhân viên A đang đăng nhập và có ca làm việc `ScheduleId` hợp lệ, trạng thái `Scheduled`, `PayslipId == null`
- **WHEN** Nhân viên A gửi `POST /api/employee-schedules/{scheduleId}/requests` với `requestType = "LeaveRequest"`, `leaveType = "SickLeave"`, `reason = "Sốt cao cần đi khám"`
- **THEN** Hệ thống MUST tạo một bản ghi mới trong bảng `ScheduleApprovalRequests` với `Status = Pending` và trả về HTTP 201 Created.

#### Scenario: Ca đã chốt bảng lương (Edge case)
- **GIVEN** Ca làm việc đã được kết chuyển vào bảng lương (`PayslipId != null`)
- **WHEN** Nhân viên gửi yêu cầu bất kỳ cho ca này
- **THEN** Hệ thống MUST từ chối và trả về HTTP 400 Bad Request với thông báo "Ca làm việc đã được chốt bảng lương, không thể gửi yêu cầu".

#### Scenario: Trùng đơn đang chờ xử lý (Edge case)
- **GIVEN** Ca làm việc đã có 1 đơn `Overtime` đang ở trạng thái `Pending`
- **WHEN** Nhân viên tiếp tục gửi thêm 1 đơn `Overtime` cho cùng ca này
- **THEN** Hệ thống MUST từ chối và trả về HTTP 400 Bad Request với thông báo "Đã có yêu cầu cùng loại đang chờ duyệt cho ca này".

---

### Requirement: REQ-02 Đơn đổi ca làm việc (Shift Swap Request)
Hệ thống MUST hỗ trợ 2 hình thức đổi ca: `CrossSwap` (đổi chéo ca) và `Cover` (nhờ làm thay). Cả 2 nhân viên MUST cùng thuộc một chi nhánh (`BranchId`) và cùng Tenant.

#### Scenario: Đổi chéo ca thành công khi Quản lý duyệt
- **GIVEN** Nhân viên A (Ca Sáng) gửi yêu cầu đổi chéo ca với Nhân viên B (Ca Tối), cả 2 ca đều có `Status == Scheduled`
- **WHEN** Quản lý gọi `POST /api/schedule-approval-requests/{requestId}/review` với `isApproved = true`
- **THEN** Hệ thống MUST hoán đổi `EmployeeId` giữa 2 bản ghi `EmployeeSchedule` của A và B, và cập nhật trạng thái đơn thành `Approved`.

#### Scenario: Nhờ làm thay khi Quản lý duyệt
- **GIVEN** Nhân viên A gửi yêu cầu nhờ Nhân viên B làm thay ca Sáng của mình (`SwapType = Cover`, `TargetScheduleId = null`)
- **WHEN** Quản lý phê duyệt đơn
- **THEN** Hệ thống MUST gán `EmployeeId` của ca Sáng thành ID của Nhân viên B.

#### Scenario: Đổi ca khi ca đã bắt đầu (Edge case)
- **GIVEN** Ca của Nhân viên A hoặc Nhân viên B đã có `Status == InProgress` hoặc `Completed`
- **WHEN** Nhân viên A cố gắng gửi yêu cầu đổi ca
- **THEN** Hệ thống MUST từ chối với HTTP 400 Bad Request: "Chỉ có thể xin đổi ca khi ca chưa diễn ra".

---

### Requirement: REQ-03 Đơn xin nghỉ ca (Leave Request)
Hệ thống MUST cho phép nhân viên xin nghỉ ca với các loại `LeaveType` (`AnnualLeave`, `SickLeave`, `UnpaidLeave`...). Khi Quản lý duyệt, ca làm việc MUST chuyển trạng thái sang `ScheduleStatus.OnLeave`.

#### Scenario: Duyệt đơn xin nghỉ phép
- **GIVEN** Nhân viên A có đơn xin nghỉ phép năm `LeaveRequest` đang ở trạng thái `Pending`
- **WHEN** Quản lý phê duyệt với `isApproved = true` và `isPaidLeave = true`
- **THEN** Hệ thống MUST cập nhật trạng thái ca `EmployeeSchedule.Status = ScheduleStatus.OnLeave`, `IsLeave = true`, `IsPaidLeave = true`. Ca này không bị hệ thống tính là "Vắng không phép".

---

### Requirement: REQ-04 Đơn giải trình chấm công sự cố (Check-In Incident)
Hệ thống MUST cho phép nhân viên báo lỗi thiết bị FaceID / mất mạng và cung cấp giờ có mặt thực tế cùng ảnh chụp bằng chứng.

#### Scenario: Quản lý chấp thuận giải trình sự cố
- **GIVEN** Ca làm việc không có `CheckInTime` do lỗi camera nhận diện, nhân viên gửi đơn `CheckInIncident` kèm ảnh chứng minh và giờ vào đề xuất 08:00
- **WHEN** Quản lý phê duyệt đơn
- **THEN** Hệ thống MUST cập nhật `EmployeeSchedule.CheckInTime = 08:00`, `CheckInMethod = "INCIDENT_EXPLAINED"`, tính toán lại `LateMinutes` và `ActualWorkHours`, và cập nhật đơn thành `Approved`.

---

### Requirement: REQ-05 Đơn làm thêm giờ (Overtime Request)
Hệ thống MUST cho phép nhân viên đề xuất số phút OT phát sinh ngoài giờ ca. Giờ OT chỉ được ghi nhận vào ca làm sau khi Quản lý phê duyệt.

#### Scenario: Quản lý duyệt số phút làm thêm giờ
- **GIVEN** Nhân viên gửi đơn xin 60 phút OT do quán đông khách
- **WHEN** Quản lý phê duyệt với `approvedOvertimeMinutes = 60`
- **THEN** Hệ thống MUST cộng dồn 60 phút vào `EmployeeSchedule.OvertimeMinutes`.

---

### Requirement: REQ-06 Phân quyền & Multi-Tenant (RBAC & Multi-Tenancy)
Hệ thống MUST đảm bảo bảo mật dữ liệu giữa các tenant và vai trò.

#### Scenario: Nhân viên xem đơn của ca người khác (Security test)
- **GIVEN** Nhân viên A thuộc Tenant X
- **WHEN** Nhân viên A cố gắng truy cập danh sách đơn của một ca thuộc về Nhân viên C khác
- **THEN** Hệ thống MUST trả về HTTP 403 Forbidden.

#### Scenario: Quản lý xem danh sách chờ duyệt
- **GIVEN** Quản lý cửa hàng thuộc Tenant X
- **WHEN** Quản lý gọi `GET /api/schedule-approval-requests/pending`
- **THEN** Hệ thống MUST chỉ trả về các đơn đang `Pending` thuộc các chi nhánh của Tenant X.

---

## Acceptance checklist
- [ ] REQ-01: Định nghĩa đầy đủ các Enum C# & TypeScript (`ScheduleRequestType`, `ShiftSwapType`, `LeaveType`, `ScheduleApprovalStatus`, `ScheduleStatus.OnLeave`).
- [ ] REQ-01: API tạo đơn thành công cho cả 4 loại yêu cầu; chặn tạo đơn nếu ca đã chốt lương (`PayslipId != null`).
- [ ] REQ-02: Đổi chéo ca hoán đổi chính xác `EmployeeId` giữa 2 ca; nhờ làm thay chuyển ca cho đồng nghiệp.
- [ ] REQ-03: Duyệt đơn xin nghỉ chuyển trạng thái ca sang `OnLeave`, ghi nhận `IsLeave` và `IsPaidLeave`.
- [ ] REQ-04: Duyệt đơn sự cố cập nhật `CheckInTime`, `CheckInMethod = "INCIDENT_EXPLAINED"`, tính lại giờ công và thời gian trễ.
- [ ] REQ-05: Duyệt đơn OT cộng dồn số phút OT vào `EmployeeSchedule.OvertimeMinutes`.
- [ ] REQ-06: Đảm bảo multi-tenant filter và RBAC chuẩn xác giữa `STAFF` và `STORE_OWNER`.
- [ ] UI: Nút gửi đơn trên Lịch làm việc và Điểm danh; Chuông thông báo và Modal 4 tabs trên TopNav.
