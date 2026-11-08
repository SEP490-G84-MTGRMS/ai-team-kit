# Specs: pos-sales-checkout-ui

## API / Contract (Giao diện & Cấu trúc dữ liệu)
| Thành phần | Endpoint / Handler | Request DTO | Response DTO | Lỗi / Validation |
|---|---|---|---|---|
| Quét mã sản phẩm | `handleScanProduct(barcode)` | `{ barcode: string }` | `Product | null` | Không tìm thấy -> Gợi ý thêm nhanh |
| Tìm khách hàng | `handleSearchCustomer(query)` | `{ query: string }` | `Customer[]` | Không tìm thấy -> Gợi ý thêm mới |
| Thanh toán đơn hàng | `handleCheckout(orderPayload)` | `CheckoutOrderRequest` | `OrderReceiptResponse` | Giỏ hàng rỗng; tiền khách đưa < cần trả |
| Xác thực PIN quản lý | `handleVerifyPin(pin)` | `{ pin: string }` | `{ success: boolean }` | Sai mã PIN (mặc định '8888') |

---

## ADDED Requirements

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

## Acceptance checklist
- [ ] REQ-POS-01: Giao diện POS Fullscreen, đầy đủ Header quầy, Multi-Tab hóa đơn hoạt động độc lập không mất giỏ hàng.
- [ ] REQ-POS-02: Hỗ trợ cả 2 chế độ Bán nhanh (Barcode) và Bán thường (Touch Screen Catalog có phân trang chuẩn).
- [ ] REQ-POS-03: Bảng giỏ hàng đầy đủ trường, chỉnh số lượng, popover chiết khấu món, cảnh báo bán dưới giá vốn kèm mã PIN 8888.
- [ ] REQ-POS-04: Tìm kiếm khách hàng F4, hiển thị điểm tích lũy, checkbox trừ điểm, Modal thêm khách hàng mới.
- [ ] REQ-POS-05: Bảng tính tiền tự động, thanh toán Tiền mặt tính tiền thừa, Modal Dynamic VietQR Napas 247.
- [ ] REQ-POS-06: Mẫu in Hóa đơn nhiệt K80 chuẩn khổ 80mm ESC/POS có nút `window.print()`.
- [ ] Chuẩn Design System: Tone màu Deep Teal `#0F766E`, font `Be Vietnam Pro`, các nút bo tròn theo token `:root`.
- [ ] Không đẩy bất kỳ commit nào lên GitHub của repo `MT_GRMS_FRONTEND`.

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: refactor-pos-sales-layout -->
# Delta Specs: Tối ưu Bố cục Màn hình Bán hàng POS

## MODIFIED Requirements

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


<!-- Sáp nhập từ change: pos-customer-persistence-and-receipt-redesign -->
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


<!-- Sáp nhập từ change: pos-inventory-invoice-ui -->
# Đặc tả Yêu cầu Chi tiết (Delta Specs) — pos-inventory-invoice-ui

## 1. Yêu cầu Màn hình Tra cứu Tồn kho & Lô FEFO (FE-12)

### ADD: Tra cứu tồn kho đa chi nhánh theo thời gian thực
- **Mã yêu cầu**: `REQ-FE-INV-01`
- **Mô tả**: Nhân viên có thể tìm kiếm sản phẩm theo Tên, SKU hoặc Barcode. Hệ thống hiển thị số lượng tồn kho vật lý, số lượng đang giữ đơn (Hold) và số lượng khả dụng (Available = Vật lý - Hold) tại chi nhánh hiện tại cũng như các chi nhánh khác trong cùng chuỗi cửa hàng.
- **Kịch bản nghiệm thu**:
  - Gõ tên "Sữa chua Ba Vì" hoặc mã vạch "8934567890123", hệ thống gợi ý ngay kết quả phù hợp.
  - Chọn sản phẩm, bảng chi nhánh hiển thị chi tiết số lượng của Chi nhánh Trung tâm, Chi nhánh Hà Đông, Chi nhánh Cầu Giấy và Tổng kho Mê Linh.
  - Các chi nhánh có tồn khả dụng thấp hơn định mức tối thiểu hiển thị cảnh báo màu đỏ "Dưới định mức".

### ADD: Quản lý và đề xuất Lô hàng theo nguyên tắc FEFO (First Expired, First Out)
- **Mã yêu cầu**: `REQ-FE-INV-02`
- **Mô tả**: Khi chọn sản phẩm, bảng lô hàng liệt kê tất cả các lô còn tồn, tự động sắp xếp theo thứ tự Hạn sử dụng (EXP) tăng dần. Lô có hạn dùng gần nhất được đánh số ưu tiên `[ #1 ]`.
- **Kịch bản nghiệm thu**:
  - Lô hạn dưới 7 ngày: hiển thị huy hiệu đỏ "Khẩn cấp (< 7 ngày)".
  - Lô hạn 7-14 ngày: hiển thị huy hiệu cam "Cận date cao".
  - Lô hạn 15-30 ngày: hiển thị huy hiệu vàng "Ưu tiên xả hàng".
  - Lô hạn trên 30 ngày: hiển thị huy hiệu xanh lá "Hạn dùng an toàn".
  - Thu ngân có thể bấm "✔ Chọn Lô bán POS" để chọn chính xác lô này bán cho khách, hoặc bấm "🏷 Xả Hàng -20%" để kích hoạt chế độ xả hàng.

