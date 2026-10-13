# Proposal: auth-login-integration

## Vấn đề
- Hiện tại giao diện đăng nhập của Frontend (`MT_GRMS_FRONTEND`) đang dựa vào cơ chế fallback giả lập dữ liệu tĩnh (mock demo data) trong `authService.ts` chứ chưa thực sự liên kết với Backend.
- Backend (`MT_GRMS_BACKEND`) đã hoàn thiện endpoint `POST /api/auth/login` cùng cơ sở dữ liệu PostgreSQL (chạy Docker) và bảng `users` chứa tài khoản `admin` / `Admin@123`.
- Giữa Frontend và Backend đang có sự chưa đồng bộ về:
  1. **Route URL**: Backend phục vụ `/api/auth/login`, trong khi `httpClient` của Frontend đang mặc định prefix `/api/v1`.
  2. **Hợp đồng dữ liệu (DTO Contract)**: Backend mong muốn trường `usernameOrEmail`, còn Frontend đang truyền trường `email`.
  3. **Cấu hình mạng & CORS/Proxy**: Frontend chạy tại cổng `http://localhost:5173` cần được cấu hình proxy sang Backend (cổng `5232`) để gọi API mượt mà, không gặp rào cản CORS.

## Mục tiêu
- Đồng bộ hóa hợp đồng API (DTO Contract) giữa `MT_GRMS_BACKEND` và `MT_GRMS_FRONTEND` cho tính năng đăng nhập.
- Thiết lập cấu hình kết nối mạng (Vite Proxy và Base URL) để Frontend gọi trực tiếp tới Backend API.
- Hoàn thiện luồng xác thực End-to-End: Người dùng nhập tài khoản thật (`admin` / `Admin@123`) trên màn hình `LoginPage.tsx` -> gọi API Backend -> xác thực cơ sở dữ liệu -> nhận JWT AccessToken -> lưu vào `localStorage` & `useAuthStore` -> điều hướng thành công vào Dashboard.

## Phạm vi
- **In scope**:
  - Tinh chỉnh `authService.ts` và `authTypes.ts` phía Frontend để gửi đúng định dạng DTO (`usernameOrEmail`, `password`, `tenantCode`).
  - Đảm bảo Backend Controller hỗ trợ linh hoạt cả prefix `/api/auth/login` lẫn `/api/v1/auth/login` và cấu hình CORS đầy đủ.
  - Cấu hình Vite proxy trong `vite.config.ts` để chuyển tiếp các request `/api` sang Backend ASP.NET Core (`http://localhost:5232`).
  - Xử lý phản hồi lỗi (400 / 401) hiển thị thông báo thân thiện trên giao diện `LoginPage.tsx`.
- **Out of scope**:
  - Chưa làm chức năng Quên mật khẩu gửi mã OTP qua Email/SMS thật.
  - Chưa làm luồng Đăng ký tiệm tạp hóa mới (sẽ làm ở change tiếp theo).

## Người dùng liên quan
- **Chủ cửa hàng & Thu ngân**: Đăng nhập bằng tài khoản thật và được cấp quyền truy cập hệ thống chính xác.
- **Frontend & Backend Developers**: Có quy chuẩn giao tiếp API thông suốt giữa 2 dự án con.

## Tiêu chí thành công
- [ ] Màn hình `LoginPage.tsx` gửi HTTP request thành công tới Backend API `POST /api/auth/login` mà không gặp lỗi CORS hay 404.
- [ ] Đăng nhập thành công với tài khoản quản trị viên thật trong database (`admin` / `Admin@123`).
- [ ] Nhận JWT Token, lưu trữ vào `localStorage('access_token')`, cập nhật State `useAuthStore` và điều hướng đúng về `/admin/dashboard`.
- [ ] Hiển thị thông báo lỗi chuẩn xác khi người dùng nhập sai tên đăng nhập hoặc mật khẩu.
