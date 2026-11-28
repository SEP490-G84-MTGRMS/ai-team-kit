# Specs Delta: pos-cash-refund-and-preorder-rules

## MODIFIED Requirements

### Requirement: REQ-POS-RETURN-UNIT-CONVERSION-04 — Đổi/Trả hàng chỉ hoàn tiền mặt từ két và chặn hoàn khi két không đủ
Hệ thống **MUST** loại bỏ hoàn toàn các hình thức hoàn tiền qua Ngân hàng (VietQR) và Cấn trừ vào sổ nợ khi xử lý Đổi / Trả hàng:
1. 100% số tiền cửa hàng hoàn trả lại cho khách (`settlementMethod == 'REFUND_CASH'`) **MUST** được chi trực tiếp từ két tiền mặt của quầy thu ngân trong ca làm việc hiện tại.
2. Hệ thống **MUST** kiểm tra số tiền mặt hiện có trong két quầy (`activeShiftCash`). Nếu số tiền hoàn trả cho khách lớn hơn số tiền mặt hiện có trong két:
   - Hệ thống **MUST** vô hiệu hóa nút "Xác nhận hoàn tiền".
   - Hiển thị cảnh báo rõ ràng: *"Tiền mặt trong két quầy không đủ để hoàn trả (Hiện có: X đ, Cần hoàn: Y đ). Vui lòng lập phiếu nạp thêm tiền vào két quầy để tiếp tục."*
   - Cung cấp nút tiện ích nhanh dẫn đến hoặc kích hoạt modal *"Nạp tiền vào két"* (Phiếu thu loại `IN`).
3. Khi hoàn tất đổi trả có hoàn tiền mặt:
   - Hệ thống **MUST** ghi nhận giảm tiền két ca làm việc tương ứng (tạo giao dịch chi hoàn hàng hoặc tăng chỉ số `CashRefund` của ca).

#### Scenario: Két quầy đủ tiền mặt để hoàn trả khách
- **GIVEN** Ca làm việc có tiền mặt trong két là `1.200.000 đ`. Khách trả hàng và cửa hàng cần hoàn lại `150.000 đ`.
- **WHEN** Thu ngân mở modal Đổi / Trả hàng, kiểm tra số tiền hoàn là `150.000 đ`.
- **THEN** Phương thức hoàn trả hiển thị cố định là "Tiền mặt từ két quầy" (không còn lựa chọn Chuyển khoản hay Sổ nợ), nút "Xác nhận hoàn tiền" kích hoạt bình thường. Khi xác nhận, tiền trong két còn `1.050.000 đ`.

#### Scenario: Két quầy thiếu tiền mặt khi hoàn trả khách
- **GIVEN** Ca làm việc chỉ còn `50.000 đ` tiền mặt trong két. Khách mang hàng đến trả và số tiền cần hoàn lại là `200.000 đ`.
- **WHEN** Thu ngân chọn trả hàng với số tiền `200.000 đ`.
- **THEN** Hệ thống hiển thị thông báo màu đỏ: *"Tiền mặt trong két không đủ (còn 50.000 đ, cần 200.000 đ). Hãy lập phiếu nạp két trước khi hoàn tiền"*, nút "Xác nhận" bị khóa (`disabled`). Thu ngân lập phiếu nạp thêm tiền thì nút xác nhận mới sáng trở lại.

---

## ADDED Requirements

### Requirement: REQ-POS-RETURN-LINE-CONDITION-01 — Bắt buộc phân loại tình trạng hàng trả (Nhập lại kho vs Hàng hỏng/lỗi)
Với mỗi dòng sản phẩm được khách mang đến trả tại modal Đổi / Trả Hàng, hệ thống **MUST** yêu cầu thu ngân chọn tình trạng hàng trả:
1. `Restock` (Nhập lại kho): Sản phẩm còn nguyên bao bì, tem mác, hạn sử dụng đảm bảo. Khi xác nhận, hệ thống **MUST** tự động cộng lại số lượng vào tồn kho khả dụng của chi nhánh và ghi nhận vào thẻ kho lô FEFO.
2. `Damaged` (Hàng lỗi / Hỏng): Sản phẩm rách tem, móp méo, ôi thiu hoặc lỗi kỹ thuật. Khi xác nhận, hệ thống **MUST NOT** cộng vào tồn kho bán hàng khả dụng, mà ghi nhận vào kho hàng hỏng / chờ thanh lý / trả nhà cung cấp.

