# Specs: product-crud-backend

## API / Contract

| Method | Path | Request Body | Response Body | HTTP Status / Lỗi |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Query Params: `searchTerm`, `categoryId`, `status`, `pageIndex`, `pageSize` | `ApiResponse<PagedResult<ProductResponse>>` | `200 OK` |
| `GET` | `/api/products/{id}` | Không | `ApiResponse<ProductResponse>` | `200 OK`, `404 Not Found` |
| `POST` | `/api/products` | `ProductCreateRequest` | `ApiResponse<ProductResponse>` | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/products/{id}` | `ProductUpdateRequest` | `ApiResponse<ProductResponse>` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/products/{id}` | Không | `ApiResponse<object>` | `200 OK`, `404 Not Found` |

---

## ADDED Requirements

### Requirement: REQ-PROD-01 Lấy danh sách sản phẩm phân trang và bộ lọc
Hệ thống **MUST** cung cấp endpoint `GET /api/products` trả về danh sách sản phẩm phân trang (`PagedResult<ProductResponse>`) thuộc `TenantId` của người dùng. Hệ thống **MUST** hỗ trợ tìm kiếm không phân biệt hoa thường theo `searchTerm` (tìm trong tên sản phẩm, mã SKU `ProductCode`, và mã vạch `Barcode`), và lọc theo nhóm hàng `categoryId` nếu có.

#### Scenario: Tìm kiếm sản phẩm theo tên và phân trang thành công
- **GIVEN** Người dùng đăng nhập trong Tenant `tenant_01`.
- **AND** Trong hệ thống có 25 sản phẩm, trong đó có 3 sản phẩm chứa từ khóa "Sữa".
- **WHEN** Người dùng gửi `GET /api/products?searchTerm=Sữa&pageIndex=1&pageSize=10`.
- **THEN** Hệ thống trả về `200 OK` với `TotalItems = 3`, danh sách `Items` có 3 sản phẩm, `Page = 1`, `PageSize = 10`.

#### Scenario: Lọc sản phẩm theo danh mục
- **GIVEN** Danh mục "Bánh kẹo" có CategoryId `cat_bk_01`.
- **WHEN** Gửi `GET /api/products?categoryId=cat_bk_01`.
- **THEN** Hệ thống trả về `200 OK` và toàn bộ sản phẩm trong `Items` đều có `categoryId = cat_bk_01`.

---

### Requirement: REQ-PROD-02 Lấy chi tiết thông tin một sản phẩm
Hệ thống **MUST** cung cấp endpoint `GET /api/products/{id}` trả về đầy đủ thông tin sản phẩm và tên danh mục `CategoryName`.

#### Scenario: Tìm thấy sản phẩm theo ID
- **GIVEN** Sản phẩm có Id `prod_123` tồn tại và chưa bị xóa.
- **WHEN** Gửi `GET /api/products/prod_123`.
- **THEN** Hệ thống trả về `200 OK` kèm dữ liệu `ProductResponse`.

#### Scenario: Không tìm thấy sản phẩm
- **GIVEN** Sản phẩm có Id `prod_fake` không tồn tại hoặc đã bị xóa mềm (`IsDeleted == true`).
- **WHEN** Gửi `GET /api/products/prod_fake`.
- **THEN** Hệ thống trả về mã HTTP `404 Not Found`.

---

### Requirement: REQ-PROD-03 Tạo mới sản phẩm và kiểm tra tính duy nhất
Hệ thống **MUST** cung cấp endpoint `POST /api/products`. Người dùng **SHALL** có quyền tạo mới sản phẩm bằng cách gửi `ProductCreateRequest`. Hệ thống **MUST** kiểm tra:
1. `Name` không được để trống và không quá 200 ký tự.
2. `CategoryId` phải tồn tại trong cùng Tenant.
3. `SellingPrice` $\ge 0$.
4. `ProductCode` (SKU) và `Barcode` không được trùng lặp với sản phẩm đang hoạt động khác trong cùng Tenant.
5. Nếu `ProductCode` để trống, hệ thống **MUST** tự sinh mã duy nhất dạng `SP-{RandomHex}`. Nếu `Barcode` để trống, hệ thống gán bằng `ProductCode`.

#### Scenario: Tạo sản phẩm mới thành công với mã tự sinh
- **GIVEN** Người dùng gửi `POST /api/products` với:
  ```json
  {
    "name": "Bánh quy bơ Danisa 454g",
    "categoryId": "cat_valid_id",
    "sellingPrice": 125000,
    "costPrice": 95000,
    "baseUnit": "Hộp"
  }
  ```
