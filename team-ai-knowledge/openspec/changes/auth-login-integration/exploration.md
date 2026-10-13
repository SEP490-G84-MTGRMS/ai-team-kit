# Exploration: Tích hợp Đăng nhập (Auth Login Integration) Giữa Backend và Frontend

## 1. Hiện trạng Code Liên Quan
- **Backend (`MT_GRMS_BACKEND`)**:
  - `AuthController.cs`: Đang map endpoint `api/[controller]/login` (`POST /api/auth/login`).
  - `LoginRequest.cs`: Record gồm `UsernameOrEmail`, `Password`, `TenantCode`.
  - `LoginResponse.cs`: Record gồm `AccessToken`, `RefreshToken`, `ExpiresAt`, `UserInfo User`.
  - `User.cs`: Entity bảng `users` đơn giản trong PostgreSQL gồm `Id` (string Uid `usr_...`), `Username`, `Password`.
  - `Program.cs`: Đã bật CORS cho `http://localhost:5173`.
- **Frontend (`MT_GRMS_FRONTEND`)**:
  - `httpClient.ts`: Đang đặt `baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1'`.
  - `authService.ts`: Đang gọi `httpClient.post('/auth/login', credentials)` với payload `{ email, password }` thay vì `usernameOrEmail`. Đồng thời có khối `catch` âm thầm fallback sang `DEMO_ACCOUNTS`, làm che giấu lỗi thật từ Backend.
  - `authTypes.ts`: Kiểu `UserProfile` mong đợi trường `role`, trong khi Backend `UserInfo` trả về `roleName`.
  - `vite.config.ts`: Chưa cấu hình `server.proxy` để chuyển tiếp `/api` sang backend `http://localhost:5232`.

## 2. Assumptions (Giả định)
- Backend phục vụ môi trường phát triển cục bộ tại `http://localhost:5232` (hoặc `https://localhost:7216`).
- Người dùng có thể đăng nhập bằng Username (ví dụ: `admin`) hoặc Email (ví dụ: `admin@mtgrms.vn`).
- Token trả về là JWT/Bearer token hợp lệ, được lưu vào `localStorage` ở Frontend để đính kèm vào các request sau.

## 3. Non-Goals (Ngoài phạm vi)
- Chưa triển khai đầy đủ OAuth2 Google/Facebook Login trong change này.
- Chưa xử lý MFA (xác thực 2 yếu tố) hoặc SMS OTP lúc đăng nhập.
- Không thay đổi cấu trúc bảng `users` trong database đã hoàn tất ở change trước.

## 4. Các Phương Án Kỹ Thuật (Trade-off Matrix)

### Phương án A: Chuẩn hóa Route và DTO 2 đầu, dùng Vite Proxy trung gian (KHUYẾN NGHỊ)
- **Mô tả**:
  1. Backend `AuthController` hỗ trợ cả 2 route prefix `api/auth/login` và `api/v1/auth/login`. DTO `UserInfo` bổ sung alias `Role` khớp với `roleName`.
  2. Frontend `authService.ts` gửi `{ usernameOrEmail, password, tenantCode }`, map trường `role` an toàn.
  3. `vite.config.ts` thêm `server.proxy` map `/api` -> `http://localhost:5232`.
  4. Loại bỏ silent fallback của `authService.ts` trong chế độ kết nối thật, ném lỗi rõ ràng nếu sai tài khoản.
- **Ưu điểm**:
  - Không lo lỗi CORS khi test trên các môi trường localhost khác nhau.
  - Tính tương thích ngược tuyệt đối (hỗ trợ cả client cũ gọi `/api` và client mới gọi `/api/v1`).
  - Báo lỗi chính xác về UI khi người dùng nhập sai mật khẩu hoặc tài khoản.
- **Nhược điểm**:
  - Cần chỉnh sửa đồng bộ ở cả Backend controller và Frontend service.

### Phương án B: Giữ nguyên Backend, chỉ sửa Frontend gọi trực tiếp URL tuyệt đối
- **Mô tả**: Cấu hình `VITE_API_BASE_URL=http://localhost:5232/api`, sửa payload frontend thành `usernameOrEmail`.
- **Ưu điểm**: Không cần sửa code Backend.
- **Nhược điểm**: Phụ thuộc CORS trực tiếp giữa các port trình duyệt, dễ bị block trên Safari hoặc môi trường dev network; không chuẩn hóa được versioning API (`/api/v1`).

### Phương án C: Dùng Mock Service Worker (MSW) chặn phía Frontend
- **Mô tả**: Dùng MSW giả lập toàn bộ API tại client.
- **Ưu điểm**: Test độc lập không cần backend chạy.
- **Nhược điểm**: Không giải quyết được yêu cầu tích hợp thật giữa 2 dự án.

## 5. Phương Án Lựa Chọn & Lý Do
- **Chọn Phương án A**: Đây là giải pháp tiêu chuẩn công nghiệp và chuẩn RESTful API, đảm bảo Frontend kết nối xuyên suốt tới Backend, chạy qua Vite proxy mượt mà, đồng bộ DTO và kiểm thử end-to-end tin cậy.

## 6. Rủi ro & Cách Giảm Thiểu
- **Rủi ro**: Port Backend thay đổi giữa các máy dev (ví dụ IIS Express 7216 vs Kestrel 5232).
  - **Giảm thiểu**: Dùng biến môi trường `VITE_API_TARGET_URL` trong file cấu hình, mặc định `http://localhost:5232`.
- **Rủi ro**: Lỗi CORS nếu gọi trực tiếp cross-origin.
  - **Giảm thiểu**: Backend đã có policy `AllowFrontend` cho `http://localhost:5173` và `http://localhost:3000`.
