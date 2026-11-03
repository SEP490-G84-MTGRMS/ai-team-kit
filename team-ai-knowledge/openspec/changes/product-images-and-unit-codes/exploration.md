# Exploration: product-images-and-unit-codes

## 1. Problem Statement
Hiện tại hệ thống MT-GRMS giải quyết 3 vấn đề trong phân hệ Quản lý Hàng hóa:
1. **Quy tắc Mã hàng cho Đơn vị tính quy đổi (`ProductUnit`)**:
   - Entity `ProductUnit` không lưu trữ trường mã hàng riêng (`UnitCode`/`ProductCode`) trong cơ sở dữ liệu.
   - Khi hiển thị trên giao diện người dùng (UI), `productCode` của `ProductUnit` mặc định giống với `productCode` của sản phẩm cha (`Product`).
2. **Hỗ trợ quản lý nhiều ảnh cho sản phẩm trên PostgreSQL**:
   - Chuyển đổi sang `List<string> ImageUrls` lưu trữ trực tiếp dưới dạng mảng native `text[]` trên PostgreSQL thông qua EF Core Npgsql.
   - Ảnh đầu tiên (`ImageUrls[0]`) là ảnh đại diện của sản phẩm, tương thích ngược với trường `ImageUrl` qua computed property `[NotMapped] public string? ImageUrl => ImageUrls.FirstOrDefault();`.
3. **Trải nghiệm Modal Xem Chi Tiết (`ProductDetailModal`) hoàn thiện**:
   - Dữ liệu thực tế cho "Mô tả" và "Ghi chú nội bộ" từ API.
   - Layout modal cố định kích thước (`maxWidth: 1160px, width: '96vw', height: '88vh'`) với Header và Footer cố định (`flexShrink: 0`), body cuộn độc lập (`flex: 1, overflowY: 'auto'`) không bị co giãn hay giật khi chuyển tab.
   - Thư viện Gallery xem nhiều ảnh + xem phóng to (Lightbox).

---

## 2. Context & Background
- **Backend**: Solution `MT_GRMS_BACKEND.sln` (.NET 8, Clean Architecture, EF Core 8 Code-First, PostgreSQL qua Npgsql).
- **Frontend**: `MT_GRMS_FRONTEND` (React 19 + TypeScript, Vite). Màn hình `ProductListPage` điều phối `ProductFormModal` và `ProductDetailModal`.
- **Cloudinary Integration**: Đã có tiện ích `uploadToCloudinary` và endpoint backend hỗ trợ lưu trữ media.

---

## 3. Constraints
- **Multi-tenancy & Bảo mật**: Mọi truy vấn và dữ liệu lưu trữ phải gắn liền với TenantId của cửa hàng.
- **Backward Compatibility**:
  - Thuộc tính computed `[NotMapped] public string? ImageUrl => ImageUrls.FirstOrDefault();` trên `Product` được duy trì để không làm gãy POS Checkout, Inventory Lookup và các màn hình khác đã tích hợp trước đó.
  - Entity `ProductUnit` không có cột mã hàng trong DB.
- **Codebase Style**:
  - Tuân thủ nguyên tắc Karpathy: Sửa đúng chỗ, không refactor lan man, không thêm abstraction thừa.
  - Sử dụng layout flexbox 3 tầng với chiều cao và chiều rộng cố định cho modal.

---

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi sản phẩm có danh sách ảnh `List<string> ImageUrls`. Ảnh đầu tiên `ImageUrls[0]` mặc định là ảnh đại diện (avatar). Người dùng có thể đổi vị trí ảnh đại diện lên đầu danh sách.
- **[ASSUMPTION-02]**: Entity `ProductUnit` không lưu `ProductCode`. Trên toàn bộ giao diện (ProductFormModal, ProductDetailModal, ProductListPage), mã hàng hiển thị của đơn vị quy đổi mặc định lấy theo `product.productCode`.
- **[ASSUMPTION-03]**: Kích thước cố định của `ProductDetailModal` được chuẩn hóa đồng bộ với `ProductFormModal`: `maxWidth: 1160px`, `width: '96vw'`, `height: '88vh'`.

