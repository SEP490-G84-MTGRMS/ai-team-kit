# Delta Specification: pos-customer-persistence-and-receipt-redesign

## ADDED Requirements

### Requirement: REQ-POS-CUST-01 Lưu khách hàng mới vào CSDL tại quầy POS
Khi người dùng bấm "Lưu khách hàng" trong `AddCustomerModal`, hệ thống MUST gửi yêu cầu tạo khách hàng tới API backend `POST /api/customers` và lưu trữ thực tế vào CSDL PostgreSQL với đầy đủ mã khách hàng, tên, số điện thoại, địa chỉ, hạn mức nợ và gắn với `TenantId` của phiên làm việc.

#### Scenario: Tạo mới khách hàng thành công tại quầy POS
**GIVEN** Thu ngân đang ở màn hình bán hàng POS và mở modal `AddCustomerModal`  
**WHEN** Thu ngân nhập tên "Phạm Minh Đức", số điện thoại "0987654321", địa chỉ "Số 10 Cầu Giấy, Hà Nội" và bấm "Lưu khách hàng"  
**THEN** Hệ thống hiển thị trạng thái chờ `isSubmitting`, gọi `customerApi.createCustomer(...)`  
**AND** Backend lưu thành công vào PostgreSQL, sinh mã khách hàng `KH...` và trả về `CustomerResponse` với GUID ID thật  
**AND** Frontend tự động chọn khách hàng này vào đơn hàng hiện tại của tab đang mở, cập nhật vào danh sách `customers` và hiển thị toast thông báo thành công  
**AND** Modal tự động đóng lại.

#### Scenario: Bỏ chọn và tìm lại khách hàng vừa tạo
**GIVEN** Khách hàng "Phạm Minh Đức" (SĐT: "0987654321") vừa được tạo thành công tại quầy POS  
**WHEN** Thu ngân bấm biểu tượng `✕` trên thanh POS để bỏ chọn khách hàng (chuyển về "Khách lẻ")  
**AND** Thu ngân gõ "0987654321" hoặc "Minh Đức" vào ô tìm kiếm khách hàng  
**THEN** Hệ thống hiển thị ngay khách hàng "Phạm Minh Đức" trong danh sách kết quả tìm kiếm với đầy đủ SĐT, địa chỉ và điểm thưởng.

#### Scenario: Bắt lỗi khi số điện thoại đã tồn tại
**GIVEN** Khách hàng với số điện thoại "0976543210" đã tồn tại trong CSDL của Tenant hiện tại  
**WHEN** Thu ngân mở `AddCustomerModal` và nhập lại số điện thoại "0976543210" rồi bấm "Lưu khách hàng"  
**THEN** Backend trả về mã lỗi `PHONE_EXISTS`  
**AND** Hệ thống hiển thị thông báo lỗi rõ ràng "Số điện thoại này đã được sử dụng cho một khách hàng khác!", không đóng modal và cho phép thu ngân sửa đổi số điện thoại.

---

### Requirement: REQ-POS-RECEIPT-LAYOUT-01 Bố cục hóa đơn in nhiệt và xem trước chuẩn siêu thị bán lẻ
Giao diện xem trước hóa đơn (`PosReceiptModal.tsx`) và bản in nhiệt ESC/POS (`ThermalPrintService.cs`) MUST tuân thủ định dạng chuẩn của siêu thị thực tế:
1. Header: Tên cửa hàng/chuỗi in đậm, địa chỉ chi nhánh, số hotline, tiêu đề "HÓA ĐƠN BÁN LẺ", Số HĐ, Ngày bán, Tên thu ngân.
2. Bảng mặt hàng: Liệt kê rõ ràng STT, Tên hàng hóa, Số lượng, Đơn giá, Thành tiền. Có dòng tổng số lượng mặt hàng.
3. Khối tổng tiền: Tổng tiền hàng, Chiết khấu (nếu có), Tổng phải trả, Khách trả (Tiền mặt/VietQR/Ghi nợ), Tiền thừa / Còn nợ.
4. Khối Thông tin khách hàng ở chân bill: Tên khách hàng, Địa chỉ, Số điện thoại, Tổng điểm tích lũy.
5. Footer: Lời cảm ơn và quy định đổi trả hàng.

#### Scenario: Hiển thị đầy đủ thông tin khách hàng ở chân hóa đơn
**GIVEN** Đơn hàng bán cho khách hàng "Chị Thu Hà", SĐT "0976543210", địa chỉ "120 Hoàng Hoa Thám, Hà Nội", có 150 điểm tích lũy  
**WHEN** Đơn hàng được thanh toán và mở modal xem trước hóa đơn hoặc in ra máy in nhiệt  
**THEN** Ở phần chân hóa đơn (trước lời cảm ơn) hiển thị khối "THÔNG TIN KHÁCH HÀNG" gồm:  
- Tên khách hàng: Chị Thu Hà  
- Địa chỉ: 120 Hoàng Hoa Thám, Hà Nội  
- Số điện thoại: 0976543210  
- Tổng điểm tích lũy: 150 điểm.

