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
| `GET` | `/api/categories` | Không | `200 OK`<br>`ApiResponse<IReadOnlyList<CategoryDto>>` | `401 Unauthorized` |
| `GET` | `/api/v1/products/{id}/units` | Không | `200 OK`<br>`ApiResponse<IReadOnlyList<ProductUnitResponse>>` | `404 Not Found` |

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
- Dòng đơn vị quy đổi: Quy đổi nhập, Mã vạch nhập, Giá vốn & Tồn kho tự động tính hiển thị nền xám, Giá bán nhập riêng, nút Xóa hàng.

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
1. Hệ thống MUST cung cấp bộ chọn đơn vị tính (Segmented Pills) trên thanh Header tổng quan hoặc đầu Tab Thông tin khi sản phẩm có đơn vị quy đổi (`uomConversions && uomConversions.length > 0`).
2. Hệ thống MUST cho phép click trực tiếp vào từng dòng trong bảng "Đơn vị tính & Quy đổi giá" để chuyển sang đơn vị đó.
3. Khi người dùng chuyển đổi đơn vị tính:
   - **Tên hiển thị**: Cập nhật thành `[Tên sản phẩm] - [Đơn vị]` (nếu là đơn vị cơ bản thì chỉ hiển thị `[Tên sản phẩm]`).
   - **Mã hàng**: Hiển thị `uom.productCode` (nếu có) hoặc `product.productCode`.
   - **Mã vạch**: Hiển thị `uom.barcode` (nếu có) hoặc `product.barcode` (nếu đơn vị cơ bản) hoặc `'—'`.
   - **Giá bán**: Cập nhật hiển thị giá bán của đơn vị đang chọn (`uom.price` hoặc `product.sellingPrice`).
   - **Giá vốn (BR-SEC-01)**: Nếu `userRole === 'StoreOwner'`, giá vốn tự động nhân theo tỷ lệ quy đổi: $\text{costPrice} \times \text{conversionRate}$. Nếu `Cashier` / `Staff`: ẩn hoàn toàn giá vốn.
   - **Tồn kho hiện tại**: Hiển thị số lượng nguyên theo đơn vị đang chọn $\lfloor \text{onHand} / \text{conversionRate} \rfloor$ kèm chú thích số lượng đơn vị cơ bản còn dư (nếu có).
   - **Highlight Bảng ĐVT**: Dòng của đơn vị đang chọn trong bảng ĐVT được highlight nền xanh nhẹ và gắn nhãn `Đang xem`.

#### Scenario: Chủ cửa hàng xem chi tiết sản phẩm và chuyển sang đơn vị thùng
- **GIVEN** Sản phẩm "Bia Tiger" có đơn vị cơ bản "chai" (Giá bán: 20,000 đ, Giá vốn: 15,000 đ, Tồn kho: 50 chai) và đơn vị quy đổi "thung" (Quy đổi: 24, Giá bán: 450,000 đ)
- **WHEN** Người dùng có quyền `StoreOwner` mở xem chi tiết và click chọn pill "thung"
- **THEN** Giao diện cập nhật:
  - Giá bán hiển thị: `450,000 đ`
  - Giá vốn hiển thị: `360,000 đ` (15,000 * 24)
  - Tồn kho hiển thị: `2 thung` (kèm chú thích: `còn dư 2 chai`)
  - Bảng ĐVT highlight dòng "thung" với nhãn "Đang xem".

#### Scenario: Thu ngân xem chi tiết sản phẩm và chuyển đơn vị (BR-SEC-01)
- **GIVEN** Người dùng đăng nhập có vai trò `Cashier`
- **WHEN** Người dùng mở modal chi tiết sản phẩm và chuyển sang đơn vị "thung"
- **THEN** Giá bán hiển thị `450,000 đ`, Giá vốn bị ẩn hoàn toàn (không xuất hiện trên Header và Tab Thông tin).

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
