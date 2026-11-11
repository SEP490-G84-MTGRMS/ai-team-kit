# Proposal: auth-login-integration

## Vấn đề
- Hiện tại giao diện đăng nhập của Frontend (`MT_GRMS_FRONTEND`) đang dựa vào cơ chế fallback giả lập dữ liệu tĩnh (mock demo data) trong `authService.ts` chứ chưa thực sự liên kết với Backend.
- Backend (`MT_GRMS_BACKEND`) đã hoàn thiện endpoint `POST /api/auth/login` cùng cơ sở dữ liệu PostgreSQL (chạy Docker) và bảng `users` chứa tài khoản `admin` / `Admin@123`.
- Giữa Frontend và Backend đang có sự chưa đồng bộ về:
  1. **Route URL**: Backend phục vụ `/api/auth/login`, trong khi `httpClient` của Frontend đang mặc định prefix `/api/v1`.
  2. **Hợp đồng dữ liệu (DTO Contract)**: Backend mong muốn trường `usernameOrEmail`, còn Frontend đang truyền trường `email`.
  3. **Cấu hình mạng & CORS/Proxy**: Frontend chạy tại cổng `http://localhost:5173` cần được cấu hình proxy sang Backend (cổng `5232`) để gọi API mượt mà, không gặp rào cản CORS.

---

## 📝 NHẬT KÝ CẬP NHẬT (2026-11-11): CHUYỂN TOÀN DIỆN SANG EMAIL OTP (LOGIN 2FA & REGISTER)

### Vấn đề phát sinh & Yêu cầu thay đổi
- Việc gửi SMS OTP qua bên thứ ba (Twilio, Firebase, TextBee Gateway) gặp nhiều rào cản nghiêm trọng: phụ thuộc thiết bị Android vật lý, SIM cá nhân dễ gián đoạn, lỗi `AUTH_INVALID`, chặn vùng mã quốc gia Việt Nam (+84), và yêu cầu chi phí cọc cao.
- **Quyết định kiến trúc**: Bỏ toàn bộ cơ chế SMS/TextBee, chuyển 100% sang **Email OTP** bằng `IEmailService` (hỗ trợ SMTP Gmail / Server Mail kèm console log fallback cho dev/demo) cho cả 2 luồng:
  1. **Đăng nhập 2 bước (Login 2FA)**: Nhập Email + Mật khẩu -> Backend kiểm tra đúng -> Gửi mã OTP 6 số về Email -> Modal nhập OTP Email -> Cấp JWT Token và điều hướng Dashboard theo vai trò.
  2. **Đăng ký cửa hàng (Register OTP)**: Form đăng ký gửi mã OTP xác nhận về Email của chủ cửa hàng -> Modal nhập OTP Email -> Kích hoạt tài khoản và mở cửa hàng.

## Mục tiêu
- Đồng bộ hóa hợp đồng API (DTO Contract) giữa `MT_GRMS_BACKEND` và `MT_GRMS_FRONTEND` cho tính năng đăng nhập và đăng ký.
- Thiết lập cấu hình kết nối mạng (Vite Proxy và Base URL) để Frontend gọi trực tiếp tới Backend API.
- Hoàn thiện luồng xác thực End-to-End với bảo mật Email OTP 2 bước (2FA) khi đăng nhập và Email OTP khi đăng ký.
- Cấp JWT AccessToken, lưu trữ phiên đăng nhập an toàn và điều hướng thông minh theo từng vai trò (`Admin`, `StoreOwner`, `Staff`).

## Phạm vi (Scope)
- **In scope**:
  - Tinh chỉnh `authService.ts` và `authTypes.ts` phía Frontend để gửi đúng định dạng DTO (`usernameOrEmail`, `password`, `tenantCode`).
  - Hỗ trợ luồng Đăng nhập 2 bước (2FA):
    - `POST /api/auth/login`: Kiểm tra credentials, nếu đúng sẽ sinh mã OTP gửi về Email và trả về `{ requiresOtp: true, tempToken: "...", emailMasked: "..." }`.
    - `POST /api/auth/login/verify-otp`: Xác thực mã OTP 6 số từ Email để hoàn tất đăng nhập.
  - Hỗ trợ luồng Đăng ký cửa hàng qua Email OTP:
    - `POST /api/auth/register/send-otp`: Gửi OTP kích hoạt tới Email đăng ký.
    - `POST /api/auth/register`: Xác minh OTP Email và tạo Tenant, Branch, StoreOwner.
  - Tích hợp Modal OTP KiotViet-style trên Frontend cho cả Login (`LoginOtpModal.tsx`) và Register (`RegistrationOtpModal.tsx`) với nút "Điền nhanh OTP Dev" khi chạy local.
  - Dọn dẹp TextBee/SMS không còn sử dụng.
- **Out of scope**:
  - WebAuthn / Passkeys.

## Người dùng liên quan
- **Chủ cửa hàng & Thu ngân**: Đăng nhập an toàn bằng Email OTP 2FA và đăng ký cửa hàng thuận tiện.
- **Frontend & Backend Developers**: Quy chuẩn giao tiếp API thông suốt và test nhanh chóng qua console fallback.

## Tiêu chí thành công
- [ ] Đăng nhập thành công với xác thực 2 bước (Email OTP 2FA) trên tài khoản thật.
- [ ] Đăng ký cửa hàng mới thành công với mã OTP gửi qua Email.
- [ ] Điều hướng chính xác theo vai trò sau khi xác thực OTP thành công.
- [ ] Toàn bộ unit tests và build Frontend/Backend chạy pass 100%.
