# Design Brief: Tích hợp Luồng Đăng nhập (Auth Login Integration)

## 1. Luồng Người Dùng & Tương Tác (User & API Flow)
1. **Người dùng nhập thông tin**:
   - Nhập `phoneOrEmail` (Username hoặc Email, ví dụ: `admin` hoặc `admin@mtgrms.vn`).
   - Nhập `password` (Mật khẩu, ví dụ: `Admin@123`).
   - Chọn ghi nhớ đăng nhập (`rememberMe`).
2. **Frontend gửi yêu cầu**:
   - `LoginPage.tsx` gọi `authService.login(...)`.
   - `httpClient` gửi HTTP `POST /api/v1/auth/login` (hoặc `/api/auth/login`) với JSON payload:
     ```json
     {
       "usernameOrEmail": "admin",
       "password": "Admin@123",
       "tenantCode": "TENANT-HCM-01"
     }
     ```
3. **Chuyển tiếp qua Vite Proxy**:
   - Trong môi trường dev, Vite Dev Server (`localhost:5173`) proxy yêu cầu `/api/*` tới Backend Kestrel (`localhost:5232/api/*`).
4. **Backend xử lý**:
   - `AuthController` tiếp nhận `LoginRequest`.
   - `AuthService` truy vấn `IUserRepository.GetByUsernameAsync`.
   - Kiểm tra thông tin, nếu hợp lệ cấp phát JWT Access Token và Refresh Token.
   - Trả về HTTP 200 OK kèm `LoginResponse`.
5. **Frontend lưu trữ & Điều hướng**:
   - Lưu `accessToken` vào `localStorage`.
   - Lưu `user` vào `AuthContext`.
   - Kiểm tra vai trò:
     - Nếu `role === "CASHIER"`: Điều hướng về màn hình Bán hàng tại quầy `/pos`.
     - Nếu vai trò quản trị (`ADMIN`, `MANAGER`, `STORE_OWNER`): Điều hướng về `/admin/dashboard`.

## 2. Giao Diện & Trạng Thái Màn Hình (UI States)
- **Normal State**: Form đăng nhập sạch sẽ, nút bo tròn chuẩn Full Pill (`border-radius: 9999px`), icon khóa và người dùng đơn sắc Monochrome SVG (`stroke: currentColor`), không emoji.
- **Loading State**: Nút đăng nhập hiển thị trạng thái `Đang xử lý...`, disabled tương tác để chống spam click; giao diện tĩnh, không nhấp nháy, không rung lắc.
- **Error State**: Nếu backend trả về HTTP 400 hoặc 401, hiển thị banner cảnh báo màu đỏ (`#FF3B30` trên nền `#FFF0F0`) với thông điệp rõ ràng: `"Tài khoản hoặc mật khẩu không chính xác"`.
- **Success State**: Chuyển trang mượt mà tức thì tới Dashboard / POS.

## 3. Endpoints & DTOs Hợp Nhất

### 3.1. API Endpoints (Backend)
- `POST /api/v1/auth/login` (và tương thích ngược `POST /api/auth/login`): Đăng nhập.
- `POST /api/v1/auth/refresh` (và `POST /api/auth/refresh`): Làm mới token.
- `POST /api/v1/auth/logout`: Đăng xuất (xóa phiên).

### 3.2. Contract Payload
- **Request (`LoginRequest`)**:
  ```json
  {
    "usernameOrEmail": "string",
    "password": "string",
    "tenantCode": "string?"
  }
  ```
- **Response (`LoginResponse`)**:
  ```json
  {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresAt": "2026-10-13T12:00:00Z",
    "user": {
      "id": "string",
      "username": "string",
      "fullName": "string",
      "email": "string",
      "role": "string",
      "roleName": "string",
      "branchId": "string?",
      "tenantId": "string"
    }
  }
  ```

## 4. Quy Tắc Nghiệp Vụ & Phân Quyền
1. **Xác thực linh hoạt**: Chấp nhận cả username nguyên bản (ví dụ `admin`) hoặc định dạng email (`admin@mtgrms.vn`).
2. **Đồng bộ vai trò (Role Mapping)**: Backend trả về cả `role` và `roleName` chuẩn hóa (`ADMIN`, `CASHIER`, `MANAGER`, `STORE_OWNER`) để Frontend điều hướng chính xác.
3. **Cơ chế Token an toàn**: `accessToken` có thời hạn sống 2 giờ; đính kèm header `Authorization: Bearer <token>` cho mọi request API tiếp theo thông qua axios interceptor.
4. **Không phụ thuộc Mock ngầm**: Chỉ chạy fallback mock khi có biến cấu hình `VITE_USE_MOCK_AUTH=true`; mặc định luôn kết nối API Backend thực tế.
