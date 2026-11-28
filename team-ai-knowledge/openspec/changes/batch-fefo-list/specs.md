# Specs: Màn hình Sổ lô Hàng hóa FEFO, Cảnh báo Hạn dùng & Giảm giá Xả hàng (`batch-fefo-list`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/batches` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/batches/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/batches/alerts` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/batches` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PATCH` | `/api/batches/{id:guid}/fefo-discount` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-BATC-FEFO-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Sổ lô Hàng hóa FEFO, Cảnh báo Hạn dùng & Giảm giá Xả hàng** (`/store-owner/batches`, `/store-owner/expiry`, `/batches`, `/expiry`, `/employee/batches`): Truy vấn danh sách lô hàng theo chi nhánh từ `GET /api/batches` và danh sách cảnh báo hạn dùng từ `GET /api/batches/alerts`, sắp xếp ưu tiên hạn sử dụng gần nhất (FEFO).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BATC-FEFO-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/batches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BATC-FEFO-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `BatchesController`, cập nhật chính xác dữ liệu `BranchStock` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BATC-FEFO-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BATC-FEFO-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/batches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-BATC-FEFO-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Sổ lô Hàng hóa FEFO, Cảnh báo Hạn dùng & Giảm giá Xả hàng** (`/store-owner/batches`, `/store-owner/expiry`, `/batches`, `/expiry`, `/employee/batches`): Phân loại trạng thái hạn dùng rõ ràng (`NORMAL`, `NEAR_EXPIRY`, `EXPIRED`); tự động khóa không cho xuất bán lẻ tại POS đối với các lô đã `EXPIRED`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BATC-FEFO-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/batches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BATC-FEFO-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `BatchesController`, cập nhật chính xác dữ liệu `BranchStock` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BATC-FEFO-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BATC-FEFO-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/batches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-BATC-FEFO-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Sổ lô Hàng hóa FEFO, Cảnh báo Hạn dùng & Giảm giá Xả hàng** (`/store-owner/batches`, `/store-owner/expiry`, `/batches`, `/expiry`, `/employee/batches`): Cho phép Chủ cửa hàng áp dụng tỷ lệ giảm giá xả hàng trực tiếp trên lô cận hạn qua `PATCH /api/batches/{id}/fefo-discount` và xem truy xuất nguồn gốc lô trên `BatchDetailDrawer`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BATC-FEFO-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/batches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BATC-FEFO-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `BatchesController`, cập nhật chính xác dữ liệu `BranchStock` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BATC-FEFO-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BATC-FEFO-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/batches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-BATC-FEFO-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Sổ lô Hàng hóa FEFO, Cảnh báo Hạn dùng & Giảm giá Xả hàng** (`/store-owner/batches`, `/store-owner/expiry`, `/batches`, `/expiry`, `/employee/batches`): Hỗ trợ tick chọn nhiều lô rủi ro trên bảng để điều hướng tạo nhanh Phiên kiểm kê (`/store-owner/stocktakes/create?batchIds=...`) hoặc Phiếu trả hàng NCC nháp.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BATC-FEFO-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/batches` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BATC-FEFO-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `BatchesController`, cập nhật chính xác dữ liệu `BranchStock` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BATC-FEFO-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BATC-FEFO-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/batches` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-BATC-FEFO-LIST-01`: Truy vấn danh sách lô hàng theo chi nhánh từ `GET /api/batches` và danh sách cảnh báo hạn dùng từ `GET /api/ba...
- [x] `REQ-BATC-FEFO-LIST-02`: Phân loại trạng thái hạn dùng rõ ràng (`NORMAL`, `NEAR_EXPIRY`, `EXPIRED`); tự động khóa không cho xuất bán lẻ...
- [x] `REQ-BATC-FEFO-LIST-03`: Cho phép Chủ cửa hàng áp dụng tỷ lệ giảm giá xả hàng trực tiếp trên lô cận hạn qua `PATCH /api/batches/{id}/fe...
- [x] `REQ-BATC-FEFO-LIST-04`: Hỗ trợ tick chọn nhiều lô rủi ro trên bảng để điều hướng tạo nhanh Phiên kiểm kê (`/store-owner/stocktakes/cre...
