# Proposal: product-management-ui (Cụm 1: Product List & Category Filter)

## 1. Tóm tắt (Summary)
Đề xuất triển khai giao diện quản lý danh mục hàng hóa (Product Catalog Management) phía Frontend ([`MT_GRMS_FRONTEND`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND)) theo phương pháp **chia nhỏ thành từng cụm chức năng độc lập (Incremental Delivery)**, không gộp toàn bộ CRUD vào một lần triển khai.

Trọng tâm của change này là **Cụm 1: Hiển thị Danh sách Hàng hóa, Phân trang Server-side, Tìm kiếm Đa tiêu chí, Lọc Danh mục Phẳng và Phân quyền Bảo mật Giá vốn ([BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4759))**.

---

## 2. Lộ trình Phân chia các Cụm chức năng (Milestones)

| Cụm | Tên cụm chức năng | Phạm vi triển khai | API Backend tương ứng | Trạng thái |
|---|---|---|---|---|
| **Cụm 1** | **Danh sách & Bộ lọc (List & Filter)** | **Trang danh sách phân trang server-side, tìm kiếm debounced (300ms), lọc theo danh mục phẳng, phân quyền ẩn cột Giá vốn theo role BR-SEC-01.** | `GET /api/products`<br>`GET /api/categories` | 📌 **Đang thực hiện (Change này)** |
| **Cụm 2** | **Thêm mới Hàng hóa (Create Product)** | Form thêm sản phẩm chuẩn, tự sinh mã SKU/Barcode khi để trống, validate giá và tồn kho an toàn. | `POST /api/products` | ⏳ Cụm tiếp theo |
| **Cụm 3** | **Chi tiết 360° & Nhà cung cấp (Product Detail & Suppliers)** | Modal chi tiết sản phẩm, tab thông tin tổng quan và danh sách Nhà cung cấp cung ứng mặt hàng. | `GET /api/products/{id}`<br>`GET /api/products/{id}/suppliers` | ⏳ Cụm tiếp theo |
| **Cụm 4** | **Cập nhật & Xóa mềm (Update & Soft Delete)** | Chỉnh sửa thông tin, khóa ĐVT cơ sở khi đã phát sinh giao dịch (BR-PROD-01), xóa mềm chuyển trạng thái Discontinued (BR-DATA-01). | `PUT /api/products/{id}`<br>`DELETE /api/products/{id}` | ⏳ Cụm tiếp theo |

---

## 3. Mục tiêu Cụm 1 (Scope of Cluster 1)
- **In Scope:**
  - Chuẩn hóa kiểu dữ liệu TypeScript trong `src/features/product/types/index.ts` cho danh sách, bộ lọc và danh mục.
  - Xây dựng `productApi.ts` (`getProducts`) và `categoryApi.ts` (`getCategories`) sử dụng `httpClient` chuẩn.
  - Xây dựng TanStack Query hooks: `useProducts` (hỗ trợ phân trang, debounced search, category filter) và `useCategories`.
  - Cập nhật `CategorySidebar.tsx` hiển thị danh mục phẳng lấy từ API C#.
  - Cập nhật `ProductListPage.tsx` hiển thị bảng dữ liệu thật, điều khiển phân trang mượt mà.
  - Thực thi quy tắc **BR-SEC-01**: Ẩn cột "Giá vốn" và thông tin giá mua đối với nhân viên thu ngân (`Cashier`, `Staff`).
- **Out of Scope (để dành cho Cụm 2, 3, 4):**
  - Chưa mở modal tạo mới hoặc gọi API `POST /api/products`.
  - Chưa mở modal cập nhật hoặc gọi API `PUT /api/products/{id}`.
  - Chưa gọi API xóa `DELETE /api/products/{id}`.
  - Chưa mở modal combo phức tạp.

---

## 4. Giá trị mang lại
- Đảm bảo từng bước đi nhỏ, kiểm chứng được ngay kết quả thật trên màn hình và thông qua unit tests.
- Tránh rủi ro tích hợp lớn, không làm xáo trộn các component chưa cần sửa.
- Tuân thủ nguyên tắc Clean Code và Karpathy Coding: "Đơn giản trước", "Sửa đúng chỗ", "Xác minh bằng mục tiêu".
