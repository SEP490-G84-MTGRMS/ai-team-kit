# Specs: employee-fe-integration

## API / Contract

| Method | Path | Request Body / Params | Response Data | Mã lỗi UI xử lý |
|---|---|---|---|---|
| GET | `/api/v1/employees` | Query: `keyword`, `branchId`, `status`, `page`, `pageSize` | `ApiResponse<PagedResult<EmployeeBackendSummaryDto>>` | 401, 500 (hiển thị Error banner + Retry) |
| GET | `/api/v1/employees/{id}` | Path param: `id` | `ApiResponse<EmployeeBackendDetailDto>` | 404 (báo không tìm thấy) |
| POST | `/api/v1/employees` | `CreateEmployeePayload` | `ApiResponse<EmployeeBackendDetailDto>` | 400 (validation), 409 (trùng CCCD/SĐT) |
| PUT | `/api/v1/employees/{id}` | `UpdateEmployeePayload` | `ApiResponse<EmployeeBackendDetailDto>` | 400, 404, 409 |
| PATCH | `/api/v1/employees/{id}/status` | `{ status: "active" \| "inactive" }` | `ApiResponse<object>` | 400, 404 |
| POST | `/api/v1/employees/{id}/identity-account` | `CreateIdentityAccountPayload` | `ApiResponse<{ userId, username, role }>` | 400, 409 (trùng username) |
| DELETE | `/api/v1/employees/{id}` | Path param: `id` | `ApiResponse<object>` | 400 (`EMPLOYEE_HAS_WORK_HISTORY`), 404 |
| POST | `/api/v1/media/upload` | `FormData: file, folder` | `ApiResponse<{ url: string }>` | 400, 500 |
| GET | `/api/v1/hr/shift-configs` | Query: `branchId`, `isActive` | `ApiResponse<ShiftConfigDto[]>` | 401, 403 |
| GET | `/api/v1/hr/shift-configs/{id}` | Path param: `id` | `ApiResponse<ShiftConfigDto>` | 404 |
| POST | `/api/v1/hr/shift-configs` | `CreateShiftConfigPayload` | `ApiResponse<ShiftConfigDto>` | 400, 409 (`DUPLICATE_SHIFT_CODE`) |
| PUT | `/api/v1/hr/shift-configs/{id}` | `UpdateShiftConfigPayload` | `ApiResponse<ShiftConfigDto>` | 400, 404 |
| PATCH | `/api/v1/hr/shift-configs/{id}/status` | `{ isActive: boolean }` | `ApiResponse<ShiftConfigDto>` | 400, 404 |
| DELETE | `/api/v1/hr/shift-configs/{id}` | Path param: `id` | `ApiResponse<object>` | 400, 404 |
| POST | `/api/v1/schedules/recurring` | `CreateRecurringSchedulePayload` | `ApiResponse<ScheduleResponse[]>` | 400 (xung đột ca > 12h, ngày kết thúc không hợp lệ) |
| POST | `/api/v1/schedules/{id}/attendance` | `ManualAttendancePayload` | `ApiResponse<ScheduleResponse>` | 400 (ca không hợp lệ), 404 |

---

## ADDED Requirements

### Requirement: REQ-FE-EMP-01 Client API Module & Data Mapper với Khớp nối ID Phụ cấp
Hệ thống Frontend **MUST** cung cấp module `employeeApi.ts` đóng gói các phương thức gọi API qua `httpClient` và bộ mapper `employeeMapper.ts` chuẩn hóa dữ liệu giữa Backend DTOs và Frontend model `Employee`.
Mapper **MUST** giữ nguyên ID của các khoản phụ cấp khi chuyển đổi giữa DTO và Model. Khi gửi payload tạo mới hoặc cập nhật (`mapFormToCreatePayload`), hệ thống **MUST** kiểm tra định dạng UUID:
- Các phụ cấp cũ có ID dạng UUID chuẩn $\rightarrow$ giữ nguyên `id` để Backend thực hiện `UPDATE` hoặc `DELETE`.
- Các phụ cấp mới tạo từ UI mang ID tạm (VD: `al_1730784...`) $\rightarrow$ gán `id = undefined` để Backend nhận biết thực hiện `INSERT` với `EntityState.Added`, ngăn chặn triệt để lỗi `DbUpdateConcurrencyException`.
- Các phụ cấp bị bỏ chọn (`enabled = false`) hoặc có số tiền $\le 0$ $\rightarrow$ bị loại khỏi payload gửi lên để Backend dọn dẹp khỏi cơ sở dữ liệu.

