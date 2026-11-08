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

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: ui-employee-management -->
# Delta Specs: ui-employee-management
## Capability: employee (Phân hệ Quản trị Nhân sự & Tiền lương Chuỗi Cửa hàng)

### ADDED Requirements

#### [UC-EMP-01] Quản lý & Lọc Hồ sơ Nhân viên (`EmployeeListPage`)
- Hệ thống SHALL hiển thị danh sách nhân viên phân trang với các cột: Checkbox, Avatar, Mã nhân viên (`NVxxxxxx`), Mã chấm công, Tên nhân viên (kèm tag cảnh báo), Số điện thoại, Nợ & tạm ứng (VNĐ), và Trạng thái hoạt động.
- Hệ thống SHALL hỗ trợ tìm kiếm tức thời theo Tên, Mã NV, hoặc Số điện thoại.
- Hệ thống SHALL cung cấp Sidebar bộ lọc đa tiêu chí: Trạng thái (Đang làm việc / Đã nghỉ / Tất cả), Chi nhánh làm việc, Chi nhánh trả lương, Phòng ban, Chức danh.
- Hệ thống SHALL hiển thị badge đếm số lượng yêu cầu chờ xử lý trên nút "Duyệt yêu cầu".

#### [UC-EMP-02] Khởi tạo & Cập nhật Hồ sơ Nhân viên (`EmployeeFormModal`)
- Hệ thống SHALL kiểm tra tính hợp lệ của các trường bắt buộc: Tên nhân viên, Số điện thoại, Chi nhánh trả lương chính.
- Hệ thống SHALL tự động sinh mã nhân viên định dạng `NVxxxxxx` khi để trống.
- Hệ thống SHALL cho phép gán một nhân viên vào nhiều chi nhánh làm việc, và 1 chi nhánh trả lương chính.
- Hệ thống SHALL hỗ trợ liên kết hoặc tạo nhanh tài khoản người dùng (`CreateUserModal`).
- Hệ thống SHALL cho phép thiết lập chế độ lương (Lương tháng cố định, Lương theo giờ, Lương theo ca), hệ số tăng ca OT và bảng phụ cấp (`CreateAllowanceModal`).

#### [UC-EMP-03] Xem Hồ sơ Nhân viên Toàn diện 360 độ (`EmployeeDetailModal`)
- Hệ thống SHALL hiển thị Panel / Drawer chi tiết gồm 5 tab chức năng:
  - **Tab 1 - Thông tin:** Chi tiết liên hệ, công việc, tài khoản đăng nhập, thông tin ngân hàng.
  - **Tab 2 - Lịch làm việc:** Xem lịch phân ca tuần/tháng của riêng nhân viên.
  - **Tab 3 - Thiết lập lương:** Xem cơ cấu lương hiện hành, hệ số OT, danh mục phụ cấp.
  - **Tab 4 - Phiếu lương:** Lịch sử các kỳ phiếu lương đã chốt, số tiền thực lĩnh, trạng thái thanh toán.
  - **Tab 5 - Nợ và tạm ứng:** Số dư công nợ hiện tại, lịch sử thanh toán / tạm ứng lương.

#### [UC-EMP-04] Xếp Lịch làm việc & Quản lý Ca (`WorkSchedulePage`)
- Hệ thống SHALL cung cấp giao diện lưới phân ca theo tuần (Thứ 2 đến Chủ nhật) trực quan theo từng nhân viên.
- Hệ thống SHALL cho phép cấu hình danh mục ca làm việc qua `ShiftFormModal` (Giờ bắt đầu, giờ kết thúc, thời gian nghỉ giữa ca, dung sai check-in trước/sau, mã màu ca).
- Hệ thống SHALL hỗ trợ phân ca linh hoạt qua `AddScheduleModal` cho một hoặc nhiều nhân viên, lặp lại theo tuần.
- Khi chỉnh sửa hoặc đổi ca, hệ thống SHALL mở `ScheduleScopeConfirmModal` cho phép người dùng chọn phạm vi: "Chỉ ca này" hoặc "Tất cả các ca lặp lại trong tương lai".

#### [UC-EMP-05] Chấm công & Tích hợp Kiểm soát GPS / Mã QR (`AttendancePage`)
- Hệ thống SHALL hiển thị bảng chấm công tổng hợp theo tuần cho toàn bộ nhân sự theo chi nhánh.
- Hệ thống SHALL hiển thị mã QR Check-in động tại cửa hàng để nhân viên quét bằng app di động ghi nhận chấm công.
- Hệ thống SHALL cho phép quản lý tọa độ GPS và bán kính check-in cho phép của từng chi nhánh qua `GpsLocationsModal`.
- Hệ thống SHALL hiển thị trạng thái chấm công chi tiết: Đúng giờ (Xanh), Đi muộn (Vàng kèm số phút muộn), Về sớm (Nâu cam), Vắng mặt (Đỏ).

#### [UC-EMP-06] Điều chỉnh Chấm công & Thưởng Phạt Tích hợp (`AttendanceDetailModal`)
- Hệ thống SHALL tích hợp 4 chức năng chấm công trong một popup duy nhất:
  - **Tab 1 - Thiết lập chấm công:** Cho phép đánh dấu Đi làm, Nghỉ phép hưởng lương, hoặc Nghỉ không lương; cấu hình bật/tắt và thời gian Vào/Ra thực tế.
  - **Tab 2 - Lịch sử chấm công:** Xem nhật ký vị trí GPS (tọa độ, khoảng cách so với shop), thông tin thiết bị (máy, IMEI), tổng giờ làm việc tính toán.
  - **Tab 3 - Bảng phạt vi phạm:** Ghi nhận các loại vi phạm trong ca (Đi muộn, về sớm, quên check-in, sai đồng phục...), tự tính tiền phạt.
  - **Tab 4 - Bảng thưởng ca:** Ghi nhận các khoản thưởng nóng (Chuyên cần, tăng ca giờ cao điểm, khách khen ngợi...).

