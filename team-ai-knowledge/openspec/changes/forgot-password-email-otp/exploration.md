# EXP-2026-11-06-002: Khảo sát & Phân tích Giải pháp Gửi Mã OTP Khôi phục Mật khẩu (Email vs SMS)

## 1. Problem Statement
Hiện tại giao diện Frontend `ForgotPasswordPage.tsx` đang chạy Mock UI (tự gán mã cứng `"889966"`). Người dùng cần có giải pháp gửi mã OTP thực tế để xác thực khôi phục mật khẩu. Đặt ra bài toán: **Có thể gửi OTP qua tin nhắn SMS số điện thoại không, và giải pháp nào tối ưu nhất cho đồ án MT-GRMS?**

## 2. Phân Tích Kỹ Thuật: Gửi OTP Qua Email vs Gửi Qua SMS

### A. Phương án 1: Gửi OTP qua Tin nhắn SMS (Twilio / eSMS / SpeedSMS)
- **Cơ chế**:
  - Người dùng nhập Số điện thoại (trường `Phone` trong bảng `Users`).
  - Backend gọi API của nhà cung cấp dịch vụ viễn thông (Twilio hoặc SMS Gateway nội địa như eSMS.vn, SpeedSMS).
- **Ưu điểm**:
  - Trải nghiệm người dùng tiện lợi, trực tiếp trên điện thoại.
- **Nhược điểm & Rào cản thực tế**:
  1. **Chi phí viễn thông**: SMS không miễn phí. Mỗi tin nhắn tốn phí (eSMS/SpeedSMS ~500đ - 800đ/SMS; Twilio ~$0.05 - $0.08 ~ 1.500đ - 2.000đ/SMS).
  2. **Quy định nhà mạng Việt Nam (Nghị định 91/2020/NĐ-CP về chống tin nhắn rác)**:
     - Các nhà mạng (Viettel, VinaPhone, MobiFone) **chặn gần như 100% tin nhắn OTP gửi từ các đầu số quốc tế (Twilio)** nếu không đăng ký Brandname.
     - Muốn gửi SMS Brandname chính thống (tên "MT-GRMS"), doanh nghiệp phải nộp Giấy phép kinh doanh (ĐKKD), hợp đồng với nhà mạng và trả phí duy trì Brandname hàng tháng (tối thiểu 200.000đ - 500.000đ/tháng).
  3. **Tài khoản Twilio Trial**: Chỉ gửi được đến những số điện thoại đã verified trước trên Twilio Console, không gửi được tự do cho người dùng mới.

### B. Phương án 2: Gửi OTP qua Email (Gmail SMTP / SendGrid / Amazon SES)
- **Cơ chế**:
  - Người dùng nhập Email đăng ký (trường `Email` trong bảng `Users`).
  - Backend gửi email định dạng HTML chứa mã OTP 6 chữ số và thông tin bảo mật qua giao thức SMTP tiêu chuẩn.
- **Ưu điểm vượt trội**:
  1. **Hoàn toàn MIỄN PHÍ 100%**: Sử dụng tài khoản Google/Gmail cá nhân bật 2-Step Verification và tạo *Mật khẩu ứng dụng (App Password)* 16 ký tự là có thể gửi tới 500 email/ngày mà không tốn 1 đồng chi phí.
  2. **Tương thích hoàn hảo với UI hiện tại**: Giao diện `ForgotPasswordPage.tsx` đã thiết kế sẵn input email, icon hòm thư, placeholder `"admin@mtgrms.vn"`.
  3. **Định dạng HTML đẹp mắt**: Email hiển thị thương hiệu MT-GRMS, mã OTP nổi bật, thời hạn 10 phút và cảnh báo an toàn.
  4. **Không phụ thuộc nhà mạng viễn thông**: Không lo bị chặn tin nhắn hay chậm trễ mạng viễn thông.

### C. Phương án Đề Xuất (Hybrid Architecture - Notification Strategy)
- **Kênh Chính (Primary Channel)**: Triển khai **Email OTP** qua Gmail SMTP tiêu chuẩn (.NET 8 `System.Net.Mail`), kèm cơ chế **Development Console Logger** (khi dev chưa điền mật khẩu SMTP, mã OTP tự động in ra màn hình Terminal để test ngay mà không bị lỗi crash).
- **Mở rộng Đa Kênh (Extensible Strategy)**: Thiết kế interface `IOtpService` theo mẫu thiết kế **Strategy Pattern**:
  - `EmailOtpSender`: Gửi qua Email (Active mặc định).
  - `SmsOtpSender`: Đóng vai trò adapter dự phòng (Mock / Logger cho số điện thoại `Phone`). Khi dự án có ngân sách hoặc hợp đồng SMS Brandname, chỉ cần điền API Key vào `appsettings.json` là kích hoạt được ngay mà không phải sửa code core.

## 3. Constraints
- **Zero Cost**: Ưu tiên giải pháp không phát sinh chi phí duy trì hàng tháng.
- **Instant Demo**: Phải hoạt động được ngay cả khi môi trường không có kết nối internet hoặc chưa cấu hình tài khoản SMTP (nhờ Console Logger fallback).
- **Bảo mật**: Mã OTP gồm 6 chữ số ngẫu nhiên sinh bằng `RandomNumberGenerator`, hạn sử dụng 10 phút, tự hủy sau khi sử dụng hoặc sau 3 lần nhập sai.

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi tài khoản User trong hệ thống đều có `Email` hợp lệ (khi tạo tenant/chủ cửa hàng đã yêu cầu email).
- **[ASSUMPTION-02]**: Bảng `Users` đã có sẵn 2 cột `PasswordResetOtp` và `OtpExpiry`, đủ để lưu trữ và kiểm tra mà không cần thay đổi cấu trúc bảng.

## 5. Scope & Non-Goals
### In Scope
- Triển khai `EmailService` hỗ trợ gửi Email OTP qua Gmail SMTP (với `appsettings.json` cấu hình linh hoạt).
- Hỗ trợ tra cứu tài khoản để khôi phục theo cả **Email** lẫn **Số điện thoại** (nếu người dùng nhập SĐT, hệ thống tìm ra tài khoản và gửi mã OTP về Email liên kết của tài khoản đó).
- Cung cấp trọn bộ 3 API: `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/verify-otp`, `POST /api/v1/auth/reset-password`.
- Cập nhật Frontend `ForgotPasswordPage.tsx` loại bỏ mock `889966`, kết nối API thực tế, thêm countdown 60s cho nút gửi lại mã.

### Out of Scope (Non-Goals)
- Không mua gói cước SMS Brandname trả phí của nhà mạng viễn thông trong giai đoạn này.

## 6. Success Criteria
- [ ] Người dùng nhập Email (hoặc SĐT đã đăng ký), hệ thống xác định đúng User và gửi OTP 6 số về Email của họ (hoặc console log).
- [ ] Gửi email HTML với giao diện chuyên nghiệp của MT-GRMS.
- [ ] Xác thực OTP chính xác (hạn 10 phút, báo lỗi nếu nhập sai).
- [ ] Cập nhật mật khẩu mới băm PBKDF2 vào CSDL và đăng nhập thành công.
