# Specification: Tự động sinh mã tuần tự cho Category và Product

## Capability Summary
Cung cấp cơ chế tự động sinh mã tuần tự dạng `CAT000001`, `CAT000002`... cho Nhóm hàng (Category) và `SP000001`, `SP000002`... cho Sản phẩm (Product) khi người dùng để trống mã lúc tạo mới, đảm bảo tính nhất quán, phân tách đa người thuê (Multi-tenancy) và không xung đột mã.

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

### Requirement: REQ-PROD-01 Tự động sinh mã tuần tự cho Sản phẩm
Khi người dùng tạo mới một Sản phẩm mà không cung cấp mã sản phẩm (`request.ProductCode` là `null`, chuỗi rỗng hoặc chỉ chứa khoảng trắng), hệ thống **MUST** tự động sinh mã theo định dạng `SP{number:D6}` với số thứ tự tăng dần bắt đầu từ `SP000001`. Đồng thời nếu `request.Barcode` cũng bị bỏ trống, hệ thống **MUST** gán giá trị của `Barcode` bằng chính mã sản phẩm tự sinh này.

#### Scenario: Tạo sản phẩm đầu tiên khi chưa có sản phẩm nào
**GIVEN** Trong hệ thống của Tenant hiện tại chưa có sản phẩm nào có mã dạng `SP{number}`  
**WHEN** Người dùng gửi yêu cầu `POST /api/v1/products` với `Name = "Sữa đặc Ông Thọ"` và `ProductCode = ""`  
**THEN** Hệ thống tạo mới sản phẩm thành công với `ProductCode = "SP000001"` và `Barcode = "SP000001"`

#### Scenario: Tạo sản phẩm tiếp theo tự động tăng tuần tự
**GIVEN** Trong hệ thống của Tenant hiện tại đã có sản phẩm với mã `SP000001`  
**WHEN** Người dùng gửi yêu cầu `POST /api/v1/products` với `Name = "Bánh mì hoa cúc"` và `ProductCode = null`  
**THEN** Hệ thống tạo mới sản phẩm thành công với `ProductCode = "SP000002"` và `Barcode = "SP000002"`

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
- [ ] Cập nhật `CatalogService.CreateProductAsync` sinh mã `SP000001`, `SP000002`... khi bỏ trống mã.
- [ ] Viết Unit Tests bao phủ cả 2 Service cho các kịch bản mã đầu tiên, mã tuần tự và mã nhập tay.
- [ ] Chạy `dotnet test` đạt 100% passed toàn bộ solution.
