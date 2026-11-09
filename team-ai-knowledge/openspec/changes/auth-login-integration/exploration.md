# Exploration: Chuyển Đổi Sang HttpOnly Cookie Toàn Diện & Xử Lý Hết Hạn Phiên

## 1. Hiện trạng Code Liên Quan
- **Backend (`MT_GRMS_BACKEND`)**:
  - `AuthController.cs`: 
    - `POST /api/auth/login`: Hiện tại chỉ trả token trong response body `LoginResponse` (AccessToken, RefreshToken, UserInfo), chưa ghi `Set-Cookie` với thuộc tính `HttpOnly; SameSite=Lax`.
    - `POST /api/auth/refresh`: Đang nhận `RefreshTokenRequest` từ request body thay vì đọc cookie `refresh_token`.
    - `POST /api/auth/logout`: Chưa xóa các cookies (`access_token`, `refresh_token`) thông qua `Response.Cookies.Delete()`.
  - `Program.cs`: CORS policy `AllowFrontend` đã cho phép `http://localhost:5173` nhưng cần đảm bảo kích hoạt `.AllowCredentials()` để trình duyệt gửi và nhận Cookie giữa Frontend và Backend.
  - `User.cs`: Thực thể đã có sẵn các cột `RefreshToken` và `RefreshTokenExpiryTime` trong PostgreSQL.
- **Frontend (`MT_GRMS_FRONTEND`)**:
  - `httpClient.ts`: Đang đọc token từ `localStorage.getItem('access_token')` và gắn vào header `Authorization: Bearer <token>`. Cần chuyển sang `withCredentials: true` và loại bỏ hoàn toàn việc can thiệp token từ `localStorage`.
  - `useAuthStore.ts`: Đang lưu `token` vào state và persist vào `localStorage`. Cần loại bỏ trường `token`, chỉ lưu giữ `user` (profile người dùng) và trạng thái `isAuthenticated`.

---

## 2. Quyết Định Kiến Trúc: Loại Bỏ Hoàn Toàn `localStorage` & Chuyển 100% Sang `HttpOnly Cookie`

### 2.1. Đánh giá bảo mật: Tại sao HttpOnly Cookie là tiêu chuẩn an toàn cao nhất?
- **Kháng 100% tấn công XSS (Cross-Site Scripting Token Theft)**:
  - Khi đặt cờ `HttpOnly`, trình duyệt nghiêm cấm tuyệt đối bất kỳ script JavaScript nào (kể cả qua console, XSS attack, malicious package) truy cập vào giá trị của Cookie (`document.cookie` không thể thấy token).
  - Kẻ tấn công không thể sao chép token để giả mạo phiên làm việc từ máy khác.
- **Phòng chống tấn công CSRF (Cross-Site Request Forgery)**:
  - Cấu hình cookie với `SameSite=Lax` (hoặc `SameSite=Strict`), kết hợp kiểm tra nguồn gốc `Origin` / `Referer` trên Backend.
  - Với các request POST/PUT/DELETE từ website khác, trình duyệt sẽ không tự động gửi kèm cookie, vô hiệu hóa nguy cơ CSRF.
- **Tự động hết hạn (Expiration Management)**:
  - Trình duyệt tự động dọn dẹp Cookie khi đến hạn (`Expires` / `Max-Age`), không cần logic dọn dẹp thủ công phức tạp ở client.

---

## 3. Khảo Sát Cơ Chế Vận Hành với HttpOnly Cookie

### 3.1. Luồng Đăng nhập (`POST /api/auth/login`)
1. User gửi credentials (SĐT/Email + Mật khẩu).
2. Backend xác thực thành công:
   - Ghi Cookie `access_token` (`HttpOnly; SameSite=Lax; Path=/; MaxAge=15-60 phút; IsEssential=true`).
   - Ghi Cookie `refresh_token` (`HttpOnly; SameSite=Lax; Path=/api/auth; MaxAge=7-30 ngày; IsEssential=true`).
   - Response Body chỉ trả về thông tin người dùng (`UserInfo`: Id, FullName, RoleName, TenantId...). Tuyệt đối không chứa chuỗi token nhạy cảm trong body.
3. Frontend nhận 200 OK: Lưu `user` vào Zustand store, chuyển hướng theo vai trò.

### 3.2. Luồng Gọi API Nghiệp Vụ
1. Axios `httpClient` được bật sẵn `withCredentials: true`.
2. Mọi request gửi lên Backend (`/api/...`) tự động được trình duyệt đính kèm Cookie `access_token`.
3. Frontend JS hoàn toàn không cần can thiệp hay đọc token.

### 3.3. Luồng Silent Refresh Khi Access Token Cookie Hết Hạn
1. Request nghiệp vụ nhận HTTP `401 Unauthorized` (do `access_token` cookie hết hạn).
2. Axios Response Interceptor chặn 401:
   - Nếu `isRefreshing === false`:
     - Đặt `isRefreshing = true`.
     - Gọi `POST /api/auth/refresh` với `withCredentials: true` (trình duyệt tự động gửi kèm cookie `refresh_token`).
   - Nếu `isRefreshing === true`:
     - Đưa request vào hàng đợi `failedQueue` chờ đợi.
3. Backend xử lý `/api/auth/refresh`:
   - Đọc `refresh_token` từ Cookie.
   - Xác thực trong CSDL PostgreSQL bảng `Users`.
   - Sinh cặp token mới (Token Rotation), ghi đè lại 2 cookie mới vào `Response.Cookies.Append()`.
4. Khi refresh thành công:
   - Frontend giải phóng `failedQueue`, thực thi lại toàn bộ request trong hàng đợi.
   - Người dùng tiếp tục thao tác bình thường không bị gián đoạn.

### 3.4. Luồng Khi Refresh Token Hết Hạn (Graceful Session Expiry)
1. `POST /api/auth/refresh` trả về HTTP 401 (Refresh token không tồn tại, hết hạn, hoặc bị thu hồi).
2. Backend tự động xóa sạch các cookies bằng cách set `Max-Age=0`.
3. Frontend:
   - Hủy bỏ các request trong hàng đợi.
   - Đặt lại trạng thái `useAuthStore` (`user: null`, `isAuthenticated: false`).
   - Hiển thị Toast cảnh báo: *"Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."*
   - Điều hướng về `/auth/login?redirect={encodeURIComponent(currentUrl)}`.

---

## 4. Phương Án Lựa Chọn & Kế Hoạch Thay Đổi
- **Phương án lựa chọn**: **Chuyển đổi toàn diện sang HttpOnly Cookie, loại bỏ 100% `localStorage` cho Token**.
- **Backend**:
  - Bổ sung helper / middleware / extension thiết lập HttpOnly Cookie chuẩn cho Access & Refresh Token trong `AuthController.cs`.
  - Endpoint `POST /api/auth/logout`: Xóa cookies và thu hồi token trong CSDL.
  - Cấu hình CORS với `AllowCredentials()`.
- **Frontend**:
  - `src/api/httpClient.ts`: Bật `withCredentials: true`, xóa bỏ logic lấy `access_token` từ `localStorage`.
  - `src/stores/useAuthStore.ts`: Loại bỏ hoàn toàn state `token`, chỉ quản lý `user` profile.
  - Bổ sung endpoint `GET /api/auth/me` để Frontend kiểm tra trạng thái đăng nhập khi người dùng F5 hoặc mở tab mới.
