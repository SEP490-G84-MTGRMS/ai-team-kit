# Design Brief: Đăng Nhập, Quản Lý Phiên Bằng HttpOnly Cookie & Silent Refresh

## 1. Luồng Người Dùng & Tương Tác (User & API Flow)

### 1.1. Luồng Đăng Nhập Ban Đầu
1. Người dùng nhập `phoneOrEmail` (Username/Email/SĐT) và `password`.
2. Frontend gọi `POST /api/auth/login` (kèm `withCredentials: true`).
3. Backend xác thực thành công:
   - Ghi Cookie `access_token` (`HttpOnly; Secure; SameSite=Lax; Path=/`).
   - Ghi Cookie `refresh_token` (`HttpOnly; Secure; SameSite=Lax; Path=/api/auth`).
   - Cập nhật `RefreshToken` và `RefreshTokenExpiryTime` trong bảng `Users`.
   - Trả về HTTP 200 OK kèm payload `UserInfo` (`id`, `fullName`, `roleName`, `storeName`, `tenantId`). Body **không** chứa chuỗi token nhạy cảm.
4. Frontend nhận thông tin người dùng:
   - Cập nhật `useAuthStore` (`user: UserInfo`, `isAuthenticated: true`).
   - **Tuyệt đối không lưu token vào `localStorage` hay bất kỳ bộ nhớ nào ở client**.
   - Điều hướng người dùng theo vai trò (`CASHIER` -> `/pos`, `ADMIN` -> `/admin/dashboard`).

### 1.2. Luồng Kiểm Tra Trạng Thái Đăng Nhập Khi Mở Trang / F5
1. Khi người dùng tải lại trang hoặc mở tab mới:
   - `useAuthStore` gọi `GET /api/auth/me` (với `withCredentials: true`).
   - Nếu Cookie `access_token` hợp lệ: Backend trả về `UserInfo`, Frontend duy trì phiên làm việc.
   - Nếu `access_token` hết hạn: Axios kích hoạt luồng Silent Refresh (Mục 1.3).
   - Nếu không có cookie hoặc phiên không hợp lệ: Frontend coi như chưa đăng nhập, chuyển hướng `/auth/login`.

### 1.3. Luồng Silent Refresh Bằng HttpOnly Cookie
1. Khi gọi API nghiệp vụ (ví dụ: `GET /api/branches`), Backend phát hiện `access_token` cookie hết hạn -> Phản hồi HTTP `401 Unauthorized`.
2. Axios Response Interceptor chặn 401:
   - Nếu `isRefreshing === false`:
     - Đặt `isRefreshing = true`.
     - Gửi ngầm `POST /api/auth/refresh` với `withCredentials: true`. Trình duyệt tự động đính kèm Cookie `refresh_token`.
   - Nếu `isRefreshing === true` (các request khác đồng thời):
     - Đưa request vào hàng đợi `failedQueue` chờ xử lý.
3. Backend xử lý `/api/auth/refresh`:
   - Lấy `refresh_token` từ Cookie.
   - Tra cứu trong CSDL PostgreSQL bảng `Users`, kiểm tra `RefreshTokenExpiryTime > DateTime.UtcNow`.
   - Sinh cặp token mới (Token Rotation), ghi đè lại 2 HttpOnly Cookies mới qua `Response.Cookies.Append()`.
4. Frontend nhận phản hồi thành công:
   - Giải phóng `failedQueue`, thực thi lại toàn bộ request trong hàng đợi với cookie mới.
   - Đặt `isRefreshing = false`.
   - Người dùng hoàn toàn không cảm nhận thấy sự gián đoạn.

### 1.4. Luồng Xử Lý Hết Hạn Phiên (Session Expiry)
1. Khi `POST /api/auth/refresh` nhận HTTP 401 (Refresh Token hết hạn hoặc không hợp lệ):
   - Backend xóa sạch các cookies bằng cách đặt `Max-Age=0` hoặc gọi `Response.Cookies.Delete()`.
   - Axios Interceptor hủy bỏ các request trong hàng đợi.
   - Xóa `user` khỏi `useAuthStore` (`isAuthenticated = false`).
   - Hiển thị Toast thông báo: *"Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."*
   - Ghi nhớ URL hiện tại: `const redirectUrl = window.location.pathname + window.location.search`.
   - Điều hướng về `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`.
2. Sau khi người dùng đăng nhập lại thành công:
   - Hệ thống tự động chuyển tiếp người dùng về đúng `redirectUrl` ban đầu để tiếp tục công việc.

### 1.5. Luồng Đăng Xuất Chủ Động (`POST /api/auth/logout`)
1. Người dùng bấm nút "Đăng xuất" trên Topbar hoặc Menu.
2. Frontend gọi `POST /api/auth/logout` (với `withCredentials: true`).
3. Backend:
   - Thu hồi Refresh Token trong DB (`User.RefreshToken = null`).
   - Xóa bỏ cả 2 Cookies `access_token` và `refresh_token`.
4. Frontend dọn dẹp state và điều hướng về `/auth/login`.

---

## 2. Giao Diện & Trạng Thái Màn Hình (UI States)
- **Normal State**: Form đăng nhập sắc nét, nút bo tròn Full Pill (`border-radius: 9999px`), icon Monochrome SVG.
- **Silent Refresh State**: Không có bất kỳ dialog hay popup khó chịu nào hiện lên gây phiền nhiễu cho người dùng.
- **Session Expired Alert**: Khi bị logout cưỡng chế do hết hạn phiên, hiển thị Toast cảnh báo để người dùng hiểu lý do vì sao họ bị đưa về màn hình Đăng nhập.

---

## 3. Endpoints & Cookie Contracts Hợp Nhất
- `POST /api/auth/login`: Xác thực credentials -> Trả về `Set-Cookie: access_token=...; HttpOnly` và `Set-Cookie: refresh_token=...; HttpOnly`, Response Body: `ApiResponse<UserInfo>`.
- `POST /api/auth/refresh`: Đọc `refresh_token` từ Cookie -> Ghi mới 2 Cookies (Token Rotation), Response Body: `ApiResponse<UserInfo>`.
- `GET /api/auth/me`: Đọc `access_token` từ Cookie -> Trả về `ApiResponse<UserInfo>`.
- `POST /api/auth/logout`: Xóa Cookies, thu hồi Refresh Token trong CSDL -> `ApiResponse<{ success: true }>`.
