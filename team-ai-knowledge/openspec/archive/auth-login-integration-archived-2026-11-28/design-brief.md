# Design Brief: Đăng Nhập 2FA & Đăng Ký Cửa Hàng Xác Thực Toàn Diện Qua Email OTP

## 1. Luồng Người Dùng & Tương Tác (User & API Flow)

### 1.1. Luồng Đăng Nhập 2 Bước Bảo Mật (Login 2FA via Email OTP)
1. **Bước 1 (Nhập thông tin)**:
   - Người dùng nhập Email/Tài khoản và Mật khẩu trên `LoginPage.tsx`.
   - Bấm nút "Đăng nhập".
   - Frontend gửi `POST /api/auth/login` kèm `{ usernameOrEmail, password }`.
2. **Bước 2 (Xác thực mật khẩu & Sinh mã OTP)**:
   - Backend xác thực: Nếu sai mật khẩu -> trả lỗi 401.
   - Nếu mật khẩu hợp lệ:
     - Sinh mã OTP ngẫu nhiên 6 chữ số (TTL: 5 phút, lưu cache với key `otp:login:{tempToken}`).
     - Gửi email HTML chứa mã OTP tới địa chỉ email của tài khoản.
     - *(Nếu chưa cấu hình SMTP, in mã ra terminal console log kèm ghi chú dev fallback)*.
     - Trả về JSON:
       ```json
       {
         "requiresOtp": true,
         "tempToken": "guid-tam-thoi-36-ky-tu",
         "emailMasked": "n***@gmail.com",
         "expiresInSeconds": 300,
         "devOtp": "123456" // chỉ kèm khi Environment == Development
       }
       ```
3. **Bước 3 (Nhập OTP & Cấp quyền)**:
   - `LoginPage.tsx` nhận `requiresOtp: true` -> Mở `LoginOtpModal.tsx`.
   - Modal hiển thị: Email đã nhận mã (`emailMasked`), 6 ô nhập số OTP, nút đếm ngược 60s để gửi lại, nút "Điền nhanh OTP Dev" (khi ở local/dev).
   - Khi nhập đủ 6 số, Frontend gửi `POST /api/auth/login/verify-otp` kèm `{ tempToken, otpCode }`.
   - Backend xác minh khớp:
     - Xóa OTP khỏi cache.
     - Thiết lập HttpOnly Cookie `access_token` và `refresh_token` (hoặc trả token trong body).
     - Trả về HTTP 200 OK kèm `UserInfo`.
   - Frontend lưu `user` vào `useAuthStore` và điều hướng thông minh theo vai trò:
     - `ADMIN` -> `/admin/dashboard`
     - `STORE_OWNER` -> `/store-owner/dashboard`
     - `STAFF` -> `/employee/schedule` hoặc `/pos`

### 1.2. Luồng Đăng Ký Cửa Hàng Mới (Register via Email OTP)
1. **Bước 1 (Điền form đăng ký)**:
   - Người dùng nhập: Họ tên, Tên cửa hàng, SĐT, Email, Mật khẩu trên `RegisterPage.tsx`.
   - Bấm "Tạo tài khoản & Mở cửa hàng".
2. **Bước 2 (Gửi mã OTP Email)**:
   - Frontend gọi `POST /api/auth/register/send-otp` với `{ email, fullName, storeName }`.
   - Backend sinh OTP 6 số lưu cache `otp:register:{cleanEmail}`, gửi email qua `IEmailService` (hoặc log console dev).
   - Trả về `{ success: true, message: "Mã OTP đã được gửi về email...", devOtp: "..." }`.
3. **Bước 3 (Xác thực hoàn tất mở cửa hàng)**:
   - Mở `RegistrationOtpModal.tsx` hiển thị địa chỉ Email.
   - Người dùng nhập 6 số OTP và nhấn "Xác nhận & Mở cửa hàng".
   - Frontend gọi `POST /api/auth/register` kèm payload đăng ký và `otpCode`.
   - Backend kiểm tra OTP khớp: Tạo Tenant, Branch, StoreOwner và cấp phiên đăng nhập tự động.

---

## 2. Quy Chuẩn Thiết Kế Giao Diện (KiotViet Design System Compliance)
- **Bo tròn**:
  - Toàn bộ nút CTA ("Đăng nhập", "Xác nhận mã OTP", "Gửi lại mã"): Full Pill `border-radius: 9999px`.
  - Các ô nhập số OTP: Bo góc mềm mại `12px - 14px`, phông `JetBrains Mono` chữ to rõ ràng `24px`, căn giữa.
  - Hộp thoại Modal: Bo góc lớn `24px - 28px`, đổ bóng mềm tự nhiên `box-shadow: 0 16px 40px rgba(0, 30, 90, 0.12)`.
- **Màu sắc thương hiệu**:
  - Xanh chủ đạo KiotViet Blue `#0066FF`, nền xanh dịu `#F7FAFF`.
  - Nút bấm trạng thái hover chuyển nhẹ `#0052CC`, không đổi kích thước hay dịch chuyển pixel.
