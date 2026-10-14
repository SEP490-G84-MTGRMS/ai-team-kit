# Bản tóm tắt thiết kế UI/UX (Design Brief) — pos-inventory-invoice-ui

## 1. Nguyên tắc Thẩm mỹ & Nhận diện
- **Màu sắc chủ đạo**: Deep Teal (`#0F766E` / `hsl(175, 75%, 25%)`), Teal Nhạt (`#F0FDFA`), Xanh lá thành công (`#15803d`), Cam cận date (`#EA580C`), Đỏ khẩn cấp (`#DC2626`).
- **Nền & Viền**: Nền Slate (`#F8FAFC`), Viền thẻ mỏng Slate-200 (`#E2E8F0`), Bóng đổ nhẹ (soft shadow `0 2px 8px rgba(0,0,0,0.04)`).
- **Typography**: `Be Vietnam Pro`, sans-serif. Tiêu đề đậm rõ ràng, số liệu tiền tệ hiển thị font số tabbed monospace hoặc đậm phân tách hàng nghìn chuẩn Việt Nam (`440.000 đ`).
- **Hình khối**: Bo góc pill/rounded cho nút bấm và tag trạng thái (`border-radius: 9999px` hoặc `8px-12px` cho card container).

## 2. Thiết kế Màn hình 1: Tra cứu Tồn kho & Lô Hạn dùng FEFO (`/employee/inventory-lookup`)
1. **Top Bar**:
   - Nút `[← Trở về POS]` và nút `[⚡ Bán hàng [F1]]`.
   - Tiêu đề màn hình: "Tra cứu Tồn kho Chi nhánh & Lô Hạn dùng FEFO".
   - Badge chi nhánh hiện tại: "Chi nhánh Trung tâm" & Thu ngân: "Nguyễn Bá Sơn".
   - Nút hành động nổi bật: `[ 🔄 Yêu cầu chuyển kho ]`.
2. **Thanh tìm kiếm thông minh**:
   - Ô nhập tìm kiếm Barcode / SKU / Tên sản phẩm với tính năng tự động gợi ý (Autocomplete Dropdown).
   - Bộ lọc nhóm ngành hàng: Sữa & Chế phẩm, Bánh kẹo & Bánh tươi, Nước giải khát, Thực phẩm tươi sống.
   - Nút quét Barcode trực quan.
3. **Thẻ tóm tắt sản phẩm đang chọn**:
   - Hiển thị tên sản phẩm, Barcode, Vị trí kệ trưng bày (Kệ mát A2 - Tầng 1), Tổng tồn kho toàn hệ thống.
   - Bảng giá phân cấp theo Quy cách / ĐVT: Giá Hộp (10.000 đ), Giá Lốc 4 hộp (38.000 đ), Giá Thùng 48 hộp (440.000 đ).
   - Nút CTA `[ ⚡ Đưa Vào Giỏ Hàng POS ]` đẩy sản phẩm và lô đã chọn về màn hình POS.
4. **Bảng 1: Tồn kho thời gian thực theo từng chi nhánh**:
   - Cột: Tên Chi nhánh / Kho, Địa chỉ, Tồn vật lý, Đang giữ đơn (Hold), Khả dụng bán, Định mức min, Trạng thái (Đủ hàng, Dưới định mức, Kho dồi dào), Hành động (Đang phục vụ / Yêu cầu chuyển kho).
5. **Bảng 2: Chi tiết các Lô hàng theo nguyên tắc FEFO**:
   - Cột: Ưu tiên FEFO (`[ #1 ]`, `[ #2 ]`), Mã Lô (Batch ID), Nhà cung cấp, Ngày sản xuất (MFG), Hạn sử dụng (EXP), Thời gian còn lại, Phân loại cảnh báo, Tồn khả dụng, Thao tác quầy (`✔ Chọn Lô bán POS`, `🏷 Xả hàng -20%`).
   - Phân loại màu sắc cảnh báo:
     - Đỏ `< 7 ngày`: Khẩn cấp
     - Cam `7 - 14 ngày`: Cận date cao
     - Vàng `15 - 30 ngày`: Ưu tiên xả
     - Xanh lá `> 30 ngày`: An toàn
6. **Modals tương tác**:
   - `ModalTransferStock`: Yêu cầu chuyển kho từ chi nhánh khác hoặc tổng kho.
   - `ModalClearanceDiscount`: Xác nhận gắn nhãn xả hàng giảm giá cho lô cận date.

## 3. Thiết kế Màn hình 2: Quản lý Hóa đơn & Đơn đặt trước (`/employee/orders`)
1. **Thống kê KPI nhanh**:
   - 4 Thẻ chỉ số:
     - Tổng số hóa đơn trong ca/ngày: `1.428` hóa đơn.
     - Tổng doanh thu bán lẻ: `1.090.000 đ`.
     - Tỷ lệ thanh toán VietQR (MBBank) vs Tiền mặt: `65%` QR / `35%` Cash.
     - Đơn đặt trước giữ kho: `2 đơn` đang chờ khách nhận.
2. **Tab điều hướng chế độ xem**:
   - Tab 1: `📄 Danh Sách Hóa Đơn Bán Hàng`
   - Tab 2: `📦 Đơn Đặt Trước & Giữ Kho (Pre-order)`
3. **Bộ lọc đa chiều (Filter Sidebar / Filter Bar)**:
   - Khoảng thời gian: Hôm nay, Hôm qua, Tuần này, Tháng này, Tùy chọn ngày.
   - Trạng thái: Đã thanh toán 100%, Đã hủy / Đổi trả.
   - Phương thức thanh toán: Tất cả, VietQR, Tiền mặt.
   - Ô tìm kiếm mã hóa đơn hoặc số điện thoại khách hàng.
4. **Bảng Hóa đơn bán lẻ**:
   - Cột: Checkbox, Mã hóa đơn (`HD000041`), Giờ lập, Khách hàng, Tổng tiền hàng, Giảm giá, Khách đã trả, Phương thức, Trạng thái, Thao tác.
   - Phân trang: Tái sử dụng `TablePagination` từ `src/components/common`.
   - Xem chi tiết: Khi click dòng hoặc nút "Chi tiết", mở Accordion hoặc Drawer hiển thị danh sách mặt hàng, ĐVT, số lượng, đơn giá, thành tiền, thông tin thanh toán VietQR/Cash.
   - Nút `[ In lại bill ]`: Mở preview Modal hóa đơn in nhiệt khổ K80 chuẩn siêu thị.
5. **Bảng Đơn đặt trước (Pre-order)**:
   - Cột: Mã đơn đặt trước, Tên khách hàng, Số điện thoại, Tiền cọc (Deposit), Thời gian hẹn nhận, Lô hàng giữ kho, Trạng thái chuẩn bị, Nút `[ Hoàn tất xuất đơn tại quầy ]`.
   - Tuyệt đối không chứa trường giao hàng hoặc phí vận chuyển (mua và nhận tại quầy).
