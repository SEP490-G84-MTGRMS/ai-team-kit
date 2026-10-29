# Specs: product-management-ui
## Capability: Product Catalog Management (FE-01)
- Dependencies: `exploration.md`, `design-brief.md`, `proposal.md`
- Backend Controllers: [`ProductsController.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/ProductsController.cs), [`CategoriesController.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/CategoriesController.cs)
- Căn cứ hệ thống: [Report-3 SRS FE-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L1208)

---

## 1. API / Contract (Đồng bộ Backend C# Thực tế)

| Method | Path | Request Body / Query Params | Response (Success) | Lỗi xử lý |
|---|---|---|---|---|
| `GET` | `/api/products` | Query: `searchTerm`, `categoryId`, `status`, `pageIndex`, `pageSize` | `200 OK`<br>`ApiResponse<PagedResult<ProductResponse>>` | `400 Bad Request`, `401 Unauthorized` |
| `GET` | `/api/products/{id}` | Path: `id` (Guid) | `200 OK`<br>`ApiResponse<ProductResponse>` | `404 Not Found` |
| `POST` | `/api/products` | Body: `ProductCreateRequest`<br>(Name, CategoryId, SellingPrice, ProductCode?, Barcode?, BaseUnit, CostPrice?, MinStock, MaxStock, VatRate, Status...) | `201 Created`<br>`ApiResponse<ProductResponse>` | `400 Validation Error`, `409 Duplicate SKU/Barcode` |
| `PUT` | `/api/products/{id}` | Path: `id` (Guid)<br>Body: `ProductUpdateRequest` | `200 OK`<br>`ApiResponse<ProductResponse>` | `400 Validation Error`, `404 Not Found` |
| `DELETE` | `/api/products/{id}` | Path: `id` (Guid) | `200 OK`<br>`ApiResponse<object>` (Soft Delete -> Status = Discontinued) | `400 Delete Error`, `404 Not Found` |
| `GET` | `/api/products/{id}/suppliers` | Path: `id` (Guid)<br>Query: `onlyActive` (boolean) | `200 OK`<br>`ApiResponse<IReadOnlyList<ProductSupplierMappingDto>>` | `404 Not Found` |
| `GET` | `/api/categories` | Không | `200 OK`<br>`ApiResponse<IReadOnlyList<CategoryDto>>` | `401 Unauthorized` |

---

## 2. ADDED Requirements

### Requirement: REQ-01 Hiển thị Danh sách Hàng hóa có Phân trang & Bảo mật Giá vốn (Product List & BR-SEC-01)
Hệ thống Frontend MUST hiển thị danh sách hàng hóa phân trang thông qua `GET /api/products`, hỗ trợ tìm kiếm debounced (300ms) theo tên, SKU hoặc barcode và lọc theo danh mục.
Hệ thống MUST che giấu hoàn toàn trường Giá vốn (`CostPrice`) trên giao diện khi người dùng không phải là `StoreOwner` hoặc `Admin` theo quy tắc [BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4759).

#### Scenario: Chủ cửa hàng xem danh sách đầy đủ giá vốn và phân trang
- **GIVEN** Người dùng đăng nhập có vai trò `StoreOwner`
- **WHEN** Truy cập trang `/dashboard/products`
- **THEN** Hệ thống gọi API `GET /api/products?pageIndex=1&pageSize=20`
- **AND** Bảng dữ liệu hiển thị các cột: Mã hàng (ProductCode), Mã vạch (Barcode), Tên hàng, Danh mục, ĐVT, Giá bán, Giá vốn (CostPrice), Trạng thái
- **AND** Phân trang hiển thị đúng tổng số trang `totalPages` và tổng số bản ghi `totalCount`.

