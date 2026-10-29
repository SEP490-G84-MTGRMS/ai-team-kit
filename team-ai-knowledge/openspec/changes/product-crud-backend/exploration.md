# EXP-2026-10-29-002: Khảo sát & Đánh giá giải pháp Product CRUD Backend

## 1. Problem Statement
Backend `MT_GRMS_BACKEND` hiện đã có Entity `Product`, `ProductUnit`, `ProductCombo` và cấu hình bảng `Products`, nhưng các hàm xử lý trong `CatalogService` và `ProductsController` chỉ mới là khung rỗng (`NotImplementedException`). Frontend `MT_GRMS_FRONTEND` đã hoàn thiện giao diện danh sách `ProductListPage` (tìm kiếm từ khóa, lọc theo nhóm hàng, phân trang), modal tạo/sửa `ProductFormModal`, và modal chi tiết `ProductDetailModal`. Cần hoàn thiện trọn vẹn nghiệp vụ CRUD cho Product ở backend, hỗ trợ lọc, phân trang, kiểm tra tính duy nhất của mã vạch/mã SKU, bảo mật che giấu giá vốn (BR-SEC-01) và xóa mềm an toàn.

## 2. Context & Background
- **Entity Domain**: `Product` kế thừa `BaseTenantEntity`, có các trường: `CategoryId`, `ProductCode`, `Barcode`, `Name`, `BaseUnit`, `CostPrice`, `SellingPrice`, `MinStock`, `MaxStock`, `VatRate`, `ProductType`, `Status`, `ImageUrl`, `Description`, `InternalNote`, `HasBatches`, `IsFavorite`.
- **Database Schema**: Bảng `Products` đã có trong PostgreSQL, khóa chính `ProductID`, khóa ngoại tới `Categories`, chỉ mục Unique trên `Barcode` và `(TenantId, ProductCode)`.
- **RBAC Rule (BR-SEC-01)**: Trường `CostPrice` (Giá vốn) là thông tin nhạy cảm. Chỉ tài khoản có vai trò Quản lý (`StoreOwner`, `BranchManager`, `SuperAdmin`) mới được xem giá vốn. Nhân viên bán hàng / Thu ngân (`Cashier`, `Staff`) chỉ được thấy `SellingPrice`, `CostPrice` phải trả về `null`.
- **Frontend Contract (`src/features/product/types/index.ts`)**: Giao diện yêu cầu đầy đủ các thông tin: `id`, `productCode`, `barcode`, `productName`, `categoryId`, `categoryName`, `baseUnit`, `sellingPrice`, `costPrice`, `status`, `minStock`, `maxStock`, `imageUrl`, `description`, `internalNote`.

## 3. Constraints
- **Kiến trúc**: Tuân thủ Clean Architecture 4 tầng. Controller chỉ làm việc với Request/Response DTO; không để rò rỉ Domain Entity.
- **Multi-Tenancy**: Toàn bộ thao tác đọc/ghi phải tự động áp dụng Global Query Filter theo `TenantId` của người dùng.
- **Ràng buộc duy nhất**: `ProductCode` (SKU) và `Barcode` (Mã vạch) phải là duy nhất trong cùng một Tenant đối với các sản phẩm chưa bị xóa (`IsDeleted == false`).
- **Phân trang chuẩn**: Trả về cấu trúc `PagedResult<ProductResponse>` (chứa `Items`, `Page`, `PageSize`, `TotalItems`).

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi sản phẩm bắt buộc phải thuộc về một nhóm hàng (`CategoryId`) hợp lệ trong cùng Tenant.
- **[ASSUMPTION-02]**: Nếu người dùng không nhập `ProductCode`, hệ thống tự sinh mã theo quy tắc `SP-{DateTime.UtcNow:yyMMddHHmmss}` hoặc `SP-{RandomHex}`.
- **[ASSUMPTION-03]**: Nếu người dùng không nhập `Barcode`, hệ thống có thể dùng chính `ProductCode` làm mã vạch mặc định.
- **[ASSUMPTION-04]**: Trạng thái mặc định của sản phẩm mới là `Active`.

## 5. Scope & Non-Goals
### In Scope
- Cập nhật DTOs trong `MT_GRMS.Application/Catalog/Dtos/ProductDtos.cs` (`ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`, `ProductQueryFilter`).
- Cập nhật Interface `IProductRepository` và triển khai `ProductRepository`:
  - `GetPagedListAsync(ProductQueryFilter filter, CancellationToken cancellationToken)`
  - `ExistsByCodeAsync(string code, Guid? excludeId, CancellationToken cancellationToken)`
  - `ExistsByBarcodeAsync(string barcode, Guid? excludeId, CancellationToken cancellationToken)`
  - `GetByIdWithCategoryAsync(Guid id, CancellationToken cancellationToken)`
