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
- Cấu trúc bảng gồm 8 cột: Đơn vị, Quy đổi, Mã hàng, Mã vạch, Giá vốn, Giá bán, Đơn vị nhập, Xóa.
- Dòng đơn vị cơ bản: Quy đổi cố định 1 (disabled bg xám), Mã hàng tự động, Giá vốn/bán đồng bộ 2 chiều với các trường chính.
- Dòng đơn vị quy đổi: Quy đổi nhập, Mã vạch nhập, Giá vốn tự tính hiển thị nền xám, Giá bán nhập riêng, nút Xóa hàng.

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
   - Các trường số (`costPrice`, `sellingPrice`, `conversionRate`, `price`) khi có giá trị 0 MUST hiển thị placeholder "0" thay vì ký tự số "0", kết hợp `onFocus={(e) => e.target.select()}` để khi gõ không bị tình trạng số 0 ở đầu (ví dụ: `010000`).
5. **Đơn vị Tính Cơ Bản Không Mặc Định 'chai'**:
   - Ô "Tên đơn vị cơ bản" MUST để trống mặc định (`''`) với placeholder gợi ý `"VD: Chai, Lon, Gói, Hộp..."`, không gán cứng "chai".
6. **Tự Động Tính Tiền Đơn Vị Quy Đổi theo Đơn Vị Cơ Bản**:
   - Khi người dùng thay đổi tỷ lệ quy đổi (`conversionRate`) của đơn vị quy đổi, hệ thống MUST tự động tính giá bán: `price = conversionRate * sellingPrice`.
7. **Popup Cảnh Báo Validation kết hợp Real-time Inline Validation**:
   - Khi người dùng gửi form thiếu thông tin bắt buộc hoặc nhập số liệu không hợp lệ, hệ thống MUST hiển thị Modal Popup cảnh báo trực quan ("Thông tin chưa hợp lệ" kèm nút "Đã hiểu") đồng thời hiển thị lỗi trực tiếp dưới từng ô input.

---

### Requirement: REQ-12 Rút gọn Hiển thị Tên Nhóm hàng Dài (`...`) kèm Tooltip
Trong [`CategorySidebar.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/CategorySidebar.tsx) và cột **Nhóm hàng** trong [`ProductListPage.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/pages/ProductListPage.tsx):
- Nếu tên nhóm hàng quá dài, hệ thống MUST rút gọn hiển thị bằng một phần thông tin kèm dấu `...` (`textOverflow: 'ellipsis'`, `overflow: 'hidden'`, `whiteSpace: 'nowrap'`) và gắn thuộc tính `title={cat.name}` để hiển thị đầy đủ khi rê chuột.

---