### ADD: Yêu cầu luân chuyển kho nội bộ
- **Mã yêu cầu**: `REQ-FE-INV-03`
- **Mô tả**: Cho phép nhân viên gửi đề xuất điều chuyển hàng hóa từ chi nhánh dồi dào hàng hoặc tổng kho về chi nhánh hiện tại thông qua form Modal chuyển kho.

---

## 2. Yêu cầu Màn hình Quản lý Hóa đơn & Đơn đặt trước (FE-14)

### ADD: Danh sách & Tra cứu lịch sử Hóa đơn bán lẻ
- **Mã yêu cầu**: `REQ-FE-ORD-01`
- **Mô tả**: Danh sách toàn bộ hóa đơn phát sinh tại quầy thu ngân trong ngày hoặc theo khoảng ngày lọc (Hôm nay, hôm qua, tuần này, tháng này).
- **Kịch bản nghiệm thu**:
  - 100% hóa đơn bán lẻ ghi nhận trạng thái Đã thanh toán (qua VietQR hoặc Tiền mặt) hoặc Đã hủy / Đổi trả. Không có nợ lẻ.
  - Hỗ trợ tìm kiếm theo Mã hóa đơn (`HD000041`) hoặc Tên / SĐT khách hàng.
  - Phân trang chuẩn bằng component dùng chung `TablePagination`.

### ADD: Xem chi tiết hóa đơn & Xem trước in bill K80
- **Mã yêu cầu**: `REQ-FE-ORD-02`
- **Mô tả**: Bấm vào hóa đơn mở xem chi tiết các dòng hàng (Tên, ĐVT, số lượng, đơn giá, giảm giá, thành tiền), thông tin thu ngân, mã giao dịch VietQR. Bấm "In lại bill" mở Modal xem trước hóa đơn in nhiệt K80 đúng chuẩn siêu thị bán lẻ.

### ADD: Quản lý Đơn đặt trước & Giữ kho (Pre-order)
- **Mã yêu cầu**: `REQ-FE-ORD-03`
- **Mô tả**: Quản lý các đơn đặt trước của khách hàng tại quầy (khách đặt trước sản phẩm số lượng lớn hoặc hàng tươi sống, đặt cọc trước và hẹn giờ lấy).
- **Ràng buộc đặc biệt**: KHÔNG có phần giao hàng tận nơi hay phí vận chuyển (Store pickup only).

---

## 3. Yêu cầu Điều hướng & Menu POS

### ADD: Tích hợp Menu Hamburger [ ≡ Thao tác ] tại PosHeader
- **Mã yêu cầu**: `REQ-FE-NAV-01`
- **Mô tả**: Thêm 2 mục liên kết trực tiếp vào menu thả xuống của nút `Thao tác` trên `PosHeader.tsx`:
  - `📦 Tra cứu tồn kho & Lô FEFO` -> điều hướng đến `/employee/inventory-lookup`
  - `📄 Quản lý hóa đơn & Đặt trước` -> điều hướng đến `/employee/orders`
- Khai báo routing đầy đủ trong `src/app/router.tsx` hỗ trợ cả tiền tố `/employee/` và `/pos/`.


<!-- Sáp nhập từ change: pos-invoice-layout-and-debt-payment-method -->
# Specification Delta: POS Invoice Layout & Credit Debt Payment Method

## Capability: pos-sales-order

## MODIFIED Requirements

### Requirement: REQ-POS-INVOICE-01 Nhận diện và hiển thị phương thức thanh toán nợ CREDIT trong Quản lý hóa đơn POS
Hệ thống Frontend tại màn hình Quản lý Hóa Đơn (`/pos/invoices`) **MUST** nhận diện chính xác các hóa đơn có `paymentMethod` là `CREDIT` hoặc `DEBT`.
Khi hóa đơn là đơn mua nợ chưa tất toán:
1. Cột `Phương thức TT` **MUST** hiển thị nhãn `Ghi nợ` (màu cam/vàng, icon thẻ tín dụng).
2. Cột `Khách đã trả` **MUST** hiển thị số tiền khách hàng đã thực trả (mặc định `0 đ` đối với đơn nợ toàn phần).
3. Cột `Trạng thái` **MUST** hiển thị nhãn trạng thái `Còn nợ [số tiền nợ] đ` (badge cảnh báo màu đỏ/cam).
4. Dòng theo dõi công nợ chi tiết **MUST** hiển thị chính xác số tiền đã thanh toán và số tiền còn nợ lại.
5. Bộ lọc phương thức thanh toán `DEBT` **MUST** lọc ra tất cả hóa đơn có `paymentMethod === 'CREDIT'` hoặc `paymentMethod === 'DEBT'`.