---

## MODIFIED Requirements

### Requirement: REQ-POS-VAT-01 Loại bỏ hoàn toàn dòng VAT khỏi hóa đơn bán lẻ POS
Hệ thống MUST NOT tính toán hay hiển thị bất kỳ dòng nào liên quan đến thuế VAT ("Tổng tiền chưa VAT", "Tiền VAT", "Thuế GTGT (VAT 1%)") trên hóa đơn bán lẻ POS, modal xem trước và bản in nhiệt máy in POS-58. `finalAmount` của hóa đơn MUST bằng chính xác tổng tiền hàng trừ đi chiết khấu và điểm tích lũy.

#### Scenario: Hóa đơn bán lẻ không xuất hiện dòng VAT
**GIVEN** Đơn hàng có tổng tiền hàng là 474.000 đ, không có chiết khấu  
**WHEN** Thu ngân xem trước hóa đơn hoặc in nhiệt POS-58  
**THEN** Hóa đơn hiển thị "Tổng tiền hàng: 474.000 đ" và "TỔNG THANH TOÁN: 474.000 đ"  
**AND** Tuyệt đối không xuất hiện dòng "Tổng tiền chưa VAT" hay "Tiền VAT"  
**AND** Dữ liệu `vatAmount` trong phiếu in có giá trị bằng 0.

---

### Requirement: REQ-POS-DYNAMIC-STORE-01 Hiển thị động thông tin Tenant & Chi nhánh trên hóa đơn
Hóa đơn bán lẻ MUST hiển thị tên cửa hàng/chuỗi, địa chỉ chi nhánh và số hotline được lấy động từ thông tin Tenant và Chi nhánh của tài khoản đang đăng nhập, thay vì hardcode tên "MT-GROCERY" hoặc địa chỉ mặc định "123 Xuân Thủy".

#### Scenario: In hóa đơn với tài khoản cửa hàng An Nhiên Mart
**GIVEN** Thu ngân đăng nhập tài khoản thuộc Tenant "An Nhiên Mart" với chi nhánh "An Nhiên Mart - Chi nhánh Ba Đình" (Địa chỉ: "120 Hoàng Hoa Thám, Tây Hồ, Hà Nội", Hotline/Phone: "024 3822 9988" / "0918889999")  
**WHEN** Thu ngân in hóa đơn bán hàng  
**THEN** Header hóa đơn in ra:  
- Tên đơn vị: "CỬA HÀNG THỰC PHẨM SẠCH AN NHIÊN" hoặc "AN NHIÊN MART - CHI NHÁNH BA ĐÌNH"  
- Địa chỉ: "120 Hoàng Hoa Thám, Tây Hồ, Hà Nội"  
- Hotline: "024 3822 9988" (hoặc "0918889999")  
**AND** Không còn dòng chữ hardcode "MT-GROCERY" hay "123 Xuân Thủy".

---

## REMOVED Requirements
- Bỏ yêu cầu tính thuế và in dòng "Thuế GTGT (VAT 1%)" tại quầy thu ngân bán lẻ POS.
- Bỏ dòng in cứng "Wifi: MT-GROCERY | Pass: 68686868" trong ESC/POS receipt builder.

---

## Acceptance Checklist
- [ ] Thêm khách hàng mới từ POS `AddCustomerModal` -> Lưu thành công vào CSDL Postgres, tự chọn vào đơn hàng hiện tại.
- [ ] Bỏ chọn khách hàng -> Tìm lại bằng SĐT/Tên -> Tìm thấy ngay lập tức.
- [ ] Nhập trùng SĐT -> Báo lỗi trùng SĐT rõ ràng, không đóng modal.
- [ ] Modal xem trước hóa đơn: Tên cửa hàng, địa chỉ, hotline hiển thị chính xác theo Tenant/Chi nhánh.
- [ ] Modal xem trước hóa đơn: Không còn bất kỳ dòng "VAT" hay "chưa VAT" nào.
- [ ] Modal xem trước hóa đơn: Bảng hàng hóa có STT, tên hàng, SL, đơn giá, thành tiền; Chân bill có khối Thông tin khách hàng.
- [ ] Bản in nhiệt ESC/POS `ThermalPrintService.cs`: Không in VAT, không in wifi mặc định, in đúng tên/địa chỉ/hotline chi nhánh, có khối thông tin khách hàng.
- [ ] Test frontend và backend build vượt qua 100%.
