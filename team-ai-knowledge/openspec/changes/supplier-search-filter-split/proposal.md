# Proposal: supplier-search-filter-split

## Vấn đề
1. Màn **Quản lý Nhà cung cấp** (`/store-owner/suppliers`) đang gom nhiều tiêu chí vào **một ô tìm kiếm tổng hợp** (kèm tag/autocomplete chung). Chủ cửa hàng không thấy rõ đang lọc theo mã, tên, người liên hệ hay số điện thoại.
2. Domain vẫn còn bảng lookup **`SupplierCategories`** + FK/`CategoryCode` trên `Suppliers` và logic ngành hàng NCC, trong khi UI màn danh sách/chi tiết NCC **không còn dùng ngành hàng** — dư thừa, dễ nhầm với `Categories` của sản phẩm.

## Mục tiêu
- Refactor bộ lọc: mỗi tiêu chí có label + input riêng (Mã/Tên/Liên hệ/SĐT), AND khi tìm kiếm.
- **Gỡ hoàn toàn** bảng `SupplierCategories` và mọi logic ngành hàng gắn với hồ sơ NCC (entity, FK, DTO, filter, Excel, form tạo/sửa). Giữ nguyên `Categories` của catalog sản phẩm.

## Phạm vi
- In scope:
  - Tách 4 trường filter độc lập + Phân loại NCC (`SupplierType`) + Trạng thái.
  - Xóa entity/config/`DbSet` `SupplierCategory`; bỏ `CategoryId`/`Category`/`CategoryCode` trên `Suppliers`; migration/EnsureSchema drop cột + bảng.
  - Gỡ map/filter/UI: Create/Edit/Detail/Filter/Excel/AssignBranch cột ngành hàng NCC.
- Out of scope:
  - Ngành hàng **sản phẩm** (`Categories` / filter trên màn sản phẩm theo NCC).
  - Đổi nghiệp vụ gán chi nhánh, công nợ, delivery config.

## Người dùng liên quan
- Chủ cửa hàng / Admin (`STORE_OWNER`, `ADMIN`) trên `/store-owner/suppliers`.

## Tiêu chí thành công
- [ ] Không còn ô tìm kiếm tổng hợp trên màn này.
- [ ] 4 input độc lập + Phân loại + Trạng thái AND khi Tìm kiếm.
- [ ] Không còn bảng `SupplierCategories`; không còn cột/FK ngành hàng trên `Suppliers`.
- [ ] FE màn list/detail/create/edit/excel NCC không còn field/cột ngành hàng.
- [ ] Màn sản phẩm theo NCC vẫn lọc được ngành hàng **sản phẩm** như cũ.
