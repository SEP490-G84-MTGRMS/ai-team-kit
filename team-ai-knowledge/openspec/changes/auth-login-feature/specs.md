# Specs: auth-login-feature

## API / Contract

### POST /api/auth/register
**Request:**
```json
{
  "fullName": "Trần Hoàng Long",
  "storeName": "Siêu thị MT Mart Q1",
  "phone": "0912345678",
  "email": "0912345678@mtgrms.vn",
  "password": "Password123#",
  "agreeTerms": true
}
```
**Response 200:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 7200,
  "user": {
    "id": "usr_01",
    "phone": "0912345678",
    "fullName": "Trần Hoàng Long",
    "tenantId": "TNT_Q1",
    "role": "STORE_OWNER"
  }
}
```

## ADDED Requirements

### Requirement: REQ-REG-01 Đăng ký định danh qua Số điện thoại (Phone-First)
Form đăng ký tài khoản mở cửa hàng MT-GRMS MUST NOT bắt buộc người dùng nhập địa chỉ email. Hệ thống MUST sử dụng Số điện thoại làm phương thức liên lạc và định danh chính của chủ cửa hàng.

#### Scenario: Đăng ký thành công không cần Email
- **GIVEN**: Khách hàng mở trang `/auth/register`.
- **WHEN**: Khách hàng nhập Họ tên, Tên cửa hàng, Số điện thoại hợp lệ và Mật khẩu (không có trường Email).
- **THEN**: Hệ thống tạo thành công tài khoản quản trị chuỗi, tự động gán phiên đăng nhập và chuyển hướng vào Dashboard.

### Requirement: REQ-REG-02 Giao diện Zero-Scroll vừa vặn màn hình
Giao diện Auth Shell (`AuthLayout`) và Form Đăng ký (`RegisterPage`) MUST vừa vặn trong 1 màn hình tiêu chuẩn (chiều cao viewport từ 768px trở lên) mà không xuất hiện thanh cuộn dọc.

#### Scenario: Hiển thị trọn vẹn không cuộn chuột
- **GIVEN**: Khách hàng truy cập trang `/auth/register` trên màn hình laptop/desktop thông thường.
- **WHEN**: Trang hoàn tất tải giao diện.
- **THEN**: Toàn bộ Header, Auth Card (tất cả các trường, nút bấm CTA) và Footer bản quyền hiển thị trọn vẹn trong một khung nhìn không bị cuộn.

## Acceptance checklist
- [x] Đã bỏ trường input Email trên giao diện RegisterPage.
- [x] Đã cập nhật validate form chỉ kiểm tra Số điện thoại.
- [x] Chiều cao toàn trang hiển thị gọn gàng trong 1 khung nhìn không bị cuộn.
- [x] Build và kiểm thử giao diện đạt tiêu chuẩn.
