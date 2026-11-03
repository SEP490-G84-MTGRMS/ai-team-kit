# Proposal: store-product-management

## 1. Vấn đề
Trong chuỗi siêu thị mini và cửa hàng tiện lợi MT-GRMS:
1. **Thiếu sự xác định danh mục sản phẩm kinh doanh tại từng cửa hàng**: Hiện tại hệ thống đã có màn hình Quản lý Sản phẩm theo Nhà cung cấp (`SupplierProductManagementPage` tại `/store-owner/suppliers/products`), nhưng chưa có màn hình xác định và quản lý xem **từng Cửa hàng / Chi nhánh cụ thể đang kinh doanh những sản phẩm nào**.
2. **Đặc thù danh mục và giá bán theo từng địa bàn cửa hàng**:
   - Các cửa hàng trong chuỗi có diện tích quầy kệ và đối tượng khách hàng khác nhau (ví dụ: Cửa hàng Quận 1 tập trung bánh kẹo nhập khẩu và đồ ăn liền; Cửa hàng Thủ Đức tập trung đồ gia dụng và thực phẩm tươi sống; Kho Tổng DC1 lưu trữ toàn bộ SKU).
   - Mỗi cửa hàng có thể có mức giá bán lẻ niêm yết, định mức tồn kho an toàn (Safety Stock / Min Stock) và vị trí trưng bày khác nhau.
3. **Cần chuẩn hóa trải nghiệm người dùng theo màn hình chuẩn**:
   - Người dùng yêu cầu triển khai màn hình này dựa trên cấu trúc, bố cục bộ lọc và phong cách của màn hình chuẩn `http://localhost:5173/store-owner/suppliers/products` để đảm bảo tính đồng bộ, trực quan và dễ sử dụng cho Store Owner.

---

## 2. Mục tiêu
1. **Xây dựng Màn hình Quản lý Sản phẩm theo Cửa hàng (Store Product Management)**:
   - Route chính: `/store-owner/products` (hoặc `/store-owner/stores/products`), tích hợp trực tiếp vào menu "Danh mục hàng hóa" trong thanh điều hướng cấp cao `AppTopNav`.
   - Kế thừa 100% phong cách thiết kế của màn hình `SupplierProductManagementPage`:
     - **Header**: Tiêu đề trang, trạng thái tải dữ liệu, nút liên kết nhanh (Danh sách Cửa hàng, Sản phẩm theo NCC), nút Xuất Excel và nút `[ + Gán sản phẩm vào Cửa hàng ]`.
     - **Store Context Card**: Thẻ thông tin tóm tắt cửa hàng đang chọn (Tên chi nhánh, Mã CH, Địa chỉ, Quản lý, Tổng số SKU kinh doanh, Tổng tồn kho thực tế SOH, Số sản phẩm cần nhập thêm).
     - **Filter Bar**: 2 dòng rộng rãi chuẩn: Tìm kiếm theo Tên SP / SKU / Barcode, Dropdown chọn Cửa hàng, Dropdown Ngành hàng, Dropdown Trạng thái kinh doanh (Đang bán / Tạm ngừng), Dropdown Cảnh báo tồn (Tất cả, Cần bổ sung, Tồn an toàn, Hết hàng), nút Tìm kiếm & Đặt lại.
     - **Data Table**: Bảng dữ liệu chuẩn với phân trang 10/20/50 dòng, hiển thị STT, Mã SKU & Barcode, Tên sản phẩm, Ngành hàng, ĐVT, Giá bán lẻ tại CH, Tồn kho thực tế (SOH), Mức tồn tối thiểu (Min Stock), Nhà cung cấp chính, Trạng thái và Cột Thao tác.
2. **Cung cấp Modal Gán Sản Phẩm vào Cửa Hàng (`AssignStoreProductModal`)**:
   - Cho phép chọn nhiều sản phẩm từ Danh mục tổng / NCC để đưa vào danh mục bán của Cửa hàng.
   - Hỗ trợ gán nhanh theo ngành hàng hoặc chọn từng sản phẩm kèm thiết lập Giá bán lẻ ban đầu và Tồn kho tối thiểu.
3. **Cung cấp Modal Điều Chỉnh Sản Phẩm tại Cửa Hàng (`EditStoreProductModal`)**:
   - Cho phép Store Owner cập nhật Giá bán lẻ tại chi nhánh, Định mức tồn an toàn / tối thiểu, và Ghi chú quầy kệ.
