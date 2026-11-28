# Design Brief: branch-products-catalog

## 1. Luồng người dùng (User Workflows)

```
[Store Owner]
      │
      ├──> Truy cập /store-owner/stores/products
      │         │
      │         ├──> Chọn Chi nhánh từ Filter Bar / Dropdown
      │         │         │
      │         │         └──> Bảng hiển thị danh mục BranchProducts:
      │         │               - Ảnh thumbnail sản phẩm
      │         │               - Mã SKU, Tên sản phẩm, Nhóm hàng
      │         │               - Đơn vị cơ sở & Giá bán tổng hợp theo từng ĐVT
      │         │               - Giá vốn (Cost Price) từ NCC liên kết (read-only)
      │         │               - Giá bán lẻ hiện tại của chi nhánh
      │         │               - Tổng tồn kho vật lý (sum từ BranchStocks)
      │         │               - Trạng thái kinh doanh (Active/Inactive)
      │         │
      │         ├──> Bấm "Gán sản phẩm vào chi nhánh"
      │         │         │
      │         │         └──> Mở AssignStoreProductModal:
      │         │               - Ô input text tìm kiếm chi nhánh (autocomplete theo mã/tên)
      │         │               - Hiển thị địa chỉ chi nhánh đã chọn (read-only)
      │         │               - Tải danh sách Assignable Products (chỉ lấy SP từ NCC Active của chi nhánh)
      │         │               - Checkbox chọn nhiều sản phẩm
      │         │               - Bấm "Gán vào chi nhánh" -> Gọi API -> Refresh danh sách
      │         │
      │         ├──> Bấm "Chỉnh sửa" trên 1 dòng sản phẩm
      │         │         │
      │         │         └──> Mở EditStoreProductModal:
      │         │               - Layout ngang gọn gàng: SKU, Tên, ĐVT (read-only)
      │         │               - Giá vốn & MOQ: Hiển thị tham chiếu từ NCC (read-only, không cho sửa)
      │         │               - Ô nhập Giá bán lẻ cơ sở (RetailPrice)
      │         │               - Danh sách các ĐVT phụ: ô nhập giá bán cho từng ĐVT
      │         │               - Công tắc (Switch) Trạng thái kinh doanh (Active/Inactive)
      │         │               - Bấm "Lưu thay đổi" -> Lưu override vào BranchProducts & UnitPrices
      │         │
      │         ├──> Bấm "Tạm ngưng / Kích hoạt"
      │         │         │
      │         │         └──> Đổi trạng thái nhanh mà không ảnh hưởng chi nhánh khác
      │         │
      │         └──> Bấm "Gỡ khỏi chi nhánh"
      │                   │
      │                   ├──> Nếu tồn kho > 0: Hiển thị cảnh báo lỗi, chặn gỡ
      │                   └──> Nếu tồn kho = 0: Xác nhận và xóa mềm (IsDeleted = true)
```

## 2. Thiết kế Cơ sở dữ liệu (Database Schema & Migrations)

### Bảng mới 1: `BranchProducts`
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `Id` | `uuid` | PK | Mã định danh bản ghi |
| `TenantId` | `varchar(64)` | NOT NULL | Định danh khách hàng thuê đa người dùng |
| `BranchId` | `uuid` | FK -> Branches(Id) | Mã chi nhánh |
| `ProductId` | `uuid` | FK -> Products(Id) | Mã sản phẩm |
| `SellingPriceOverride` | `decimal(18,2)` | NULL | Giá bán lẻ ghi đè (NULL = dùng Product.SellingPrice) |
| `Status` | `varchar(32)` | NOT NULL, Default 'Active' | Trạng thái kinh doanh ('Active' / 'Inactive') |
| `ShelfLocation` | `varchar(128)` | NULL | Vị trí quầy kệ tại chi nhánh |
| `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy` | Audit fields | BaseTenantEntity | Dấu vết kiểm toán |
| `IsDeleted` | `boolean` | NOT NULL, Default false | Xóa mềm |

- **Chỉ mục (Index)**:
  - `IX_BranchProducts_Tenant_Branch_Product`: Unique index trên `(TenantId, BranchId, ProductId)` có điều kiện filter `IsDeleted = false`.

