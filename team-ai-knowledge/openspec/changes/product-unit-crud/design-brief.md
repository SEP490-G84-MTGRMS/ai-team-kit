# Thiết kế kỹ thuật (Design Brief): CRUD Entity ProductUnit

## 1. Kiến trúc tổng thể (Architecture Map)

```
[Client / Frontend / POS]
           │
           ▼
[ProductUnitsController / ProductsController (MT_GRMS.Api)]
           │
           ▼
[IProductUnitService / ProductUnitService (MT_GRMS.Application)]
   ├── Kiểm tra TenantId
   ├── Kiểm tra ProductId tồn tại
   ├── Kiểm tra trùng tên đơn vị trong sản phẩm
   └── Kiểm tra trùng Barcode
           │
           ▼
[IProductUnitRepository / ProductUnitRepository (MT_GRMS.Infrastructure)]
           │
           ▼
[PostgreSQL Database / Bảng ProductUnits]
```

---

## 2. API Contract & DTOs

### 2.1. Danh sách Endpoints
1. `GET /api/v1/products/{productId:guid}/units`: Lấy toàn bộ danh sách đơn vị quy đổi của sản phẩm, sắp xếp đơn vị cơ bản lên đầu.
2. `GET /api/v1/product-units/{id:guid}`: Lấy chi tiết một đơn vị tính.
3. `POST /api/v1/products/{productId:guid}/units`: Thêm đơn vị tính mới cho sản phẩm.
4. `PUT /api/v1/product-units/{id:guid}`: Cập nhật thông tin đơn vị tính.
5. `DELETE /api/v1/product-units/{id:guid}`: Xóa đơn vị tính quy đổi.

### 2.2. Data Transfer Objects (DTOs)
```csharp
namespace MT_GRMS.Application.Catalog.Dtos;

public class ProductUnitResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public decimal ConversionRate { get; set; }
    public decimal Price { get; set; }
    public string? Barcode { get; set; }
    public bool IsBaseUnit { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ProductUnitCreateRequest
{
    public string UnitName { get; set; } = string.Empty;
    public decimal ConversionRate { get; set; } = 1.00m;
    public decimal Price { get; set; } = 0.00m;
    public string? Barcode { get; set; }
    public bool IsBaseUnit { get; set; } = false;
}

public class ProductUnitUpdateRequest
{
    public string UnitName { get; set; } = string.Empty;
    public decimal ConversionRate { get; set; } = 1.00m;
    public decimal Price { get; set; } = 0.00m;
    public string? Barcode { get; set; }
    public bool IsBaseUnit { get; set; } = false;
}
```

---

## 3. Quy tắc nghiệp vụ (Business Rules)
1. **BR-UNIT-01 (Tên đơn vị)**:
   - `UnitName` không được để trống (tối đa 50 ký tự).
   - Không được trùng tên đơn vị tính khác của cùng một sản phẩm (so sánh không phân biệt hoa thường).
2. **BR-UNIT-02 (Tỷ lệ quy đổi)**:
   - `ConversionRate` bắt buộc phải $> 0$.
   - Nếu `IsBaseUnit == true`, `ConversionRate` bắt buộc phải là $1.00$.
3. **BR-UNIT-03 (Giá bán)**:
   - `Price` không được âm ($\ge 0$).
4. **BR-UNIT-04 (Đơn vị cơ bản duy nhất)**:
   - Một sản phẩm chỉ có tối đa 1 đơn vị có `IsBaseUnit == true`.
   - Nếu một đơn vị được cập nhật thành `IsBaseUnit = true`, đơn vị cơ bản cũ (nếu có) sẽ tự động chuyển thành `IsBaseUnit = false`.
5. **BR-UNIT-05 (Mã vạch Barcode)**:
   - Nếu có nhập `Barcode`, mã vạch không được trùng với các đơn vị khác hoặc sản phẩm khác trong cùng Tenant.
6. **BR-UNIT-06 (An toàn dữ liệu)**:
   - Không được phép xóa đơn vị có `IsBaseUnit == true` nếu sản phẩm chỉ còn duy nhất 1 đơn vị tính.

---

## 4. Thay đổi CSDL (Database Schema)
- Bảng `ProductUnits` đã tồn tại trong database với đầy đủ các cột:
  `UnitID`, `ProductID`, `UnitName`, `ConversionRate`, `Price`, `Barcode`, `IsBaseUnit`, `TenantID`, `CreatedAt`, `UpdatedAt`.
- **Không cần tạo migration mới**.
