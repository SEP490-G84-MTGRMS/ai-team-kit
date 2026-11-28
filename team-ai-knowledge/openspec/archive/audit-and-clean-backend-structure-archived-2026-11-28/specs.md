# Specs: audit-and-clean-backend-structure

## Bất Biến Giữ Nguyên (Invariants)
- Mọi bảng biểu CSDL và schema trong PostgreSQL giữ nguyên 100%, không phát sinh migration làm thay đổi cột hay kiểu dữ liệu.
- Tất cả API Endpoints của đơn hàng POS (`/api/v1/orders`), Catalog (`/api/v1/products`, `/api/v1/categories`), Auth (`/api/v1/auth`) giữ nguyên 100% request/response contracts.
- 451 unit & integration tests hiện có phải tiếp tục PASS mà không cần sửa logic assertion nghiệp vụ.

---

## MODIFIED Requirements

### Requirement: REQ-ARCH-01 Quản Lý Cấu Hình Entity Framework Core Theo Bounded Context
Hệ thống MUST gom nhóm tất cả các tệp cấu hình `IEntityTypeConfiguration<T>` vào đúng thư mục con tương ứng với Domain Bounded Context (`Catalog`, `Finance`, `HR`, `Identity`, `Inventory`, `SaaS`, `Sales`, `Supplier`, `System`). Hệ thống MUST loại bỏ các file cấu hình trùng lặp để bảo đảm mỗi Entity chỉ có duy nhất một lớp cấu hình được nạp vào EF Core Model.

#### Scenario: Quét cấu hình EF Core tự động không bị xung đột
- **GIVEN** `AppDbContext` thực thi phương thức `ApplyConfigurationsFromAssembly` khi khởi tạo mô hình
- **WHEN** EF Core nạp các cấu hình cho thực thể `Category`
- **THEN** chỉ duy nhất một lớp cấu hình `MT_GRMS.Infrastructure.Persistence.Configurations.Catalog.CategoryConfiguration` được áp dụng với chỉ mục duy nhất (IsUnique) trên cặp `(TenantId, CategoryCode)`.

#### Scenario: Cấu hình Product và User được nạp đúng Bounded Context
- **GIVEN** `ProductConfiguration` nằm trong `Configurations/Catalog/` và `UserConfiguration` nằm trong `Configurations/Identity/`
- **WHEN** EF Core khởi tạo mô hình CSDL
- **THEN** các quy tắc khóa ngoại, độ dài cột và chỉ mục của `Product` và `User` được bảo toàn nguyên vẹn như trước khi di chuyển.

---

## REMOVED Requirements

### Requirement: REQ-ARCH-02 Loại Bỏ Repository Code Chết (ISalesOrderRepository / SalesOrderRepository)
Hệ thống MUST loại bỏ hoàn toàn interface `ISalesOrderRepository` và lớp `SalesOrderRepository` do không có bất kỳ thành phần nào trong tầng Application sử dụng. Toàn bộ luồng nghiệp vụ đơn hàng POS tiếp tục được đảm nhận độc quyền bởi `IOrderRepository` & `OrderRepository`.

#### Scenario: Khởi động Dependency Injection sạch sẽ
- **GIVEN** ứng dụng khởi động và thực thi hàm `AddInfrastructureServices`
- **WHEN** `OrderService` được Resolve từ ServiceProvider
- **THEN** ServiceProvider cung cấp `IOrderRepository` tương thích mà không còn khai báo dư thừa `ISalesOrderRepository` trong DI container.

---

## MODIFIED Requirements

### Requirement: REQ-ARCH-03 Thống Nhất Namespace Thực Thể Bán Hàng (Single Source of Truth for Sales Entities)
Hệ thống MUST sử dụng trực tiếp thực thể `MT_GRMS.Domain.Entities.Sales.Order` và `MT_GRMS.Domain.Entities.Sales.OrderDetail`, loại bỏ hoàn toàn tệp alias trung gian `src/MT_GRMS.Domain/Entities/Order.cs`.

#### Scenario: Không xảy ra lỗi mơ hồ Namespace CS0104
- **GIVEN** một tệp mã nguồn import cả namespace `MT_GRMS.Domain.Entities` và `MT_GRMS.Domain.Entities.Sales`
- **WHEN** trình biên dịch C# phân giải kiểu dữ liệu `Order` hoặc `OrderDetail`
- **THEN** không xuất hiện lỗi mơ hồ tham chiếu `CS0104: 'Order' is an ambiguous reference`.

---

## Acceptance Checklist
- [ ] Đã xóa tệp trùng lặp `src/MT_GRMS.Infrastructure/Persistence/Configurations/CategoryConfiguration.cs`.
- [ ] Đã chuyển `ProductConfiguration.cs` vào `Configurations/Catalog/` và `UserConfiguration.cs` vào `Configurations/Identity/`.
- [ ] Đã xóa `ISalesOrderRepository.cs` và `SalesOrderRepository.cs`, đồng thời gỡ đăng ký khỏi `DependencyInjection.cs`.
- [ ] Đã xóa tệp alias `src/MT_GRMS.Domain/Entities/Order.cs`.
- [ ] `dotnet build MT_GRMS_BACKEND.sln`: 0 Lỗi.
- [ ] `dotnet test MT_GRMS_BACKEND.sln`: Đạt 451/451 tests PASS (100%).
