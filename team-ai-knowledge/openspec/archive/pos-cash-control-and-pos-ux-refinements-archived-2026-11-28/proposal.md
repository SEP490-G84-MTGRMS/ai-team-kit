# Đề xuất thay đổi (Proposal): Tinh chỉnh UX quầy POS và kiểm soát dòng tiền ca

## 1. Bối cảnh & Vấn đề tồn tại
Qua quá trình kiểm thử thực tế trên quầy thu ngân POS và quản trị dòng tiền ca làm việc, phát hiện các điểm bất cập về UX, thừa thãi nút thao tác và lỗ hổng kiểm soát tiền két:
1. **Menu POS có nút dư thừa**: Dropdown menu POS chứa nút "Giữ đơn hàng (Recall)" và "In bill gần nhất". Hệ thống đã có đa tab đơn hàng (`Đơn 1`, `Đơn 2`...) và trang Quản lý hóa đơn đã có tìm kiếm/in lại toàn bộ hóa đơn, khiến 2 nút này gây rối mắt và chỉ là mockup alert.
2. **Modal Phiếu Thu/Chi két POS chưa chuẩn nghiệp vụ**:
   - Có nút "[+] Thu nợ khách hàng" chung chung trong két POS, không gắn với khách hàng hay hóa đơn nợ nào, dẫn đến việc thu tiền vào két nhưng sổ nợ của khách hàng trên hệ thống không được khấu trừ.
   - Chưa kiểm tra số tiền chi với số dư tiền mặt hiện có trong két: nhân viên có thể lập phiếu chi lớn hơn số tiền mặt thực có trong két, gây âm két vật lý.
3. **Modal Đổi / Trả hàng**:
   - Tiêu đề gắn nhãn "Chuẩn KiotViet" không phù hợp với nhận diện hệ thống MT-GRMS.
   - Thiếu tính năng chọn Đơn vị tính quy đổi (Hộp, Vỉ, Viên, Chai, Thùng...) lấy từ bảng `ProductUnits` cho cả hàng khách trả và hàng khách đổi mới.
   - Chưa kiểm soát tình huống tiền mặt trong két không đủ để hoàn tiền mặt cho khách.
4. **Trùng lặp nút thao tác trong Quản lý hóa đơn**:
   - Khi bấm mở rộng dòng hóa đơn (accordion chi tiết), lại xuất hiện 3 nút trùng lặp: `Đổi / Trả Hàng`, `Hủy Hóa Đơn Này`, `In Hóa Đơn Nhiệt K80`, dù ngoài bảng đã có sẵn các nút này.
5. **Chưa mở ca vẫn tạo đơn thành công trên POS**:
   - POS chưa chặn cứng thanh toán khi chưa có ca mở (`currentShift == null`), dẫn đến đơn hàng bị tạo không gắn với ca nào (`ShiftId = null`), gây thất thoát và lệch két.
6. **Lịch sử ca thiếu nút Xem chi tiết**:
   - Bảng "Danh Sách Các Phiên Ca Bán Hàng" không có nút xem chi tiết Z-Report, khiến người quản lý không xem được lý do giải trình chênh lệch két (`differenceReason`/`notes`) và danh sách phiếu thu/chi trong ca.
7. **Nút "Nhận ca" hiển thị cho Chủ cửa hàng**:
   - Chủ cửa hàng không phải người trực quầy nhận tiền lẻ bán hàng từ ca trước, nhưng nút "Nhận ca" vẫn hiển thị khi đăng nhập role Chủ.
8. **Khối ca bàn giao tồn đọng ở trang Hạn mức & Duyệt chi két**:
   - Trang này bị dư thừa khối "Ca làm việc chờ phê duyệt bàn giao" vốn đã được quản lý đầy đủ bên trang Lịch sử ca.

---

