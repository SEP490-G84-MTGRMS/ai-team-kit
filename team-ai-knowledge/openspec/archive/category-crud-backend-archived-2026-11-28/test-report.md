---
verdict: PASS
tested_at: 2026-10-29
---
# Test Report: category-crud-backend

## Kết quả kiểm thử theo Scenarios trong specs.md

| REQ | Scenario | Test Case tương ứng | Kết quả |
| :--- | :--- | :--- | :--- |
| **REQ-CAT-01** | Lấy danh sách danh mục thành công có `productCount` | `GetAllAsync_ReturnsCategoriesWithAccurateProductCount` | ✅ PASS |
| **REQ-CAT-01** | Không hiển thị danh mục đã bị xóa mềm (`IsDeleted == true`) | `GetAllAsync_ExcludesSoftDeletedCategories` | ✅ PASS |
| **REQ-CAT-02** | Tìm thấy nhóm hàng hợp lệ theo ID | `GetByIdAsync_ExistingCategory_ReturnsDto` | ✅ PASS |
| **REQ-CAT-02** | Nhóm hàng không tồn tại hoặc thuộc Tenant khác | `GetByIdAsync_NonExistingCategory_ReturnsNull` | ✅ PASS |
| **REQ-CAT-03** | Tạo mới nhóm hàng hợp lệ | `CreateAsync_ValidRequest_CreatesSuccessfully` | ✅ PASS |
| **REQ-CAT-03** | Lỗi khi tên để trống | `CreateAsync_EmptyName_ThrowsArgumentException` | ✅ PASS |
| **REQ-CAT-03** | Lỗi khi trùng tên nhóm hàng trong cùng Tenant | `CreateAsync_DuplicateName_ThrowsBusinessException` | ✅ PASS |
| **REQ-CAT-04** | Cập nhật thông tin nhóm hàng thành công | `UpdateAsync_ValidRequest_UpdatesSuccessfully` | ✅ PASS |
| **REQ-CAT-04** | Cập nhật tên trùng với nhóm hàng khác | `UpdateAsync_DuplicateName_ThrowsBusinessException` | ✅ PASS |
| **REQ-CAT-05** | Xóa thành công nhóm hàng rỗng (`productCount == 0`) | `DeleteAsync_EmptyCategory_DeletesSuccessfully` | ✅ PASS |
| **REQ-CAT-05** | Chặn xóa khi nhóm hàng đang chứa sản phẩm | `DeleteAsync_CategoryWithProducts_ThrowsBusinessException` | ✅ PASS |
| **REQ-CAT-05** | Xóa nhóm hàng không tồn tại | `DeleteAsync_NonExistingCategory_ThrowsNotFoundException` | ✅ PASS |
| **REQ-CAT-06** | Cô lập Multi-Tenancy qua Global Query Filter | `TenantQueryFilter_ExcludesCrossTenantData` | ✅ PASS |

---

## Lệnh kiểm thử đã chạy

```powershell
dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\MT_GRMS.UnitTests.csproj
```

**Output thực tế từ xUnit Test Runner:**
```text
Test run for D:\FPT_uni\Sesmester_9_Fall_26\File\MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests\bin\Debug\net8.0\MT_GRMS.UnitTests.dll (.NETCoreApp,Version=v8.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed: 0, Passed: 51, Skipped: 0, Total: 51, Duration: 115 ms - MT_GRMS.UnitTests.dll (net8.0)
```

---

## Đối chiếu Specs ↔ Code thực tế

1. **Kiến trúc & Encapsulation**:
   - `CategoriesController` chỉ nhận và trả về DTO (`CategoryResponse`, `CategoryCreateRequest`, `CategoryUpdateRequest`). Tuyệt đối không expose Domain Entity `Category` ra ngoài controller.
   - Toàn bộ kết quả phản hồi bọc trong `ApiResponse<T>`.

2. **Mô hình danh mục phẳng (Flat Model)**:
   - Entity `Category` và Fluent API `CategoryConfiguration` đã loại bỏ hoàn toàn các trường và quan hệ phân cấp cha con (`ParentCategoryId`, `ParentCategory`, `SubCategories`) theo đúng chỉ đạo nghiệp vụ.
   - Bảng `Categories` được cấu hình gọn gàng, có đầy đủ B-Tree indexes trên `(TenantId, Name)` và `(TenantId, CategoryCode)`.

3. **Hiệu năng & Toàn vẹn dữ liệu**:
   - `CategoryRepository.GetAllWithProductCountAsync` sử dụng LINQ projection kết hợp `COUNT(p => !p.IsDeleted)` thực hiện trên 1 câu SQL duy nhất, đảm bảo không xảy ra vấn đề N+1 query.
   - Cơ chế chặn xóa (`productCount > 0`) được kiểm tra và kích hoạt trước khi thực hiện xóa mềm.

---

## Lỗi còn tồn đọng
- Không có lỗi nào tồn đọng. 100% test cases đã PASS.
