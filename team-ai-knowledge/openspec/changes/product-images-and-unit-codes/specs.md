# Specs: product-images-and-unit-codes

## API / Contract

| Method | Path | Request Body | Response Body | Mã lỗi |
|---|---|---|---|---|
| `POST` | `/api/v1/products` | `ProductCreateRequest` (kèm `images: ProductImageDto[]?`) | `ApiResponse<ProductResponse>` | 400 Bad Request, 401 Unauthorized, 409 Conflict |
| `PUT` | `/api/v1/products/{id}` | `ProductUpdateRequest` (kèm `images: ProductImageDto[]?`) | `ApiResponse<ProductResponse>` | 400 Bad Request, 404 Not Found, 409 Conflict |
| `GET` | `/api/v1/products/{id}` | — | `ApiResponse<ProductResponse>` (kèm `images: ProductImageDto[]`) | 404 Not Found |
| `POST` | `/api/v1/products/{productId}/units` | `ProductUnitCreateRequest` (kèm `unitCode: string?`) | `ApiResponse<ProductUnitResponse>` | 400 Bad Request, 409 Conflict (trùng mã) |
| `PUT` | `/api/v1/product-units/{id}` | `ProductUnitUpdateRequest` (kèm `unitCode: string?`) | `ApiResponse<ProductUnitResponse>` | 400 Bad Request, 404 Not Found, 409 Conflict |

---

## ADDED Requirements

### Requirement: REQ-01 Hỗ trợ Nhiều Ảnh Sản Phẩm (Multi-Image Backend)
Hệ thống MUST cho phép một sản phẩm liên kết với nhiều bản ghi hình ảnh thông qua Entity `ProductImage`.
Hệ thống MUST tự động đồng bộ ảnh có cờ `IsMain = true` (hoặc ảnh đầu tiên) vào trường `Product.ImageUrl` để đảm bảo tính tương thích ngược cho toàn bộ hệ thống.

#### Scenario: Thêm sản phẩm kèm danh sách nhiều ảnh
- **GIVEN** Người dùng gửi `ProductCreateRequest` với danh sách 3 ảnh, trong đó ảnh thứ 2 có `isMain: true`.
- **WHEN** Backend lưu sản phẩm vào cơ sở dữ liệu.
- **THEN** Bảng `ProductImages` tạo 3 bản ghi liên kết với `ProductId`, và trường `Product.ImageUrl` được gán bằng `ImageUrl` của ảnh thứ 2.

#### Scenario: Không chỉ định ảnh đại diện khi tải lên
- **GIVEN** Người dùng gửi danh sách 2 ảnh nhưng cả 2 đều có `isMain: false`.
- **WHEN** Backend xử lý lưu trữ.
- **THEN** Hệ thống MUST tự động gán ảnh đầu tiên (`DisplayOrder` nhỏ nhất) thành `isMain: true` và cập nhật vào `Product.ImageUrl`.

#### Scenario: Edge Case - Xóa hết ảnh của sản phẩm khi cập nhật
- **GIVEN** Sản phẩm đang có 2 ảnh. Người dùng gửi `ProductUpdateRequest` với danh sách `images` rỗng (`[]`).
- **WHEN** Backend xử lý cập nhật.
- **THEN** Hệ thống xóa toàn bộ ảnh cũ trong `ProductImages`, đồng thời gán `Product.ImageUrl = null`.

---

### Requirement: REQ-02 Tự Động Sinh Mã Hàng cho Đơn Vị Quy Đổi (ProductUnit Code Auto-generation)
Entity `ProductUnit` MUST có thuộc tính `UnitCode` (mã hàng của đơn vị quy đổi).
Khi tạo đơn vị quy đổi mới, nếu người dùng không truyền `UnitCode` (hoặc để trống), hệ thống MUST tự động sinh mã theo quy tắc: `{ProductCode}-{Tên ĐVT chuẩn hóa}`.

#### Scenario: Tự động sinh mã khi để trống
- **GIVEN** Sản phẩm có mã `SP00123`. Người dùng tạo đơn vị tính mới với `UnitName: "Thùng"` và `UnitCode: ""`.
- **WHEN** Hệ thống gọi API tạo đơn vị tính quy đổi.
- **THEN** Hệ thống tự động tạo mã `SP00123-THUNG` và lưu vào trường `UnitCode` của `ProductUnit`.

#### Scenario: Người dùng tự nhập mã hàng tùy biến
- **GIVEN** Sản phẩm có mã `SP00123`. Người dùng nhập `UnitCode: "THUNG-L1"`.
- **WHEN** Hệ thống kiểm tra mã không bị trùng trong tenant.
- **THEN** Hệ thống lưu đúng mã `THUNG-L1` cho đơn vị quy đổi.

#### Scenario: Edge Case - Trùng mã tự sinh
- **GIVEN** Đã tồn tại đơn vị quy đổi có mã `SP00123-THUNG`. Người dùng thêm một đơn vị khác cũng có tên "Thùng 24 lon" và format tự sinh bị trùng.
- **WHEN** Hệ thống sinh mã.
- **THEN** Hệ thống MUST tự động thêm hậu tố tăng dần `-1`, `-2` (ví dụ: `SP00123-THUNG-1`) để đảm bảo tính duy nhất.

