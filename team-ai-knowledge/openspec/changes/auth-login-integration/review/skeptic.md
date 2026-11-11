# Skeptic Review: auth-login-integration (Email OTP 2FA & Registration Workflow)

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Bao phủ đầy đủ luồng Đăng nhập 2 bước (2FA via Email OTP), Đăng ký xác thực qua Email OTP, loại bỏ hoàn toàn SMS/TextBee, và hỗ trợ Dev Console Fallback cho môi trường kiểm thử/chấm đồ án. |
| D2 Correctness | 5/5 | Cơ chế lưu mã OTP trong `IMemoryCache` với TTL 5 phút, khóa sau 5 lần nhập sai chống brute-force, tự hủy OTP ngay khi sử dụng (One-Time-Use). |
| D3 Coherence | 5/5 | Đồng bộ 100% hợp đồng API giữa Backend (`POST /api/auth/login`, `POST /api/auth/login/verify-otp`, `POST /api/auth/register/send-otp`, `POST /api/auth/register`) và Frontend (`authService.ts`, `LoginOtpModal.tsx`, `RegistrationOtpModal.tsx`). |
| D4 Constraints | 5/5 | Tuân thủ nghiêm ngặt `RULE_UI_DESIGN_SYSTEM.md`: Nút Full Pill `9999px`, phông `Be Vietnam Pro` + `JetBrains Mono`, 100% Monochrome SVG Icons, tĩnh hoàn toàn, không có animation nhún nhảy hay rung lắc. |
| D5 Blast Radius | 5/5 | Dọn dẹp gọn gàng TextBee/SMS, không làm ảnh hưởng đến các logic cấp quyền JWT Cookie hay phân quyền vai trò (Role-based Navigation) đã hoàn thiện. |

## Phản Biện & Giải Pháp Đã Xử Lý
- [HIGH] Bảo vệ Brute-force mã OTP: Kẻ tấn công có thể thử ngẫu nhiên từ 000000 đến 999999 → Đề xuất: Giới hạn tối đa 5 lần nhập sai mã OTP trên mỗi `tempToken` hoặc `email`. Sau 5 lần nhập sai, tự động hủy mã trong cache và bắt buộc đăng nhập lại từ đầu. (Đã đưa vào REQ-AUTH-08).
- [HIGH] Môi trường Dev không có SMTP: Nếu máy dev chưa cấu hình mật khẩu ứng dụng Gmail (Gmail App Password) trong `.env` thì luồng đăng ký và đăng nhập sẽ bị tắc → Đề xuất: Khi chưa có credentials SMTP, hệ thống tự động in mã OTP ra Terminal Console Log và trả về trường `devOtp` trong môi trường `Development`, cho phép người dùng bấm nút "Điền nhanh OTP Dev" trên Modal để kiểm thử mượt mà 100%. (Đã đưa vào REQ-AUTH-11).
- [MEDIUM] Dọn dẹp mã cũ: Gỡ bỏ TextBee SMS cần đảm bảo không để sót tham chiếu làm gãy Unit Tests trong `UserAuthenticationTests.cs` → Đề xuất: Cập nhật lại các test cases tương ứng trong Backend. (Đã đưa vào REQ-AUTH-10).

## Kết Luận: CHẤP NHẬN (PASS) — Sẵn sàng chuyển sang Apply để thực thi code.
