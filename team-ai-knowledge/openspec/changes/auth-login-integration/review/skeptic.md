# Skeptic Review: auth-login-integration (HttpOnly Cookie & Session Lifecycle)

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Bao phủ đầy đủ luồng Đăng nhập, Silent Refresh (Request Queue), Session Expiry, Hydration qua `GET /api/auth/me`, và Đăng xuất an toàn. |
| D2 Correctness | 5/5 | Cơ chế Set-Cookie với `HttpOnly; SameSite=Lax`, phân tách `Path=/` cho access_token và `Path=/api/auth` cho refresh_token đảm bảo nguyên tắc đặc quyền tối thiểu. |
| D3 Coherence | 5/5 | Thống nhất 100% giữa proposal, exploration, design-brief và specs: không lưu token trong `localStorage`, chuyển toàn bộ sang HttpOnly Cookie. |
| D4 Constraints | 5/5 | Miễn nhiễm hoàn toàn trước tấn công XSS Token Theft, phòng chống CSRF qua `SameSite=Lax`, đảm bảo chuẩn bảo mật OWASP. |
| D5 Blast Radius | 4/5 | Khi chuyển sang Cookie, các request Axios cần cấu hình `withCredentials: true` và Backend CORS cần kích hoạt `AllowCredentials()`. Cần cập nhật các file liên quan một cách phẫu thuật (surgical). |

## Vấn đề & Giải pháp đã xử lý
- [MEDIUM] D1 Hydration State: Khi người dùng F5 hoặc mở tab mới, do không còn token trong `localStorage`, Zustand store sẽ trống rỗng lúc đầu → Đề xuất: Triển khai endpoint `GET /api/auth/me` để tự động khôi phục thông tin `user` khi App khởi chạy (hydrate user state), tránh nhấp nháy giao diện. (Đã xử lý trong REQ-AUTH-04).
- [MEDIUM] D5 CORS withCredentials: Cấu hình ASP.NET Core CORS với `.AllowCredentials()` không được phép đi kèm `.AllowAnyOrigin()` → Đề xuất: Chỉ định rõ các origins cụ thể (`http://localhost:5173`, `http://localhost:3000`) trong `Program.cs`. (Đã xử lý trong REQ-02).
- [LOW] D2 Scope Path: Đặt `Path=/api/auth` cho Cookie `refresh_token` để tránh gửi Refresh Token không cần thiết lên các endpoint nghiệp vụ khác. (Đã xử lý trong REQ-01).

## Kết luận: Chấp nhận (Sẵn sàng lập Tasks và triển khai code)
