# Codebase Review: product-management-ui

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa | Ghi chú |
|---|---|---|---|
| **REQ-01** (Danh sách & Ẩn giá vốn) | `src/features/product/pages/ProductListPage.tsx` | Chuyển từ `mockProducts` sang `useProducts` hook, thêm phân trang server-side, debounced search, ẩn cột Giá vốn theo role (BR-SEC-01). | Đảm bảo tính responsive. |
| **REQ-02** (Tạo mới sản phẩm) | `src/features/product/components/ProductFormModal.tsx` | Map form inputs sang payload `ProductCreateRequest`, gọi `createProduct` mutation. | Tự sinh mã nếu để trống. |
| **REQ-03** (Chi tiết & NCC) | `src/features/product/components/ProductDetailModal.tsx` | Kết nối `useProductDetail` & hiển thị bảng NCC cung ứng qua `GET /api/products/{id}/suppliers`. | Tái sử dụng mapping từ `supplierProductApi`. |
| **REQ-04** (Cập nhật sản phẩm) | `src/features/product/components/ProductFormModal.tsx` | Hỗ trợ edit mode, gửi `ProductUpdateRequest` tới `PUT /api/products/{id}`. | Khóa BaseUnit khi có giao dịch. |
| **REQ-05** (Xóa mềm sản phẩm) | `src/features/product/pages/ProductListPage.tsx` | Tích hợp modal confirm và mutation gọi `DELETE /api/products/{id}`. | Chuyển status = Discontinued. |
| **REQ-06** (Tích hợp danh mục) | `src/features/product/components/CategorySidebar.tsx` | Lấy dữ liệu từ `useCategories` (`/api/categories`), lọc theo CategoryId. | Mô hình danh mục phẳng. |

## Tái sử dụng được
- `src/api/httpClient.ts`: Axios client đã cấu hình sẵn base URL và Bearer token.
- `src/stores/authStore.ts` hoặc Auth Context: Lấy thông tin user hiện tại và role để phân quyền giá vốn.
- `lucide-react`: Hệ thống icon sẵn có trong project.

## Xung đột / Rủi ro
- [THẤP] File `mockData.ts` hiện tại trong `src/features/product/services/` có thể được giữ lại làm fallback cho unit tests hoặc dọn dẹp sau khi API hoạt động ổn định.

## Kết luận: Khả thi
