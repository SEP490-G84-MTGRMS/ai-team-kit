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
