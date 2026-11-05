# Spec: employee

> Spec gốc của capability Quản lý Nhân sự & Lương (`employee`). Cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-EMP-01 Quản lý Hồ sơ Nhân viên & Cấp mã tuần tự (Multi-Tenancy)
Hệ thống **MUST** hỗ trợ tạo mới, tra cứu, chỉnh sửa thông tin hồ sơ nhân viên và xem chi tiết nhân viên theo từng Tenant (`TenantId`).
Hệ thống **MUST** tự động sinh mã nhân viên tuần tự theo định dạng `NV0001`, `NV0002`,... cho từng Tenant độc lập và ngăn chặn việc trùng lặp mã.
Hệ thống **MUST** kiểm tra tính duy nhất của Số CCCD/CMND và Số điện thoại trong cùng Tenant; từ chối và trả về lỗi `409 Conflict` nếu phát hiện trùng lặp.

#### Scenario: Tạo mới hồ sơ nhân viên thành công
- **GIVEN** Quản trị viên gửi yêu cầu tạo nhân viên với họ tên hợp lệ, CCCD `001202008888`, SĐT `0912345678` và chi nhánh làm việc.
- **WHEN** Gửi request `POST /api/v1/employees`.
- **THEN** Hệ thống sinh mã tuần tự tiếp theo (VD: `NV0003`), lưu vào cơ sở dữ liệu với `TenantId` hiện tại và trả về mã HTTP `201 Created` kèm dữ liệu nhân viên.

#### Scenario: Ngăn chặn trùng lặp số CCCD hoặc Số điện thoại
- **GIVEN** Một nhân viên đã tồn tại trong Tenant với CCCD `001202008888`.
- **WHEN** Quản trị viên cố gắng tạo nhân viên mới hoặc chỉnh sửa nhân viên khác với cùng số CCCD này.
- **THEN** Hệ thống từ chối lưu và trả về mã HTTP `409 Conflict` với thông điệp: `"Số CCCD đã tồn tại trong hệ thống. Vui lòng kiểm tra lại."`.

---

### Requirement: REQ-EMP-02 Phân bổ Chi nhánh & Đồng bộ Phụ cấp (Sync & Diffing)
Nhân viên **MUST** được phân bổ làm việc tại một chi nhánh chính thức (`BranchId` bắt buộc, liên kết tới bảng `Branches`).
Khi chỉnh sửa danh sách phụ cấp (`EmployeeAllowance`) của nhân viên, hệ thống **MUST** áp dụng thuật toán so sánh và đồng bộ hóa (Sync & Diffing) 3 chiều:
1. **Thêm mới (Insert)**: Các khoản phụ cấp chưa có Id hoặc `Id == null` / `Guid.Empty` $\rightarrow$ tạo mới bản ghi vào bảng `EmployeeAllowances`.
2. **Cập nhật (Update)**: Các khoản phụ cấp có `Id` khớp trong cả database và payload $\rightarrow$ giữ nguyên Id cũ, cập nhật `Name` và `Amount`.
3. **Xóa (Delete)**: Các khoản phụ cấp có trong database nhưng không còn trong payload gửi lên $\rightarrow$ xóa vĩnh viễn khỏi database qua `RemoveRange` mà không gây lỗi ngắt quan hệ (severed relationship).

#### Scenario: Đồng bộ danh sách phụ cấp khi cập nhật nhân viên
- **GIVEN** Nhân viên A đang có 2 khoản phụ cấp: Xăng xe (`Id = guid_1`, 500.000đ) và Ăn trưa (`Id = guid_2`, 600.000đ).
- **WHEN** Quản trị viên gửi request `PUT /api/v1/employees/{id}` với danh sách phụ cấp gồm: Ăn trưa (`Id = guid_2`, 650.000đ) và Điện thoại (không có Id, 200.000đ).
- **THEN** Hệ thống:
  - Cập nhật số tiền phụ cấp Ăn trưa lên 650.000đ và giữ nguyên `guid_2`.
  - Thêm mới bản ghi phụ cấp Điện thoại.
  - Xóa bỏ phụ cấp Xăng xe khỏi database.
  - Trả về HTTP `200 OK` với danh sách phụ cấp đã đồng bộ.

