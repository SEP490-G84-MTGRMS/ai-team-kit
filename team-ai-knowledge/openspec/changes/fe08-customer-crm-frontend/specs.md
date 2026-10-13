# Specifications: Frontend Quản Lý Khách Hàng & Công Nợ (FE-08)

## Capability Summary
Cung cấp phân hệ giao diện chuyên nghiệp cho Chủ cửa hàng (Store Owner), Quản lý (Store Manager) và Thu ngân (Cashier) quản lý thông tin khách hàng, phân hạng thẻ thành viên VIP, kiểm soát hạn mức nợ (DebtLimit), và thực hiện thu hồi công nợ bằng tiền mặt hoặc mã VietQR động tích hợp đồng bộ với Sổ quỹ (Cashbook).

## Dependencies
- Bám sát thiết kế tại: `openspec/changes/fe08-customer-crm-frontend/exploration.md`
- Bám sát tài liệu giao diện: `openspec/changes/fe08-customer-crm-frontend/design-brief.md`
- Thực thể CSDL liên quan: `Customers`, `CashbookTransactions`, `Orders`

---

## ADDED Requirements

### Requirement: REQ-08.1 Danh sách và Tra cứu Khách hàng Đa tiêu chí
Giao diện người dùng MUST cung cấp bảng danh sách khách hàng phân trang, hỗ trợ tìm kiếm tức thì theo số điện thoại hoặc họ tên, và bộ lọc theo Hạng thành viên (Standard/Silver/Gold/VIP) hoặc trạng thái công nợ.

#### Scenario: Tìm kiếm khách hàng theo số điện thoại
- **GIVEN** Người dùng đang ở màn hình Quản lý Khách hàng & CRM với danh sách 100 khách hàng.
- **WHEN** Người dùng nhập "0912345678" vào ô tìm kiếm.
- **THEN** Hệ thống MUST lọc và hiển thị chính xác khách hàng có số điện thoại khớp trong vòng dưới 300ms mà không cần tải lại toàn bộ trang.

#### Scenario: Lọc khách hàng có nguy cơ vượt hạn mức nợ
- **GIVEN** Người dùng chọn bộ lọc "Quá hạn mức" từ dropdown trạng thái nợ.
- **WHEN** Bộ lọc được kích hoạt.
- **THEN** Bảng dữ liệu MUST chỉ hiển thị các khách hàng có `CurrentDebtAR >= DebtLimit` kèm badge cảnh báo màu đỏ.

---

### Requirement: REQ-08.2 Thêm mới và Cập nhật Hồ sơ Khách hàng
Giao diện người dùng MUST cung cấp form nhập liệu có validation đầy đủ cho các trường: Số điện thoại (bắt buộc, 10 số), Họ tên (bắt buộc), Email, Địa chỉ, Hạn mức nợ (`DebtLimit`).

#### Scenario: Thêm khách hàng mới hợp lệ
- **GIVEN** Người dùng mở modal "Thêm khách hàng".
- **WHEN** Người dùng nhập Họ tên "Trần Văn A", SĐT "0987654321", Hạn mức nợ "5,000,000" VNĐ và bấm "Lưu".
- **THEN** Hệ thống MUST gửi dữ liệu hợp lệ, đóng modal, hiển thị thông báo thành công và bổ sung khách hàng mới vào đầu danh sách.

#### Scenario: Chặn tạo khách hàng với số điện thoại không hợp lệ
- **GIVEN** Người dùng nhập số điện thoại "12345" (không đúng định dạng SĐT Việt Nam).
- **WHEN** Người dùng rời khỏi ô nhập hoặc bấm "Lưu".
- **THEN** Hệ thống MUST hiển thị thông báo lỗi "Số điện thoại không đúng định dạng (yêu cầu 10 chữ số)" và ngăn chặn việc submit form.

---

### Requirement: REQ-08.3 Xem Chi tiết Khách hàng & Lịch sử Giao dịch
Khi người dùng bấm vào một khách hàng trong danh sách, hệ thống MUST mở Drawer chi tiết từ cạnh phải hiển thị đầy đủ thông tin cá nhân, widget hạn mức nợ (% đã dùng), điểm tích lũy, và lịch sử giao dịch.

#### Scenario: Xem hồ sơ khách hàng đang có công nợ
- **GIVEN** Khách hàng "Nguyễn Văn B" có `CurrentDebtAR = 2,000,000` VNĐ và `DebtLimit = 5,000,000` VNĐ.
- **WHEN** Người dùng bấm vào dòng khách hàng trên bảng dữ liệu.
- **THEN** Drawer MUST hiển thị thanh tiến độ sử dụng hạn mức là 40% (màu vàng an toàn), hiển thị các nút thao tác nhanh "Thu nợ", "Chỉnh sửa".

---

### Requirement: REQ-08.4 Lập Phiếu Thu nợ và Sinh mã VietQR Động
Hệ thống MUST cho phép thu nợ từng phần hoặc toàn phần, hỗ trợ thanh toán bằng Tiền mặt hoặc Chuyển khoản VietQR động. Khi chọn VietQR, mã QR sinh ra MUST chứa đúng số tài khoản, số tiền và nội dung `THUNO <SĐT>`.

#### Scenario: Tạo mã VietQR thu nợ thành công
- **GIVEN** Khách hàng đang nợ 1,500,000 VNĐ.
- **WHEN** Người dùng bấm "Thu nợ", nhập số tiền 1,000,000 VNĐ và chọn phương thức "Chuyển khoản VietQR".
- **THEN** Modal MUST render mã VietQR hợp lệ chuẩn Napas 247 với số tiền chính xác là 1,000,000 VNĐ và nội dung chuyển khoản tự động.

#### Scenario: Chặn thu nợ vượt quá số tiền nợ hiện tại
- **GIVEN** Khách hàng đang nợ 500,000 VNĐ.
- **WHEN** Người dùng cố tình nhập số tiền thu là 600,000 VNĐ.
- **THEN** Hệ thống MUST báo lỗi "Số tiền thu không được vượt quá số nợ hiện tại (500,000 VNĐ)" và vô hiệu hóa nút xác nhận.

---

### Requirement: REQ-08.5 Kiểm soát và Điều chỉnh Hạn mức nợ (DebtLimit)
Hệ thống MUST giới hạn quyền thay đổi hạn mức nợ `DebtLimit` chỉ dành cho người dùng có vai trò `StoreOwner` hoặc `StoreManager`.

#### Scenario: Thu ngân không được phép tự ý sửa hạn mức nợ
- **GIVEN** Người dùng đang đăng nhập với vai trò `Cashier`.
- **WHEN** Người dùng mở form chỉnh sửa thông tin khách hàng.
- **THEN** Trường nhập `DebtLimit` MUST ở trạng thái chỉ đọc (read-only/disabled) kèm tooltip "Chỉ Quản lý hoặc Chủ cửa hàng mới có quyền sửa hạn mức nợ".

---

## Acceptance Checklist
- [ ] Bảng danh sách khách hàng render đầy đủ thông tin, hỗ trợ phân trang và tìm kiếm tức thì.
- [ ] Drawer trượt hiển thị chi tiết hồ sơ, hạn mức nợ và lịch sử giao dịch.
- [ ] Modal thu nợ hoạt động chuẩn xác với tiền mặt và sinh mã VietQR động.
- [ ] Validation số điện thoại và hạn mức nợ hoạt động chặt chẽ.
- [ ] Phân quyền RBAC ẩn/disable trường hạn mức nợ đối với Thu ngân.
- [ ] Đồng bộ dữ liệu với Sổ quỹ (`Cashbook`) khi lập phiếu thu nợ.