---

### Requirement: REQ-FE-EMP-02 Tải Danh sách Phân trang & Phân trang Chuẩn dùng chung
Trang `EmployeeListPage` **MUST** tải danh sách nhân viên từ Backend API `GET /api/v1/employees`, hỗ trợ tìm kiếm từ khóa có debounce 300ms, lọc theo chi nhánh và trạng thái hoạt động.
Phân trang của bảng **MUST** tích hợp component phân trang dùng chung của dự án `TablePagination` (`src/components/common/TablePagination`), hỗ trợ chuyển trang, chọn kích thước trang (`10`, `20`, `50`) và nhảy trang trực tiếp.

---

### Requirement: REQ-FE-EMP-03 Thêm mới, Chỉnh sửa Nhân viên & Upload Ảnh Cloudinary
Modal `EmployeeFormModal` **MUST** gửi request tạo mới (`POST`) hoặc cập nhật (`PUT`) đến Backend API và hiển thị thông báo lỗi cụ thể nếu vi phạm ràng buộc (409 Conflict: trùng CCCD hoặc SĐT).
Nhân viên **MUST** được phân bổ làm việc tại duy nhất một chi nhánh chính thông qua dropdown chọn đơn lẻ (kèm tính năng tìm kiếm nhanh và huy hiệu "Trụ sở").
Hệ thống **MUST** hỗ trợ tải ảnh đại diện nhân viên lên dịch vụ Cloudinary thông qua API backend `POST /api/v1/media/upload` (thư mục `mtgrms/employees`), kiểm tra kích thước file $\le 5\text{MB}$ và hiển thị trạng thái loading spinner trong khi upload. Khi lưu thành công, hệ thống **MUST** hiển thị popup `NotificationModal` thông báo thành công cho người dùng.

---

### Requirement: REQ-FE-EMP-04 Xem Chi tiết Hồ sơ 360 & Tải Thông tin Thực tế từ Backend
Modal `EmployeeDetailModal` **MUST** tự động gọi API `GET /api/v1/employees/{id}` khi mở để nạp dữ liệu thực tế và chính xác nhất từ cơ sở dữ liệu.
Hệ thống **MUST** áp dụng cơ chế hiển thị lạc quan (Optimistic Pre-fill) từ dữ liệu tóm tắt của bảng danh sách để tránh tình trạng chớp màn hình trắng, đồng thời hiển thị trạng thái `Đang đồng bộ từ hệ thống...` ở thanh tiêu đề.

---

### Requirement: REQ-FE-EMP-05 Chuẩn hóa Kích thước Toàn bộ Modal (Unified Modal Dimensions)
Toàn bộ các modal trong phân hệ nhân viên (16 modal và submodal bao gồm `EmployeeFormModal`, `EmployeeDetailModal`, `ShiftConfigModal`, `AddScheduleModal`, `ApprovalRequestsModal`, `AttendanceDetailModal`, `PayslipDetailModal`, `CreateUserModal`,...) **MUST** có kích thước cố định đồng nhất theo chuẩn `width: 900px` (kèm `max-width: 95vw`) và `height: 85vh` (kèm `max-height: 85vh`).
Header và Footer của modal **MUST** được cố định tại đỉnh và đáy khung hình (`flex-shrink: 0`), phần Body chiếm toàn bộ không gian còn lại (`flex: 1 1 auto`) và cuộn mượt mà khi nội dung dài.

---

