# Review: Skeptic Persona - store-product-management

## 1. Đánh giá tính khả thi & Rủi ro tiềm ẩn

### Rủi ro 1: Sản phẩm chưa được Nhà cung cấp phục vụ tới Chi nhánh đó
- **Vấn đề**: Nếu một sản phẩm thuộc Nhà cung cấp X, nhưng Nhà cung cấp X chưa được gán để giao hàng tới Chi nhánh Y (thiếu `SupplierBranchAssignment`), việc gán sản phẩm vào Chi nhánh Y có thể gây khó khăn khi tạo PO nhập hàng.
- **Giải pháp**: Trong modal gán sản phẩm, hệ thống ưu tiên hiển thị các sản phẩm thuộc những Nhà cung cấp đang phục vụ Chi nhánh đó, hoặc hiển thị cảnh báo nhẹ "NCC chưa có hợp đồng giao hàng tới chi nhánh này" để Store Owner lưu ý.

### Rủi ro 2: Thiết lập Giá bán lẻ thấp hơn Giá nhập (Lỗ vốn)
- **Vấn đề**: Người dùng có thể vô tình nhập giá bán lẻ thấp hơn giá vốn nhập từ NCC.
- **Giải pháp**: Trong modal `EditStoreProductModal`, hệ thống hiển thị thông tin tham khảo "Giá vốn nhập: X đ" và cảnh báo nếu giá bán lẻ < giá vốn.

### Rủi ro 3: Xung đột khi có hàng ngàn SKU
- **Vấn đề**: Nếu danh mục có số lượng SKU lớn, render bảng có thể bị chậm nếu không phân trang chuẩn.
- **Giải pháp**: Bắt buộc áp dụng Server-side / Client Pagination với kích thước trang 10/20/50 dòng, cố định tiêu đề cột và thanh cuộn body mượt mà.

## 2. Kết luận
Spec đã bao quát đầy đủ nghiệp vụ và sẵn sàng triển khai mã nguồn (Step 4 Apply).
