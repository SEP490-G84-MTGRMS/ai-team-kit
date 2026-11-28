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

---

## MODIFIED Requirements (Refactoring theo Mô hình Phân lớp Giá - Master Product Layer 1)

### Cập nhật cấu trúc thực thể và DTOs:
1. **Loại bỏ các trường mức tồn & quản lý theo lô khỏi Master Product**:
   - `MinStock` (decimal): Loại bỏ khỏi `Product`, `ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`.
   - `MaxStock` (decimal): Loại bỏ khỏi `Product`, `ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`.
   - `HasBatches` (bool): Loại bỏ khỏi `Product`, `ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`.
   - **Lý do nghiệp vụ**: Theo kiến trúc phân lớp giá (`pricing-layers-business-model.md`), Master Product chỉ quản lý danh mục dùng chung toàn chuỗi (mã hàng, tên, ĐVT, giá mua tham khảo fallback, giá bán cơ bản niêm yết). Định mức tồn kho an toàn (Min/Max Stock) và theo dõi tồn kho theo lô là thuộc tính cấp chi nhánh (`BranchProduct` / `BranchStock` / `InventoryLots`), không gán cứng trên Master Product toàn chuỗi.
2. **Bổ sung Ubiquitous Language Aliases**:
   - `Product.DefaultPurchasePrice`: Alias `[NotMapped]` trỏ về `CostPrice` (giá mua tham khảo mặc định khi lập PO).
   - `ProductUnit.SellingPrice`: Alias `[NotMapped]` trỏ về `Price` (giá bán cơ bản theo đơn vị quy đổi).

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: product-unit-crud -->
# Specs: product-unit-crud

