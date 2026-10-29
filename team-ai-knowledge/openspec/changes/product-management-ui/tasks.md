# Tasks: product-management-ui

## Types & API Client Layer
- [x] T1 — Chuẩn hóa `src/features/product/types/index.ts` khớp 100% với DTOs C# (`ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`, `ProductQueryFilter`, `CategoryDto`) (REQ-01, REQ-02)
- [x] T2 — Xây dựng `src/features/product/api/productApi.ts` & `categoryApi.ts` kết nối `/api/products` và `/api/categories` qua `httpClient` (REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06)

## React Query Hooks Layer
- [ ] T3 — Xây dựng custom hooks `useProducts`, `useProductDetail`, `useProductMutations`, `useCategories` hỗ trợ cache và invalidate (REQ-01, REQ-03, REQ-04, REQ-05, REQ-06)

## UI Components & Integration Layer
- [ ] T4 — Cập nhật `CategorySidebar.tsx` tải dữ liệu danh mục phẳng từ API, hỗ trợ lọc theo CategoryId (REQ-06)
- [ ] T5 — Nâng cấp `ProductListPage.tsx` tích hợp tìm kiếm debounced, phân trang server-side và ẩn cột Giá vốn theo BR-SEC-01 (REQ-01)
- [ ] T6 — Nâng cấp `ProductFormModal.tsx` hỗ trợ tạo mới (`POST /api/products`) và cập nhật (`PUT /api/products/{id}`), kiểm soát trường `CostPrice` và validate input (REQ-02, REQ-04)
- [ ] T7 — Nâng cấp `ProductDetailModal.tsx` hiển thị chi tiết 360 độ và danh sách Nhà cung cấp liên kết (`GET /api/products/{id}/suppliers`) (REQ-03)
- [ ] T8 — Tích hợp thao tác Xóa mềm sản phẩm (`DELETE /api/products/{id}`) với hộp thoại xác nhận bảo toàn dữ liệu BR-DATA-01 (REQ-05)

## Verification & Testing
- [ ] T9 — Viết và chạy unit tests cho `productApi` và các scenarios chính (phân trang, tạo, sửa, xóa, phân quyền giá vốn) (REQ-01 đến REQ-06)
