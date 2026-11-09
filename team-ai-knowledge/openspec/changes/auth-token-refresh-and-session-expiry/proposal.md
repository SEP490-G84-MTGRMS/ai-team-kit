# Proposal: auth-token-refresh-and-session-expiry

## 1. Vấn đề hiện tại
- **Gián đoạn trải nghiệm người dùng**: Hiện tại, khi JWT Access Token hết hạn (API trả về HTTP `401 Unauthorized`), bộ interceptor trong `src/api/httpClient.ts` lập tức xóa sạch token trong `localStorage` và cưỡng chế chuyển hướng người dùng về trang Đăng nhập (`/auth/login`). Điều này khiến Thu ngân tại quầy POS hoặc Chủ cửa hàng đang thao tác nhập hàng, kiểm kho bị mất dữ liệu form đang nhập dở.
- **Frontend chưa lưu trữ Refresh Token**: Phản hồi từ API Đăng nhập (`POST /api/auth/login`) và Đăng ký (`POST /api/auth/register`) đã trả về `refreshToken`, nhưng Frontend (`LoginPage.tsx`, `useAuthStore.ts`, `authService.ts`) hoàn toàn bỏ qua và không lưu `refresh_token` vào `localStorage`.
- **Thiếu cơ chế Silent Refresh & Request Queue**: Frontend chưa có cơ chế tự động gửi yêu cầu cấp mới Access Token khi gặp lỗi 401, cũng như chưa có hàng đợi (Request Queue) để tạm giữ và gửi lại các request song song đang chờ token mới.
- **Backend Refresh Token còn ở dạng Mock**: Mặc dù bảng `Users` trong PostgreSQL đã có sẵn 2 cột `RefreshToken` và `RefreshTokenExpiryTime`, hàm `RefreshTokenAsync` trong `AuthService.cs` hiện đang trả về dữ liệu mẫu tĩnh (`refreshed_user`) chứ chưa tra cứu, xác thực và xoay vòng (rotate) Refresh Token thật từ CSDL.

---

## 2. Mục tiêu
- **Trải nghiệm phiên đăng nhập liền mạch (Seamless Session)**: Khi Access Token hết hạn trong lúc người dùng đang thao tác, hệ thống tự động làm mới token ngầm (Silent Refresh) và tự động thực thi lại các request bị lỗi mà người dùng không hề nhận thấy sự gián đoạn.
- **Xác thực Refresh Token chuẩn bảo mật ở Backend**: CSDL lưu trữ `RefreshToken` cùng hạn sử dụng (ví dụ: 7 ngày cho web thông thường, 30 ngày cho Remember Me); API `POST /api/auth/refresh` xác thực token hợp lệ, xoay vòng token (Token Rotation) để chống lộ token và thu hồi token khi đăng xuất.
- **Xử lý dứt khoát khi phiên hết hạn hoàn toàn**: Khi Refresh Token hết hạn hoặc không hợp lệ, hệ thống dọn dẹp sạch toàn bộ thông tin đăng nhập trong Storage, hiển thị thông báo thân thiện *"Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"* và điều hướng về trang Đăng nhập (`/auth/login`).

---

## 3. Phạm vi (Scope)

### Trong phạm vi (In-scope):
- **Backend (`MT_GRMS_BACKEND`)**:
  - `AuthService.cs`: Lưu trữ `RefreshToken` và `RefreshTokenExpiryTime` vào bảng `Users` khi Login / Register.
  - `RefreshTokenAsync`: Tra cứu user theo `RefreshToken`, kiểm tra hạn dùng, cấp mới cặp `AccessToken` + `RefreshToken` mới (Token Rotation).
  - Thu hồi (Revoke) `RefreshToken` khi người dùng bấm Đăng xuất (`POST /api/auth/logout`).
- **Frontend (`MT_GRMS_FRONTEND`)**:
  - `useAuthStore.ts` & `authService.ts`: Lưu trữ và quản lý đồng bộ cả `access_token` lẫn `refresh_token`.
  - `httpClient.ts`: Thiết lập Axios Response Interceptor với cờ `isRefreshing` và hàng đợi `failedQueue` để xử lý các request đồng thời khi 401; tự động gọi API `/auth/refresh`.
  - Điều hướng và hiển thị thông báo lỗi phiên làm việc khi Refresh Token hết hạn.

### Ngoài phạm vi (Out-of-scope):
- Đăng nhập qua các nhà cung cấp OAuth2 bên ngoài (Google, Facebook, Zalo).
- Ma trận quản lý và thu hồi phiên đăng nhập đa thiết bị (Multi-device concurrent session management).

---

## 4. Người dùng & Role liên quan
- **Thu ngân (CASHIER)**: Không bị đăng xuất bất ngờ khi đang mở ca bán hàng hoặc thực hiện thanh toán cho khách tại POS.
- **Chủ cửa hàng (STORE_OWNER)** & **Quản lý (MANAGER)**: Thao tác nhập liệu, cấu hình chi nhánh, xem báo cáo liên tục mà không bị gián đoạn.
- **Quản trị viên (ADMIN)**: Phiên làm việc quản trị được bảo vệ an toàn với cơ chế token rotation.

---

## 5. Tiêu chí thành công (Success Metrics)
- [ ] Khi Access Token hết hạn, request bị 401 tự động được phát hiện, hệ thống gọi ngầm `POST /api/auth/refresh` và tiếp tục gửi lại request ban đầu thành công (HTTP 200) mà không tải lại trang.
- [ ] Khi nhiều request gọi đồng thời lúc token hết hạn, chỉ có đúng **1 request** refresh token được gửi lên server; các request còn lại được giữ trong hàng đợi và tiếp tục chạy sau khi có token mới.
- [ ] Khi Refresh Token hết hạn hoặc không hợp lệ, hệ thống xóa sạch session, hiển thị thông báo hết hạn và chuyển về `/auth/login`.
- [ ] Đăng xuất thành công thu hồi token trên cả Frontend lẫn Backend DB.
