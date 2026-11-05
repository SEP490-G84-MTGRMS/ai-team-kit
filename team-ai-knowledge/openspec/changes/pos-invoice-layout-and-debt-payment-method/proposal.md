# Đề Xuất Sửa Lỗi: Hiển Thị Hóa Đơn Bán Nợ & Cân Đối Bố Cục Bảng Quản Lý Hóa Đơn POS

## 1. Mô tả lỗi & Vấn đề thực tế
1. **Sai lệch phương thức thanh toán và trạng thái nợ**: Khi khách hàng mua nợ tại POS (`PaymentMethod: CREDIT`), trong cơ sở dữ liệu và API đã lưu đúng `CREDIT` và `PaymentStatus: UNPAID`. Tuy nhiên, tại màn hình **Quản lý hóa đơn bán lẻ** (`/pos/invoices`), hóa đơn lại bị hiển thị thành:
   - Phương thức TT: `Tiền mặt` (thay vì `Ghi nợ`).
   - Khách đã trả: Hiển thị toàn bộ tổng tiền đơn hàng (thay vì `0 đ` hoặc số tiền đã trả trước).
   - Trạng thái: `Hoàn thành` (thay vì `Còn nợ`).
   - Thanh theo dõi công nợ: `Đã thanh toán: 0 đ • Còn nợ lại: 0 đ` (thay vì hiển thị đúng số nợ còn lại).
2. **Giao diện bảng hóa đơn bị mất cân đối**:
   - Cột `Mã hóa đơn` đặt cố định `width: 120px` quá hẹp so với chuỗi mã 17 ký tự (`HD261105073958260`) kèm nhãn chi nhánh bên dưới, dẫn đến tình trạng chữ bị ép xuống dòng hoặc che khuất icon mở rộng.
   - Cột `Thao tác` đặt cố định `width: 170px` quá chật cho 4 nút hành động (`[Đóng]`, `[In bill]`, `[Đổi/Trả]`, `[Hủy đơn]`).
   - Các cột số tiền (`Tổng tiền hàng`, `Giảm giá`, `Khách đã trả`) và các cột text (`Khách hàng`, `Phương thức TT`, `Trạng thái`) chưa có tỉ lệ phân bổ hợp lý, gây cảm giác lệch vẹo khi mở rộng chi tiết hóa đơn.
3. **Lỗi hiển thị thu ngân**: Dòng chi tiết hiển thị `Thu ngân: Thu ngân quầy ()` với cặp dấu ngoặc đơn rỗng khi không có `cashierId`.

## 2. Các bước tái hiện
1. Thực hiện đơn hàng bán nợ cho khách hàng tại quầy POS (`/pos`) với phương thức "Bán nợ" (`CREDIT`).
2. Vào màn hình **Quản lý hóa đơn** (`/pos/invoices`).
3. Quan sát dòng hóa đơn vừa tạo và bấm mở rộng xem chi tiết:
   - Thấy phương thức thanh toán hiển thị badge xanh `Tiền mặt`.
   - Cột "Khách đã trả" hiển thị đủ tiền thay vì 0đ.
   - Dòng theo dõi công nợ hiển thị `Còn nợ lại: 0 đ`.
   - Bố cục các cột bảng bị co kéo không cân xứng.

## 3. Kết quả thực tế vs Mong đợi
- **Thực tế**:
  - Hóa đơn mua nợ bị nhầm thành tiền mặt do mã nguồn chỉ kiểm tra `o.paymentMethod === 'DEBT'` mà bỏ qua giá trị chuẩn backend `CREDIT`.
  - Cột bảng không cân đối, mã hóa đơn và thao tác bị chật chội.
- **Mong đợi**:
  - Hóa đơn mua nợ (`CREDIT` hoặc `DEBT`) phải hiển thị đúng phương thức `Ghi nợ`, trạng thái `Còn nợ [số tiền] đ`, "Khách đã trả" hiển thị số tiền thực trả, và thanh theo dõi nợ hiển thị đúng dư nợ.
  - Phân bổ lại tỉ lệ chiều rộng các cột trong bảng `pos-shift-table` đảm bảo cân đối, thoáng đãng và chuyên nghiệp.
  - Loại bỏ cặp dấu ngoặc đơn rỗng `()` nếu không có mã thu ngân.

## 4. Phạm vi (Scope)
- **Trong phạm vi (In-Scope)**:
  - Cập nhật logic ánh xạ `paymentMethod`, `paymentMethodLabel`, `debtAmount`, `finalPaidAmount`, `status` trong `InvoiceManagementPage.tsx` để hỗ trợ đầy đủ `CREDIT` và `DEBT`.
  - Cập nhật bộ lọc tìm kiếm và thống kê hóa đơn theo phương thức thanh toán nợ (`CREDIT`/`DEBT`).
  - Tối ưu cấu trúc CSS/style cột của bảng hóa đơn chính và bảng chi tiết hàng hóa.
  - Tối ưu hiển thị chuỗi tên thu ngân `cashierName`.
- **Ngoài phạm vi (Out-of-Scope)**:
  - Không thay đổi cấu trúc bảng CSDL `Orders` và `CustomerDebtInvoices` backend.

## 5. Tiêu chí thành công (Success Criteria)
1. Đơn hàng mua nợ hiển thị đúng nhãn `Ghi nợ` (màu cam/vàng, icon CreditCard), trạng thái `Còn nợ [số tiền] đ`.
2. Dòng theo dõi công nợ hiển thị chính xác: `Đã thanh toán: 0 đ • Còn nợ lại: [tổng tiền nợ] đ`.
3. Bảng danh sách hóa đơn hiển thị cân xứng, cột mã hóa đơn rộng rãi, các nút thao tác không bị dồn ép.
4. Chạy kiểm thử tự động `npm test -- pos` và `npm run build` thành công 100%.
