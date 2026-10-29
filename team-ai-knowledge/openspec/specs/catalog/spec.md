# Spec: catalog

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-CAT-01 Lấy danh sách nhóm hàng kèm số lượng sản phẩm (Mô hình phẳng)
Hệ thống **MUST** cung cấp endpoint `GET /api/categories` trả về toàn bộ danh mục hàng hóa dạng phẳng (Flat List, không có quan hệ phân cấp cha - con), chưa bị xóa (`IsDeleted == false`) thuộc `TenantId` của người dùng hiện tại, sắp xếp theo `DisplayOrder` tăng dần rồi đến `Name`. Mỗi danh mục **MUST** đi kèm số lượng sản phẩm đang hoạt động (`productCount = COUNT(Products where IsDeleted == false)`).

#### Scenario: Lấy danh sách danh mục thành công
- **GIVEN** Người dùng đã đăng nhập với vai trò hợp lệ trong Tenant `tenant_fpt_01`.
- **AND** Trong hệ thống có 3 danh mục: "Bánh kẹo" (5 sản phẩm), "Nước ngọt" (10 sản phẩm), và "Gia vị" (0 sản phẩm).
- **WHEN** Người dùng gửi yêu cầu `GET /api/categories`.
- **THEN** Hệ thống trả về mã HTTP `200 OK`.
- **AND** Payload chứa danh sách 3 danh mục với `productCount` tương ứng là 5, 10, 0.

#### Scenario: Không hiển thị danh mục đã bị xóa mềm (Soft Deleted)
- **GIVEN** Danh mục "Đồ hộp" đã bị đánh dấu `IsDeleted = true`.
- **WHEN** Người dùng gửi yêu cầu `GET /api/categories`.
- **THEN** Hệ thống trả về `200 OK` và kết quả **KHÔNG** chứa danh mục "Đồ hộp".

---

### Requirement: REQ-CAT-02 Lấy thông tin chi tiết một nhóm hàng
Hệ thống **MUST** cung cấp endpoint `GET /api/categories/{id}` trả về thông tin chi tiết của nhóm hàng chỉ định.

#### Scenario: Tìm thấy nhóm hàng hợp lệ
- **GIVEN** Nhóm hàng với Id `cat_123` tồn tại trong Tenant hiện tại và chưa bị xóa.
- **WHEN** Gửi `GET /api/categories/cat_123`.
- **THEN** Hệ thống trả về `200 OK` kèm `CategoryResponse`.

#### Scenario: Nhóm hàng không tồn tại hoặc thuộc Tenant khác
- **GIVEN** Id `cat_999` không tồn tại trong DB hoặc thuộc về Tenant khác.
- **WHEN** Gửi `GET /api/categories/cat_999`.
- **THEN** Hệ thống trả về mã HTTP `404 Not Found` với mã lỗi `CATEGORY_NOT_FOUND`.

---

### Requirement: REQ-CAT-03 Tạo mới nhóm hàng với kiểm tra trùng tên
Hệ thống **MUST** cung cấp endpoint `POST /api/categories`. Người dùng **SHALL** có quyền tạo nhóm hàng mới bằng cách cung cấp tên nhóm (`Name`). Tên nhóm **MUST NOT** được để trống và không được trùng với nhóm hàng đang hoạt động khác trong cùng Tenant. Nếu `CategoryCode` bị bỏ trống, hệ thống **MUST** tự sinh mã duy nhất dạng `CAT-XXXX`.

#### Scenario: Tạo mới nhóm hàng hợp lệ
- **GIVEN** Người dùng gửi `POST /api/categories` với payload:
  ```json
  {
    "name": "Sữa tươi & Sữa chua",
    "description": "Các chế phẩm từ sữa",
    "displayOrder": 1
  }
  ```
- **WHEN** Hệ thống xử lý request.
- **THEN** Hệ thống lưu bản ghi mới với `TenantId` của phiên làm việc, tự sinh mã `Code` nếu chưa có.
- **AND** Trả về HTTP `201 Created` kèm header `Location` và dữ liệu `CategoryResponse` có `productCount = 0`.

