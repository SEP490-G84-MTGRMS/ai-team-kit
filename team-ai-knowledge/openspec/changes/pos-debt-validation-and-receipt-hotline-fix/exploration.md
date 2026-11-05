# EXP-2026-11-05-001: Khám phá nguyên nhân & giải pháp sửa lỗi Modal Thu Nợ, Tìm kiếm Khách hàng POS & Chuẩn hóa Hóa đơn Bán lẻ

## 1. Problem Statement (Tuyên bố vấn đề)
Hệ thống POS và Quản lý hóa đơn gặp 5 vấn đề phát sinh trong thực tế vận hành:
1. **Lỗi HTML5 Min-Max Validation khi thu nợ**:
   - Khi mở modal Thu nợ (`CollectDebtModal`) cho hóa đơn đã hoàn thành hoặc nợ còn lại $= 0$ đ, trình duyệt hiển thị popup lỗi: *"Minimum value (1000) must be less than the maximum value (0)."*, ngăn cản người dùng thao tác.
2. **Giao diện Quản lý hóa đơn phân loại sai trạng thái nợ**:
   - Các hóa đơn ban đầu ghi nợ (`paymentMethod === 'DEBT'`) nhưng đã thanh toán xong nợ (`debtAmount <= 0`) vẫn bị gắn mác nợ, hiển thị nhãn *"Còn nợ 0 đ"* và nút *"Thu nợ"* màu xanh.
3. **Thu ngân POS không tìm được khách hàng vừa thêm vào CSDL**:
   - Thu ngân thêm khách hàng mới (ví dụ "Sơn", SĐT `0961934104`) thành công vào PostgreSQL. Tuy nhiên khi quay lại ô tìm kiếm khách hàng ở màn hình POS, ô tìm kiếm bị chặn chỉ cho gõ số qua regex `replace(/[^\d\s.-]/g, '')` và chỉ lọc theo số điện thoại, gõ tên khách hàng bị xóa trắng ký tự.
4. **Hóa đơn in và xem trước còn 2 dòng thừa ở chân trang**:
   - Chân hóa đơn hiển thị các dòng không cần thiết: *"Quý khách vui lòng kiểm tra kỹ hóa đơn & hàng hóa trước khi rời quầy."*, *"[Hóa đơn khởi tạo từ máy tính tiền MT-GRMS]"* và *"Doi tra trong 24h kem hoa don."*. Khách hàng yêu cầu chỉ giữ lại duy nhất dòng cảm ơn.
5. **Bố cục bảng mặt hàng bị rối mắt & Hotline chưa đồng bộ chi nhánh**:
   - Bảng mặt hàng hiện mã lô nội bộ `(LÔ-FEFO)`, dòng tổng số lượng và tiền hàng bị chia tách trơ trọi. Hotline hiển thị chưa đồng bộ đúng thông tin chi nhánh/cửa hàng đang hoạt động.

## 2. Root Cause Analysis (Nguyên nhân gốc rễ)
1. **`CollectDebtModal.tsx` (dòng 186-189)**:
   - Thẻ `<input type="number">` đặt `min={1000}` và `max={remainingDebt}`. Khi `remainingDebt = 0`, giá trị `min (1000) > max (0)`. Theo chuẩn HTML5 form validation, trình duyệt tự động chặn submit và hiện thông báo lỗi.
2. **`InvoiceManagementPage.tsx` (dòng 854-856)**:
   - Biến `isDebt` được tính:
     ```typescript
     const isDebt = inv.status === 'DEBT' || inv.paymentMethod === 'DEBT' || inv.paymentMethod === 'CREDIT' || (inv.debtAmount !== undefined && inv.debtAmount > 0);
     ```
   - Điều kiện `inv.paymentMethod === 'DEBT'` luôn đúng với mọi đơn nợ trong quá khứ, ngay cả khi `debtAmount = 0` và `paidDebtAmount = totalAmount`. Do đó, nút "Thu nợ" vẫn xuất hiện và mở ra modal thu nợ cho đơn 0 đ.
3. **`PosPaymentPanel.tsx` (dòng 82-89, 118-123)**:
   - Sự kiện `onChange` của ô tìm kiếm khách hàng ép kiểu:
     ```typescript
     const val = e.target.value.replace(/[^\d\s.-]/g, '');
     ```
   - Hàm filter chỉ kiểm tra số điện thoại:
     ```typescript
     const phoneQuery = customerSearchInput.replace(/\D/g, '');
     const filteredCustomers = customerSearchList.filter(c => ... cleanPhone.includes(phoneQuery));
     ```
   - Khi thu ngân gõ tên khách hàng (như "Sơn"), chuỗi bị xóa rỗng hoàn toàn, không thể tìm theo tên hay mã khách hàng.
