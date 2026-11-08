# Specs: product-management-ui
## Capability: Product Catalog Management (FE-01)
- Dependencies: `exploration.md`, `design-brief.md`, `proposal.md`
- Backend Controllers: [`ProductsController.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/ProductsController.cs), [`CategoriesController.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/CategoriesController.cs), [`ProductUnitsController.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/ProductUnitsController.cs)
- Căn cứ hệ thống: [Report-3 SRS FE-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L1208)

---

## 1. API / Contract

| Method | Path | Request Body / Query Params | Response (Success) | Lỗi xử lý |
|---|---|---|---|---|
| `GET` | `/api/products` | Query: `searchTerm`, `categoryId`, `status`, `pageIndex`, `pageSize` | `200 OK`<br>`ApiResponse<PagedResult<ProductResponse>>` | `400 Bad Request`, `401 Unauthorized` |
| `POST` | `/api/products` | Body: `ProductCreatePayload` | `201 Created`<br>`ApiResponse<ProductResponse>` | `400 Bad Request`, `409 Conflict` |
| `PUT` | `/api/products/{id}` | Body: `ProductUpdatePayload` | `200 OK`<br>`ApiResponse<ProductResponse>` | `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/products/{id}` | Không | `200 OK`<br>`ApiResponse<object>` | `404 Not Found` |
| `GET` | `/api/categories` | Không | `200 OK`<br>`ApiResponse<IReadOnlyList<CategoryDto>>` | `401 Unauthorized` |
| `GET` | `/api/v1/products/{id}/units` | Không | `200 OK`<br>`ApiResponse<IReadOnlyList<ProductUnitResponse>>` | `404 Not Found` |
| `POST` | `/api/v1/products/{id}/units` | Body: `ProductUnitCreatePayload` | `201 Created`<br>`ApiResponse<ProductUnitResponse>` | `400 Bad Request` |
| `PUT` | `/api/v1/product-units/{id}` | Body: `ProductUnitUpdatePayload` | `200 OK`<br>`ApiResponse<ProductUnitResponse>` | `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/v1/product-units/{id}` | Không | `200 OK`<br>`ApiResponse<object>` | `404 Not Found` |

---

## 2. Requirements Hiện tại & Bổ sung

### Requirement: REQ-01 Hiển thị Danh sách Hàng hóa có Phân trang Server-side
Hệ thống Frontend MUST hiển thị danh sách hàng hóa phân trang thông qua API `GET /api/products`.
Mỗi trang hiển thị mặc định 20 sản phẩm (hỗ trợ chuyển đổi 10, 20, 50).
Bảng hiển thị các cột: Mã hàng (ProductCode), Mã vạch (Barcode), Tên hàng, Danh mục, ĐVT cơ sở, Giá bán, Trạng thái hoạt động.

---

### Requirement: REQ-02 Tìm kiếm Đa tiêu chí có Debounce (300ms)
Hệ thống Frontend MUST cung cấp ô tìm kiếm hỗ trợ tra cứu theo tên sản phẩm, mã hàng (SKU) hoặc mã vạch (Barcode).
Hệ thống MUST áp dụng kỹ thuật Debounce 300ms và tự động reset `pageIndex = 1` khi từ khóa tìm kiếm thay đổi.

---

### Requirement: REQ-03 Lọc Sản phẩm theo Danh mục Phẳng (Flat Category Filter)
Hệ thống Frontend MUST tải danh sách danh mục phẳng từ `GET /api/categories` và hiển thị trên `CategorySidebar`.

---

### Requirement: REQ-04 Bảo mật Phân quyền Giá vốn theo Vai trò (BR-SEC-01)
Hệ thống Frontend MUST tuân thủ nghiêm ngặt quy tắc [BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4759):
- Nếu người dùng đăng nhập có vai trò `StoreOwner` hoặc `Admin`: Bảng hiển thị cột "Giá vốn" (`CostPrice`).
- Nếu người dùng đăng nhập có vai trò `Cashier` hoặc `Staff`: Bảng ẩn hoàn toàn cột "Giá vốn" và không hiển thị thông tin biên độ lãi.

---

### Requirement: REQ-05 Điều kiện kích hoạt Thêm Đơn vị Quy đổi trong Modal Hàng hóa (ProductFormModal)
Nút `+ Thêm đơn vị` trong phần "Đơn vị tính" của [`ProductFormModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx) MUST yêu cầu người dùng đã nhập "Tên đơn vị cơ bản" (`baseUnit.trim() !== ''`).
- Nếu chưa nhập `baseUnit`: Nút `+ Thêm đơn vị` bị vô hiệu hóa (disabled với style xám mờ `opacity: 0.5`, `cursor: not-allowed`), đồng thời hiển thị thông báo: "Vui lòng nhập tên đơn vị cơ bản trước khi thêm đơn vị quy đổi."
- Khi `baseUnit` có giá trị hợp lệ: Nút `+ Thêm đơn vị` chuyển sang trạng thái kích hoạt (màu xanh #0F766E, cursor: pointer).

---

### Requirement: REQ-06 Hiển thị Bảng "Hàng cùng loại" trong Modal Hàng hóa (ProductFormModal)
Khi sản phẩm có thêm đơn vị tính quy đổi (`uomConversions.length > 0`), modal MUST hiển thị bảng **"Hàng cùng loại"** bên dưới phần đơn vị tính.
- Cấu trúc bảng gồm 8 cột: Đơn vị, Quy đổi, Mã hàng, Mã vạch, Giá vốn, Giá bán, Tồn kho, Xóa.
- Dòng đơn vị cơ bản: Quy đổi cố định 1 (disabled bg xám), Mã hàng tự động, Giá vốn/bán/tồn kho đồng bộ 2 chiều với các trường chính.
- Dòng đơn vị quy đổi: Quy đổi nhập, Mã vạch nhập, Giá vốn & Tồn kho tự tính hiển thị nền xám, Giá bán nhập riêng, nút Xóa hàng.

---

### Requirement: REQ-07 Lựa chọn Hiển thị Đơn vị Tính trên Danh sách Hàng hóa (ProductListPage)
Trong bảng danh sách sản phẩm ([`ProductListPage.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/pages/ProductListPage.tsx)), tại cột **Tên hàng hóa**:
- Nếu sản phẩm có đơn vị quy đổi (`uomConversions && uomConversions.length > 0`):
  - Hiển thị: `[Tên sản phẩm] - [đơn vị đang chọn] ⌵` (chữ xanh).
  - Khi click vào mở popover menu chỉ hiển thị các đơn vị khác có thể chuyển đổi.
  - Khi chọn một đơn vị: Cập nhật tên hiển thị, mã hàng và giá bán tương ứng trên bảng.

---

### Requirement: REQ-08 Chuyển đổi Đơn vị tính và Cập nhật Chi tiết Hàng hóa (ProductDetailModal)
Trong modal xem chi tiết sản phẩm ([`ProductDetailModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductDetailModal.tsx)):
1. Hệ thống MUST cung cấp bộ chọn đơn vị tính (Segmented Pills) trên thanh Header khi sản phẩm có đơn vị quy đổi (`uomConversions && uomConversions.length > 0`).
2. Hệ thống MUST cho phép click trực tiếp vào từng dòng trong bảng "Đơn vị tính & Quy đổi giá" để chuyển sang đơn vị đó.
3. Khi người dùng chuyển đổi đơn vị tính:
   - Toàn bộ các chỉ số Mã hàng, Mã vạch, Giá bán, Giá vốn (StoreOwner BR-SEC-01), Tồn kho nguyên kèm số lượng lẻ dư được cập nhật đồng bộ tức thời.

---

### Requirement: REQ-09 Cập nhật Hàng hóa và Đồng bộ Đơn vị tính Quy đổi (Update Product & Units)
Khi người dùng thực hiện cập nhật thông tin hàng hóa trong [`ProductFormModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx):
1. **Khóa Mã hàng (ProductCode)**:
   - Khi ở chế độ chỉnh sửa (`isEditing === true`), ô nhập "Mã hàng" MUST ở trạng thái `disabled` (nền xám nhẹ `#F1F5F9`, con trỏ `not-allowed`).
2. **Nạp đầy đủ Đơn vị tính khi Mở Form**:
   - Nếu `productToEdit.id` là GUID và `productToEdit.uomConversions` rỗng, hệ thống MUST tự động gọi `productApi.getProductUnits` để nạp danh sách đơn vị quy đổi hiện có lên form.
3. **Theo dõi Đơn vị bị Xóa (`deletedUnitIds`)**:
   - Khi người dùng bấm xóa một đơn vị quy đổi đã có trong DB (ID không bắt đầu bằng `uom-`), hệ thống MUST ghi nhận ID vào danh sách `deletedUnitIds`.
4. **Đồng bộ Lưu dữ liệu**:
   - Khi người dùng bấm "Lưu":
     - Gửi `PUT /api/v1/products/{id}` cập nhật thông tin sản phẩm.
     - Gửi `DELETE /api/v1/product-units/{id}` cho từng ID trong `deletedUnitIds`.
     - Với các đơn vị trong `uomConversions`:
       - Đơn vị mới (`uom-*`): gửi `POST /api/v1/products/{id}/units`.
       - Đơn vị đã có (GUID): gửi `PUT /api/v1/product-units/{id}` cập nhật `unitName`, `conversionRate`, `price`, `barcode`.
5. **Cập nhật lại giao diện**:
   - Đóng modal, làm mới danh sách sản phẩm và thông báo toast thành công: `Cập nhật hàng hóa "[Tên]" thành công.`

---

### Requirement: REQ-10 Cải tiến UI/UX Form Thêm/Sửa Hàng Hóa (ProductFormModal)
Trong modal [`ProductFormModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx):
1. **Độ rộng Modal (Max-width)**:
   - Tăng độ rộng tối đa của modal lên `maxWidth: 1160px` và `width: 96vw` giúp các cột trong bảng "Hàng cùng loại" và form hiển thị thông thoáng.
2. **Lightbox Xem Chi Tiết Ảnh Phóng To**:
   - Khi có ảnh tải lên, bấm vào nút "Xem to" ở ảnh chính hoặc bấm vào ảnh thumbnail MUST mở modal popup phóng to (Lightbox) hiển thị ảnh kích thước đầy đủ với nút đóng tiện lợi.
3. **Tìm kiếm Nhóm hàng Đa ngữ (Tiếng Việt có dấu & không dấu)**:
   - Ô tìm kiếm nhóm hàng MUST hỗ trợ chuẩn hóa tiếng Việt bỏ dấu (sử dụng NFD normalization), cho phép tìm "do uong" vẫn lọc ra "Đồ uống", "banh keo" lọc ra "Bánh kẹo".
4. **Loại bỏ Số 0 ở Đầu Input Số (Leading Zero Handling)**:
   - Các trường số (`costPrice`, `sellingPrice`, `initialStock`, `minStock`, `maxStock`, `conversionRate`, `price`, `vatRate`) khi có giá trị 0 MUST hiển thị placeholder "0" thay vì ký tự số "0", kết hợp `onFocus={(e) => e.target.select()}` để khi gõ không bị tình trạng số 0 ở đầu (ví dụ: `010000`).
5. **Đơn vị Tính Cơ Bản Không Mặc Định 'chai'**:
   - Ô "Tên đơn vị cơ bản" MUST để trống mặc định (`''`) với placeholder gợi ý `"VD: Chai, Lon, Gói, Hộp..."`, không gán cứng "chai".
6. **Tự Động Tính Tiền Đơn Vị Quy Đổi theo Đơn Vị Cơ Bản**:
   - Khi người dùng thay đổi tỷ lệ quy đổi (`conversionRate`) của đơn vị quy đổi, hệ thống MUST tự động tính giá bán: `price = conversionRate * sellingPrice`.
7. **Cải tiến Thuế Suất VAT (%)**:
   - Trường Thuế suất VAT hỗ trợ cả ô nhập tỷ lệ phần trăm tùy biến và hàng nút chọn nhanh chuẩn (`0%`, `5%`, `8%`, `10%`) giúp thao tác nhanh và linh hoạt.
8. **Popup Cảnh Báo Validation thay vì Thông Báo trên Form**:
   - Khi người dùng gửi form thiếu thông tin bắt buộc hoặc nhập số liệu không hợp lệ, hệ thống MUST hiển thị Modal Popup cảnh báo trực quan ("Thông tin chưa hợp lệ" kèm nút "Đã hiểu") thay vì hiển thị banner thông báo màu đỏ ở đầu form bị khuất tầm nhìn.

---

## 3. Acceptance Checklist
- [ ] REQ-01: Danh sách sản phẩm phân trang Server-side chính xác.
- [ ] REQ-02: Ô tìm kiếm Debounce 300ms và tự động reset trang 1.
- [ ] REQ-03: Lọc danh mục phẳng chính xác từ backend.
- [ ] REQ-04: Phân quyền giá vốn theo vai trò (BR-SEC-01).
- [ ] REQ-05: Nút "+ Thêm đơn vị" yêu cầu nhập tên đơn vị cơ bản trước.
- [ ] REQ-06: Bảng "Hàng cùng loại" xuất hiện và đồng bộ 2 chiều khi có đơn vị quy đổi.
- [ ] REQ-07: Dropdown đơn vị tính trên danh sách sản phẩm cho phép đổi đơn vị hiển thị và giá.
- [ ] REQ-08: Modal Chi tiết Sản phẩm (`ProductDetailModal`) cho phép switch đơn vị tính, cập nhật giá bán, giá vốn (StoreOwner), tồn kho, mã hàng, mã vạch tương ứng.
- [ ] REQ-09: Chức năng Cập nhật Hàng hóa (`ProductFormModal` & `handleSaveProduct`) khóa mã hàng, đồng bộ đầy đủ các thao tác Thêm / Sửa / Xóa đơn vị tính quy đổi lên Backend API.
- [ ] REQ-10: Cải tiến Form Hàng hóa (`ProductFormModal`): Max-width rộng 1160px, popup phóng to ảnh (Lightbox), tìm kiếm nhóm hàng tiếng Việt không dấu, loại bỏ số 0 ở đầu input số, đơn vị cơ bản không mặc định chai, tự tính giá theo đơn vị cơ bản, chọn nhanh thuế VAT, và popup cảnh báo validation.
- [ ] REQ-11: Tinh gọn Form Master Product (`ProductFormModal`): Loại bỏ hoàn toàn Section 3 "Tồn kho & Định mức cảnh báo" (tồn kho ban đầu, minStock, maxStock), loại bỏ checkbox "Quản lý theo lô (FEFO)" và cột Tồn kho trong bảng đơn vị tính theo chuẩn Mô hình Phân lớp giá (Layer 1).

---

## 4. MODIFIED Requirements (Mô hình Phân lớp Giá - Master Product Form)

### Requirement: REQ-11 Loại bỏ Trường Tồn kho & Quản lý Lô khỏi Form Master Product (`ProductFormModal`)
Theo đặc tả phân lớp giá (`pricing-layers-business-model.md`), Master Product toàn chuỗi không quản lý số lượng tồn kho hay định mức tồn kho chi nhánh:
1. **Loại bỏ Section 3**: Xóa bỏ hoàn toàn cụm "Tồn kho & Định mức cảnh báo" gồm:
   - Ô nhập "Tồn kho ban đầu" (`initialStock`)
   - Ô nhập "Định mức tồn thấp nhất" (`minStock`)
   - Ô nhập "Định mức tồn cao nhất" (`maxStock`)
2. **Loại bỏ Thuộc tính Quản lý theo lô**:
   - Xóa bỏ checkbox "Quản lý theo lô & hạn sử dụng (FEFO)" (`hasBatches`).
   - Giữ lại checkbox "Đánh dấu hàng bán chạy / yêu thích (Ưu tiên POS)" (`isFavorite`).
3. **Loại bỏ Cột Tồn kho trong Bảng Đơn vị tính**:
   - Xóa bỏ cột "Tồn kho" khỏi bảng "Hàng cùng loại" (bảng UOM conversion) của modal tạo/sửa Master Product.
4. **Validation & Payload**:
   - Bỏ các rule validation kiểm tra `minStock < 0` và `maxStock < minStock`.
   - Payload gửi lên API `POST /api/products` và `PUT /api/products/{id}` không còn truyền các trường `minStock`, `maxStock`, `hasBatches`, `onHand`.

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: product-images-and-unit-codes -->
# Specs: product-images-and-unit-codes

## API / Contract

| Method | Path | Request Body | Response Body | Mã lỗi |
|---|---|---|---|---|
| `POST` | `/api/v1/products` | `ProductCreateRequest` (kèm `imageUrls: List<string>?`) | `ApiResponse<ProductResponse>` | 400 Bad Request, 401 Unauthorized, 409 Conflict |
| `PUT` | `/api/v1/products/{id}` | `ProductUpdateRequest` (kèm `imageUrls: List<string>?`) | `ApiResponse<ProductResponse>` | 400 Bad Request, 404 Not Found, 409 Conflict |
| `GET` | `/api/v1/products/{id}` | — | `ApiResponse<ProductResponse>` (kèm `imageUrls: List<string>`, `imageUrl: string?`) | 404 Not Found |
| `POST` | `/api/v1/products/{productId}/units` | `ProductUnitCreateRequest` | `ApiResponse<ProductUnitResponse>` | 400 Bad Request, 409 Conflict |
| `PUT` | `/api/v1/product-units/{id}` | `ProductUnitUpdateRequest` | `ApiResponse<ProductUnitResponse>` | 400 Bad Request, 404 Not Found, 409 Conflict |

---

## ADDED Requirements

### Requirement: REQ-01 Hỗ trợ Nhiều Ảnh Sản Phẩm (PostgreSQL Native Array)
Entity `Product` MUST lưu trữ danh sách ảnh qua thuộc tính `List<string> ImageUrls { get; set; } = new();`, ánh xạ trực tiếp sang cột `text[]` trong PostgreSQL thông qua EF Core Npgsql.
Hệ thống MUST tự động trích xuất ảnh đầu tiên (`ImageUrls[0]`) làm ảnh đại diện thông qua thuộc tính tính toán `[NotMapped] public string? ImageUrl => ImageUrls.FirstOrDefault();` để đảm bảo tương thích ngược 100%.

#### Scenario: Thêm sản phẩm kèm danh sách nhiều ảnh
- **GIVEN** Người dùng gửi `ProductCreateRequest` với danh sách 3 URL ảnh.
- **WHEN** Backend lưu sản phẩm vào PostgreSQL.
- **THEN** Cột `ImageUrls` (`text[]`) lưu đủ 3 đường dẫn, và `ProductResponse.ImageUrl` trả về đúng ảnh đầu tiên.

#### Scenario: Sắp xếp đổi ảnh đại diện
- **GIVEN** Sản phẩm có 3 ảnh. Người dùng bấm "Đặt chính" cho ảnh thứ hai trên giao diện.
- **WHEN** Frontend đưa ảnh thứ hai lên vị trí index 0 và gửi `ProductUpdateRequest`.
- **THEN** Backend cập nhật mảng `ImageUrls`, phần tử `ImageUrls[0]` trở thành ảnh đại diện mới.

#### Scenario: Edge Case - Xóa hết ảnh của sản phẩm khi cập nhật
- **GIVEN** Sản phẩm đang có 2 ảnh. Người dùng xóa hết ảnh và gửi `ProductUpdateRequest` với `imageUrls: []`.
- **WHEN** Backend xử lý cập nhật.
- **THEN** Hệ thống lưu mảng rỗng `{}`, đồng thời `Product.ImageUrl` trả về `null`.

---

### Requirement: REQ-02 Không Lưu Mã Hàng Trong ProductUnit, UI Mặc Định Lấy Theo Mã Sản Phẩm
Entity `ProductUnit` MUST NOT lưu trường mã hàng (`UnitCode` / `ProductCode`) trong cơ sở dữ liệu.
Trên giao diện người dùng (UI), `productCode` của `ProductUnit` MUST mặc định hiển thị giống với `productCode` của sản phẩm cha.

#### Scenario: Thêm đơn vị quy đổi trong Form
- **GIVEN** Người dùng tạo sản phẩm với mã `SP00123`. Người dùng thêm đơn vị quy đổi "Thùng".
- **WHEN** Bảng "Hàng cùng loại" hiển thị dòng đơn vị mới.
- **THEN** Cột "Mã hàng" hiển thị `SP00123` (ở trạng thái disabled). Khi lưu, backend chỉ lưu `UnitName`, `ConversionRate`, `Price`, `Barcode` mà không lưu trường mã hàng.

#### Scenario: Xem chi tiết sản phẩm theo đơn vị quy đổi
- **GIVEN** Sản phẩm có mã `SP00123` và đơn vị quy đổi "Thùng".
- **WHEN** Người dùng mở modal xem chi tiết và chuyển sang đơn vị "Thùng".
- **THEN** Mã hàng trên header và trong bảng Đơn vị tính hiển thị `SP00123`.

---

### Requirement: REQ-03 Giao Diện Quản Lý Nhiều Ảnh trong ProductFormModal
Component [`ProductFormModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx) MUST cho phép:
1. Upload nhiều file ảnh đồng thời lên Cloudinary.
2. Hiển thị danh sách ảnh thumbnail có đánh dấu ảnh đại diện (`Badge` "Chính", viền xanh `#0D9488`).
3. Cho phép click nút "Đặt chính" ở bất kỳ ảnh phụ nào để đưa ảnh đó lên đầu danh sách (`index 0`).
4. Nút xóa từng ảnh khỏi danh sách.
5. Cột Mã hàng trong bảng "Hàng cùng loại" hiển thị mặc định theo mã sản phẩm cha.

#### Scenario: Thêm 3 ảnh và chọn ảnh thứ hai làm đại diện
- **GIVEN** Người dùng mở modal thêm sản phẩm và tải lên 3 file ảnh.
- **WHEN** 3 ảnh upload thành công và hiển thị trong danh sách ảnh, người dùng click nút "Đặt chính" ở ảnh thứ hai.
- **THEN** Ảnh thứ hai được chuyển lên vị trí index 0, nhận nhãn "Chính" và viền xanh, ảnh đầu tiên lùi xuống vị trí phụ.

---

### Requirement: REQ-04 Cố Định Kích Thước W-H và Header/Footer trong ProductDetailModal
Component [`ProductDetailModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductDetailModal.tsx) MUST:
1. Cố định kích thước: `maxWidth: 1160px, width: '96vw', height: '88vh', maxHeight: '88vh'`.
2. Áp dụng layout Flexbox 3 tầng:
   - **Header cố định** (`flexShrink: 0`): Tiêu đề, mã sản phẩm, pills chuyển đổi đơn vị.
   - **Tab Body cuộn độc lập** (`flex: 1, overflowY: 'auto'`): Khi người dùng click chuyển qua lại giữa các Tab (Thông tin, Mô tả, Thẻ kho, Tồn kho), kích thước khung modal KHÔNG được thay đổi hay co giãn.
   - **Footer cố định** (`flexShrink: 0`): Các nút thao tác (Xóa, Sao chép, Ngừng kinh doanh, Chỉnh sửa, Đóng).

#### Scenario: Chuyển đổi tab không làm thay đổi kích thước modal
- **GIVEN** Modal chi tiết sản phẩm đang mở ở tab "Thông tin".
- **WHEN** Người dùng click chuyển sang tab "Thẻ kho" (nơi có bảng dữ liệu dài).
- **THEN** Chiều cao và chiều rộng của modal giữ nguyên 100% không suy suyển; chỉ có phần thân bảng thẻ kho cuộn nội dung độc lập bên trong body.

---

### Requirement: REQ-05 Binding Dữ Liệu Thật và Gallery Ảnh trong ProductDetailModal
Trong [`ProductDetailModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductDetailModal.tsx):
1. Trường "Mô tả": MUST hiển thị dữ liệu thực tế `product.description` (nếu không có thì hiển thị `"Chưa có mô tả chi tiết cho hàng hóa này."`).
2. Trường "Ghi chú nội bộ": MUST hiển thị dữ liệu thực tế `product.internalNote` (nếu không có thì hiển thị `"Chưa có ghi chú nội bộ."`).
3. Khu vực hình ảnh: MUST hỗ trợ Gallery xem nhiều ảnh (khung ảnh hiển thị ảnh đang chọn + nhãn "Chính" cho ảnh 0 + dải thumbnails bên dưới để bấm chuyển đổi ảnh xem + nút mở Lightbox phóng to).
4. Bảng Đơn vị tính: Hiển thị mã hàng của đơn vị tính mặc định theo mã sản phẩm cha `product.productCode`.

#### Scenario: Xem sản phẩm có mô tả và nhiều ảnh
- **GIVEN** Sản phẩm từ API có `description: "Bánh quy bơ cao cấp"`, `internalNote: "Hạn dùng 12 tháng"` và 3 ảnh trong `imageUrls`.
- **WHEN** Người dùng mở modal xem chi tiết.
- **THEN** Modal hiển thị đúng nội dung mô tả và ghi chú thực tế; khu vực hình ảnh hiển thị ảnh chính kèm 3 thumbnail bên dưới cho phép click chọn xem từng ảnh.

---

## Acceptance Checklist
- [ ] REQ-01: Backend hỗ trợ `List<string> ImageUrls` lưu vào PostgreSQL kiểu `text[]`, migration EF Core thành công, tự động trích xuất `Product.ImageUrl` theo ảnh đầu tiên.
- [ ] REQ-02: Entity `ProductUnit` không lưu mã hàng trong DB; UI hiển thị mã hàng đơn vị mặc định theo mã sản phẩm cha.
- [ ] REQ-03: `ProductFormModal` hỗ trợ upload nhiều ảnh, chọn ảnh đại diện, xóa ảnh, bảng "Hàng cùng loại" hiển thị mã hàng theo mã sản phẩm cha.
- [ ] REQ-04: `ProductDetailModal` cố định kích thước (`1160px` x `88vh`), Header và Footer cố định, cuộn mượt mà ở tab body và không đổi kích thước khi chuyển tab.
- [ ] REQ-05: `ProductDetailModal` nạp dữ liệu thực tế cho Mô tả, Ghi chú nội bộ, hiển thị mã đơn vị tính theo mã sản phẩm cha và Gallery nhiều ảnh có Lightbox.


<!-- Sáp nhập từ change: backend-cloudinary-upload -->
# Specs: backend-cloudinary-upload

## API / Contract
| Method | Path | Request Body | Response Body | Error Codes |
|---|---|---|---|---|
| POST | `/api/v1/media/upload` | `multipart/form-data`: `file` (IFormFile, $\le 5\text{MB}$), `folder` (optional string) | `200 OK`: `{ url: string, publicId: string, format: string, bytes: number, width: number, height: number }` | `400 Bad Request` (File rỗng, sai format, >5MB), `401 Unauthorized`, `500 Internal Error` |

---

## ADDED Requirements

### Requirement: REQ-MEDIA-01 Upload ảnh an toàn qua Backend lên Cloudinary
Hệ thống **MUST** cung cấp endpoint `POST /api/v1/media/upload` để tiếp nhận tệp ảnh từ người dùng đã đăng nhập, sử dụng thư viện `CloudinaryDotNet` để stream tệp lên dịch vụ lưu trữ đám mây Cloudinary và trả về đường dẫn an toàn HTTPS (`secure_url`).

#### Scenario: Người dùng tải lên ảnh sản phẩm hợp lệ thành công
- **GIVEN** Người dùng đã đăng nhập với JWT token hợp lệ và chọn file ảnh `tra-xanh.jpg` có dung lượng 1.2MB
- **WHEN** Gửi request `POST /api/v1/media/upload` với file `tra-xanh.jpg` và `folder = "mtgrms/products"`
- **THEN** Hệ thống phản hồi HTTP 200 OK với body chứa trường `url` bắt đầu bằng `https://res.cloudinary.com/` và trường `publicId` tương ứng.

#### Scenario: Người dùng chưa đăng nhập cố gắng tải ảnh
- **GIVEN** Request không kèm header `Authorization` hoặc token JWT không hợp lệ / hết hạn
- **WHEN** Gửi request `POST /api/v1/media/upload`
- **THEN** Hệ thống MUST từ chối với mã lỗi HTTP 401 Unauthorized.

---

### Requirement: REQ-MEDIA-02 Kiểm duyệt kích thước và định dạng file tải lên
Hệ thống **MUST** kiểm tra tính hợp lệ của tệp tải lên trước khi truyền tải lên Cloudinary:
- Dung lượng tệp không được vượt quá 5MB ($5 \times 1024 \times 1024$ bytes).
- Phần mở rộng của tệp chỉ được thuộc danh sách cho phép: `.jpg`, `.jpeg`, `.png`, `.webp`.
- Tệp không được rỗng (Length > 0).

#### Scenario: Tải lên file vượt quá giới hạn 5MB
- **GIVEN** Người dùng chọn một file ảnh `poster.png` có dung lượng 6.5MB
- **WHEN** Gửi request `POST /api/v1/media/upload`
- **THEN** Hệ thống MUST trả về HTTP 400 Bad Request với thông báo: "Kích thước ảnh vượt quá giới hạn tối đa 5MB."

#### Scenario: Tải lên tệp không đúng định dạng ảnh
- **GIVEN** Người dùng chọn một tệp văn bản hoặc thực thi `document.pdf` hoặc `script.exe`
- **WHEN** Gửi request `POST /api/v1/media/upload`
- **THEN** Hệ thống MUST trả về HTTP 400 Bad Request với thông báo: "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận các định dạng: .jpg, .jpeg, .png, .webp."

#### Scenario: Gửi request rỗng không đính kèm file
- **GIVEN** Request `POST /api/v1/media/upload` với form data không có trường `file` hoặc file có dung lượng 0 bytes
- **WHEN** Gửi request đến server
- **THEN** Hệ thống MUST trả về HTTP 400 Bad Request với thông báo: "File rỗng hoặc không được cung cấp."

---

### Requirement: REQ-MEDIA-03 Tích hợp tải ảnh tại giao diện Tạo / Sửa sản phẩm
Giao diện `ProductFormModal.tsx` **SHALL** cho phép người dùng chọn tệp ảnh từ máy tính, tự động gọi API upload ở backend, hiển thị trạng thái đang tải (loading) và hiển thị ảnh xem trước (preview) sau khi tải thành công. Khi lưu sản phẩm, URL ảnh trên Cloudinary **MUST** được đính kèm vào payload gửi đến API sản phẩm.

#### Scenario: Chọn file ảnh từ máy tính trong ProductFormModal
- **GIVEN** Người dùng đang mở modal `ProductFormModal` để tạo sản phẩm mới
- **WHEN** Người dùng click khung tải ảnh và chọn file `banh-quy.png`
- **THEN** Modal hiển thị thông báo/spinner "Đang tải ảnh lên...", gọi API backend upload ảnh, nhận về URL Cloudinary và hiển thị ảnh xem trước, đồng thời cho phép gỡ ảnh nếu muốn.

---

## MODIFIED Requirements
*(Không có)*

## REMOVED Requirements
*(Không có)*

---

## Acceptance checklist
- [ ] Backend cài đặt package `CloudinaryDotNet` và đọc cấu hình từ `appsettings.json`.
- [ ] `POST /api/v1/media/upload` hoạt động và yêu cầu JWT Authentication.
- [ ] Validation từ chối file > 5MB hoặc file không phải ảnh (.jpg, .jpeg, .png, .webp) với mã lỗi 400.
- [ ] `ProductFormModal.tsx` upload ảnh thật lên Cloudinary qua backend và hiển thị preview mượt mà.
- [ ] Toàn bộ unit tests cho `CloudinaryService` / `MediaController` và frontend chạy pass.
