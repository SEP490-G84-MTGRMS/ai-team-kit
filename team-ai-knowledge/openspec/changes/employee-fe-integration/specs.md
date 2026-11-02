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

---

## ADDED Requirements

### Requirement: REQ-FE-EMP-01 Client API Module & Data Mapper
Hệ thống Frontend **MUST** cung cấp module `employeeApi.ts` đóng gói các phương thức gọi API qua `httpClient` và bộ mapper `employeeMapper.ts` chuẩn hóa dữ liệu giữa Backend DTOs và Frontend model `Employee`.

#### Scenario: Chuyển đổi dữ liệu từ Backend DTO sang Frontend Employee
- **GIVEN** Dữ liệu `EmployeeBackendSummaryDto` trả về từ Backend chứa `baseRate = 8500000`, `salaryType = "monthly"`, `branchName = "Chi nhánh Quận 1"`.
- **WHEN** Chạy qua hàm `mapBackendSummaryToEmployee`.
- **THEN** Kết quả trả về đối tượng `Employee` có `salaryConfig.baseSalary = 8500000`, `salaryConfig.salaryType = "monthly"`, và `workingBranchNames` chứa "Chi nhánh Quận 1".

---

### Requirement: REQ-FE-EMP-02 Tải Danh sách Phân trang & Tìm kiếm Server-side
Trang `EmployeeListPage` **MUST** tải danh sách nhân viên từ Backend API `GET /api/v1/employees`, hỗ trợ tìm kiếm từ khóa có debounce, lọc theo chi nhánh, trạng thái và hiển thị phân trang từ server.

#### Scenario: Tải danh sách thành công khi mở trang
- **GIVEN** Người dùng mở trang `/employees`.
- **WHEN** Component mount.
- **THEN** Hiển thị loading skeleton, sau đó render danh sách nhân viên trả về từ Backend kèm phân trang (tổng số nhân viên, trang hiện tại).

#### Scenario: Danh sách rỗng khi bộ lọc không có kết quả
- **GIVEN** Người dùng tìm kiếm từ khóa "KhongCoNhanVienNay123".
- **WHEN** API trả về `items: []`, `totalItems: 0`.
- **THEN** Bảng ẩn các hàng dữ liệu và hiển thị Empty State: "Không tìm thấy nhân viên nào phù hợp."

---

### Requirement: REQ-FE-EMP-03 Thêm mới và Chỉnh sửa Nhân viên
Modal `EmployeeFormModal` **MUST** gửi request tạo mới (`POST`) hoặc cập nhật (`PUT`) đến Backend API và hiển thị thông báo lỗi cụ thể nếu vi phạm ràng buộc (409 Conflict).

#### Scenario: Thêm mới nhân viên thành công
- **GIVEN** Người dùng mở `EmployeeFormModal`, nhập đầy đủ họ tên, CCCD hợp lệ, SĐT và chọn chi nhánh.
- **WHEN** Người dùng bấm **[Lưu thông tin]**.
- **THEN** Nút lưu hiển thị trạng thái loading, request `POST /api/v1/employees` được gửi đi, sau khi thành công (201 Created) modal đóng lại, hiển thị toast thành công và danh sách tự động cập nhật bản ghi mới với mã tự sinh `NVxxxx`.

#### Scenario: Báo lỗi khi trùng lặp CCCD hoặc Số điện thoại
- **GIVEN** Người dùng nhập CCCD hoặc SĐT đã tồn tại trên hệ thống.
- **WHEN** Bấm **[Lưu thông tin]** và Backend trả về HTTP 409 Conflict kèm message chi tiết.
- **THEN** Modal không được đóng, hiển thị Alert banner màu đỏ cảnh báo lỗi trực tiếp bên trong form để người dùng sửa đổi.

---

### Requirement: REQ-FE-EMP-04 Cấp Tài khoản Đăng nhập Identity cho Nhân viên
Modal `CreateUserModal` **MUST** cho phép cấp tài khoản đăng nhập cho nhân viên thông qua API `POST /api/v1/employees/{id}/identity-account` và hiển thị phản hồi tức thì.

#### Scenario: Cấp tài khoản đăng nhập thành công
- **GIVEN** Nhân viên chưa có tài khoản hệ thống (`userId == null`).
- **WHEN** Người dùng mở `CreateUserModal`, nhập username, mật khẩu, chọn vai trò và bấm **[Cấp tài khoản]**.
- **THEN** Request gửi đến Backend thành công, modal đóng lại, hiển thị toast thành công, và badge tài khoản của nhân viên được cập nhật hiển thị Username vừa tạo.

#### Scenario: Báo lỗi khi Username đã tồn tại
- **GIVEN** Người dùng nhập Username đã có tài khoản khác sử dụng.
- **WHEN** Backend trả về HTTP 409 Conflict với mã `DUPLICATE_USERNAME`.
- **THEN** Hiển thị thông báo lỗi ngay dưới ô nhập Username yêu cầu chọn tên đăng nhập khác.

---

### Requirement: REQ-FE-EMP-05 Đổi Trạng thái Hoạt động và Xóa Nhân viên
Giao diện **MUST** hỗ trợ chuyển đổi trạng thái (`active` / `inactive`) qua `PATCH /api/v1/employees/{id}/status` và xóa nhân viên qua `DELETE /api/v1/employees/{id}`.

#### Scenario: Chuyển đổi trạng thái nhân viên
- **GIVEN** Nhân viên đang ở trạng thái `active`.
- **WHEN** Người dùng gạt toggle sang `inactive`.
- **THEN** Hệ thống gửi `PATCH /api/v1/employees/{id}/status` với `{ status: "inactive" }`, cập nhật giao diện thành công và hiển thị toast thông báo.

#### Scenario: Xóa nhân viên có xác nhận
- **GIVEN** Người dùng bấm nút xóa nhân viên trên bảng.
- **WHEN** Hộp thoại xác nhận hiện ra và người dùng chọn **[Đồng ý xóa]**.
- **THEN** Hệ thống gửi `DELETE /api/v1/employees/{id}`, sau khi thành công nhân viên biến mất khỏi bảng và hiển thị toast xác nhận.

---

## Acceptance Checklist
- [ ] REQ-FE-EMP-01: Cung cấp `employeeApi.ts` và `employeeMapper.ts` hoàn chỉnh, chuyển đổi 2 chiều chính xác.
- [ ] REQ-FE-EMP-02: `EmployeeListPage.tsx` nạp 100% dữ liệu từ Backend API, hỗ trợ phân trang, tìm kiếm debounce và lọc chi nhánh/trạng thái.
- [ ] REQ-FE-EMP-03: Thêm mới / Chỉnh sửa nhân viên gọi đúng API Backend, xử lý hiển thị lỗi 409 Conflict khi trùng CCCD/SĐT.
- [ ] REQ-FE-EMP-04: Cấp tài khoản Identity thành công qua `CreateUserModal` và cập nhật thông tin tài khoản nhân viên.
- [ ] REQ-FE-EMP-05: Chuyển đổi trạng thái và Xóa nhân viên hoạt động với Backend API.
- [ ] Kiểm thử: Viết unit tests cho `employeeApi` và đảm bảo `npm run build` thành công không có lỗi.
