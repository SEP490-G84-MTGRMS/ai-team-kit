# Spec: pos

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-POS-01 Bố cục quầy POS & Đa phiên đơn hàng (Multi-Tab Orders)
Hệ thống MUST cung cấp giao diện Quầy Bán Hàng POS toàn màn hình với Header Toolbar hiển thị tên Chi nhánh (`Branches`), số Quầy (`Quầy #01`), tên Thu ngân trực ca (`Employees`), bảng phím tắt (F1-F12), và cơ chế quản lý đa phiên hóa đơn (Multi-Tab Sessions) cho phép nhân viên bán hàng chuyển đổi qua lại giữa các hóa đơn mà không bị mất dữ liệu.

#### Scenario: Chuyển đổi và tạo mới tab hóa đơn
- GIVEN Quầy POS đang mở ở "Hóa đơn 1" và có 2 mặt hàng trong giỏ.
- WHEN Thu ngân nhấn nút `[+] [F1]` hoặc nhấn phím tắt `F1`.
- THEN Hệ thống MUST tạo thêm một phiên tab mới "Hóa đơn 2" với giỏ hàng rỗng và chuyển focus sang tab mới.
- WHEN Thu ngân nhấn lại tab "Hóa đơn 1".
- THEN Hệ thống MUST khôi phục nguyên vẹn 2 mặt hàng cùng thông tin khách hàng của "Hóa đơn 1".

---

### Requirement: REQ-POS-02 Quét mã Barcode & Hai chế độ bán hàng (Nhanh & Thường)
Hệ thống MUST hỗ trợ 2 chế độ bán hàng:
1. **Chế độ Bán nhanh (Barcode Focus)**: Ẩn danh mục sản phẩm, tối ưu cho việc quét barcode liên tục bằng máy quét mã vạch hoặc nhập SKU/tên phím tắt [F2].
2. **Chế độ Bán thường (Touch Screen Catalog)**: Hiển thị lưới sản phẩm dạng thẻ cảm ứng, hỗ trợ lọc theo danh mục (`Categories`), phân trang (Trang 1, Trang 2) với các nút lật trang tái sử dụng phong cách hệ thống, và nút `[+] Thêm` vào giỏ.

#### Scenario: Quét mã vạch thêm vào giỏ ở chế độ Bán nhanh
- GIVEN Thu ngân đang ở chế độ Bán nhanh, ô tìm kiếm đang focus.
- WHEN Thu ngân quét mã vạch `SP000078` hoặc gõ `SP000078` rồi ấn Enter.
- THEN Mặt hàng "Áo thun polo nam sọc ngang" MUST được thêm ngay vào giỏ hàng với số lượng 1.
- WHEN Thu ngân tiếp tục quét mã `SP000078` một lần nữa.
- THEN Số lượng của mặt hàng này trong giỏ MUST tự động tăng lên thành 2.

#### Scenario: Chọn sản phẩm từ danh mục cảm ứng ở chế độ Bán thường
- GIVEN Thu ngân bấm chuyển sang chế độ "Bán thường".
- WHEN Lưới sản phẩm hiển thị, thu ngân chọn danh mục "Nước & Đồ uống" và bấm `[+] Thêm` tại món "Redbull Thái 250ml".
- THEN Món "Redbull Thái 250ml" (ĐVT: Lon, Giá: 12,500 đ) MUST được đưa vào giỏ hàng.

---

### Requirement: REQ-POS-03 Quản lý giỏ hàng, Chiết khấu món & Kiểm soát giá vốn (FE-03.2)
Hệ thống MUST hiển thị bảng giỏ hàng chi tiết (STT, Mã hàng, Tên sản phẩm & quy cách, ĐVT, Số lượng có thể chỉnh sửa, Đơn giá niêm yết, Thành tiền, Nút xóa món). Thu ngân có thể mở Popover điều chỉnh chiết khấu riêng cho từng món (theo số tiền VND hoặc phần trăm %). Nếu đơn giá bán sau chiết khấu thấp hơn giá vốn (`CostPrice`), hệ thống MUST hiển thị cảnh báo và yêu cầu nhập mã PIN Quản lý mới cho phép áp dụng.

#### Scenario: Điều chỉnh giảm giá món và cảnh báo bán dưới giá vốn
- GIVEN Món SP000078 có đơn giá niêm yết 450,000 đ, giá vốn (CostPrice) là 320,000 đ.
- WHEN Thu ngân mở popover chiết khấu và giảm 10,000 đ.
- THEN Giá bán thực tế thành 440,000 đ, thành tiền cập nhật tương ứng.
- WHEN Thu ngân giảm giá xuống còn 250,000 đ (thấp hơn giá vốn 320,000 đ).
- THEN Hệ thống MUST mở Modal cảnh báo bán dưới giá vốn [FE-03.2] và yêu cầu nhập mã PIN Quản lý.
- WHEN Quản lý nhập đúng mã PIN `8888`.
- THEN Hệ thống MUST phê duyệt cho phép xuất đơn với giá bán đặc biệt này.

