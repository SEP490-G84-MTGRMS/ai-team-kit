# Specs: Màn hình Xác nhận Nhận hàng Điều chuyển & Ghi nhận Chênh lệch (`transfer-receive`)

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

## ADDED Requirements

### Requirement: REQ-TRAN-RECE-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Xác nhận Nhận hàng Điều chuyển & Ghi nhận Chênh lệch** (`/store-owner/transfers/:id/receive`, `/transfers/:id/receive`, `/employee/transfers/:id/receive`): Chỉ cho phép thực hiện xác nhận nhận hàng (`PUT /api/transfers/{id}/receive`) đối với các phiếu đang ở trạng thái `Đang chuyển` và đúng người dùng thuộc chi nhánh nhận hoặc Store Owner.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-RECE-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers/:id/receive` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-RECE-01.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-RECE-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-RECE-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers/:id/receive` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-TRAN-RECE-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Xác nhận Nhận hàng Điều chuyển & Ghi nhận Chênh lệch** (`/store-owner/transfers/:id/receive`, `/transfers/:id/receive`, `/employee/transfers/:id/receive`): Đối chiếu từng dòng lô hàng chuyển đi và số lượng thực nhận; nếu có bất kỳ mặt hàng nào nhận thiếu hoặc hỏng, hệ thống bắt buộc nhập lý do chênh lệch trước khi xác nhận.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-RECE-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers/:id/receive` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-RECE-02.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-RECE-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-RECE-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers/:id/receive` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-TRAN-RECE-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Xác nhận Nhận hàng Điều chuyển & Ghi nhận Chênh lệch** (`/store-owner/transfers/:id/receive`, `/transfers/:id/receive`, `/employee/transfers/:id/receive`): Khi hoàn tất nhận hàng, hệ thống tự động khởi tạo/cộng tồn `BranchStock` tại chi nhánh nhận với nguyên vẹn `BatchCode` và `ExpiryDate` của lô gốc, đồng thời chuyển phiếu sang `Hoàn tất` hoặc `Hoàn tất có chênh lệch`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-RECE-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers/:id/receive` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-RECE-03.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-RECE-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-RECE-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers/:id/receive` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-TRAN-RECE-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Xác nhận Nhận hàng Điều chuyển & Ghi nhận Chênh lệch** (`/store-owner/transfers/:id/receive`, `/transfers/:id/receive`, `/employee/transfers/:id/receive`): Hỗ trợ tìm kiếm nhanh mặt hàng theo mã hoặc tên ngay trên danh sách nhận hàng dài.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-TRAN-RECE-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/transfers/:id/receive` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-TRAN-RECE-04.
- **THEN** Hệ thống xử lý thành công qua `TransfersController`, cập nhật chính xác dữ liệu `Transfer` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-TRAN-RECE-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-TRAN-RECE-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/transfers/:id/receive` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-TRAN-RECE-01`: Chỉ cho phép thực hiện xác nhận nhận hàng (`PUT /api/transfers/{id}/receive`) đối với các phiếu đang ở trạng t...
- [x] `REQ-TRAN-RECE-02`: Đối chiếu từng dòng lô hàng chuyển đi và số lượng thực nhận; nếu có bất kỳ mặt hàng nào nhận thiếu hoặc hỏng, ...
- [x] `REQ-TRAN-RECE-03`: Khi hoàn tất nhận hàng, hệ thống tự động khởi tạo/cộng tồn `BranchStock` tại chi nhánh nhận với nguyên vẹn `Ba...
- [x] `REQ-TRAN-RECE-04`: Hỗ trợ tìm kiếm nhanh mặt hàng theo mã hoặc tên ngay trên danh sách nhận hàng dài.
