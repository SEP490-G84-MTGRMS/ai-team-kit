# Specs: Màn hình Chi tiết Duyệt Phản hồi NCC, Sinh PO Đổi hàng & Bàn giao RTV (`supplier-return-detail`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/supplier-returns` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/supplier-returns/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/supplier-returns/eligible-grns` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/supplier-returns/grn-lines/{grnId:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/supplier-returns` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/supplier-returns/{id:guid}/submit` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/supplier-returns/{id:guid}/supplier-response` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/supplier-returns/{id:guid}/complete-handover` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/supplier-returns/{id:guid}/cancel` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/supplier-returns/{id:guid}/exchange-purchase-orders` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-SUPP-RETU-DETA-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Duyệt Phản hồi NCC, Sinh PO Đổi hàng & Bàn giao RTV** (`/store-owner/supplier-returns/:id`): Gửi yêu cầu trả hàng qua `POST /api/supplier-returns/{id}/submit` và ghi nhận kết quả chấp thuận/từ chối của NCC qua `POST .../supplier-response` (`RecordSupplierResponseModal`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-DETA-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/supplier-returns/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-DETA-01.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-DETA-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-DETA-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-RETU-DETA-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Duyệt Phản hồi NCC, Sinh PO Đổi hàng & Bàn giao RTV** (`/store-owner/supplier-returns/:id`): Nếu hình thức xử lý là Đổi hàng (`EXCHANGE`), cho phép sinh tự động đơn PO đổi hàng (`POST .../exchange-purchase-orders`) và ghi nhận khoản thanh toán chia sẻ chi phí của cửa hàng (`POST .../cost-share-payments`) nếu chính sách yêu cầu.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-DETA-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/supplier-returns/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-DETA-02.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-DETA-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-DETA-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-RETU-DETA-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Duyệt Phản hồi NCC, Sinh PO Đổi hàng & Bàn giao RTV** (`/store-owner/supplier-returns/:id`): Khi hoàn tất bàn giao hàng trả cho NCC (`POST .../complete-handover`), hệ thống trừ dứt điểm tồn kho cách ly của lô hàng trả và tự động hạch toán giảm nợ AP (`Direction = -1`) nếu chọn cấn trừ công nợ.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-DETA-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/supplier-returns/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-DETA-03.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-DETA-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-DETA-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-RETU-DETA-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Chi tiết Duyệt Phản hồi NCC, Sinh PO Đổi hàng & Bàn giao RTV** (`/store-owner/supplier-returns/:id`): Hỗ trợ xuất biên bản trả hàng ra PDF để hai bên ký nhận khi bàn giao thực tế.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-DETA-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/supplier-returns/:id` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-DETA-04.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-DETA-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-DETA-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns/:id` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-SUPP-RETU-DETA-01`: Gửi yêu cầu trả hàng qua `POST /api/supplier-returns/{id}/submit` và ghi nhận kết quả chấp thuận/từ chối của N...
- [x] `REQ-SUPP-RETU-DETA-02`: Nếu hình thức xử lý là Đổi hàng (`EXCHANGE`), cho phép sinh tự động đơn PO đổi hàng (`POST .../exchange-purcha...
- [x] `REQ-SUPP-RETU-DETA-03`: Khi hoàn tất bàn giao hàng trả cho NCC (`POST .../complete-handover`), hệ thống trừ dứt điểm tồn kho cách ly c...
- [x] `REQ-SUPP-RETU-DETA-04`: Hỗ trợ xuất biên bản trả hàng ra PDF để hai bên ký nhận khi bàn giao thực tế.