## API / Contract
| Method | Path | Request Body | Response Body | Error Codes |
|---|---|---|---|---|
| GET | `/api/v1/products/{productId}/units` | — | `200 OK`: `ApiResponse<IReadOnlyList<ProductUnitResponse>>` | `404 Not Found` (Sản phẩm không tồn tại) |
| GET | `/api/v1/product-units/{id}` | — | `200 OK`: `ApiResponse<ProductUnitResponse>` | `404 Not Found` (Đơn vị không tồn tại) |
| POST | `/api/v1/products/{productId}/units` | `ProductUnitCreateRequest` | `201 Created`: `ApiResponse<ProductUnitResponse>` | `400 Bad Request` (Tỷ lệ $\le 0$, tên rỗng, trùng tên), `404 Not Found`, `409 Conflict` (Trùng barcode) |
| PUT | `/api/v1/product-units/{id}` | `ProductUnitUpdateRequest` | `200 OK`: `ApiResponse<ProductUnitResponse>` | `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| DELETE | `/api/v1/product-units/{id}` | — | `200 OK`: `ApiResponse<object>` | `400 Bad Request` (Không thể xóa đơn vị cơ bản duy nhất), `404 Not Found` |

---

## ADDED Requirements

### Requirement: REQ-UNIT-01 Truy vấn danh sách đơn vị quy đổi theo sản phẩm
Hệ thống **MUST** cung cấp endpoint `GET /api/v1/products/{productId}/units` trả về toàn bộ các đơn vị tính của sản phẩm thuộc Tenant hiện tại. Danh sách **SHALL** được sắp xếp ưu tiên đơn vị cơ bản (`IsBaseUnit == true`) lên trước, sau đó theo tỷ lệ quy đổi tăng dần.

#### Scenario: Lấy danh sách đơn vị của sản phẩm thành công
- **GIVEN** Sản phẩm "Bia Heineken" có 3 đơn vị: Lon (cơ bản, tỷ lệ 1), Lốc 6 (tỷ lệ 6), Thùng 24 (tỷ lệ 24)
- **WHEN** Gửi request `GET /api/v1/products/{productId}/units`
- **THEN** Hệ thống phản hồi HTTP 200 với mảng 3 đơn vị, đơn vị Lon đứng đầu tiên.

#### Scenario: Truy vấn với sản phẩm không tồn tại
- **GIVEN** `productId` không tồn tại trong hệ thống hoặc thuộc tenant khác
- **WHEN** Gửi request `GET /api/v1/products/{productId}/units`
- **THEN** Hệ thống MUST trả về HTTP 404 Not Found.

---

### Requirement: REQ-UNIT-02 Thêm mới đơn vị tính quy đổi cho sản phẩm
Hệ thống **MUST** cung cấp endpoint `POST /api/v1/products/{productId}/units` để tạo đơn vị tính mới.
- Hệ thống **MUST** kiểm tra `ConversionRate > 0` và `Price >= 0`.
- Hệ thống **MUST** kiểm tra không được trùng `UnitName` với các đơn vị đã có của sản phẩm.
- Nếu đơn vị mới được đặt `IsBaseUnit = true`, hệ thống **MUST** gán `ConversionRate = 1.0` và tự động cập nhật đơn vị cơ bản cũ về `IsBaseUnit = false`.

#### Scenario: Thêm thành công đơn vị "Thùng 24"
- **GIVEN** Sản phẩm "Nước ngọt Coca" đã có đơn vị cơ bản "Chai"
- **WHEN** Gửi `POST /api/v1/products/{productId}/units` với `{ UnitName: "Thùng 24", ConversionRate: 24, Price: 220000, Barcode: "893500123456" }`
- **THEN** Hệ thống phản hồi HTTP 201 Created kèm dữ liệu đơn vị vừa tạo.

#### Scenario: Thêm đơn vị có tỷ lệ quy đổi không hợp lệ
- **GIVEN** Người dùng nhập `ConversionRate = 0` hoặc âm
- **WHEN** Gửi `POST /api/v1/products/{productId}/units`
- **THEN** Hệ thống MUST trả về HTTP 400 Bad Request với thông báo lỗi: "Tỷ lệ quy đổi phải lớn hơn 0."

#### Scenario: Thêm đơn vị trùng tên đã tồn tại trong cùng sản phẩm
- **GIVEN** Sản phẩm đã có đơn vị "Lốc 6"
- **WHEN** Gửi `POST` tạo đơn vị mới cũng có tên "lốc 6" (không phân biệt hoa thường)
- **THEN** Hệ thống MUST trả về HTTP 400 Bad Request với thông báo: "Đơn vị tính này đã tồn tại cho sản phẩm."

---

### Requirement: REQ-UNIT-03 Cập nhật thông tin đơn vị tính quy đổi
Hệ thống **MUST** cung cấp endpoint `PUT /api/v1/product-units/{id}` để cập nhật thông tin đơn vị tính (`UnitName`, `ConversionRate`, `Price`, `Barcode`, `IsBaseUnit`).

#### Scenario: Cập nhật giá bán và mã vạch của đơn vị tính
- **GIVEN** Đơn vị "Thùng 24" đang có giá bán 220,000 đ
- **WHEN** Gửi `PUT /api/v1/product-units/{id}` với giá mới 230,000 đ
- **THEN** Hệ thống phản hồi HTTP 200 OK với giá bán mới đã được cập nhật.

#### Scenario: Cập nhật trùng tên với một đơn vị khác của cùng sản phẩm
- **GIVEN** Sản phẩm có 2 đơn vị: "Chai" (Id 1) và "Két 20" (Id 2)
- **WHEN** Gửi `PUT /api/v1/product-units/{id2}` đổi tên thành "Chai"
- **THEN** Hệ thống MUST trả về HTTP 400 Bad Request báo lỗi trùng lặp tên đơn vị.

---

### Requirement: REQ-UNIT-04 Xóa đơn vị tính quy đổi
Hệ thống **MUST** cung cấp endpoint `DELETE /api/v1/product-units/{id}` để xóa đơn vị tính.
- Hệ thống **MUST** từ chối xóa nếu đơn vị đó có `IsBaseUnit == true` và là đơn vị duy nhất còn lại của sản phẩm.

#### Scenario: Xóa thành công đơn vị quy đổi phụ
- **GIVEN** Sản phẩm có đơn vị cơ bản "Lon" và đơn vị phụ "Thùng 24"
- **WHEN** Gửi `DELETE /api/v1/product-units/{thung24Id}`
- **THEN** Hệ thống xóa đơn vị khỏi database và phản hồi HTTP 200 OK.

#### Scenario: Từ chối xóa đơn vị cơ bản duy nhất
- **GIVEN** Sản phẩm chỉ có duy nhất 1 đơn vị tính là đơn vị cơ bản "Gói"
- **WHEN** Gửi `DELETE /api/v1/product-units/{goiId}`
- **THEN** Hệ thống MUST trả về HTTP 400 Bad Request với thông báo: "Không thể xóa đơn vị tính cơ bản duy nhất của sản phẩm."

---

## Acceptance checklist
- [ ] Interface `IProductUnitRepository` và class `ProductUnitRepository` được đăng ký DI trong Infrastructure.
- [ ] Interface `IProductUnitService` và class `ProductUnitService` được triển khai với đầy đủ 5 phương thức CRUD.
- [ ] Controller `ProductUnitsController` (hoặc endpoints trong `ProductsController`) xử lý chuẩn xác 5 APIs:
  - `GET /api/v1/products/{productId}/units`
  - `GET /api/v1/product-units/{id}`
  - `POST /api/v1/products/{productId}/units`
  - `PUT /api/v1/product-units/{id}`
  - `DELETE /api/v1/product-units/{id}`
- [ ] Mọi ràng buộc nghiệp vụ (tỷ lệ $> 0$, giá $\ge 0$, tên đơn vị duy nhất theo sản phẩm, bảo vệ đơn vị cơ bản) được kiểm chứng qua Unit Tests.
- [ ] 100% test cases pass, build solution không có lỗi.


<!-- Sáp nhập từ change: auto-generate-catalog-codes -->
# Specification: Tự động sinh mã tuần tự cho Category và Product

## Capability Summary
Cung cấp cơ chế tự động sinh mã tuần tự dạng `CAT000001`, `CAT000002`... cho Nhóm hàng (Category) và `SP000001`, `SP000002`... cho Sản phẩm (Product) khi người dùng để trống mã lúc tạo mới. Cho phép để trống `Barcode` (`null`) nếu người dùng không quét hoặc không nhập mã vạch, đảm bảo tính nhất quán, phân tách đa người thuê (Multi-tenancy) và không xung đột mã.

## Architecture Map
- **Frontend**: Màn hình tạo Nhóm hàng (`CategoryModal`) / Màn hình tạo Sản phẩm (`ProductFormModal`) gửi payload tạo mới với trường mã để trống (`null` hoặc `""`).
- **Backend API**:
  - `POST /api/v1/categories` -> `CategoryService.CreateAsync` -> `CategoryRepository.GetMaxSequentialCodeAsync` -> Database PostgreSQL.
  - `POST /api/v1/products` -> `CatalogService.CreateProductAsync` -> `ProductRepository.GetMaxSequentialCodeAsync` -> Database PostgreSQL.

---

## MODIFIED Requirements

### Requirement: REQ-CAT-01 Tự động sinh mã tuần tự cho Nhóm hàng
Khi người dùng tạo mới một Nhóm hàng mà không cung cấp mã (`request.Code` là `null`, chuỗi rỗng hoặc chỉ chứa khoảng trắng), hệ thống **MUST** tự động sinh mã theo định dạng `CAT{number:D6}` với số thứ tự tăng dần bắt đầu từ `CAT000001`. Nếu người dùng cung cấp mã hợp lệ, hệ thống **MUST** chuẩn hóa `Trim().ToUpper()` và lưu đúng mã đó.

#### Scenario: Tạo nhóm hàng đầu tiên khi chưa có nhóm hàng nào
**GIVEN** Trong hệ thống của Tenant hiện tại chưa có nhóm hàng nào có mã dạng `CAT{number}`  
**WHEN** Người dùng gửi yêu cầu `POST /api/v1/categories` với `Name = "Bánh kẹo"` và `Code = ""`  
**THEN** Hệ thống tạo mới nhóm hàng thành công với `CategoryCode = "CAT000001"`

#### Scenario: Tạo nhóm hàng tiếp theo tự động tăng tuần tự
**GIVEN** Trong hệ thống của Tenant hiện tại đã có nhóm hàng với mã `CAT000001`  
**WHEN** Người dùng gửi yêu cầu `POST /api/v1/categories` với `Name = "Nước giải khát"` và `Code = null`  
**THEN** Hệ thống tạo mới nhóm hàng thành công với `CategoryCode = "CAT000002"`

#### Scenario: Tạo nhóm hàng với mã tùy chỉnh của người dùng
**GIVEN** Người dùng muốn đặt mã nhóm hàng theo quy ước riêng  
**WHEN** Người dùng gửi yêu cầu `POST /api/v1/categories` với `Name = "Gia vị"` và `Code = "gia-vi-nhap-khau"`  
**THEN** Hệ thống lưu nhóm hàng với `CategoryCode = "GIA-VI-NHAP-KHAU"` mà không ghi đè mã tự sinh

#### Scenario: Phòng chống xung đột mã tuần tự đã tồn tại (Collision Prevention)
**GIVEN** Trong hệ thống đã tồn tại mã `CAT000001` do người dùng tự nhập thủ công từ trước  
**WHEN** Người dùng tạo mới nhóm hàng bỏ trống mã  
**THEN** Hệ thống phát hiện `CAT000001` đã tồn tại và tự động cấp mã tiếp theo không bị trùng là `CAT000002`

---

### Requirement: REQ-PROD-01 Tự động sinh mã tuần tự cho Sản phẩm & Cho phép Barcode là null
Khi người dùng tạo mới một Sản phẩm mà không cung cấp mã sản phẩm (`request.ProductCode` là `null`, chuỗi rỗng hoặc chỉ chứa khoảng trắng), hệ thống **MUST** tự động sinh mã theo định dạng `SP{number:D6}` với số thứ tự tăng dần bắt đầu từ `SP000001`. 
Đồng thời, nếu người dùng không nhập mã vạch (`request.Barcode` là `null`, chuỗi rỗng hoặc chỉ chứa khoảng trắng), hệ thống **MUST** lưu giá trị `Barcode` là `null` (không bắt buộc và không tự gán bằng ProductCode). Nếu người dùng có nhập mã vạch, hệ thống **MUST** kiểm tra tính duy nhất của mã vạch đó.

#### Scenario: Tạo sản phẩm đầu tiên khi chưa có sản phẩm nào và không nhập Barcode
**GIVEN** Trong hệ thống của Tenant hiện tại chưa có sản phẩm nào có mã dạng `SP{number}`  
**WHEN** Người dùng gửi yêu cầu `POST /api/v1/products` với `Name = "Sữa đặc Ông Thọ"`, `ProductCode = ""` và `Barcode = ""`  
**THEN** Hệ thống tạo mới sản phẩm thành công với `ProductCode = "SP000001"` và `Barcode = null`

#### Scenario: Tạo sản phẩm tiếp theo tự động tăng tuần tự và không nhập Barcode
**GIVEN** Trong hệ thống của Tenant hiện tại đã có sản phẩm với mã `SP000001`  
**WHEN** Người dùng gửi yêu cầu `POST /api/v1/products` với `Name = "Bánh mì hoa cúc"`, `ProductCode = null` và `Barcode = null`  
**THEN** Hệ thống tạo mới sản phẩm thành công với `ProductCode = "SP000002"` và `Barcode = null`

#### Scenario: Tạo sản phẩm bỏ trống mã nhưng có quét Barcode riêng
**GIVEN** Người dùng quét mã vạch trên bao bì sản phẩm là `893850123456` nhưng không nhập mã quản lý nội bộ  
**WHEN** Người dùng gửi yêu cầu `POST /api/v1/products` với `ProductCode = null` và `Barcode = "893850123456"`  
**THEN** Hệ thống tạo mới sản phẩm với `ProductCode = "SP000003"` và `Barcode = "893850123456"`

#### Scenario: Phân tách độc lập theo Tenant (Tenant Isolation)
**GIVEN** Cửa hàng Tenant A đã tạo 10 sản phẩm (mã cao nhất là `SP000010`)  
**WHEN** Cửa hàng Tenant B (cửa hàng mới) tạo sản phẩm đầu tiên bỏ trống mã  
**THEN** Hệ thống cấp mã cho Tenant B là `SP000001`, hoàn toàn độc lập với Tenant A

---

## Acceptance Checklist
- [ ] Bổ sung `GetMaxSequentialCodeAsync` vào `ICategoryRepository` và `CategoryRepository`.
- [ ] Bổ sung `GetMaxSequentialCodeAsync` vào `IProductRepository` và `ProductRepository`.
- [ ] Cập nhật `CategoryService.CreateAsync` sinh mã `CAT000001`, `CAT000002`... khi bỏ trống mã.
- [ ] Cập nhật `CatalogService.CreateProductAsync` sinh mã `SP000001`, `SP000002`... khi bỏ trống mã; và lưu `Barcode = null` nếu bỏ trống mã vạch.
- [ ] Cấu hình EF Core `ProductConfiguration`: Cho phép `Barcode` là nullable và tạo migration `MakeProductBarcodeNullable`.
- [ ] Viết Unit Tests bao phủ cả 2 Service cho các kịch bản mã đầu tiên, mã tuần tự, mã nhập tay, và barcode null.
- [ ] Chạy `dotnet test` đạt 100% passed toàn bộ solution.
