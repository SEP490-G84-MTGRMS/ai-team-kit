# Specs: Màn hình Quản lý Danh mục Hàng hóa Master, Đa Đơn vị tính & Bảng giá (`product-catalog-list`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/products` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/products/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/products/barcode/{barcode}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/products/lookup-master` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/products` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/products/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `DELETE` | `/api/products/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/products/{id:guid}/suppliers` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/products/{id:guid}/price-history` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/products/{productId:guid}/units` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-PROD-CATA-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh mục Hàng hóa Master, Đa Đơn vị tính & Bảng giá** (`/store-owner/products`, `/products`): Quản lý danh sách sản phẩm phân trang, lọc theo ngành hàng/trạng thái/từ khóa qua `GET /api/products` và tự động gợi ý thông tin khi quét mã vạch qua `GET /api/products/lookup-master`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROD-CATA-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROD-CATA-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `ProductsController`, cập nhật chính xác dữ liệu `Product` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROD-CATA-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROD-CATA-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PROD-CATA-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh mục Hàng hóa Master, Đa Đơn vị tính & Bảng giá** (`/store-owner/products`, `/products`): Hỗ trợ thiết lập đơn vị cơ sở và nhiều đơn vị quy đổi (`POST/PUT/DELETE /api/products/{productId}/units`) kèm hệ số quy đổi `ConversionRate > 0` và mã vạch riêng từng ĐVT.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROD-CATA-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROD-CATA-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `ProductsController`, cập nhật chính xác dữ liệu `Product` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROD-CATA-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROD-CATA-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PROD-CATA-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh mục Hàng hóa Master, Đa Đơn vị tính & Bảng giá** (`/store-owner/products`, `/products`): Cảnh báo khi thiết lập giá bán lẻ thấp hơn giá vốn và tự động ghi nhận mọi biến động giá vào `ProductPriceHistory` (`GET /api/products/{id}/price-history`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROD-CATA-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROD-CATA-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `ProductsController`, cập nhật chính xác dữ liệu `Product` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROD-CATA-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROD-CATA-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PROD-CATA-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Danh mục Hàng hóa Master, Đa Đơn vị tính & Bảng giá** (`/store-owner/products`, `/products`): Chặn xóa vật lý sản phẩm hoặc đơn vị quy đổi đã phát sinh lô tồn kho, đơn mua PO hoặc hóa đơn bán lẻ.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROD-CATA-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner / Employee) đang truy cập màn hình `/store-owner/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROD-CATA-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `ProductsController`, cập nhật chính xác dữ liệu `Product` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROD-CATA-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROD-CATA-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-PROD-CATA-LIST-01`: Quản lý danh sách sản phẩm phân trang, lọc theo ngành hàng/trạng thái/từ khóa qua `GET /api/products` và tự độ...
- [x] `REQ-PROD-CATA-LIST-02`: Hỗ trợ thiết lập đơn vị cơ sở và nhiều đơn vị quy đổi (`POST/PUT/DELETE /api/products/{productId}/units`) kèm ...
- [x] `REQ-PROD-CATA-LIST-03`: Cảnh báo khi thiết lập giá bán lẻ thấp hơn giá vốn và tự động ghi nhận mọi biến động giá vào `ProductPriceHist...
- [x] `REQ-PROD-CATA-LIST-04`: Chặn xóa vật lý sản phẩm hoặc đơn vị quy đổi đã phát sinh lô tồn kho, đơn mua PO hoặc hóa đơn bán lẻ.