4. **Vòng đời Kinh Doanh Sản phẩm tại Cửa Hàng**:
   - Cho phép Tạm ngừng / Kích hoạt lại việc bán một sản phẩm tại chi nhánh.
   - Cho phép Gỡ / Xóa sản phẩm khỏi danh mục của chi nhánh khi không còn kinh doanh.

---

## 3. Phạm vi (Scope)

### In Scope:
- **Frontend**:
  - Trang `StoreProductManagementPage.tsx` đặt tại `src/features/product/pages/StoreProductManagementPage.tsx`.
  - Thành phần thẻ ngữ cảnh `StoreProductContextCard.tsx`.
  - Bộ lọc 2 dòng rộng rãi `StoreProductFilterBar.tsx`.
  - Bảng dữ liệu `StoreProductTable.tsx` tích hợp phân trang và hành động.
  - Modal gán mới `AssignStoreProductModal.tsx`.
  - Modal chỉnh sửa `EditStoreProductModal.tsx`.
  - Mock API service `storeProductApi.ts` với đầy đủ các thao tác CRUD.
  - Cấu hình route trong `router.tsx` và liên kết trong menu `AppTopNav.tsx`.
- **Backend (Đặc tả thiết kế)**:
  - Bảng quan hệ `StoreProducts` / `BranchProducts`: lưu `branch_id`, `product_id`, `retail_price`, `min_stock_level`, `max_stock_level`, `status`, `shelf_location`.
  - API `GET /api/v1/stores/{storeId}/products`: Truy vấn danh sách sản phẩm theo cửa hàng có phân trang và lọc đa tiêu chí.
  - API `POST /api/v1/stores/{storeId}/products`: Gán sản phẩm vào cửa hàng.
  - API `PUT /api/v1/stores/{storeId}/products/{productId}`: Cập nhật giá bán lẻ và định mức tồn kho.
  - API `PATCH /api/v1/stores/{storeId}/products/{productId}/status`: Đổi trạng thái kinh doanh.
  - API `DELETE /api/v1/stores/{storeId}/products/{productId}`: Gỡ sản phẩm khỏi cửa hàng.

### Out of Scope:
- Nghiệp vụ kiểm kê thực tế tại cửa hàng (thuộc phân hệ Inventory Audit / Stock Take).
- Nghiệp vụ quét mã vạch bán hàng POS tại quầy thu ngân (thuộc phân hệ POS Sales).

---

## 4. Người dùng liên quan
- **Store Owner (Chủ chuỗi / Quản lý cấp cao)**: Thiết lập danh mục sản phẩm kinh doanh, giá bán lẻ và mức tồn tối thiểu cho từng chi nhánh.
- **Branch Manager (Quản lý cửa hàng)**: Theo dõi danh mục hàng hóa tại chi nhánh của mình, phát hiện mặt hàng thiếu hụt tồn kho để lập đơn đặt hàng.
- **Branch Employee (Nhân viên bán hàng / Thu ngân)**: Bán các sản phẩm đã được kích hoạt trong danh mục của cửa hàng.

---

## 5. Tiêu chí thành công
- [ ] Giao diện Màn hình Quản lý Sản phẩm theo Cửa hàng hiển thị chuẩn tại route `/store-owner/products`, liên kết điều hướng mượt mà từ menu TopNav.
- [ ] Bố cục giao diện bám sát chuẩn `SupplierProductManagementPage` với Store Context Card, Filter Bar 2 dòng rộng rãi, và Bảng dữ liệu có phân trang.
- [ ] Hỗ trợ chuyển đổi linh hoạt giữa các Cửa hàng trong chuỗi (hoặc xem Tất cả cửa hàng).
- [ ] Modal Gán sản phẩm mới hỗ trợ tìm kiếm và chọn nhiều mặt hàng cùng lúc để gán vào Cửa hàng.
- [ ] Modal Chỉnh sửa cho phép cập nhật Giá bán lẻ và Mức tồn tối thiểu tại chi nhánh.
- [ ] Các hành động Đổi trạng thái (Bán/Tạm ngừng) và Gỡ sản phẩm hoạt động mượt mà với thông báo Toast trực quan.
- [ ] Dự án build thành công (`npm run build`) 100% không có lỗi TypeScript / linting.
