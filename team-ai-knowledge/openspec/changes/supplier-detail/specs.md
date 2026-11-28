# Specs: Màn hình Chi tiết Hồ sơ Nhà cung cấp, Chính sách Đổi trả & Sổ cái Công nợ AP (`supplier-detail`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/suppliers` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/suppliers/search-suggestions` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/suppliers/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/suppliers` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/suppliers/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/suppliers/{id:guid}/basic` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PATCH` | `/api/suppliers/{id:guid}/basic` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/suppliers/{id:guid}/bank` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/suppliers/{id:guid}/vat` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PATCH` | `/api/suppliers/{id:guid}/status` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-SUPP-DETA-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Hồ sơ Nhà cung cấp, Chính sách Đổi trả & Sổ cái Công nợ AP** (`/store-owner/suppliers/:id`, `/suppliers/:id`): Quản lý thông tin ngân hàng (`PUT .../bank`), hóa đơn VAT (`PUT .../vat`), cấu hình giao hàng & giờ Cut-off (`GET/PUT .../delivery-config`) và danh sách ngày nghỉ lễ `SupplierBlackoutDate`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-DETA-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-DETA-01.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `Supplier` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-DETA-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-DETA-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-DETA-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Hồ sơ Nhà cung cấp, Chính sách Đổi trả & Sổ cái Công nợ AP** (`/store-owner/suppliers/:id`, `/suppliers/:id`): Cấu hình chính sách đổi trả (`GET/PUT /api/suppliers/{id}/return-policy`) gồm loại lý do chấp nhận, số ngày cận hạn tối thiểu, thời hạn trả sau GRN, yêu cầu ảnh minh chứng và tỷ lệ chia sẻ chi phí đổi hàng.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-DETA-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-DETA-02.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `Supplier` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-DETA-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-DETA-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-DETA-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Hồ sơ Nhà cung cấp, Chính sách Đổi trả & Sổ cái Công nợ AP** (`/store-owner/suppliers/:id`, `/suppliers/:id`): Hiển thị tổng hợp nợ và sổ cái biến động AP (`GET /api/suppliers/{id}/ap/summary`, `GET .../ap/ledger`) với chiều tăng nợ (`+1` từ GRN mua chịu) và giảm nợ (`-1` từ phiếu thanh toán/bù trừ RTV).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-DETA-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-DETA-03.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `Supplier` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-DETA-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-DETA-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-DETA-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Hồ sơ Nhà cung cấp, Chính sách Đổi trả & Sổ cái Công nợ AP** (`/store-owner/suppliers/:id`, `/suppliers/:id`): Khi lập phiếu thanh toán công nợ (`POST /api/suppliers/{id}/ap/transactions`), hệ thống bắt buộc kiểm tra số tiền trả không vượt quá dư nợ hiện tại của hóa đơn/nhà cung cấp.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-DETA-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-DETA-04.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `Supplier` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-DETA-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-DETA-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-SUPP-DETA-01`: Quản lý thông tin ngân hàng (`PUT .../bank`), hóa đơn VAT (`PUT .../vat`), cấu hình giao hàng & giờ Cut-off (`...
- [x] `REQ-SUPP-DETA-02`: Cấu hình chính sách đổi trả (`GET/PUT /api/suppliers/{id}/return-policy`) gồm loại lý do chấp nhận, số ngày cậ...
- [x] `REQ-SUPP-DETA-03`: Hiển thị tổng hợp nợ và sổ cái biến động AP (`GET /api/suppliers/{id}/ap/summary`, `GET .../ap/ledger`) với ch...
- [x] `REQ-SUPP-DETA-04`: Khi lập phiếu thanh toán công nợ (`POST /api/suppliers/{id}/ap/transactions`), hệ thống bắt buộc kiểm tra số t...