### Requirement: REQ-13 Trang Quản lý Danh sách Nhóm hàng (`CategoryListPage`)
Hệ thống Frontend MUST cung cấp trang [`CategoryListPage.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/pages/CategoryListPage.tsx) tại route `/products/categories` và menu điều hướng `"Nhóm hàng"` trên `AppTopNav.tsx`:
1. **Sidebar bộ lọc bên trái**: Lọc theo trạng thái chứa hàng (Tất cả, Đang có sản phẩm, Nhóm hàng trống) và chọn số dòng hiển thị.
2. **Thanh công cụ & Tìm kiếm**: Tìm kiếm nhanh theo tên, mã hoặc mô tả nhóm hàng (hỗ trợ tiếng Việt không dấu), sắp xếp theo tên/mã/số lượng SP, chọn ẩn/hiện cột, xuất CSV và nút `+ Nhóm hàng` (chỉ hiển thị với vai trò quản lý).
3. **Bảng danh sách & Thao tác**: Hiển thị Mã nhóm, Tên nhóm (rút gọn `...`), Mô tả, Số lượng hàng hóa (kèm nút chuyển sang trang danh sách hàng hóa lọc theo nhóm đó), thao tác Sửa và Xóa (chặn xóa nếu `productCount > 0`).

---

### Requirement: REQ-14 Hiển thị Validate Trực tiếp Khi Đang Nhập Input (Real-time Inline Validation)
Trong cả [`CategoryModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/CategoryModal.tsx) và [`ProductFormModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx):
1. **CategoryModal**:
   - Hiển thị bộ đếm ký tự trực tiếp (`name.length/100`, `code.length/30`, `description.length/500`).
   - Hiển thị viền đỏ (`#EF4444`) và dòng thông báo lỗi đỏ ngay dưới từng ô input khi người dùng nhập tên trống, vượt độ dài, hoặc nhập mã nhóm hàng chứa khoảng trắng/chữ có dấu/ký tự đặc biệt ngoài `^[A-Z0-9_-]+$`.
2. **ProductFormModal**:
   - Hiển thị bộ đếm ký tự và cảnh báo lỗi đỏ trực tiếp dưới từng trường ngay khi đang gõ: `productCode` (`<= 50`, `^[A-Za-z0-9_-]+$`), `barcode` (`<= 50`, không khoảng trắng, không trùng barcode ĐVT quy đổi), `productName` (bắt buộc, `<= 200`), `categoryId` (bắt buộc chọn), `costPrice` & `sellingPrice` (`0..1.000.000.000 đ`), `baseUnit` (bắt buộc, `<= 30`), `description` (`<= 1000`), `internalNote` (`<= 500`).
   - Trên từng dòng đơn vị quy đổi (`uomConversions`) và trong bảng **Hàng cùng loại**: Báo lỗi đỏ trực tiếp khi tên đơn vị trống, `> 30` ký tự, trùng tên với đơn vị cơ bản/đơn vị khác, tỷ lệ quy đổi `<= 0`, giá bán `> 1 tỷ`, hoặc mã vạch đơn vị trùng lặp/chứa khoảng trắng.

---

## 3. Acceptance Checklist
- [x] REQ-01: Danh sách sản phẩm phân trang Server-side chính xác.
- [x] REQ-02: Ô tìm kiếm Debounce 300ms và tự động reset trang 1.
- [x] REQ-03: Lọc danh mục phẳng chính xác từ backend.
- [x] REQ-04: Phân quyền giá vốn theo vai trò (BR-SEC-01).
- [x] REQ-05: Nút "+ Thêm đơn vị" yêu cầu nhập tên đơn vị cơ bản trước.
- [x] REQ-06: Bảng "Hàng cùng loại" xuất hiện và đồng bộ 2 chiều khi có đơn vị quy đổi.
- [x] REQ-07: Dropdown đơn vị tính trên danh sách sản phẩm cho phép đổi đơn vị hiển thị và giá.
- [x] REQ-08: Modal Chi tiết Sản phẩm (`ProductDetailModal`) cho phép switch đơn vị tính, cập nhật giá bán, giá vốn (StoreOwner), tồn kho, mã hàng, mã vạch tương ứng.
- [x] REQ-09: Chức năng Cập nhật Hàng hóa (`ProductFormModal` & `handleSaveProduct`) khóa mã hàng, đồng bộ đầy đủ các thao tác Thêm / Sửa / Xóa đơn vị tính quy đổi lên Backend API.
- [x] REQ-10: Cải tiến Form Hàng hóa (`ProductFormModal`): Max-width rộng 1160px, popup phóng to ảnh (Lightbox), tìm kiếm nhóm hàng tiếng Việt không dấu, loại bỏ số 0 ở đầu input số, đơn vị cơ bản không mặc định chai, tự tính giá theo đơn vị cơ bản, và popup cảnh báo validation.
- [x] REQ-11: Tinh gọn Form Master Product (`ProductFormModal`): Loại bỏ hoàn toàn Section 3 "Tồn kho & Định mức cảnh báo" và cột Tồn kho trong bảng đơn vị tính theo chuẩn Mô hình Phân lớp giá (Layer 1).
- [x] REQ-12: Rút gọn tên nhóm hàng dài bằng `...` kèm tooltip đầy đủ trên `CategorySidebar` và `ProductListPage`.
- [x] REQ-13: Trang Quản lý Nhóm hàng (`CategoryListPage`) đầy đủ tính năng tìm kiếm, lọc, phân trang, xuất CSV, thêm/sửa/xóa nhóm hàng.
- [x] REQ-14: Hiển thị validate trực tiếp khi đang nhập input (Real-time Inline Validation) trên `CategoryModal` và `ProductFormModal`.

---

## 4. MODIFIED Requirements (Mô hình Phân lớp Giá - Master Product Form)

### Requirement: REQ-11 Loại bỏ Trường Tồn kho khỏi Form Master Product (`ProductFormModal`)
Theo đặc tả phân lớp giá (`pricing-layers-business-model.md`), Master Product toàn chuỗi không quản lý số lượng tồn kho hay định mức tồn kho chi nhánh:
1. **Loại bỏ Section 3**: Xóa bỏ hoàn toàn cụm "Tồn kho & Định mức cảnh báo" gồm:
   - Ô nhập "Tồn kho ban đầu" (`initialStock`)
   - Ô nhập "Định mức tồn thấp nhất" (`minStock`)
   - Ô nhập "Định mức tồn cao nhất" (`maxStock`)
2. **Loại bỏ Cột Tồn kho trong Bảng Đơn vị tính**:
   - Xóa bỏ cột "Tồn kho" khỏi bảng "Hàng cùng loại" (bảng UOM conversion) của modal tạo/sửa Master Product.

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

---

### Requirement: REQ-02 Không Lưu Mã Hàng Trong ProductUnit, UI Mặc Định Lấy Theo Mã Sản Phẩm
Entity `ProductUnit` MUST NOT lưu trường mã hàng (`UnitCode` / `ProductCode`) trong cơ sở dữ liệu.
Trên giao diện người dùng (UI), `productCode` của `ProductUnit` MUST mặc định hiển thị giống với `productCode` của sản phẩm cha.

---

### Requirement: REQ-03 Giao Diện Quản Lý Nhiều Ảnh trong ProductFormModal
Component [`ProductFormModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx) MUST cho phép:
1. Upload nhiều file ảnh đồng thời lên Cloudinary.
2. Hiển thị danh sách ảnh thumbnail có đánh dấu ảnh đại diện (`Badge` "Chính", viền xanh `#0D9488`).
3. Cho phép click nút "Đặt chính" ở bất kỳ ảnh phụ nào để đưa ảnh đó lên đầu danh sách (`index 0`).
4. Nút xóa từng ảnh khỏi danh sách.
5. Cột Mã hàng trong bảng "Hàng cùng loại" hiển thị mặc định theo mã sản phẩm cha.

---

### Requirement: REQ-04 Cố Định Kích Thước W-H và Header/Footer trong ProductDetailModal
Component [`ProductDetailModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductDetailModal.tsx) MUST:
1. Cố định kích thước: `maxWidth: 1160px, width: '96vw', height: '88vh', maxHeight: '88vh'`.
2. Áp dụng layout Flexbox 3 tầng: Header cố định, Tab Body cuộn độc lập, Footer cố định.

---

### Requirement: REQ-05 Binding Dữ Liệu Thật và Gallery Ảnh trong ProductDetailModal
Trong [`ProductDetailModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductDetailModal.tsx):
1. Trường "Mô tả" và "Ghi chú nội bộ" hiển thị dữ liệu thực tế từ API.
2. Khu vực hình ảnh hỗ trợ Gallery xem nhiều ảnh và Lightbox phóng to.
3. Bảng Đơn vị tính hiển thị mã hàng của đơn vị tính mặc định theo mã sản phẩm cha.
