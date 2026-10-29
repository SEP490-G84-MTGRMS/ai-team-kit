# Specs: product-management-ui (Cụm 1: Product List & Category Filter)
## Capability: Product Catalog Management (FE-01) - Phase 1
- Dependencies: `exploration.md`, `design-brief.md`, `proposal.md`
- Backend Controllers: [`ProductsController.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/ProductsController.cs), [`CategoriesController.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/CategoriesController.cs)
- Căn cứ hệ thống: [Report-3 SRS FE-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L1208)

---

## 1. API / Contract của Cụm 1

| Method | Path | Request Body / Query Params | Response (Success) | Lỗi xử lý |
|---|---|---|---|---|
| `GET` | `/api/products` | Query: `searchTerm`, `categoryId`, `status`, `pageIndex`, `pageSize` | `200 OK`<br>`ApiResponse<PagedResult<ProductResponse>>` | `400 Bad Request`, `401 Unauthorized` |
| `GET` | `/api/categories` | Không | `200 OK`<br>`ApiResponse<IReadOnlyList<CategoryDto>>` | `401 Unauthorized` |

---

## 2. ADDED Requirements (Cụm 1)

### Requirement: REQ-01 Hiển thị Danh sách Hàng hóa có Phân trang Server-side (Server-side Paginated Product List)
Hệ thống Frontend MUST hiển thị danh sách hàng hóa phân trang thông qua API `GET /api/products`.
Mỗi trang hiển thị mặc định 20 sản phẩm (hỗ trợ chuyển đổi 10, 20, 50).
Bảng hiển thị các cột: Mã hàng (ProductCode), Mã vạch (Barcode), Tên hàng, Danh mục, ĐVT cơ sở, Giá bán, Trạng thái hoạt động.

#### Scenario: Tải thành công trang danh sách đầu tiên
- **GIVEN** Người dùng mở trang `/dashboard/products`
- **WHEN** Trang tải hoàn tất
- **THEN** Hệ thống gọi `GET /api/products?pageIndex=1&pageSize=20`
- **AND** Bảng hiển thị danh sách sản phẩm cùng bộ điều khiển phân trang (trang hiện tại, tổng số trang, tổng số bản ghi).

#### Scenario: Người dùng chuyển sang trang kế tiếp
- **GIVEN** Bảng đang ở trang 1 với tổng cộng 3 trang
- **WHEN** Người dùng click số trang "2"
- **THEN** Hệ thống gọi `GET /api/products?pageIndex=2&pageSize=20`
- **AND** Bảng cập nhật dữ liệu của trang 2 mà không reload lại toàn bộ website.

---

### Requirement: REQ-02 Tìm kiếm Đa tiêu chí có Debounce (Debounced Multi-criteria Search)
Hệ thống Frontend MUST cung cấp ô tìm kiếm hỗ trợ tra cứu theo tên sản phẩm, mã hàng (SKU) hoặc mã vạch (Barcode).
Hệ thống MUST áp dụng kỹ thuật Debounce 300ms: chỉ gửi request lên backend sau khi người dùng dừng gõ 300ms.
Hệ thống MUST tự động reset `pageIndex = 1` khi từ khóa tìm kiếm thay đổi.

#### Scenario: Tìm kiếm thành công theo tên sản phẩm
- **GIVEN** Đang ở trang danh sách
- **WHEN** Người dùng gõ "Lavie" vào ô tìm kiếm
- **THEN** Sau 300ms, hệ thống gọi `GET /api/products?searchTerm=Lavie&pageIndex=1`
- **AND** Bảng chỉ hiển thị các sản phẩm có tên hoặc mã chứa từ "Lavie".

#### Scenario: Tìm kiếm không tìm thấy kết quả (Empty State)
- **GIVEN** Người dùng nhập từ khóa "KhôngTồnTại123"
- **WHEN** Backend trả về danh sách rỗng (`items: []`, `totalCount: 0`)
- **THEN** Bảng hiển thị giao diện thông báo rỗng "Không tìm thấy hàng hóa phù hợp".

---

### Requirement: REQ-03 Lọc Sản phẩm theo Danh mục Phẳng (Flat Category Filter)
Hệ thống Frontend MUST tải danh sách danh mục phẳng từ `GET /api/categories` và hiển thị trên `CategorySidebar`.
Mỗi danh mục hiển thị Tên và số lượng sản phẩm.
Mặc định chọn "Tất cả hàng hóa". Khi người dùng click một danh mục, hệ thống MUST lọc danh sách theo `categoryId` tương ứng và reset `pageIndex = 1`.

#### Scenario: Lọc sản phẩm theo một nhóm hàng cụ thể
- **GIVEN** `CategorySidebar` hiển thị nhóm "Bánh kẹo" có ID `cat-01`
- **WHEN** Người dùng click chọn nhóm "Bánh kẹo"
- **THEN** Hệ thống gọi `GET /api/products?categoryId=cat-01&pageIndex=1`
- **AND** Bảng chỉ hiển thị các sản phẩm thuộc nhóm "Bánh kẹo".

#### Scenario: Quay lại xem tất cả sản phẩm
- **GIVEN** Đang lọc theo nhóm "Bánh kẹo"
- **WHEN** Người dùng click chọn mục "Tất cả hàng hóa"
- **THEN** Hệ thống gọi `GET /api/products?pageIndex=1` (không truyền categoryId)
- **AND** Bảng hiển thị toàn bộ hàng hóa.

---

### Requirement: REQ-04 Bảo mật Phân quyền Giá vốn theo Vai trò (BR-SEC-01)
Hệ thống Frontend MUST tuân thủ nghiêm ngặt quy tắc [BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4759):
- Nếu người dùng đăng nhập có vai trò `StoreOwner` hoặc `Admin`: Bảng hiển thị cột "Giá vốn" (`CostPrice`).
- Nếu người dùng đăng nhập có vai trò `Cashier` hoặc `Staff`: Bảng ẩn hoàn toàn cột "Giá vốn" và không hiển thị thông tin biên độ lãi.

#### Scenario: Thu ngân đăng nhập không nhìn thấy giá vốn
- **GIVEN** Người dùng đăng nhập có vai trò `Cashier`
- **WHEN** Truy cập trang `/dashboard/products`
- **THEN** Bảng danh sách KHÔNG có cột "Giá vốn"
- **AND** Giá trị `costPrice` từ API là `null`.

#### Scenario: Chủ cửa hàng đăng nhập nhìn thấy giá vốn đầy đủ
- **GIVEN** Người dùng đăng nhập có vai trò `StoreOwner`
- **WHEN** Truy cập trang `/dashboard/products`
- **THEN** Bảng danh sách có cột "Giá vốn", hiển thị đúng số tiền giá nhập.

---

## 3. Acceptance Checklist (Cụm 1)
- [ ] REQ-01: Bảng danh sách sản phẩm tải dữ liệu thật từ `GET /api/products` và phân trang server-side hoạt động trơn tru.
- [ ] REQ-02: Ô tìm kiếm hoạt động với debounce 300ms, tự reset `pageIndex = 1`, hiển thị Empty state khi không có kết quả.
- [ ] REQ-03: `CategorySidebar` tải danh mục phẳng từ `GET /api/categories`, click nhóm hàng lọc đúng `categoryId`.
- [ ] REQ-04: Cột "Giá vốn" hiển thị cho `StoreOwner` và ẩn hoàn toàn đối với `Cashier`/`Staff` (BR-SEC-01).
