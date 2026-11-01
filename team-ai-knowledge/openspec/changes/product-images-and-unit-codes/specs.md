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
