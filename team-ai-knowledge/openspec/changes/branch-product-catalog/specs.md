# Specs: Màn hình Gán Sản phẩm vào Chi nhánh, Giá bán Riêng & Định mức Tồn (`branch-product-catalog`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/branches/quota` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/branches` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/branches/summaries` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/branches/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/branches/{id:guid}/detail` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/branches` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/branches/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PATCH` | `/api/branches/{id:guid}/status` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `DELETE` | `/api/branches/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/branches/products` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-BRAN-PROD-CATA-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Gán Sản phẩm vào Chi nhánh, Giá bán Riêng & Định mức Tồn** (`/store-owner/stores/products`, `/store-owner/stores/:id/products`, `/store-owner/branches/products`): Nạp danh sách mặt hàng đang kinh doanh tại chi nhánh qua `GET /api/branches/{id}/products` và danh sách sản phẩm chưa gán qua `GET /api/branches/{id}/assignable-products`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BRAN-PROD-CATA-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/stores/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BRAN-PROD-CATA-01.
- **THEN** Hệ thống xử lý thành công qua `BranchesController`, cập nhật chính xác dữ liệu `BranchProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BRAN-PROD-CATA-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BRAN-PROD-CATA-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stores/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-BRAN-PROD-CATA-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Gán Sản phẩm vào Chi nhánh, Giá bán Riêng & Định mức Tồn** (`/store-owner/stores/products`, `/store-owner/stores/:id/products`, `/store-owner/branches/products`): Gán một hoặc nhiều sản phẩm vào chi nhánh (`POST /api/branches/{id}/products`) và thiết lập định mức `MinThreshold` / `MaxThreshold`, vị trí kệ mặc định cùng giá bán riêng theo ĐVT (`PUT /api/branches/{id}/products/{productId}`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BRAN-PROD-CATA-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/stores/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BRAN-PROD-CATA-02.
- **THEN** Hệ thống xử lý thành công qua `BranchesController`, cập nhật chính xác dữ liệu `BranchProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BRAN-PROD-CATA-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BRAN-PROD-CATA-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stores/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-BRAN-PROD-CATA-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Gán Sản phẩm vào Chi nhánh, Giá bán Riêng & Định mức Tồn** (`/store-owner/stores/products`, `/store-owner/stores/:id/products`, `/store-owner/branches/products`): Hỗ trợ bật/tắt trạng thái kinh doanh tại chi nhánh (`PATCH .../status`); mặt hàng tạm ngưng sẽ tự động ẩn khỏi màn hình bán lẻ POS của chi nhánh đó.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BRAN-PROD-CATA-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/stores/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BRAN-PROD-CATA-03.
- **THEN** Hệ thống xử lý thành công qua `BranchesController`, cập nhật chính xác dữ liệu `BranchProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BRAN-PROD-CATA-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BRAN-PROD-CATA-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stores/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-BRAN-PROD-CATA-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Gán Sản phẩm vào Chi nhánh, Giá bán Riêng & Định mức Tồn** (`/store-owner/stores/products`, `/store-owner/stores/:id/products`, `/store-owner/branches/products`): Hỗ trợ xuất bảng giá chi nhánh ra Excel (`GET .../products/export`) và cập nhật hàng loạt qua import Excel (`POST .../products/import`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-BRAN-PROD-CATA-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/stores/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-BRAN-PROD-CATA-04.
- **THEN** Hệ thống xử lý thành công qua `BranchesController`, cập nhật chính xác dữ liệu `BranchProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-BRAN-PROD-CATA-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-BRAN-PROD-CATA-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/stores/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-BRAN-PROD-CATA-01`: Nạp danh sách mặt hàng đang kinh doanh tại chi nhánh qua `GET /api/branches/{id}/products` và danh sách sản ph...
- [x] `REQ-BRAN-PROD-CATA-02`: Gán một hoặc nhiều sản phẩm vào chi nhánh (`POST /api/branches/{id}/products`) và thiết lập định mức `MinThres...
- [x] `REQ-BRAN-PROD-CATA-03`: Hỗ trợ bật/tắt trạng thái kinh doanh tại chi nhánh (`PATCH .../status`); mặt hàng tạm ngưng sẽ tự động ẩn khỏi...
- [x] `REQ-BRAN-PROD-CATA-04`: Hỗ trợ xuất bảng giá chi nhánh ra Excel (`GET .../products/export`) và cập nhật hàng loạt qua import Excel (`P...