### Bảng mới 2: `BranchProductUnitPrices`
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `Id` | `uuid` | PK | Mã định danh bản ghi |
| `TenantId` | `varchar(64)` | NOT NULL | Định danh tenant |
| `BranchProductId` | `uuid` | FK -> BranchProducts(Id) ON DELETE CASCADE | Mã bản ghi BranchProduct |
| `ProductUnitId` | `uuid` | FK -> ProductUnits(Id) | Mã đơn vị tính phụ |
| `SellingPriceOverride` | `decimal(18,2)` | NOT NULL | Giá bán lẻ ghi đè cho ĐVT này tại chi nhánh |
| `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy` | Audit fields | BaseTenantEntity | Dấu vết kiểm toán |
| `IsDeleted` | `boolean` | NOT NULL, Default false | Xóa mềm |

- **Chỉ mục (Index)**:
  - `IX_BranchProductUnitPrices_Tenant_BP_Unit`: Unique index trên `(TenantId, BranchProductId, ProductUnitId)` có filter `IsDeleted = false`.

### Các file Migration EF Core:
1. `20261103230000_AddBranchProductsCatalog.cs`:
   - Tạo bảng `BranchProducts` và tạo chỉ mục unique.
   - Chạy lệnh SQL backfill:
     ```sql
     INSERT INTO "BranchProducts" ("Id", "TenantId", "BranchId", "ProductId", "SellingPriceOverride", "Status", "ShelfLocation", "CreatedAt", "CreatedBy", "IsDeleted")
     SELECT gen_random_uuid(), bs."TenantId", bs."BranchId", bs."ProductId", NULL, 'Active', MAX(bs."ShelfLocation"), NOW(), 'migration-backfill', false
     FROM "BranchStocks" bs
     WHERE bs."IsDeleted" = false
     GROUP BY bs."TenantId", bs."BranchId", bs."ProductId"
     ON CONFLICT DO NOTHING;
     ```
2. `20261103233000_AddBranchProductUnitPrices.cs`:
   - Tạo bảng `BranchProductUnitPrices` và cấu hình liên kết ngoại khóa.

## 3. Thiết kế API & DTOs (Backend Application Layer)

### Endpoints (`BranchesController.cs`):
1. `GET /api/branches/{branchId}/products`:
   - Query: `PageIndex`, `PageSize`, `SearchTerm`, `Category`, `Status`, `StockAlertFilter`.
   - Trả về: `PagedResult<BranchProductDto>`.
2. `GET /api/branches/{branchId}/assignable-products`:
   - Trả về: `List<AssignableBranchProductDto>` (lọc theo các NCC active liên kết chi nhánh).
3. `POST /api/branches/{branchId}/products`:
   - Body: `AssignBranchProductsCommand` (`ProductIds`, `DefaultRetailPrice`, `ShelfLocation`).
   - Trả về: `List<BranchProductDto>` đã được gán mới.
4. `PUT /api/branches/{branchId}/products/{productId}`:
   - Body: `UpdateBranchProductCommand` (`RetailPrice`, `Status`, `ShelfLocation`, `UnitPrices`).
   - Trả về: `BranchProductDto` sau khi cập nhật.
5. `PATCH /api/branches/{branchId}/products/{productId}/status`:
   - Body: `ToggleBranchProductStatusRequest` (`Status`).
   - Trả về: `BranchProductDto`.
6. `DELETE /api/branches/{branchId}/products/{productId}`:
   - Trả về: `204 NoContent` hoặc ném `CANNOT_REMOVE_PRODUCT_WITH_STOCK` nếu tồn > 0.

### DTOs chính:
```csharp
public class BranchProductDto
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    public string BranchCode { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal RetailPrice { get; set; }
    public decimal CostPrice { get; set; }
    public decimal CurrentStock { get; set; }
    public decimal MinStockLevel { get; set; }
    public Guid? SupplierId { get; set; }
    public string PrimarySupplierName { get; set; } = string.Empty;
    public int MinOrderQuantity { get; set; }
    public string Status { get; set; } = "Active";
    public string? ShelfLocation { get; set; }
    public DateTime AssignedDate { get; set; }
    public List<BranchProductUnitPriceDto> UnitPrices { get; set; } = new();
}

public class BranchProductUnitPriceDto
{
    public Guid? UnitId { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public decimal ConversionRate { get; set; } = 1m;
    public decimal Price { get; set; }
    public bool IsBaseUnit { get; set; }
}

public class AssignableBranchProductDto
{
    public Guid ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string BaseUoM { get; set; } = "Cái";
    public string? ImageUrl { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int Moq { get; set; } = 1;
    public Guid SupplierId { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public bool IsAlreadyAssigned { get; set; }
    public List<BranchProductUnitPriceDto> UnitPrices { get; set; } = new();
}
```

