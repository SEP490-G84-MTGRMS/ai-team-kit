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
| DELETE | `/api/v1/employees/{id}` | Path param: `id` | `ApiResponse<object>` | 400, 404 |
| POST | `/api/v1/media/upload` | `FormData: file, folder` | `ApiResponse<{ url: string }>` | 400, 500 |

---

## ADDED Requirements

### Requirement: REQ-FE-EMP-01 Client API Module & Data Mapper
Hệ thống Frontend **MUST** cung cấp module `employeeApi.ts` đóng gói các phương thức gọi API qua `httpClient` và bộ mapper `employeeMapper.ts` chuẩn hóa dữ liệu giữa Backend DTOs và Frontend model `Employee`.
Mapper **MUST** giữ nguyên ID của các khoản phụ cấp khi chuyển đổi giữa DTO và Model để hỗ trợ thuật toán đồng bộ hóa (Sync & Diffing) của Backend.

#### Scenario: Chuyển đổi dữ liệu từ Backend DTO sang Frontend Employee
- **GIVEN** Dữ liệu `EmployeeBackendDetailDto` trả về từ Backend chứa `baseRate = 8500000`, `salaryType = "monthly"`, và danh sách `allowances` có `id = "guid-123"`.
- **WHEN** Chạy qua hàm `mapBackendDetailToEmployee`.
- **THEN** Kết quả trả về đối tượng `Employee` có đầy đủ thông tin lương, và phụ cấp giữ nguyên `id = "guid-123"`.

---

### Requirement: REQ-FE-EMP-02 Tải Danh sách Phân trang & Phân trang Chuẩn dùng chung
Trang `EmployeeListPage` **MUST** tải danh sách nhân viên từ Backend API `GET /api/v1/employees`, hỗ trợ tìm kiếm từ khóa có debounce, lọc theo chi nhánh, trạng thái.
Phân trang của bảng **MUST** tích hợp component phân trang dùng chung của dự án `TablePagination` (`src/components/common/TablePagination`), hỗ trợ chuyển trang, chọn kích thước trang (`10`, `20`, `50`) và nhảy trang trực tiếp.

#### Scenario: Tải danh sách thành công khi mở trang
- **GIVEN** Người dùng mở trang `/employees`.
- **WHEN** Component mount.
- **THEN** Hiển thị loading skeleton, sau đó render danh sách nhân viên trả về từ Backend kèm thanh điều hướng `TablePagination` chuẩn.

---

### Requirement: REQ-FE-EMP-03 Thêm mới và Chỉnh sửa Nhân viên (Chọn 1 Chi nhánh & Upload Ảnh Cloudinary)
Modal `EmployeeFormModal` **MUST** gửi request tạo mới (`POST`) hoặc cập nhật (`PUT`) đến Backend API và hiển thị thông báo lỗi cụ thể nếu vi phạm ràng buộc (409 Conflict).
Nhân viên **MUST** được phân bổ làm việc tại duy nhất một chi nhánh chính thông qua dropdown chọn đơn lẻ (kèm tính năng tìm kiếm nhanh và huy hiệu "Trụ sở").
Hệ thống **MUST** hỗ trợ tải ảnh đại diện nhân viên lên dịch vụ Cloudinary thông qua API backend `POST /api/v1/media/upload` (thư mục `mtgrms/employees`), kiểm tra kích thước file $\le 5\text{MB}$ và hiển thị trạng thái loading spinner trong khi upload.

#### Scenario: Chỉnh sửa thông tin nhân viên kèm ảnh đại diện Cloudinary
- **GIVEN** Người dùng mở form chỉnh sửa nhân viên, chọn ảnh đại diện từ máy tính.
- **WHEN** Ảnh được chọn, hệ thống tự động upload lên Cloudinary, nhận về URL ảnh an toàn `https://res.cloudinary.com/...` và hiển thị preview.
- **AND** Người dùng bấm **[Lưu thông tin]**.
- **THEN** Request `PUT /api/v1/employees/{id}` được gửi đi với đầy đủ thông tin kèm `avatarUrl`, cập nhật thành công lên server.

---

