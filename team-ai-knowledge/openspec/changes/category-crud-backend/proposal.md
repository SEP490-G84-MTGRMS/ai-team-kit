# Proposal: category-crud-backend

## Vấn đề
Hiện tại ở backend `MT_GRMS_BACKEND`, tầng Domain đã có Entity `Category` (thuộc Bounded Context Catalog) và DbContext đã cấu hình bảng `Categories`. Tuy nhiên, hệ thống chưa có API Controller (`CategoriesController`) và Service xử lý nghiệp vụ (`ICategoryService` / `CategoryService`) để phục vụ các thao tác CRUD từ Frontend `MT_GRMS_FRONTEND` (tại `src/features/product/components/CategorySidebar.tsx` và `CategoryModal.tsx`). 

Frontend đang phải dùng mock data, chưa thể lấy danh mục thực tế từ cơ sở dữ liệu, chưa hiển thị được số lượng sản phẩm tương ứng trong từng nhóm hàng (`productCount`), và chưa thực hiện được các thao tác tạo/sửa/xóa nhóm hàng an toàn theo chuẩn Đa người thuê (Multi-Tenancy).

## Mục tiêu
Xây dựng và hoàn thiện bộ RESTful API và Business Logic CRUD cho Category (Nhóm hàng) theo chuẩn Clean Architecture của dự án (.NET 8, EF Core Code-First):
1. Cung cấp API lấy danh sách nhóm hàng kèm số lượng sản phẩm (`productCount`) của từng nhóm, phục vụ hiển thị trên `CategorySidebar`.
2. Hỗ trợ tạo mới, cập nhật và xóa nhóm hàng qua `CategoryModal`.
3. Đảm bảo ràng buộc toàn vẹn dữ liệu: chặn xóa nhóm hàng khi đang có sản phẩm hoặc có nhóm hàng con, áp dụng Soft Delete và cô lập Tenant tự động.

## Phạm vi

### In scope
- **DTOs (`MT_GRMS.Application/Catalog/Dtos/CategoryDtos.cs`)**:
  - `CategoryResponse`: `Id`, `CategoryCode`, `Name`, `Description`, `ParentCategoryId`, `DisplayOrder`, `ProductCount`.
  - `CategoryCreateRequest`: `Name`, `CategoryCode` (tự động sinh nếu để trống), `Description`, `ParentCategoryId`, `DisplayOrder`.
  - `CategoryUpdateRequest`: `Name`, `Description`, `ParentCategoryId`, `DisplayOrder`.
- **Validation**: Kiểm tra tính hợp lệ của Request DTO (tên nhóm hàng không được để trống, độ dài tối đa 100 ký tự, kiểm tra trùng lặp tên/mã trong cùng Tenant).
- **Service Layer (`ICategoryService` & `CategoryService`)**: Triển khai nghiệp vụ CRUD, tính toán `ProductCount` dựa trên các sản phẩm chưa bị xóa (`IsDeleted == false`), kiểm tra ràng buộc trước khi xóa.
- **Presentation Layer (`CategoriesController`)**:
  - `GET /api/categories`: Lấy danh sách nhóm hàng kèm `productCount`.
  - `GET /api/categories/{id}`: Lấy chi tiết một nhóm hàng.
  - `POST /api/categories`: Tạo mới nhóm hàng.
  - `PUT /api/categories/{id}`: Cập nhật thông tin nhóm hàng.
  - `DELETE /api/categories/{id}`: Xóa mềm nhóm hàng (chặn nếu `ProductCount > 0` hoặc có `SubCategories`).
- **Tuân thủ kiến trúc**: Toàn bộ Controller chỉ làm việc với Request/Response DTO, trả về bọc trong `ApiResponse<T>`, tự động áp dụng Global Query Filter theo `TenantId`.

### Out of scope
- Quản lý chi tiết danh mục sản phẩm nâng cao (Product CRUD, UoM quy đổi, combo sản phẩm) — thuộc scope quản lý sản phẩm riêng.
- Chức năng gộp (merge) danh mục hoặc di dời hàng loạt sản phẩm sang nhóm khác khi xóa nhóm.

## Người dùng liên quan
- **Chủ cửa hàng / Quản trị viên (Store Owner / Admin)**: Quản lý cây danh mục hàng hóa, phân nhóm ngành hàng, cấu hình nhóm cha - con.
- **Quản lý cửa hàng (Store Manager)**: Thêm mới hoặc hiệu chỉnh tên nhóm hàng phù hợp với kho và quầy kệ.
- **Thu ngân / Nhân viên (Cashier / Staff)**: Tra cứu và lọc danh mục khi bán hàng tại quầy POS hoặc kiểm kê kho (quyền đọc).

## Tiêu chí thành công
- [ ] Cung cấp đầy đủ 5 endpoints RESTful cho Category tại `/api/categories` tuân thủ chuẩn `ApiResponse<T>`.
- [ ] API `GET /api/categories` trả về danh sách danh mục có kèm `productCount` chính xác theo từng Tenant.
- [ ] API `POST /api/categories` tạo nhóm hàng thành công, tự động gán `TenantId`, trả về mã HTTP `201 Created`.
- [ ] API `PUT /api/categories/{id}` cập nhật đúng thông tin nhóm hàng và trả về mã HTTP `200 OK`.
- [ ] API `DELETE /api/categories/{id}` thực hiện Soft Delete (`IsDeleted = true`) khi nhóm không có sản phẩm; trả về lỗi HTTP `400` / `422` nếu nhóm đang chứa $\ge 1$ sản phẩm hoặc có nhóm con.
- [ ] Tích hợp liền mạch với cấu trúc dữ liệu của `CategorySidebar` và `CategoryModal` trên Frontend.
- [ ] Biên dịch Backend thành công 0 Error, 0 Warning.
