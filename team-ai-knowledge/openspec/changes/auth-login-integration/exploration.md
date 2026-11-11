# Exploration: Chuyển Đổi Sang HttpOnly Cookie & Xác Thực Email OTP Toàn Diện

## 1. Hiện trạng Code Liên Quan
- **Backend (`MT_GRMS_BACKEND`)**:
  - `AuthController.cs`: 
    - `POST /api/auth/login`: Xác thực tài khoản và trả về thông tin phiên. Cần nâng cấp hỗ trợ 2FA Email OTP.
    - `POST /api/auth/register/send-otp` & `POST /api/auth/register`: Trước đây gọi `ISmsService` (TextBee / SMS). Cần chuyển sang gọi `IEmailService` để gửi OTP qua Email.
    - `POST /api/auth/refresh` & `POST /api/auth/logout`: Xử lý phiên và thu hồi cookie.
  - `EmailService.cs` & `IEmailService.cs`: Đã có sẵn nền tảng SMTP (Gmail App Password) và console fallback log. Cần mở rộng hỗ trợ template gửi mã OTP đăng nhập và OTP đăng ký cửa hàng.
  - `TextBeeSmsService.cs` & `TextBeeSettings.cs`: Hiện tại không còn ổn định (lỗi 401 do sai/hết hạn API key, phụ thuộc máy Android & SIM vật lý) -> Cần loại bỏ.
- **Frontend (`MT_GRMS_FRONTEND`)**:
  - `LoginPage.tsx`: Nhập thông tin đăng nhập. Cần tích hợp bước xác thực thứ hai qua `LoginOtpModal.tsx`.
  - `RegisterPage.tsx` & `RegistrationOtpModal.tsx`: Đã có modal nhập 6 số, cần cập nhật nội dung sang xác thực Email OTP thay vì SMS.
  - `authService.ts`: Cần cập nhật các hàm `login`, `verifyLoginOtp`, `sendRegistrationEmailOtp`, `registerTenant`.

---

## 2. Quyết Định Kiến Trúc 1: Loại Bỏ Hoàn Toàn `localStorage` & Dùng `HttpOnly Cookie`
- **Kháng 100% tấn công XSS**: Cookie mang cờ `HttpOnly` ngăn chặn mọi mã độc JavaScript truy cập token.
- **Phòng chống tấn công CSRF**: Cấu hình `SameSite=Lax` kết hợp kiểm tra nguồn gốc CORS và Origin/Referer.
- **Tự động hết hạn**: Trình duyệt tự dọn dẹp khi hết hạn; khi refresh token hết hạn, tự động đưa người dùng về trang đăng nhập an toàn.

---

## 3. Quyết Định Kiến Trúc 2: Thay Thế SMS Bằng Email OTP Toàn Diện

### 3.1. So sánh phương án gửi mã xác thực OTP

| Tiêu chí | Cổng SMS bên thứ ba (Twilio / Firebase / TextBee) | Email OTP (SMTP / IEmailService) (Lựa chọn) |
| :--- | :--- | :--- |
| **Chi phí** | Đắt đỏ, yêu cầu nạp tiền USD hoặc đặt cọc (VD: Firebase bắt cọc 800.000đ tại VN) | **Hoàn toàn miễn phí** (dùng SMTP Gmail hoặc máy chủ nội bộ) |
| **Phụ thuộc phần cứng** | TextBee đòi hỏi 1 máy điện thoại Android luôn mở, kết nối wifi và có SIM vật lý | **Không phụ thuộc phần cứng**, hoạt động 100% trên server Backend |
| **Độ ổn định** | Dễ rớt mạng, nghẽn mạng viễn thông, lỗi API Key, khoá vùng mã quốc gia (+84) | **Rất ổn định**, gửi thẳng tới hộp thư đến của người dùng |
| **Môi trường Dev / Demo đồ án** | Khó test khi không có thiết bị hoặc hết tiền trong SIM | **Có sẵn Dev Console Fallback**: Tự động in mã OTP ra Terminal giúp demo mượt mà |