#### Scenario: Hiển thị đúng hóa đơn mua nợ CREDIT
- **GIVEN** Đơn hàng `HD261105073958260` có `PaymentMethod = "CREDIT"`, `TotalAmount = 474,000 VND`, `FinalAmount = 474,000 VND`, `PaymentStatus = "UNPAID"`.
- **WHEN** Người dùng vào màn hình Quản lý Hóa Đơn Bán Hàng (`/pos/invoices`).
- **THEN** Dòng hóa đơn **MUST** hiển thị:
  - Phương thức TT: `Ghi nợ` (badge màu cam `#fffbeb`, viền `#fde68a`, chữ `#b45309`).
  - Khách đã trả: `0 đ` (hoặc tiền cọc nếu có).
  - Trạng thái: `Còn nợ 474.000 đ`.
  - Thanh theo dõi công nợ: `Đã thanh toán: 0 đ • Còn nợ lại: 474.000 đ`.
- **AND** Hóa đơn **MUST NOT** hiển thị nhãn `Tiền mặt` màu xanh.

#### Scenario: Lọc hóa đơn theo phương thức thanh toán Ghi nợ
- **GIVEN** Danh sách hóa đơn bao gồm cả đơn tiền mặt `CASH`, chuyển khoản `VIETQR` và bán nợ `CREDIT`.
- **WHEN** Người dùng chọn bộ lọc "Phương thức: Ghi nợ".
- **THEN** Hệ thống **MUST** hiển thị tất cả các đơn có `paymentMethod === 'CREDIT'` hoặc `paymentMethod === 'DEBT'`, bao gồm cả `HD261105073958260`.

---

### Requirement: REQ-POS-INVOICE-02 Bố cục bảng quản lý hóa đơn cân đối và thẩm mỹ
Hệ thống **MUST** phân bổ độ rộng các cột bảng hóa đơn (`pos-shift-table`) cân đối, tránh tràn vỡ chữ:
1. Cột `Mã hóa đơn` **MUST** có độ rộng tối thiểu `180px` để chứa trọn vẹn mã đơn 17 ký tự và nhãn tên chi nhánh.
2. Cột `Thao tác` **MUST** có độ rộng tối thiểu `210px` để chứa đủ các nút hành động mà không bị bẻ dòng.
3. Các cột tiền (`Tổng tiền hàng`, `Giảm giá`, `Khách đã trả`) **MUST** có min-width từ `95px` đến `110px`, căn phải chuẩn xác.
4. Thông tin thu ngân chi tiết **MUST NOT** hiển thị cặp dấu ngoặc đơn rỗng `()` khi không có `cashierId`.

#### Scenario: Hiển thị bảng hóa đơn cân xứng không bị co kéo
- **GIVEN** Người dùng mở màn hình Quản lý Hóa Đơn Bán Hàng trên trình duyệt desktop.
- **WHEN** Danh sách hóa đơn được nạp và người dùng bấm mở rộng chi tiết một hóa đơn.
- **THEN** Cột mã hóa đơn không bị tràn, nút thao tác hiển thị ngay ngắn trên một hàng, và dòng thông tin thu ngân hiển thị `Thu ngân: Thu ngân quầy` (không có dấu ngoặc rỗng `()`).


<!-- Sáp nhập từ change: pos-receipt-layout-cashier-and-preorder-units -->
# Specification Delta: Bố cục in nhiệt 2 dòng, Định danh người tạo động và Đơn vị đặt trước

## Capability Summary
Đặc tả chi tiết các cải tiến cho việc in hóa đơn bán lẻ POS-58, đồng bộ tên người tạo hóa đơn theo vai trò và mở rộng khả năng chọn đơn vị quy đổi (thùng/lốc/hộp/kg) cho đơn đặt trước giữ kho.

## Architecture Map
- **Thermal Print**: `MT_GRMS_BACKEND` -> `IThermalPrintService` / `ThermalPrintService.cs` (ESC/POS RAW binary)
- **Order Service**: `MT_GRMS.Application/PosOrders/OrderService.cs` -> `CreatePreOrderAsync` & `PrintOrderInvoiceAsync`
- **Frontend POS**: `PosCheckoutPage.tsx`, `PosReceiptModal.tsx`, `InvoiceManagementPage.tsx`, `CreatePreOrderModal.tsx`

---

## MODIFIED Requirements

### Requirement: REQ-POS-PRINT-01 Bố cục in hóa đơn nhiệt 2 dòng chống chèn số liệu
Máy in nhiệt POS-58 (Font B 40 ký tự) MUST in từng mặt hàng theo bố cục 2 dòng chuẩn bán lẻ:
- **Dòng 1**: Số thứ tự và Tên sản phẩm đầy đủ, tự động ngắt dòng trọn chữ (word-wrap) nếu dài hơn 40 ký tự mà không bao giờ chèn vào dòng số liệu.
- **Dòng 2**: `   {SL} x {DonGia}` căn trái (thụt lề 3 khoảng trắng) và `{ThanhTien}` căn phải tại cột 40.