#### Scenario: Lỗi khi trùng tên nhóm hàng trong cùng Tenant
- **GIVEN** Trong Tenant đã có nhóm hàng tên "Bánh kẹo" (`IsDeleted = false`).
- **WHEN** Người dùng gửi `POST /api/categories` với `name: "bánh kẹo"` (không phân biệt chữ hoa thường).
- **THEN** Hệ thống từ chối và trả về mã HTTP `400 Bad Request` với lỗi `"CATEGORY_NAME_EXISTS"`.

---

### Requirement: REQ-CAT-04 Cập nhật thông tin nhóm hàng
Hệ thống **MUST** cung cấp endpoint `PUT /api/categories/{id}` cho phép sửa `Name`, `Description`, `DisplayOrder`. Tên cập nhật **MUST NOT** trùng với nhóm hàng khác trong cùng Tenant.

#### Scenario: Cập nhật thông tin thành công
- **GIVEN** Nhóm hàng tồn tại với Id `cat_123`.
- **WHEN** Gửi `PUT /api/categories/cat_123` với tên mới `"Bánh kẹo nhập khẩu"`.
- **THEN** Hệ thống cập nhật bản ghi, gán `UpdatedAt = UTC Now`.
- **AND** Trả về HTTP `200 OK` kèm dữ liệu đã cập nhật.

---

### Requirement: REQ-CAT-05 Xóa mềm nhóm hàng có kiểm tra ràng buộc toàn vẹn dữ liệu
Hệ thống **MUST** cung cấp endpoint `DELETE /api/categories/{id}`. Hệ thống **MUST NOT** cho phép xóa nhóm hàng nếu nhóm hàng đó đang chứa $\ge 1$ sản phẩm chưa bị xóa (`ProductCount > 0`). Khi xóa thành công, hệ thống **MUST** áp dụng Soft Delete (`IsDeleted = true`).

#### Scenario: Xóa thành công nhóm hàng rỗng
- **GIVEN** Nhóm hàng `cat_empty` không có sản phẩm nào (`productCount == 0`).
- **WHEN** Gửi `DELETE /api/categories/cat_empty`.
- **THEN** Hệ thống đánh dấu `IsDeleted = true` trong cơ sở dữ liệu.
- **AND** Trả về HTTP `200 OK` với thông điệp `"Xóa nhóm hàng thành công"`.

#### Scenario: Chặn xóa khi nhóm hàng đang chứa sản phẩm
- **GIVEN** Nhóm hàng `cat_with_products` đang có 3 sản phẩm liên kết (`IsDeleted == false`).
- **WHEN** Gửi `DELETE /api/categories/cat_with_products`.
- **THEN** Hệ thống từ chối xóa và trả về mã HTTP `400 Bad Request` (hoặc `422 Unprocessable Entity`).
- **AND** Thông báo lỗi: `"Không thể xóa nhóm hàng vì đang có 3 sản phẩm liên kết."`.

---

### Requirement: REQ-CAT-06 Cô lập Multi-Tenancy tuyệt đối
Mọi thao tác `GET`, `POST`, `PUT`, `DELETE` trên Category **MUST** tuân thủ cô lập dữ liệu theo `TenantId`. Người dùng của Tenant này tuyệt đối không thể xem, sửa hoặc xóa Category của Tenant khác.

#### Scenario: Thử xóa nhóm hàng của Tenant khác
- **GIVEN** Nhóm hàng `cat_other` thuộc Tenant `Tenant_B`.
- **WHEN** Người dùng thuộc Tenant `Tenant_A` gửi `DELETE /api/categories/cat_other`.
- **THEN** Hệ thống kích hoạt Global Query Filter, không tìm thấy bản ghi.
- **AND** Trả về HTTP `404 Not Found` (không làm lộ sự tồn tại của dữ liệu ở tenant khác).

---

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

## Lịch sử
- 2026-10-29 · `category-crud-backend` · +6 ~0 -0
- 2026-10-29 · `product-crud-backend` · +6 ~0 -0
