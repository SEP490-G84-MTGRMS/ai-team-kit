# Specs: Màn hình Quản lý Ca làm POS, Bàn giao Z-Report & Khóa sổ Doanh thu Ngày (`pos-shift-management`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `POST` | `/api/pos/shifts/open` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/pos/shifts/current` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/pos/shifts/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/pos/shifts/{id:guid}/cash-movements` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/pos/shifts/{id:guid}/close` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/pos/shifts/{id:guid}/confirm-handover` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/pos/shifts/{id:guid}/z-report` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/pos/shifts/history` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/pos/shifts/api/pos/cash-movements/{id:guid}/approve` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/pos/shifts/api/pos/cash-movements/{id:guid}/reject` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-POS-SHIF-MANA-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Ca làm POS, Bàn giao Z-Report & Khóa sổ Doanh thu Ngày** (`/store-owner/shifts`, `/shifts`): Quản lý vòng đời ca thu ngân qua `ShiftsController`: Mở ca (`open`), nhập tiền thực đếm (`counted-cash`), chốt ca sinh báo cáo `Z-Report`, xác nhận bàn giao (`confirm-handover`) và cho phép Store Owner buộc đóng ca treo kèm lý do (`force-close`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-SHIF-MANA-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/shifts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-SHIF-MANA-01.
- **THEN** Hệ thống xử lý thành công qua `ShiftsController`, cập nhật chính xác dữ liệu `ShiftZReport` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-SHIF-MANA-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-SHIF-MANA-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/shifts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-SHIF-MANA-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Ca làm POS, Bàn giao Z-Report & Khóa sổ Doanh thu Ngày** (`/store-owner/shifts`, `/shifts`): Hiển thị số liệu tạm tính cuối ngày từ `GET /api/business-days/preview` và chặn khóa sổ ngày (`POST /api/business-days/close`) nếu trong ngày còn ca đang mở hoặc còn giao dịch treo chưa xử lý.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-SHIF-MANA-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/shifts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-SHIF-MANA-02.
- **THEN** Hệ thống xử lý thành công qua `ShiftsController`, cập nhật chính xác dữ liệu `ShiftZReport` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-SHIF-MANA-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-SHIF-MANA-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/shifts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-SHIF-MANA-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Ca làm POS, Bàn giao Z-Report & Khóa sổ Doanh thu Ngày** (`/store-owner/shifts`, `/shifts`): Khi khóa sổ ngày kinh doanh thành công, hệ thống kết chuyển chính thức doanh thu ca và các đơn bán riêng của Chủ cửa hàng vào Sổ quỹ (`CashbookEntry`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-SHIF-MANA-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/shifts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-SHIF-MANA-03.
- **THEN** Hệ thống xử lý thành công qua `ShiftsController`, cập nhật chính xác dữ liệu `ShiftZReport` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-SHIF-MANA-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-SHIF-MANA-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/shifts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-POS-SHIF-MANA-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Ca làm POS, Bàn giao Z-Report & Khóa sổ Doanh thu Ngày** (`/store-owner/shifts`, `/shifts`): Hỗ trợ xem lịch sử khóa sổ ngày (`GET /api/business-days/{branchId}/{businessDate}/history`) và mở lại sổ ngày khi có phân quyền của Store Owner (`POST .../reopen`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-POS-SHIF-MANA-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/shifts` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-POS-SHIF-MANA-04.
- **THEN** Hệ thống xử lý thành công qua `ShiftsController`, cập nhật chính xác dữ liệu `ShiftZReport` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-POS-SHIF-MANA-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-POS-SHIF-MANA-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/shifts` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-POS-SHIF-MANA-01`: Quản lý vòng đời ca thu ngân qua `ShiftsController`: Mở ca (`open`), nhập tiền thực đếm (`counted-cash`), chốt...
- [x] `REQ-POS-SHIF-MANA-02`: Hiển thị số liệu tạm tính cuối ngày từ `GET /api/business-days/preview` và chặn khóa sổ ngày (`POST /api/busin...
- [x] `REQ-POS-SHIF-MANA-03`: Khi khóa sổ ngày kinh doanh thành công, hệ thống kết chuyển chính thức doanh thu ca và các đơn bán riêng của C...
- [x] `REQ-POS-SHIF-MANA-04`: Hỗ trợ xem lịch sử khóa sổ ngày (`GET /api/business-days/{branchId}/{businessDate}/history`) và mở lại sổ ngày...
