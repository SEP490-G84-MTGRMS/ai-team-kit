# Đề xuất chức năng: Tra cứu Tồn kho & Lô FEFO, Quản lý Hóa đơn & Đơn đặt trước (POS Employee)

## 1. Vấn đề thực tế (Problem Statement)
- Nhân viên thu ngân và bán hàng tại quầy POS (`/employee/`) cần tra cứu tức thì tình trạng tồn kho hàng hóa giữa các chi nhánh khi khách hỏi mua số lượng lớn hoặc mặt hàng hết trên kệ.
- Hàng thực phẩm tươi sống, sữa, bánh kẹo có hạn sử dụng ngắn bắt buộc phải tuân thủ nghiêm ngặt nguyên tắc **FEFO (First Expired, First Out - Hàng hết hạn trước xuất bán trước)** để tránh hao hụt, hủy date. Thu ngân cần nhìn thấy thứ tự ưu tiên lô xuất bán và có thể kích hoạt chính sách xả hàng/giảm giá lô cận date.
- Thu ngân và quản lý cửa hàng cần tra cứu lịch sử hóa đơn bán lẻ tại quầy, in lại hóa đơn (Thermal Receipt K80), quản lý đơn đặt trước (Pre-order) giữ tồn kho, và xử lý hủy/đổi trả hóa đơn trực tiếp từ giao diện quầy thu ngân.
- Hiện tại, thanh menu 3 gạch `[ ≡ Thao tác ]` trên Header bán hàng chưa có lối tắt điều hướng trực tiếp sang 2 màn hình nghiệp vụ này.

## 2. Mục tiêu (Objectives)
- Xây dựng 2 màn hình nghiệp vụ chuẩn cho nhân viên tại `/employee/`:
  1. **Tra cứu Tồn kho & Lô hạn dùng FEFO** (`/employee/inventory-lookup`): Tra cứu đa điểm bán, xem tồn vật lý/tồn giữ/khả dụng, bảng chi tiết các lô hàng sắp xếp theo hạn dùng FEFO kèm cảnh báo màu (Khẩn cấp, Cận date, An toàn).
  2. **Quản lý Hóa đơn & Đơn đặt trước** (`/employee/orders`): Quản lý toàn bộ hóa đơn bán lẻ và đơn đặt trước, xem chi tiết giỏ hàng hóa đơn, in lại bill K80, xử lý đổi trả/hủy hóa đơn.
- Tích hợp 2 đường dẫn điều hướng trực quan vào Menu Hamburger `[ ≡ Thao tác ]` của `PosHeader.tsx`.
- Đồng bộ 100% ngôn ngữ thiết kế: Deep Teal `#0F766E`, font Be Vietnam Pro, góc bo pill, tái sử dụng `TablePagination` và `AdminToast`.
- Toàn bộ Model tổ chức thành các `class ...DTO` có constructor và kiểu dữ liệu tương đương C# / .NET backend.

## 3. Phạm vi (Scope)
### In Scope:
- **Màn hình Tra cứu Tồn kho & Lô FEFO** (`/employee/inventory-lookup`):
  - Thanh tìm kiếm nhanh SKU, Barcode, Tên sản phẩm kèm gợi ý tự động (Autocomplete dropdown).
  - Banner thông tin sản phẩm đang chọn: Quy cách ĐVT (lẻ/lốc/thùng), giá theo ĐVT, vị trí quầy kệ, tổng tồn hệ thống, nút "⚡ Đưa vào giỏ hàng POS".
  - Bảng 1 - Tồn kho chi nhánh: Tồn vật lý, Đang giữ đơn (Hold), Khả dụng bán (Available), Định mức tối thiểu, Tình trạng kho.
  - Bảng 2 - Quản lý lô FEFO: Thứ tự ưu tiên FEFO (#1, #2, #3...), Mã lô, Ngày SX (MFG), Hạn dùng (EXP), Thời gian còn lại (Còn X ngày), Badge mức độ cảnh báo hạn dùng (Khẩn cấp <7 ngày, Cận date 7-14 ngày, Ưu tiên xả 15-30 ngày, An toàn >30 ngày), Nút chọn lô bán POS và Nút xả hàng giảm giá.
  - Modal chuyển kho và Modal áp dụng xả hàng lô cận date.
- **Màn hình Quản lý Hóa đơn & Đặt trước** (`/employee/orders`):
  - 4 Thẻ KPI: Doanh thu hóa đơn, Tổng số đơn, Tỷ lệ thanh toán VietQR / Tiền mặt, Đơn đặt trước đang giữ kho.
  - 2 Tab chuyển đổi: "Danh sách Hóa đơn bán lẻ" và "Đơn đặt trước & Giữ kho (Pre-order)".
  - Bộ lọc đa năng: Thời gian (Hôm nay, hôm qua, tuần này, tháng này, tùy chọn ngày), Trạng thái thanh toán, Phương thức thanh toán (Tiền mặt, VietQR), Thu ngân lập đơn.
  - Bảng hóa đơn: Mã HD, Thời gian, Thu ngân, Khách hàng (Tên + SĐT), Phương thức thanh toán, Tổng tiền, Giảm giá, Thực thu, Trạng thái.
  - Modal xem chi tiết hóa đơn & Xem trước bản in nhiệt K80 (Thermal receipt preview), hỗ trợ in lại và hủy đơn.
  - Modal chi tiết đơn đặt trước (Pre-order).
- **Tích hợp Menu Hamburger POS**:
  - Cập nhật dropdown `[ ≡ Thao tác ]` trong `PosHeader.tsx` để nhân viên click chuyển trang tức thì.
  - Đăng ký routing chuẩn trong `router.tsx` dưới nhánh `/employee/` và `/pos/`.
- **Dữ liệu & DTOs**:
  - Khởi tạo `src/features/inventory/` hoặc mở rộng `src/features/pos/` với các Class DTO chuẩn: `InventoryProductDTO`, `BranchStockDTO`, `FefoBatchDTO`, `InvoiceDTO`, `PreOrderDTO`.

### Out of Scope:
- Kết nối máy in nhiệt vật lý qua cổng COM/ESC-POS (mô phỏng xem trước bản in K80 và in qua trình duyệt `window.print`).
- Chưa gọi API server thật (sử dụng Local Mock Data thời gian thực, lưu trữ qua State / LocalStorage).

## 4. Người dùng & Vai trò liên quan (User Roles)
- **Thu ngân / Nhân viên bán hàng (Cashier / Employee)**: Tra cứu nhanh tồn kho chi nhánh khi khách hỏi, xem thứ tự xuất hàng FEFO để lấy hàng cận date bán trước, tra cứu hóa đơn cũ khi khách quay lại đổi trả hoặc xin in lại hóa đơn.
- **Quản lý cửa hàng (Store Owner / Branch Manager)**: Theo dõi danh sách hóa đơn theo ca/ngày, kiểm soát đơn đặt trước giữ hàng và duyệt chuyển kho.

## 5. Tiêu chí thành công (Success Criteria)
- Giao diện mở mượt mà từ nút `[ ≡ Thao tác ]` trên màn hình POS.
- Bộ lọc và tìm kiếm Barcode/SKU phản hồi tức thì (< 100ms).
- Phân trang dùng chung `TablePagination` hiển thị chuẩn xác, không tạo linh kiện phân trang riêng lẻ.
- `npm run build` thành công 100%, 0 lỗi TypeScript, 0 lỗi lint.
- Tuyệt đối không commit hay push bất kỳ code nào lên Git của repo `MT_GRMS_FRONTEND`.
