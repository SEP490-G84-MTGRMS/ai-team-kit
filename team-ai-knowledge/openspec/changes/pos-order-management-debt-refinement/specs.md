# Đặc Tả Kỹ Thuật (Specs Delta)

## MODIFIED Requirements

### Requirement: REQ-POS-DEBT Nghiệp Vụ Bán Nợ Tạp Hóa Không Giới Hạn Hạn Mức Cứng
Hệ thống SHALL cho phép Chủ Cửa Hàng (`role: STORE_OWNER`) bán nợ cho khách hàng định danh mà không bị chặn bởi hạn mức nợ (Debt Limit). Hệ thống MUST hiển thị số lần nợ và tổng số tiền nợ tích lũy của khách hàng.

#### Scenario: Chủ cửa hàng ghi nợ thành công cho khách hàng
- **GIVEN** Tài khoản đăng nhập là Chủ Cửa Hàng (`STORE_OWNER`) và đã chọn khách hàng "Chị Lan"
- **WHEN** Chủ tiệm chọn phương thức thanh toán "Ghi nợ" và xác nhận thanh toán đơn hàng 522.500 đ
- **THEN** Đơn hàng được tạo với `PaymentMethod = "DEBT"`, `PaymentStatus = "UNPAID"`, số tiền nợ của khách hàng được cộng dồn và không bị chặn bởi bất kỳ hạn mức nào.

#### Scenario: Thu ngân không có quyền bán nợ
- **GIVEN** Tài khoản đăng nhập là Thu Ngân (`CASHIER`)
- **WHEN** Thu ngân mở bảng thanh toán `PosPaymentPanel`
- **THEN** Nút phương thức thanh toán "Ghi nợ" bị ẩn hoàn toàn, thu ngân chỉ được chọn Tiền mặt hoặc VietQR.

---

## ADDED Requirements

### Requirement: REQ-POS-ORDER-MGMT Kết Nối Backend Phân Hệ Quản Lý Đơn Hàng & Đơn Đặt Trước
Hệ thống SHALL kết nối trang `InvoiceManagementPage` với Backend API `GET /api/orders` theo `TenantId` để nạp danh sách thực tế từ CSDL PostgreSQL.

#### Scenario: Tải danh sách hóa đơn bán lẻ và đơn đặt trước của chủ tiệm 0901234567
- **GIVEN** Chủ tiệm `Tran Van Chu` (`0901234567`) thuộc `tenant_mt_mart_01` truy cập `/pos/orders`
- **WHEN** Trang quản lý đơn hàng tải dữ liệu
- **THEN** Tab "Hóa đơn bán lẻ" hiển thị 4 hóa đơn mẫu (Tiền mặt, VietQR, Bán nợ, Đã hủy) và Tab "Đơn đặt trước" hiển thị 3 đơn giữ kho với thông tin tiền cọc, tiền còn lại và lịch hẹn.

#### Scenario: Hoàn tất đơn đặt trước khi khách đến quầy nhận hàng
- **GIVEN** Đơn đặt trước `PO-20261101-001` đang ở trạng thái `PreOrder`
- **WHEN** Thu ngân bấm "Xuất hàng & Nhận thanh toán" và chọn phương thức thanh toán số tiền còn lại
- **THEN** API `PUT /api/orders/{id}/fulfill` được gọi, trạng thái đơn chuyển sang `Completed` và hiển thị thông báo thành công.

---

## MODIFIED Requirements

### Requirement: REQ-POS-UI-CLEANUP Tinh Gọn Giao Diện POS & Form Khách Hàng
Hệ thống SHALL loại bỏ các thành phần kiểm thử giả lập trên giao diện người dùng và tinh giản modal thêm khách hàng.

#### Scenario: Thêm khách hàng mới tại quầy POS
- **GIVEN** Thu ngân mở modal `AddCustomerModal`
- **WHEN** Thu ngân xem bảng nhập liệu khách hàng
- **THEN** Trường "Mã KH:" và "Nhóm:" không hiển thị; mã khách hàng được tự động sinh ngầm theo định dạng `KHxxxxxx`.

---

## Acceptance Checklist
- [x] Nút Về Dashboard cạnh tên quầy đã được gỡ bỏ khỏi `PosHeader`.
- [x] Khối chọn nhanh tài khoản kiểm thử đã được gỡ bỏ khỏi `LoginPage`.
- [x] Modal thêm khách hàng không còn hiển thị `Mã KH:` và `Nhóm:`.
- [x] Ghi nợ không bị giới hạn hạn mức; hiển thị số lần nợ và tổng nợ.
- [x] Đã nạp 4 hóa đơn bán lẻ và 3 đơn đặt trước từ CSDL PostgreSQL của tài khoản `0901234567`.
- [x] 162/162 Unit tests Backend và Vite Build Frontend đạt kết quả PASS 100%.
