# Specs: generate-backend-domain-models

## API / Contract
Change này tập trung vào tầng Domain Entities & Infrastructure EF Core Persistence Model. Các hợp đồng API cụ thể sẽ được xây dựng ở các change tiếp theo theo từng feature:
| Component | Responsibility | Contract / Interface |
|---|---|---|
| `MT_GRMS.Domain.Entities.*` | 34 POCO Entities chia 7 phân hệ | Kế thừa `BaseEntity` hoặc `BaseTenantEntity` |
| `MT_GRMS.Infrastructure.Persistence.AppDbContext` | Context EF Core quản lý 34 DbSets | Đăng ký 34 `DbSet<T>`, nạp Configurations |
| `MT_GRMS.Infrastructure.Persistence.Configurations.*` | Fluent API mapping chi tiết | Implement `IEntityTypeConfiguration<T>` |

---

## ADDED Requirements

### Requirement: REQ-01 Cung cấp đầy đủ 34 Domain Entities theo 7 phân hệ nghiệp vụ
Hệ thống MUST cung cấp đầy đủ 34 lớp thực thể POCO C# trong project `MT_GRMS.Domain/Entities`, phản ánh chính xác 100% cấu trúc 34 bảng trong `MT_GRMS_Full_Database.sql`, chia thành 8 thư mục phân hệ:
1. `SaaS`: `SubscriptionPlan`, `Tenant`, `Branch`
2. `Identity`: `User`, `TenantUser`
3. `System`: `TaxSnapshot`, `AuditLog`
4. `Catalog`: `Category`, `Product`, `ProductUnit`, `ProductCombo`
5. `Inventory`: `BranchStock`, `Transfer`, `TransferDetail`
6. `Supplier`: `SupplierCategory`, `Supplier`, `SupplierDeliveryConfig`, `SupplierBlackoutDate`, `SupplierAPLedger`, `SupplierProduct`, `PurchaseOrder`, `PurchaseOrderDetail`, `GoodsReceipt`, `GoodsReceiptLine`
7. `Sales`: `Customer`, `Promotion`, `Order`, `OrderDetail`
8. `Finance`: `CashBook`, `ServiceExpense`
9. `HR`: `Employee`, `Payslip`, `EmployeeSchedule`, `EmployeeBonusViolation`

#### Scenario: Khởi tạo thực thể Tenant-scoped
- **GIVEN** Một thực thể thuộc phạm vi của cửa hàng/chuỗi (ví dụ `Product`, `Branch`, `Supplier`, `Order`, `Employee`)
- **WHEN** Lớp thực thể được định nghĩa trong C#
- **THEN** Thực thể MUST kế thừa từ `BaseTenantEntity` và có sẵn các thuộc tính `TenantId`, `CreatedAt`, `UpdatedAt`, `CreatedBy`, `IsDeleted`.

#### Scenario: Khởi tạo thực thể Root/Global
- **GIVEN** Một thực thể cấp nền tảng toàn cục không thuộc riêng một Tenant nào (ví dụ `SubscriptionPlan`, `Tenant`, `User`)
- **WHEN** Lớp thực thể được định nghĩa trong C#
- **THEN** Thực thể MUST kế thừa trực tiếp từ `BaseEntity` (không chứa thuộc tính `TenantId`) để không bị Global Query Filter lọc nhầm.

---

### Requirement: REQ-02 Cấu hình Fluent API tường minh cho khóa chính, composite key và quan hệ
Hệ thống MUST tạo các lớp `IEntityTypeConfiguration<T>` trong `MT_GRMS.Infrastructure/Persistence/Configurations/` tương ứng cho từng thực thể để cấu hình tên bảng, khóa chính, ràng buộc cột, precision tiền tệ và quan hệ Foreign Key.

#### Scenario: Cấu hình khóa chính phức hợp (Composite Key)
- **GIVEN** Các bảng trung gian có khóa chính đa cột như `TenantUsers` (`TenantID`, `UserID`) hoặc `ProductCombos` (`TenantID`, `ComboProductID`, `ComponentProductID`)
- **WHEN** EF Core khởi tạo mô hình qua Fluent API
- **THEN** Configuration MUST định nghĩa tường minh `builder.HasKey(x => new { ... })` và các ràng buộc foreign key tương ứng.

