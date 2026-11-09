# Design Brief: Luồng Đăng nhập, Silent Refresh Token & Xử Lý Hết Hạn Phiên

## 1. Luồng Người Dùng & Tương Tác (User & API Flow)

### 1.1. Luồng Đăng Nhập Ban Đầu
1. Người dùng nhập `phoneOrEmail` (Username/Email/SĐT) và `password`.
2. Frontend gọi `POST /api/auth/login`.
3. Backend xác thực, sinh cặp:
   - `AccessToken`: JWT sống ngắn (15 - 60 phút).
   - `RefreshToken`: Chuỗi ngẫu nhiên bảo mật cao lưu vào CSDL (`RefreshToken`, `RefreshTokenExpiryTime` = 7 ngày hoặc 30 ngày nếu RememberMe).
4. Frontend lưu `accessToken` và `refreshToken`, cập nhật `useAuthStore` và điều hướng theo vai trò (`ADMIN`, `STORE_OWNER`, `CASHIER`).

### 1.2. Luồng Silent Refresh Khi Access Token Hết Hạn
1. Người dùng đang thao tác trên giao diện, gọi API nghiệp vụ (ví dụ: `POST /api/orders` hoặc `GET /api/inventory/stocks`).
2. Backend kiểm tra JWT thấy đã hết hạn -> Trả về HTTP `401 Unauthorized`.
3. Axios Response Interceptor chặn HTTP 401:
   - Nếu `isRefreshing === false`:
     - Đặt `isRefreshing = true`.
     - Gọi ngầm `POST /api/auth/refresh` với payload `{ "refreshToken": "..." }`.
   - Nếu `isRefreshing === true` (có các request khác phát sinh cùng thời điểm):
     - Đẩy request vào `failedQueue = []` (chờ Promise resolve/reject).
4. Phản hồi từ `POST /api/auth/refresh`:
   - Backend xác thực Refresh Token trong DB:
     - Nếu hợp lệ: Cấp mới cặp `accessToken` + `refreshToken` mới (Token Rotation).
   - Frontend nhận token mới:
     - Cập nhật Storage và Zustand store.
     - Duyệt `failedQueue`: Gắn token mới vào header `Authorization: Bearer <new_token>` và thực thi lại toàn bộ request trong hàng đợi.
     - Đặt `isRefreshing = false`.
   - Người dùng **hoàn toàn không bị gián đoạn**, không bị tải lại trang.

### 1.3. Luồng Điều Hướng Khi Phiên Hết Hạn (Refresh Token Hết Hạn)
1. Khi `POST /api/auth/refresh` trả về lỗi HTTP 401/400 (hoặc không tìm thấy Refresh Token hợp lệ):
   - Xóa toàn bộ token (`access_token`, `refresh_token`) và thông tin người dùng (`auth_user`) trong Storage và Zustand store.
   - Hủy bỏ các request trong hàng đợi (`failedQueue`).
   - Hiển thị thông báo Toast cảnh báo: *"Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."*
   - Ghi nhớ URL hiện tại: `const redirectUrl = window.location.pathname + window.location.search`.
   - Điều hướng về `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`.
2. Sau khi người dùng đăng nhập lại thành công:
   - Hệ thống tự động chuyển tiếp người dùng về đúng `redirectUrl` ban đầu để tiếp tục công việc.

---

## 2. Giao Diện & Trạng Thái Màn Hình (UI States)
- **Normal State**: Form đăng nhập sắc nét, nút bo tròn Full Pill (`border-radius: 9999px`), icon Monochrome SVG.
- **Silent Refresh State**: Không có bất kỳ dialog hay popup khó chịu nào hiện lên gây phiền nhiễu cho người dùng.
- **Session Expired Alert**: Khi bị logout cưỡng chế do hết hạn phiên, hiển thị Toast thông báo cảnh báo ở góc trên bên phải màn hình để người dùng hiểu lý do vì sao họ bị đưa về màn hình Đăng nhập (thay vì bị out đột ngột mà không rõ nguyên nhân).

---

## 3. Endpoints & DTOs Hợp Nhất
- `POST /api/auth/login`: `{ usernameOrEmail, password, tenantCode? }` -> `LoginResponse` (AccessToken, RefreshToken, ExpiresAt, User).
- `POST /api/auth/refresh`: `{ refreshToken }` -> `LoginResponse` (AccessToken mới, RefreshToken mới, ExpiresAt, User).
- `POST /api/auth/logout`: Thu hồi Refresh Token trong DB và dọn dẹp Storage ở client.
