# Design Brief: product-crud-backend

## 1. Luồng tương tác & Luồng dữ liệu (UI/API Flow)

### 1.1. Luồng tải danh sách sản phẩm (ProductListPage)
```text
[Frontend: ProductListPage]
      │
      │  GET /api/products?searchTerm=...&categoryId=...&pageIndex=1&pageSize=10
      ▼
[Backend: ProductsController.GetProducts]
      │
      │  CatalogService.GetProductsPagedAsync(filter)
      ▼
[PostgreSQL: Products JOIN Categories WHERE IsDeleted = false]
      │  Thực hiện Skip/Take & Count
      ▼
[Kiểm tra RBAC: Nếu Role != Manager/Owner => CostPrice = null]
      │
      ▼
[Trả về ApiResponse<PagedResult<ProductResponse>>]
```

### 1.2. Luồng Tạo mới sản phẩm (ProductFormModal)
1. Người dùng bấm **"Thêm mới"** $\rightarrow$ `ProductFormModal` mở ra.
2. Nhập thông tin: Tên sản phẩm (bắt buộc), Nhóm hàng (bắt buộc), Giá bán (bắt buộc), Đơn vị tính cơ bản, Mã SKU/Mã vạch (nếu để trống backend tự sinh), Giá vốn, Định mức tồn kho Min/Max.
3. Bấm **"Lưu"** $\rightarrow$ Frontend gửi `POST /api/products`.
4. Backend kiểm tra:
   - Tồn tại của `CategoryId` trong Tenant.
   - Tính duy nhất của `ProductCode` và `Barcode` trong Tenant.
   - Giá trị `SellingPrice >= 0`, `MinStock >= 0`, `MaxStock >= MinStock`.
5. Lưu vào Database, trả về `201 Created` kèm `ProductResponse`.

### 1.3. Luồng Cập nhật & Xóa sản phẩm
- **Cập nhật (`PUT /api/products/{id}`)**: Cập nhật các trường thông tin cơ bản, giá bán, giá vốn, định mức tồn kho, hình ảnh, mô tả. Kiểm tra không bị trùng Barcode với sản phẩm khác.
- **Xóa (`DELETE /api/products/{id}`)**: Đánh dấu `IsDeleted = true`, lưu thời gian `UpdatedAt`.

---

## 2. Thiết kế Endpoints & DTOs

Base Route: `/api/products`

| Method | Endpoint | Quyền hạn (Roles) | Mô tả | Mã HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Tất cả | Lấy danh sách sản phẩm phân trang & bộ lọc | 200 OK |
| `GET` | `/api/products/{id}` | Tất cả | Lấy chi tiết sản phẩm theo ID | 200 OK / 404 |
| `POST` | `/api/products` | Store Owner, Branch Manager | Tạo mới sản phẩm | 201 Created / 400 |
| `PUT` | `/api/products/{id}` | Store Owner, Branch Manager | Cập nhật thông tin sản phẩm | 200 OK / 400 / 404 |
| `DELETE` | `/api/products/{id}` | Store Owner, Branch Manager | Xóa mềm sản phẩm | 200 OK / 404 |

### Chi tiết DTOs C#

```csharp
namespace MT_GRMS.Application.Catalog.Dtos;

public record ProductResponse(
    Guid Id,
    string ProductCode,
    string Barcode,
    string Name,
    Guid CategoryId,
    string CategoryName,
    string BaseUnit,
    decimal SellingPrice,
    decimal? CostPrice,
    decimal MinStock,
    decimal MaxStock,
    decimal VatRate,
    string ProductType,
    string Status,
    string? ImageUrl,
    string? Description,
    string? InternalNote,
    bool HasBatches,
    bool IsFavorite,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record ProductCreateRequest(
    string Name,
    Guid CategoryId,
    decimal SellingPrice,
    string? ProductCode = null,
    string? Barcode = null,
    string BaseUnit = "Cái",
    decimal? CostPrice = null,
    decimal MinStock = 0,
    decimal MaxStock = 1000,
    decimal VatRate = 0,
    string ProductType = "STANDARD",
    string Status = "Active",
    string? ImageUrl = null,
    string? Description = null,
    string? InternalNote = null,
    bool HasBatches = false,
    bool IsFavorite = false
);

public record ProductUpdateRequest(
    string Name,
    Guid CategoryId,
    decimal SellingPrice,
    string? Barcode = null,
    string BaseUnit = "Cái",
    decimal? CostPrice = null,
    decimal MinStock = 0,
    decimal MaxStock = 1000,
    decimal VatRate = 0,
    string Status = "Active",
    string? ImageUrl = null,
    string? Description = null,
    string? InternalNote = null,
    bool HasBatches = false,
    bool IsFavorite = false
);

public class ProductQueryFilter
{
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Status { get; set; }
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
```