- **WHEN** Hệ thống xử lý request.
- **THEN** Hệ thống tự sinh `ProductCode` (dạng `SP-XXXXXX`) và gán `Barcode` tương ứng.
- **AND** Lưu vào DB, trả về mã HTTP `201 Created` kèm `ProductResponse`.

#### Scenario: Lỗi khi Barcode bị trùng lặp
- **GIVEN** Sản phẩm A đã dùng mã vạch `"8935001234567"`.
- **WHEN** Người dùng gửi `POST /api/products` tạo sản phẩm B với barcode `"8935001234567"`.
- **THEN** Hệ thống từ chối và trả về mã HTTP `400 Bad Request` với mã lỗi `"PRODUCT_BARCODE_EXISTS"`.

---

### Requirement: REQ-PROD-04 Cập nhật thông tin sản phẩm
Hệ thống **MUST** cung cấp endpoint `PUT /api/products/{id}` cho phép sửa thông tin sản phẩm (`Name`, `CategoryId`, `SellingPrice`, `CostPrice`, `MinStock`, `MaxStock`, `BaseUnit`, `Barcode`, `Status`, `ImageUrl`, `Description`, `InternalNote`). Hệ thống **MUST** đảm bảo `Barcode` mới không trùng với sản phẩm khác.

#### Scenario: Cập nhật thành công thông tin sản phẩm
- **GIVEN** Sản phẩm có Id `prod_123`.
- **WHEN** Gửi `PUT /api/products/prod_123` cập nhật giá bán mới `130000`.
- **THEN** Hệ thống cập nhật bản ghi, gán `UpdatedAt = UTC Now`, trả về `200 OK`.

---

### Requirement: REQ-PROD-05 Xóa mềm sản phẩm (Soft Delete)
Hệ thống **MUST** cung cấp endpoint `DELETE /api/products/{id}`. Khi nhận yêu cầu xóa, hệ thống **MUST** đánh dấu `IsDeleted = true` và lưu thời gian `UpdatedAt`.

#### Scenario: Xóa mềm thành công
- **GIVEN** Sản phẩm `prod_123` đang tồn tại (`IsDeleted == false`).
- **WHEN** Gửi `DELETE /api/products/prod_123`.
- **THEN** Hệ thống cập nhật `IsDeleted = true`, trả về HTTP `200 OK`.
- **AND** Các truy vấn `GET /api/products` tiếp theo không còn thấy sản phẩm này.

---

### Requirement: REQ-PROD-06 Bảo mật che giấu giá vốn (BR-SEC-01)
Hệ thống **MUST** kiểm tra vai trò của người dùng hiện tại thông qua `ITenantContext`. Nếu vai trò của người dùng **KHÔNG** thuộc nhóm quản lý (`SUPER_ADMIN`, `STORE_OWNER`, `BRANCH_MANAGER`, `StoreOwner`, `Manager`), hệ thống **MUST** gán `CostPrice = null` trong toàn bộ kết quả trả về (`ProductResponse`).

#### Scenario: Thu ngân (Cashier) xem danh sách sản phẩm
- **GIVEN** Người dùng đăng nhập với vai trò `Cashier`.
- **AND** Sản phẩm có giá vốn thực tế là `95000` VND.
- **WHEN** Gửi yêu cầu `GET /api/products` hoặc `GET /api/products/{id}`.
- **THEN** Hệ thống trả về `CostPrice = null` trong JSON phản hồi.

#### Scenario: Chủ cửa hàng (StoreOwner) xem danh sách sản phẩm
- **GIVEN** Người dùng đăng nhập với vai trò `StoreOwner`.
- **WHEN** Gửi yêu cầu `GET /api/products/{id}`.
- **THEN** Hệ thống trả về `CostPrice = 95000.00` đầy đủ.

---

## Acceptance checklist
- [ ] REQ-PROD-01: API `GET /api/products` phân trang và tìm kiếm theo tên, SKU, Barcode, nhóm hàng chính xác.
- [ ] REQ-PROD-02: API `GET /api/products/{id}` trả về chi tiết sản phẩm kèm `CategoryName`.
- [ ] REQ-PROD-03: API `POST /api/products` tạo mới sản phẩm thành công, tự sinh mã SKU, chặn trùng mã vạch.
- [ ] REQ-PROD-04: API `PUT /api/products/{id}` cập nhật thông tin sản phẩm chính xác.
- [ ] REQ-PROD-05: API `DELETE /api/products/{id}` thực hiện xóa mềm `IsDeleted = true`.
- [ ] REQ-PROD-06: Ẩn giá vốn `CostPrice = null` cho vai trò Cashier/Staff (tuân thủ BR-SEC-01).