---

### Requirement: REQ-EMP-03 Cấp Tài khoản Identity cho Nhân viên & Phân quyền
Hệ thống **MUST** cho phép liên kết hoặc cấp mới tài khoản đăng nhập Identity cho nhân viên (`POST /api/v1/employees/{id}/identity-account`).
Mật khẩu khởi tạo **MUST** được mã hóa bằng chuẩn an toàn (BCrypt). Tài khoản được gán vai trò tương ứng (`CASHIER`, `STAFF`, `BRANCH_MANAGER`, `STORE_OWNER`) và liên kết vào `Employee.UserId`.

#### Scenario: Cấp tài khoản đăng nhập cho nhân viên thu ngân
- **GIVEN** Nhân viên chưa có tài khoản hệ thống (`UserId == null`).
- **WHEN** Gửi request cấp tài khoản với `Username = "cashier_hoa"`, `Password = "P@ssw0rd123"`, `Role = "CASHIER"`.
- **THEN** Hệ thống tạo bản ghi người dùng mới, gán `Employee.UserId = User.Id` và trả về thông tin tài khoản thành công.

---

### Requirement: REQ-EMP-04 Cấu hình Ca làm việc Đa chi nhánh & Chấm công Qua đêm
Hệ thống **MUST** cung cấp danh mục ca làm việc (`ShiftConfigs`), cho phép định nghĩa:
- Tên ca (`Name`), Khung giờ làm việc (`StartTime`, `EndTime`), Tổng giờ làm (`WorkHours`).
- Khung giờ cho phép chấm công (`CheckInStart`, `CheckInEnd`).
- Danh sách các chi nhánh áp dụng (`BranchIds` multi-branch JSONB).
- Hỗ trợ ca qua đêm hoặc giờ chấm công kết thúc vào ngày hôm sau (`IsNextDayCheckIn = true`).

#### Scenario: Tạo ca tối áp dụng cho nhiều chi nhánh
- **GIVEN** Ca "Tối" có giờ làm 17:00 - 21:00 (4h), giờ chấm công từ 14:00 đến 00:00 hôm sau.
- **AND** Phạm vi áp dụng chọn cả "Chi nhánh Trung tâm" và "Chi nhánh HCM".
- **WHEN** Gửi request `POST /api/v1/shift-configs`.
- **THEN** Hệ thống lưu cấu hình ca với `BranchIds` chứa ID của 2 chi nhánh, trả về mã HTTP `201 Created`.

---

### Requirement: REQ-EMP-05 Lập lịch & Ban hành Ca làm việc
Hệ thống **MUST** cho phép phân ca làm việc theo tuần/tháng cho nhân viên chi nhánh (`POST /api/v1/schedules/batch`) và **MUST** kiểm tra ngăn chặn xung đột thời gian ca của cùng một nhân viên trong ngày.
Hệ thống **MUST** hỗ trợ chuyển trạng thái từ `draft` sang `scheduled` khi ban hành lịch (`POST /api/v1/schedules/publish`).

#### Scenario: Ngăn chặn xếp lịch trùng thời gian cho nhân viên
- **GIVEN** Nhân viên đã được xếp ca Sáng (06:00 - 14:00) ngày 10/11/2026.
- **WHEN** Quản lý cố gắng xếp thêm ca Chiều sớm (12:00 - 18:00) cho nhân viên đó trong cùng ngày.
- **THEN** Hệ thống từ chối và trả về mã lỗi HTTP `400 Bad Request` cảnh báo xung đột lịch ca.

---