#### Scenario: In mặt hàng có tên dài trên 35 ký tự
- **GIVEN** Một đơn hàng chứa sản phẩm "Bánh Orion Choco-Pie truyền thống Hộp 12 cái" số lượng 2, đơn giá 55.000đ, thành tiền 110.000đ.
- **WHEN** Gửi lệnh in hóa đơn qua `ThermalPrintService`.
- **THEN** Dòng 1 in trọn vẹn tên sản phẩm và dòng 2 in tách biệt `   2 x 55.000` bên trái và `110.000` căn phải sát cột 40, không có chữ nào bị đè hoặc lẫn vào dòng tiếp theo.

---

### Requirement: REQ-POS-CASHIER-01 Định danh người tạo / thu ngân động
Hóa đơn in nhiệt, popup xem trước hóa đơn và màn hình Quản lý hóa đơn MUST hiển thị thông tin người tạo theo quy tắc:
- Nếu tài khoản có vai trò `STORE_OWNER` / `Owner`: Hiển thị `Chủ cửa hàng: {FullName || Username}`.
- Nếu tài khoản có vai trò `STAFF` / `CASHIER`: Hiển thị `{FullName || Username}`.
- Tuyệt đối loại bỏ các chuỗi gán cứng tĩnh như `"Thu ngan"` hay `"NV: Nguyễn Bá Sơn (NV004)"`.

#### Scenario: Chủ cửa hàng đăng nhập bán hàng và in hóa đơn
- **GIVEN** Người dùng đăng nhập có vai trò `STORE_OWNER` với họ tên "Trần Văn An".
- **WHEN** Tiến hành thanh toán và in hóa đơn POS.
- **THEN** Hóa đơn in ra có dòng `Chu cua hang: Tran Van An` và danh sách hóa đơn hiển thị người tạo là `Chủ cửa hàng: Trần Văn An`.

#### Scenario: Nhân viên thu ngân làm ca bán hàng
- **GIVEN** Người dùng đăng nhập có vai trò `CASHIER` với họ tên "Lê Hoàng Nam".
- **WHEN** Lập hóa đơn và kiểm tra trang Quản lý hóa đơn.
- **THEN** Huy hiệu nhân viên và thông tin thu ngân trên hóa đơn hiển thị `Lê Hoàng Nam`.

---

### Requirement: REQ-POS-PREORDER-UNIT-01 Chọn đơn vị quy đổi khi tạo đơn đặt trước
Modal `CreatePreOrderModal.tsx` SHALL cho phép người dùng chọn đơn vị tính từ danh sách `product.unitPrices`:
- Mặc định chọn đơn vị cơ bản hoặc đơn vị đầu tiên.
- Khi người dùng đổi đơn vị (ví dụ từ Hộp sang Thùng):
  - Đơn giá của dòng tự động cập nhật theo `price` của đơn vị đó.
  - Số lượng tối đa cho phép nhập được tính theo công thức `Math.floor(product.quantityOnHand / conversionRate)`.
  - Tổng tiền đặt trước và tiền cọc tối thiểu (10%) được tính lại chính xác theo đơn giá mới.

#### Scenario: Khách đặt trước 2 thùng bánh Chocopie
- **GIVEN** Sản phẩm "Bánh Chocopie" có đơn vị cơ bản là Hộp (55.000đ, tồn kho 80 hộp) và đơn vị quy đổi Thùng (24 hộp/thùng, giá 1.250.000đ).
- **WHEN** Nhân viên thêm bánh vào đơn đặt trước và chọn đơn vị là "Thùng".
- **THEN** Đơn giá dòng hiển thị `1.250.000 đ`, số lượng tối đa cho phép là 3 thùng (floor(80/24)), và nếu nhập 2 thùng thì tổng tiền là 2.500.000đ, tiền cọc tối thiểu là 250.000đ.

---

### Requirement: REQ-POS-PREORDER-BACKEND-01 Quy đổi tồn kho khi tạo đơn đặt trước tại Backend
Phương thức `CreatePreOrderAsync` trong `OrderService.cs` MUST nhân số lượng với tỷ lệ quy đổi `conversionRate` của đơn vị được chọn:
- `requiredBaseQty = item.Quantity * conversionRate`.
- So sánh `requiredBaseQty` với tồn kho FEFO khả dụng của chi nhánh và trừ/giữ đúng `requiredBaseQty` đơn vị cơ bản trong các lô hàng.

#### Scenario: Backend giữ tồn kho 2 thùng nước ngọt
- **GIVEN** Sản phẩm Lon Coca tồn kho 100 lon, khách đặt 2 thùng (conversionRate = 24).
- **WHEN** Gọi `POST /api/v1/orders/pre-orders` với `Quantity = 2` và `UnitId = {UnitIdThùng}`.
- **THEN** Backend kiểm tra đủ 48 lon (2 * 24), trừ/giữ đúng 48 lon trong tồn kho chi nhánh và lưu đơn đặt trước thành công.


