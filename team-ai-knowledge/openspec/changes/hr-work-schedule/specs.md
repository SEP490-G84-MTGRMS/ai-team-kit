# Specs: Màn hình Xếp lịch Phân ca Nhân viên Định kỳ & Kiểm soát Xung đột Ca (`hr-work-schedule`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/schedules` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/schedules/my-schedule` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/schedules/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/schedules` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/schedules/batch` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/schedules/recurring` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/schedules/recurring-series` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/schedules/recurring-sync` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/schedules/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `DELETE` | `/api/schedules/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-HR-WORK-SCHE-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Xếp lịch Phân ca Nhân viên Định kỳ & Kiểm soát Xung đột Ca** (`/store-owner/employees/schedule`, `/employees/schedule`): Tạo lịch phân ca lẻ, hàng loạt hoặc định kỳ theo thứ trong tuần qua `POST /api/schedules`, `POST .../batch` và `POST .../recurring`, đồng bộ chuỗi lịch lặp qua `PUT .../recurring-sync`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-WORK-SCHE-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees/schedule` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-WORK-SCHE-01.
- **THEN** Hệ thống xử lý thành công qua `SchedulesController`, cập nhật chính xác dữ liệu `EmployeeSchedule` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-WORK-SCHE-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-WORK-SCHE-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/schedule` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-WORK-SCHE-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Xếp lịch Phân ca Nhân viên Định kỳ & Kiểm soát Xung đột Ca** (`/store-owner/employees/schedule`, `/employees/schedule`): Kiểm tra nghiêm ngặt các ràng buộc nghiệp vụ trước khi lưu: nhân viên đang `Active`, ngày làm `>= StartDate`, không trùng lắp khung giờ ca trong ngày và không vượt quá tổng giờ làm tối đa/ngày.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-WORK-SCHE-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees/schedule` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-WORK-SCHE-02.
- **THEN** Hệ thống xử lý thành công qua `SchedulesController`, cập nhật chính xác dữ liệu `EmployeeSchedule` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-WORK-SCHE-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-WORK-SCHE-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/schedule` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-WORK-SCHE-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Xếp lịch Phân ca Nhân viên Định kỳ & Kiểm soát Xung đột Ca** (`/store-owner/employees/schedule`, `/employees/schedule`): Chặn thêm/sửa/xóa lịch làm việc nằm trong kỳ lương đã chi trả (`Paid Payslip Locked`) và chặn xóa các ca đang ở trạng thái nghỉ phép đã duyệt.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-WORK-SCHE-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees/schedule` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-WORK-SCHE-03.
- **THEN** Hệ thống xử lý thành công qua `SchedulesController`, cập nhật chính xác dữ liệu `EmployeeSchedule` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-WORK-SCHE-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-WORK-SCHE-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/schedule` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-WORK-SCHE-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Xếp lịch Phân ca Nhân viên Định kỳ & Kiểm soát Xung đột Ca** (`/store-owner/employees/schedule`, `/employees/schedule`): Hỗ trợ công bố lịch làm việc (`POST /api/schedules/publish`) để gửi thông báo cho nhân viên và liên kết trực tiếp với kiểm tra ca trực thu ngân tại POS.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-WORK-SCHE-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees/schedule` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-WORK-SCHE-04.
- **THEN** Hệ thống xử lý thành công qua `SchedulesController`, cập nhật chính xác dữ liệu `EmployeeSchedule` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-WORK-SCHE-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-WORK-SCHE-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/schedule` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-HR-WORK-SCHE-01`: Tạo lịch phân ca lẻ, hàng loạt hoặc định kỳ theo thứ trong tuần qua `POST /api/schedules`, `POST .../batch` và...
- [x] `REQ-HR-WORK-SCHE-02`: Kiểm tra nghiêm ngặt các ràng buộc nghiệp vụ trước khi lưu: nhân viên đang `Active`, ngày làm `>= StartDate`, ...
- [x] `REQ-HR-WORK-SCHE-03`: Chặn thêm/sửa/xóa lịch làm việc nằm trong kỳ lương đã chi trả (`Paid Payslip Locked`) và chặn xóa các ca đang ...
- [x] `REQ-HR-WORK-SCHE-04`: Hỗ trợ công bố lịch làm việc (`POST /api/schedules/publish`) để gửi thông báo cho nhân viên và liên kết trực t...
