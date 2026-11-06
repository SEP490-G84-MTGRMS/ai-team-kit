# Khám Phá Refactor: Gộp DatabaseSeeder vào DbInitializer

## 1. Hiện trạng code & Vấn đề
- Hệ thống có 2 tệp seed dữ liệu chạy đồng thời trong `Program.cs`:
  - `DbInitializer.cs`: 1.291 dòng
  - `DatabaseSeeder.cs`: 1.589 dòng
- Caller: `Program.cs` gọi tuần tự:
  ```csharp
  await DbInitializer.InitializeAsync(dbContext);
  await DatabaseSeeder.SeedAsync(dbContext, logger);
  ```
- Caller khác: Không có bất kỳ controller hay service nào khác gọi trực tiếp 2 file này.

## 2. Giả định (Assumptions)
- CSDL relational (PostgreSQL trên Neon hoặc Local) và DbContext InMemory trong Unit Test đều tương thích với logic idempotent `AnyAsync()`.
- Việc giữ nguyên tất cả ID, Code và thuộc tính đặc thù (như `TaxCategory`, `SecurityPinHash`, `FinanceAccounts`) đảm bảo không làm gãy bất kỳ API hay màn hình Frontend nào.

## 3. Những gì không làm (Non-Goals)
- Không viết lại cấu trúc 34 bảng (Domain Schema).
- Không sửa đổi logic tính thuế hay thuật toán FIFO trong Application layer.
- Không thay đổi hành vi của các endpoint API.

## 4. Các phương án Refactor
- **Phương án A (Tập trung hóa vào DbInitializer.cs)**:
  - Tích hợp toàn bộ dữ liệu mẫu nghiệp vụ từ `DatabaseSeeder` vào các bước tương ứng trong `DbInitializer.cs`.
  - Giữ `DbInitializer.InitializeAsync` làm điểm khởi tạo duy nhất.
  - Xóa bỏ file `DatabaseSeeder.cs`.
  - *Ưu điểm*: Đơn giản, an toàn, giảm số lượng file, giải quyết ngay lập tức sự trùng lặp và không làm xáo trộn kiến trúc namespace.
  - *Nhược điểm*: `DbInitializer.cs` sẽ dài hơn nếu không phân tách theo region/phương thức con.
- **Phương án B (Tách thành nhiều file ISeeder riêng biệt)**:
  - Tách thành 6 file: `SaaSSeeder`, `IdentitySeeder`, `CatalogSeeder`, `FinanceTaxSeeder`, `SupplierSeeder`, `OrderSeeder`.
  - *Ưu điểm*: Mỗi file nhỏ, tuân thủ Single Responsibility.
  - *Nhược điểm*: Thay đổi cấu trúc file lớn, cần đăng ký thêm DI hoặc tạo registry, rủi ro lỗi vòng phụ thuộc dữ liệu FK.

- **Phương án được chọn**: **Phương án A kết hợp chia các private static method theo phân hệ bên trong `DbInitializer.cs`**:
  - `InitializeSchemaAsync()`: DDL và sinh 34 bảng.
  - `SeedSaaSAndBranchesAsync()`: Gói cước, Tenant, 3 chi nhánh.
  - `SeedIdentityUsersAsync()`: Admin, Store Owner (kèm PIN), Staffs.
  - `SeedCatalogAndTaxProductsAsync()`: Danh mục, sản phẩm thường + sản phẩm thuế NQ 204.
  - `SeedFinanceAndCashbookAsync()`: Tài khoản tài chính (Till, Safe, Bank), Phiếu chi, Sổ quỹ.
  - `SeedCustomersAndDebtAsync()`: Khách hàng, hồ sơ công nợ FIFO.
  - `SeedSuppliersAndPoMatrixAsync()`: NCC, liên kết sản phẩm, lịch giao.
  - `SeedOrdersAndSalesAsync()`: Đơn hàng POS, doanh thu Q3/2026.
  - `SeedPromotionsAsync()`: Chương trình khuyến mãi, voucher.

## 5. Rủi ro & Biện pháp giảm thiểu
- *Rủi ro*: Trùng lặp khóa chính hoặc ràng buộc khóa ngoại (FK) giữa dữ liệu 2 bên.
  *Biện pháp*: Rà soát toàn bộ GUID và string ID, đảm bảo thứ tự nạp dữ liệu chuẩn: Tenant/Branch -> Category/Supplier -> Product -> Inventory/Account -> Customer -> Order/Movement.
- *Rủi ro*: Báo cáo thuế hoặc phân hệ POS mất dữ liệu demo.
  *Biện pháp*: Giữ nguyên 100% ID và thuộc tính của các sản phẩm FMCG/ALCOHOL/TOBACCO, 385 triệu doanh thu Q3, và mã PIN 1234 của `store_owner`.