#### Scenario: Nhân viên thu ngân xem danh sách bị che giá vốn (BR-SEC-01)
- **GIVEN** Người dùng đăng nhập có vai trò `Cashier` hoặc `Staff`
- **WHEN** Truy cập trang `/dashboard/products`
- **THEN** Hệ thống KHÔNG hiển thị cột "Giá vốn" trên bảng dữ liệu
- **AND** Dữ liệu trả về từ API có trường `costPrice = null`.

#### Scenario: Tìm kiếm từ khóa không có kết quả (Edge Case)
- **GIVEN** Đang ở trang danh sách hàng hóa
- **WHEN** Người dùng nhập từ khóa tìm kiếm không khớp bất kỳ bản ghi nào
- **THEN** Bảng hiển thị giao diện rỗng (Empty State) với thông báo "Không tìm thấy hàng hóa phù hợp" kèm nút xóa bộ lọc.

---

### Requirement: REQ-02 Khởi tạo Hàng hóa Chuẩn qua Backend API (Create Product)
Hệ thống Frontend MUST cho phép người dùng mở `ProductFormModal` để tạo mới hàng hóa gửi tới `POST /api/products`.
Nếu người dùng để trống mã hàng (`ProductCode`) hoặc mã vạch (`Barcode`), hệ thống cho phép gửi giá trị rỗng/null để Backend tự động sinh mã theo quy định.
Hệ thống MUST validate: Tên hàng không được rỗng, Danh mục bắt buộc chọn, Giá bán phải ≥ 0.

#### Scenario: Tạo thành công sản phẩm với thông tin hợp lệ
- **GIVEN** Người dùng mở modal "+ Thêm hàng hóa"
- **WHEN** Nhập Tên hàng "Nước khoáng Lavie 500ml", chọn Danh mục "Nước giải khát", ĐVT "Chai", Giá bán "6,000", Giá vốn "4,500"
- **AND** Bấm nút "Lưu"
- **THEN** Hệ thống gửi payload `ProductCreateRequest` đến `POST /api/products`
- **AND** Nhận response `201 Created`, hiển thị Toast xanh thông báo "Tạo sản phẩm thành công"
- **AND** Tự động đóng modal và invalidate React Query cache để bảng tải lại sản phẩm mới nhất.

#### Scenario: Trùng mã vạch hoặc mã sản phẩm đã tồn tại (Edge Case)
- **GIVEN** Mã vạch `8936036010022` đã tồn tại trên hệ thống
- **WHEN** Người dùng tạo sản phẩm mới và điền mã vạch `8936036010022` rồi bấm Lưu
- **THEN** Backend trả về mã lỗi `400 Bad Request` kèm thông báo trùng lặp
- **AND** Frontend bắt lỗi, giữ nguyên modal và hiển thị cảnh báo đỏ trực tiếp cho người dùng.

---

### Requirement: REQ-03 Xem Chi tiết Sản phẩm & Danh sách Nhà cung cấp (Product Detail & Suppliers)
Hệ thống Frontend MUST cho phép người dùng click vào dòng sản phẩm để mở `ProductDetailModal`, gọi `GET /api/products/{id}` và `GET /api/products/{id}/suppliers` để hiển thị thông tin chi tiết và danh sách các nhà cung cấp phân phối mặt hàng đó.

#### Scenario: Xem chi tiết sản phẩm có liên kết nhà cung cấp
- **GIVEN** Sản phẩm "Bia Sài Gòn Special" có liên kết với 2 nhà cung cấp
- **WHEN** Người dùng click vào dòng sản phẩm trên bảng
- **THEN** Hệ thống mở Modal chi tiết, hiển thị các thông tin tổng quan, mã vạch, đơn vị tính, định mức tồn kho Min/Max
- **AND** Bảng phụ Nhà cung cấp hiển thị đầy đủ tên nhà cung cấp, mã sản phẩm của NCC, đơn vị giao hàng và giá nhập thỏa thuận.

---

