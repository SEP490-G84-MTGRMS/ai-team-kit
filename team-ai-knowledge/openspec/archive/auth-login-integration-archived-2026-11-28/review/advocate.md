# Advocate Review: auth-login-integration

## Người dùng & tình huống chính
- Chủ cửa hàng nhận lỗi rõ ngay tại form nhưng API vẫn bảo vệ khi gọi trực tiếp.
- Tài khoản cũ vẫn đăng nhập được dù mật khẩu không đạt policy đăng ký mới.

## Vấn đề
- [MEDIUM — Theo task] Frontend cần thông báo theo từng rule và giữ nguyên dữ liệu form khi lỗi.
- [MEDIUM — Theo task] Checkbox điều khoản mặc định false và chỉ gửi khi người dùng chủ động chọn.

## Đề xuất cắt giảm / để sau
- Không thêm lịch sử phiên bản điều khoản trong change này.

## Kết luận: Đáp ứng người dùng
