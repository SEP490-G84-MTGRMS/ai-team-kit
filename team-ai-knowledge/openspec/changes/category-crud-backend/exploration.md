# EXP-2026-10-29-001: Khảo sát & Đánh giá giải pháp Category CRUD Backend

## 1. Problem Statement
Backend `MT_GRMS_BACKEND` hiện chưa có API và Application Service phục vụ quản lý Nhóm hàng (Category). Trong khi đó, Frontend `MT_GRMS_FRONTEND` đã hoàn thiện giao diện `CategorySidebar` (tìm kiếm, chọn nhiều nhóm hàng, hiển thị số lượng sản phẩm `productCount`) và `CategoryModal` (tạo mới, sửa tên, xóa nhóm hàng với ràng buộc chặn xóa nếu còn sản phẩm). Cần hoàn thiện trọn vẹn cụm tính năng CRUD Category tại backend, đảm bảo chuẩn Clean Architecture, cô lập Multi-tenancy, và đồng bộ tuyệt đối với UI Frontend.

## 2. Context & Background
- **Entity Domain**: `MT_GRMS.Domain.Entities.Catalog.Category` đã tồn tại, kế thừa `BaseTenantEntity` với các trường: `Id`, `CategoryCode`, `Name`, `Description`, `DisplayOrder`, `ParentCategoryId`, và các navigations `Products`, `SubCategories`.
- **Database Schema**: Bảng `Categories` đã có sẵn trong migration `InitialPostgreSqlFull34Tables` với các trường: `CategoryID`, `CategoryCode`, `Name`, `Description`, `DisplayOrder`, `ParentCategoryID`, `TenantID`, `IsDeleted`.
- **Frontend Contract (`src/features/product/types/index.ts`)**:
  ```typescript
  export interface Category {
    id: string;
    code: string;
    name: string;
    parentId?: string | null;
    productCount: number;
    depth?: number;
  }
  ```
- **Hiện trạng thiếu hụt**: Chưa có `CategoryDtos.cs`, `ICategoryService`, `CategoryService`, `CategoriesController`, validator, và kiểm thử.

## 3. Constraints
- **Kiến trúc**: Tuân thủ Clean Architecture 4 tầng (.NET 8). Controller chỉ làm việc với Request/Response DTO; không để rò rỉ Domain Entity.
- **Đa người thuê**: Tự động lọc và gán `TenantId` qua Global Query Filter / `ITenantContext`. Tuyệt đối không để lộ dữ liệu chéo giữa các Tenant.
- **Ràng buộc toàn vẹn**: Chặn xóa nhóm hàng (trả về HTTP 400/422) nếu nhóm đang có ít nhất 1 sản phẩm chưa bị xóa (`ProductCount > 0`) hoặc có nhóm hàng con (`SubCategories`).
- **Phản hồi**: 100% API bọc trong `ApiResponse<T>`.

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi nhóm hàng thuộc về 1 Tenant duy nhất (`TenantId`).
- **[ASSUMPTION-02]**: Tên nhóm hàng (`Name`) là duy nhất trong cùng 1 Tenant (không phân biệt hoa thường với các nhóm hàng chưa bị xóa).
- **[ASSUMPTION-03]**: Nếu người dùng không chỉ định `CategoryCode`, backend sẽ tự động sinh mã dạng `CAT-XXXX` (hoặc lấy timestamp/sequence ngắn).
- **[ASSUMPTION-04]**: `ProductCount` phản ánh số lượng sản phẩm active (`IsDeleted == false`) thuộc nhóm hàng đó trong Tenant hiện tại.

## 5. Scope & Non-Goals
### In Scope
- Tạo DTOs: `CategoryResponse`, `CategoryCreateRequest`, `CategoryUpdateRequest`.
- Tạo `ICategoryService` và triển khai `CategoryService` trong `MT_GRMS.Application/Catalog`.
- Đăng ký DI trong `ApplicationDependencyInjection`.
- Tạo `CategoriesController` trong `MT_GRMS.Api/Controllers` với 5 endpoints:
  - `GET /api/categories`: Lấy danh sách nhóm hàng kèm `productCount`.
  - `GET /api/categories/{id}`: Lấy chi tiết nhóm hàng theo ID.
  - `POST /api/categories`: Tạo mới nhóm hàng.
  - `PUT /api/categories/{id}`: Cập nhật thông tin nhóm hàng.
  - `DELETE /api/categories/{id}`: Xóa mềm nhóm hàng (kiểm tra ràng buộc).