<!-- Sáp nhập từ change: pos-sepay-ui-and-nav-refinement -->
# Đặc Tả Yêu Cầu (Delta Specs): Tối Ưu Nút Bánh Răng & Mockup SePay Trực Quan (pos-sepay-ui-and-nav-refinement)

## ADDED Requirements

### Requirement: REQ-NAV-SETTINGS-01 Dropdown Tùy Chọn Nút Bánh Răng TopBar
Hệ thống **MUST** hiển thị Dropdown Menu khi người dùng bấm vào nút Bánh Răng trên thanh TopBar (`AppTopNav.tsx`). Menu này **MUST** cung cấp 2 tùy chọn phân định rõ ràng:
1. "Cấu hình Thanh toán VietQR & SePay" (mở `PaymentConfigModal`).
2. "Gói dịch vụ MT-GRMS & Gia hạn" (điều hướng sang `/store-owner/subscriptions`).

#### Scenario: Chủ cửa hàng bấm nút Bánh Răng để chọn chức năng
- **GIVEN** Người dùng đang ở bất kỳ trang quản trị nào có thanh `AppTopNav`
- **WHEN** Người dùng click vào icon Bánh Răng cài đặt
- **THEN** Dropdown menu hiển thị ngay dưới nút với 2 mục: Cấu hình thanh toán và Gói dịch vụ. Bấm vào Gói dịch vụ thì chuyển đến trang `/store-owner/subscriptions`; bấm vào Cấu hình thanh toán thì mở modal `PaymentConfigModal`.

---

### Requirement: REQ-STORE-HUB-PAYMENT-01 Tab Cấu Hình Thanh Toán Trong StoreSettingsHubPage
Hệ thống **MUST** bổ sung thêm Tab "Tài khoản thanh toán VietQR" (`payment-config`) vào thanh menu bên trái của trang `StoreSettingsHubPage.tsx`. Tab này **SHALL** cho phép Chủ cửa hàng xem và chỉnh sửa thông tin tài khoản ngân hàng, SePay API Key, và xem hướng dẫn kết nối trực tiếp trên trang quản trị gian hàng.

#### Scenario: Chủ cửa hàng truy cập Tab Cấu hình thanh toán trong Store Hub
- **GIVEN** Chủ cửa hàng đang ở trang `StoreSettingsHubPage.tsx`
- **WHEN** Người dùng bấm vào mục "Tài khoản thanh toán VietQR" trên thanh sidebar bên trái
- **THEN** Giao diện hiển thị form cấu hình ngân hàng thụ hưởng, số tài khoản, tên chủ tài khoản, API Key SePay và nút xem hướng dẫn đăng ký SePay trực quan.

---

### Requirement: REQ-SEPAY-VISUAL-MOCKUP-01 Mockup Giao Diện SePay Trực Quan Chân Thực
Tab Hướng Dẫn Đăng Ký SePay trong `PaymentConfigModal` **MUST** tích hợp các khối mockup mô phỏng chân thực giao diện bảng điều khiển SePay (`my.sepay.vn`):
1. Mockup màn hình **Tích hợp Web → API Key**: Thể hiện rõ thanh menu bên trái của SePay, nút `+ Tạo API Key`, ô hiển thị key và nút `Sao chép` kèm callout chỉ dẫn nổi bật.
2. Mockup màn hình **Tích hợp Web → Webhooks**: Thể hiện form tạo webhook với ô nhập URL, chọn tài khoản nhận tiền và sự kiện nhận tiền.

#### Scenario: Chủ cửa hàng xem hướng dẫn đăng ký SePay có mockup giao diện
- **GIVEN** Modal `PaymentConfigModal` đang mở ở Tab "Hướng Dẫn Đăng Ký SePay"
- **WHEN** Người dùng cuộn xuống xem các bước 3 và 4
- **THEN** Người dùng nhìn thấy khung mô phỏng trực quan chuẩn màu sắc và layout của SePay, có mũi tên chỉ dẫn nổi bật: "👉 BƯỚC 3: Bấm Copy mã này dán sang MT-Mart" và "👉 BƯỚC 4: Dán link Webhook vào đây", giúp người dùng thao tác chính xác 100% khi sang trang SePay thật.

---

## Acceptance Checklist
- [ ] Nút Bánh Răng trên TopBar có menu dropdown không làm mất lối vào trang Gói dịch vụ.
- [ ] Trang `StoreSettingsHubPage.tsx` có thêm Tab "Tài khoản thanh toán VietQR".
- [ ] Cẩm nang hướng dẫn SePay hiển thị khung Mockup giao diện thực tế rõ ràng, trực quan.
- [ ] Build Frontend thành công 100% (0 lỗi).


<!-- Sáp nhập từ change: pos-vietqr-sepay-payment-and-settings -->
# Đặc Tả Yêu Cầu (Delta Specs): Tích Hợp Thanh Toán VietQR Tự Động & Cổng SePay (pos-vietqr-sepay-payment-and-settings)

## ADDED Requirements

