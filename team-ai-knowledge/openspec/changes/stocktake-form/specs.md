# Specs: Màn hình Tạo Phiên Kiểm kê & Nhập Số đếm Thực tế theo Lô (`stocktake-form`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/stocktakes` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/stocktakes/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/stocktakes` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/stocktakes/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/stocktakes/{id:guid}/submit` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/stocktakes/{id:guid}/review` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/stocktakes/{id:guid}/create-return` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-STOC-FORM-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tạo Phiên Kiểm kê & Nhập Số đếm Thực tế theo Lô** (`/store-owner/stocktakes/create`, `/store-owner/stocktakes/:id/edit`, `/employee/stocktakes/create`, `/employee/stocktakes/:id/edit`): Kiểm tra tài khoản nhân viên phải được gán chi nhánh hợp lệ trước khi cho phép tạo phiên kiểm kê mới (`POST /api/stocktakes`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-FORM-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-FORM-01.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-FORM-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-FORM-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOC-FORM-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tạo Phiên Kiểm kê & Nhập Số đếm Thực tế theo Lô** (`/store-owner/stocktakes/create`, `/store-owner/stocktakes/:id/edit`, `/employee/stocktakes/create`, `/employee/stocktakes/:id/edit`): Hỗ trợ nạp sẵn danh sách lô từ tham số URL `batchIds` (khi chuyển sang từ màn Sổ lô FEFO) hoặc thêm sản phẩm/lô qua `StocktakeAddProductModal` mà không bị trùng dòng lô trên cùng phiếu.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-FORM-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-FORM-02.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-FORM-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-FORM-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOC-FORM-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tạo Phiên Kiểm kê & Nhập Số đếm Thực tế theo Lô** (`/store-owner/stocktakes/create`, `/store-owner/stocktakes/:id/edit`, `/employee/stocktakes/create`, `/employee/stocktakes/:id/edit`): Ghi nhận đồng thời tồn sổ sách hệ thống tại thời điểm chụp (`SystemQty`), số lượng đếm thực tế (`CountedQty`), số lượng hàng lỗi/hỏng/hết hạn và nguyên nhân.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-FORM-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-FORM-03.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-FORM-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-FORM-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-STOC-FORM-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Tạo Phiên Kiểm kê & Nhập Số đếm Thực tế theo Lô** (`/store-owner/stocktakes/create`, `/store-owner/stocktakes/:id/edit`, `/employee/stocktakes/create`, `/employee/stocktakes/:id/edit`): Cho phép lưu bản nháp (`PUT /api/stocktakes/{id}`) hoặc gửi duyệt (`POST /api/stocktakes/{id}/submit`); các phiếu ở trạng thái `Yêu cầu kiểm kê lại` cho phép nhân viên mở sửa và gửi lại.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-STOC-FORM-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/stocktakes/create` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-STOC-FORM-04.
- **THEN** Hệ thống xử lý thành công qua `StocktakesController`, cập nhật chính xác dữ liệu `Stocktake` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-STOC-FORM-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-STOC-FORM-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stocktakes/create` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-STOC-FORM-01`: Kiểm tra tài khoản nhân viên phải được gán chi nhánh hợp lệ trước khi cho phép tạo phiên kiểm kê mới (`POST /a...
- [x] `REQ-STOC-FORM-02`: Hỗ trợ nạp sẵn danh sách lô từ tham số URL `batchIds` (khi chuyển sang từ màn Sổ lô FEFO) hoặc thêm sản phẩm/l...
- [x] `REQ-STOC-FORM-03`: Ghi nhận đồng thời tồn sổ sách hệ thống tại thời điểm chụp (`SystemQty`), số lượng đếm thực tế (`CountedQty`),...
- [x] `REQ-STOC-FORM-04`: Cho phép lưu bản nháp (`PUT /api/stocktakes/{id}`) hoặc gửi duyệt (`POST /api/stocktakes/{id}/submit`); các ph...
