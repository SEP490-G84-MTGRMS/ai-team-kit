# Tasks: category-crud-backend

## DB & Persistence Configuration
- [x] T1 — Tạo file cấu hình Fluent API `CategoryConfiguration.cs` trong `MT_GRMS.Infrastructure/Persistence/Configurations/Catalog/` định nghĩa bảng `Categories` dạng phẳng (không quan hệ cha con), mapping `CategoryID`, chỉ mục duy nhất `(TenantId, Name)` và `(TenantId, CategoryCode)` khi `IsDeleted = false`. (REQ-CAT-03, REQ-CAT-06)

## Application Layer (DTOs & Service)
- [x] T2 — Tạo DTOs trong `src/MT_GRMS.Application/Catalog/Dtos/CategoryDtos.cs` (`CategoryResponse`, `CategoryCreateRequest`, `CategoryUpdateRequest` - mô hình phẳng). (REQ-CAT-01, REQ-CAT-02, REQ-CAT-03, REQ-CAT-04)
- [x] T3 — Định nghĩa Interface `ICategoryService.cs` và `ICategoryRepository.cs` trong `src/MT_GRMS.Application/Catalog/` với các phương thức nghiệp vụ CRUD chỉ nhận/trả DTO. (REQ-CAT-01 đến REQ-CAT-05)
- [x] T4 — Triển khai `CategoryService.cs` và `CategoryRepository.cs` trong `src/MT_GRMS.Application/Catalog/`:
  - Query danh sách dùng LINQ `.Select` tính `productCount` trực tiếp.
  - Tự động sinh `CategoryCode` khi để trống.
  - Kiểm tra chống trùng tên nhóm hàng trong cùng Tenant.
  - Chặn xóa nếu `productCount > 0`.
  - Thực hiện Soft Delete an toàn. (REQ-CAT-01 đến REQ-CAT-06)
- [x] T5 — Đăng ký Service và Repository vào Dependency Injection trong `MT_GRMS.Application/DependencyInjection.cs` và `MT_GRMS.Infrastructure/DependencyInjection.cs`. (REQ-CAT-01)

## API Layer (Controller)
- [x] T6 — Tạo `CategoriesController.cs` trong `src/MT_GRMS.Api/Controllers/` cung cấp 5 endpoints (`GET /api/categories`, `GET /api/categories/{id}`, `POST /api/categories`, `PUT /api/categories/{id}`, `DELETE /api/categories/{id}`), kế thừa `BaseApiController` và trả về chuẩn `ApiResponse<T>`. (REQ-CAT-01 đến REQ-CAT-06)

## Test & Verification
- [x] T7 — Viết Unit Tests cho `CategoryService` trong `tests/MT_GRMS.UnitTests` kiểm chứng đầy đủ các kịch bản: tính `productCount`, chặn trùng tên, chặn xóa khi có sản phẩm. (REQ-CAT-01 đến REQ-CAT-06)
- [x] T8 — Chạy toàn bộ kiểm thử Unit Tests với kết quả `51 Passed, 0 Failed`. (REQ-CAT-01 đến REQ-CAT-06)
