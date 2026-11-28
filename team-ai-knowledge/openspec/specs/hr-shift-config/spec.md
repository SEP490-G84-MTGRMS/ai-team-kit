# Spec: hr-shift-config

> Spec gốc (Living Source of Truth) của capability `hr-shift-config`. Tự động tổng hợp từ delta `specs.md` của các change khi `/sep-archive`.

## Requirements

### Requirement: REQ-HR-SHIF-CONF-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Ca làm việc Mẫu & Chính sách Chấm công Chi nhánh** (`/store-owner/employees/shifts`, `/employees/shifts`): Quản lý CRUD khung ca làm việc qua `GET/POST/PUT/DELETE /api/shift-configs`; kiểm tra giờ bắt đầu và kết thúc không trùng nhau (thời lượng ca `> 0` phút) và hỗ trợ ca qua ngày hôm sau.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-SHIF-CONF-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees/shifts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-SHIF-CONF-01.
- **THEN** Hệ thống xử lý thành công qua `ShiftConfigsController`, cập nhật chính xác dữ liệu `ShiftConfig` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-SHIF-CONF-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-SHIF-CONF-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/shifts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-SHIF-CONF-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Ca làm việc Mẫu & Chính sách Chấm công Chi nhánh** (`/store-owner/employees/shifts`, `/employees/shifts`): Kiểm tra chống trùng tên ca làm việc trong cùng phạm vi chi nhánh (so sánh chuẩn hóa không phân biệt chữ HOA/thường và dấu tiếng Việt).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-SHIF-CONF-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees/shifts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-SHIF-CONF-02.
- **THEN** Hệ thống xử lý thành công qua `ShiftConfigsController`, cập nhật chính xác dữ liệu `ShiftConfig` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-SHIF-CONF-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-SHIF-CONF-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/shifts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-SHIF-CONF-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Ca làm việc Mẫu & Chính sách Chấm công Chi nhánh** (`/store-owner/employees/shifts`, `/employees/shifts`): Thiết lập chính sách chấm công riêng cho từng chi nhánh qua `GET/PUT /api/attendance-policies/branch/{branchId}` và hỗ trợ sao chép nhanh chính sách sang các chi nhánh khác (`POST /api/attendance-policies/copy`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-SHIF-CONF-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees/shifts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-SHIF-CONF-03.
- **THEN** Hệ thống xử lý thành công qua `ShiftConfigsController`, cập nhật chính xác dữ liệu `ShiftConfig` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-SHIF-CONF-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-SHIF-CONF-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/shifts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-SHIF-CONF-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Cấu hình Ca làm việc Mẫu & Chính sách Chấm công Chi nhánh** (`/store-owner/employees/shifts`, `/employees/shifts`): Cho phép tạm ngưng ca mẫu (`PATCH /api/shift-configs/{id}/status`) và chặn xóa vật lý ca mẫu đã được sử dụng trong lịch phân ca nhân viên.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-SHIF-CONF-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/employees/shifts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-SHIF-CONF-04.
- **THEN** Hệ thống xử lý thành công qua `ShiftConfigsController`, cập nhật chính xác dữ liệu `ShiftConfig` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-SHIF-CONF-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-SHIF-CONF-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/shifts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Lịch sử
- 2026-11-28 · `hr-shift-config (baseline AS-IS)` · +4 ~0 -0
