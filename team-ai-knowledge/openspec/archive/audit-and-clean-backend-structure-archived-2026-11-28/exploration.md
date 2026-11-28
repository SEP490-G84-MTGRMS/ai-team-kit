# EXP-2026-11-06-001: Khảo sát & Chuẩn hóa Cấu trúc Thư mục Backend MT_GRMS_BACKEND

## 1. Problem Statement
Dự án `MT_GRMS_BACKEND` hiện tại đang tồn tại 5 điểm nợ kỹ thuật (Technical Debt) và trùng lặp cấu trúc tương tự bài toán Seeder:
1. **Duplicate EF Core Configuration**: `CategoryConfiguration.cs` tồn tại 2 file độc lập ở `Configurations/CategoryConfiguration.cs` và `Configurations/Catalog/CategoryConfiguration.cs`. Do `ApplyConfigurationsFromAssembly` quét toàn bộ assembly, cả 2 cấu hình này đều được áp dụng đè lên entity `Category` (một file có `IsUnique` cho `CategoryCode`, một file không).
2. **Loose Entity Configurations**: `ProductConfiguration.cs` và `UserConfiguration.cs` bị bỏ quên ở thư mục gốc `Configurations/` thay vì gom theo Bounded Context (`Configurations/Catalog/` và `Configurations/Identity/`).
3. **Dead / Unused Repository Code**: Cặp interface và implementation `ISalesOrderRepository.cs` & `SalesOrderRepository.cs` được đăng ký trong `DependencyInjection.cs` nhưng không có bất kỳ service nào tiêu thụ (Service bán hàng POS dùng `IOrderRepository`). Tệp này còn chứa fallback GUID hardcoded không an toàn.
4. **Ambiguous Entity Alias**: Tệp `src/MT_GRMS.Domain/Entities/Order.cs` khai báo `public class Order : Sales.Order` làm alias thừa, gây xung đột namespace `CS0104: 'Order' is an ambiguous reference` buộc các lớp khác phải viết namespace đầy đủ hoặc alias.
5. **Hardcoded Connection Log**: Trong `DependencyInjection.cs`, console log luôn in ra `PostgreSQL local Host=localhost;Port=5432` ngay cả khi kết nối Neon Cloud.

## 2. Context & Background
- Hệ thống áp dụng Clean Architecture 4 tầng (.NET 8): `Domain` -> `Application` -> `Infrastructure` -> `Api`.
- Đợt review trước đó đã gộp thành công `DatabaseSeeder` vào `DbInitializer` giúp loại bỏ gần 1.600 dòng code thừa.
- Việc dọn dẹp các tệp dư thừa còn lại là cần thiết để chuẩn bị cho đợt review mã nguồn chính thức (Final Capstone Evaluation).

## 3. Constraints
- **Zero Regression**: Tuyệt đối không làm thay đổi hành vi nghiệp vụ, 451/451 unit & integration tests phải tiếp tục PASS 100%.
- **Zero Database Migration**: Không thay đổi bảng biểu, cột dữ liệu hoặc khóa ngoại trong PostgreSQL.
- **Surgical Refactoring**: Chỉ chạm đúng các tệp dư thừa/sai vị trí, không refactor lan sang các service hoặc controller đang chạy ổn định.

## 4. Assumptions
- **[ASSUMPTION-01]**: `OrderService` là dịch vụ xử lý đơn hàng POS duy nhất và đang dùng `IOrderRepository`. `ISalesOrderRepository` là tệp cũ bị bỏ quên.
- **[ASSUMPTION-02]**: Giữ lại file `Configurations/Catalog/CategoryConfiguration.cs` với index `.IsUnique()` trên `(TenantId, CategoryCode)` là chuẩn nhất theo mô hình đa tenant.
- **[ASSUMPTION-03]**: Khi di chuyển `ProductConfiguration.cs` vào `Catalog/` và `UserConfiguration.cs` vào `Identity/`, `ApplyConfigurationsFromAssembly` vẫn tự động nhận diện bình thường qua reflection.
- **[ASSUMPTION-04]**: Xóa bỏ tệp `Domain/Entities/Order.cs` và cập nhật các tham chiếu trực tiếp về `MT_GRMS.Domain.Entities.Sales.Order` sẽ dứt điểm hoàn toàn lỗi biên dịch `CS0104`.

## 5. Scope & Non-Goals
### In Scope
- Xóa bỏ `src/MT_GRMS.Infrastructure/Persistence/Configurations/CategoryConfiguration.cs` trùng lặp.
- Di chuyển `src/MT_GRMS.Infrastructure/Persistence/Configurations/ProductConfiguration.cs` vào `Configurations/Catalog/` và cập nhật namespace.
- Di chuyển `src/MT_GRMS.Infrastructure/Persistence/Configurations/UserConfiguration.cs` vào `Configurations/Identity/` và cập nhật namespace.
- Xóa bỏ dead code `ISalesOrderRepository.cs` và `SalesOrderRepository.cs`, gỡ bỏ `AddScoped` trong `DependencyInjection.cs`.
- Xóa bỏ tệp alias `src/MT_GRMS.Domain/Entities/Order.cs`.
- Tinh chỉnh log kết nối CSDL trong `DependencyInjection.cs` hiển thị đúng trạng thái.

### Out of Scope (Non-Goals)
- Không can thiệp vào logic xử lý đơn hàng POS trong `OrderService`.
- Không thay đổi bảng CSDL hoặc tạo thêm EF Core Migration.
- Không sửa đổi API response contract hay DTOs.

## 6. Các Phương Án Cân Nhắc
- **Phương án 1 (Giữ nguyên tệp, đánh dấu [Obsolete])**: Chỉ thêm chú thích `[Obsolete]` vào `ISalesOrderRepository`, giữ nguyên các file cấu hình.
  - *Ưu điểm*: Ít thao tác file.
  - *Nhược điểm*: Vẫn để lại code rác, không giải quyết được việc EF Core load 2 file `CategoryConfiguration` gây xung đột index ngầm, không dứt điểm lỗi `CS0104`.
- **Phương án 2 (Dọn dẹp phẫu thuật - Surgical Cleanup - KHUYÊN DÙNG)**:
  - Xóa bỏ triệt để file trùng lặp và code rác.
  - Gom toàn bộ cấu hình EF Core vào đúng thư mục Bounded Context.
  - Xóa alias thừa để mã nguồn sạch và tường minh.
  - *Ưu điểm*: Codebase đạt chuẩn Clean Architecture cao cấp, loại bỏ 100% cảnh báo xung đột, build sạch sẽ.

## 7. Success Criteria
- [ ] 0 file bị trùng tên trong `src/MT_GRMS.Infrastructure/Persistence/Configurations`.
- [ ] Thư mục gốc `Configurations/` chỉ chứa các thư mục con theo Bounded Context (`Catalog`, `Finance`, `HR`, `Identity`, `Inventory`, `SaaS`, `Sales`, `Supplier`, `System`).
- [ ] Không còn `ISalesOrderRepository` trong codebase và DI container.
- [ ] Xóa bỏ hoàn toàn lỗi mơ hồ namespace `Order` / `OrderItem`.
- [ ] `dotnet build` thành công (0 Lỗi).
- [ ] `dotnet test` đạt **451/451 tests PASS (100%)**.
