# Specs: supplier-product-management

## API / Contract

| Method | Path | Request Body / Params | Response Body | Status & Error Codes |
|---|---|---|---|---|
| `GET` | `/api/v1/suppliers/{id}/products` | `Route id`, `QueryParams (SearchTerm, CategoryId, Status, PageIndex, PageSize)` | `PagedResult<SupplierProductDto>` | `200 OK`, `401 Unauthorized`, `404 Not Found` |
| `POST` | `/api/v1/suppliers/{id}/products` | `Route id`, `AssignSupplierProductCommand` | `SupplierProductDto` | `201 Created`, `400 Bad Request`, `409 Conflict (BR-SP01)` |
| `PUT` | `/api/v1/suppliers/{id}/products/{productId}` | `Route id, productId`, `UpdateSupplierProductCommand` | `SupplierProductDto` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `PATCH` | `/api/v1/suppliers/{id}/products/{productId}/status` | `Route id, productId`, `ToggleSupplierProductStatusRequest` | `SupplierProductDto` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `PATCH` | `/api/v1/suppliers/{id}/products/{productId}/primary` | `Route id, productId`, `SetPrimarySupplierRequest` | `SupplierProductDto` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `GET` | `/api/v1/products/{id}/suppliers` | `Route id`, `QueryParams (OnlyActive)` | `List<ProductSupplierMappingDto>` | `200 OK`, `404 Not Found` |

---

## ADDED Requirements

### Requirement: REQ-SP01 Assign Product to Supplier with Terms & Uniqueness Guard (BR-SP01)
Hệ thống MUST cho phép người dùng gán một sản phẩm từ Danh mục chung (`Products`) cho một Nhà cung cấp (`Suppliers`), kèm theo đơn vị giao hàng (`DeliveryUoM`), giá sỉ thỏa thuận (`AgreedWholesalePrice`), số lượng đặt tối thiểu (`MOQ`), và tùy chọn đặt làm NCC chính (`IsPrimarySupplier`). Hệ thống MUST từ chối gán nếu sản phẩm đã được liên kết với Nhà cung cấp này trong cùng một Tenant.

#### Scenario: Gán sản phẩm mới cho Nhà cung cấp thành công (Happy Path)
- **GIVEN** Người dùng có quyền `Owner` hoặc `PurchasingStaff` thuộc Tenant A.
- **WHEN** Gửi request `POST /api/v1/suppliers/{suppId}/products` với:
  - `ProductId` = `prd-fresh-milk-1l`
  - `DeliveryUoM` = "Thùng"
  - `AgreedWholesalePrice` = 280,000 VND
  - `MinimumOrderQuantity` = 5
  - `IsPrimarySupplier` = true
- **THEN** Hệ thống lưu bản ghi vào `SupplierProducts` với `TenantId` = Tenant A, `Status` = `Active`, và trả về `201 Created` kèm `SupplierProductDto`.

#### Scenario: Gán thất bại do sản phẩm đã được gán trước đó cho Nhà cung cấp này (BR-SP01 Violation)
- **GIVEN** Sản phẩm `prd-fresh-milk-1l` đã được gán cho Nhà cung cấp `{suppId}` trong Tenant A.
- **WHEN** Người dùng gửi lại request `POST /api/v1/suppliers/{suppId}/products` với cùng `ProductId` = `prd-fresh-milk-1l`.
- **THEN** Hệ thống từ chối và trả về `409 Conflict` với mã lỗi `PRODUCT_ALREADY_ASSIGNED_TO_SUPPLIER`.

#### Scenario: Gán thất bại do Giá thỏa thuận <= 0 hoặc MOQ < 1 (BR-SP03 Validation Guard)
- **GIVEN** Người dùng chọn sản phẩm hợp lệ.
- **WHEN** Gửi request với `AgreedWholesalePrice` = 0 hoặc `MinimumOrderQuantity` = 0.
- **THEN** Hệ thống từ chối lưu và trả về `400 Bad Request` kèm thông báo lỗi chi tiết từ FluentValidation.

---

### Requirement: REQ-SP02 Supplier Product Price & MOQ Modification
Hệ thống MUST cho phép cập nhật giá nhập thỏa thuận (`AgreedWholesalePrice`), số lượng đặt hàng tối thiểu (`MOQ`), đơn vị giao hàng (`DeliveryUoM`), và mã sản phẩm phía NCC (`SupplierProductCode`) cho một liên kết sẵn có.

#### Scenario: Cập nhật giá nhập thỏa thuận và MOQ thành công
- **GIVEN** Sản phẩm `prd-tomato` đang được liên kết với NCC với giá 18,000 VND và MOQ = 10.
- **WHEN** Gửi request `PUT /api/v1/suppliers/{suppId}/products/{prdId}` với `AgreedWholesalePrice` = 20,000 VND và `MinimumOrderQuantity` = 15.
- **THEN** Hệ thống cập nhật bản ghi trong CSDL và trả về `200 OK` kèm `AgreedWholesalePrice` mới là 20,000 VND.

---

### Requirement: REQ-SP03 Supplier Product Status Toggle (Soft Deactivation / Reactivation)
Hệ thống MUST cho phép chuyển đổi trạng thái giữa `Active` (1) và `Inactive` (2) của liên kết sản phẩm - nhà cung cấp. Khi ở trạng thái `Inactive`, sản phẩm MUST bị ẩn khỏi danh sách lựa chọn khi tạo đơn PO mới từ NCC đó, nhưng MUST bảo toàn lịch sử trên các đơn PO/GRN đã tạo trước đó.

