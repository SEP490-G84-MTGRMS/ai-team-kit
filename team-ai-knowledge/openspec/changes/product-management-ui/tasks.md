# Tasks: product-management-ui (Cụm 1: Product List & Category Filter)

## Layer 1: Types & API Client (Cụm 1)
- [ ] T1 — Chuẩn hóa `src/features/product/types/index.ts` cho Product Response, Paged Result, Product Query Filter và Flat Category (REQ-01, REQ-03)
- [ ] T2 — Xây dựng `src/features/product/api/productApi.ts` (`getProducts`) và `src/features/product/api/categoryApi.ts` (`getCategories`) sử dụng `httpClient` chuẩn (REQ-01, REQ-03)

## Layer 2: React Query Hooks (Cụm 1)
- [ ] T3 — Xây dựng custom hooks `useProducts(filterParams)` và `useCategories()` với cơ chế caching chuẩn TanStack Query v5 (REQ-01, REQ-03)

## Layer 3: UI Integration (Cụm 1)
- [ ] T4 — Nâng cấp `CategorySidebar.tsx` hiển thị danh mục phẳng từ API Backend và kích hoạt callback chọn danh mục (REQ-03)
- [ ] T5 — Nâng cấp `ProductListPage.tsx` & bảng hiển thị: tích hợp debounced search (300ms), phân trang server-side, và ẩn cột "Giá vốn" với vai trò Cashier/Staff theo BR-SEC-01 (REQ-01, REQ-02, REQ-04)

## Layer 4: Verification & Test (Cụm 1)
- [ ] T6 — Viết và chạy unit test cho API mapping, logic phân trang, debounced search và phân quyền ẩn giá vốn (REQ-01 đến REQ-04)
