# Specs: Màn hình Danh sách Phiếu Trả / Đổi hàng Nhà cung cấp (RTV List) (`supplier-return-list`)

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

### Requirement: REQ-SUPP-RETU-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiếu Trả / Đổi hàng Nhà cung cấp (RTV List)** (`/store-owner/supplier-returns`): Truy vấn danh sách phiếu trả hàng NCC từ `GET /api/supplier-returns` có lọc theo chi nhánh (`useBranchScope`), nhà cung cấp, trạng thái và từ khóa mã phiếu.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/supplier-returns` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-RETU-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiếu Trả / Đổi hàng Nhà cung cấp (RTV List)** (`/store-owner/supplier-returns`): Hiển thị rõ mã phiếu RTV, nguồn phát sinh (từ GRN hoặc từ Phiên kiểm kê), nhà cung cấp, phương thức xử lý (`Cấn trừ nợ`, `Đổi hàng mới`, `Hoàn tiền`, `Credit`) và tổng giá trị.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/supplier-returns` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-RETU-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiếu Trả / Đổi hàng Nhà cung cấp (RTV List)** (`/store-owner/supplier-returns`): Cung cấp lối tắt liên thông sang Danh sách Phiếu kiểm kê (`/store-owner/stocktakes`), Phiếu nhập kho (`/store-owner/goods-receipts`) và nút tạo phiếu trả mới.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/supplier-returns` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-RETU-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Danh sách Phiếu Trả / Đổi hàng Nhà cung cấp (RTV List)** (`/store-owner/supplier-returns`): Đảm bảo phân quyền dữ liệu theo Tenant và phạm vi chi nhánh của nhân sự đăng nhập.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-RETU-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/supplier-returns` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-RETU-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `SupplierReturnsController`, cập nhật chính xác dữ liệu `SupplierReturn` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-RETU-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-RETU-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/supplier-returns` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-SUPP-RETU-LIST-01`: Truy vấn danh sách phiếu trả hàng NCC từ `GET /api/supplier-returns` có lọc theo chi nhánh (`useBranchScope`),...
- [x] `REQ-SUPP-RETU-LIST-02`: Hiển thị rõ mã phiếu RTV, nguồn phát sinh (từ GRN hoặc từ Phiên kiểm kê), nhà cung cấp, phương thức xử lý (`Cấ...
- [x] `REQ-SUPP-RETU-LIST-03`: Cung cấp lối tắt liên thông sang Danh sách Phiếu kiểm kê (`/store-owner/stocktakes`), Phiếu nhập kho (`/store-...
- [x] `REQ-SUPP-RETU-LIST-04`: Đảm bảo phân quyền dữ liệu theo Tenant và phạm vi chi nhánh của nhân sự đăng nhập.
