# Specs: Màn hình Quản lý Nhóm hàng & Phân loại Ngành hàng (`product-category-list`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/categories` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/categories/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/categories` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/categories/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `DELETE` | `/api/categories/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-PROD-CATE-LIST-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Nhóm hàng & Phân loại Ngành hàng** (`/store-owner/categories`, `/categories`, `/products/categories`): Hiển thị danh sách nhóm hàng của Tenant từ `GET /api/categories` kèm số lượng sản phẩm đang thuộc từng nhóm.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROD-CATE-LIST-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/categories` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROD-CATE-LIST-01.
- **THEN** Hệ thống xử lý thành công qua `CategoriesController`, cập nhật chính xác dữ liệu `Category` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROD-CATE-LIST-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROD-CATE-LIST-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/categories` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PROD-CATE-LIST-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Nhóm hàng & Phân loại Ngành hàng** (`/store-owner/categories`, `/categories`, `/products/categories`): Cho phép thêm mới và cập nhật tên/mã/mô tả nhóm hàng qua `POST /api/categories` và `PUT /api/categories/{id}` (kiểm tra không trùng tên trong cùng Tenant).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROD-CATE-LIST-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/categories` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROD-CATE-LIST-02.
- **THEN** Hệ thống xử lý thành công qua `CategoriesController`, cập nhật chính xác dữ liệu `Category` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROD-CATE-LIST-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROD-CATE-LIST-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/categories` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PROD-CATE-LIST-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Nhóm hàng & Phân loại Ngành hàng** (`/store-owner/categories`, `/categories`, `/products/categories`): Chặn xóa nhóm hàng (`DELETE /api/categories/{id}`) cả đơn lẻ lẫn hàng loạt nếu nhóm đang chứa bất kỳ sản phẩm liên kết nào (`productCount > 0`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROD-CATE-LIST-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/categories` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROD-CATE-LIST-03.
- **THEN** Hệ thống xử lý thành công qua `CategoriesController`, cập nhật chính xác dữ liệu `Category` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROD-CATE-LIST-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROD-CATE-LIST-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/categories` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-PROD-CATE-LIST-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Quản lý Nhóm hàng & Phân loại Ngành hàng** (`/store-owner/categories`, `/categories`, `/products/categories`): Đồng bộ tức thời danh sách nhóm hàng mới sang bộ lọc sản phẩm, màn hình POS và cấu hình khuyến mãi.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-PROD-CATE-LIST-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/categories` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-PROD-CATE-LIST-04.
- **THEN** Hệ thống xử lý thành công qua `CategoriesController`, cập nhật chính xác dữ liệu `Category` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-PROD-CATE-LIST-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-PROD-CATE-LIST-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/categories` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-PROD-CATE-LIST-01`: Hiển thị danh sách nhóm hàng của Tenant từ `GET /api/categories` kèm số lượng sản phẩm đang thuộc từng nhóm.
- [x] `REQ-PROD-CATE-LIST-02`: Cho phép thêm mới và cập nhật tên/mã/mô tả nhóm hàng qua `POST /api/categories` và `PUT /api/categories/{id}` ...
- [x] `REQ-PROD-CATE-LIST-03`: Chặn xóa nhóm hàng (`DELETE /api/categories/{id}`) cả đơn lẻ lẫn hàng loạt nếu nhóm đang chứa bất kỳ sản phẩm ...
- [x] `REQ-PROD-CATE-LIST-04`: Đồng bộ tức thời danh sách nhóm hàng mới sang bộ lọc sản phẩm, màn hình POS và cấu hình khuyến mãi.
