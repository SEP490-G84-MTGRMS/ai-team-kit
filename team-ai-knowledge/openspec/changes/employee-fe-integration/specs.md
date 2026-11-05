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

---

## ADDED Requirements

### Requirement: REQ-FE-EMP-01 Client API Module & Data Mapper với Khớp nối ID Phụ cấp
Hệ thống Frontend **MUST** cung cấp module `employeeApi.ts` đóng gói các phương thức gọi API qua `httpClient` và bộ mapper `employeeMapper.ts` chuẩn hóa dữ liệu giữa Backend DTOs và Frontend model `Employee`.
Mapper **MUST** giữ nguyên ID của các khoản phụ cấp khi chuyển đổi giữa DTO và Model. Khi gửi payload tạo mới hoặc cập nhật (`mapFormToCreatePayload`), hệ thống **MUST** kiểm tra định dạng UUID:
- Các phụ cấp cũ có ID dạng UUID chuẩn $\rightarrow$ giữ nguyên `id` để Backend thực hiện `UPDATE` hoặc `DELETE`.
- Các phụ cấp mới tạo từ UI mang ID tạm (VD: `al_1730784...`) $\rightarrow$ gán `id = undefined` để Backend nhận biết thực hiện `INSERT` với `EntityState.Added`, ngăn chặn triệt để lỗi `DbUpdateConcurrencyException`.
- Các phụ cấp bị bỏ chọn (`enabled = false`) hoặc có số tiền $\le 0$ $\rightarrow$ bị loại khỏi payload gửi lên để Backend dọn dẹp khỏi cơ sở dữ liệu.

#### Scenario: Chuyển đổi dữ liệu và đồng bộ phụ cấp an toàn
- **GIVEN** Nhân viên đang có 2 phụ cấp trong DB: Phụ cấp Xăng xe (`id = "01a1aa16-1a0f-77dd-b92e-26c84ea398e6"`) và Phụ cấp Ăn trưa (`id = "01a1aa27-7de3-7656-b507-effecc5160b3"`).
- **WHEN** Người dùng sửa Phụ cấp Xăng xe thành 60.000đ, bấm "+ Thêm khoản phụ cấp" tạo Phụ cấp Trách nhiệm (ID tạm `al_179385...`, 500.000đ), và xóa Phụ cấp Ăn trưa.
- **THEN** Hàm `mapFormToCreatePayload` xuất ra mảng `allowances` gồm 2 phần tử: 1 phần tử có `id` UUID và 1 phần tử có `id: undefined`. Request `PUT /api/v1/employees/{id}` gửi thành công, Backend cập nhật chính xác mà không gặp lỗi ngắt liên kết hay lỗi số dòng bị ảnh hưởng = 0.

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
Các trường dữ liệu như Ngày sinh, Ngày bắt đầu làm việc **MUST** được định dạng theo chuẩn Việt Nam `DD/MM/YYYY`. Nút **"Sửa thông tin"** trong modal chi tiết **MUST** truyền trực tiếp đối tượng đã được làm giàu sang form chỉnh sửa.

---

### Requirement: REQ-FE-EMP-05 Chuẩn hóa Kích thước Toàn bộ Modal (Unified Modal Dimensions)
Toàn bộ các modal trong phân hệ nhân viên (16 modal và submodal bao gồm `EmployeeFormModal`, `EmployeeDetailModal`, `ShiftConfigModal`, `AddScheduleModal`, `ApprovalRequestsModal`, `AttendanceDetailModal`, `PayslipDetailModal`, `CreateUserModal`,...) **MUST** có kích thước cố định đồng nhất theo chuẩn `width: 900px` (kèm `max-width: 95vw`) và `height: 85vh` (kèm `max-height: 85vh`).
Header và Footer của modal **MUST** được cố định tại đỉnh và đáy khung hình (`flex-shrink: 0`), phần Body chiếm toàn bộ không gian còn lại (`flex: 1 1 auto`) và cuộn mượt mà khi nội dung dài.

---