#### Scenario: Cấu hình độ chính xác tiền tệ và số lượng
- **GIVEN** Các trường tiền tệ (`Price`, `Amount`, `SellingPrice`, `CostPrice`, `NetSalary`) và số lượng (`QuantityOnHand`, `OrderedQty`, `DeliveredQty`)
- **WHEN** Entity được cấu hình trong Fluent API
- **THEN** Trường tiền tệ MUST có kiểu cột `decimal(18,2)` và trường số lượng có kiểu cột `decimal(18,3)` hoặc `decimal(12,2)` tương ứng với schema SQL.

#### Scenario: Cấu hình Concurrency Token cho RowVersion
- **GIVEN** Các bảng giao dịch nhạy cảm có cột `RowVersion` (`BranchStocks`, `Suppliers`, `SupplierProducts`, `PurchaseOrders`, `GoodsReceipts`)
- **WHEN** EF Core thực hiện cập nhật bản ghi
- **THEN** Configuration MUST đánh dấu `builder.Property(x => x.RowVersion).IsConcurrencyToken()` để hỗ trợ phát hiện xung đột dữ liệu đồng thời (Optimistic Concurrency).

---

### Requirement: REQ-03 Đăng ký 34 DbSet và cơ chế tự động Audit trong AppDbContext
Hệ thống MUST khai báo đủ 34 `DbSet<T>` tương ứng trong `AppDbContext` và đảm bảo:
1. Áp dụng tự động toàn bộ cấu hình Fluent API qua `ApplyConfigurationsFromAssembly`.
2. Áp dụng Global Query Filter cho tất cả các thực thể kế thừa `BaseTenantEntity` (`e.TenantId == _tenantContext.CurrentTenantId && !e.IsDeleted`).
3. Ghi đè `SaveChangesAsync()` để tự động điền `TenantId`, `CreatedAt` khi thêm mới và `UpdatedAt` khi chỉnh sửa.

#### Scenario: Truy vấn dữ liệu cô lập theo Tenant
- **GIVEN** Người dùng đăng nhập thuộc tenant `tenant-01`
- **WHEN** Thực hiện truy vấn LINQ trên bất kỳ DbSet nào thuộc `BaseTenantEntity`
- **THEN** EF Core MUST tự động gắn thêm điều kiện `WHERE TenantId = 'tenant-01' AND IsDeleted = false` vào câu lệnh SQL sinh ra.

#### Scenario: Tự động cập nhật thời gian Audit khi lưu
- **GIVEN** Một bản ghi `BaseTenantEntity` được thêm mới hoặc chỉnh sửa qua `AppDbContext`
- **WHEN** Gọi `SaveChangesAsync()`
- **THEN** Trường `CreatedAt` và `TenantId` MUST được tự động gán nếu chưa có, và `UpdatedAt` MUST được cập nhật thời gian hiện tại theo UTC.

---

### Requirement: REQ-04 Kiểm chứng biên dịch thành công (Build Pass)
Toàn bộ mã nguồn mới bổ sung trong `MT_GRMS.Domain` và `MT_GRMS.Infrastructure` MUST biên dịch thành công 100% (`dotnet build` PASS) mà không có lỗi (0 Error).

#### Scenario: Biên dịch Solution backend
- **GIVEN** Toàn bộ 34 Entities, Enums và Configurations đã được tạo và đăng ký vào `AppDbContext`
- **WHEN** Thực thi lệnh `dotnet build` trên `MT_GRMS_BACKEND.sln`
- **THEN** Kết quả biên dịch trả về trạng thái Build Succeeded (0 Errors).

---

## MODIFIED Requirements
Không có.

## REMOVED Requirements
Không có.

---

## Acceptance checklist
- [ ] REQ-01: Tạo đủ 34 POCO Entities trong `MT_GRMS.Domain/Entities` chia theo 8 thư mục phân hệ.
- [ ] REQ-01: Tách `BaseEntity` và `BaseTenantEntity` chuẩn xác, áp dụng đúng cho từng loại thực thể.
- [ ] REQ-02: Cấu hình Fluent API trong `MT_GRMS.Infrastructure/Persistence/Configurations/` cho 34 thực thể.
- [ ] REQ-02: Cấu hình đầy đủ Composite Keys, Foreign Keys, Indexes và Decimal Precision.
- [ ] REQ-03: Khai báo 34 `DbSet<T>` trong `AppDbContext`.
- [ ] REQ-03: Global Query Filter và SaveChanges Audit hoạt động chính xác trên `BaseTenantEntity`.
- [ ] REQ-04: `dotnet build` solution `MT_GRMS_BACKEND.sln` thành công 100% với 0 Error.
