# Design Brief: product-images-and-unit-codes

## 1. Luồng Người Dùng (User Flows)

### Flow 1: Quản lý Nhiều Ảnh khi Thêm/Sửa Sản Phẩm
1. Người dùng mở `ProductFormModal`.
2. Tại khu vực "Ảnh sản phẩm":
   - Bấm nút hoặc kéo thả nhiều ảnh: Hệ thống upload từng file lên Cloudinary và đưa vào danh sách ảnh (`images`).
   - Ảnh đầu tiên tự động nhận cờ "Ảnh chính" (Avatar) có viền xanh + badge `Ảnh chính` (hoặc icon ngôi sao vàng).
   - Người dùng có thể click nút "Đặt làm ảnh chính" ở bất kỳ ảnh phụ nào để đổi avatar.
   - Người dùng có thể xóa bớt ảnh bất kỳ bằng nút thùng rác.
   - Bấm vào thumbnail để mở Lightbox phóng to ảnh xem chi tiết.
3. Khi Lưu sản phẩm: Gửi mảng `images: [{ imageUrl, isMain, displayOrder }]` lên Backend API. Trường `imageUrl` chính của sản phẩm tự động lấy theo ảnh `isMain`.

### Flow 2: Tự Động Sinh Mã Hàng cho Đơn Vị Quy Đổi
1. Tại phần "Đơn vị tính" trong `ProductFormModal`, người dùng nhập tên đơn vị quy đổi (ví dụ: "Thùng").
2. Bảng "Hàng cùng loại" tự động sinh mã gợi ý: `{Mã SP}-THUNG`.
3. Người dùng có thể chỉnh sửa mã này trực tiếp trong ô input Mã hàng của dòng đơn vị quy đổi.
4. Khi bấm Lưu:
   - Backend kiểm tra trường `UnitCode`. Nếu rỗng, tự động sinh `{product.ProductCode}-{unitSlug}`.
   - Backend lưu `UnitCode` vào bản ghi `ProductUnit`.

### Flow 3: Xem Chi Tiết Hàng Hóa với Modal Cố Định W-H & Gallery Ảnh
1. Người dùng click vào dòng sản phẩm trên bảng `ProductListPage`.
2. Mở `ProductDetailModal` với kích thước chuẩn cố định: `maxWidth: 1160px, width: '96vw', height: '90vh'`.
3. **Cấu trúc 3 tầng**:
   - **Header cố định**: Tên hàng hóa, mã hàng, barcode, thanh pills chuyển đổi ĐVT nhanh.
   - **Body cuộn độc lập**: Chứa các tab (Thông tin chung, Đơn vị tính & Quy đổi giá, Thẻ kho, Tồn kho chi nhánh).
     - Khi chuyển đổi giữa tab "Thông tin chung" và "Thẻ kho", khung modal không bị nhảy giật hay co giãn kích thước.
     - Tab "Thông tin chung":
       - Gallery ảnh: Hiển thị ảnh chính lớn bên trên + dải thumbnail bên dưới. Bấm vào thumbnail đổi ảnh đang hiển thị. Bấm vào ảnh lớn mở Lightbox phóng to.
       - "Mô tả": Hiển thị `product.description` (nếu rỗng: `Chưa có mô tả`).
       - "Ghi chú nội bộ": Hiển thị `product.internalNote` (nếu rỗng: `Chưa có ghi chú`).
   - **Footer cố định**: Chứa các nút Thao tác (In mã vạch, Chỉnh sửa, Đóng).

---

## 2. Thiết Kế Cơ Sở Dữ Liệu (Database Changes)

### Bảng mới: `ProductImages`
```sql
CREATE TABLE ProductImages (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    ProductId UNIQUEIDENTIFIER NOT NULL,
    ImageUrl NVARCHAR(1000) NOT NULL,
    IsMain BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
);

CREATE INDEX IX_ProductImages_ProductId ON ProductImages(ProductId);
CREATE INDEX IX_ProductImages_ProductId_IsMain ON ProductImages(ProductId, IsMain);
```

### Bảng cập nhật: `ProductUnits`
```sql
ALTER TABLE ProductUnits
ADD UnitCode NVARCHAR(100) NULL;

CREATE INDEX IX_ProductUnits_UnitCode ON ProductUnits(UnitCode);
```

### EF Core Migration:
- Tên migration: `AddProductImagesAndUnitCode`
- Quan hệ trong DbContext:
  ```csharp
  modelBuilder.Entity<Product>()
      .HasMany(p => p.Images)
      .WithOne(i => i.Product)
      .HasForeignKey(i => i.ProductId)
      .OnDelete(DeleteBehavior.Cascade);
  ```

---

## 3. API Contract & DTOs

### 1. `ProductDtos.cs`
```csharp
public record ProductImageDto(
    Guid? Id,
    string ImageUrl,
    bool IsMain,
    int DisplayOrder
);

public record ProductResponse(
    // ... các trường hiện tại ...
    IReadOnlyList<ProductImageDto> Images,
    // ...
);

public record ProductCreateRequest(
    // ... các trường hiện tại ...
    IReadOnlyList<ProductImageDto>? Images = null,
    // ...
);

public record ProductUpdateRequest(
    // ... các trường hiện tại ...
    IReadOnlyList<ProductImageDto>? Images = null,
    // ...
);
```

### 2. `ProductUnitDtos.cs`
```csharp
public class ProductUnitResponse
{
    // ... các trường hiện tại ...
    public string? UnitCode { get; set; }
}

public class ProductUnitCreateRequest
{
    // ... các trường hiện tại ...
    public string? UnitCode { get; set; }
}

public class ProductUnitUpdateRequest
{
    // ... các trường hiện tại ...
    public string? UnitCode { get; set; }
}
```

---

## 4. UI Components & States (Frontend)

| Component | Trạng thái Loading | Trạng thái Empty | Trạng thái Error |
|---|---|---|---|
| **Multi-Image Uploader** (`ProductFormModal`) | Spinner xoay trên thumbnail đang tải lên Cloudinary | Placeholder khung nét đứt "Tải lên ảnh sản phẩm" (hỗ trợ nhiều ảnh) | Viền đỏ + toast lỗi khi vượt quá 5MB hoặc sai định dạng file |
| **Image Gallery** (`ProductDetailModal`) | Skeleton mờ tại khung ảnh lớn | Placeholder icon `Package` màu xám "Không có ảnh" | Fallback ảnh mặc định nếu URL hỏng |
| **Tab Thẻ kho / Đơn vị** (`ProductDetailModal`) | Antd Table Spin loading | Empty state "Chưa có phát sinh giao dịch trong kho" | Banner thông báo lỗi nếu tải thất bại |

---

## 5. Quy Tắc Nghiệp Vụ & Phân Quyền (Business Rules)
1. **BR-IMG-01**: Một sản phẩm có thể có từ 0 đến 10 ảnh. Nếu danh sách ảnh có ít nhất 1 ảnh, bắt buộc phải có đúng 1 ảnh mang `isMain: true`.
2. **BR-UOM-CODE-01**: Mã đơn vị quy đổi (`UnitCode`) không được trùng với bất kỳ `ProductCode` nào khác hoặc `UnitCode` nào khác trong cùng Tenant.
3. **BR-SEC-01**: Giữ nguyên phân quyền: Cột "Giá vốn" trong `ProductDetailModal` chỉ hiển thị với `StoreOwner` / `Admin`, hoàn toàn ẩn với `Cashier` / `Staff`.