#### Scenario: Thu ngân nhận hàng trả với sản phẩm còn nguyên vẹn
- **GIVEN** Khách trả 2 hộp "Sữa chua Vinamilk" do mua nhầm, hộp còn nguyên seal, HSD còn dài.
- **WHEN** Thu ngân tick chọn dòng sản phẩm và chọn tình trạng là "Hàng nguyên vẹn (Nhập lại kho bán)".
- **THEN** Sau khi xác nhận trả hàng, tồn kho khả dụng của "Sữa chua Vinamilk" tăng thêm 2 hộp.

#### Scenario: Thu ngân nhận hàng trả bị hư hỏng / quá hạn
- **GIVEN** Khách trả 1 gói "Bánh quy bơ" bị mốc do bao bì rách từ trước.
- **WHEN** Thu ngân tick chọn dòng sản phẩm và chọn tình trạng là "Hàng hỏng / lỗi (Chờ hủy/trả NCC)".
- **THEN** Sau khi xác nhận trả hàng, tồn kho bán hàng khả dụng không tăng, hệ thống ghi nhận 1 gói bánh vào danh mục hàng hỏng chờ xử lý.

---

### Requirement: REQ-POS-RETURN-REASON-MANDATORY-02 — Bắt buộc chọn danh mục lý do đổi trả
Khi thực hiện đổi hoặc trả hàng, hệ thống **MUST** yêu cầu thu ngân chọn Lý do đổi trả từ danh mục chuẩn hóa:
- `DEFECTIVE`: Lỗi do Nhà Sản Xuất (bao bì rách, hỏng, biến chất).
- `WRONG_ITEM`: Thu ngân hoặc khách chọn nhầm mặt hàng.
- `CHANGE_MIND`: Khách đổi ý (chỉ áp dụng đổi sang sản phẩm khác, không hoàn tiền đối với hàng đặc biệt).
- `EXPIRED_NEAR_DATE`: Hàng cận hạn / quá hạn sử dụng sót trên kệ.
- `OTHER`: Lý do khác (bắt buộc nhập ghi chú chi tiết).

#### Scenario: Thu ngân không chọn lý do đổi trả
- **GIVEN** Thu ngân đã chọn mặt hàng trả nhưng chưa chọn lý do đổi trả.
- **WHEN** Bấm nút "Xác nhận Đổi / Trả Hàng".
- **THEN** Hệ thống chặn lại và cảnh báo: *"Vui lòng chọn lý do đổi trả hàng trước khi hoàn tất"*.

---

### Requirement: REQ-POS-PREORDER-RETURN-EXCHANGE-RULES-03 — Quy tắc Đổi/Trả/Hủy cho Đơn Đặt Trước theo 2 Tab
Hệ thống **MUST** phân định rõ quy trình xử lý Đổi / Trả / Hủy đơn đặt trước theo 2 trạng thái và vị trí màn hình tương ứng:

1. **Giai đoạn 1: Đơn chưa nhận hàng (`RESERVED` - nằm tại Tab "Đơn Đặt Trước & Giữ Kho")**:
   - Khách muốn đổi sản phẩm: Cung cấp thao tác "Đổi sản phẩm đặt trước", cho phép điều chỉnh danh sách món hàng đã đặt và cập nhật lại số tiền cọc (bù thêm cọc hoặc hoàn tiền cọc thừa bằng tiền mặt).
   - Khách hoặc Cửa hàng muốn hủy đơn:
     + *Hủy do lỗi cửa hàng* (hết hàng, chậm trễ): Cửa hàng hoàn trả 100% tiền cọc cho khách bằng tiền mặt từ két quầy (`CASH`).
     + *Hủy do khách tự ý bỏ cọc*: Không hoàn cọc, ghi nhận tiền cọc vào thu nhập khác của cửa hàng, hủy giữ kho lô FEFO để hàng quay lại kho bán lẻ.

