# Skeptic Review: forgot-password-email-otp

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ kịch bản chính và edge case (email rỗng, email sai, OTP sai, OTP hết hạn, đổi mật khẩu thành công). |
| D2 Correctness | 5/5 | Logic 3 bước chặt chẽ, mật khẩu mới được băm bằng PBKDF2/SHA256 chuẩn kiến trúc hiện tại, OTP tự hủy sau khi đổi xong. |
| D3 Coherence | 5/5 | Hoàn toàn ăn khớp giữa Proposal, Design-Brief và Specs. Thống nhất bỏ `/v1`, chỉ dùng `/api` trên toàn hệ thống. |
| D4 Constraints | 5/5 | Thời hạn OTP 10 phút, mã số 6 chữ số ngẫu nhiên an toàn, có fallback Console Logger phục vụ demo dev không cần internet/SMTP. |
| D5 Blast Radius | 5/5 | Bảng `Users` đã có sẵn cột `PasswordResetOtp` và `OtpExpiry`, không cần chạy migration CSDL. Đổi `/api` giúp code Frontend và Vite Proxy gọn gàng hơn. |

## Vấn đề
- [MEDIUM] Chống spam request gửi OTP: Đảm bảo nút "Gửi lại mã?" ở Frontend có đếm ngược 60 giây và Backend kiểm tra nếu OTP vừa sinh chưa quá 60s thì không sinh mã mới dồn dập → Đề xuất: Đã tích hợp state `resendCooldown` 60s trên UI.
- [LOW] Case không phân biệt hoa thường của Email: Backend cần gọi `.Trim().ToLowerInvariant()` khi truy vấn người dùng theo email → Đề xuất: Áp dụng chuẩn hóa email trong `AuthService`.

## Kết luận: Chấp nhận
Specs đã sẵn sàng để lập tasks và thực hiện code.
