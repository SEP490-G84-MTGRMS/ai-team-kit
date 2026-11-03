# Exploration: store-product-management

## 1. Khảo sát hiện trạng hệ thống MT-GRMS
- Đã có:
  - `SupplierProductManagementPage` (`/store-owner/suppliers/products`): Quản lý liên kết NCC - Sản phẩm (`SupplierProducts`).
  - `SupplierBranchManagementPage` (`/store-owner/suppliers/branches`): Quản lý liên kết NCC - Chi nhánh (`SupplierBranchAssignment`).
  - `OrderMatrixPage` (`/store-owner/purchase-orders/create-matrix`): Đặt hàng ma trận theo chi nhánh và NCC.
  - Danh sách Cửa hàng / Chi nhánh mẫu: `MOCK_BRANCHES` (`DC1` Kho tổng Tân Bình, `BR-01` CH Nguyễn Trãi, `BR-02` Kho Thủ Đức, `BR-03` CH Quận 7...).
  - Danh mục sản phẩm tổng (Master Products): `MASTER_PRODUCTS` gồm các ngành hàng `Fresh`, `Meat`, `Dairy`, `Snack`, `Beverage`...
- Còn thiếu:
  - Chưa có màn hình cho phép Store Owner cấu hình và theo dõi: **Cửa hàng A đang bán những sản phẩm nào? Giá bán lẻ tại cửa hàng A là bao nhiêu? Tồn kho thực tế và định mức an toàn tại Cửa hàng A là bao nhiêu?**

## 2. Các phương án thiết kế (Design Options)

### Phương án A: Tích hợp vào màn hình chi tiết Cửa hàng dạng Tab con
- Ưu điểm: Gom chung vào trang chi tiết cửa hàng.
- Nhược điểm: Khó quản lý khi chuỗi có nhiều cửa hàng; người dùng không thể so sánh hoặc xem tổng hợp sản phẩm của toàn chuỗi; trải nghiệm rời rạc với màn hình Sản phẩm NCC.

### Phương án B: Xây dựng màn hình độc lập chuyên biệt (Kế thừa từ `SupplierProductManagementPage`) [ĐƯỢC CHỌN]
- Ưu điểm:
  - Đồng bộ 100% với tư duy thiết kế của phân hệ Supplier: Nếu có `Sản phẩm theo NCC` thì việc có `Sản phẩm theo Cửa hàng` là hoàn toàn tương xứng và trực quan.
  - Cho phép chọn xem theo từng Cửa hàng cụ thể (kèm Store Context Card) hoặc xem "Tất cả cửa hàng".
  - Thanh bộ lọc 2 dòng rộng rãi, dễ dàng tìm kiếm và lọc theo nhiều chiều (Tên, SKU, Barcode, Ngành hàng, Trạng thái bán, Cảnh báo mức tồn).
  - Hỗ trợ gán sản phẩm hàng loạt từ danh mục tổng hoặc NCC vào cửa hàng.

## 3. Quyết định kiến trúc & Dữ liệu
- Cấu trúc dữ liệu sản phẩm tại cửa hàng (`StoreProductItem`):
  - `id`: string
  - `storeId`: string (mã cửa hàng, ví dụ 'BR-01')
  - `storeName`: string
  - `productId`: string
  - `productName`: string
  - `sku`: string
  - `barcode`: string
  - `category`: string
  - `unit`: string
  - `retailPrice`: number (giá bán lẻ niêm yết tại cửa hàng)
  - `costPrice`: number (giá vốn nhập snapshot)
  - `currentStock`: number (tồn kho hiện tại SOH)
  - `minStockLevel`: number (định mức tồn tối thiểu / an toàn)
  - `primarySupplierName`: string
  - `status`: 'Active' (Đang bán) | 'Inactive' (Tạm ngừng)
  - `shelfLocation`?: string
- Mối liên hệ:
  - Mỗi cửa hàng có thể kích hoạt hoặc hủy sản phẩm độc lập mà không ảnh hưởng tới cửa hàng khác.