#### [UC-EMP-07] Phê duyệt Yêu cầu Chấm công & Hồ sơ (`ApprovalRequestsModal`)
- Hệ thống SHALL phân loại các yêu cầu chờ duyệt thành 2 nhóm: Tab Nhân viên (cập nhật hồ sơ, đổi số điện thoại) và Tab Chấm công (quên chấm công, đổi máy, check-in ngoài GPS).
- Hệ thống SHALL hỗ trợ phê duyệt hoặc từ chối từng yêu cầu hoặc hàng loạt.

#### [UC-EMP-08] Quản lý Bảng Tính lương & KPI Tài chính (`PayslipManagementPage`)
- Hệ thống SHALL hiển thị 4 thẻ KPI tài chính tổng hợp: Số phiếu lương, Tổng quỹ thực nhận, Tổng tiền chưa chi trả, Tổng tiền đã thanh toán.
- Hệ thống SHALL cung cấp bộ lọc chuyên sâu: Lọc theo tháng (`Tháng MM/YYYY`), lọc trạng thái thanh toán, lọc chi nhánh qua ô tìm kiếm live dropdown.
- Bảng phiếu lương SHALL hiển thị chuẩn kế toán không ngắt dòng: Mã NV (Badge teal), Nhân viên (Avatar + Tên + Chi nhánh), Kỳ lương, Lương cơ sở, Thực nhận (Net), Trạng thái (Text + Color + Icon), Ngày trả.
- Bấm vào bất kỳ dòng nào trên bảng SHALL mở `PayslipDetailModal`.

#### [UC-EMP-09] Chi trả Lương Đơn lẻ & Hàng loạt (`PayslipPaymentModal`)
- Hệ thống SHALL hỗ trợ thanh toán phiếu lương qua 2 hình thức: Mã VietQR ngân hàng tự động và Tiền mặt.
- Hệ thống SHALL hỗ trợ nút "Chi trả hàng loạt" để duyệt chi đồng loạt các phiếu lương chưa thanh toán được chọn trên bảng.
- Sau khi thanh toán thành công, hệ thống SHALL cập nhật trạng thái phiếu lương thành "Đã thanh toán" kèm ngày giờ ghi nhận bút toán chi.

#### [UC-EMP-10] Nhập & Xuất Dữ liệu Excel Nhân sự (`ImportEmployeeModal`)
- Hệ thống SHALL cho phép tải file Excel mẫu chuẩn (`Mau_nhan_vien.xlsx`).
- Hệ thống SHALL hỗ trợ tải lên file danh sách nhân sự với 2 cơ chế xử lý lỗi: Dừng lại khi gặp lỗi hoặc Bỏ qua dòng lỗi tiếp tục.
- Hệ thống SHALL cho phép xuất bảng danh sách nhân viên và bảng tính lương ra file Excel.

---

### ADDED Business Rules

- **BR-EMP-01 (Mã nhân viên duy nhất):** Mỗi nhân viên có một mã duy nhất trên toàn hệ thống. Nếu không nhập, hệ thống tự sinh theo định dạng `NVxxxxxx`.
- **BR-EMP-02 (Ràng buộc Chi nhánh trả lương):** Nhân viên bắt buộc phải có 1 Chi nhánh trả lương chính nằm trong danh sách các chi nhánh làm việc được phân công.
- **BR-EMP-03 (Phạm vi Lịch làm việc):** Khi thay đổi một ca làm việc lặp lại, hệ thống bắt buộc người dùng xác nhận thay đổi "Chỉ ca này" hay "Tất cả các ca tương lai" để bảo toàn lịch sử chấm công quá khứ.
- **BR-EMP-04 (Bán kính Hợp lệ GPS):** Check-in GPS được xem là hợp lệ khi khoảng cách từ thiết bị đến tọa độ chi nhánh nhỏ hơn hoặc bằng bán kính cho phép (mặc định 200m). Vượt bán kính sẽ đưa vào danh sách yêu cầu chờ duyệt.
- **BR-EMP-05 (Cấn trừ Công nợ / Tạm ứng):** Khoản chi lương phát sinh khi công nợ bằng 0 sẽ tự động chuyển thành Tạm ứng và được trừ tự động vào cột "Trừ tạm ứng" trong bảng tính lương kỳ kế tiếp.
- **BR-EMP-06 (Công thức Tính lương Thực nhận):** $\text{Thực nhận (Net)} = \text{Lương ngày công} + \text{Lương tăng ca OT} + \text{Phụ cấp} + \text{Thưởng} - (\text{BHXH} + \text{Phạt vi phạm} + \text{Trừ tạm ứng})$.
- **BR-EMP-07 (Quy chuẩn Trạng thái Phiếu lương):** Trạng thái phiếu lương chỉ gồm `UNPAID` (Chưa thanh toán - Cam `#D97706` + icon Clock) và `PAID` (Đã thanh toán - Xanh lục `#059669` + icon Check).
- **BR-EMP-08 (Giới hạn Nhập Excel):** Giới hạn tối đa 500 bản ghi nhân viên cho một lần nạp file để bảo đảm hiệu năng hệ thống.