### Requirement: REQ-FE-EMP-06 Xóa Nhân viên, Xử lý Business Rule BR-EMP-03 & Đổi Trạng thái Hoạt động
Giao diện **MUST** hỗ trợ chuyển đổi trạng thái hoạt động (`active` / `inactive`) thông qua API `PATCH /api/v1/employees/{id}/status` và hiển thị `NotificationModal` phản hồi kết quả tức thì.
Khi thực hiện xóa nhân viên:
1. Giao diện **MUST** mở `ConfirmModal` (`src/components/common/ConfirmModal.tsx`) với cảnh báo hành động không thể hoàn tác, yêu cầu người dùng xác nhận rõ ràng trước khi phát lệnh `DELETE`.
2. Nếu nhân viên **chưa có ca làm việc hoặc phiếu lương** $\rightarrow$ API xóa thành công, giao diện hiển thị `NotificationModal` loại `success` ("Xóa nhân viên thành công") và tự động làm mới danh sách.
3. Nếu nhân viên **đã phát sinh lịch ca (`EmployeeSchedule`) hoặc phiếu lương (`Payslip`)** $\rightarrow$ Backend trả về mã lỗi 400 kèm code `EMPLOYEE_HAS_WORK_HISTORY`. Giao diện **MUST** bắt lỗi này và hiển thị `NotificationModal` loại `error` với thông điệp giải thích rõ ràng và hướng dẫn người dùng chuyển trạng thái nhân viên sang "Ngừng làm việc" thay vì xóa, bảo toàn lịch sử chấm công và tính toàn vẹn dữ liệu.

#### Scenario: Bắt lỗi BR-EMP-03 khi cố gắng xóa nhân viên đã có dữ liệu làm việc
- **GIVEN** Người dùng chọn xóa một nhân viên đã từng tham gia ca làm việc hoặc có phiếu lương.
- **WHEN** Xác nhận trên `ConfirmModal` và Backend trả về HTTP 400 với `errorCode: "EMPLOYEE_HAS_WORK_HISTORY"`.
- **THEN** Giao diện kích hoạt `NotificationModal` tiêu đề "Không thể xóa nhân viên", nội dung nêu rõ nhân viên đã có lịch ca hoặc phiếu lương và gợi ý chuyển trạng thái sang "Ngừng làm việc".

---

### Requirement: REQ-FE-EMP-07 Popup Thông báo & Xác nhận Dùng chung Toàn hệ thống (Common Modals)
Hệ thống **MUST** cung cấp 2 component modal dùng chung trong `src/components/common/`:
- `ConfirmModal.tsx`: Hỗ trợ xác nhận các hành động nguy hiểm (Xóa, Hủy, Đổi trạng thái quan trọng) với các biến thể màu `danger` (đỏ), `warning` (cam), `primary` (xanh), nút Xác nhận và Hủy có trạng thái loading spinner.
- `NotificationModal.tsx`: Hỗ trợ hiển thị kết quả thao tác (`success`, `error`, `warning`, `info`) với icon trực quan, tự động đóng hoặc bấm nút "Đã hiểu".
Hai modal này được thiết kế theo chuẩn giao diện của phân hệ `product`, tái sử dụng toàn diện trên các trang Employee, Product và các phân hệ khác của MT-GRMS.

---

### Requirement: REQ-FE-EMP-08 Cấu hình Ca làm việc Đa chi nhánh Frontend (`ShiftConfig`)
Frontend **MUST** tích hợp module `shiftConfigApi.ts` tương thích với API Backend (`/api/v1/hr/shift-configs` và `/api/v1/shift-configs`), hỗ trợ:
- Tải danh sách cấu hình ca theo chi nhánh qua `getShiftConfigsByBranch`.
- Thêm mới (`CreateShiftConfigModal`), chỉnh sửa (`ShiftFormModal`) với khung giờ `startTime`/`endTime`, ca qua đêm `isCheckInNextDay` và chọn nhiều chi nhánh áp dụng `branchIds`.
- Cập nhật trạng thái bật/tắt ca qua `updateShiftConfigStatus` và xóa ca qua `deleteShiftConfig`.

---

