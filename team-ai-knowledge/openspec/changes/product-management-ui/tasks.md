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

## 2. Các Tiểu cụm tiếp theo

### Tiểu cụm 1.4: Tìm kiếm Đa tiêu chí Server-side Debounced 300ms (REQ-02)
- [x] T7 — Tích hợp cơ chế Debounce 300ms cho ô tìm kiếm sản phẩm trong `ProductListPage.tsx` bằng `useEffect`:
  - Khi người dùng nhập từ khóa tìm kiếm (Tên, SKU, Barcode), trì hoãn 300ms trước khi kích hoạt `fetchProducts`.
  - Tự động reset `pageIndex = 1` khi từ khóa tìm kiếm thay đổi.
  - Khi backend trả về kết quả rỗng (`totalCount === 0`), hiển thị Empty State "Không tìm thấy hàng hóa phù hợp". (REQ-02)
- [x] T8 — Bổ sung Unit test cho tìm kiếm Debounced trong `ProductListPage.test.tsx`:
  - Test case: Gõ liên tục vào ô tìm kiếm thì chỉ kích hoạt gọi API 1 lần sau 300ms dừng gõ.
  - Test case: Kiểm tra reset `pageIndex = 1` khi thay đổi từ khóa.
  - Test case: Hiển thị giao diện Empty State khi không có sản phẩm nào khớp từ khóa. (REQ-02)

### Tiểu cụm 1.5: Lọc Danh mục Phẳng Server-side (REQ-03)
- [x] T9 — Kết nối bộ chọn danh mục trong `CategorySidebar` với Server-side Filter trong `ProductListPage.tsx`:
  - Khi người dùng click chọn một nhóm hàng cụ thể, tự động reset `pageIndex = 1` và gọi `productApi.getProductsPaged({ categoryId, pageIndex: 1 })`.
  - Khi người dùng click nút "Bỏ chọn" hoặc chọn "Tất cả", gọi API lấy toàn bộ hàng hóa không kèm `categoryId`.
  - Đồng bộ số lượng sản phẩm `(productCount)` và trạng thái checkbox của danh mục. (REQ-03)
- [x] T10 — Bổ sung Unit test cho lọc danh mục Server-side trong `ProductListPage.test.tsx`:
  - Test case: Click chọn 1 nhóm hàng -> gọi API với đúng `categoryId` và `pageIndex = 1`.
  - Test case: Bỏ chọn nhóm hàng -> gọi API tải lại toàn bộ danh mục không truyền `categoryId`. (REQ-03)

### Tiểu cụm 1.6: Đơn vị tính & Bảng Hàng cùng loại & Dropdown ĐVT (REQ-05, REQ-06, REQ-07)
- [x] T11 — Bổ sung điều kiện cho nút `+ Thêm đơn vị` trong `ProductFormModal.tsx`:
  - Kiểm tra `baseUnit.trim() !== ''`.
  - Nếu rỗng: vô hiệu hóa nút (disabled style: opacity 0.6, cursor: not-allowed) và hiển thị tooltip/thông báo "(Cần nhập tên đơn vị cơ bản trước)". (REQ-05)
- [x] T12 — Xây dựng bảng `Hàng cùng loại` trong `ProductFormModal.tsx` khi có đơn vị quy đổi (`uomConversions.length > 0`):
  - Hiển thị theo mockup chuẩn: Đơn vị, Quy đổi, Mã hàng, Mã vạch, Giá vốn, Giá bán, Tồn kho, Nút xóa.
  - Hàng đơn vị cơ bản: Quy đổi cố định 1 (disabled bg xám), Mã hàng `Tự động`, Giá vốn/Giá bán/Tồn kho đồng bộ trực tiếp.
  - Hàng đơn vị quy đổi: Quy đổi nhập, Mã vạch nhập, Giá vốn & Tồn kho tự tính hiển thị nền xám, Giá bán nhập riêng, nút Xóa hàng.
  - Đồng bộ 2 chiều tức thời với phần Đơn vị tính. (REQ-06)
- [x] T13 — Cập nhật `ProductListPage.tsx` hiển thị dropdown chọn Đơn vị tính ở cột Tên hàng hóa:
  - Nếu sản phẩm có `uomConversions`: hiển thị dropdown `[Tên SP] - [đơn vị] ⌵`.
  - Mở popover menu cho phép chọn chuyển đổi đơn vị và cập nhật hiển thị Giá bán tương ứng theo đơn vị được chọn. (REQ-07)
- [x] T14 — Viết Unit test kiểm thử cho logic REQ-05, REQ-06 và REQ-07 trong `ProductListPage.test.tsx` và `ProductFormModal.test.tsx`.
