# Exploration: Tích hợp Đăng nhập, Quản lý Token & Xử lý Hết hạn Phiên (Session Expiry)

## 1. Hiện trạng Code Liên Quan
- **Backend (`MT_GRMS_BACKEND`)**:
  - `AuthController.cs`: Có các endpoint:
    - `POST /api/auth/login`: Xác thực tài khoản, trả về `LoginResponse` (AccessToken, RefreshToken, UserInfo).
    - `POST /api/auth/refresh`: Tiếp nhận `RefreshTokenRequest`, nhưng hiện tại đang trả về dữ liệu mẫu tĩnh (`refreshed_user`) chứ chưa tra cứu và xác thực user thật trong database.
    - `POST /api/auth/logout`: Chưa có endpoint thu hồi (revoke) Refresh Token trong DB.
  - `User.cs`: Thực thể đã có sẵn 2 cột `RefreshToken` và `RefreshTokenExpiryTime` trong PostgreSQL.
- **Frontend (`MT_GRMS_FRONTEND`)**:
  - `httpClient.ts`: Đang cấu hình Axios Response Interceptor. Khi gặp bất kỳ lỗi `401 Unauthorized` nào, interceptor lập tức xóa `access_token` và `auth_user` trong `localStorage`, rồi cưỡng chế chuyển hướng `window.location.href = '/auth/login'`.
  - Chưa lưu `refreshToken` vào `localStorage` hay `useAuthStore` khi login/register.
  - Chưa có cơ chế Silent Refresh ngầm và hàng đợi (Request Queue) để xử lý các request song song khi Access Token hết hạn.

---

## 2. Phân Tích Kiến Trúc: Lưu Token Ở Đâu An Toàn Nhất? (localStorage vs HttpOnly Cookie vs In-Memory)

### 2.1. Tại sao mã nguồn trước đây lại lưu token vào `localStorage`?
- **Tiện lợi & Nhanh chóng**: Trong các dự án SPA (React/Vite), `localStorage` là giải pháp nhanh nhất: dễ đọc ghi qua JS, dễ đính kèm vào header `Authorization: Bearer <token>`, không gặp vấn đề cấu hình cross-origin cookie / SameSite khi chạy dev khác port (`localhost:5173` vs `localhost:5232`).
- **Nhược điểm nghiêm trọng (Lỗ hổng XSS)**:
  - Bất kỳ mã JavaScript nào thực thi trên trang (qua thư viện npm độc hại, browser extension, hoặc lỗ hổng XSS) đều có thể gọi `localStorage.getItem('access_token')` và đánh cắp token gửi về server của kẻ tấn công.
  - Không thể cấu hình hết hạn tự động từ phía client cho `localStorage`.

### 2.2. Các giải pháp lưu trữ bảo mật hơn

| Giải pháp | Cơ chế | Khả năng chống XSS | Khả năng chống CSRF | Độ phức tạp triển khai |
|---|---|---|---|---|
| **A. `localStorage`** (Hiện tại) | Lưu cả Access & Refresh Token trong LocalStorage | ❌ Kém (Bị đọc trộm qua XSS) | ✅ Tốt (Không tự gửi theo request) | Rất thấp |
| **B. `HttpOnly Cookie`** (Toàn phần) | Lưu cả Access & Refresh Token trong HttpOnly Cookie | ✅ Tuyệt đối (JS không thể đọc) | ⚠️ Cần cấu hình `SameSite=Lax` & CSRF Token | Trung bình |
| **C. Mô hình Hybrid (In-Memory + HttpOnly Cookie)** *(Chuẩn OWASP / Auth0)* | **Access Token trong Memory/Zustand** (sống ngắn 15p) + **Refresh Token trong HttpOnly Cookie** (sống dài 7-30 ngày) | ✅ Cực cao (JS không sờ được Refresh Token, Access Token mất khi tắt tab) | ✅ Tốt (Access Token gửi qua header Bearer, Refresh Token có SameSite=Lax) | Chuẩn mực cao cấp |
| **D. Mô hình Token Rotation có Hàng đợi (In-Memory / Safe Storage + Rotating Refresh Token)** | Access Token sống ngắn (15-30p); Refresh Token xoay vòng (mỗi lần refresh sinh token mới, vô hiệu hóa token cũ, phát hiện token tái sử dụng) | ✅ Rất cao (Nếu Refresh Token bị lộ và dùng lại, toàn bộ phiên của tài khoản bị thu hồi ngay lập tức) | ✅ Rất tốt | Tối ưu cho SPA |

---

## 3. Khảo Sát Kỹ Thuật Cơ Chế Xử Lý Hết Hạn Phiên (Session Lifecycle)

### 3.1. Kịch bản 1: Access Token hết hạn (Hết 15 - 30 phút)
- **Vấn đề**: Người dùng đang thao tác (ví dụ: quét mã vạch bán hàng ở POS, hoặc tạo hóa đơn nhập hàng). Request gửi lên bị từ chối 401 do token hết hạn.
- **Giải pháp**: **Silent Refresh với Axios Request Queue**:
  1. Khi nhận 401, kiểm tra nếu URL không phải `/auth/login` hoặc `/auth/refresh`.
  2. Sử dụng cờ `isRefreshing` (boolean). Nếu đang có request refresh đang chạy, các request tiếp theo được đẩy vào `failedQueue = []` (chờ đợi Promise).
  3. Gọi `POST /api/auth/refresh`.
  4. Khi thành công: Cập nhật Access Token mới, giải phóng `failedQueue` bằng cách retry tất cả request ban đầu với header Bearer mới.
  5. Người dùng **hoàn toàn không bị gián đoạn**, không bị mất form nhập liệu.

### 3.2. Kịch bản 2: Refresh Token hết hạn hoặc không hợp lệ (Sau 7 - 30 ngày)
- **Vấn đề**: Phiên làm việc dài hạn kết thúc, hoặc tài khoản đã bị đổi mật khẩu / khóa tài khoản ở server.
- **Giải pháp**: **Graceful Session Expiry**:
  1. Request `POST /api/auth/refresh` trả về 401/403 (Invalid or Expired Refresh Token).
  2. Interceptor giải phóng hàng đợi, xóa sạch session trong Storage/Store (`access_token`, `refresh_token`, `auth_user`).
  3. Hiển thị thông báo Toast cảnh báo: *"Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."*
  4. Lưu lại URL hiện tại vào query parameter: `/auth/login?redirect=${encodeURIComponent(currentPath)}`.
  5. Điều hướng người dùng về trang đăng nhập. Sau khi đăng nhập lại, tự động đưa người dùng trở lại đúng màn hình đang làm việc dở.

---

## 4. Phương Án Lựa Chọn & Lý Do
- **Lựa chọn**: **Mô hình Hybrid Token kết hợp Axios Interceptor Queue & Token Rotation**:
  - **Backend**: Cập nhật `AuthService.cs` để lưu `RefreshToken` thật vào bảng `Users`, có hạn sử dụng (`RefreshTokenExpiryTime`) và cơ chế xoay vòng token mới mỗi lần refresh (One-time-use Refresh Token).
  - **Frontend**: Cấu hình `httpClient.ts` bổ sung cơ chế Silent Refresh hàng đợi thông minh, bắt lỗi 401 và tự động phục hồi request; chuyển hướng đăng nhập khi refresh thất bại.
- **Lý do**: Giải quyết triệt để vấn đề gián đoạn người dùng, bảo vệ an toàn tối đa chống tấn công XSS/Replay Token, và tuân thủ chặt chẽ tiêu chuẩn công nghiệp hiện đại.