- Cập nhật `ICatalogService` và triển khai đầy đủ logic trong `CatalogService`:
  - Lấy danh sách sản phẩm phân trang + tìm kiếm đa tiêu chí (tên, mã SKU, barcode) + lọc theo danh mục.
  - Lấy chi tiết sản phẩm kèm tên danh mục `CategoryName`.
  - Tạo mới sản phẩm có tự sinh mã SKU và kiểm tra trùng Barcode/SKU.
  - Cập nhật thông tin sản phẩm.
  - Xóa mềm sản phẩm (`IsDeleted = true`).
  - Che giấu `CostPrice` dựa trên vai trò người dùng trong `ITenantContext`.
- Cập nhật `ProductsController` tại `src/MT_GRMS.Api/Controllers/ProductsController.cs` với 5 endpoints chuẩn RESTful.
- Viết Unit Tests cho `CatalogService`.

### Out of Scope (Non-Goals)
- Không làm tính năng nhập/xuất file Excel hàng loạt cho sản phẩm trong scope này.
- Không cấu hình các bảng phức tạp như đơn vị quy đổi nhiều cấp (`ProductUnit`) hay combo (`ProductCombo`) trong đợt này (giữ nguyên cấu trúc hỗ trợ sẵn của Domain).

## 6. Đánh giá các phương án kỹ thuật

| Phương án | Mô tả | Ưu điểm | Nhược điểm |
| :--- | :--- | :--- | :--- |
| **Phương án 1 (Khuyến nghị): Mở rộng IProductRepository với EF Core Projection & Dynamic Query** | Bổ sung phương thức `GetPagedListAsync` trong `ProductRepository`, sử dụng `IQueryable` để build dynamic query theo filter, join `Categories` lấy `CategoryName`, xử lý che giấu `CostPrice` ở tầng Service. | - Tối ưu truy vấn SQL (chỉ lấy đúng trang dữ liệu `Skip/Take`).<br>- Giữ vững Clean Architecture.<br>- Dễ dàng viết Unit Test bằng mock/fake repository. | Cần cài đặt thêm các hàm phụ trợ trong Repository. |
| **Phương án 2: Chỉ dùng GenericRepository GetAllAsync rồi lọc in-memory** | Đọc toàn bộ danh sách sản phẩm của Tenant lên bộ nhớ RAM rồi dùng LINQ để `Where` và `Skip/Take`. | Dễ viết, không cần sửa `ProductRepository`. | - Rất tốn RAM và làm chậm hệ thống khi số lượng sản phẩm lên tới hàng nghìn.<br>- Hiệu năng kém (Bad practice). |
| **Phương án 3: Viết Stored Procedure / Raw SQL** | Viết câu lệnh SQL trực tiếp trong Repository. | Tốc độ tối đa. | Khó bảo trì, phụ thuộc vào dialect SQL, không tận dụng được Global Query Filter tự động của EF Core. |

## 7. Phương án lựa chọn & Lý do
**Lựa chọn: Phương án 1**.
- Phương án này đảm bảo hiệu năng tối ưu nhất khi truy vấn cơ sở dữ liệu PostgreSQL (chỉ tải đúng số lượng bản ghi theo `PageSize`).
- Đảm bảo logic nghiệp vụ và quy tắc bảo mật (BR-SEC-01) được thực thi tập trung tại `CatalogService`, tuân thủ đúng nguyên tắc Single Responsibility.

## 8. Rủi ro & Biện pháp giảm thiểu
1. **Rủi ro rò rỉ giá vốn (Security Leakage)**: Nhân viên thu ngân vô tình đọc được giá vốn qua API.
   - *Biện pháp*: Kiểm tra quyền `_tenantContext.CurrentRole` ngay tại Service trước khi map ra `ProductResponse`. Nếu không phải `StoreOwner`, `BranchManager`, `SuperAdmin` thì bắt buộc gán `CostPrice = null`.
2. **Rủi ro trùng lặp mã vạch (Duplicate Barcode)**: Hai sản phẩm có cùng barcode gây sai sót khi quét mã tại POS.
   - *Biện pháp*: Kiểm tra tính duy nhất bằng `ExistsByBarcodeAsync` trước khi insert/update; Database có sẵn chỉ mục Unique `Barcode`.