### Requirement: REQ-PAY-CONFIG-01 Cấu Hình Tài Khoản Ngân Hàng & SePay API Key Cho Chủ Cửa Hàng
Hệ thống **MUST** cung cấp giao diện cấu hình tài khoản ngân hàng và SePay API Key cho Chủ cửa hàng (`STORE_OWNER`) tại nút Bánh răng cài đặt trên Header POS (`PosHeader.tsx`) và trên thanh điều hướng (`AppTopNav.tsx`). API Key **MUST** được che mặt nạ bảo mật (`sepay_apikey_••••••••`) và được mã hóa lưu trữ bằng thuật toán AES-256 ở tầng Backend. Thu ngân (`EMPLOYEE` / `CASHIER`) **MUST NOT** có quyền truy cập hoặc xem cấu hình này.

#### Scenario: Chủ cửa hàng thiết lập và lưu thông tin tài khoản ngân hàng thành công
- **GIVEN** Người dùng đã đăng nhập với vai trò Chủ cửa hàng (`STORE_OWNER`) thuộc Tenant `tenant_an_nhien_02`
- **WHEN** Người dùng bấm vào biểu tượng Bánh răng cài đặt và nhập:
  - Ngân hàng: `MB` (MBBank)
  - Số tài khoản: `0918889999`
  - Tên chủ tài khoản: `NGUYEN AN NHIEN`
  - SePay API Key: `sepay_apikey_example_12345`
  - Bật công tắc "Kích hoạt chuyển khoản tự động"
  - Bấm nút "Lưu Cấu Hình"
- **THEN** Hệ thống lưu cấu hình thành công, gửi thông báo thành công "Đã lưu cấu hình tài khoản thanh toán", hiển thị API Key dưới dạng mặt nạ che giấu `sepay_apikey_••••••••`, và cấp đường dẫn Webhook URL của hệ thống kèm nút Sao chép.

#### Scenario: Thu ngân cố gắng truy cập cấu hình thanh toán
- **GIVEN** Người dùng đăng nhập với vai trò Thu ngân (`EMPLOYEE` / `CASHIER`)
- **WHEN** Người dùng quan sát giao diện Header POS hoặc gọi API `GET /api/v1/payments/config`
- **THEN** Biểu tượng Bánh răng cài đặt không hiển thị cấu hình nhạy cảm, và API trả về `403 Forbidden`.

---

### Requirement: REQ-SEPAY-GUIDE-01 Cẩm Nang Hướng Dẫn Đăng Ký SePay Chi Tiết 5 Bước
Hệ thống **MUST** cung cấp một Tab riêng biệt "Hướng Dẫn Đăng Ký SePay" ngay bên trong Modal Cài đặt thanh toán. Hướng dẫn **SHALL** trình bày rõ ràng 5 bước từng bước từ đăng ký tài khoản, liên kết ngân hàng, tạo API Key, sao chép Webhook URL và thực hiện kiểm thử, giải thích rõ quyền hạn Read-only để Chủ tiệm hoàn toàn yên tâm.

#### Scenario: Chủ cửa hàng xem cẩm nang hướng dẫn đăng ký SePay
- **GIVEN** Modal Cài đặt thanh toán đang mở
- **WHEN** Chủ cửa hàng bấm sang Tab "Hướng Dẫn Đăng Ký SePay"
- **THEN** Giao diện hiển thị đầy đủ 5 thẻ bước trực quan:
  1. Đăng ký tài khoản miễn phí tại `my.sepay.vn`
  2. Thêm tài khoản ngân hàng cá nhân
  3. Lấy SePay API Key và dán vào Tab Cấu Hình
  4. Tạo Webhook trên SePay và dán đường dẫn Webhook của cửa hàng
  5. Thử nghiệm thanh toán quét mã QR tại quầy POS
  kèm nút bấm mở link trang chủ SePay và nút sao chép nhanh Webhook URL.

---

### Requirement: REQ-VIETQR-CHECKOUT-01 Sinh Mã VietQR Động Chuẩn Napas 247 Tại Quầy POS
Khi thu ngân hoặc chủ cửa hàng chọn phương thức thanh toán "Chuyển khoản" tại quầy POS, hệ thống **MUST** hiển thị Modal Thanh toán VietQR chứa mã QR động chuẩn Napas 247 với cú pháp nội dung chuyển khoản chứa tiền tố phân lập theo Tenant (`<TENANT_PREFIX>_<ORDER_CODE>`) và số tiền chính xác cần thanh toán (`FinalAmount`).

#### Scenario: Khách hàng thanh toán đơn hàng bằng chuyển khoản quét mã VietQR
- **GIVEN** Quầy POS đang có giỏ hàng với tổng tiền thanh toán là 250.000 VNĐ, mã hóa đơn `HD1005` tại Tenant `tenant_an_nhien_02`
- **WHEN** Thu ngân bấm chọn phương thức "Chuyển khoản"
- **THEN** Modal VietQR xuất hiện hiển thị:
  - Mã QR động chứa link QuickLink chuẩn Napas 247
  - Số tiền: `250.000 đ`
  - Số tài khoản và Tên chủ tài khoản ngân hàng của cửa hàng
  - Nội dung chuyển khoản: `AN02_HD1005`
  - Vòng xoay trạng thái: "Đang chờ khách quét mã thanh toán..."
  - Nút "Kiểm tra thanh toán ngay" và nút "Xác nhận thu tiền thủ công" (dự phòng).