---

## 5. Scope & Non-Goals
### In Scope
- **Backend**:
  - Bổ sung `public List<string> ImageUrls { get; set; } = new();` và `[NotMapped] public string? ImageUrl => ImageUrls.FirstOrDefault();` vào Entity `Product`.
  - Cấu hình EF Core: `builder.Property(x => x.ImageUrls).HasColumnType("text[]");`.
  - Entity `ProductUnit` không chứa trường mã hàng.
  - Migration EF Core PostgreSQL: `AddProductImageUrlsAndUnitCode` và `RemoveUnitCodeFromProductUnit`.
  - Cập nhật DTOs (`ProductDtos`, `ProductUnitDtos`), Service (`CatalogService`, `ProductUnitService`), Repository, Controller.
- **Frontend**:
  - `ProductFormModal`: Upload nhiều ảnh qua Cloudinary, danh sách thumbnail, chọn ảnh đại diện (reorder lên index 0), xóa ảnh; bảng "Hàng cùng loại" hiển thị mã hàng mặc định theo mã sản phẩm cha.
  - `ProductDetailModal`: Cố định khung layout 3 tầng (Header - Body - Footer), cuộn độc lập tab body, nạp `description` và `internalNote` thực tế, thư viện ảnh Gallery (xem ảnh lớn + thumbnails + Lightbox), hiển thị mã hàng đơn vị theo mã sản phẩm cha.
- **Unit Tests**: Viết kiểm thử cho cả Backend và Frontend.

### Out of Scope (Non-Goals)
- Không can thiệp sửa đổi các màn hình POS bán hàng hay đơn hàng nhập kho đã chạy ổn định.
- Không xây dựng công cụ chỉnh sửa ảnh (crop, xoay, filter) phức tạp trên client.

---

## 6. Các Phương án Kỹ thuật & Quyết định

### Vấn đề 1: Lưu trữ nhiều ảnh sản phẩm trên PostgreSQL
- **Phương án A (Tạo Entity ProductImage và bảng quan hệ 1-N)**:
  - Cồng kềnh, cần bảng riêng, join truy vấn và cascade delete phức tạp.
- **Phương án B (PostgreSQL Native Array `text[]` với `List<string> ImageUrls` - CHỌN)**:
  - Tận dụng trực tiếp khả năng lưu mảng native `text[]` của PostgreSQL qua EF Core Npgsql. Hiệu năng tối ưu, nạp cùng sản phẩm không cần `.Include()`. Ảnh đầu tiên `[0]` tự nhiên là ảnh đại diện.
  - Backward compatibility: Khai báo thuộc tính tính toán `[NotMapped] public string? ImageUrl => ImageUrls.FirstOrDefault();`.

### Vấn đề 2: Mã hàng cho đơn vị quy đổi (`ProductUnit`)
- **Quyết định (CHỌN)**:
  - Entity `ProductUnit` không lưu `ProductCode`/`UnitCode` trong cơ sở dữ liệu.
  - Phía UI khi hiển thị mặc định `productCode` của `ProductUnit` giống với `product.productCode`.
  - Đảm bảo tính đơn giản, không phát sinh dư thừa dữ liệu và thống nhất mã định danh trên toàn bộ hệ thống.

---

## 7. Rủi ro & Cách giảm thiểu
1. **Rủi ro ảnh đại diện không đồng bộ**:
   - `Product.ImageUrl` là computed property trỏ trực tiếp vào `ImageUrls.FirstOrDefault()`, đảm bảo tính nhất quán 100%.
2. **Rủi ro giật lag khi chuyển tab ở Modal xem chi tiết**:
   - Cố định chiều cao cha bằng `height: '88vh', display: 'flex', flexDirection: 'column'`. Đặt `overflow-y: auto` riêng cho container của từng tab content.
