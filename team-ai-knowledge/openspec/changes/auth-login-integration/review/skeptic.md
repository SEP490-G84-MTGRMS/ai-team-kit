# Skeptic Review: auth-login-integration

| Chiều | Điểm (1–5) | Nhận xét |
|---|---:|---|
| D1 Completeness | 4 | Có luồng bật/tắt, lỗi OTP, ownership; cần task và xác nhận giới hạn rate cụ thể lúc implement. |
| D2 Correctness | 4 | Login kiểm tra cờ sau mật khẩu; challenge Settings riêng và một lần. |
| D3 Coherence | 4 | API login cũ và Settings mới đã đồng bộ; design cũ vẫn còn đoạn mô tả 2FA luôn bật, mục 4 bổ sung thay thế. |
| D4 Constraints | 4 | CSRF, ownership, rate limit, audit transaction đã có. |
| D5 Blast Radius | 4 | Migration/backfill, login caller và Settings ảnh hưởng nhiều lớp. |

## Vấn đề
- [MEDIUM] REQ-AUTH-12: Giới hạn tần suất chưa chốt con số; chọn ngưỡng trong thiết kế triển khai và kiểm tra tương ứng.
- [MEDIUM] Design mục 1.1 mô tả OTP luôn gửi; mục 4 làm rõ luồng mới thay thế khi 2FA tắt.
- [Đã xử lý HIGH] REQ-AUTH-08/12: Challenge gắn UserId/action, một lần, 5 sai, TTL; Backend suy ra identity từ cookie và chống CSRF.
- [Đã xử lý HIGH] REQ-AUTH-12: Atomic update + audit, bảo toàn mặc định enabled, tránh replay.

## Kết luận: Chấp nhận sau khi tasks được cập nhật
