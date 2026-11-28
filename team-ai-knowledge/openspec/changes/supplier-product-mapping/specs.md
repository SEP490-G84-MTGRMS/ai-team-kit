# Specs: Màn hình Gán Sản phẩm Cung ứng theo Nhà cung cấp & Bảng giá Mua (`supplier-product-mapping`)

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

### Requirement: REQ-SUPP-PROD-MAPP-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Gán Sản phẩm Cung ứng theo Nhà cung cấp & Bảng giá Mua** (`/store-owner/suppliers/products`, `/store-owner/suppliers/:id/products`, `/suppliers/products`): Tra cứu danh mục mặt hàng cung ứng theo từng NCC hoặc toàn chuỗi qua `GET /api/suppliers/products` và `GET /api/suppliers/{id}/products`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-PROD-MAPP-01)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-PROD-MAPP-01.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `SupplierProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-PROD-MAPP-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-PROD-MAPP-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-PROD-MAPP-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Gán Sản phẩm Cung ứng theo Nhà cung cấp & Bảng giá Mua** (`/store-owner/suppliers/products`, `/store-owner/suppliers/:id/products`, `/suppliers/products`): Hỗ trợ gán lẻ hoặc gán hàng loạt sản phẩm cho NCC (`POST /api/suppliers/{id}/products/batch`) và tự động đồng bộ mặt hàng tới các chi nhánh mà NCC đó đang phục vụ.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-PROD-MAPP-02)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-PROD-MAPP-02.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `SupplierProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-PROD-MAPP-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-PROD-MAPP-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-PROD-MAPP-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Gán Sản phẩm Cung ứng theo Nhà cung cấp & Bảng giá Mua** (`/store-owner/suppliers/products`, `/store-owner/suppliers/:id/products`, `/suppliers/products`): Cho phép cập nhật đơn giá nhập, MOQ, quy cách đóng gói (`PUT .../products/{productId}`) và đặt làm Nhà cung cấp chính (`PATCH .../primary` — tự động gỡ cờ chính của NCC cũ trên cùng sản phẩm).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-PROD-MAPP-03)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-PROD-MAPP-03.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `SupplierProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-PROD-MAPP-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-PROD-MAPP-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-SUPP-PROD-MAPP-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Gán Sản phẩm Cung ứng theo Nhà cung cấp & Bảng giá Mua** (`/store-owner/suppliers/products`, `/store-owner/suppliers/:id/products`, `/suppliers/products`): Hỗ trợ xuất file Excel bảng giá cung ứng (`GET .../products/export`) và import cập nhật hàng loạt (`POST .../products/import`).

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-SUPP-PROD-MAPP-04)
- **GIVEN** Người dùng có vai trò hợp lệ (StoreOwner) đang truy cập màn hình `/store-owner/suppliers/products` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-SUPP-PROD-MAPP-04.
- **THEN** Hệ thống xử lý thành công qua `SuppliersController`, cập nhật chính xác dữ liệu `SupplierProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-SUPP-PROD-MAPP-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-SUPP-PROD-MAPP-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/store-owner/suppliers/products` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-SUPP-PROD-MAPP-01`: Tra cứu danh mục mặt hàng cung ứng theo từng NCC hoặc toàn chuỗi qua `GET /api/suppliers/products` và `GET /ap...
- [x] `REQ-SUPP-PROD-MAPP-02`: Hỗ trợ gán lẻ hoặc gán hàng loạt sản phẩm cho NCC (`POST /api/suppliers/{id}/products/batch`) và tự động đồng ...
- [x] `REQ-SUPP-PROD-MAPP-03`: Cho phép cập nhật đơn giá nhập, MOQ, quy cách đóng gói (`PUT .../products/{productId}`) và đặt làm Nhà cung cấ...
- [x] `REQ-SUPP-PROD-MAPP-04`: Hỗ trợ xuất file Excel bảng giá cung ứng (`GET .../products/export`) và import cập nhật hàng loạt (`POST .../p...
