# Spec: hr-attendance

> Spec gốc (Living Source of Truth) của capability `hr-attendance`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-HR-ATTE-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chấm công Check-in / Check-out bằng AI FaceID & Bảng công Thực tế** (`/store-owner/employees/attendance`, `/employee/attendance`, `/employees/attendance`): Nạp danh sách đặc trưng khuôn mặt nhân viên có lịch trực trong ngày qua `GET /api/schedules/face-id/today-descriptors` và thực hiện chấm công vào/ra ca qua `POST /api/schedules/face-id/check-in` & `check-out`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-ATTE-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/attendance` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-ATTE-01.
- **THEN** Hệ thống xử lý thành công qua `SchedulesController`, cập nhật chính xác dữ liệu `EmployeeSchedule` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-ATTE-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-ATTE-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/attendance` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-ATTE-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chấm công Check-in / Check-out bằng AI FaceID & Bảng công Thực tế** (`/store-owner/employees/attendance`, `/employee/attendance`, `/employees/attendance`): Tự động tính toán trạng thái chấm công (`Đúng giờ`, `Đi muộn`, `Về sớm`, `Vắng mặt`) dựa trên giờ thực tế đối chiếu với `ShiftConfig` và chính sách chấm công của chi nhánh.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-ATTE-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/attendance` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-ATTE-02.
- **THEN** Hệ thống xử lý thành công qua `SchedulesController`, cập nhật chính xác dữ liệu `EmployeeSchedule` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-ATTE-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-ATTE-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/attendance` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-ATTE-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chấm công Check-in / Check-out bằng AI FaceID & Bảng công Thực tế** (`/store-owner/employees/attendance`, `/employee/attendance`, `/employees/attendance`): Sau khi nhân viên thu ngân Check-in thành công, hiển thị nút thao tác nhanh chuyển thẳng vào màn hình bán hàng `/pos`; nhân viên chỉ xem được dữ liệu công của chính mình ở cổng `/employee/attendance`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-ATTE-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/attendance` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-ATTE-03.
- **THEN** Hệ thống xử lý thành công qua `SchedulesController`, cập nhật chính xác dữ liệu `EmployeeSchedule` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-ATTE-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-ATTE-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/attendance` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-ATTE-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chấm công Check-in / Check-out bằng AI FaceID & Bảng công Thực tế** (`/store-owner/employees/attendance`, `/employee/attendance`, `/employees/attendance`): Cho phép Chủ cửa hàng xem chi tiết, hiệu chỉnh công thủ công có lưu vết (`PUT /api/schedules/{id}/attendance`) và cho phép nhân viên gửi phiếu giải trình sự cố chấm công ngay từ dòng ca.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-ATTE-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/attendance` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-ATTE-04.
- **THEN** Hệ thống xử lý thành công qua `SchedulesController`, cập nhật chính xác dữ liệu `EmployeeSchedule` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-ATTE-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-ATTE-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/attendance` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `hr-attendance (baseline AS-IS)` · +4 ~0 -0
