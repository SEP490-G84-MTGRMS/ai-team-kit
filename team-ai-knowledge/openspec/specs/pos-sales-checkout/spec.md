# Spec: pos-sales-checkout

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-POS-LAYOUT-01 Tách chế độ Bán thường thành Popup cảm ứng độc lập
Hệ thống SHALL hiển thị danh mục sản phẩm cảm ứng (chế độ Bán thường) dưới dạng một Modal/Popup (`PosCatalogModal`) thay vì render trực tiếp chèn ép bên dưới bảng giỏ hàng.
- Khi người dùng bấm nút "Bán thường" trên thanh công cụ hoặc nhấn phím tắt `F3`, hệ thống SHALL mở Modal Danh mục sản phẩm.
- Khi người dùng nhấn nút thêm `[+]` hoặc nhấp vào thẻ sản phẩm, sản phẩm SHALL được thêm ngay vào giỏ hàng của hóa đơn hiện tại.
- Khi người dùng nhấn nút "Đóng" (✕), nút "Hoàn tất chọn hàng" hoặc nhấn phím `ESC`, Modal SHALL được đóng lại và màn hình chính hiển thị giỏ hàng không bị xáo trộn.

#### Scenario: Mở và đóng popup danh mục bán thường
- **GIVEN** Thu ngân đang ở màn hình bán hàng POS với giỏ hàng hiện tại.
- **WHEN** Thu ngân nhấn nút "Bán thường" hoặc nhấn phím tắt `F3`.
- **THEN** Hệ thống hiển thị Modal Danh mục sản phẩm cảm ứng với đầy đủ bộ lọc danh mục và lưới ảnh sản phẩm.
- **WHEN** Thu ngân nhấp chọn 2 sản phẩm và nhấn nút "Đóng" (hoặc phím `ESC`).
- **THEN** Modal đóng lại, 2 sản phẩm vừa chọn đã xuất hiện trong bảng giỏ hàng và bảng giỏ hàng giữ nguyên diện tích hiển thị đầy đủ.

---

### Requirement: REQ-POS-LAYOUT-02 Mở rộng sức chứa bảng giỏ hàng hiển thị tối thiểu 7 mặt hàng
Bảng giỏ hàng (`PosCartTable`) SHALL được cấu hình kích thước và padding tối ưu để hiển thị rõ ràng tối thiểu 7 dòng sản phẩm cùng lúc trên màn hình độ phân giải tiêu chuẩn (1366x768 trở lên) mà không bị che khuất hoặc ép cuộn sớm.
- Chiều cao vùng bảng giỏ hàng (`.pos-table-responsive`) SHALL mở rộng linh hoạt (chiều cao khả dụng $\ge 460px$).
- Khoảng cách đệm dòng (`padding`) của các ô bảng giỏ hàng SHALL được điều chỉnh gọn gàng (khoảng 6px - 8px dọc) nhằm tối ưu mật độ thông tin mà vẫn đảm bảo độ dễ đọc và dễ click nút tăng giảm số lượng.

#### Scenario: Hiển thị giỏ hàng có 7 sản phẩm
- **GIVEN** Đơn hàng hiện tại có 7 sản phẩm khác nhau.
- **WHEN** Thu ngân quan sát danh sách mặt hàng trong giỏ hàng.
- **THEN** Toàn bộ 7 sản phẩm đều nằm trong tầm nhìn trực quan của bảng giỏ hàng mà không bị cắt cụt.

---

### Requirement: REQ-POS-LAYOUT-03 Tối ưu chiều rộng và khoảng cách cột thanh toán chống tràn đáy
Cột thanh toán bên phải (`PosPaymentPanel`) SHALL được mở rộng chiều ngang (tăng lên 440px - 460px) và tối ưu hóa khoảng cách nội bộ để hiển thị trọn vẹn từ thông tin quầy, khách hàng, chiết khấu đến nút THANH TOÁN mà không bị tràn màn hình xuống dưới.
- Chiều rộng cột `.pos-right-column` SHALL là `450px` (hoặc linh hoạt theo tỷ lệ màn hình).
- Đệm nội bộ (`padding`) và khoảng cách (`gap`) giữa các khối fieldset SHALL được tinh chỉnh cô đọng (gap 8px, padding 12px) để giảm chiều cao tổng thể của panel thanh toán.
- Vùng tính tiền và các nút phương thức thanh toán SHALL hiển thị sắc nét, các số liệu tổng tiền, chiết khấu, khách cần trả và tiền thừa không bị che khuất.

#### Scenario: Hiển thị đầy đủ cột thanh toán không bị cuộn trang
- **GIVEN** Thu ngân mở màn hình bán hàng với đầy đủ thông tin khách hàng thành viên có nợ cũ.
- **WHEN** Quan sát cột thanh toán bên phải.
- **THEN** Toàn bộ thông tin từ thẻ khách hàng, bảng tính tiền hóa đơn, lựa chọn phương thức thanh toán đến nút bấm THANH TOÁN lớn nằm gọn trong khung nhìn màn hình, không bị thụt tràn đáy.

## Lịch sử
- 2026-10-26 · `refactor-pos-sales-layout` · +0 ~3 -0
