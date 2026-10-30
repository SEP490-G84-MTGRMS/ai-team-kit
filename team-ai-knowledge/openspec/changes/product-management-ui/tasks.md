# Tasks: product-management-ui

> **Quy định kỹ thuật:** KHÔNG dùng custom hook. Theo đúng style hiện tại của codebase: sử dụng trực tiếp `useState`, `useEffect`, `useCallback` trong Page component để gọi `productApi`. Tích hợp component chung `TablePagination` của dự án (`src/components/common/TablePagination`).

---

## 1. Tiểu cụm đã hoàn thành (1.1, 1.2 & 1.3)
- [x] T1 — Chuẩn hóa `src/features/product/types/index.ts` chỉ chứa các interface cốt lõi cho danh sách: `ProductResponse`, `PagedResult<T>`, `ProductQueryFilter` khớp 100% với DTOs C#. (REQ-01)
- [x] T2 — Xây dựng `src/features/product/api/productApi.ts` với hàm `getProductsPaged(filter: ProductQueryFilter)` gọi `httpClient.get('/products', { params })` qua `httpClient` chuẩn của dự án, unwrap `ApiResponse<PagedResult<ProductResponse>>`. (REQ-01)
- [x] T3 — Cập nhật `ProductListPage.tsx` bằng `useState`, `useEffect`, `useCallback` gọi trực tiếp `productApi.getProductsPaged`: hiển thị dữ liệu thật từ Backend lên bảng và tích hợp component phân trang dùng chung `TablePagination` của dự án. (REQ-01)
- [x] T4 — Viết test kiểm thử `productApi.getProductsPaged` và logic phân trang để đảm bảo dữ liệu map đúng từ API Backend. (REQ-01)
- [x] T5 — Cập nhật phân quyền cột "Giá vốn" trên bảng danh sách sản phẩm trong `ProductListPage.tsx`:
  - Lấy vai trò người dùng từ `useAuthStore` (hỗ trợ chuyển đổi nhanh vai trò trên thanh toolbar để kiểm thử).
  - Nếu role là `StoreOwner` hoặc `Admin` / `Manager`: Hiển thị cột `Giá vốn` và giá trị tương ứng.
  - Nếu role là `Cashier` hoặc `Staff`: Ẩn hoàn toàn cột `Giá vốn` (cả header `<th>` lẫn ô `<td>`), không hiển thị giá vốn và biên độ lãi. (REQ-04, BR-SEC-01)
- [x] T6 — Bổ sung Unit test cho BR-SEC-01 trong `ProductListPage.test.tsx`:
  - Test case: Khi vai trò là `Cashier`, xác minh chữ "Giá vốn" không xuất hiện trong bảng table header và DOM.
  - Test case: Khi vai trò là `StoreOwner`, xác minh cột "Giá vốn" hiển thị đầy đủ. (REQ-04)

---

## 2. Các Tiểu cụm tiếp theo (Tiểu cụm 1.4, 1.5)

### Tiểu cụm 1.4: Tìm kiếm Đa tiêu chí Server-side Debounced 300ms (REQ-02)
- [ ] T7 — Tích hợp cơ chế Debounce 300ms cho ô tìm kiếm sản phẩm trong `ProductListPage.tsx` bằng `useEffect` (không dùng custom hook):
  - Khi người dùng nhập từ khóa tìm kiếm (Tên, SKU, Barcode), trì hoãn 300ms trước khi kích hoạt `fetchProducts`.
  - Tự động reset `pageIndex = 1` khi từ khóa tìm kiếm thay đổi.
  - Khi backend trả về kết quả rỗng (`totalCount === 0`), hiển thị Empty State "Không tìm thấy hàng hóa phù hợp". (REQ-02)
- [ ] T8 — Bổ sung Unit test cho tìm kiếm Debounced trong `ProductListPage.test.tsx`:
  - Test case: Gõ liên tục vào ô tìm kiếm thì chỉ kích hoạt gọi API 1 lần sau 300ms dừng gõ.
  - Test case: Kiểm tra reset `pageIndex = 1` khi thay đổi từ khóa.
  - Test case: Hiển thị giao diện Empty State khi không có sản phẩm nào khớp từ khóa. (REQ-02)

### Tiểu cụm 1.5: Lọc Danh mục Phẳng Server-side (REQ-03)
- [ ] T9 — Kết nối bộ chọn danh mục trong `CategorySidebar` với Server-side Filter trong `ProductListPage.tsx`:
  - Khi người dùng click chọn một nhóm hàng cụ thể, tự động reset `pageIndex = 1` và gọi `productApi.getProductsPaged({ categoryId, pageIndex: 1 })`.
  - Khi người dùng click nút "Bỏ chọn" hoặc chọn "Tất cả", gọi API lấy toàn bộ hàng hóa không kèm `categoryId`.
  - Đồng bộ số lượng sản phẩm `(productCount)` và trạng thái checkbox của danh mục. (REQ-03)
- [ ] T10 — Bổ sung Unit test cho lọc danh mục Server-side trong `ProductListPage.test.tsx`:
  - Test case: Click chọn 1 nhóm hàng -> gọi API với đúng `categoryId` và `pageIndex = 1`.
  - Test case: Bỏ chọn nhóm hàng -> gọi API tải lại toàn bộ danh mục không truyền `categoryId`. (REQ-03)

---

## 3. Lộ trình các Cụm tiếp theo (Backlog Phase 2)
- **Tiểu cụm 2.1 & 2.2:** Form tạo mới sản phẩm chuẩn và tự sinh mã SKU (`POST /api/products`).
- **Tiểu cụm 3.1 & 3.2:** Modal xem chi tiết 360° và danh sách Nhà cung cấp liên kết (`GET /api/products/{id}/suppliers`).
- **Tiểu cụm 4.1:** Cập nhật thông tin sản phẩm và khóa Base UOM (BR-PROD-01).
- **Tiểu cụm 4.2:** Xóa mềm an toàn chuyển trạng thái Discontinued (BR-DATA-01).