2. **Giai đoạn 2: Đơn đã nhận hàng (`COMPLETED` - đã sinh Hóa đơn tại Tab "Hóa Đơn Bán Lẻ")**:
   - Các hóa đơn có nguồn gốc từ Đơn đặt trước (`isPreOrderOrder === true`):
     + Khi thu ngân bấm nút "Đổi/Trả" trên hóa đơn này, hệ thống **CHỈ CHO PHÉP ĐỔI SẢN PHẨM KHÁC (EXCHANGE)**, tuyệt đối **KHÔNG CHO PHÉP TRẢ HÀNG LẤY LẠI TIỀN MẶT**.
     + **Ngoại lệ duy nhất**: Cho phép hoàn tiền mặt nếu và chỉ nếu lý do đổi trả được chọn là `DEFECTIVE` (Lỗi do Nhà Sản Xuất) và tại quầy không còn sản phẩm cùng loại để đổi mới.

#### Scenario: Khách yêu cầu trả hàng lấy tiền mặt cho hóa đơn đặt trước không có lỗi
- **GIVEN** Hóa đơn `HD000045` được tạo từ Đơn đặt trước `PO-2026110801` đã hoàn tất bàn giao hôm qua. Khách mang hàng đến xin trả lại lấy tiền vì "không có nhu cầu dùng nữa".
- **WHEN** Thu ngân mở modal Đổi / Trả hàng cho hóa đơn `HD000045` và chọn lý do "Khách đổi ý".
- **THEN** Hệ thống hiển thị thông báo: *"Đơn đặt trước chỉ hỗ trợ Đổi sang sản phẩm khác, không áp dụng hoàn tiền mặt khi sản phẩm không có lỗi từ NSX"*, và vô hiệu hóa nút hoàn tiền mặt, yêu cầu khách chọn sản phẩm đổi mới tương đương giá trị.

#### Scenario: Đơn đặt trước đã nhận bị lỗi nhà sản xuất được hoàn tiền mặt
- **GIVEN** Hóa đơn `HD000045` có sản phẩm đặt trước bị biến chất do lỗi đóng gói của NSX.
- **WHEN** Thu ngân chọn lý do "Lỗi do Nhà Sản Xuất" và quầy hết hàng đổi.
- **THEN** Hệ thống cho phép duyệt hoàn tiền mặt từ két quầy với ghi chú xác nhận lỗi NSX.

---

## Acceptance Checklist
- [ ] Xóa bỏ hoàn toàn hình thức hoàn tiền chuyển khoản và cấn trừ sổ nợ khỏi giao diện Đổi/Trả hàng.
- [ ] Chặn hoàn tiền và hiển thị hướng dẫn nạp két nếu số dư tiền mặt trong két ca < số tiền cần hoàn.
- [ ] Bắt buộc chọn tình trạng hàng trả: `Restock` (Cộng lại tồn kho) hoặc `Damaged` (Không cộng tồn kho bán lẻ).
- [ ] Bắt buộc chọn danh mục lý do đổi trả.
- [ ] Đơn đặt trước ở Tab "Đơn Đặt Trước & Giữ Kho" có thao tác Hủy đơn / Đổi món đặt trước.
- [ ] Hóa đơn có nguồn gốc Đơn đặt trước ở Tab "Hóa Đơn Bán Lẻ" chỉ cho phép Đổi hàng (Exchange), cấm Trả hàng hoàn tiền mặt trừ khi có lỗi NSX.
