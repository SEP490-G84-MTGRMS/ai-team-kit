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
- Nếu chưa nhập `baseUnit`:
  - Nút `+ Thêm đơn vị` bị vô hiệu hóa (disabled với style xám mờ `opacity: 0.5`, `cursor: not-allowed`), đồng thời hiển thị tooltip hoặc thông báo lỗi: "Vui lòng nhập tên đơn vị cơ bản trước khi thêm đơn vị quy đổi."
- Khi `baseUnit` có giá trị hợp lệ: Nút `+ Thêm đơn vị` chuyển sang trạng thái kích hoạt (màu xanh #0F766E, cursor: pointer) và cho phép thêm dòng quy đổi mới.

#### Scenario: Người dùng chưa nhập đơn vị cơ bản bấm Thêm đơn vị
- **GIVEN** Modal Thêm hàng hóa đang mở, ô "Tên đơn vị cơ bản" để trống
- **WHEN** Người dùng quan sát nút "+ Thêm đơn vị"
- **THEN** Nút ở trạng thái disabled và không kích hoạt thêm đơn vị quy đổi mới.

---

### Requirement: REQ-06 Hiển thị Bảng "Hàng cùng loại" trong Modal Hàng hóa (ProductFormModal)
Khi sản phẩm có thêm đơn vị tính quy đổi (`uomConversions.length > 0`), modal MUST hiển thị bảng **"Hàng cùng loại"** bên dưới phần đơn vị tính.
- **Tiêu đề bảng**: Bên trái là `Hàng cùng loại`, bên phải là liên kết `Thiết lập giá` kèm icon.
- **Cấu trúc cột & Dữ liệu**:
  1. `Đơn vị`:
     - Hàng 1 (Đơn vị cơ bản): Text hiển thị `baseUnit` (ví dụ: `chai`).
     - Hàng 2 trở đi (Đơn vị quy đổi): Text hiển thị `uom.unitName` (ví dụ: `thung`).
  2. `Quy đổi`:
     - Hàng 1: Input giá trị `1`, disabled, nền xám nhẹ.
     - Hàng 2 trở đi: Input nhập tỷ lệ quy đổi (`conversionRate`), đồng bộ 2 chiều với danh sách `uomConversions`.
  3. `Mã hàng`:
     - Hàng 1: Input mã hàng (`productCode` hoặc placeholder `Tự động`).
     - Hàng 2 trở đi: Input mã hàng riêng của đơn vị quy đổi (placeholder `Tự động`).
  4. `Mã vạch`:
     - Hàng 1: Input mã vạch cơ bản (đồng bộ với `barcode` chính).
     - Hàng 2 trở đi: Input mã vạch riêng (`uom.barcode`).
  5. `Giá vốn`:
     - Hàng 1: Input giá vốn cơ bản (đồng bộ với `costPrice`).
     - Hàng 2 trở đi: Input giá vốn quy đổi (nền xám/readonly, tự động tính bằng `costPrice * conversionRate`).
  6. `Giá bán`:
     - Hàng 1: Input giá bán cơ bản (đồng bộ với `sellingPrice` / `baseUnitPrice`).
     - Hàng 2 trở đi: Input giá bán đơn vị quy đổi (đồng bộ với `uom.price`).
  7. `Tồn kho`:
     - Hàng 1: Input tồn kho cơ bản (đồng bộ với `initialStock`).
     - Hàng 2 trở đi: Input tồn kho quy đổi (nền xám/readonly, tự động tính bằng `Math.floor(initialStock / conversionRate)`).
  8. `Cột Action`:
     - Hàng 1: Không cho phép xóa đơn vị cơ bản.
     - Hàng 2 trở đi: Icon thùng rác `Trash2` màu xám cho phép xóa đơn vị quy đổi khỏi bảng và danh sách.

#### Scenario: Đồng bộ dữ liệu 2 chiều giữa Bảng Hàng cùng loại và Đơn vị tính
- **GIVEN** Người dùng đã thêm đơn vị quy đổi "thung" với tỷ lệ 24 và giá bán 450,000
- **WHEN** Người dùng thay đổi giá bán hoặc tỷ lệ quy đổi trong Bảng hàng cùng loại
- **THEN** Các ô tương ứng trong phần Đơn vị tính phía trên được cập nhật đồng bộ tức thời.

---

### Requirement: REQ-07 Lựa chọn Hiển thị Đơn vị Tính trên Danh sách Hàng hóa (ProductListPage)
Trong bảng danh sách sản phẩm ([`ProductListPage.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/pages/ProductListPage.tsx)), tại cột **Tên hàng hóa**:
- Nếu sản phẩm có đơn vị quy đổi (`uomConversions && uomConversions.length > 0`):
  - Hiển thị: `[Tên sản phẩm] - [đơn vị đang chọn] ⌵` (ví dụ: `Test - chai ⌵`).
  - Khi click vào `[đơn vị đang chọn] ⌵`: Mở popover menu hiển thị danh sách các đơn vị quy đổi và đơn vị cơ bản.
  - Khi click chọn một đơn vị:
    - Đơn vị đang chọn của sản phẩm đó chuyển sang đơn vị được click (ví dụ `Test - thung ⌵`).
    - Cột **Giá bán** tự động cập nhật hiển thị giá của đơn vị tương ứng (ví dụ: `450,000 đ`).
    - Cột **Mã hàng / Barcode** nếu đơn vị có mã riêng thì cập nhật theo đơn vị tương ứng.
- Nếu sản phẩm không có đơn vị quy đổi:
  - Hiển thị tên hàng hóa bình thường không có dropdown menu.

#### Scenario: Chuyển đổi đơn vị hiển thị trên bảng sản phẩm
- **GIVEN** Sản phẩm "Nước giải khát" có đơn vị cơ bản "chai" giá 10,000 và "lốc" giá 55,000
- **WHEN** Người dùng click menu chọn "lốc"
- **THEN** Tên hàng hóa hiển thị `Nước giải khát - lốc ⌵`
- **AND** Cột Giá bán hiển thị `55,000 đ`.

---

## 3. Acceptance Checklist
- [ ] REQ-01: Bảng danh sách sản phẩm tải dữ liệu thật từ `GET /api/products` và phân trang server-side hoạt động trơn tru.
- [ ] REQ-02: Ô tìm kiếm hoạt động với debounce 300ms, tự reset `pageIndex = 1`.
- [ ] REQ-03: `CategorySidebar` tải danh mục phẳng, lọc theo `categoryId`.
- [ ] REQ-04: Cột "Giá vốn" hiển thị cho `StoreOwner` và ẩn hoàn toàn đối với `Cashier`/`Staff` (BR-SEC-01).
- [ ] REQ-05: Nút "+ Thêm đơn vị" bắt buộc phải nhập tên đơn vị cơ bản trước mới cho phép kích hoạt.
- [ ] REQ-06: Bảng "Hàng cùng loại" hiển thị đầy đủ các cột và các dòng đơn vị cơ bản + quy đổi, đồng bộ 2 chiều dữ liệu.
- [ ] REQ-07: Cột Tên hàng hóa trên `ProductListPage` có option dropdown hiển thị đơn vị tính và cập nhật giá bán theo đơn vị được chọn.
