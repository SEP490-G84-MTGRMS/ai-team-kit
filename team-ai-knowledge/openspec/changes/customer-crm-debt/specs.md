# Specs: Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ (`customer-crm-debt`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/customers` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/customers/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/customers` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/customers/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/customers/debts/summary` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/customers/debt/repay` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/customers/debt/profile/{customerId:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/customers/debt/ledger/{customerId:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-CUST-CRM-DEBT-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ** (`/store-owner/customers`, `/customers`): Quản lý danh sách và tổng hợp nợ khách hàng qua `GET/POST/PUT /api/customers` và `GET /api/customers/debts/summary` kèm xuất báo cáo ra tệp CSV/Excel.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CUST-CRM-DEBT-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/customers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CUST-CRM-DEBT-01.
- **THEN** Hệ thống xử lý thành công qua `CustomersController`, cập nhật chính xác dữ liệu `Customer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CUST-CRM-DEBT-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CUST-CRM-DEBT-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/customers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-CUST-CRM-DEBT-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ** (`/store-owner/customers`, `/customers`): Phân quyền chặt chẽ: chỉ `STORE_OWNER` được phép nâng/sửa hạn mức công nợ tối đa (`DebtLimit`) của khách hàng; thu ngân POS bị chặn bán chịu nếu tổng dư nợ vượt hạn mức này.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CUST-CRM-DEBT-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/customers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CUST-CRM-DEBT-02.
- **THEN** Hệ thống xử lý thành công qua `CustomersController`, cập nhật chính xác dữ liệu `Customer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CUST-CRM-DEBT-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CUST-CRM-DEBT-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/customers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-CUST-CRM-DEBT-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ** (`/store-owner/customers`, `/customers`): Xem chi tiết lịch sử mua nợ và trả nợ của từng khách trên `CustomerDebtLedgerDrawer` (`GET /api/customers/debt/ledger/{customerId}`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CUST-CRM-DEBT-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/customers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CUST-CRM-DEBT-03.
- **THEN** Hệ thống xử lý thành công qua `CustomersController`, cập nhật chính xác dữ liệu `Customer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CUST-CRM-DEBT-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CUST-CRM-DEBT-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/customers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-CUST-CRM-DEBT-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Khách hàng CRM, Hạn mức Công nợ Phải thu (AR) & Thu nợ** (`/store-owner/customers`, `/customers`): Khi lập phiếu thu nợ khách hàng (`POST /api/customers/debt/repay` qua `DebtCollectionModal`), hệ thống giảm dư nợ AR của khách và tự động ghi nhận bút toán phiếu thu tương ứng vào Sổ quỹ Tiền mặt/Ngân hàng.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-CUST-CRM-DEBT-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/customers` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-CUST-CRM-DEBT-04.
- **THEN** Hệ thống xử lý thành công qua `CustomersController`, cập nhật chính xác dữ liệu `Customer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-CUST-CRM-DEBT-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-CUST-CRM-DEBT-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/customers` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-CUST-CRM-DEBT-01`: Quản lý danh sách và tổng hợp nợ khách hàng qua `GET/POST/PUT /api/customers` và `GET /api/customers/debts/sum...
- [x] `REQ-CUST-CRM-DEBT-02`: Phân quyền chặt chẽ: chỉ `STORE_OWNER` được phép nâng/sửa hạn mức công nợ tối đa (`DebtLimit`) của khách hàng;...
- [x] `REQ-CUST-CRM-DEBT-03`: Xem chi tiết lịch sử mua nợ và trả nợ của từng khách trên `CustomerDebtLedgerDrawer` (`GET /api/customers/debt...
- [x] `REQ-CUST-CRM-DEBT-04`: Khi lập phiếu thu nợ khách hàng (`POST /api/customers/debt/repay` qua `DebtCollectionModal`), hệ thống giảm dư...
