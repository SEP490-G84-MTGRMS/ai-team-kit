# Proposal: supplier-product-management

## Vấn đề
Trong hệ thống bán lẻ và chuỗi siêu thị mini MT-GRMS:
1. **Thiếu liên kết nguồn cung hàng hoá**: Mặc dù hệ thống đã có Master Data cho Nhà cung cấp (`Suppliers`) và Danh mục sản phẩm (`Products`), nhưng chưa có module chuyên biệt quản lý quan hệ cung ứng N-N giữa hai thực thể này.
2. **Khó khăn khi lập đơn mua hàng (PO)**: Khi nhân viên kho hoặc quản lý cửa hàng tạo Đơn đặt hàng (Purchase Order), hệ thống chưa thể tự động nhận biết sản phẩm nào do nhà cung cấp nào phân phối, dẫn đến việc phải tra cứu thủ công ngoài hệ thống hoặc nhập liệu sai giá nhập.
3. **Mỗi nhà cung cấp có chính sách giá & điều kiện giao riêng**: Cùng một mặt hàng (ví dụ: Sữa tươi 1L) có thể được phân phối bởi nhiều nhà phân phối khác nhau với giá nhập sỉ (`Agreed Wholesale Price`), đơn vị tính giao hàng (`Delivery UoM`), và số lượng đặt hàng tối thiểu (`MOQ`) khác nhau.
4. **Màn hình chi tiết NCC trước đây bị quá tải**: Việc nhồi nhét danh sách sản phẩm vào tab nhỏ của `SupplierDetailPage` gây chậm tải và bất tiện trong thao tác tra cứu, cần một màn hình riêng biệt để Store Admin kiểm soát Master Data mapping này.

---

## Mục tiêu
1. **Xây dựng màn hình Quản lý Sản phẩm theo Nhà cung cấp (Supplier Product Management)**:
   - Dựa trên prototype `supplier_product_manage.html`, cung cấp giao diện trực quan cho phép chọn Nhà cung cấp, xem danh sách sản phẩm được cung ứng, và thực hiện gán mới/chỉnh sửa giá nhập.
2. **Chuẩn hoá chính sách mua hàng theo từng cặp Nhà cung cấp - Sản phẩm**:
   - Lưu trữ và quản lý giá nhập sỉ thỏa thuận (`Agreed Wholesale Price`).
   - Quản lý số lượng đặt hàng tối thiểu (`MOQ`).
   - Quản lý đơn vị tính giao hàng (`Delivery UoM`) và mã sản phẩm phía NCC (`SupplierProductCode`).
   - Thiết lập cờ Nhà cung cấp chính (`IsPrimarySupplier`) để hỗ trợ thuật toán tự động gợi ý đặt hàng khi tồn kho chạm ngưỡng Reorder Point.
3. **Quản lý vòng đời cung ứng linh hoạt**:
   - Cho phép tạm ngưng cung ứng (`Deactivate`) hoặc tái kích hoạt (`Reactivate`) một sản phẩm từ NCC cụ thể mà không xóa lịch sử giao dịch hay ảnh hưởng đến Master Product Catalog.
4. **Trải nghiệm người dùng chuẩn KiotViet Brand Blue**:
   - Thiết kế bằng React 19 + TypeScript, font `Be Vietnam Pro`, `JetBrains Mono` cho tiền tệ và barcode, Full Pill badges và bo góc 24px.

---

## Phạm vi (Scope)

### In scope
- **UI Màn hình Supplier Product Management**:
  - Thanh chọn ngữ cảnh Nhà cung cấp (`Supplier Selector`) hiển thị kèm trạng thái, điều khoản thanh toán, hạn mức tín dụng.
  - Form/Modal gán sản phẩm mới vào danh mục của NCC (chọn sản phẩm, chọn ĐVT giao hàng, nhập giá thỏa thuận, nhập MOQ, đặt làm NCC chính).
  - Bộ lọc đa tiêu chí: theo Ngành hàng (Category), Trạng thái liên kết (Active/Inactive), tìm kiếm nhanh theo Tên, SKU, Barcode.
  - Bảng dữ liệu sản phẩm đã gán: phân trang, hiển thị Barcode, Tên, ĐVT, Giá nhập sỉ, MOQ, Trạng thái.
  - Thao tác nhanh tại từng dòng: Modal chỉnh sửa giá nhập & MOQ, nút Bật/Tắt trạng thái liên kết.
- **Backend API & Data Model (.NET 8 Clean Architecture)**:
  - Bảng trung gian `SupplierProducts` với `TenantId` Global Query Filter và Unique Index `(TenantId, SupplierId, ProductId)`.
  - Các API CRUD:
    - `GET /api/v1/suppliers/{id}/products`: Danh sách sản phẩm của NCC kèm phân trang, lọc, tìm kiếm.
    - `POST /api/v1/suppliers/{id}/products`: Gán sản phẩm mới cho NCC.
    - `PUT /api/v1/suppliers/{id}/products/{productId}`: Cập nhật giá thỏa thuận, MOQ, Delivery UoM, Primary flag.
    - `PATCH /api/v1/suppliers/{id}/products/{productId}/status`: Bật/Tắt trạng thái Active/Inactive của mapping.
    - `GET /api/v1/products/{id}/suppliers`: Tra cứu ngược danh sách các NCC có cung cấp sản phẩm này (dùng khi lập PO).

### Out of scope
- Quản lý quy trình kiểm định chất lượng hàng hóa nhập kho (sẽ nằm ở capability `inventory/qa`).
- Tự động thay đổi giá bán lẻ khi giá nhập sỉ thay đổi (thuộc về pricing strategy).
- Nhập/Xuất hàng loạt danh mục sản phẩm từ file Excel (sẽ bổ sung ở phase import/export).

---

## Người dùng liên quan (User Roles)
- **Store Admin / Owner**: Quản lý Master Data danh mục mua hàng, phê duyệt giá nhập thỏa thuận và nhà cung cấp chính.
- **Purchasing / Inventory Staff (Nhân viên mua hàng & kho)**: Tra cứu nhanh NCC cung cấp sản phẩm để lập Đơn đặt hàng (Purchase Order - PO) chính xác theo giá và MOQ đã cam kết.
- **Accountant (Kế toán)**: Đối soát đơn giá nhập trên Phiếu nhập kho (GRN) với Giá thỏa thuận trong hợp đồng.

---

## Tiêu chí thành công (Success Criteria)
- [ ] Giao diện màn hình bám sát hành vi trong prototype `supplier_product_manage.html` nhưng được nâng cấp toàn diện theo chuẩn KiotViet UI (React 19, CSS chuẩn, bo góc 24px, pill badges).
- [ ] Cho phép gán sản phẩm vào Nhà cung cấp chỉ trong vòng 3 thao tác với validation đầy đủ (bắt buộc Giá > 0, MOQ >= 1).
- [ ] Chặn gán trùng sản phẩm cho cùng một NCC trong phạm vi một Tenant (Unique Constraint `SupplierId + ProductId`).
- [ ] Cập nhật giá thỏa thuận và MOQ tức thời, có thông báo phản hồi rõ ràng.
- [ ] Bật/tắt trạng thái liên kết Active/Inactive không gây lỗi toàn vẹn dữ liệu đơn hàng cũ.
- [ ] Tích hợp mượt mà vào luồng điều hướng của hệ thống MT-GRMS (có liên kết chuyển qua lại với `SupplierListPage` và `SupplierDetailPage`).