### Requirement: REQ-04 Cập nhật Thông tin Sản phẩm (Update Product)
Hệ thống Frontend MUST cho phép người dùng chỉnh sửa thông tin sản phẩm và gửi tới `PUT /api/products/{id}`.
Nếu người dùng không có quyền quản lý tài chính, ô nhập Giá vốn phải bị ẩn hoặc disabled.

#### Scenario: Cập nhật thành công giá bán và tên sản phẩm
- **GIVEN** Người dùng mở form chỉnh sửa của một sản phẩm hiện có
- **WHEN** Thay đổi Giá bán thành "25,000" và bấm "Cập nhật"
- **THEN** Hệ thống gửi `ProductUpdateRequest` tới `PUT /api/products/{id}`
- **AND** Nhận response `200 OK`, hiển thị thông báo "Cập nhật sản phẩm thành công" và làm mới bảng dữ liệu.

---

### Requirement: REQ-05 Xóa mềm An toàn Bảo toàn Dữ liệu (Soft Delete & BR-DATA-01)
Hệ thống Frontend MUST hiển thị hộp thoại xác nhận khi người dùng bấm xóa sản phẩm.
Khi người dùng xác nhận, hệ thống gọi `DELETE /api/products/{id}` để chuyển trạng thái sang `Discontinued`, không hard-delete dữ liệu để bảo vệ tính toàn vẹn của lịch sử sổ kho và báo cáo theo [BR-DATA-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4763).

#### Scenario: Xác nhận xóa sản phẩm
- **GIVEN** Người dùng click icon "Xóa" trên một dòng sản phẩm
- **WHEN** Hộp thoại xác nhận hiện ra và người dùng bấm "Đồng ý xóa"
- **THEN** Hệ thống gửi `DELETE /api/products/{id}`
- **AND** Hiển thị Toast "Xóa sản phẩm thành công", sản phẩm cập nhật trạng thái hoặc ẩn khỏi danh sách đang kinh doanh.

---

### Requirement: REQ-06 Tích hợp Cây/Danh sách Danh mục Phẳng từ API (Category Integration)
Hệ thống Frontend MUST tải danh sách danh mục từ `GET /api/categories` và hiển thị trên `CategorySidebar`.
Người dùng có thể bấm vào từng danh mục để lọc sản phẩm theo `categoryId`, hoặc bấm "Tất cả" để xem toàn bộ danh mục.

#### Scenario: Lọc sản phẩm theo danh mục được chọn
- **GIVEN** Sidebar hiển thị các danh mục "Đồ uống", "Bánh kẹo", "Hóa mỹ phẩm"
- **WHEN** Người dùng click chọn nhóm "Đồ uống"
- **THEN** URL hoặc State cập nhật `categoryId = <guid-do-uong>` và `pageIndex = 1`
- **AND** Bảng sản phẩm tự động gọi lại API để chỉ hiển thị các mặt hàng thuộc nhóm "Đồ uống".

---

## 3. Acceptance Checklist
- [ ] REQ-01: Bảng sản phẩm phân trang server-side kết nối thành công `GET /api/products`, ẩn cột Giá vốn với Cashier (BR-SEC-01).
- [ ] REQ-02: Tạo sản phẩm qua `POST /api/products`, hỗ trợ tự sinh mã khi để trống, bắt lỗi trùng SKU/Barcode.
- [ ] REQ-03: Modal chi tiết hiển thị dữ liệu từ `GET /api/products/{id}` và danh sách NCC từ `GET /api/products/{id}/suppliers`.
- [ ] REQ-04: Cập nhật sản phẩm qua `PUT /api/products/{id}`, hiển thị phản hồi tức thì.
- [ ] REQ-05: Xóa sản phẩm qua `DELETE /api/products/{id}` (Soft Delete bảo toàn chứng từ theo BR-DATA-01).
- [ ] REQ-06: `CategorySidebar` lấy dữ liệu thật từ `GET /api/categories`, click danh mục lọc chuẩn xác.