---

### Requirement: REQ-WEBHOOK-SECURITY-01 Xử Lý Webhook SePay Với 6 Lớp Bảo Mật & Đối Soát 2 Chiều
Endpoint `POST /api/v1/payments/sepay-webhook` **MUST** thực hiện xác thực theo mô hình phòng thủ 6 lớp:
1. Lớp 1: Kiểm tra Header `Authorization: Apikey <key>`
2. Lớp 2: Kiểm tra Whitelist IP của SePay
3. Lớp 3 (Then chốt): Gọi ngược lại SePay API `GET /userapi/transactions/details/{id}` bằng chính API Key của Cửa hàng để đối soát xem giao dịch có thực sự tồn tại trong sổ cái ngân hàng hay không.
4. Lớp 4: So khớp số tiền thực nhận `amountIn >= order.FinalAmount` và khớp mã đơn hàng phân lập theo Tenant.
5. Lớp 5: Kiểm tra Idempotency qua `bank_transaction_id` để ngăn chặn tấn công gửi lại (Replay attack).
6. Lớp 6: Gạch nợ đơn hàng và bắn tín hiệu cập nhật thời gian thực về màn hình POS.

#### Scenario: Kẻ gian gửi request webhook ảo bằng Postman
- **GIVEN** Kẻ gian có được Webhook URL và cố tình dùng Postman gửi request giả mạo với ID giao dịch ảo `999999` và số tiền 500.000đ
- **WHEN** Endpoint `POST /api/v1/payments/sepay-webhook` tiếp nhận request
- **THEN** Backend gọi ngược sang SePay API để đối soát ID `999999`, SePay báo giao dịch không tồn tại $\rightarrow$ Backend lập tức từ chối với mã lỗi `400 Bad Request` hoặc `404 Not Found`, ghi log cảnh báo và đơn hàng KHÔNG bị gạch nợ.

#### Scenario: Webhook nhận giao dịch thật từ khách hàng
- **GIVEN** Khách hàng chuyển khoản thật 250.000đ cho đơn `AN02_HD1005`
- **WHEN** SePay bắn webhook về hệ thống
- **THEN** Backend đối soát thành công 2 chiều với SePay, số tiền khớp $\rightarrow$ Cập nhật đơn hàng thành `PAID`, lưu vết giao dịch vào `payment_transactions`, và màn hình POS tự động báo "Thanh toán thành công!".

---

### Requirement: REQ-IDEMPOTENCY-01 Chống Tấn Công Lặp Lại Giao Dịch Ngân Hàng
Hệ thống **MUST** lưu trữ duy nhất mã giao dịch ngân hàng (`bank_transaction_id`) trong bảng `payment_transactions`. Mọi yêu cầu webhook gửi lại cùng một mã giao dịch đã từng xử lý **MUST** bị bỏ qua hoặc từ chối để tránh việc một giao dịch ngân hàng được dùng để thanh toán cho nhiều đơn hàng khác nhau.

#### Scenario: Kẻ gian cố gắng dùng lại mã giao dịch ngân hàng cũ
- **GIVEN** Mã giao dịch ngân hàng `FT263068899011` đã được gạch nợ cho đơn hàng `HD1001` trước đó
- **WHEN** SePay hoặc kẻ gian gửi lại webhook mang mã giao dịch này cho đơn hàng `HD1005`
- **THEN** Hệ thống phát hiện mã giao dịch đã tồn tại trong CSDL, từ chối xử lý và không gạch nợ cho đơn hàng mới.

---

## Acceptance Checklist
- [ ] Chủ cửa hàng có thể mở Modal Cài Đặt Thanh Toán từ nút Bánh răng cài đặt (`PosHeader` & `AppTopNav`).
- [ ] Xem được cẩm nang hướng dẫn đăng ký SePay chi tiết 5 bước.
- [ ] Lưu thành công cấu hình tài khoản ngân hàng và SePay API Key (che mặt nạ an toàn).
- [ ] Tại quầy POS, chọn "Chuyển khoản" sinh ra đúng mã VietQR động chứa số tiền và nội dung đơn hàng.
- [ ] Webhook xử lý an toàn: Chặn đứng 100% request ảo không có tiền thật trong sổ cái ngân hàng.
- [ ] Biên dịch thành công 0 lỗi cả Frontend và Backend.


<!-- Sáp nhập từ change: cart-checkout-bug -->
# Specs: Cart Checkout Bug Fix

## Fix
Thay đổi thứ tự tính trong `CartService.calculateTotal()`:
```
total = (itemPrice - couponDiscount) + tax(itemPrice)
```
Không phải:
```
total = itemPrice * (1 + taxRate) * (1 - couponPercent)  // WRONG
```