## 4. Thiết kế Giao diện Frontend (Components & States)

### 1. `StoreProductTable.tsx`
- **Các cột hiển thị**:
  1. `Ảnh`: Thumbnail 40x40px, hỗ trợ fallback avatar khi thiếu ảnh.
  2. `Mã SKU`: Monospace font, kèm mã vạch Barcode nếu có.
  3. `Tên sản phẩm & Danh mục`: Tên in đậm, nhãn phân loại bên dưới.
  4. `ĐVT Cơ sở`: Tên đơn vị tính gốc.
  5. `Giá bán theo ĐVT`: Danh sách thu gọn gồm các mức giá (ví dụ: `Cái: 10.000 · Lốc: 58.000 · Thùng: 230.000`).
  6. `Giá vốn`: Lấy từ NCC liên kết, định dạng tiền tệ VND, có tooltip "Giá nhập thỏa thuận từ NCC".
  7. `Giá bán lẻ`: Mức giá bán lẻ hiệu lực của chi nhánh cho ĐVT cơ sở.
  8. `Tồn kho`: Tổng tồn hiện tại từ các lô hàng trong kho.
  9. `Trạng thái`: Badge "Đang kinh doanh" (xanh lá) / "Tạm ngưng" (xám).
  10. `Thao tác`: Nút Sửa, Tạm ngưng/Kích hoạt, Gỡ khỏi chi nhánh.

### 2. `AssignStoreProductModal.tsx`
- Thanh tìm kiếm chi nhánh: Ô input hỗ trợ gõ text lọc gợi ý chi nhánh tức thời.
- Hiển thị địa chỉ của chi nhánh đã chọn trong khung xám read-only để xác nhận đúng cơ sở.
- Bảng sản phẩm khả dụng: Hiển thị SKU, Tên, ĐVT, Nhà cung cấp tương ứng, Giá vốn, Giá bán đề xuất.
- Checkbox chọn từng dòng hoặc chọn tất cả (`Select All`). Nút "Gán sản phẩm" hiển thị số lượng đã chọn.

### 3. `EditStoreProductModal.tsx`
- Header: Icon sản phẩm, tiêu đề "Chỉnh sửa sản phẩm tại chi nhánh", nút đóng X.
- Thân modal bố trí các dòng ngang (Horizontal Rows):
  - Dòng SKU (read-only)
  - Dòng Tên sản phẩm (read-only)
  - Dòng Đơn vị cơ sở (read-only)
  - Dòng Giá vốn NCC & MOQ: Hiển thị dạng badge/text có nhãn "(Theo NCC, không thể sửa tại đây)".
  - Dòng Giá bán lẻ cơ sở: Input tiền tệ có validate > 0.
  - Khối Giá bán theo từng ĐVT: Hiển thị danh sách các ĐVT phụ với input riêng cho từng đơn vị.
  - Dòng Vị trí quầy kệ: Input text vị trí kệ (ví dụ: "Kệ A1-02").
  - Dòng Trạng thái: Toggle Switch "Đang kinh doanh" / "Tạm ngưng".
- Footer: Nút Hủy và Nút Lưu thay đổi (có loading state).

## 5. Quy tắc nghiệp vụ & Phân quyền (Business Rules & Security)
1. **Multi-tenant Isolation**: Mọi truy vấn `BranchProduct` và `BranchProductUnitPrice` đều tự động lọc theo `TenantId` của phiên làm việc.
2. **Khóa chỉnh sửa MOQ/Cost**: Tuyệt đối không nhận hoặc ghi đè MOQ/Cost từ `UpdateBranchProductCommand` sang bảng `SupplierProducts` hay `Products`.
3. **Branch Isolation**: Thay đổi giá tại Chi nhánh 1 chỉ tạo/cập nhật `BranchProduct` của Chi nhánh 1, không làm thay đổi giá của Chi nhánh 2 hay Master Product.
4. **Safety Check khi gỡ SP**: Kiểm tra `SUM(QuantityOnHand) > 0` thì trả lỗi nghiệp vụ `CANNOT_REMOVE_PRODUCT_WITH_STOCK` (HTTP 400).

