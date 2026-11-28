# Specs: Màn hình Quản lý Bảng lương, Tính lương Tự động, Ứng lương & Chi trả Phiếu lương (`hr-payroll`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/payslips` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/payslips/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/payslips/generate-batch` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/payslips/recalculate` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/payslips/{id:guid}/advance` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/payslips/{id:guid}/pay` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/payslips/batch-pay` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `DELETE` | `/api/payslips/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-HR-PAYR-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Bảng lương, Tính lương Tự động, Ứng lương & Chi trả Phiếu lương** (`/store-owner/employees/payroll`, `/employee/payroll`, `/employees/payroll`): Khởi tạo bảng lương kỳ tháng cho các nhân viên có ca làm việc qua `POST /api/payslips/generate-batch` và hỗ trợ tính toán lại công thực tế qua `POST /api/payslips/recalculate` đối với các phiếu chưa thanh toán.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-PAYR-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/payroll` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-PAYR-01.
- **THEN** Hệ thống xử lý thành công qua `PayslipsController`, cập nhật chính xác dữ liệu `Payslip` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-PAYR-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-PAYR-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/payroll` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-PAYR-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Bảng lương, Tính lương Tự động, Ứng lương & Chi trả Phiếu lương** (`/store-owner/employees/payroll`, `/employee/payroll`, `/employees/payroll`): Hỗ trợ ghi nhận khoản tạm ứng lương trong kỳ (`POST /api/payslips/{id}/advance`) tự động giảm trừ vào thực lĩnh cuối kỳ.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-PAYR-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/payroll` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-PAYR-02.
- **THEN** Hệ thống xử lý thành công qua `PayslipsController`, cập nhật chính xác dữ liệu `Payslip` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-PAYR-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-PAYR-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/payroll` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-PAYR-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Bảng lương, Tính lương Tự động, Ứng lương & Chi trả Phiếu lương** (`/store-owner/employees/payroll`, `/employee/payroll`, `/employees/payroll`): Cho phép chi trả từng phiếu (`POST /api/payslips/{id}/pay`) hoặc tích chọn nhiều phiếu chưa thanh toán để chi trả hàng loạt (`POST /api/payslips/batch-pay`), khóa cứng không cho sửa công của kỳ lương đã chi trả.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-PAYR-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/payroll` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-PAYR-03.
- **THEN** Hệ thống xử lý thành công qua `PayslipsController`, cập nhật chính xác dữ liệu `Payslip` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-PAYR-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-PAYR-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/payroll` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-HR-PAYR-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Bảng lương, Tính lương Tự động, Ứng lương & Chi trả Phiếu lương** (`/store-owner/employees/payroll`, `/employee/payroll`, `/employees/payroll`): Đảm bảo phân quyền dữ liệu: tại `/employee/payroll`, nhân viên chỉ được xem phiếu lương chi tiết của chính mình và nhận thông báo ngay khi lương được chốt/chi trả.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-HR-PAYR-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/employees/payroll` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-HR-PAYR-04.
- **THEN** Hệ thống xử lý thành công qua `PayslipsController`, cập nhật chính xác dữ liệu `Payslip` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-HR-PAYR-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-HR-PAYR-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/employees/payroll` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-HR-PAYR-01`: Khởi tạo bảng lương kỳ tháng cho các nhân viên có ca làm việc qua `POST /api/payslips/generate-batch` và hỗ tr...
- [x] `REQ-HR-PAYR-02`: Hỗ trợ ghi nhận khoản tạm ứng lương trong kỳ (`POST /api/payslips/{id}/advance`) tự động giảm trừ vào thực lĩn...
- [x] `REQ-HR-PAYR-03`: Cho phép chi trả từng phiếu (`POST /api/payslips/{id}/pay`) hoặc tích chọn nhiều phiếu chưa thanh toán để chi ...
- [x] `REQ-HR-PAYR-04`: Đảm bảo phân quyền dữ liệu: tại `/employee/payroll`, nhân viên chỉ được xem phiếu lương chi tiết của chính mìn...
