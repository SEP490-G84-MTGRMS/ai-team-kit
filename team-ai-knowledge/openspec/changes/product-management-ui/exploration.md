# EXP-2026-10-29-001: Khảo sát Triển khai Cụm 1 — Danh sách Hàng hóa & Bộ lọc (Product List & Category Filter)

## 1. Problem Statement
Để kiểm soát rủi ro và tăng tốc độ nghiệm thu, thay vì thực hiện toàn bộ module quản lý hàng hóa cùng một lúc, chúng ta chia thành các cụm chức năng nhỏ.
Trọng tâm bước đầu tiên là **Cụm 1**: Kết nối giao diện danh sách hàng hóa với Backend API thật (`GET /api/products` và `GET /api/categories`), giải quyết bài toán:
- Phân trang server-side chuẩn xác.
- Tìm kiếm tức thời có debounce (300ms) để không gây nghẽn mạng.
- Lọc theo danh mục sản phẩm (mô hình danh mục phẳng đã làm ở backend).
- Bảo vệ dữ liệu nhạy cảm theo quy tắc **BR-SEC-01**: Nhân viên thu ngân (`Cashier`, `Staff`) không được xem giá vốn (`CostPrice`).

---

## 2. Context & Tech Stack
- **Backend:** .NET 8 Web API:
  - `GET /api/products`: nhận `ProductQueryFilter` (`searchTerm`, `categoryId`, `status`, `pageIndex`, `pageSize`), trả về `ApiResponse<PagedResult<ProductResponse>>`.
  - `GET /api/categories`: trả về `ApiResponse<IReadOnlyList<CategoryDto>>` (danh mục phẳng).
- **Frontend:**
  - `src/features/product/pages/ProductListPage.tsx`: Màn hình danh sách chính.
  - `src/features/product/components/CategorySidebar.tsx`: Sidebar lọc danh mục.
  - `src/features/product/components/ProductTable.tsx`: Bảng hiển thị sản phẩm.
  - `@tanstack/react-query`: Quản lý query state, caching và refetching.
  - `httpClient`: Axios client tại `src/api/httpClient.ts`.

---

## 3. Scope & Non-Goals của Cụm 1
### In Scope
- Đồng bộ TypeScript interfaces cho Product List Item, Paged Result và Category trong `src/features/product/types/index.ts`.
- Tạo `src/features/product/api/productApi.ts` với hàm `getProducts(params)`.
- Tạo `src/features/product/api/categoryApi.ts` với hàm `getCategories()`.
- Tạo hook `useProducts(filterParams)` và `useCategories()`.
- Cập nhật `CategorySidebar.tsx` đọc danh mục từ API thật, hỗ trợ chọn nhóm hàng hoặc "Tất cả".
- Cập nhật `ProductListPage.tsx` kết nối dữ liệu thật, hỗ trợ chuyển trang, thay đổi kích thước trang, và ẩn cột Giá vốn theo role (BR-SEC-01).

### Non-Goals (Dành cho các Cụm sau)
- Không đụng tới logic gửi form tạo mới (`POST /api/products`).
- Không đụng tới logic cập nhật sản phẩm (`PUT /api/products/{id}`).
- Không đụng tới logic xóa sản phẩm (`DELETE /api/products/{id}`).
- Giữ nguyên các modal ở trạng thái hiện tại hoặc mock callback nếu người dùng bấm vào.

---

## 4. Đánh giá Rủi ro & Giải pháp
| Rủi ro | Giải pháp |
|---|---|
| **Lộ giá vốn (BR-SEC-01)** | Ẩn hoàn toàn cột "Giá vốn" trên bảng khi vai trò người dùng không phải là `StoreOwner` hoặc `Admin`. Backend đã trả `costPrice = null` đối với role thu ngân. |
| **Gõ phím tìm kiếm bắn request liên tục** | Dùng kỹ thuật debounced query (300ms) trước khi truyền `searchTerm` vào params của React Query. |
| **Chuyển danh mục không reset trang** | Mỗi khi thay đổi `categoryId` hoặc `searchTerm`, tự động đặt `pageIndex = 1`. |
