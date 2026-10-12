# Proposal: product-management-ui

## Vấn đề
Hiện tại trong hệ thống MT-GRMS Frontend, trang Dashboard quản trị chưa có giao diện quản lý danh mục sản phẩm. Chủ tiệm và nhân viên chưa thể xem, tra cứu thông tin sản phẩm (mã vạch/SKU, tên, danh mục, đơn vị tính, giá bán) cũng như thao tác thêm mới hay cập nhật thông tin hàng hóa trực tiếp trên nền tảng web.

## Mục tiêu
- Xây dựng giao diện Quản lý Sản phẩm (Product Management UI) hoàn chỉnh trong khu vực quản trị (`MasterLayout` tại `/dashboard/products`).
- Cung cấp trải nghiệm trực quan, dễ thao tác cho chủ tiệm tạp hóa: tra cứu nhanh danh mục, lọc theo trạng thái/ngành hàng, quản lý thông tin giá và đơn vị tính.
- Chuẩn bị sẵn Data Service / React Query hook kết nối với API Backend .NET 8 theo kiến trúc Clean Architecture.

## Phạm vi
### In scope
- **Màn hình Danh sách sản phẩm (`ProductListPage`)**: Bảng dữ liệu hiển thị thông tin sản phẩm (Ảnh đại diện, Mã SKU/Barcode, Tên hàng hóa, Danh mục, Đơn vị tính, Giá bán, Trạng thái kinh doanh).
- **Bộ công cụ lọc & tìm kiếm**: Tìm nhanh theo từ khóa/mã vạch, lọc theo danh mục hàng hóa, lọc theo trạng thái (Đang kinh doanh / Ngừng bán).
- **Form/Modal Tạo mới & Cập nhật sản phẩm (`ProductFormModal`)**: Nhập liệu thông tin cơ bản, chọn đơn vị tính, phân loại danh mục, cài đặt giá bán lẻ, upload hoặc nhập link ảnh sản phẩm với validation đầy đủ.
- **Drawer/Modal Xem chi tiết sản phẩm (`ProductDetailModal`)**: Xem tổng quan thông tin, lịch sử cập nhật hoặc mô tả chi tiết.
- **Định tuyến & Menu điều hướng**: Tích hợp route `/dashboard/products` vào `MasterLayout` và liên kết trong Sidebar.

### Out of scope
- Quản lý lô hàng (Batch) và theo dõi hạn sử dụng theo nguyên tắc FEFO (thuộc capability riêng `inventory-batch`).
- Thao tác kiểm kê, điều chuyển kho giữa các chi nhánh hoặc lập đơn nhập hàng PO với nhà cung cấp (thuộc capability `inventory-transfer` và `supplier-po`).
- Màn hình thanh toán và trừ kho tức thời tại quầy POS (thuộc capability `pos-checkout`).

## Người dùng liên quan
- **Chủ cửa hàng (Store Owner) / Quản lý (Store Manager)**: Toàn quyền thêm mới, cập nhật giá, thông tin hàng hóa, ngừng kinh doanh sản phẩm.
- **Nhân viên thu ngân / Bán hàng (Cashier / Staff)**: Quyền xem danh sách, tra cứu mã vạch và giá niêm yết khi cần.

## Tiêu chí thành công
- [ ] Người dùng truy cập được module qua menu Sidebar của Dashboard hoặc URL `/dashboard/products`.
- [ ] Bảng danh sách sản phẩm hiển thị đầy đủ thông tin, hỗ trợ phân trang và trạng thái hiển thị rõ ràng.
- [ ] Tìm kiếm tức thì theo tên/mã vạch và bộ lọc danh mục phản hồi nhanh, chính xác.
- [ ] Modal thêm mới và chỉnh sửa sản phẩm hoạt động mượt mà, validate chặt chẽ (tên không để trống, giá bán >= 0).
- [ ] Giao diện responsive, tuân thủ UI guidelines hiện đại của hệ thống MT-GRMS (Tailwind CSS, phong cách tinh gọn, dễ dùng cho chủ tiệm).