### Requirement: REQ-FE-EMP-06 Xóa Nhân viên, Xử lý Business Rule BR-EMP-03 & Đổi Trạng thái Hoạt động
Giao diện **MUST** hỗ trợ chuyển đổi trạng thái hoạt động (`active` / `inactive`) thông qua API `PATCH /api/v1/employees/{id}/status` và hiển thị `NotificationModal` phản hồi kết quả tức thì.
Nếu nhân viên đã phát sinh lịch ca hoặc phiếu lương, hệ thống **MUST** bắt lỗi `EMPLOYEE_HAS_WORK_HISTORY` và hiển thị hướng dẫn người dùng chuyển trạng thái sang "Ngừng làm việc".

---

### Requirement: REQ-FE-EMP-07 Popup Thông báo & Xác nhận Dùng chung Toàn hệ thống (Common Modals)
Hệ thống **MUST** cung cấp 2 component modal dùng chung trong `src/components/common/`:
- `ConfirmModal.tsx`: Hỗ trợ xác nhận các hành động nguy hiểm.
- `NotificationModal.tsx`: Hỗ trợ hiển thị kết quả thao tác.

---

### Requirement: REQ-FE-EMP-08 Cấu hình Ca làm việc Đa chi nhánh Frontend (`ShiftConfig`)
Frontend **MUST** tích hợp module `shiftConfigApi.ts` tương thích với API Backend (`/api/v1/hr/shift-configs` và `/api/v1/shift-configs`).

---

### Requirement: REQ-FE-EMP-09 Lập lịch Làm việc Định kỳ & Tích hợp AddScheduleModal
Frontend **MUST** tích hợp modal lập lịch làm việc `AddScheduleModal.tsx` và API `scheduleApi.createRecurringSchedule`.

---

### Requirement: REQ-FE-EMP-10 Chấm công Thủ công (Manual Attendance Recording) & Quy tắc Giờ vào/ra theo Chính sách Chi nhánh
Hệ thống **MUST** hỗ trợ chủ cửa hàng/quản lý thực hiện chấm công thủ công cho nhân viên theo từng ca làm việc (`EmployeeSchedule`) qua `AttendanceDetailModal.tsx` và API `POST /api/v1/schedules/{id}/attendance`:
1. **Ba tiêu chí chấm công**:
   - `working` (Đi làm): Cho phép ghi nhận giờ vào (`CheckInTime`) và giờ ra (`CheckOutTime`). Nếu không ghi nhận giờ vào hoặc giờ ra, hệ thống **MUST** tự động lấy mặc định giờ vào/ra khớp với ca làm ban đầu (`PlannedStartTime` và `PlannedEndTime`).
   - `paid_leave` (Nghỉ phép có lương): Hệ thống ghi nhận trạng thái hoàn thành (`Completed`), loại phê duyệt `PAID_LEAVE`, giờ công thực tế tính đủ theo ca (`DurationHours`), giờ vào/ra đặt về `null`.
   - `unpaid_leave` (Nghỉ phép không lương): Hệ thống ghi nhận trạng thái hủy/vắng (`Cancelled`), loại phê duyệt `UNPAID_LEAVE`, giờ công thực tế tính là `0.00`, giờ vào/ra đặt về `null`.
2. **Áp dụng Chính sách Chấm công Chi nhánh (`BranchAttendancePolicy`)**:
   - Khi chấm công đi làm (`working`), Backend **MUST** tra cứu chính sách của chi nhánh tương ứng qua `BranchAttendancePoliciesController` / `IBranchAttendancePolicyRepository`.
   - Tính toán dung sai đi muộn (`LateMinutes`) nếu `EnableLateThreshold = true` và thời gian vào trễ hơn `LateThresholdMinutes`.
   - Tính toán dung sai về sớm (`EarlyLeaveMinutes`) nếu `EnableEarlyLeaveThreshold = true` và thời gian ra sớm hơn `EarlyLeaveThresholdMinutes`.
   - Tính toán làm thêm giờ (`OvertimeMinutes`) trước ca và sau ca theo các ngưỡng `OtBeforeShiftMinutes` và `OtAfterShiftMinutes`.
   - Tính toán tổng giờ làm thực tế `ActualWorkHours` làm tròn 2 chữ số thập phân.
