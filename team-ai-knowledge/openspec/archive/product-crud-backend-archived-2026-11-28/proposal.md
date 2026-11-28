# Proposal: product-crud-backend

## Vấn đề
Hiện tại ở backend `MT_GRMS_BACKEND`, tầng Domain đã có Entity `Product` (thuộc Bounded Context Catalog) và DbContext đã đăng ký bảng `Products`. Tuy nhiên:
- `ProductsController` và `CatalogService` mới chỉ dừng lại ở các hàm khung rỗng (throw `NotImplementedException`), chưa có triển khai thực tế.
- Chưa hỗ trợ API danh sách phân trang (`PagedResult`), tìm kiếm theo từ khóa (tên, mã SKU, mã vạch Barcode), và bộ lọc theo nhóm hàng (`CategoryId`).
- Chưa có API cập nhật (`PUT /api/products/{id}`) và xóa mềm (`DELETE /api/products/{id}`).
- Chưa có cơ chế bảo mật che giấu giá vốn `CostPrice` đối với vai trò Thu ngân / Nhân viên bán hàng (theo quy tắc nghiệp vụ BR-SEC-01).
- Frontend `MT_GRMS_FRONTEND` (tại `ProductListPage.tsx`, `ProductFormModal.tsx`, `ProductDetailModal.tsx`) đang phải dùng mock data, chưa kết nối được dữ liệu thật từ backend.

## Mục tiêu
Xây dựng và hoàn thiện trọn vẹn bộ RESTful API và Business Logic CRUD cho Product (Sản phẩm) theo chuẩn Clean Architecture (.NET 8, EF Core Code-First):
1. Cung cấp API lấy danh sách sản phẩm có phân trang, tìm kiếm đa tiêu chí (tên sản phẩm, mã SKU, mã vạch barcode) và lọc theo nhóm hàng (`CategoryId`).
2. Cung cấp API lấy thông tin chi tiết một sản phẩm theo ID (kèm thông tin nhóm hàng Category).
3. Hỗ trợ tạo mới sản phẩm qua `ProductFormModal` với kiểm tra tính duy nhất của Barcode và ProductCode trong cùng Tenant; tự động sinh mã SKU nếu để trống.
4. Hỗ trợ cập nhật thông tin sản phẩm (tên, giá bán, giá vốn, định mức tồn kho min/max, đơn vị tính, mô tả, ghi chú).
5. Hỗ trợ xóa mềm sản phẩm (`IsDeleted = true`) đảm bảo an toàn dữ liệu.
6. Áp dụng quy tắc bảo mật che giấu giá vốn (`CostPrice = null`) khi người dùng không có quyền quản lý (`Role` khác `StoreOwner` / `BranchManager`).

## Phạm vi

### In scope
- **DTOs (`MT_GRMS.Application/Catalog/Dtos/ProductDtos.cs`)**:
  - `ProductResponse`: `Id`, `ProductCode`, `Barcode`, `Name`, `CategoryId`, `CategoryName`, `BaseUnit`, `SellingPrice`, `CostPrice`, `MinStock`, `MaxStock`, `Status`, `ImageUrl`, `Description`, `InternalNote`, `HasBatches`, `IsFavorite`.
  - `ProductSummaryResponse`: DTO gọn cho bảng danh sách sản phẩm.
  - `ProductCreateRequest`: Các thông tin bắt buộc và tùy chọn khi tạo mới sản phẩm.
  - `ProductUpdateRequest`: Các thông tin cho phép cập nhật.
  - `ProductQueryFilter`: `SearchTerm`, `CategoryId`, `Status`, `PageIndex`, `PageSize`.
- **Validation**: Kiểm tra tính hợp lệ của dữ liệu đầu vào (tên sản phẩm không để trống, giá bán $\ge 0$, định mức tồn kho hợp lệ, Barcode và SKU duy nhất trong Tenant).
- **Service & Repository Layer (`ICatalogService`, `CatalogService`, `IProductRepository`, `ProductRepository`)**:
  - Triển khai logic phân trang, tìm kiếm và lọc.
  - Xử lý che giấu `CostPrice` dựa trên `ITenantContext` và Role người dùng.
  - Tự động sinh `ProductCode` nếu không truyền vào.
  - Xóa mềm sản phẩm (`IsDeleted = true`).
- **Presentation Layer (`ProductsController`)**:
  - `GET /api/products`: Lấy danh sách sản phẩm phân trang theo filter.
  - `GET /api/products/{id}`: Lấy chi tiết một sản phẩm.
  - `POST /api/products`: Tạo mới sản phẩm.
  - `PUT /api/products/{id}`: Cập nhật thông tin sản phẩm.
  - `DELETE /api/products/{id}`: Xóa mềm sản phẩm.
- **Tuân thủ kiến trúc**: Toàn bộ Controller chỉ làm việc với Request/Response DTO, trả về bọc trong `ApiResponse<T>`, tự động áp dụng Global Query Filter theo `TenantId`.

### Out of scope
- Quản lý quy đổi đơn vị tính nâng cao (UoM conversions phức tạp) và combo sản phẩm nhiều thành phần — sẽ triển khai ở sub-feature riêng.
- Nhập/xuất danh sách sản phẩm hàng loạt qua Excel (Import / Export).
- Các thao tác biến động tồn kho chi tiết (nhập hàng PO, bán hàng POS, kiểm kê kho) — thuộc các phân hệ chuyên biệt.

## Người dùng liên quan
- **Chủ cửa hàng (Store Owner / Admin)**: Toàn quyền tạo, sửa, xóa sản phẩm, cấu hình giá bán, xem giá vốn thực tế.
- **Quản lý cửa hàng (Branch Manager)**: Quản lý danh mục sản phẩm của chi nhánh, theo dõi định mức tồn kho min/max.
- **Thu ngân / Nhân viên bán hàng (Cashier / Staff)**: Tìm kiếm sản phẩm theo barcode/mã/tên để bán hàng tại quầy POS; bị ẩn giá vốn `CostPrice` để bảo mật lợi nhuận kinh doanh.

## Tiêu chí thành công
- [ ] Cung cấp đầy đủ 5 endpoints RESTful cho Product tại `/api/products` theo chuẩn `ApiResponse<T>`.
- [ ] API `GET /api/products` trả về kết quả phân trang `PagedResult<ProductResponse>` chính xác theo từ khóa tìm kiếm (tên, barcode, SKU) và lọc theo `CategoryId`.
- [ ] Chặn trùng lặp Barcode và ProductCode trong cùng một Tenant (`TenantId`).
- [ ] Tự sinh `ProductCode` chuẩn (dạng `SP-XXXXXX`) khi người dùng bỏ trống mã.
- [ ] Ẩn giá vốn `CostPrice` (`CostPrice = null`) khi người dùng đăng nhập là Cashier/Staff (tuân thủ BR-SEC-01).
- [ ] API `DELETE /api/products/{id}` thực hiện xóa mềm (`IsDeleted = true`) an toàn.
- [ ] Khớp hoàn toàn với giao diện `ProductListPage`, `ProductFormModal`, `ProductDetailModal` bên Frontend.
- [ ] Biên dịch thành công 0 Error và vượt qua toàn bộ Unit Tests.