#### Scenario: Tạm ngưng cung ứng một mặt hàng từ Nhà cung cấp thành công
- **GIVEN** Sản phẩm "Sữa chua Vinamilk 100g" đang có trạng thái `Active` đối với NCC A.
- **WHEN** Người dùng gửi request `PATCH /api/v1/suppliers/{suppId}/products/{prdId}/status` với `Status` = `Inactive`.
- **THEN** Hệ thống cập nhật trạng thái liên kết thành `Inactive` và trả về `200 OK`.

#### Scenario: Tái kích hoạt lại mặt hàng tạm ngưng thành công
- **GIVEN** Sản phẩm đang ở trạng thái `Inactive` đối với NCC A.
- **WHEN** Người dùng gửi request chuyển `Status` thành `Active`.
- **THEN** Hệ thống cập nhật trạng thái liên kết thành `Active` và trả về `200 OK`.

---

### Requirement: REQ-SP04 Primary Supplier Assignment & Exclusivity Guard (BR-SP02)
Hệ thống MUST đảm bảo mỗi sản phẩm trong một Tenant chỉ có duy nhất một Nhà cung cấp được gán cờ `IsPrimarySupplier = true`. Khi một Nhà cung cấp được đặt làm NCC chính cho sản phẩm, hệ thống MUST tự động gỡ cờ NCC chính của các Nhà cung cấp khác đối với sản phẩm đó.

#### Scenario: Chuyển đổi Nhà cung cấp chính cho sản phẩm thành công
- **GIVEN** Sản phẩm "Coca Cola 330ml" đang có NCC A là `IsPrimarySupplier = true`, và NCC B là `IsPrimarySupplier = false`.
- **WHEN** Người dùng gửi request `PATCH /api/v1/suppliers/{suppBId}/products/{cocaId}/primary` với `IsPrimarySupplier` = true.
- **THEN** Hệ thống cập nhật NCC B thành `IsPrimarySupplier = true` và tự động cập nhật NCC A thành `IsPrimarySupplier = false`.

---

### Requirement: REQ-SP05 Contextual Querying & Reverse Lookup for Purchase Orders
Hệ thống MUST hỗ trợ 2 cơ chế truy vấn:
1. Lấy danh sách sản phẩm theo Nhà cung cấp kèm bộ lọc đa tiêu chí (Ngành hàng, Trạng thái, Từ khoá tìm kiếm theo Tên, SKU, Barcode).
2. Tra cứu ngược danh sách tất cả các NCC cung ứng một sản phẩm (`GET /api/v1/products/{id}/suppliers`) phục vụ màn hình lập đơn đặt hàng (PO).

#### Scenario: Tìm kiếm sản phẩm theo Barcode trong danh mục của Nhà cung cấp
- **GIVEN** NCC "Công ty CP Sữa Vinamilk" đang cung cấp 50 sản phẩm.
- **WHEN** Người dùng gửi request `GET /api/v1/suppliers/{id}/products?SearchTerm=89312345601`.
- **THEN** Hệ thống trả về sản phẩm khớp chính xác Barcode `89312345601` với status `200 OK`.

#### Scenario: Tra cứu các NCC cung ứng khi lập đơn PO cho một sản phẩm
- **GIVEN** Sản phẩm "Gạo ST25" được cung ứng bởi NCC X (giá 180,000, Primary) và NCC Y (giá 185,000).
- **WHEN** Giao diện PO gửi request `GET /api/v1/products/{riceId}/suppliers?OnlyActive=true`.
- **THEN** Hệ thống trả về danh sách gồm cả NCC X và NCC Y, trong đó NCC X có `IsPrimarySupplier` = true.

---

### Requirement: REQ-SP06 Multi-tenant Data Isolation
Hệ thống MUST đảm bảo dữ liệu gán sản phẩm - nhà cung cấp được cô lập tuyệt đối theo `TenantId`. Không một người dùng nào có thể xem hoặc gán sản phẩm giữa các Tenant khác nhau.

#### Scenario: Truy vấn sản phẩm của NCC thuộc Tenant khác bị từ chối
- **GIVEN** Người dùng thuộc Tenant A.
- **WHEN** Gửi request `GET /api/v1/suppliers/{suppTenantBId}/products`.
- **THEN** Hệ thống lọc theo `TenantId = Tenant A` và trả về `404 Not Found`.

---

## Acceptance checklist

- [ ] **REQ-SP01**: Gán sản phẩm mới cho NCC thành công; chặn trùng lặp sản phẩm cùng NCC (BR-SP01); validate Giá > 0 và MOQ >= 1 (BR-SP03).
- [ ] **REQ-SP02**: Cập nhật giá sỉ thỏa thuận và MOQ thành công với phản hồi tức thời.
- [ ] **REQ-SP03**: Bật/Tắt trạng thái liên kết Active/Inactive (Soft Deactivation) thành công, bảo toàn dữ liệu lịch sử đơn hàng.
- [ ] **REQ-SP04**: Đặt NCC chính (Primary Supplier) độc quyền (BR-SP02), tự động gỡ cờ Primary của NCC cũ.
- [ ] **REQ-SP05**: Truy vấn danh sách sản phẩm theo NCC có phân trang, lọc ngành hàng, tìm kiếm Barcode/SKU/Tên; hỗ trợ tra cứu ngược danh sách NCC theo sản phẩm.
- [ ] **REQ-SP06**: Cô lập tuyệt đối theo `TenantId` trên toàn bộ bảng `SupplierProducts` và các API liên quan.
