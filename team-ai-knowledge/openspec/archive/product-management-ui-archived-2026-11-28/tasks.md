# Tasks: product-management-ui

> **Quy định kỹ thuật:** KHÔNG dùng custom hook. Theo đúng style hiện tại của codebase: sử dụng trực tiếp `useState`, `useEffect`, `useCallback` trong Page component để gọi `productApi`. Tích hợp component chung `TablePagination` của dự án (`src/components/common/TablePagination`).

---

## 1. Tiểu cụm đã hoàn thành (1.1 -> 1.7)
- [x] T1 — Chuẩn hóa `src/features/product/types/index.ts` chỉ chứa các interface cốt lõi cho danh sách: `ProductResponse`, `PagedResult<T>`, `ProductQueryFilter` khớp 100% với DTOs C#. (REQ-01)
- [x] T2 — Xây dựng `src/features/product/api/productApi.ts` với hàm `getProductsPaged(filter: ProductQueryFilter)` gọi `httpClient.get('/products', { params })` qua `httpClient` chuẩn của dự án, unwrap `ApiResponse<PagedResult<ProductResponse>>`. (REQ-01)
- [x] T3 — Cập nhật `ProductListPage.tsx` bằng `useState`, `useEffect`, `useCallback` gọi trực tiếp `productApi.getProductsPaged`: hiển thị dữ liệu thật từ Backend lên bảng và tích hợp component phân trang dùng chung `TablePagination` của dự án. (REQ-01)
- [x] T4 — Viết test kiểm thử `productApi.getProductsPaged` và logic phân trang để đảm bảo dữ liệu map đúng từ API Backend. (REQ-01)
- [x] T5 — Cập nhật phân quyền cột "Giá vốn" trên bảng danh sách sản phẩm trong `ProductListPage.tsx` theo BR-SEC-01. (REQ-04)
- [x] T6 — Bổ sung Unit test cho BR-SEC-01 trong `ProductListPage.test.tsx`. (REQ-04)
- [x] T7 — Tích hợp cơ chế Debounce 300ms cho ô tìm kiếm sản phẩm trong `ProductListPage.tsx`. (REQ-02)
- [x] T8 — Bổ sung Unit test cho tìm kiếm Debounced trong `ProductListPage.test.tsx`. (REQ-02)
- [x] T9 — Kết nối bộ chọn danh mục trong `CategorySidebar` với Server-side Filter trong `ProductListPage.tsx`. (REQ-03)
- [x] T10 — Bổ sung Unit test cho lọc danh mục Server-side trong `ProductListPage.test.tsx`. (REQ-03)
- [x] T11 — Bổ sung điều kiện cho nút `+ Thêm đơn vị` trong `ProductFormModal.tsx` yêu cầu nhập `baseUnit` trước. (REQ-05)
- [x] T12 — Xây dựng bảng `Hàng cùng loại` trong `ProductFormModal.tsx` khi có đơn vị quy đổi (`uomConversions.length > 0`). (REQ-06)
- [x] T13 — Cập nhật `ProductListPage.tsx` hiển thị dropdown chọn Đơn vị tính ở cột Tên hàng hóa. (REQ-07)
- [x] T14 — Viết Unit test kiểm thử cho logic REQ-05, REQ-06 và REQ-07 trong `ProductListPage.test.tsx` và `ProductFormModal.test.tsx`.
- [x] T15 — Triển khai state `selectedUnitName` và derived selector trong `ProductDetailModal.tsx`. (REQ-08)
- [x] T16 — Xây dựng thanh Unit Switcher (Segmented Pills) trên Header và tương tác click chọn dòng trong Bảng "Đơn vị tính & Quy đổi giá" của `ProductDetailModal.tsx`. (REQ-08)
- [x] T17 — Bổ sung cơ chế tự động nạp đơn vị tính qua `productApi.getProductUnits(product.id)` trong `ProductDetailModal.tsx`. (REQ-08)
- [x] T18 — Viết Unit test kiểm thử cho REQ-08 trong `ProductDetailModal.test.tsx`. (REQ-08)

---

