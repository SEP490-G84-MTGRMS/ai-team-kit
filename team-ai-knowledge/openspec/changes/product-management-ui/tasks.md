# Tasks: product-management-ui

> **Chiến lược phân rã:** Toàn bộ phân hệ Product Catalog UI được chia nhỏ thành 11 tiểu cụm chức năng độc lập (Micro-slices).
> **Phạm vi Change này:** Tập trung hoàn thành dứt điểm **Tiểu cụm 1.1 & 1.2: Nền tảng API & Bảng Danh sách Phân trang Server-side (Read-only)**.

---

## Danh sách Tasks cho Tiểu cụm 1.1 & 1.2 (Change hiện tại)

### Task T1: Core Types Synchronization (Tiểu cụm 1.1)
- [ ] T1 — Chuẩn hóa `src/features/product/types/index.ts` chỉ chứa các interface cốt lõi cho danh sách: `ProductResponse`, `PagedResult<T>`, `ProductQueryFilter` khớp 100% với DTOs C#. (REQ-01)

### Task T2: Product API Client Service (Tiểu cụm 1.1)
- [ ] T2 — Tạo `src/features/product/api/productApi.ts` với hàm `getProductsPaged(filter: ProductQueryFilter)` gọi `GET /api/products` qua `httpClient`, unwrap `ApiResponse<PagedResult<ProductResponse>>`. (REQ-01)

### Task T3: React Query Hook for Product List (Tiểu cụm 1.2)
- [ ] T3 — Xây dựng hook `useProducts(filter: ProductQueryFilter)` dùng TanStack Query v5 để fetch dữ liệu bảng và quản lý trạng thái `isLoading`, `isError`, `data`. (REQ-01)

### Task T4: Server-side Paginated Product Table Integration (Tiểu cụm 1.2)
- [ ] T4 — Cập nhật `ProductListPage.tsx` thay thế mock data bằng hook `useProducts`: hiển thị dữ liệu thật từ Backend lên bảng (Mã hàng, Mã vạch, Tên hàng, ĐVT, Giá bán, Trạng thái) và bộ điều khiển phân trang server-side (trang trước/sau, số trang). (REQ-01)

### Task T5: Unit Test for Core API & Pagination Mapping (Tiểu cụm 1.1 & 1.2)
- [ ] T5 — Viết test kiểm thử `productApi.getProductsPaged` và logic phân trang để đảm bảo dữ liệu map đúng từ API Backend. (REQ-01)

---

## Lộ trình các Tiểu cụm tiếp theo (Backlog)
- **Tiểu cụm 1.3:** Phân quyền ẩn cột Giá vốn theo vai trò người dùng (BR-SEC-01).
- **Tiểu cụm 1.4:** Ô tìm kiếm đa tiêu chí debounced (300ms) theo SKU, Barcode, Tên.
- **Tiểu cụm 1.5:** Lọc theo Danh mục phẳng từ `GET /api/categories` (`CategorySidebar`).
- **Tiểu cụm 2.1 & 2.2:** Form tạo mới sản phẩm chuẩn và tự sinh mã SKU (`POST /api/products`).
- **Tiểu cụm 3.1 & 3.2:** Modal xem chi tiết 360° và danh sách Nhà cung cấp liên kết (`GET /api/products/{id}/suppliers`).
- **Tiểu cụm 4.1:** Cập nhật thông tin sản phẩm và khóa Base UOM (BR-PROD-01).
- **Tiểu cụm 4.2:** Xóa mềm an toàn chuyển trạng thái Discontinued (BR-DATA-01).
