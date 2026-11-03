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