### Requirement: REQ-FE-EMP-04 Xem Chi tiết Hồ sơ 360 & Tải Thông tin Thực tế từ Backend
Modal `EmployeeDetailModal` **MUST** tự động gọi API `GET /api/v1/employees/{id}` khi mở để nạp dữ liệu thực tế và chính xác nhất từ cơ sở dữ liệu.
Hệ thống **MUST** áp dụng cơ chế hiển thị lạc quan (Optimistic Pre-fill) từ dữ liệu tóm tắt của bảng danh sách để tránh tình trạng chớp màn hình trắng, đồng thời hiển thị trạng thái `Đang đồng bộ từ hệ thống...` ở thanh tiêu đề.
Các trường dữ liệu như Ngày sinh, Ngày bắt đầu làm việc **MUST** được định dạng theo chuẩn Việt Nam `DD/MM/YYYY`. Nút **"Sửa thông tin"** trong modal chi tiết **MUST** truyền trực tiếp đối tượng đã được làm giàu sang form chỉnh sửa.

#### Scenario: Mở modal xem chi tiết nhân viên
- **GIVEN** Người dùng click vào một hàng nhân viên trên bảng.
- **WHEN** `EmployeeDetailModal` mở ra.
- **THEN** Modal hiển thị ngay thông tin cơ bản có sẵn, gọi ngầm API `GET /api/v1/employees/{id}`, cập nhật đầy đủ số CCCD, ngày sinh `DD/MM/YYYY`, ngân hàng, số tài khoản và bảng phụ cấp chi tiết.

---

### Requirement: REQ-FE-EMP-05 Chuẩn hóa Kích thước Toàn bộ Modal (Unified Modal Dimensions)
Toàn bộ các modal trong phân hệ nhân viên (16 modal và submodal bao gồm `EmployeeFormModal`, `EmployeeDetailModal`, `ShiftConfigModal`, `AddScheduleModal`, `ApprovalRequestsModal`, `AttendanceDetailModal`, `PayslipDetailModal`, `CreateUserModal`,...) **MUST** có kích thước cố định đồng nhất theo chuẩn `width: 900px` (kèm `max-width: 95vw`) và `height: 85vh` (kèm `max-height: 85vh`).
Header và Footer của modal **MUST** được cố định tại đỉnh và đáy khung hình (`flex-shrink: 0`), phần Body chiếm toàn bộ không gian còn lại (`flex: 1 1 auto`) và cuộn mượt mà khi nội dung dài.

---

### Requirement: REQ-FE-EMP-06 Cấp Tài khoản Identity, Đổi Trạng thái và Xóa Nhân viên
Giao diện **MUST** hỗ trợ cấp tài khoản đăng nhập cho nhân viên thông qua `CreateUserModal`, chuyển đổi trạng thái hoạt động (`active` / `inactive`), và xóa nhân viên có xác nhận an toàn.

---

## Acceptance Checklist
- [ ] REQ-FE-EMP-01: Module `employeeApi.ts` và `employeeMapper.ts` hoàn chỉnh, bảo toàn ID phụ cấp cho backend sync.
- [ ] REQ-FE-EMP-02: `EmployeeListPage.tsx` nạp dữ liệu từ Backend API và tích hợp thanh `TablePagination` chung.
- [ ] REQ-FE-EMP-03: `EmployeeFormModal.tsx` hỗ trợ chọn 1 chi nhánh làm việc, upload ảnh Cloudinary mượt mà và validate lỗi.
- [ ] REQ-FE-EMP-04: `EmployeeDetailModal.tsx` gọi API nạp dữ liệu chi tiết thực tế, format ngày `DD/MM/YYYY`, optimistic pre-fill.
- [ ] REQ-FE-EMP-05: Toàn bộ 16 modal trong phân hệ nhân viên được cố định kích thước đồng nhất `900px × 85vh`.
- [ ] REQ-FE-EMP-06: Cấp tài khoản Identity, toggle trạng thái và xóa nhân viên tích hợp API backend hoàn tất.
- [ ] Kiểm thử: Build và chạy toàn bộ unit tests PASS 100%.