## 2. Mục tiêu giải quyết
1. Tinh giản tối đa giao diện quầy POS: xóa bỏ các nút dư thừa, trùng lặp và mockup.
2. Đảm bảo tính toàn vẹn kế toán tiền két: không cho chi vượt quá tiền mặt hiện có; chặn thu nợ không rõ nguồn gốc; khóa thanh toán khi chưa mở ca.
3. Hoàn thiện nghiệp vụ Đổi / Trả hàng: xóa nhãn KiotViet, hỗ trợ chọn đơn vị quy đổi từ `ProductUnits`, cảnh báo khi két không đủ tiền hoàn.
4. Nâng cao trải nghiệm kiểm toán của Chủ cửa hàng: xem chi tiết phiên ca kèm lý do chênh lệch két, ẩn nút nhận ca không phù hợp, làm sạch trang Hạn mức két.

---

## 3. Phạm vi thay đổi (Scope)

### Trong phạm vi (In-Scope):
- **Frontend POS Header & Dropdown**: Xóa 2 nút Recall và In bill gần nhất trong `PosHeader.tsx` và `PosCheckoutPage.tsx`.
- **Frontend & Backend Cash Movement**: 
  - Xóa nút Thu nợ khỏi `CashMovementModal.tsx`.
  - Validate số tiền chi `OUT` không được vượt quá số tiền mặt hiện có trong két (cả ở Frontend lẫn Backend `ShiftService.AddCashMovementAsync`).
- **Frontend Return/Exchange Modal**: 
  - Xóa chữ "Chuẩn KiotViet" trong `ReturnExchangeModal.tsx` và các trang liên quan.
  - Bổ sung chọn đơn vị quy đổi (`unitName`, `conversionRate`) lấy từ `ProductUnits`.
  - Validate tiền mặt két khi hoàn tiền mặt khách.
- **Frontend Invoice Management**: Xóa 3 nút trùng lặp trong accordion chi tiết hóa đơn của `InvoiceManagementPage.tsx`.
- **Frontend Checkout Guard**: Bắt buộc mở ca trước khi thao tác bán hàng / thanh toán trong `PosCheckoutPage.tsx`.
- **Frontend Shift History & Details**:
  - Bổ sung modal "Xem chi tiết phiên ca" (Z-Report, lý do chênh lệch, phiếu thu chi) trong `PosShiftPage.tsx`.
  - Ẩn nút "Nhận ca" khi role là `STORE_OWNER` hoặc `ADMIN`.
- **Frontend Cash Control Page**: Xóa khối "Ca Làm Việc Chờ Phê Duyệt Bàn Giao" trong `StorePosCashControlPage.tsx`.

### Ngoài phạm vi (Out-of-Scope):
- Thay đổi cấu trúc bảng cơ sở dữ liệu (tất cả các trường `ProductUnits`, `ShiftCashMovements`, `Shifts` đã sẵn sàng).
- Viết lại toàn bộ trang công nợ khách hàng.

---

## 4. Tiêu chí thành công (Acceptance Criteria)
1. Menu POS chỉ hiển thị các thao tác hữu ích thực tế, không còn nút Recall và In bill gần nhất.
2. Modal Lập phiếu thu/chi két POS không còn nút "Thu nợ khách hàng"; không thể lập phiếu chi vượt quá số tiền mặt trong két.
3. Modal Đổi/Trả hàng hiển thị tên "Đổi / Trả Hàng", cho phép chọn đơn vị quy đổi (Hộp/Vỉ/Viên...) và tự động tính đúng giá/tiền bù trừ.
4. Bảng Quản lý hóa đơn không còn lặp lại cụm 3 nút thao tác khi bấm mở xem chi tiết từng dòng.
5. Không thể thanh toán đơn hàng trên POS nếu chưa có ca làm việc đang mở.
6. Trang Danh Sách Các Phiên Ca Bán Hàng có nút "Xem chi tiết" hiển thị tường tận thông số ca, lý do chênh lệch và danh sách phiếu thu/chi.
7. Đăng nhập Chủ cửa hàng không thấy nút "Nhận ca"; trang Hạn Mức & Duyệt Chi Két POS không còn khối ca chờ bàn giao thừa thãi.
8. 100% tests backend và frontend build đều pass.
