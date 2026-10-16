# Proposal: user-profile-screen

## Vấn đề
Hiện tại hệ thống MT-GRMS sau khi đăng nhập chưa có màn hình Quản lý tài khoản cá nhân (User Profile / Account Management) cho người dùng (Store Owner, Super Admin, Store Manager, Thu ngân). Người dùng đăng nhập không thể xem thông tin hồ sơ của mình, không thể chỉnh sửa số điện thoại/email/ngày sinh/địa chỉ, chưa có giao diện đổi mật khẩu định kỳ, chưa có tính năng bật/tắt xác thực 2 lớp (2FA), và không thể kiểm soát danh sách các thiết bị/trình duyệt đang đăng nhập để đăng xuất từ xa khi nghi ngờ bị lộ tài khoản.

## Mục tiêu
Xây dựng màn hình "Tài khoản" (Account Management / User Profile) chuẩn phong cách KiotViet (theo đúng mẫu giao diện thực tế của KiotViet tại đường dẫn `https://thuymoclaocai.kiotviet.vn/man/#/AccountManagement` mà người dùng cung cấp):
- **Khối 1: Thông tin người dùng**: Hiển thị Tên hiển thị, Tên đăng nhập, Vai trò, Điện thoại, Email, Sinh nhật, Địa chỉ, Ghi chú; kèm nút "Chỉnh sửa" mở Modal cập nhật hồ sơ cá nhân.
- **Khối 2: Đăng nhập và bảo mật**:
  - Đổi mật khẩu định kỳ kèm khuyến nghị an toàn và tự động đăng xuất các thiết bị khác trước khi đổi mật khẩu thành công.
  - Bật/tắt Xác thực 2 lớp (2FA) qua toggle switch: Yêu cầu mã xác thực khi đăng nhập trên thiết bị lạ.
- **Khối 3: Các thiết bị đã đăng nhập**:
  - Danh sách thiết bị (Loại thiết bị: Máy tính Windows/macOS/Mobile, Trình duyệt: Chrome/Firefox, Ngày đăng nhập, Trạng thái hoạt động).
  - Nút "Kiểm tra" và nút biểu tượng thùng rác để chủ động đăng xuất phiên làm việc từ xa.
- **Chuẩn thẩm mỹ**: Tuân thủ nghiêm ngặt `RULE_UI_DESIGN_SYSTEM.md`: Phông chữ `Be Vietnam Pro`, bo tròn Full Pill (`9999px`) cho nút, Card bo góc lớn `24px - 28px`, màu Electric Blue `#0066FF`, icon Monochrome SVG thanh mảnh, không hiệu ứng nhún nhảy/rung lắc.

## Phạm vi
- **In scope**:
  - **Frontend React 19 / TypeScript**:
    - Trang `AccountManagementPage.tsx` (đặt tại `src/pages/profile/` hoặc `src/pages/account/`).
    - Bóc tách component độc lập: `UserInfoCard.tsx`, `SecuritySettingsCard.tsx`, `ActiveDevicesCard.tsx`.
    - Hộp thoại tương tác: `EditProfileModal.tsx` (sửa thông tin cá nhân) và `ChangePasswordModal.tsx` (đổi mật khẩu).
    - Tích hợp liên kết điều hướng từ Avatar Dropdown trên Header vào trang Tài khoản.
  - **Database & Data Dictionary**:
    - Bổ sung các cột hồ sơ cá nhân vào bảng `Users` trong `Database_Design_Data_Dictionary.md`: `DateOfBirth (DATE)`, `Address (NVARCHAR(255))`, `Note (NVARCHAR(500))`, `IsTwoFactorEnabled (BIT)`.
    - Định nghĩa bảng `UserSessions` để lưu vết danh sách thiết bị và phiên đăng nhập.
  - **Backend API**:
    - `GET /api/v1/user/profile`: Lấy thông tin tài khoản hiện tại.
    - `PUT /api/v1/user/profile`: Cập nhật thông tin cá nhân.
    - `POST /api/v1/user/change-password`: Đổi mật khẩu đăng nhập.
    - `PUT /api/v1/user/security/2fa`: Bật / tắt xác thực 2 bước.
    - `GET /api/v1/user/sessions`: Lấy danh sách thiết bị đang đăng nhập.
    - `DELETE /api/v1/user/sessions/{sessionId}`: Thu hồi phiên đăng xuất thiết bị từ xa.
- **Out of scope**:
  - Gửi SMS OTP qua nhà mạng viễn thông thật (mô phỏng OTP qua email/popup in-app).
  - Phân quyền tài khoản của nhân viên khác (thuộc module Quản lý nhân viên của Quản trị viên).

## Người dùng liên quan
- **Store Owner (Chủ chuỗi)**: Quản lý tài khoản chủ sở hữu, đổi mật khẩu và bảo mật 2 lớp.
- **Store Manager & Cashier**: Quản lý thông tin cá nhân, số điện thoại, đổi mật khẩu ca làm việc.
- **SaaS Master Admin**: Quản lý tài khoản quản trị hệ thống.

## Tiêu chí thành công
- [ ] Giao diện tái hiện chuẩn xác 100% bố cục và phong cách trang "Tài khoản" của KiotViet trong ảnh chụp thực tế.
- [ ] Bóc tách đầy đủ thành các component độc lập (`UserInfoCard`, `SecuritySettingsCard`, `ActiveDevicesCard`), không viết monolithic.
- [ ] Modal chỉnh sửa thông tin cá nhân cho phép cập nhật Tên, SĐT, Email, Ngày sinh, Địa chỉ, Ghi chú.
- [ ] Modal đổi mật khẩu có kiểm tra mật khẩu cũ, độ mạnh mật khẩu mới và xác nhận mật khẩu.
- [ ] Toggle xác thực 2 lớp (2FA) chuyển đổi trạng thái mượt mà.
- [ ] Danh sách thiết bị hiển thị trực quan thiết bị hiện tại và cho phép xóa/thu hồi phiên đăng nhập từ xa.
- [ ] Đạt chuẩn 100% `RULE_UI_DESIGN_SYSTEM.md`: 100% icon đơn sắc Monochrome SVG, bo tròn Full Pill, giao diện tĩnh vững chãi, không nhún nhảy.
