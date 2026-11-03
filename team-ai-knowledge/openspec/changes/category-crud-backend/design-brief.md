# Design Brief: category-crud-backend

## 1. Tổng quan & Luồng tương tác (UI/API Flow)

### 1.1. Luồng tải dữ liệu (Load Danh mục)
```text
[Người dùng mở trang Sản phẩm] 
         │
         ▼
[Frontend: ProductListPage / CategorySidebar]
         │  GET /api/categories (kèm Bearer Token)
         ▼
[Backend: CategoriesController.GetAll]
         │  CategoryService.GetAllAsync()
         ▼
[PostgreSQL: LEFT JOIN Products & GROUP BY Categories]
         │  Trả về IReadOnlyList<CategoryResponse> có trường productCount
         ▼
[CategorySidebar hiển thị danh sách dạng: "Tên nhóm (số lượng)"]
```

### 1.2. Luồng Tạo mới / Cập nhật Danh mục
1. Người dùng bấm **"Tạo mới"** hoặc biểu tượng **Edit** trên `CategorySidebar`.
2. `CategoryModal` hiển thị ô nhập `Tên nhóm hàng` (và tùy chọn nhóm cha, mô tả).
3. Khi bấm **"Lưu"**:
   - Frontend gửi `POST /api/categories` (tạo mới) hoặc `PUT /api/categories/{id}` (cập nhật).
   - Backend kiểm tra trùng lặp tên trong cùng Tenant (`TenantId`). Nếu trùng $\rightarrow$ trả về HTTP 400 kèm thông báo `"Tên nhóm hàng đã tồn tại"`.
   - Nếu hợp lệ $\rightarrow$ lưu database, trả về `CategoryResponse`.
   - Frontend nhận kết quả, đóng modal và cập nhật lại danh sách trên Sidebar.

### 1.3. Luồng Xóa Danh mục (Quy tắc bảo vệ dữ liệu)
1. Người dùng bấm **"Xóa"** trong `CategoryModal`.
2. **Kiểm tra tầng 1 (Frontend)**: Nếu `categoryToEdit.productCount > 0`, Frontend lập tức hiển thị cảnh báo: *"Không thể xóa nhóm hàng vì đang chứa X sản phẩm"*.
3. **Kiểm tra tầng 2 (Backend - Nghiêm ngặt)**:
   - Khi nhận `DELETE /api/categories/{id}`, `CategoryService` đếm số sản phẩm active (`IsDeleted == false`) và số nhóm con (`SubCategories`).
   - Nếu `ProductCount > 0` $\rightarrow$ Trả về `400 Bad Request` hoặc `422 Unprocessable Entity`: `"Không thể xóa nhóm hàng đang chứa sản phẩm."`
   - Nếu có nhóm hàng con $\rightarrow$ Trả về lỗi: `"Không thể xóa nhóm hàng đang có nhóm con."`
   - Nếu thỏa mãn $\rightarrow$ Đánh dấu `IsDeleted = true`, lưu `UpdatedAt`, trả về HTTP 200.

---

## 2. Thiết kế API Endpoints & DTOs

Base Route: `/api/categories`

| Method | Endpoint | Quyền hạn (Roles) | Mô tả | Mã HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Tất cả (Staff, Cashier, Manager, Owner) | Lấy danh sách nhóm hàng kèm `productCount` | 200 OK |
| `GET` | `/api/categories/{id}` | Tất cả | Lấy chi tiết một nhóm hàng | 200 OK / 404 |
| `POST` | `/api/categories` | Store Owner, Store Manager | Tạo mới nhóm hàng | 201 Created / 400 |
| `PUT` | `/api/categories/{id}` | Store Owner, Store Manager | Cập nhật nhóm hàng | 200 OK / 400 / 404 |
| `DELETE` | `/api/categories/{id}` | Store Owner, Store Manager | Xóa mềm nhóm hàng | 200 OK / 400 / 404 |

### Chi tiết DTOs C#

```csharp
namespace MT_GRMS.Application.Catalog.Dtos;

/// <summary>
/// DTO trả về thông tin danh mục tương thích hoàn toàn với interface Category của Frontend
/// </summary>
public record CategoryResponse(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    Guid? ParentId,
    int DisplayOrder,
    int ProductCount
);

public record CategoryCreateRequest(
    string Name,
    string? Code = null,
    string? Description = null,
    Guid? ParentId = null,
    int DisplayOrder = 0
);

public record CategoryUpdateRequest(
    string Name,
    string? Description = null,
    Guid? ParentId = null,
    int DisplayOrder = 0
);
```

