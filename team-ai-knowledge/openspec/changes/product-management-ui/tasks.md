# Tasks: product-management-ui

> **Quy định kỹ thuật:** KHÔNG dùng custom hook. Theo đúng style hiện tại của dự án: sử dụng trực tiếp `useState`, `useEffect`, `useCallback` trong Page component để gọi `productApi`. Tích hợp component chung `TablePagination` của dự án (`src/components/common/TablePagination`).
> **Phạm vi Change:** Tập trung hoàn thành dứt điểm **Tiểu cụm 1.1 & 1.2: Nền tảng API & Bảng Danh sách Phân trang Server-side (Read-only)**.

---

## Danh sách Tasks cho Tiểu cụm 1.1 & 1.2 (Không dùng Custom Hook)

### Task T1: Core Types Synchronization (Tiểu cụm 1.1)
- [x] T1 — Chuẩn hóa `src/features/product/types/index.ts` chỉ chứa các interface cốt lõi cho danh sách: `ProductResponse`, `PagedResult<T>`, `ProductQueryFilter` khớp 100% với DTOs C#. (REQ-01)

### Task T2: Product API Service (Tiểu cụm 1.1)
- [x] T2 — Xây dựng `src/features/product/api/productApi.ts` với hàm `getProductsPaged(filter: ProductQueryFilter)` gọi `httpClient.get('/products', { params })` qua `httpClient` chuẩn của dự án, unwrap `ApiResponse<PagedResult<ProductResponse>>`. (REQ-01)

### Task T3: Server-side Paginated Product Table Integration (Tiểu cụm 1.2)
- [x] T3 — Cập nhật `ProductListPage.tsx` bằng `useState`, `useEffect`, `useCallback` gọi trực tiếp `productApi.getProductsPaged`: hiển thị dữ liệu thật từ Backend lên bảng và tích hợp component phân trang dùng chung `TablePagination` của dự án. (REQ-01)

### Task T4: Unit Test for Core API & Pagination Mapping (Tiểu cụm 1.1 & 1.2)
- [ ] T4 — Viết test kiểm thử `productApi.getProductsPaged` và logic phân trang để đảm bảo dữ liệu map đúng từ API Backend. (REQ-01)

---

## Lộ trình các Tiểu cụm tiếp theo (Backlog)
- **Tiểu cụm 1.3:** Phân quyền ẩn cột Giá vốn theo vai trò người dùng (BR-SEC-01).
- **Tiểu cụm 1.4:** Ô tìm kiếm đa tiêu chí debounced (300ms) theo SKU, Barcode, Tên.
- **Tiểu cụm 1.5:** Lọc theo Danh mục phẳng từ `GET /api/categories` (`CategorySidebar`).
- **Tiểu cụm 2.1 & 2.2:** Form tạo mới sản phẩm chuẩn và tự sinh mã SKU (`POST /api/products`).
- **Tiểu cụm 3.1 & 3.2:** Modal xem chi tiết 360° và danh sách Nhà cung cấp liên kết (`GET /api/products/{id}/suppliers`).
- **Tiểu cụm 4.1:** Cập nhật thông tin sản phẩm và khóa Base UOM (BR-PROD-01).
- **Tiểu cụm 4.2:** Xóa mềm an toàn chuyển trạng thái Discontinued (BR-DATA-01).
