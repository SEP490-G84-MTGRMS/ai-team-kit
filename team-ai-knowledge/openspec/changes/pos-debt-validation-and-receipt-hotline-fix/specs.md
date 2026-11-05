# Specification: pos-debt-validation-and-receipt-hotline-fix

## Capability Summary
Đặc tả chi tiết việc sửa lỗi và chuẩn hóa các luồng nghiệp vụ liên quan đến Modal Thu Nợ, Tìm kiếm khách hàng đa tiêu chí ở POS và Chuẩn hóa nội dung hóa đơn bán lẻ (giao diện web và máy in nhiệt POS-58).

## Architecture Map
- **Frontend Components**:
  - `CollectDebtModal.tsx` (`src/features/pos/components/modals/CollectDebtModal.tsx`)
  - `InvoiceManagementPage.tsx` (`src/features/pos/pages/InvoiceManagementPage.tsx`)
  - `PosPaymentPanel.tsx` (`src/features/pos/components/PosPaymentPanel.tsx`)
  - `PosReceiptModal.tsx` (`src/features/pos/components/PosReceiptModal.tsx`)
  - `PosCheckoutPage.tsx` (`src/features/pos/pages/PosCheckoutPage.tsx`)
- **Backend Services**:
  - `ThermalPrintService.cs` (`MT_GRMS.Infrastructure/Services/Printer/ThermalPrintService.cs`)

---

## MODIFIED Requirements

### Requirement: REQ-POS-DEBT-01 Modal thu nợ và quản lý trạng thái nợ hóa đơn
1. Hệ thống **MUST** xác định hóa đơn có nợ chỉ khi `remainingDebt > 0` (hoặc `debtAmount > 0`). Các hóa đơn đã tất toán nợ đủ (`paidDebtAmount >= totalAmount` hoặc `debtAmount <= 0`) **MUST NOT** hiển thị nút "Thu nợ", và trạng thái **MUST** hiển thị là "Hoàn thành" (hoặc "Đã tất toán nợ").
2. Tại `CollectDebtModal`, thẻ nhập số tiền `<input type="number">` **MUST NOT** có thuộc tính `min` lớn hơn `max`. Khi `remainingDebt <= 0`, ô nhập **MUST** được vô hiệu hóa (`disabled`) và hệ thống **MUST** hiển thị thông báo rõ ràng: *"Hóa đơn này đã được tất toán toàn bộ nợ, không còn khoản nợ cần thu."*.

#### Scenario: Mở modal thu nợ cho đơn hàng đã trả hết nợ
- **GIVEN** Một hóa đơn có tổng tiền `220.000 đ`, đã trả trước đó `220.000 đ` và `remainingDebt = 0 đ`
- **WHEN** Người dùng xem chi tiết hoặc mở modal thu nợ của hóa đơn này
- **THEN** Trình duyệt không xuất hiện lỗi *"Minimum value (1000) must be less than the maximum value (0)."*
- **AND** Nút submit hiển thị trạng thái đã tất toán và không cho phép submit số tiền nợ $\le 0$.

---

### Requirement: REQ-POS-CUST-02 Tìm kiếm khách hàng đa tiêu chí tại POS
1. Ô tìm kiếm khách hàng tại `PosPaymentPanel` **SHALL** cho phép nhập cả chữ cái và số tự do, không được xóa trắng ký tự chữ cái của người dùng.
2. Hệ thống **MUST** hỗ trợ tìm kiếm khách hàng theo:
   - **Tên khách hàng**: Hỗ trợ tìm kiếm không phân biệt chữ hoa/thường và không phân biệt tiếng Việt có dấu/không dấu (ví dụ: gõ "Son" hoặc "Sơn" đều tìm thấy khách hàng "Sơn").
   - **Số điện thoại**: Tìm kiếm theo chuỗi số (ví dụ: gõ "0961" hoặc "0961934104").
   - **Mã khách hàng**: Tìm kiếm theo mã (ví dụ: "KH2611...").
3. Khi khách hàng được tạo mới qua `AddCustomerModal`, khách hàng mới **MUST** ngay lập tức có mặt trong danh sách tìm kiếm của màn hình POS.

#### Scenario: Thu ngân tìm kiếm khách hàng bằng tên tiếng Việt
- **GIVEN** Trong CSDL có khách hàng tên "Sơn" với số điện thoại "0961934104"
- **WHEN** Thu ngân nhập "Sơn" hoặc "son" vào ô tìm kiếm khách hàng ở quầy POS
- **THEN** Danh sách gợi ý hiển thị khách hàng "Sơn" cùng số điện thoại và điểm tích lũy
- **AND** Thu ngân có thể bấm Enter hoặc click để chọn khách hàng đó vào đơn hàng.

---

### Requirement: REQ-POS-PRINT-03 Chuẩn hóa hóa đơn bán lẻ
1. Hóa đơn bán lẻ (cả bản xem trước `PosReceiptModal` lẫn bản in nhiệt `ThermalPrintService`) **MUST NOT** chứa 2 dòng khuyến cáo:
   - *"Quý khách vui lòng kiểm tra kỹ hóa đơn & hàng hóa trước khi rời quầy."*
   - *"[Hóa đơn khởi tạo từ máy tính tiền MT-GRMS]"* (hoặc *"Doi tra trong 24h kem hoa don."*).
2. Chân hóa đơn **MUST** chỉ hiển thị lời cảm ơn: *"CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!"*.
3. Bảng hàng hóa trên hóa đơn bán lẻ **MUST NOT** hiển thị mã lô nội bộ `(LÔ-FEFO)`.
4. Hàng tổng kết chân bảng hàng hóa **MUST** căn thẳng hàng:
   - Cột STT, Hàng hóa, S.Lg, Đơn giá, Thành tiền.
   - Chân bảng: `Tổng cộng:` (cột 1-2) | `<Tổng số lượng>` (cột S.Lg) | | `<Tổng tiền hàng>` (cột Thành tiền).

#### Scenario: In hóa đơn bán lẻ cho khách hàng
- **GIVEN** Một đơn hàng gồm 3 mặt hàng có tổng số lượng 7 sản phẩm và tổng tiền hàng 723.000 đ
- **WHEN** Thu ngân hoàn tất thanh toán và in hóa đơn
- **THEN** Bản in không chứa dòng khuyến cáo thừa hay mã lô kho `(LÔ-FEFO)`
- **AND** Dòng tổng kết chân bảng hiển thị rõ ràng tổng số lượng `7` và tổng tiền hàng `723.000 đ` thẳng cột
- **AND** Chân hóa đơn chỉ có duy nhất lời cảm ơn *"CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!"*.

---

### Requirement: REQ-POS-HOTLINE-04 Hotline và số điện thoại chi nhánh
1. Hotline và số điện thoại in trên hóa đơn **MUST** phản ánh chính xác số điện thoại của chi nhánh đang hoạt động (`activeBranch.phone`) hoặc hotline của tenant (`user.tenantHotline`).
2. Nếu chi nhánh có số điện thoại, hóa đơn **MUST** hiển thị `Hotline: <Số điện thoại chi nhánh>`.

#### Scenario: Hiển thị hotline chi nhánh An Nhiên Mart
- **GIVEN** Thu ngân đang đăng nhập tại chi nhánh "An Nhiên Mart - Chi nhánh Ba Đình" có số điện thoại "024 3822 9988"
- **WHEN** Hóa đơn bán lẻ được khởi tạo và hiển thị
- **THEN** Phần đầu hóa đơn hiển thị đúng số điện thoại/hotline "024 3822 9988".
