# EXP-2026-11-05-POS-02: Khắc Phục Ánh Xạ Hóa Đơn Bán Nợ CREDIT & Cân Đối Bố Cục Bảng Quản Lý Hóa Đơn POS

## 1. Problem Statement (Vấn đề cần giải quyết)
1. **Lệch hiển thị phương thức thanh toán và trạng thái công nợ**:
   - Khi nhân viên bán hàng chọn hình thức thanh toán "Bán nợ" (`CREDIT`), đơn hàng được lưu trữ chính xác trong cơ sở dữ liệu (`PaymentMethod: CREDIT`, `PaymentStatus: UNPAID`).
   - Tuy nhiên, tại giao diện Quản lý Hóa Đơn Bán Hàng (`InvoiceManagementPage.tsx`), các hóa đơn nợ bị ánh xạ nhầm thành:
     - `paymentMethodLabel`: "Tiền mặt" (màu xanh lá của tiền mặt).
     - "Khách đã trả": Hiển thị 100% tổng tiền đơn hàng (nhầm lẫn với thanh toán đủ tiền mặt).
     - "Trạng thái": "Hoàn thành" (thay vì "Còn nợ").
     - Thanh theo dõi nợ: `Còn nợ lại: 0 đ` (thay vì số tiền nợ thực tế).
2. **Giao diện bảng danh sách hóa đơn bị mất cân đối**:
   - Cột `Mã hóa đơn` giới hạn cứng 120px trong khi chuỗi mã dài 17 ký tự (`HD261105073958260`) kèm nhãn chi nhánh bên dưới khiến nội dung bị chật chội, dồn ép.
   - Cột `Thao tác` đặt cố định 170px không đủ chỗ cho 4 nút thao tác (`[Đóng]`, `[In bill]`, `[Đổi/Trả]`, `[Hủy đơn]` hoặc `[Thu nợ]`).
   - Các cột số tiền không có min-width rõ ràng dẫn đến bảng bị xô lệch khi màn hình có kích thước khác nhau.
3. **Lỗi chuỗi thu ngân**: Xuất hiện cặp ngoặc đơn rỗng `Thu ngân: Thu ngân quầy ()` khi không có `cashierId`.

## 2. Context & Root Cause Analysis (Hiện trạng & Nguyên nhân gốc rễ)

### 2.1. Root cause ánh xạ PaymentMethod:
- Trong `InvoiceManagementPage.tsx` (dòng 129-143 và 337-338):
  ```typescript
  paymentMethodLabel:
    o.paymentMethod === 'VIETQR'
      ? 'Chuyển khoản VietQR'
      : o.paymentMethod === 'DEBT' // <-- Chỉ kiểm tra DEBT, bỏ sót CREDIT!
      ? 'Ghi nợ'
      : 'Tiền mặt', // <-- Bị fallback vào Tiền mặt
  debtAmount: o.paymentMethod === 'DEBT' ? o.finalAmount : 0, // <-- Trở thành 0!
  status: o.status === 'Cancelled' ? 'CANCELLED' : o.paymentMethod === 'DEBT' ? 'DEBT' : 'COMPLETED', // <-- Trở thành COMPLETED!
  ```
- Backend `OrderService.cs` và database lưu giá trị enum là `CREDIT`. Do đó biểu thức so sánh trả về `false`, khiến toàn bộ hóa đơn nợ bị đối xử như hóa đơn tiền mặt đã thanh toán đủ!

### 2.2. Root cause mất cân đối bảng:
- Thẻ `<table>` không có `table-layout: fixed` và các thẻ `<th>` chia tỷ lệ không đồng đều (`Mã hóa đơn: 120px`, `Thao tác: 170px`). Cần phân bổ lại:
  - Checkbox: 36px (căn giữa)
  - Mã hóa đơn: 180px
  - Thời gian lập: 135px
  - Khách hàng: auto (min 150px)
  - Tổng tiền hàng: 105px (căn phải)
  - Giảm giá: 80px (căn phải)
  - Khách đã trả: 105px (căn phải)
  - Phương thức TT: 125px
  - Trạng thái: 120px
  - Thao tác: 210px (căn giữa)

### 2.3. Root cause dấu ngoặc rỗng:
- Dòng 1057: `Thu ngân: <b>{inv.cashierName} ({inv.cashierId})</b>`. Khi `cashierId` rỗng, JSX render ra `()` vô nghĩa.

## 3. Các phương án giải quyết (Options Considered)
- **Phương án 1 (Khuyến nghị)**: Cập nhật hàm helper nhận diện công nợ: `const isDebt = o.paymentMethod === 'CREDIT' || o.paymentMethod === 'DEBT'`. Cập nhật `debtAmount`, `finalPaidAmount`, `status`, `paymentMethodLabel`, và bộ lọc `paymentMethodFilter`. Điều chỉnh tỷ lệ các cột bảng `pos-shift-table` và format tên thu ngân.
- **Phương án 2**: Đổi toàn bộ mã nguồn backend từ `CREDIT` sang `DEBT`.
  - *Đánh giá*: Rủi ro cao, phá vỡ cấu trúc CSDL và các API đã tích hợp. Không chọn.

## 4. Assumptions (Giả định)
- Backend lưu cả đơn hàng tiền mặt (`CASH`), chuyển khoản (`VIETQR`), và bán nợ (`CREDIT`).
- Đơn hàng `CREDIT` khi chưa thu nợ thì `CustomerPaid = 0` và số tiền nợ bằng `FinalAmount`.

## 5. Scope & Non-Goals
### In Scope
- Sửa hàm ánh xạ đơn hàng trong `InvoiceManagementPage.tsx` nhận diện đúng `CREDIT`.
- Sửa cột "Khách đã trả" đối với đơn nợ hiển thị `0 đ` (hoặc số tiền đã trả nếu có), còn nợ lại hiển thị đúng tổng nợ.
- Sửa màu sắc, icon, badge hiển thị của `Ghi nợ` (màu cam/vàng nợ, icon CreditCard).
- Căn chỉnh lại CSS / width các cột bảng hóa đơn và chi tiết mặt hàng cho cân xứng.
- Bỏ cặp dấu ngoặc rỗng `()` ở phần thông tin thu ngân.

### Out of Scope (Non-Goals)
- Không can thiệp vào nghiệp vụ tạo đơn hàng POS hoặc hủy đơn.

## 6. Success Criteria (Tiêu chí thành công)
1. Đơn `HD261105073958260` hiển thị đúng phương thức "Ghi nợ", trạng thái "Còn nợ 474.000 đ", "Khách đã trả: 0 đ".
2. Thanh theo dõi công nợ hiển thị: "Đã thanh toán: 0 đ • Còn nợ lại: 474.000 đ".
3. Bảng hóa đơn cân đối, mã hóa đơn và các nút thao tác hiển thị rõ ràng, không bị tràn hay ép dòng.
4. `npm test -- pos` và `npm run build` pass 100%.