- Xử lý validation: Tên bắt buộc, tối đa 100 ký tự; chống circular reference khi gán `ParentCategoryId`.
- Viết Unit Tests kiểm thử Business Logic.

### Out of Scope (Non-Goals)
- Không làm tính năng Import/Export danh mục hàng loạt bằng Excel trong đợt này.
- Không tự động chuyển sản phẩm sang danh mục mặc định khi xóa (chỉ áp dụng cơ chế chặn xóa nghiêm ngặt).
- Không xây dựng quản lý quyền hạn chi tiết theo từng danh mục con (dùng chung role `Admin`/`Manager` cho thao tác ghi, `Staff` cho thao tác đọc).

## 6. Đánh giá các phương án kỹ thuật

| Phương án | Mô tả | Ưu điểm | Nhược điểm |
| :--- | :--- | :--- | :--- |
| **Phương án 1 (Khuyến nghị): Tách riêng ICategoryService + LINQ Subquery Projection** | Tạo riêng `ICategoryService` & `CategoryService`. Query danh sách dùng LINQ `.Select(c => new CategoryResponse(..., c.Products.Count(p => !p.IsDeleted)))`. | - Tuân thủ triệt để SRP & ISP.<br>- Câu lệnh SQL được biên dịch tối ưu (1 round-trip `LEFT JOIN`/`GROUP BY`), không N+1.<br>- Code sạch, dễ test độc lập. | Cần viết DTO projection cẩn thận. |
| **Phương án 2: Gộp chung vào ICatalogService hiện tại** | Thêm các hàm `GetCategoriesAsync`, `CreateCategoryAsync` vào `ICatalogService` (đang có Product). | Giảm số lượng file interface mới. | - Vi phạm SRP, file `CatalogService` sẽ phình to khi thêm UoM, Combo, Brand.<br>- Khó phân chia công việc cho team. |
| **Phương án 3: Lưu cột vật lý `ProductCount` trong bảng Categories** | Thêm cột `ProductCount` vào bảng `Categories`, dùng trigger hoặc event khi thêm/xóa sản phẩm để cộng/trừ. | Query danh mục nhanh như đọc bảng phẳng, không cần subquery. | - Nguy cơ sai lệch số liệu khi có rollback hoặc sửa DB trực tiếp.<br>- Tăng độ phức tạp quản lý transaction. Không cần thiết với quy mô dưới 100.000 sản phẩm. |

## 7. Phương án lựa chọn & Lý do
**Lựa chọn: Phương án 1**.
- Tách riêng `ICategoryService` và `CategoriesController` đảm bảo tính module hóa cao của Clean Architecture.
- Sử dụng LINQ projection cho phép PostgreSQL tối ưu hóa câu lệnh đếm trực tiếp trên index của khóa ngoại `Products.CategoryID`, vừa đảm bảo tính chính xác tức thì (real-time consistency), vừa đạt hiệu năng cao mà không gây phức tạp hóa database.

## 8. Rủi ro & Biện pháp giảm thiểu
1. **Rủi ro đệ quy vòng lặp cây danh mục (Circular Dependency)**: Gán `ParentCategoryId` của A thành B trong khi B lại là con của A.
   - *Biện pháp*: Trong `UpdateCategoryAsync`, kiểm tra nếu `request.ParentCategoryId == id` hoặc nếu `request.ParentCategoryId` là một node con trong cây của `id` thì từ chối với lỗi `400 Bad Request`.
2. **Rủi ro tranh chấp khi xóa (Race Condition)**: Tại thời điểm bấm xóa, có sản phẩm mới được tạo gắn vào danh mục.
   - *Biện pháp*: Kiểm tra số lượng sản phẩm trực tiếp trong transaction của thao tác xóa; nếu `> 0` thì hủy thao tác xóa và báo lỗi.
