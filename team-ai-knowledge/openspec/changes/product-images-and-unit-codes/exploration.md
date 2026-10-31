# Exploration: product-images-and-unit-codes

## 1. Problem Statement
Hiện tại hệ thống MT-GRMS gặp phải 3 hạn chế chính trong phân hệ Quản lý Hàng hóa:
1. **Thiếu mã hàng cho đơn vị quy đổi (`ProductUnit`)**:
   - Entity `ProductUnit` chỉ lưu `UnitName`, `ConversionRate`, `Price`, `Barcode`. Không có trường mã hàng riêng (`UnitCode`), và chưa có cơ chế tự động sinh mã khi người dùng thêm đơn vị tính quy đổi.
2. **Chưa hỗ trợ quản lý nhiều ảnh cho sản phẩm trên PostgreSQL**:
   - Backend trước đây chỉ có một trường đơn `ImageUrl` trên entity `Product`.
   - Yêu cầu từ phía dự án sử dụng PostgreSQL: Chuyển đổi sang `List<string> ImageUrls` lưu trữ trực tiếp dưới dạng mảng native `text[]` trên PostgreSQL, trong đó ảnh đầu tiên (`ImageUrls[0]`) là ảnh đại diện của sản phẩm, thay vì tạo thêm bảng trung gian `ProductImages` phức tạp không cần thiết.
3. **Trải nghiệm Modal Xem Chi Tiết (`ProductDetailModal`) chưa hoàn thiện**:
   - Các trường "Mô tả" và "Ghi chú nội bộ" còn gán dữ liệu cứng fallback, chưa phản ánh trung thực dữ liệu từ API.
   - Layout modal chưa cố định kích thước (width-height): khi chuyển đổi qua lại giữa các tab (Thông tin chung, Đơn vị tính, Thẻ kho), chiều cao modal bị co giãn thất thường. Header và Footer chưa được cố định (sticky/flex-fixed) khi cuộn nội dung.
   - Chưa hỗ trợ xem gallery ảnh phong phú.

---

## 2. Context & Background
- **Backend**: Solution `MT_GRMS_BACKEND.sln` (.NET 8, Clean Architecture, EF Core 8 Code-First, PostgreSQL qua Npgsql). Đã có entity `Product` và `ProductUnit`.
- **Frontend**: `MT_GRMS_FRONTEND` (React 19 + TypeScript, Vite). Màn hình `ProductListPage` điều phối `ProductFormModal` và `ProductDetailModal`.
- **Cloudinary Integration**: Đã có tiện ích `uploadToCloudinary` và endpoint backend hỗ trợ lưu trữ media.

---

## 3. Constraints
- **Multi-tenancy & Bảo mật**: Mọi truy vấn và dữ liệu lưu trữ phải gắn liền với TenantId của cửa hàng.
- **Backward Compatibility**:
  - Thuộc tính computed `[NotMapped] public string? ImageUrl => ImageUrls.FirstOrDefault();` trên `Product` được duy trì để không làm gãy POS Checkout, Inventory Lookup và các màn hình khác đã tích hợp trước đó.
  - Bảng `ProductUnits` thêm cột `UnitCode` (nullable hoặc default value) thông qua Migration mới, không làm hỏng dữ liệu các đơn vị tính đã tồn tại trong DB.
- **Codebase Style**:
  - Tuân thủ nguyên tắc Karpathy: Sửa đúng chỗ, không refactor lan man, không thêm abstraction thừa.
  - Sử dụng layout flexbox 3 tầng với chiều cao và chiều rộng cố định cho modal.

---

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi sản phẩm có danh sách ảnh `List<string> ImageUrls`. Ảnh đầu tiên `ImageUrls[0]` mặc định là ảnh đại diện (avatar). Người dùng có thể đổi vị trí ảnh đại diện lên đầu danh sách.
- **[ASSUMPTION-02]**: Khi thêm đơn vị tính quy đổi, nếu người dùng không tự nhập mã hàng cho đơn vị đó, hệ thống sẽ tự sinh theo quy tắc: `{ProductCode}-{Tên ĐVT chuẩn hóa}` (ví dụ `SP001-THUNG`). Nếu người dùng nhập tay trong bảng "Hàng cùng loại", hệ thống sẽ ưu tiên lưu mã người dùng nhập.
- **[ASSUMPTION-03]**: Kích thước cố định của `ProductDetailModal` được chuẩn hóa đồng bộ với `ProductFormModal`: `maxWidth: 1160px`, `width: '96vw'`, `height: '90vh'`.

---