## 2. Tiểu cụm 1.8: Cập nhật Hàng hóa & Đồng bộ Đơn vị tính (REQ-09)
- [x] T19 — Bổ sung hàm `updateProductUnit` và types `ProductUnitUpdatePayload` vào `src/features/product/api/productApi.ts` gọi `PUT /api/v1/product-units/{id}`. (REQ-09)
- [x] T20 — Cập nhật `ProductFormModal.tsx` ở chế độ chỉnh sửa: khóa `productCode`, nạp đơn vị quy đổi, theo dõi `deletedUnitIds`. (REQ-09)
- [x] T21 — Cập nhật `handleSaveProduct` trong `ProductListPage.tsx` điều phối lưu chỉnh sửa sản phẩm và đồng bộ thêm/sửa/xóa đơn vị tính. (REQ-09)
- [x] T22 — Viết Unit test kiểm thử cho REQ-09 trong `ProductFormModal.test.tsx` và `ProductListPage.test.tsx`. (REQ-09)

---

## 3. Tiểu cụm 1.9: Cải tiến UI/UX Form Thêm/Sửa Hàng Hóa (REQ-10, REQ-11)
- [x] T23 — Tăng kích thước modal `ProductFormModal.tsx` lên `maxWidth: 1160px, width: '96vw'` và bổ sung Lightbox Modal phóng to ảnh sản phẩm. (REQ-10)
- [x] T24 — Chuẩn hóa tiếng Việt bỏ dấu trong bộ lọc tìm kiếm nhóm hàng (`removeVietnameseTones`) và xử lý số 0 ở đầu các input số. (REQ-10)
- [x] T25 — Xóa giá trị mặc định `"chai"` của đơn vị cơ bản, tự động tính giá bán đơn vị quy đổi `price = conversionRate * sellingPrice`. (REQ-10)
- [x] T26 — Thay thế banner cảnh báo lỗi ở đầu form bằng Validation Alert Popup Modal và tinh gọn các trường tồn kho khỏi Master Product Form. (REQ-10, REQ-11)

---

## 4. Tiểu cụm 1.10: Trang Quản lý Nhóm hàng, Rút gọn Tên dài & Validate Trực tiếp (REQ-12, REQ-13, REQ-14)
- [x] T27 — Rút gọn hiển thị tên nhóm hàng dài bằng dấu `...` (`textOverflow: 'ellipsis'`) kèm `title` tooltip đầy đủ trong `CategorySidebar.tsx` và cột Nhóm hàng của `ProductListPage.tsx`. (REQ-12)
- [x] T28 — Xây dựng trang `src/features/product/pages/CategoryListPage.tsx`, đăng ký route `/products/categories` tại `src/app/router.tsx` và thêm menu `"Nhóm hàng"` trên `AppTopNav.tsx`. (REQ-13)
- [x] T29 — Bổ sung hiển thị validate trực tiếp ngay khi đang nhập input (Real-time Inline Validation + bộ đếm ký tự + viền đỏ) trên `CategoryModal.tsx` (`name`, `code`, `description`) và `ProductFormModal.tsx` (`productCode`, `barcode`, `productName`, `categoryId`, `costPrice`, `sellingPrice`, `baseUnit`, các dòng `uomConversions`, `description`, `internalNote`). (REQ-14)
- [x] T30 — Chạy `npm --prefix MT_GRMS_FRONTEND run build` (`tsc -b && vite build`) kiểm chứng 100% không lỗi TypeScript và bundle thành công. (REQ-12, REQ-13, REQ-14)

---

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: product-images-and-unit-codes -->
# Tasks: product-images-and-unit-codes
- [x] T1 — Bổ sung `List<string> ImageUrls` vào `Product.cs` và đảm bảo `ProductUnit.cs` không lưu mã hàng.
- [x] T2 — Cập nhật `ProductConfiguration.cs` (`text[]`) và `ProductUnitConfiguration.cs`.
- [x] T3 — Cập nhật `ProductDtos.cs` và `ProductUnitDtos.cs`.
- [x] T4 — Cập nhật `CatalogService.cs` xử lý lưu trữ `ImageUrls`.
- [x] T5 — Cập nhật `ProductUnitService.cs`.
- [x] T6 — Cập nhật Controllers và DTO mappings.
- [x] T7 — Cập nhật types và API client Frontend.
- [x] T8 — Nâng cấp `ProductFormModal.tsx` và `ProductListPage.tsx` hỗ trợ upload nhiều ảnh và chọn ảnh đại diện.
- [x] T9 — Nâng cấp `ProductDetailModal.tsx` cố định kích thước và hiển thị Gallery nhiều ảnh.
- [x] T10 — Viết Backend Unit tests trong `MT_GRMS.UnitTests`.
- [x] T11 — Viết Frontend Unit tests trong `ProductDetailModal.test.tsx` và `ProductFormModal.test.tsx`.