---

### Requirement: REQ-POS-04 Quản lý thông tin khách hàng & Tích/Dùng điểm (F4)
Hệ thống MUST cho phép tìm kiếm khách hàng theo Số điện thoại hoặc Tên (`Customers`). Khi chọn khách hàng, hệ thống hiển thị Mã KH, Tên, Điểm tích lũy (`LoyaltyPoints`). Thu ngân có thể chọn checkbox "Dùng điểm tích lũy" để khấu trừ trực tiếp vào số tiền thanh toán của đơn hàng. Hệ thống cũng MUST hỗ trợ Modal thêm nhanh khách hàng mới ngay tại quầy.

#### Scenario: Tìm kiếm và áp dụng điểm tích lũy của khách hàng
- GIVEN Thu ngân nhập `0912345678` vào ô tìm kiếm khách hàng [F4].
- WHEN Chọn khách hàng "Hoàng Sơn (KH000006)" với 200 điểm tích lũy.
- THEN Thẻ thông tin khách hàng hiển thị rõ ràng trên cột thanh toán.
- WHEN Thu ngân tích chọn "Dùng điểm tích lũy 20,000 đ".
- THEN Số tiền "Khách cần trả" MUST được giảm trừ chính xác 20,000 đ.

---

### Requirement: REQ-POS-05 Tính tiền & Đa phương thức thanh toán (Tiền mặt / Dynamic VietQR)
Hệ thống MUST tự động tính:
1. `Tổng tiền hàng`
2. `Giảm giá khuyến mại tự động`
3. `Khấu trừ điểm tích lũy`
4. `Khách cần trả`
Hỗ trợ 2 phương thức thanh toán:
- **Tiền mặt (F8)**: Thu ngân nhập tiền khách đưa, hệ thống tự tính tiền thừa trả khách.
- **Chuyển khoản VietQR (FE-13.2)**: Mở Modal Dynamic VietQR Napas 247 hiển thị mã QR thanh toán theo đúng số tiền cần trả và mã đơn hàng.

#### Scenario: Thanh toán tiền mặt và tính tiền thừa
- GIVEN Đơn hàng có số tiền khách cần trả là 389,200 đ.
- WHEN Thu ngân chọn Tiền mặt và nhập Tiền khách đưa là 400,000 đ.
- THEN Hệ thống MUST tính và hiển thị Tiền thừa trả khách là 10,800 đ.

#### Scenario: Thanh toán qua chuyển khoản VietQR
- GIVEN Đơn hàng có số tiền cần thanh toán là 389,200 đ.
- WHEN Thu ngân chọn phương thức "Chuyển khoản VietQR".
- THEN Modal Dynamic VietQR MUST xuất hiện với mã QR Napas 247, số tiền 389,200 đ và mã đơn hàng HD000042.
- WHEN Thu ngân bấm "Xác nhận đã nhận tiền & In hóa đơn K80".
- THEN Đơn hàng MUST chuyển sang trạng thái đã thanh toán và kích hoạt in hóa đơn.

---

### Requirement: REQ-POS-06 Mẫu in Hóa đơn nhiệt K80 chuẩn ESC/POS
Hệ thống MUST cung cấp Modal xem trước và Mẫu in Hóa đơn nhiệt K80 (rộng chuẩn 80mm / 320px) với font chữ Monospace, hiển thị đầy đủ thông tin cửa hàng, thông tin khách hàng, chi tiết danh sách mặt hàng kèm số Lô FEFO (`BatchCode`), bảng tổng kết tài chính, số tiền bằng chữ, mã VietQR chân bill và hỗ trợ lệnh in `window.print()`.

#### Scenario: Xem và in hóa đơn nhiệt K80
- GIVEN Thu ngân hoàn tất thanh toán hoặc bấm nút "In bill gần nhất".
- WHEN Modal Mẫu in Hóa đơn K80 mở ra.
- THEN Giao diện hóa đơn MUST có chiều rộng chuẩn 320px, có đầy đủ các thông tin: Tiêu đề cửa hàng, số HĐ, ngày giờ, thu ngân, khách hàng, danh sách mặt hàng kèm Lô, tổng thanh toán, tiền bằng chữ và mã QR.
- WHEN Thu ngân bấm nút "Thực Hiện In Ngay".
- THEN Trình duyệt MUST mở hộp thoại in hệ thống `window.print()`.

---

## Lịch sử
- 2026-10-13 · `pos-sales-checkout-ui` · +6 ~0 -0
