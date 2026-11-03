# Đặc Tả Kỹ Thuật (Specs): pos-annhien-data-and-staff-logout

## ADDED Requirements

### Requirement: REQ-ANNHIEN-01 Nạp Dữ Liệu Cửa Hàng An Nhiên Mart
Hệ thống Frontend SHALL tự động nạp danh mục sản phẩm, khách hàng, hóa đơn và đơn đặt trước của Cửa hàng Thực Phẩm Sạch An Nhiên khi tài khoản người dùng mang `tenantId == 'tenant_an_nhien_02'`.

#### Scenario: Nhân viên hoặc Chủ quán An Nhiên mở màn hình POS
- **GIVEN** Người dùng đăng nhập thành công với tài khoản An Nhiên Mart (`tenant_an_nhien_02`)
- **WHEN** Quầy POS tải dữ liệu sản phẩm
- **THEN** Danh sách hiển thị đủ 5 sản phẩm nông sản sạch (Gạo lứt, Trứng gà, Nước mắm, Táo Envy, Sữa Mộc Châu) kèm tồn kho theo lô FEFO
- **AND** Không bị rơi vào trạng thái giỏ hàng rỗng hoặc lỗi mảng không xác định.

### Requirement: REQ-LOGOUT-01 Nút Đăng Xuất Cho Nhân Viên POS
Hệ thống Frontend MUST cung cấp tùy chọn đăng xuất an toàn cho tài khoản Nhân viên thu ngân (`EMPLOYEE` / `CASHIER`) ngay trong menu popover "Thao tác" của thanh điều hướng `PosHeader`.

#### Scenario: Nhân viên thu ngân hết ca làm việc và đăng xuất
- **GIVEN** Tài khoản người dùng có vai trò Nhân viên (`role !== 'STORE_OWNER'`) đang ở quầy POS
- **WHEN** Nhân viên nhấp chuột vào nút "Thao tác" (hamburger menu) ở góc trên bên phải
- **THEN** Dropdown hiển thị mục "Đăng xuất tài khoản" với biểu tượng `LogOut` màu đỏ
- **WHEN** Nhân viên nhấp chọn "Đăng xuất tài khoản"
- **THEN** Hệ thống dọn sạch token xác thực trong Zustand Auth Store và điều hướng về `/auth/login`.

## REMOVED Requirements

### Requirement: REQ-BANNER-01 Loại Bỏ Banner Cảnh Báo Phân Lập Kho Rỗng
Hệ thống Frontend MUST loại bỏ hoàn toàn khối banner màu xanh cảnh báo "🏪 Cửa hàng của bạn: Dữ liệu phân lập an toàn (Multi-tenant). Kho hàng của tiệm này chưa có sản phẩm nào..." khỏi giao diện `PosCheckoutPage`.

#### Scenario: Không hiển thị banner kho rỗng
- **GIVEN** Người dùng mở giao diện POS Checkout
- **THEN** Không có bất kỳ khối banner thông báo cảnh báo kho rỗng màu xanh nào ở đầu trang.

---

## Acceptance Checklist
- [ ] `posOrderApi.getAllProducts` phân giải đúng mảng dữ liệu từ `res.data?.data?.items` hoặc `res.data?.data`.
- [ ] Đăng nhập `0917778888` / `123456` hoặc `0918889999` / `123456` hiển thị đầy đủ 5 sản phẩm của An Nhiên Mart.
- [ ] Xóa bỏ 100% dòng banner thông báo kho hàng chưa có sản phẩm.
- [ ] Bấm nút "Thao tác" tại POS có mục "Đăng xuất tài khoản", bấm vào đăng xuất thành công.
- [ ] Build Frontend `npm run build` đạt 0 lỗi.