---

### Requirement: REQ-03 Giao Diện Quản Lý Nhiều Ảnh trong ProductFormModal
Component [`ProductFormModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx) MUST cho phép:
1. Upload nhiều file ảnh đồng thời lên Cloudinary.
2. Hiển thị danh sách ảnh thumbnail có đánh dấu ảnh đại diện (`Badge` hoặc ngôi sao).
3. Cho phép click chọn bất kỳ ảnh nào làm ảnh đại diện (`isMain`).
4. Nút xóa từng ảnh khỏi danh sách.
5. Cột Mã hàng trong bảng "Hàng cùng loại" tự động hiển thị mã gợi ý theo đơn vị quy đổi và cho phép người dùng chỉnh sửa.

#### Scenario: Thêm 3 ảnh và chọn ảnh thứ hai làm đại diện
- **GIVEN** Người dùng mở modal thêm sản phẩm và tải lên 3 file ảnh.
- **WHEN** 3 ảnh upload thành công và hiển thị trong danh sách ảnh, người dùng click nút "Đặt làm ảnh chính" ở ảnh thứ hai.
- **THEN** Ảnh thứ hai được highlight viền xanh và hiển thị nhãn "Ảnh chính", ảnh đầu tiên trở thành ảnh phụ.

---

### Requirement: REQ-04 Cố Định Kích Thước W-H và Header/Footer trong ProductDetailModal
Component [`ProductDetailModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductDetailModal.tsx) MUST:
1. Cố định kích thước: `maxWidth: 1160px, width: '96vw', height: '90vh'`.
2. Áp dụng layout Flexbox 3 tầng:
   - **Header cố định** (`flexShrink: 0`): Tiêu đề, mã sản phẩm, pills chuyển đổi đơn vị.
   - **Tab Body cuộn độc lập** (`flex: 1, overflowY: 'auto'`): Khi người dùng click chuyển qua lại giữa các Tab (Thông tin chung, Đơn vị tính, Thẻ kho, Tồn kho chi nhánh), kích thước khung modal KHÔNG được thay đổi hay co giãn.
   - **Footer cố định** (`flexShrink: 0`): Các nút thao tác (In mã vạch, Chỉnh sửa, Đóng).

#### Scenario: Chuyển đổi tab không làm thay đổi kích thước modal
- **GIVEN** Modal chi tiết sản phẩm đang mở ở tab "Thông tin chung".
- **WHEN** Người dùng click chuyển sang tab "Thẻ kho" (nơi có bảng dữ liệu dài).
- **THEN** Chiều cao và chiều rộng của modal giữ nguyên 100% không suy suyển; chỉ có phần thân bảng thẻ kho cuộn nội dung độc lập bên trong body.

---

### Requirement: REQ-05 Binding Dữ Liệu Thật và Gallery Ảnh trong ProductDetailModal
Trong [`ProductDetailModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductDetailModal.tsx):
1. Trường "Mô tả": MUST hiển thị `product.description` (nếu không có thì hiển thị `"Chưa có mô tả"`).
2. Trường "Ghi chú nội bộ": MUST hiển thị `product.internalNote` (nếu không có thì hiển thị `"Chưa có ghi chú"`).
3. Khu vực hình ảnh: MUST hỗ trợ Gallery xem nhiều ảnh (khung ảnh lớn hiển thị ảnh đang chọn + dải thumbnails phía dưới để bấm chuyển đổi ảnh xem + nút mở Lightbox phóng to).

#### Scenario: Xem sản phẩm có mô tả và nhiều ảnh
- **GIVEN** Sản phẩm từ API có `description: "Bánh quy bơ cao cấp"`, `internalNote: "Hạn dùng 12 tháng"` và 3 ảnh trong `images`.
- **WHEN** Người dùng mở modal xem chi tiết.
- **THEN** Modal hiển thị đúng nội dung mô tả và ghi chú thực tế; khu vực hình ảnh hiển thị ảnh chính kèm 3 thumbnail bên dưới cho phép click chọn xem từng ảnh.

---

## Acceptance Checklist
- [ ] REQ-01: Backend hỗ trợ Entity `ProductImage`, migration EF Core thành công, tự động đồng bộ `Product.ImageUrl` theo ảnh `IsMain`.
- [ ] REQ-02: Bổ sung trường `UnitCode` vào Entity `ProductUnit` và tự động sinh mã khi thêm đơn vị quy đổi nếu để trống.
- [ ] REQ-03: `ProductFormModal` hỗ trợ upload nhiều ảnh, chọn ảnh đại diện, xóa ảnh, và đồng bộ mã hàng đơn vị trong bảng "Hàng cùng loại".
- [ ] REQ-04: `ProductDetailModal` cố định kích thước (`1160px` x `90vh`), Header và Footer cố định, cuộn mượt mà ở tab body và không đổi kích thước khi chuyển tab.
- [ ] REQ-05: `ProductDetailModal` nạp dữ liệu thực tế cho Mô tả, Ghi chú nội bộ và hiển thị Gallery nhiều ảnh.