## Test Cases
| Item | Coupon | Tax | Expected |
|------|--------|-----|---------|
| 100k | 10% | 10k | 81k (= 100-10+10% của 90) |
| 200k | 20k flat | 5% | 190k |


<!-- Sáp nhập từ change: store-settings-dropdown-nav -->
# Specs: Nâng cấp Nút Cài Đặt TopBar thành Dropdown Menu Điều Hướng Đa Năng

## ADDED Requirements

### Requirement: REQ-TOPNAV-01 Dropdown Menu Cài Đặt Tương Tác
Hệ thống **MUST** thay thế thẻ `<Link>` tĩnh của icon Bánh Răng trên thanh TopBar (`AppTopNav.tsx`) bằng một Dropdown Menu tương tác.
Khi người dùng rê chuột (hover) hoặc click vào icon Bánh Răng, menu cài đặt **SHALL** mở ra ngay phía dưới với độ trễ đóng (debounce) 220ms để chống giật chuột.

#### Scenario: Chủ cửa hàng rê chuột vào icon bánh răng trên TopBar
- **GIVEN** Người dùng đăng nhập với vai trò `STORE_OWNER` và đang ở trang quản trị bất kỳ.
- **WHEN** Người dùng di chuột (hover) vào icon Bánh Răng ở góc phải TopBar.
- **THEN** Menu Dropdown Cài đặt mở ra mượt mà, icon bánh răng sáng nhẹ.
- **AND** Khi rê chuột ra ngoài khu vực menu, menu đóng lại sau 220ms.

#### Scenario: Đóng menu bằng phím Escape hoặc click ngoài
- **GIVEN** Dropdown Menu Cài đặt đang mở.
- **WHEN** Người dùng bấm phím `Escape` hoặc click chuột ra ngoài vùng menu.
- **THEN** Dropdown Menu Cài đặt lập tức đóng lại mà không gây ảnh hưởng đến trang hiện tại.

---

### Requirement: REQ-TOPNAV-02 Phân Nhóm và Điều Hướng Chuẩn Xác
Dropdown Menu Cài Đặt **MUST** hiển thị đầy đủ 2 nhóm tính năng chính:
1. **Thanh toán & Thu ngân**:
   - Mục `Cấu hình VietQR & SePay` **SHALL** trỏ tới `/store-owner/payment-config`.
2. **Gói dịch vụ MT-GRMS (Gia hạn gói)**:
   - Mục `Gói dịch vụ & Nâng cấp` **SHALL** trỏ tới `/store-owner/subscriptions?tab=subscriptions`.
   - Mục `Lịch sử mua hàng` **SHALL** trỏ tới `/store-owner/subscriptions?tab=order-history`.
   - Mục `Bản xác nhận dịch vụ` **SHALL** trỏ tới `/store-owner/subscriptions?tab=service-confirm`.
3. **Gian hàng**:
   - Mục `Thông tin gian hàng & Chi nhánh` **SHALL** trỏ tới `/store-owner/subscriptions?tab=store-info`.

#### Scenario: Bấm chọn Cấu hình VietQR & SePay
- **GIVEN** Dropdown Menu Cài đặt đang mở.
- **WHEN** Người dùng click vào mục "Cấu hình VietQR & SePay".
- **THEN** Hệ thống điều hướng sang trang `/store-owner/payment-config`.
- **AND** Dropdown Menu tự động đóng lại.

#### Scenario: Bấm chọn Gói dịch vụ & Nâng cấp
- **GIVEN** Dropdown Menu Cài đặt đang mở.
- **WHEN** Người dùng click vào mục "Gói dịch vụ & Nâng cấp".
- **THEN** Hệ thống điều hướng sang trang `/store-owner/subscriptions?tab=subscriptions`.
- **AND** Không gây ảnh hưởng hay lỗi logic ở trang quản lý gói của thành viên khác.

---

### Requirement: REQ-TOPNAV-03 Bảo Toàn Mã Nguồn và Không Xung Đột
Hệ thống **MUST NOT** sửa đổi hay can thiệp vào các component `StoreSettingsHubPage.tsx` và `StoreSidebarNav.tsx`.

#### Scenario: Kiểm tra trang Quản lý Gói dịch vụ
- **GIVEN** Người dùng mở URL `/store-owner/subscriptions`.
- **WHEN** Kiểm tra cấu trúc các tab và giao diện của trang.
- **THEN** Trang hiển thị 100% nguyên bản của module Subscription, không bị xáo trộn hay chứa tab dư thừa.

---

## Acceptance Checklist
- [ ] Dropdown Menu mở khi hover/click icon Bánh Răng.
- [ ] Tự động đóng sau 220ms khi rời chuột hoặc nhấn Escape.
- [ ] Mục "Cấu hình VietQR & SePay" mở đúng trang `/store-owner/payment-config`.
- [ ] Mục "Gói dịch vụ & Nâng cấp" mở đúng trang `/store-owner/subscriptions?tab=subscriptions`.
- [ ] Build Frontend thành công không lỗi TypeScript.