- **🚨 CẤM HIỆU ỨNG NHÚNG NHẢY & ICON MÀU MÈ**:
  - Thẻ Modal nằm tĩnh hoàn toàn (Static & Grounded), không rung lắc (no shake/pulse/floatBounce).
  - 100% Monochrome SVG Icons đơn sắc thanh mảnh (`stroke-width: 1.8`, `stroke="currentColor"`). Cấm tuyệt đối emoji.
- **Tính Module hóa Component**:
  - `LoginOtpModal.tsx` tách thành file độc lập tại `src/features/auth/components/LoginOtpModal.tsx`.
  - `RegistrationOtpModal.tsx` cập nhật hiển thị Email tại `src/features/auth/components/RegistrationOtpModal.tsx`.

---

## 3. Endpoints & Data Contracts (API Specifications)

### 3.1. `POST /api/auth/login`
- **Request**:
  ```json
  {
    "usernameOrEmail": "owner@mtgrms.vn",
    "password": "Password@123"
  }
  ```
- **Response (200 OK - Yêu cầu OTP 2FA)**:
  ```json
  {
    "success": true,
    "data": {
      "requiresOtp": true,
      "tempToken": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "emailMasked": "o***@mtgrms.vn",
      "expiresInSeconds": 300,
      "devOtp": "654321"
    }
  }
  ```

### 3.2. `POST /api/auth/login/verify-otp`
- **Request**:
  ```json
  {
    "tempToken": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "otpCode": "654321"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "ey...",
      "refreshToken": "...",
      "user": {
        "id": "user-guid",
        "email": "owner@mtgrms.vn",
        "fullName": "Nguyễn Văn Chủ",
        "role": "STORE_OWNER",
        "tenantId": "tenant-guid"
      }
    }
  }
  ```

### 3.3. `POST /api/auth/register/send-otp`
- **Request**:
  ```json
  {
    "email": "storeowner@gmail.com",
    "fullName": "Nguyễn Văn Chủ",
    "storeName": "Siêu Thị Mini Mart"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Mã xác thực đã được gửi về email storeowner@gmail.com",
    "devOtp": "123456"
  }
  ```

### 3.4. `POST /api/auth/register`
- **Request**:
  ```json
  {
    "fullName": "Nguyễn Văn Chủ",
    "storeName": "Siêu Thị Mini Mart",
    "phone": "0912345678",
    "email": "storeowner@gmail.com",
    "password": "Password@123",
    "otpCode": "123456"
  }
  ```
- **Response (200 OK)**: Trả về `AuthResponse` với tài khoản mới và điều hướng vào `/store-owner/dashboard`.

## 4. Bổ sung: 2FA tùy chọn theo tài khoản trong Settings

### Luồng UI và API
- Settings > Bảo mật tải trạng thái bằng `GET /api/auth/me/2fa` (cookie xác thực). Hiển thị công tắc, trạng thái tải, thông báo lỗi và email nhận OTP đã che.
- Khi đổi công tắc, người dùng nhập mật khẩu hiện tại; `POST /api/auth/me/2fa/challenge` với `{ enabled, currentPassword }`. Backend lấy UserId từ phiên, kiểm tra mật khẩu, email đã xác minh, giới hạn gửi mã và tạo challenge gắn với UserId, action, TTL 5 phút. Trả `challengeToken`, email che và thời gian hết hạn; không trả OTP ở production.
- Người dùng nhập OTP; `POST /api/auth/me/2fa/confirm` với `{ challengeToken, otpCode }`. Backend kiểm tra phiên cùng UserId, action đã khóa trong challenge, giới hạn 5 lần sai, tiêu thụ challenge một lần và cập nhật trạng thái. UI chỉ đổi công tắc sau phản hồi thành công; nếu lỗi giữ nguyên trạng thái và cho thử lại đúng điều kiện.
- `POST /api/auth/login` trả `requiresOtp: true` và `tempToken` nếu 2FA bật; nếu tắt, cấp cookie và UserInfo ngay. Registration Email OTP không phụ thuộc công tắc này.

### Dữ liệu và bảo mật
- Thêm cờ `IsTwoFactorEnabled` bền vững theo User, mặc định true/backfill true cho tài khoản hiện có. Tài khoản mới có mặc định true; không coi null là disabled.
- Không nhận UserId mục tiêu ở hai API Settings; kiểm tra quyền từ cookie/claims. Nếu API có đường dẫn chứa userId thì phải so khớp và trả 403 khi khác.
- OTP challenge độc lập với OTP đăng nhập/đăng ký, entropy bằng CSPRNG, lưu hash OTP, giới hạn gửi lại và thử sai, vô hiệu hóa challenge cũ khi tạo lại; không cho dùng lại sau thành công/hết hạn. Dùng CSRF protection phù hợp với cookie auth.
- Kiểm tra email đã xác minh trước khi bật. Khi tắt cũng yêu cầu mật khẩu và Email OTP. Nếu không gửi được email, không tạo challenge khả dụng và không đổi trạng thái.
- Thao tác confirm cập nhật trạng thái và ghi audit log trong cùng giao dịch; audit gồm UserId, tenant, hành động, thời gian UTC, IP, kết quả; không có mật khẩu/OTP/token. Retry challenge đã tiêu thụ không được đổi trạng thái hay ghi thêm audit thành công.
- Rate limit theo user/IP với thông báo lỗi chung, không lộ email đầy đủ hoặc trạng thái tài khoản với người chưa xác thực.
