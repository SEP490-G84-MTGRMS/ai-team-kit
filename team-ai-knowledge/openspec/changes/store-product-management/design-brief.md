# Design Brief: store-product-management

## 1. Kiến trúc Thành phần Giao diện (Frontend Architecture)

### 1.1. Component Hierarchy
- **StoreProductManagementPage** (`src/features/product/pages/StoreProductManagementPage.tsx`): Container chính quản lý State lọc, phân trang, và nạp dữ liệu.
  - **Header Section**:
    - Tiêu đề: "Sản Phẩm Theo Cửa Hàng / Chi Nhánh" (kèm icon Store & Loader khi fetching).
    - Cụm nút thao tác (không icon trong text theo chuẩn):
      - `Danh sách Cửa hàng` (link tới danh sách cửa hàng).
      - `Sản phẩm theo NCC` (link tới `/store-owner/suppliers/products`).
      - `Xuất Excel` (xuất file `.xlsx` danh mục mặt hàng cửa hàng).
      - `Gán sản phẩm mới` (mở Modal gán mặt hàng vào cửa hàng).
  - **StoreContextCard** (`src/features/product/components/StoreProductContextCard.tsx`):
    - Hiển thị khi người dùng chọn lọc theo 1 Cửa hàng cụ thể.
    - Chứa: Tên cửa hàng, Mã cửa hàng, Địa chỉ, Quản lý cửa hàng, Dropdown chuyển nhanh chi nhánh khác.
    - 3 Thẻ thống kê nhanh:
      1. Tổng số mặt hàng đang kinh doanh (SKU).
      2. Tổng tồn kho thực tế (SOH).
      3. Mặt hàng cần nhập thêm (SOH < Min Stock).
  - **StoreProductFilterBar** (`src/features/product/components/StoreProductFilterBar.tsx`):
    - Bố cục 2 dòng rộng rãi chuẩn:
      - **Dòng 1**: Ô tìm kiếm Tên / SKU / Barcode (260px) · Dropdown Cửa hàng (200px) · Dropdown Ngành hàng (180px) · Nút Tìm kiếm & Đặt lại.
      - **Dòng 2**: Dropdown Trạng thái kinh doanh (Đang bán / Tạm ngừng) · Dropdown Cảnh báo tồn kho (Tất cả, Cần bổ sung, Tồn an toàn, Hết hàng) · Bộ đếm kết quả ("Hiển thị X / Y sản phẩm").
  - **StoreProductTable** (`src/features/product/components/StoreProductTable.tsx`):
    - Bảng dữ liệu chuẩn có thanh cuộn riêng, cố định header:
      - Cột 1: STT
      - Cột 2: Mã SKU & Barcode
      - Cột 3: Tên sản phẩm & ĐVT
      - Cột 4: Ngành hàng (Category Tag)
      - Cột 5: Giá bán lẻ tại CH (VNĐ)
      - Cột 6: Tồn kho thực tế (SOH) kèm chỉ báo cảnh báo đỏ nếu `SOH <= MinStock`
      - Cột 7: Mức tồn tối thiểu (Min Stock)
      - Cột 8: Nhà cung cấp chính
      - Cột 9: Trạng thái (Badge "Đang bán" xanh lá / "Tạm ngừng" xám)
      - Cột 10: Thao tác (Nút `Sửa`, Nút `Đổi trạng thái`, Nút `Gỡ khỏi CH`)
    - Chân bảng tích hợp phân trang chuẩn: Chọn số dòng/trang (10, 20, 50), Số trang, Nút Trang trước / Trang sau.
  - **AssignStoreProductModal** (`src/features/product/components/AssignStoreProductModal.tsx`):
    - Modal gán sản phẩm mới:
      - Chọn Cửa hàng nhận gán.
      - Bộ lọc tìm kiếm sản phẩm theo từ khóa và ngành hàng.
      - Danh sách sản phẩm từ Master Products (chưa gán vào cửa hàng) kèm checkbox chọn nhiều.
      - Nhập giá bán lẻ ban đầu và mức tồn an toàn cho các mặt hàng được chọn.
  - **EditStoreProductModal** (`src/features/product/components/EditStoreProductModal.tsx`):
    - Modal sửa giá bán lẻ và định mức tồn kho tối thiểu của sản phẩm tại cửa hàng đang chọn.

---

## 2. API Contract & Data Model

### Endpoints
- `GET /api/v1/stores/{storeId}/products`:
  - Query: `searchTerm`, `category`, `status`, `stockAlert`, `pageIndex`, `pageSize`
  - Response: `{ items: StoreProductItem[], total: number, pageIndex: number, pageSize: number }`
- `POST /api/v1/stores/{storeId}/products`:
  - Body: `{ storeId: string, productIds: string[], defaultRetailPrice?: number, defaultMinStock?: number }`
  - Response: `200 OK`
- `PUT /api/v1/stores/{storeId}/products/{productId}`:
  - Body: `{ retailPrice: number, minStockLevel: number, shelfLocation?: string }`
  - Response: `200 OK`
- `PATCH /api/v1/stores/{storeId}/products/{productId}/status`:
  - Body: `{ status: 'Active' | 'Inactive' }`
  - Response: `200 OK`
- `DELETE /api/v1/stores/{storeId}/products/{productId}`:
  - Response: `200 OK`
