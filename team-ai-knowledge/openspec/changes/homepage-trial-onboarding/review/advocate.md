# Advocate Review: homepage-trial-onboarding

## Vấn đề

- [HIGH] Proposal mâu thuẫn với specs về đăng ký thường `NO_PLAN` và đăng ký CTA Trial.
- [HIGH] `NO_PLAN` cần truy cập nạp ví, callback thanh toán và checkout; nếu không người dùng mới có số dư 0 không thể mua STANDARD/PRO.
- [MEDIUM] Response mất sau commit cần hướng dẫn đăng nhập lại và điều hướng theo trạng thái thật.
- [MEDIUM] Cần giữ dữ liệu form khi gửi/resend OTP hoặc lỗi mạng.
- [MEDIUM] Phải nói rõ 72 giờ bắt đầu ngay khi đăng ký thành công.
- [MEDIUM] Trial hết khi đang thao tác phải giữ dữ liệu và đưa tới nâng cấp an toàn.
- [MEDIUM] Cần mapping lỗi tiếng Việt và hành động tiếp theo.
- [MEDIUM] Popup xác nhận cần focus trap, Escape, label và vùng bấm phù hợp.
- [LOW] UI không hiển thị mã nội bộ `NO_PLAN`, `ELIGIBLE`, `PAID`.

## Kết luận

Cần sửa proposal và mở đường mua/nạp ví cho `NO_PLAN`.
