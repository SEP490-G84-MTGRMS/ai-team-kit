# Thiết kế Kỹ thuật (Design Brief): Tự động sinh mã tuần tự cho Category & Product

## 1. Luồng Tương tác & API
```
Người dùng (Web / POS) 
   │
   ├── (Không nhập Mã) ──> POST /api/v1/categories (Code = null / "")
   │                         └── CategoryService.CreateAsync()
   │                               ├── CategoryRepo.GetMaxSequentialCodeAsync("CAT", length=9)
   │                               ├── nextNum = maxNum + 1 -> "CAT000001"
   │                               ├── Vòng lặp kiểm tra ExistsByCodeAsync("CAT000001")
   │                               └── Lưu Category (CategoryCode = "CAT000001")
   │
   └── (Không nhập Mã / Không nhập Barcode) ──> POST /api/v1/products (ProductCode = null, Barcode = null)
                             └── CatalogService.CreateProductAsync()
                                   ├── ProductRepo.GetMaxSequentialCodeAsync("SP", length=8)
                                   ├── nextNum = maxNum + 1 -> "SP000001"
                                   ├── Vòng lặp kiểm tra ExistsByCodeAsync("SP000001")
                                   ├── Xử lý Barcode: string.IsNullOrWhiteSpace(request.Barcode) ? null : request.Barcode.Trim()
                                   └── Lưu Product (ProductCode = "SP000001", Barcode = null)
```

## 2. Thiết kế Tầng Repository
### 2.1. `ICategoryRepository`
```csharp
Task<string?> GetMaxSequentialCodeAsync(string prefix, int totalLength, CancellationToken cancellationToken = default);
```
- **Triển khai tại `CategoryRepository`**:
  ```csharp
  public async Task<string?> GetMaxSequentialCodeAsync(string prefix, int totalLength, CancellationToken cancellationToken = default)
  {
      return await _dbSet
          .AsNoTracking()
          .Where(c => c.CategoryCode.StartsWith(prefix) && c.CategoryCode.Length == totalLength)
          .OrderByDescending(c => c.CategoryCode)
          .Select(c => c.CategoryCode)
          .FirstOrDefaultAsync(cancellationToken);
  }
  ```

### 2.2. `IProductRepository`
```csharp
Task<string?> GetMaxSequentialCodeAsync(string prefix, int totalLength, CancellationToken cancellationToken = default);
```
- **Triển khai tại `ProductRepository`**:
  ```csharp
  public async Task<string?> GetMaxSequentialCodeAsync(string prefix, int totalLength, CancellationToken cancellationToken = default)
  {
      return await _dbSet
          .AsNoTracking()
          .Where(p => !p.IsDeleted && p.ProductCode.StartsWith(prefix) && p.ProductCode.Length == totalLength)
          .OrderByDescending(p => p.ProductCode)
          .Select(p => p.ProductCode)
          .FirstOrDefaultAsync(cancellationToken);
  }
  ```
- **Cập nhật `ExistsByBarcodeAsync`**:
  ```csharp
  public async Task<bool> ExistsByBarcodeAsync(string barcode, Guid? excludeId = null, CancellationToken cancellationToken = default)
  {
      if (string.IsNullOrWhiteSpace(barcode)) return false;
      var normalizedBarcode = barcode.Trim();
      return await _dbSet.AnyAsync(p =>
          !p.IsDeleted &&
          p.Barcode == normalizedBarcode &&
          (!excludeId.HasValue || p.Id != excludeId.Value),
          cancellationToken);
  }
  ```

## 3. Thiết kế Tầng Service (Logic Sinh mã & Barcode)
### 3.1. `CategoryService.cs`
- Khi `string.IsNullOrWhiteSpace(request.Code)`:
  1. `var maxCode = await _categoryRepository.GetMaxSequentialCodeAsync("CAT", 9, cancellationToken);`
  2. Parse số từ `maxCode`:
     - Nếu `maxCode` hợp lệ và `int.TryParse(maxCode.Substring(3), out var currentMax)`: `nextNumber = currentMax + 1`.
     - Ngược lại: `nextNumber = 1`.
  3. Format `code = $"CAT{nextNumber:D6}"`.
  4. Vòng lặp an toàn chống trùng:
     ```csharp
     while (await _categoryRepository.ExistsByCodeAsync(code, null, cancellationToken))
     {
         nextNumber++;
         code = $"CAT{nextNumber:D6}";
     }
     ```
- Khi `request.Code` có giá trị:
  - Chuẩn hóa: `code = request.Code.Trim().ToUpper();`
  - Kiểm tra `ExistsByCodeAsync`: Nếu trùng ném `BusinessException("CATEGORY_CODE_EXISTS", ...)`.

### 3.2. `CatalogService.cs`
- Khi `string.IsNullOrWhiteSpace(request.ProductCode)`:
  1. `var maxCode = await _productRepository.GetMaxSequentialCodeAsync("SP", 8, cancellationToken);`
  2. Parse số từ `maxCode`:
     - Nếu `maxCode` hợp lệ và `int.TryParse(maxCode.Substring(2), out var currentMax)`: `nextNumber = currentMax + 1`.
     - Ngược lại: `nextNumber = 1`.
  3. Format `code = $"SP{nextNumber:D6}"`.
  4. Vòng lặp an toàn chống trùng:
     ```csharp
     while (await _productRepository.ExistsByCodeAsync(code, null, cancellationToken))
     {
         nextNumber++;
         code = $"SP{nextNumber:D6}";
     }
     ```
- Xử lý Barcode:
  - `string? barcode = string.IsNullOrWhiteSpace(request.Barcode) ? null : request.Barcode.Trim();`
  - Nếu `!string.IsNullOrWhiteSpace(barcode)`: Kiểm tra `ExistsByBarcodeAsync(barcode)`. Nếu trùng ném `PRODUCT_BARCODE_EXISTS`.
  - Nếu `barcode` là `null`: Cho phép lưu `null` vào CSDL.

## 4. Thay đổi Cơ sở dữ liệu (Database Schema)
- **`Product.cs`**: Thuộc tính `public string? Barcode { get; set; }` chuyển thành nullable.
- **`ProductResponse`**: Thuộc tính `string? Barcode` chuyển thành nullable.
- **`ProductConfiguration.cs`**:
  - `builder.Property(x => x.Barcode).HasMaxLength(50).IsRequired(false);`
  - Index `builder.HasIndex(x => x.Barcode).IsUnique();` (Trong PostgreSQL, unique index cho phép nhiều dòng có giá trị NULL).
- **EF Core Migration**: Tạo migration `MakeProductBarcodeNullable` chuyển cột `Barcode` trong bảng `Products` từ `NOT NULL` sang `NULL`.

## 5. Quy tắc Nghiệp vụ & Phân quyền
- **Phân quyền**: Chỉ người dùng có role quản lý (`SUPER_ADMIN`, `STORE_OWNER`, `BRANCH_MANAGER`, `WAREHOUSE_STAFF`) mới được quyền thêm mới nhóm hàng và sản phẩm.
- **Tenant Isolation**: Các câu truy vấn trong Repository kế thừa từ `GenericRepository` tự động gán bộ lọc `TenantId == _tenantContext.CurrentTenantId`.
