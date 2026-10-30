# Specs: store-product-management

## 1. Yêu cầu Chi tiết (Detailed Requirements)

### Requirement: REQ-STOREPROD-01 Xem danh mục sản phẩm theo Cửa hàng / Chi nhánh
Hệ thống MUST hiển thị danh sách các sản phẩm đang được gán và kinh doanh tại Cửa hàng được chọn hoặc hiển thị danh mục của toàn chuỗi (khi chọn "Tất cả cửa hàng").
- Khi chọn một Cửa hàng cụ thể:
  - Hiển thị thẻ tóm tắt `StoreContextCard` với tên cửa hàng, địa chỉ, số lượng SKU đang bán, tổng tồn kho thực tế, và số sản phẩm cần nhập thêm.
- Bảng hiển thị đầy đủ thông tin: Mã SKU, Tên SP, ĐVT, Ngành hàng, Giá bán lẻ niêm yết tại CH, Tồn kho thực tế (SOH), Định mức tồn tối thiểu (Min Stock), NCC chính, Trạng thái (Đang bán / Tạm ngừng).

---

### Requirement: REQ-STOREPROD-02 Cảnh báo tồn kho thực tế so với định mức an toàn
Hệ thống MUST đối chiếu tồn kho thực tế (`currentStock`) với định mức an toàn (`minStockLevel`):
- Nếu `currentStock === 0`: Hiển thị nhãn cảnh báo đỏ đậm "Hết hàng".
- Nếu `0 < currentStock <= minStockLevel`: Hiển thị cảnh báo vàng cam "Cần bổ sung".
- Cho phép lọc nhanh theo tiêu chí "Cần bổ sung" trên thanh FilterBar để người quản lý cửa hàng lập kế hoạch nhập hàng.

---

### Requirement: REQ-STOREPROD-03 Gán sản phẩm mới vào Cửa hàng
Hệ thống MUST cung cấp Modal gán sản phẩm (`AssignStoreProductModal`):
- Cho phép người dùng tìm kiếm và chọn 1 hoặc nhiều sản phẩm từ Danh mục tổng (Master Products).
- Ngăn chặn chọn trùng các sản phẩm đã có mặt trong danh mục của Cửa hàng đó.
- Cho phép thiết lập nhanh Giá bán lẻ và Mức tồn tối thiểu cho các sản phẩm được chọn trước khi lưu.

---

### Requirement: REQ-STOREPROD-04 Điều chỉnh Giá bán lẻ và Định mức tồn kho tại Cửa hàng
Hệ thống MUST cho phép Store Owner cập nhật:
- Giá bán lẻ niêm yết tại chi nhánh (`retailPrice`).
- Mức tồn kho tối thiểu / an toàn (`minStockLevel`).
- Vị trí quầy kệ trưng bày (`shelfLocation`).

---

### Requirement: REQ-STOREPROD-05 Quản lý trạng thái kinh doanh và gỡ sản phẩm
- Hỗ trợ đổi trạng thái sản phẩm giữa `Active` (Đang kinh doanh) và `Inactive` (Tạm ngừng bán).
- Hỗ trợ gỡ / xóa sản phẩm khỏi danh mục của Cửa hàng với hộp thoại xác nhận an toàn.

---

### Requirement: REQ-STOREPROD-06 Bộ lọc 2 dòng rộng rãi & Nút thao tác không lồng icon trong text
- Thanh FilterBar MUST tuân thủ bố cục 2 dòng rộng rãi, thoải mái, có các ô input kích thước lớn, không nhồi nhét trên một dòng.
- Các button MUST sử dụng text thuần túy rõ nghĩa, không chèn các icon trang trí bên trong text của button.

---

## 2. Acceptance Checklist
- [ ] REQ-STOREPROD-01: Truy cập route `/store-owner/products` hiển thị danh mục sản phẩm theo cửa hàng.
- [ ] REQ-STOREPROD-02: Cảnh báo trực quan khi tồn kho dưới định mức an toàn.
- [ ] REQ-STOREPROD-03: Modal gán hỗ trợ chọn nhiều sản phẩm và thiết lập giá bán.
- [ ] REQ-STOREPROD-04: Cập nhật giá bán lẻ và định mức tồn thành công.
- [ ] REQ-STOREPROD-05: Đổi trạng thái và gỡ sản phẩm hoạt động mượt mà.
- [ ] REQ-STOREPROD-06: Bố cục filter 2 hàng rộng rãi, các button không chứa icon trong text.
