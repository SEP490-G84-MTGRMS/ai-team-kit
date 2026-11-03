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

