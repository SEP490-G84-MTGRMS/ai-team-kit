# Proposal: audit-and-clean-backend-structure

## Vấn đề
Qua rà soát và kiểm tra toàn diện cấu trúc thư mục của dự án `MT_GRMS_BACKEND`, hiện tại đang tồn tại các vấn đề nợ kỹ thuật (Tech Debt), trùng lặp thành phần và phân tán thư mục tương tự như bài toán Seeder vừa qua:
1. **Trùng lặp cấu hình EF Core (Duplicate Entity Configuration)**: Tệp `CategoryConfiguration.cs` xuất hiện 2 lần song song ở cả `Configurations/CategoryConfiguration.cs` và `Configurations/Catalog/CategoryConfiguration.cs`. Khi EF Core quét assembly qua `ApplyConfigurationsFromAssembly`, cả 2 lớp này đều được áp dụng lên thực thể `Category`, trong đó một file cấu hình Unique index cho `CategoryCode`, còn một file không, tiềm ẩn xung đột chỉ mục và hành vi CSDL.
2. **Cấu hình EF Core nằm sai thư mục**: `ProductConfiguration.cs` và `UserConfiguration.cs` đang nằm trực tiếp ở thư mục gốc `Configurations/` thay vì được gom nhóm vào thư mục Bounded Context tương ứng (`Configurations/Catalog/` và `Configurations/Identity/`) như tất cả các entity khác.
3. **Mã nguồn Repository dư thừa / Không sử dụng (Dead Code)**: Cặp tệp `ISalesOrderRepository.cs` (`Application/PosOrders/`) và `SalesOrderRepository.cs` (`Infrastructure/Repositories/`) được khai báo và đăng ký trong DI Container, nhưng thực tế **không có bất kỳ service nào sử dụng** (toàn bộ nghiệp vụ đơn hàng POS đang chạy qua `IOrderRepository` & `OrderRepository`). Tệp `SalesOrderRepository` còn chứa hardcoded Fallback GUID không an toàn.
4. **Tệp Alias thực thể gây xung đột Namespace**: Tệp `src/MT_GRMS.Domain/Entities/Order.cs` được tạo làm alias trung gian (`public class Order : Sales.Order`), dẫn đến lỗi biên dịch mơ hồ `CS0104: 'Order' is an ambiguous reference` mỗi khi một tệp mã nguồn import cả `MT_GRMS.Domain.Entities` lẫn `MT_GRMS.Domain.Entities.Sales`, buộc lập trình viên phải khai báo alias thủ công trong using.
5. **Thông báo log kết nối CSDL bị hardcoded**: Trong `Infrastructure/DependencyInjection.cs`, console log luôn in ra `PostgreSQL local Host=localhost;Port=5432` ngay cả khi ứng dụng đang kết nối tới Neon Cloud PostgreSQL.

## Mục tiêu
- Chuẩn hóa và làm sạch toàn bộ cấu trúc thư mục của `MT_GRMS_BACKEND` theo đúng nguyên tắc Clean Architecture và Domain-Driven Design (Bounded Contexts).
- Loại bỏ hoàn toàn các cấu hình trùng lặp, code chết (Dead Code) không sử dụng và các tệp alias gây xung đột namespace.
- Đảm bảo cấu trúc dự án nhất quán, dễ bảo trì, loại bỏ hoàn toàn các rủi ro cấu hình CSDL bị ghi đè ngầm.
- Giữ vững 100% tính toàn vẹn nghiệp vụ: 451/451 unit & integration tests tiếp tục pass.

## Phạm vi
- **In scope**:
  - Xóa bỏ tệp cấu hình trùng lặp `Configurations/CategoryConfiguration.cs` (giữ lại bản chuẩn tại `Configurations/Catalog/CategoryConfiguration.cs`).
  - Di chuyển `ProductConfiguration.cs` vào `Configurations/Catalog/` và cập nhật namespace.
  - Di chuyển `UserConfiguration.cs` vào `Configurations/Identity/` và cập nhật namespace.
  - Xóa bỏ `ISalesOrderRepository.cs` và `SalesOrderRepository.cs`, dọn sạch đăng ký dư thừa trong `Infrastructure/DependencyInjection.cs`.
  - Loại bỏ tệp alias `src/MT_GRMS.Domain/Entities/Order.cs`, chuyển các tham chiếu còn sót lại trực tiếp về `MT_GRMS.Domain.Entities.Sales.Order` và `OrderDetail` để dứt điểm lỗi mơ hồ namespace.
  - Cập nhật thông báo log trạng thái kết nối CSDL trong `DependencyInjection.cs` hiển thị chính xác nguồn kết nối.
- **Out of scope**:
  - Không sửa đổi Schema CSDL (Database Schema) hay bảng biểu.
  - Không thay đổi hành vi nghiệp vụ của các Controller, DTO contracts, hoặc API responses.
  - Không can thiệp sang Frontend.

## Người dùng liên quan
- **Backend Developers & AI Agents**: Codebase sạch sẽ, không bị xung đột namespace hay phân vân giữa các repository trùng tên.
- **Tech Lead / PM**: Cấu trúc thư mục ngăn nắp, dễ audit theo tiêu chuẩn Clean Architecture, sẵn sàng cho các đợt đánh giá đồ án tốt nghiệp.

## Tiêu chí thành công
- [ ] Không còn tệp `.cs` nào bị trùng tên hoặc trùng vai trò trong cùng một tầng kiến trúc.
- [ ] 100% các file `IEntityTypeConfiguration` được gom nhóm đúng thư mục Bounded Context (`Catalog`, `Finance`, `Identity`, `Inventory`, `SaaS`, `Sales`, `Supplier`, `System`).
- [ ] Không còn dead code `ISalesOrderRepository` / `SalesOrderRepository` trong codebase và DI container.
- [ ] Xóa bỏ triệt để alias gây xung đột namespace `CS0104` cho `Order` và `OrderItem`.
- [ ] Biên dịch `dotnet build MT_GRMS_BACKEND.sln` thành công 100% (0 Lỗi).
- [ ] Chạy `dotnet test MT_GRMS_BACKEND.sln` đạt **451/451 tests PASS (100%)**.
