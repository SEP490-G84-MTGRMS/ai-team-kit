# Specs: Màn hình Kho Danh mục Hàng hóa Mẫu Toàn cầu FMCG (`admin-master-catalog`)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/admin/master-catalog` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/master-catalog/kpis` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/master-catalog/brands` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/master-catalog/categories` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/master-catalog/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/admin/master-catalog` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `PUT` | `/api/admin/master-catalog/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `DELETE` | `/api/admin/master-catalog/{id:guid}` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `GET` | `/api/admin/master-catalog/export-template` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |
| `POST` | `/api/admin/master-catalog/import-excel` | Query / Command DTO | 200/201 JSON DTO | 400 Validation · 401/403 RBAC · 404 NotFound · 409 Conflict |

## ADDED Requirements

### Requirement: REQ-ADMI-MAST-CATA-01 — Hiển thị, tra cứu và tải dữ liệu màn hình chuẩn phân quyền
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kho Danh mục Hàng hóa Mẫu Toàn cầu FMCG** (`/admin/master-catalog`): Hiển thị KPIs tổng số mặt hàng mẫu, thương hiệu, ngành hàng và bảng dữ liệu phân trang từ `GET /api/admin/master-catalog` và `GET /api/admin/master-catalog/kpis`.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-MAST-CATA-01)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/master-catalog` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-MAST-CATA-01.
- **THEN** Hệ thống xử lý thành công qua `AdminMasterCatalogController`, cập nhật chính xác dữ liệu `MasterProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-MAST-CATA-01)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-MAST-CATA-01 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/master-catalog` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-MAST-CATA-02 — Thực thi quy tắc xử lý nghiệp vụ cốt lõi trên màn hình
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kho Danh mục Hàng hóa Mẫu Toàn cầu FMCG** (`/admin/master-catalog`): Hỗ trợ thêm mới, chỉnh sửa, xóa sản phẩm mẫu (`POST/PUT/DELETE /api/admin/master-catalog`) kèm kiểm tra không trùng mã vạch chuẩn toàn cầu.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-MAST-CATA-02)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/master-catalog` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-MAST-CATA-02.
- **THEN** Hệ thống xử lý thành công qua `AdminMasterCatalogController`, cập nhật chính xác dữ liệu `MasterProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-MAST-CATA-02)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-MAST-CATA-02 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/master-catalog` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-MAST-CATA-03 — Kiểm soát ràng buộc trạng thái và tính nhất quán dữ liệu
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kho Danh mục Hàng hóa Mẫu Toàn cầu FMCG** (`/admin/master-catalog`): Hỗ trợ tải tệp Excel mẫu (`GET /api/admin/master-catalog/export-template`) và import hàng loạt (`POST /api/admin/master-catalog/import-excel`) có kiểm tra lỗi từng dòng.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-MAST-CATA-03)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/master-catalog` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-MAST-CATA-03.
- **THEN** Hệ thống xử lý thành công qua `AdminMasterCatalogController`, cập nhật chính xác dữ liệu `MasterProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-MAST-CATA-03)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-MAST-CATA-03 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/master-catalog` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

### Requirement: REQ-ADMI-MAST-CATA-04 — Bảo vệ toàn vẹn dữ liệu, lưu vết kiểm toán và chống thao tác sai
Hệ thống **MUST** đảm bảo tại màn hình **Màn hình Kho Danh mục Hàng hóa Mẫu Toàn cầu FMCG** (`/admin/master-catalog`): Khi Chủ cửa hàng quét hoặc nhập Barcode tại màn tạo sản phẩm cửa hàng (`GET /api/products/lookup-master`), dữ liệu từ kho mẫu này được tự động điền sẵn.

#### Scenario: Thực hiện thành công luồng chuẩn (REQ-ADMI-MAST-CATA-04)
- **GIVEN** Người dùng có vai trò hợp lệ (MasterAdmin) đang truy cập màn hình `/admin/master-catalog` trong phạm vi Tenant hợp lệ.
- **WHEN** Người dùng thực hiện thao tác nghiệp vụ với dữ liệu đầu vào đúng quy định của REQ-ADMI-MAST-CATA-04.
- **THEN** Hệ thống xử lý thành công qua `AdminMasterCatalogController`, cập nhật chính xác dữ liệu `MasterProduct` và phản hồi kết quả đồng bộ trên giao diện.

#### Scenario: Chặn dữ liệu vi phạm quy tắc hoặc trái phân quyền (REQ-ADMI-MAST-CATA-04)
- **GIVEN** Người dùng gửi dữ liệu vi phạm điều kiện ràng buộc của REQ-ADMI-MAST-CATA-04 hoặc tài khoản không có quyền trên chi nhánh/chức năng này.
- **WHEN** Yêu cầu được gửi từ màn hình `/admin/master-catalog` tới máy chủ API.
- **THEN** Hệ thống từ chối thao tác (HTTP 400/403/409 ProblemDetails), giữ nguyên toàn vẹn dữ liệu hiện có và hiển thị thông báo lỗi tiếng Việt rõ ràng.

## Acceptance checklist
- [x] `REQ-ADMI-MAST-CATA-01`: Hiển thị KPIs tổng số mặt hàng mẫu, thương hiệu, ngành hàng và bảng dữ liệu phân trang từ `GET /api/admin/mast...
- [x] `REQ-ADMI-MAST-CATA-02`: Hỗ trợ thêm mới, chỉnh sửa, xóa sản phẩm mẫu (`POST/PUT/DELETE /api/admin/master-catalog`) kèm kiểm tra không ...
- [x] `REQ-ADMI-MAST-CATA-03`: Hỗ trợ tải tệp Excel mẫu (`GET /api/admin/master-catalog/export-template`) và import hàng loạt (`POST /api/adm...
- [x] `REQ-ADMI-MAST-CATA-04`: Khi Chủ cửa hàng quét hoặc nhập Barcode tại màn tạo sản phẩm cửa hàng (`GET /api/products/lookup-master`), dữ ...
