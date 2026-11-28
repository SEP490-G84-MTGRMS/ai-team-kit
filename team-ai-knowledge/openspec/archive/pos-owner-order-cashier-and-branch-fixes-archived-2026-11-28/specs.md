# Đặc tả kỹ thuật (Delta Spec): Tối ưu POS Header Owner, hiển thị chi nhánh thực tế & bảo toàn tên thu ngân

## MODIFIED Requirements

### Requirement: REQ-POS-OWNER-HEADER-01 — Ẩn nút "Lịch sử ca cửa hàng" trong POS Header đối với Chủ cửa hàng
Hệ thống giao diện POS Header MUST NOT hiển thị nút "Lịch sử ca cửa hàng" trong menu dropdown góc phải khi người dùng đăng nhập với vai trò Chủ cửa hàng (`STORE_OWNER` hoặc `ADMIN`), nhằm loại bỏ sự trùng lặp với menu Quản lý ca (`/store-owner/shifts`) ngoài Dashboard chính.

#### Scenario: Chủ cửa hàng mở dropdown menu trong màn hình POS
- **GIVEN** Người dùng đăng nhập với tài khoản có vai trò `STORE_OWNER` và đang ở màn hình bán hàng POS (`/pos/checkout`).
- **WHEN** Người dùng click vào avatar/menu người dùng ở góc trên bên phải header POS.
- **THEN** Dropdown mở ra KHÔNG hiển thị mục nút "Lịch sử ca cửa hàng" (chỉ hiển thị các nút chức năng phù hợp như Tra cứu tồn kho, Quản lý hóa đơn, Đăng xuất).

#### Scenario: Thu ngân mở dropdown menu trong màn hình POS
- **GIVEN** Người dùng đăng nhập với tài khoản Thu ngân (`CASHIER` hoặc `STAFF`).
- **WHEN** Người dùng click vào menu người dùng ở header POS.
- **THEN** Dropdown hiển thị nút "Mở ca bán hàng" / "Chi tiết ca hiện tại" để thu ngân thực hiện nghiệp vụ ca của quầy.

---

### Requirement: REQ-POS-BRANCH-NAME-02 — Hiển thị chính xác tên chi nhánh được phân công
Giao diện Quản lý hóa đơn (`InvoiceManagementPage.tsx`) MUST hiển thị chính xác tên chi nhánh thực tế (ví dụ: `An Nhiên Mart - Chi nhánh Ba Đình`) dựa trên danh sách chi nhánh động lấy từ API `/branches` hoặc cấu hình chuỗi, và MUST NOT hiển thị chuỗi fallback tĩnh `"Chi nhánh được phân công"`.

#### Scenario: Thu ngân chi nhánh Ba Đình xem màn hình Quản lý hóa đơn
- **GIVEN** Nhân viên bán hàng được phân công tại chi nhánh có ID hoặc mã tương ứng với "An Nhiên Mart - Chi nhánh Ba Đình".
- **WHEN** Nhân viên truy cập vào màn hình Quản lý hóa đơn (`/pos/invoices`).
- **THEN** Huy hiệu chi nhánh ở thanh công cụ hiển thị rõ ràng: `Chi nhánh: An Nhiên Mart - Chi nhánh Ba Đình`.

---

### Requirement: REQ-POS-OWNER-MULTI-BRANCH-03 — Chủ cửa hàng xem toàn bộ đơn hàng toàn chuỗi và lọc theo chi nhánh
Khi đăng nhập với vai trò Chủ cửa hàng (`STORE_OWNER`), trang Quản lý hóa đơn MUST mặc định hiển thị đơn hàng của tất cả chi nhánh (`branchFilter = 'ALL'`) và cung cấp danh sách đầy đủ các chi nhánh thực tế trong dropdown để lọc linh hoạt.

#### Scenario: Chủ cửa hàng chuyển tài khoản và truy cập trang Hóa đơn
- **GIVEN** Chủ cửa hàng vừa đăng nhập vào hệ thống.
- **WHEN** Chủ cửa hàng truy cập trang Quản lý hóa đơn (`/pos/invoices`).
- **THEN** Bộ lọc chi nhánh được đặt mặc định là `"Tất cả chi nhánh (Toàn chuỗi)"` (`ALL`), danh sách hiển thị đầy đủ các hóa đơn từ tất cả các chi nhánh của chuỗi, và dropdown chứa đầy đủ danh sách các chi nhánh lấy từ API `/branches`.

---

### Requirement: REQ-POS-ORDER-CASHIER-SNAPSHOT-04 — Lưu vết và hiển thị chính xác tên người tạo đơn hàng
Hệ thống backend MUST bổ sung cột `CashierName` vào bảng `Orders`, lưu snapshot tên nhân viên bán hàng khi tạo đơn hàng mới, và trả về qua trường `CashierName` trong `OrderResponse`. Giao diện Frontend MUST hiển thị tên thu ngân từ dữ liệu đơn hàng và MUST NOT ghi đè bằng tên của người dùng đang đăng nhập xem trang.

#### Scenario: Đơn hàng tạo bởi thu ngân giữ nguyên tên khi Chủ cửa hàng xem lại
- **GIVEN** Thu ngân `Nguyễn Văn Minh (Nhân viên bán hàng An Nhiên)` thực hiện thanh toán thành công đơn hàng `HD2611080001` trên màn hình POS.
- **WHEN** Chủ cửa hàng `Trần Văn Chủ` đăng nhập vào hệ thống và mở danh sách Hóa đơn (`/pos/invoices`).
- **THEN** Cột "Người tạo" của đơn hàng `HD2611080001` hiển thị đúng là `Nguyễn Văn Minh (Nhân viên bán hàng An Nhiên)` (hoặc tên snapshot của thu ngân), KHÔNG bị đổi thành tên `Trần Văn Chủ`.

#### Scenario: Đơn hàng tạo trực tiếp bởi Chủ cửa hàng
- **GIVEN** Chủ cửa hàng trực tiếp đứng quầy bán hàng và thanh toán đơn hàng.
- **WHEN** Xem lại danh sách đơn hàng.
- **THEN** Cột "Người tạo" hiển thị đúng tên Chủ cửa hàng.