### Requirement: REQ-EMP-06 Chấm công số với Xác thực GPS Geofencing
Hệ thống **MUST** xác thực tọa độ GPS của thiết bị khi nhân viên thực hiện Check-in / Check-out so với tọa độ chi nhánh làm việc theo công thức Haversine.
- Nếu khoảng cách $\le$ bán kính cho phép (mặc định 100m): ghi nhận `IsGpsValid = true`.
- Nếu khoảng cách $>$ bán kính cho phép: ghi nhận `IsGpsValid = false` và đánh dấu cần quản lý duyệt giải trình.
Hệ thống **MUST** tự động tính số phút đi muộn (`LateMinutes`) và tổng số giờ công thực tế (`ActualWorkHours`).

#### Scenario: Nhân viên Check-in thành công tại chi nhánh
- **GIVEN** Nhân viên có ca từ 08:00 đến 17:00, vị trí GPS cách chi nhánh 20m.
- **WHEN** Gửi `POST /api/v1/attendance/check-in` lúc 08:05.
- **THEN** Hệ thống ghi nhận `CheckInTime = UtcNow`, `IsGpsValid = true`, tính `LateMinutes = 5` và chuyển ca sang `in_progress`.

---

### Requirement: REQ-EMP-07 Đóng ca POS, Đối soát 9 Mệnh giá & Tự động sinh Phiếu thu Sổ quỹ
Hệ thống **MUST** quản lý chu trình phiên ca thu ngân POS. Khi đóng ca, nhân viên **MUST** khai báo số lượng 9 mệnh giá tiền mặt.
Nếu có chênh lệch thừa/thiếu tiền mặt so với lý thuyết, nhân viên **MUST** nhập lý do giải trình theo quy tắc `GBR-POS-04`.
Khi chủ cửa hàng duyệt ca (`POST /api/v1/cashier-shifts/{id}/audit-approve`), hệ thống **MUST** tự động sinh Phiếu thu tiền mặt vào Sổ quỹ (`Cashbooks` type `INCOME`).

---

### Requirement: REQ-EMP-08 Động cơ Tính lương (Payroll Engine) & Chi trả Lương Tích hợp Sổ quỹ
Hệ thống **MUST** cung cấp động cơ tính lương tự động quét ngày công hoàn thành trong tháng, tính toán:
$$\text{Lương thực nhận} = \text{Lương cơ bản} + \text{Làm ngoài giờ (OT)} + \text{Tổng phụ cấp} + \text{Thưởng} - \text{Phạt đi trễ} - \text{Tạm ứng}$$
Khi thực hiện chi trả lương (`POST /api/v1/payroll/payslips/{id}/pay`), hệ thống **MUST** tự động sinh Phiếu chi lương vào Sổ quỹ (`Cashbooks` type `EXPENSE`).

---

### Requirement: REQ-EMP-09 Giao diện Người dùng (UI): Chuẩn hóa Modal, Phân trang & Upload Cloudinary
1. **Chuẩn hóa Kích thước Modal**: Toàn bộ các popup modal trong phân hệ nhân sự (16 modal) **MUST** có kích thước cố định đồng nhất `900px` (width) $\times$ `85vh` (height), Header và Footer cố định, Body cuộn mượt mà.
2. **Tải Chi tiết Thực tế & Optimistic Pre-fill**: Modal xem chi tiết nhân viên (`EmployeeDetailModal`) **MUST** tự động gọi API `GET /api/v1/employees/{id}`, hiển thị dữ liệu có sẵn ngay tức thì để tránh chớp trắng màn hình, format ngày sinh/ngày làm theo chuẩn `DD/MM/YYYY`.
3. **Phân trang dùng chung**: Trang danh sách nhân viên **MUST** tích hợp component `TablePagination` chung của hệ thống.
4. **Tải ảnh Cloudinary**: Form nhân viên **MUST** tích hợp upload ảnh trực tiếp lên Cloudinary thông qua API Backend `POST /api/v1/media/upload`, hiển thị loading spinner và validate dung lượng $\le 5\text{MB}$.