## 5. Scope & Non-Goals
### In Scope
- **Backend**:
  - Bổ sung `public List<string> ImageUrls { get; set; } = new();` và `[NotMapped] public string? ImageUrl => ImageUrls.FirstOrDefault();` vào Entity `Product`.
  - Cấu hình EF Core: `builder.Property(x => x.ImageUrls).HasColumnType("text[]");`.
  - Bổ sung trường `UnitCode` vào Entity `ProductUnit`.
  - Migration EF Core PostgreSQL: `AddProductImageUrlsAndUnitCode`.
  - Cập nhật DTOs (`ProductDtos`, `ProductUnitDtos`), Service (`CatalogService`, `ProductUnitService`), Repository, Controller.
  - Logic tự sinh `UnitCode` khi tạo đơn vị tính quy đổi.
- **Frontend**:
  - `ProductFormModal`: Upload nhiều ảnh qua Cloudinary, danh sách thumbnail, chọn ảnh đại diện (reorder lên index 0), xóa ảnh; hỗ trợ trường mã hàng cho đơn vị quy đổi.
  - `ProductDetailModal`: Cố định khung layout 3 tầng (Header - Body - Footer), cuộn độc lập tab body, nạp `description` và `internalNote` thực tế, thư viện ảnh Gallery (xem ảnh lớn + thumbnails + Lightbox).
- **Unit Tests**: Viết kiểm thử cho cả Backend và Frontend.

### Out of Scope (Non-Goals)
- Không can thiệp sửa đổi các màn hình POS bán hàng hay đơn hàng nhập kho đã chạy ổn định.
- Không xây dựng công cụ chỉnh sửa ảnh (crop, xoay, filter) phức tạp trên client.

---

## 6. Các Phương án Kỹ thuật & Quyết định

### Vấn đề 1: Lưu trữ nhiều ảnh sản phẩm trên PostgreSQL
- **Phương án A (Tạo Entity ProductImage và bảng quan hệ 1-N)**:
  - *Đánh giá*: Cồng kềnh, cần bảng riêng, join truy vấn và cascade delete phức tạp trong khi PostgreSQL hỗ trợ native array cực kỳ mạnh mẽ.
- **Phương án B (PostgreSQL Native Array `text[]` với `List<string> ImageUrls` - CHỌN)**:
  - *Ưu*: Tận dụng trực tiếp khả năng lưu mảng native `text[]` của PostgreSQL qua EF Core Npgsql. Không cần tạo thêm bảng riêng. Hiệu năng đọc/ghi tối ưu, mảng `ImageUrls` được nạp cùng sản phẩm không cần `.Include()`. Ảnh đầu tiên `[0]` tự nhiên là ảnh đại diện.
  - *Backward compatibility*: Khai báo thuộc tính tính toán `[NotMapped] public string? ImageUrl => ImageUrls.FirstOrDefault();`.

### Vấn đề 2: Tự sinh mã hàng cho đơn vị quy đổi (`UnitCode`)
- **Phương án A (Sinh tại Frontend khi người dùng gõ ĐVT)**:
  - *Ưu*: Người dùng nhìn thấy ngay mã được điền vào ô input trong bảng "Hàng cùng loại".
  - *Nhược*: Nếu backend nhận request API trực tiếp mà không có mã thì sẽ bị thiếu.
- **Phương án B (Kết hợp 2 chiều: Frontend preview + Backend enforce auto-generate - CHỌN)**:
  - *Frontend*: Tự động điền gợi ý `{ProductCode}-{Tên ĐVT}` ngay khi người dùng nhập đơn vị quy đổi, cho phép sửa tùy ý.
  - *Backend*: Khi lưu `ProductUnit`, nếu `UnitCode` vẫn để trống thì service sẽ tự động sinh `{product.ProductCode}-{unitSlug}`. Đảm bảo toàn vẹn dữ liệu ở cả 2 đầu.

---

## 7. Rủi ro & Cách giảm thiểu
1. **Rủi ro ảnh đại diện không đồng bộ**:
   - *Giải pháp*: `Product.ImageUrl` là computed property trỏ trực tiếp vào `ImageUrls.FirstOrDefault()`, đảm bảo tính nhất quán 100%.
2. **Rủi ro mã đơn vị quy đổi bị trùng lặp**:
   - *Giải pháp*: Kiểm tra tính duy nhất của `UnitCode` trong phạm vi cùng một sản phẩm/tenant; tự động thêm hậu tố số tăng dần nếu trùng (ví dụ `SP001-THUNG-1`).
3. **Rủi ro giật lag khi chuyển tab ở Modal xem chi tiết**:
   - *Giải pháp*: Cố định chiều cao cha bằng `height: '88vh', display: 'flex', flexDirection: 'column'`. Đặt `overflow-y: auto` riêng cho container của từng tab content.