### 3.2. Cơ chế quản lý mã OTP an toàn trong Backend
- Sử dụng **`IMemoryCache`**:
  - Khóa cache: `otp:register:{cleanEmail}` và `otp:login:{tempToken}`.
  - Thời gian hết hạn (TTL): **5 phút**.
  - Mã OTP: Chuỗi ngẫu nhiên 6 chữ số an toàn bảo mật (`RandomNumberGenerator`).
  - Giới hạn số lần thử (Brute-force protection): Tối đa **5 lần thử sai**; nếu vượt quá sẽ hủy mã OTP và bắt buộc yêu cầu gửi lại mã mới.
  - Xóa mã ngay khi xác thực thành công (One-Time-Use).

### 3.3. Quy trình Đăng nhập 2 bước (2FA via Email OTP)
1. **Bước 1 (Credentials)**: Người dùng nhập Email/Tài khoản + Mật khẩu trên `LoginPage.tsx`.
2. **Bước 2 (Gửi OTP)**: Backend kiểm tra mật khẩu. Nếu hợp lệ:
   - Sinh chuỗi ngẫu nhiên `tempToken` (GUID an toàn) lưu tạm thời trong cache kèm UserId (thời hạn 5 phút).
   - Sinh mã OTP 6 số và gửi tới Email của tài khoản qua `IEmailService`.
   - Trả về: `{ requiresOtp: true, tempToken: "...", emailMasked: "n***@gmail.com" }`.
3. **Bước 3 (Nhập OTP & Hoàn tất)**:
   - Frontend hiển thị `LoginOtpModal.tsx`.
   - Người dùng nhập 6 số OTP (hoặc bấm nút "Điền nhanh OTP Dev" nếu ở môi trường local).
   - Frontend gọi `POST /api/auth/login/verify-otp` kèm `{ tempToken, otpCode }`.
   - Backend xác minh khớp: Cấp JWT Cookie, trả về `user` profile và hoàn tất đăng nhập.

### 3.4. Quy trình Đăng ký cửa hàng qua Email OTP
1. Người dùng nhập thông tin: Họ tên, Tên cửa hàng, SĐT, Email, Mật khẩu.
2. Bấm "Tạo tài khoản" -> Frontend gọi `POST /api/auth/register/send-otp` với `{ email, fullName, storeName }`.
3. Backend sinh OTP 6 số, lưu vào cache `otp:register:{email}` và gửi email.
4. Frontend mở `RegistrationOtpModal.tsx` hiển thị địa chỉ email nhận mã.
5. Người dùng nhập mã OTP và bấm "Xác nhận & Mở cửa hàng".
6. Frontend gọi `POST /api/auth/register` kèm `otpCode`.
7. Backend kiểm tra OTP hợp lệ -> Tạo Tenant, Branch, StoreOwner và đăng nhập người dùng.

---

## 4. Kế Hoạch Thay Đổi & Dọn Dẹp
1. **Dọn dẹp**: Xóa bỏ `TextBeeSmsService.cs`, `TextBeeSettings.cs`, `ISmsService.cs` và các cấu hình TextBee trong `.env` / `appsettings.json`.
2. **Backend**:
   - Mở rộng `IEmailService` và `EmailService`: Thêm `SendLoginOtpAsync` và `SendRegistrationOtpAsync` với template HTML đẹp mắt chuẩn thương hiệu MT-GRMS.
   - Thêm DTOs trong `AuthDtos.cs`: `VerifyLoginOtpRequest`, `LoginResponseDto`, `SendEmailOtpRequest`.
   - Thêm logic xác thực 2FA trong `AuthService.cs` và `AuthController.cs`.
3. **Frontend**:
   - Tạo mới `LoginOtpModal.tsx` theo chuẩn KiotViet Design System (`RULE_UI_DESIGN_SYSTEM.md`), bo tròn pill, không animation nhún nhảy.
   - Cập nhật `RegistrationOtpModal.tsx` thể hiện rõ nội dung xác thực Email.
   - Cập nhật `LoginPage.tsx`, `RegisterPage.tsx` và `authService.ts`.