### Cấu trúc phản hồi chuẩn (`ApiResponse<T>`)
```json
{
  "success": true,
  "data": [
    {
      "id": "e7b0a84d-2a1e-4c8d-8a27-6f81a719c820",
      "code": "CAT-001",
      "name": "Bánh kẹo & Snack",
      "description": "Các loại bánh kẹo, snack ăn vặt",
      "parentId": null,
      "displayOrder": 1,
      "productCount": 15
    }
  ],
  "message": null,
  "errors": null
}
```

---

## 3. Trạng thái Giao diện Frontend (UI States)
- **Loading State**: Hiển thị Skeleton hoặc hiệu ứng shimmer trong `CategorySidebar` khi đang fetch `/api/categories`.
- **Empty State**: Khi cửa hàng mới tạo chưa có nhóm hàng nào hoặc tìm kiếm không khớp: hiển thị `"Không có nhóm hàng nào"`.
- **Error State**:
  - Lỗi mạng hoặc HTTP 500: Toast thông báo lỗi.
  - Lỗi validation (trùng tên, để trống): Thông báo inline màu đỏ trong `CategoryModal` (`errorMsg`).
  - Lỗi vi phạm ràng buộc xóa: Alert cảnh báo màu đỏ với icon `AlertCircle`.

---

## 4. Thiết kế Cơ sở Dữ liệu & Fluent API

Bảng `Categories` trong PostgreSQL đã có sẵn với lược đồ:
- `CategoryID` (UUID, PK)
- `TenantID` (VARCHAR(50), NOT NULL, Indexed)
- `CategoryCode` (VARCHAR(30), NOT NULL)
- `Name` (VARCHAR(100), NOT NULL)
- `Description` (VARCHAR(500), NULL)
- `DisplayOrder` (INT, DEFAULT 0)
- `ParentCategoryID` (UUID, NULL, FK to `Categories.CategoryID`)
- `CreatedAt`, `UpdatedAt`, `IsDeleted`, `CreatedBy` (BaseTenantEntity)

Tạo file cấu hình Fluent API chuẩn mực:  
`MT_GRMS.Infrastructure/Persistence/Configurations/CategoryConfiguration.cs`:
- Đảm bảo mapping: `builder.ToTable("Categories");`
- Khóa chính: `builder.HasKey(x => x.Id); builder.Property(x => x.Id).HasColumnName("CategoryID");`
- Chỉ mục duy nhất: `builder.HasIndex(x => new { x.TenantId, x.Name }).IsUnique().HasFilter("\"IsDeleted\" = false");`
- Chỉ mục mã: `builder.HasIndex(x => new { x.TenantId, x.CategoryCode }).IsUnique().HasFilter("\"IsDeleted\" = false");`

---

## 5. Quy tắc nghiệp vụ (Business Rules)
1. **BR-CAT-01 (Multi-Tenant Isolation)**: Mọi thao tác truy vấn và biến đổi dữ liệu Category chỉ tác động trên dữ liệu thuộc `TenantId` của người dùng đăng nhập.
2. **BR-CAT-02 (Unique Category Name)**: Trong cùng một Tenant, không được phép có hai nhóm hàng chưa bị xóa (`IsDeleted == false`) trùng tên với nhau (so sánh không phân biệt hoa thường).
3. **BR-CAT-03 (Auto-generated Code)**: Nếu `CategoryCreateRequest.Code` để trống, hệ thống tự động sinh mã dạng `CAT-{YYMM}-{Seq}` hoặc `CAT-{RandomHex}` đảm bảo duy nhất.
4. **BR-CAT-04 (Deletion Integrity Protection)**: Không thể xóa nhóm hàng nếu:
   - Đang có ít nhất 1 sản phẩm chưa bị xóa liên kết tới nó (`ProductCount > 0`).
   - Đang có ít nhất 1 nhóm hàng con trỏ tới nó (`SubCategories.Any(sc => !sc.IsDeleted)`).
5. **BR-CAT-05 (Anti-Circular Dependency)**: Khi cập nhật `ParentId`, không được phép gán `ParentId` bằng chính `Id` của danh mục đó hoặc trỏ vào các danh mục con cháu của nó.
