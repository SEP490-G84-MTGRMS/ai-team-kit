# Proposal: Sửa lỗi Modal Thu Nợ, Tìm kiếm Khách hàng POS & Chuẩn hóa Hóa đơn Bán lẻ

## 1. Vấn đề phát sinh
1. **Lỗi HTML5 Validation tại Modal Thu Nợ (`CollectDebtModal`)**:
   - Khi mở hóa đơn đã thanh toán hoặc nợ còn lại bằng 0 đ, thẻ `<input type="number">` có `min={1000}` và `max={0}`, trình duyệt lập tức chặn và bật tooltip cảnh báo: *"Minimum value (1000) must be less than the maximum value (0)."*. Người dùng không thể thao tác tiếp.
   - Tại trang Quản lý hóa đơn (`InvoiceManagementPage`), các hóa đơn mua nợ ban đầu nhưng đã thanh toán đủ (`debtAmount = 0`, `paidDebtAmount = total`) vẫn hiển thị trạng thái *"Còn nợ 0 đ"* và nút *"Thu nợ"* thay vì *"Hoàn thành / Đã tất toán nợ"*.
2. **Tìm kiếm khách hàng ở màn hình Thu ngân POS (`PosPaymentPanel`)**:
   - Trường tìm kiếm giới hạn chỉ nhập số điện thoại (`replace(/[^\d\s.-]/g, '')`), chặn gõ chữ cái. Do đó, khi người dùng tạo khách hàng mới (ví dụ "Sơn") rồi gõ tên vào ô tìm kiếm thì ký tự bị xóa trắng và danh sách trả về trống rỗng.
3. **Chân hóa đơn in và bản xem trước hóa đơn**:
   - Người dùng yêu cầu xóa bỏ hoàn toàn 2 dòng chữ thừa ở chân hóa đơn:
     + *"Quý khách vui lòng kiểm tra kỹ hóa đơn & hàng hóa trước khi rời quầy."*
     + *"[Hóa đơn khởi tạo từ máy tính tiền MT-GRMS]"* (và dòng *"Doi tra trong 24h kem hoa don."* trên bản in nhiệt).
   - Chỉ giữ lại duy nhất lời cảm ơn: *"CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!"*.
4. **Bố cục bảng hàng hóa trên hóa đơn bán lẻ**:
   - Dòng hàng hóa hiện mã lô nội bộ kho `(LÔ-FEFO)` khiến dòng bị gãy và rườm rà.
   - Bố cục dòng *"Tổng cộng: 1"* trong bảng và *"Tiền hàng: 320.000 đ"* ở dưới bảng bị rời rạc, rối mắt.
   - Cần căn chỉnh gọn gàng, chuyên nghiệp như mẫu chuẩn siêu thị Đức Thành.
5. **Hotline cửa hàng**:
   - Hotline và điện thoại trên hóa đơn phải lấy chính xác số điện thoại/hotline của chi nhánh/cửa hàng từ CSDL (`activeBranch.phone` hoặc `Tenant.Hotline`), không hiển thị chuỗi fallback cứng.

## 2. Mục tiêu & Phạm vi
- **In-Scope**:
  - `CollectDebtModal.tsx`: Sửa logic `min/max`, kiểm tra nếu `remainingDebt <= 0` thì thông báo đã tất toán nợ và vô hiệu hóa input/nút thu.
  - `InvoiceManagementPage.tsx`: Cập nhật điều kiện `isDebt` và `isCompleted` sao cho hóa đơn có `debtAmount <= 0` chuyển sang hoàn thành, ẩn nút "Thu nợ".
  - `PosPaymentPanel.tsx`: Mở rộng tìm kiếm khách hàng cho phép tìm theo **Tên (hỗ trợ tiếng Việt không dấu/có dấu)**, **Số điện thoại** và **Mã khách hàng**.
  - `PosCheckoutPage.tsx`: Cập nhật đồng bộ danh sách khách hàng từ CSDL PostgreSQL và truyền hotline chuẩn xác.
  - `PosReceiptModal.tsx`: Xóa 2 dòng chân bill, bỏ hiển thị `(LÔ-FEFO)`, đồng bộ layout bảng mặt hàng và tổng tiền.
  - `ThermalPrintService.cs`: Xóa dòng đổi trả hàng 24h ở chân bill, chuẩn hóa ngắt dòng địa chỉ/hotline.
- **Out-of-Scope**: Không thay đổi quy trình kế toán, không đổi cấu trúc CSDL PostgreSQL.

## 3. Tiêu chí thành công
- Mở modal thu nợ không còn lỗi tooltip HTML5 min-max.
- Tìm kiếm "Sơn", "son" hoặc "0961934104" ở POS đều ra ngay khách hàng đã thêm vào CSDL.
- Bill in thực tế và preview trên web không còn 2 dòng thừa ở chân trang.
- Bảng hàng hóa hiển thị sạch sẽ, không còn `(LÔ-FEFO)`, cột và tổng tiền thẳng hàng rõ ràng.
- Hotline hiển thị đúng số của chi nhánh / cửa hàng.
- Toàn bộ unit tests backend và frontend build đều pass 100%.
