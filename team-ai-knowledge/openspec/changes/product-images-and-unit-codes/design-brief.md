# Design Brief: product-images-and-unit-codes

## 1. Luồng Người Dùng (User Flows)

### Flow 1: Quản lý Nhiều Ảnh khi Thêm/Sửa Sản Phẩm
1. Người dùng mở `ProductFormModal`.
2. Tại khu vực "Ảnh sản phẩm":
   - Bấm nút hoặc kéo thả nhiều ảnh: Hệ thống upload từng file lên Cloudinary và đưa vào danh sách ảnh (`images`).
   - Ảnh đầu tiên (index 0) tự động là "Ảnh chính" (Avatar) có viền xanh `#0D9488` + badge `Chính`.
   - Người dùng có thể click nút "Đặt chính" ở bất kỳ ảnh phụ nào để đổi vị trí ảnh đó lên vị trí đầu tiên (index 0).
   - Người dùng có thể xóa bớt ảnh bất kỳ bằng nút thùng rác.
   - Bấm vào thumbnail để mở Lightbox phóng to ảnh xem chi tiết.
3. Khi Lưu sản phẩm: Gửi mảng `imageUrls: string[]` lên Backend API. Trường `imageUrl` chính của sản phẩm tự động tương thích với ảnh đầu tiên `imageUrls[0]`.

### Flow 2: Tự Động Sinh Mã Hàng cho Đơn Vị Quy Đổi
1. Tại phần "Đơn vị tính" trong `ProductFormModal`, người dùng nhập tên đơn vị quy đổi (ví dụ: "Thùng").
2. Bảng "Hàng cùng loại" tự động sinh mã gợi ý: `{Mã SP}-THUNG`.
3. Người dùng có thể chỉnh sửa mã này trực tiếp trong ô input Mã hàng của dòng đơn vị quy đổi.
4. Khi bấm Lưu:
   - Backend kiểm tra trường `UnitCode`. Nếu rỗng, tự động sinh `{product.ProductCode}-{unitSlug}`.
   - Backend lưu `UnitCode` vào bản ghi `ProductUnit`.

### Flow 3: Xem Chi Tiết Hàng Hóa với Modal Cố Định W-H & Gallery Ảnh
1. Người dùng click vào dòng sản phẩm trên bảng `ProductListPage`.
2. Mở `ProductDetailModal` với kích thước chuẩn cố định: `maxWidth: 1160px, width: '96vw', height: '88vh'`.
3. **Cấu trúc 3 tầng**:
   - **Header cố định** (`flexShrink: 0`): Tên hàng hóa, mã hàng, barcode, thanh pills chuyển đổi ĐVT nhanh.
   - **Body cuộn độc lập** (`flex: 1, overflowY: 'auto'`): Chứa các tab (Thông tin chung, Đơn vị tính & Quy đổi giá, Thẻ kho, Tồn kho chi nhánh).
     - Khi chuyển đổi giữa tab "Thông tin chung" và "Thẻ kho", khung modal không bị nhảy giật hay co giãn kích thước.
     - Tab "Thông tin chung":
       - Gallery ảnh: Hiển thị ảnh chính lớn bên trên kèm nhãn "Chính" + dải thumbnail bên dưới. Bấm vào thumbnail đổi ảnh đang hiển thị. Bấm vào ảnh lớn mở Lightbox phóng to.
       - "Mô tả": Hiển thị dữ liệu thực tế `product.description` (nếu rỗng: `Chưa có mô tả chi tiết cho hàng hóa này.`).
       - "Ghi chú nội bộ": Hiển thị dữ liệu thực tế `product.internalNote` (nếu rỗng: `Chưa có ghi chú nội bộ.`).
   - **Footer cố định** (`flexShrink: 0`): Chứa các nút Thao tác (In mã vạch, Chỉnh sửa, Đóng).

---

## 2. Thiết Kế Cơ Sở Dữ Liệu (PostgreSQL Database Changes)

### Bảng cập nhật: `Products`
Sử dụng kiểu dữ liệu native array `text[]` của PostgreSQL:
```sql
ALTER TABLE "Products"
DROP COLUMN IF EXISTS "ImageUrl";

ALTER TABLE "Products"
ADD "ImageUrls" text[] NOT NULL DEFAULT '{}';
```

### Bảng cập nhật: `ProductUnits`
```sql
ALTER TABLE "ProductUnits"
ADD "UnitCode" character varying(100) NULL;

CREATE INDEX "IX_ProductUnits_UnitCode" ON "ProductUnits"("UnitCode");
```

### EF Core Configuration (Npgsql):
```csharp
// ProductConfiguration.cs
builder.Property(x => x.ImageUrls)
    .HasColumnType("text[]");

// ProductUnitConfiguration.cs
builder.Property(x => x.UnitCode)
    .HasMaxLength(100);
builder.HasIndex(x => x.UnitCode);
```

---

## 3. API Contract & DTOs

### 1. `ProductDtos.cs`
```csharp
public record ProductResponse(
    // ... các trường hiện tại ...
    string? ImageUrl, // Tương thích ngược: ImageUrls.FirstOrDefault()
    List<string>? ImageUrls,
    // ...
);

public record ProductCreateRequest(
    // ... các trường hiện tại ...
    List<string>? ImageUrls = null,
    // ...
);

public record ProductUpdateRequest(
    // ... các trường hiện tại ...
    List<string>? ImageUrls = null,
    // ...
);
```

### 2. `ProductUnitDtos.cs`
```csharp
public record ProductUnitResponse(
    Guid Id,
    string UnitName,
    string? UnitCode,
    decimal ConversionRate,
    decimal Price,
    string? Barcode,
    bool IsBaseUnit
);

public record ProductUnitCreateRequest(
    string UnitName,
    string? UnitCode,
    decimal ConversionRate,
    decimal Price,
    string? Barcode,
    bool IsBaseUnit = false
);

public record ProductUnitUpdateRequest(
    string UnitName,
    string? UnitCode,
    decimal ConversionRate,
    decimal Price,
    string? Barcode,
    bool IsBaseUnit = false
);
```
