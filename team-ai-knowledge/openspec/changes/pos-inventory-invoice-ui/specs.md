# Đặc tả Yêu cầu Chi tiết (Delta Specs) — pos-inventory-invoice-ui

## 1. Yêu cầu Màn hình Tra cứu Tồn kho & Lô FEFO (FE-12)

### ADD: Tra cứu tồn kho đa chi nhánh theo thời gian thực
- **Mã yêu cầu**: `REQ-FE-INV-01`
- **Mô tả**: Nhân viên có thể tìm kiếm sản phẩm theo Tên, SKU hoặc Barcode. Hệ thống hiển thị số lượng tồn kho vật lý, số lượng đang giữ đơn (Hold) và số lượng khả dụng (Available = Vật lý - Hold) tại chi nhánh hiện tại cũng như các chi nhánh khác trong cùng chuỗi cửa hàng.
- **Kịch bản nghiệm thu**:
  - Gõ tên "Sữa chua Ba Vì" hoặc mã vạch "8934567890123", hệ thống gợi ý ngay kết quả phù hợp.
  - Chọn sản phẩm, bảng chi nhánh hiển thị chi tiết số lượng của Chi nhánh Trung tâm, Chi nhánh Hà Đông, Chi nhánh Cầu Giấy và Tổng kho Mê Linh.
  - Các chi nhánh có tồn khả dụng thấp hơn định mức tối thiểu hiển thị cảnh báo màu đỏ "Dưới định mức".

### ADD: Quản lý và đề xuất Lô hàng theo nguyên tắc FEFO (First Expired, First Out)
- **Mã yêu cầu**: `REQ-FE-INV-02`
- **Mô tả**: Khi chọn sản phẩm, bảng lô hàng liệt kê tất cả các lô còn tồn, tự động sắp xếp theo thứ tự Hạn sử dụng (EXP) tăng dần. Lô có hạn dùng gần nhất được đánh số ưu tiên `[ #1 ]`.
- **Kịch bản nghiệm thu**:
  - Lô hạn dưới 7 ngày: hiển thị huy hiệu đỏ "Khẩn cấp (< 7 ngày)".
  - Lô hạn 7-14 ngày: hiển thị huy hiệu cam "Cận date cao".
  - Lô hạn 15-30 ngày: hiển thị huy hiệu vàng "Ưu tiên xả hàng".
  - Lô hạn trên 30 ngày: hiển thị huy hiệu xanh lá "Hạn dùng an toàn".
  - Thu ngân có thể bấm "✔ Chọn Lô bán POS" để chọn chính xác lô này bán cho khách, hoặc bấm "🏷 Xả Hàng -20%" để kích hoạt chế độ xả hàng.

### ADD: Yêu cầu luân chuyển kho nội bộ
- **Mã yêu cầu**: `REQ-FE-INV-03`
- **Mô tả**: Cho phép nhân viên gửi đề xuất điều chuyển hàng hóa từ chi nhánh dồi dào hàng hoặc tổng kho về chi nhánh hiện tại thông qua form Modal chuyển kho.

---

## 2. Yêu cầu Màn hình Quản lý Hóa đơn & Đơn đặt trước (FE-14)

### ADD: Danh sách & Tra cứu lịch sử Hóa đơn bán lẻ
- **Mã yêu cầu**: `REQ-FE-ORD-01`
- **Mô tả**: Danh sách toàn bộ hóa đơn phát sinh tại quầy thu ngân trong ngày hoặc theo khoảng ngày lọc (Hôm nay, hôm qua, tuần này, tháng này).
- **Kịch bản nghiệm thu**:
  - 100% hóa đơn bán lẻ ghi nhận trạng thái Đã thanh toán (qua VietQR hoặc Tiền mặt) hoặc Đã hủy / Đổi trả. Không có nợ lẻ.
  - Hỗ trợ tìm kiếm theo Mã hóa đơn (`HD000041`) hoặc Tên / SĐT khách hàng.
  - Phân trang chuẩn bằng component dùng chung `TablePagination`.

### ADD: Xem chi tiết hóa đơn & Xem trước in bill K80
- **Mã yêu cầu**: `REQ-FE-ORD-02`
- **Mô tả**: Bấm vào hóa đơn mở xem chi tiết các dòng hàng (Tên, ĐVT, số lượng, đơn giá, giảm giá, thành tiền), thông tin thu ngân, mã giao dịch VietQR. Bấm "In lại bill" mở Modal xem trước hóa đơn in nhiệt K80 đúng chuẩn siêu thị bán lẻ.

### ADD: Quản lý Đơn đặt trước & Giữ kho (Pre-order)
- **Mã yêu cầu**: `REQ-FE-ORD-03`
- **Mô tả**: Quản lý các đơn đặt trước của khách hàng tại quầy (khách đặt trước sản phẩm số lượng lớn hoặc hàng tươi sống, đặt cọc trước và hẹn giờ lấy).
- **Ràng buộc đặc biệt**: KHÔNG có phần giao hàng tận nơi hay phí vận chuyển (Store pickup only).

---

## 3. Yêu cầu Điều hướng & Menu POS

### ADD: Tích hợp Menu Hamburger [ ≡ Thao tác ] tại PosHeader
- **Mã yêu cầu**: `REQ-FE-NAV-01`
- **Mô tả**: Thêm 2 mục liên kết trực tiếp vào menu thả xuống của nút `Thao tác` trên `PosHeader.tsx`:
  - `📦 Tra cứu tồn kho & Lô FEFO` -> điều hướng đến `/employee/inventory-lookup`
  - `📄 Quản lý hóa đơn & Đặt trước` -> điều hướng đến `/employee/orders`
- Khai báo routing đầy đủ trong `src/app/router.tsx` hỗ trợ cả tiền tố `/employee/` và `/pos/`.