### Requirement: REQ-FE-EMP-09 Lập lịch Làm việc Định kỳ & Tích hợp AddScheduleModal
Frontend **MUST** tích hợp modal lập lịch làm việc `AddScheduleModal.tsx` và API `scheduleApi.createRecurringSchedule`:
1. **Lọc ca làm việc theo chi nhánh:** Chỉ hiển thị các cấu hình ca khả dụng thuộc chi nhánh mà nhân viên hiện tại đang công tác (`branchId` và danh sách `branchIds`).
2. **Gợi ý nhân viên cùng chi nhánh:** Mục "Thêm lịch tương tự cho nhân viên khác" chỉ hiển thị các nhân viên làm việc cùng chi nhánh với nhân viên đang được xếp ca.
3. **Quy tắc ngày kết thúc:**
   - Khi không tích chọn "Có ngày kết thúc": Hệ thống gửi `hasEndDate: false, endDate: null`, giao diện hiển thị thông báo rõ ràng thời gian tạo lịch đến hết tháng hiện tại và tháng sau (`đến ngày DD/MM/YYYY`).
   - Khi tích chọn "Có ngày kết thúc": Hiển thị input date cho phép chọn ngày đến (không giới hạn 31 ngày), hiển thị thông báo tạo lịch đến ngày được chọn.
   - Giao diện **MUST NOT** hiển thị nhãn/text liên quan đến tự động gia hạn (đã loại bỏ).
4. **Chuẩn hóa mã ca:** `WorkShiftDefinition` bổ sung trường `code?: string` lấy từ `c.shiftCode`. Khi submit, modal gửi đúng `shiftCode` thay vì truyền Guid ID, tránh lỗi database `character varying(30)`.

#### Scenario: Xếp ca lặp không ngày kết thúc hiển thị đúng ngày hết tháng sau
- **GIVEN** Người dùng mở modal `AddScheduleModal` cho nhân viên chi nhánh Trung tâm vào tháng 11/2026.
- **WHEN** Chọn ca sáng, lặp Thứ 2 đến Thứ 6 và bỏ chọn "Có ngày kết thúc".
- **THEN** Giao diện hiển thị ghi chú: "Không kết thúc: Hệ thống sẽ tự động tạo lịch đến hết tháng hiện tại và tháng sau (đến ngày 31/12/2026)". Bấm lưu thành công, danh sách ca làm việc được nạp lại trên bảng lịch.

---

## Acceptance Checklist
- [x] REQ-FE-EMP-01: Module `employeeApi.ts` và `employeeMapper.ts` hoàn chỉnh, kiểm tra regex UUID để bảo toàn ID phụ cấp cho backend sync an toàn.
- [x] REQ-FE-EMP-02: `EmployeeListPage.tsx` nạp dữ liệu từ Backend API và tích hợp thanh `TablePagination` chung.
- [x] REQ-FE-EMP-03: `EmployeeFormModal.tsx` hỗ trợ chọn 1 chi nhánh làm việc, upload ảnh Cloudinary mượt mà, validate lỗi và hiển thị NotificationModal.
- [x] REQ-FE-EMP-04: `EmployeeDetailModal.tsx` gọi API nạp dữ liệu chi tiết thực tế, format ngày `DD/MM/YYYY`, optimistic pre-fill.
- [x] REQ-FE-EMP-05: Toàn bộ 16 modal trong phân hệ nhân viên được cố định kích thước đồng nhất `900px × 85vh`.
- [x] REQ-FE-EMP-06: Xóa nhân viên qua `ConfirmModal`, bắt lỗi `EMPLOYEE_HAS_WORK_HISTORY` (BR-EMP-03) hiển thị `NotificationModal` cảnh báo, toggle trạng thái `active/inactive` có popup phản hồi.
- [x] REQ-FE-EMP-07: Bộ modal dùng chung `ConfirmModal` và `NotificationModal` trong `src/components/common/` hoạt động ổn định trên toàn hệ thống.
- [x] REQ-FE-EMP-08: Quản lý danh mục ca `ShiftConfig` tích hợp `shiftConfigApi` hỗ trợ ca qua đêm và multi-branch.
- [x] REQ-FE-EMP-09: `AddScheduleModal.tsx` và `scheduleApi.ts` tích hợp API lịch lặp, lọc theo chi nhánh nhân viên, xử lý không ngày kết thúc đến hết tháng sau, bỏ giới hạn 31 ngày và map đúng `shiftCode`.
- [x] Kiểm thử: Build sạch 0 lỗi (`npm run build`) và unit test frontend pass 100% (106/106 tests).