4. **`PosReceiptModal.tsx` & `ThermalPrintService.cs`**:
   - Dòng 286-291 ở `PosReceiptModal.tsx` và dòng 184 ở `ThermalPrintService.cs` đang in các câu khuyến cáo cố định chưa được lược bỏ theo yêu cầu của cửa hàng.
   - Dòng 142-144 ở `PosReceiptModal.tsx` vẫn render `{item.batchCode && <span>({item.batchCode})</span>}` gây gãy dòng tên sản phẩm.
   - Hotline và điện thoại ở `buildReceiptData` (`PosCheckoutPage.tsx`) chưa ưu tiên số điện thoại thực tế từ `activeBranch.phone` hoặc `user.tenantHotline`.

## 3. Constraints & Assumptions
- **[CONSTRAINT]**: Không thay đổi schema CSDL PostgreSQL, không phá vỡ hợp đồng API hiện có.
- **[CONSTRAINT]**: Chiều rộng dòng in nhiệt POS-58 là 40 ký tự Font B, không được vượt quá để tránh tràn lề.
- **[ASSUMPTION]**: Khách hàng tìm kiếm trong POS có thể tìm bằng Tên (không dấu hoặc có dấu), Số điện thoại (chứa chuỗi số), hoặc Mã khách hàng (KH...).

## 4. Scope & Non-Goals
### In Scope
- Sửa `CollectDebtModal.tsx`: Xử lý trường hợp `remainingDebt <= 0`, vô hiệu hóa input/nút submit, chỉnh `min/max` an toàn.
- Sửa `InvoiceManagementPage.tsx`: Hóa đơn có `debtAmount <= 0` chuyển sang hoàn thành, ẩn nút "Thu nợ".
- Sửa `PosPaymentPanel.tsx`: Hỗ trợ tìm kiếm khách hàng theo Tên (bỏ dấu tiếng Việt), SĐT, Mã KH.
- Sửa `PosCheckoutPage.tsx`: Truyền thông tin Hotline chi nhánh chính xác, refresh danh sách khách hàng.
- Sửa `PosReceiptModal.tsx`: Xóa 2 dòng thừa, bỏ `(LÔ-FEFO)`, căn chỉnh dòng tổng cộng và thành tiền thẳng cột.
- Sửa `ThermalPrintService.cs`: Xóa dòng đổi trả 24h, ngắt dòng thông tin cửa hàng chuẩn xác.

### Out of Scope (Non-Goals)
- Không can thiệp vào quy trình thanh toán ngân hàng qua SePay/VietQR.
- Không sửa đổi logic kế toán sổ quỹ hay báo cáo thuế hộ kinh doanh.

## 5. Đánh giá phương án (Trade-off Analysis)
- **Phương án 1: Sửa riêng lẻ ở frontend từng file**:
  - *Ưu điểm*: Nhanh gọn.
  - *Nhược điểm*: Dễ sót trường hợp khi người dùng thao tác ở trang quản lý hóa đơn hoặc in trực tiếp từ backend.
- **Phương án 2 (Được chọn)**: Xử lý đồng bộ từ gốc:
  - Frontend POS & Quản lý hóa đơn kiểm soát chặt chẽ trạng thái nợ còn lại (`remainingDebt > 0`).
  - Hỗ trợ tìm kiếm khách hàng đa tiêu chí (Tên không dấu/có dấu, SĐT, Mã KH).
  - Chuẩn hóa layout hóa đơn đồng bộ cả trên màn hình web lẫn lệnh in ESC/POS backend.
  - *Lý do chọn*: Giải quyết dứt điểm toàn bộ 5 vấn đề, đảm bảo tính nhất quán và trải nghiệm người dùng tối ưu.

## 6. Success Criteria
- Mở modal thu nợ bất kỳ không bao giờ gặp lỗi HTML5 validation.
- Gõ "Sơn" hoặc "0961934104" ở POS đều ra ngay khách hàng đã thêm.
- Hóa đơn in và xem trước không còn 2 dòng thừa chân trang.
- Bảng chi tiết mặt hàng hiển thị ngay ngắn, chuẩn mực như hóa đơn Siêu thị Đức Thành.
- Hotline hiển thị đúng số của chi nhánh / cửa hàng trong CSDL.
