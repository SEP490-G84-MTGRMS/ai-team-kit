# Specs: Màn hình Tạo Phiếu Điều chuyển FEFO & Yêu cầu Xin hàng Khẩn cấp (`transfer-create-request`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/transfers` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/transfers/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/transfers/stock-batches` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/transfers` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/transfers/{id:guid}/submit` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/transfers/{id:guid}/receive` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/transfers/{id:guid}/dispatch` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/transfers/{id:guid}/cancel` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/transfers/{id:guid}/return` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/transfer-requests/allocation-preview` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-TRAN-CREA-REQU-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tạo Phiếu Điều chuyển FEFO & Yêu cầu Xin hàng Khẩn cấp** (`/store-owner/transfers/create`, `/store-owner/transfers/request`, `/employee/transfers/request`): Chặn chọn chi nhánh gửi trùng chi nhánh nhận; nạp danh sách lô khả dụng tại chi nhánh gửi qua `GET /api/transfers/stock-batches` và chặn tuyệt đối việc chọn lô đã hết hạn sử dụng hoặc vượt tồn khả dụng của lô.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-CREA-REQU-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-CREA-REQU-01.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-CREA-REQU-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-CREA-REQU-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-TRAN-CREA-REQU-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tạo Phiếu Điều chuyển FEFO & Yêu cầu Xin hàng Khẩn cấp** (`/store-owner/transfers/create`, `/store-owner/transfers/request`, `/employee/transfers/request`): Hỗ trợ sao chép nhanh từ phiếu điều chuyển cũ (tự động bỏ qua các mặt hàng đã hết tồn/hết hạn và thông báo rõ cho người dùng) hoặc nhập từ file Excel (`ImportTransferExcelModal`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-CREA-REQU-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-CREA-REQU-02.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-CREA-REQU-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-CREA-REQU-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-TRAN-CREA-REQU-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tạo Phiếu Điều chuyển FEFO & Yêu cầu Xin hàng Khẩn cấp** (`/store-owner/transfers/create`, `/store-owner/transfers/request`, `/employee/transfers/request`): Trên màn hình Xin hàng khẩn cấp, gọi `POST /api/transfer-requests/allocation-preview` để tự động tính toán khả năng đáp ứng tồn kho từ các chi nhánh khác trong chuỗi trước khi gửi yêu cầu (`POST /api/transfer-requests`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-CREA-REQU-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-CREA-REQU-03.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-CREA-REQU-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-CREA-REQU-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-TRAN-CREA-REQU-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tạo Phiếu Điều chuyển FEFO & Yêu cầu Xin hàng Khẩn cấp** (`/store-owner/transfers/create`, `/store-owner/transfers/request`, `/employee/transfers/request`): Liên kết mã đơn hàng/đơn đặt trước tham chiếu (nếu xin hàng phục vụ đơn khách đặt) để ưu tiên luân chuyển.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-CREA-REQU-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-CREA-REQU-04.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-CREA-REQU-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-CREA-REQU-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-TRAN-CREA-REQU-01`: Chặn chọn chi nhánh gửi trùng chi nhánh nhận; nạp danh sách lô khả dụng tại chi nhánh gửi qua `GET /api/transf...
- [x] `REQ-TRAN-CREA-REQU-02`: Hỗ trợ sao chép nhanh từ phiếu điều chuyển cũ (tự động bỏ qua các mặt hàng đã hết tồn/hết hạn và thông báo rõ ...
- [x] `REQ-TRAN-CREA-REQU-03`: Trên màn hình Xin hàng khẩn cấp, gọi `POST /api/transfer-requests/allocation-preview` để tự động tính toán khả...
- [x] `REQ-TRAN-CREA-REQU-04`: Liên kết mã đơn hàng/đơn đặt trước tham chiếu (nếu xin hàng phục vụ đơn khách đặt) để ưu tiên luân chuyển.
