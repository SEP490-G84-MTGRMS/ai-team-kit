# Tasks: category-crud-backend

## DB & Persistence Configuration
- [ ] T1 — Tạo file cấu hình Fluent API `CategoryConfiguration.cs` trong `MT_GRMS.Infrastructure/Persistence/Configurations/` định nghĩa bảng `Categories`, mapping `CategoryID`, chỉ mục duy nhất `(TenantId, Name)` và `(TenantId, CategoryCode)` khi `IsDeleted = false`. (REQ-CAT-03, REQ-CAT-06)

## Application Layer (DTOs & Service)
- [ ] T2 — Tạo DTOs trong `src/MT_GRMS.Application/Catalog/Dtos/CategoryDtos.cs` (`CategoryResponse`, `CategoryCreateRequest`, `CategoryUpdateRequest`). (REQ-CAT-01, REQ-CAT-02, REQ-CAT-03, REQ-CAT-04)
- [ ] T3 — Định nghĩa Interface `ICategoryService.cs` trong `src/MT_GRMS.Application/Catalog/` với 5 phương thức nghiệp vụ CRUD chỉ nhận/trả DTO. (REQ-CAT-01 đến REQ-CAT-05)
- [ ] T4 — Triển khai `CategoryService.cs` trong `src/MT_GRMS.Application/Catalog/`:
  - Query danh sách dùng LINQ `.Select` tính `productCount` trực tiếp.
  - Tự động sinh `CategoryCode` khi để trống.
  - Kiểm tra chống trùng tên nhóm hàng trong cùng Tenant.
  - Ngăn chặn circular dependency (`ParentId == Id`).
  - Chặn xóa nếu `productCount > 0` hoặc có nhóm con `SubCategories`.
  - Thực hiện Soft Delete an toàn. (REQ-CAT-01 đến REQ-CAT-06)
- [ ] T5 — Đăng ký Service vào Dependency Injection trong `src/MT_GRMS.Application/ApplicationDependencyInjection.cs`. (REQ-CAT-01)

## API Layer (Controller)
- [ ] T6 — Tạo `CategoriesController.cs` trong `src/MT_GRMS.Api/Controllers/` cung cấp 5 endpoints (`GET /api/categories`, `GET /api/categories/{id}`, `POST /api/categories`, `PUT /api/categories/{id}`, `DELETE /api/categories/{id}`), kế thừa `BaseApiController` và trả về chuẩn `ApiResponse<T>`. (REQ-CAT-01 đến REQ-CAT-06)

## Test & Verification
- [ ] T7 — Viết Unit Tests cho `CategoryService` trong `tests/MT_GRMS.UnitTests` kiểm chứng đầy đủ các kịch bản: tính `productCount`, chặn trùng tên, chống circular dependency, chặn xóa khi có sản phẩm/nhóm con. (REQ-CAT-01 đến REQ-CAT-06)
- [ ] T8 — Biên dịch Solution `dotnet build MT_GRMS_BACKEND.sln` và chạy toàn bộ kiểm thử `dotnet test` đảm bảo 0 lỗi. (REQ-CAT-01 đến REQ-CAT-06)
