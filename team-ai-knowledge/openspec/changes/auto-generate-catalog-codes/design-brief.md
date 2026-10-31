# Thiết kế Kỹ thuật (Design Brief): Tự động sinh mã tuần tự cho Category & Product

## 1. Luồng Tương tác & API
```
Người dùng (Web / POS) 
   │
   ├── (Không nhập Mã) ──> POST /api/v1/categories (Code = null / "")
   │                         └── CategoryService.CreateAsync()
   │                               ├── CategoryRepo.GetMaxCodeNumberAsync("CAT", length=9)
   │                               ├── nextNum = maxNum + 1 -> "CAT000001"
   │                               ├── Vòng lặp kiểm tra ExistsByCodeAsync("CAT000001")
   │                               └── Lưu Category (CategoryCode = "CAT000001")
   │
   └── (Không nhập Mã) ──> POST /api/v1/products (ProductCode = null / "")
                             └── CatalogService.CreateProductAsync()
                                   ├── ProductRepo.GetMaxCodeNumberAsync("SP", length=8)
                                   ├── nextNum = maxNum + 1 -> "SP000001"
                                   ├── Vòng lặp kiểm tra ExistsByCodeAsync("SP000001")
                                   └── Lưu Product (ProductCode = "SP000001", Barcode = Barcode ?? "SP000001")
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

## 3. Thiết kế Tầng Service (Logic Sinh mã)
### 3.1. `CategoryService.cs`
- Khi `string.IsNullOrWhiteSpace(request.Code)`:
  1. `var maxCode = await _categoryRepository.GetMaxSequentialCodeAsync("CAT", 9, cancellationToken);`
  2. Parse số từ `maxCode`:
     - Nếu `maxCode` hợp lệ và `int.TryParse(maxCode.Substring(3), out var currentMax)`: `nextNumber = currentMax + 1`.
     - Ngược lại: `nextNumber = 1`.
  3. Format `code = $"CAT{nextNumber:D6}"`.
  4. Vòng lặp an toàn:
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
  4. Vòng lặp an toàn:
     ```csharp
     while (await _productRepository.ExistsByCodeAsync(code, null, cancellationToken))
     {
         nextNumber++;
         code = $"SP{nextNumber:D6}";
     }
     ```
- Xử lý Barcode mặc định:
  - `var barcode = string.IsNullOrWhiteSpace(request.Barcode) ? code : request.Barcode.Trim();`

## 4. Thay đổi Cơ sở dữ liệu (Database Schema)
- **Không thay đổi schema bảng**: Các bảng `Categories` và `Products` đã có các trường `CategoryCode` và `ProductCode` với kiểu `string` (varchar/text) và index unique/tenant.
- Không cần sinh thêm EF Core migration.

## 5. Quy tắc Nghiệp vụ & Phân quyền
- **Phân quyền**: Chỉ người dùng có role quản lý (`SUPER_ADMIN`, `STORE_OWNER`, `BRANCH_MANAGER`, `WAREHOUSE_STAFF`) mới được quyền thêm mới nhóm hàng và sản phẩm.
- **Tenant Isolation**: Các câu truy vấn trong Repository kế thừa từ `GenericRepository` tự động gán bộ lọc `TenantId == _tenantContext.CurrentTenantId`, đảm bảo:
  - Cửa hàng Tenant A bắt đầu từ `CAT000001`, `SP000001`.
  - Cửa hàng Tenant B cũng bắt đầu độc lập từ `CAT000001`, `SP000001`.
  - Không có tình trạng nhảy cóc số do cửa hàng khác tạo mã.