---

## 3. Trạng thái Giao diện Frontend (UI States)
- **Loading State**: Hiển thị bảng dữ liệu với hiệu ứng skeleton / loading spinner khi đang fetch danh sách.
- **Empty State**: Khi bộ lọc hoặc từ khóa tìm kiếm không trả về kết quả: hiển thị bảng trống kèm thông báo *"Không tìm thấy sản phẩm nào phù hợp"*.
- **Role-based View**: 
  - Nếu đăng nhập bằng quyền `StoreOwner` hoặc `BranchManager`: Cột "Giá vốn" hiển thị số tiền đầy đủ.
  - Nếu đăng nhập bằng quyền `Cashier` hoặc `Staff`: Cột "Giá vốn" bị ẩn hoàn toàn hoặc hiển thị dấu `***` (backend trả `null`).

---

## 4. Thiết kế Cơ sở Dữ liệu

Bảng `Products` trong PostgreSQL đã có sẵn:
- `ProductID` (UUID, Khóa chính)
- `TenantID` (VARCHAR(50), Khóa phân lập Tenant)
- `CategoryID` (UUID, Khóa ngoại tới `Categories.CategoryID`)
- `ProductCode` (VARCHAR(50), Chỉ mục duy nhất theo `(TenantId, ProductCode)`)
- `Barcode` (VARCHAR(50), Chỉ mục duy nhất toàn cục)
- `Name` (VARCHAR(200), NOT NULL)
- `BaseUnit` (VARCHAR(30), NOT NULL)
- `CostPrice` (NUMERIC(18,2), NULL)
- `SellingPrice` (NUMERIC(18,2), DEFAULT 0.00)
- `MinStock` (NUMERIC(12,2), DEFAULT 0.00)
- `MaxStock` (NUMERIC(12,2), DEFAULT 1000.00)
- `VatRate` (NUMERIC(5,2), DEFAULT 0.00)
- `Status` (VARCHAR(30), DEFAULT 'Active')
- `CreatedAt`, `UpdatedAt`, `IsDeleted` (BaseTenantEntity)

$\rightarrow$ **Không cần thêm migration Database mới**, cấu trúc hiện tại đã hoàn toàn sẵn sàng.

---

## 5. Quy tắc nghiệp vụ (Business Rules)
1. **BR-PROD-01 (Unique SKU & Barcode)**: Trong cùng Tenant, `ProductCode` không được trùng lặp. `Barcode` phải là duy nhất.
2. **BR-PROD-02 (Category Integrity)**: `CategoryId` phải tồn tại trong cơ sở dữ liệu và thuộc cùng Tenant của phiên làm việc.
3. **BR-PROD-03 (Validation Ràng buộc số)**:
   - `SellingPrice` $\ge 0$.
   - `CostPrice` $\ge 0$ (nếu có).
   - `MinStock` $\ge 0$ và `MaxStock` $\ge$ `MinStock`.
4. **BR-SEC-01 (CostPrice Concealment)**: Khi tài khoản không mang vai trò quản lý (`SUPER_ADMIN`, `STORE_OWNER`, `BRANCH_MANAGER`, `StoreOwner`, `Manager`), backend tự động gán `CostPrice = null` trước khi trả ra client.
5. **BR-PROD-04 (Auto SKU)**: Nếu `ProductCreateRequest.ProductCode` để trống, hệ thống tự động sinh mã dạng `SP-{Guid.NewGuid().ToString()[..6].ToUpper()}`. Nếu `Barcode` để trống, lấy luôn mã SKU làm barcode.
