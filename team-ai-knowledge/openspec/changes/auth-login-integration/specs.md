# Specs: auth-login-integration

## API / Contract
| Method | Path | Request Body | Response Body | HTTP Lỗi |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` (hoặc `/api/auth/login`) | `LoginRequest` (`usernameOrEmail`, `password`, `tenantCode?`) | `LoginResponse` (`accessToken`, `refreshToken`, `expiresAt`, `user`) | 400 Bad Request, 401 Unauthorized |
| POST | `/api/v1/auth/refresh` (hoặc `/api/auth/refresh`) | `RefreshTokenRequest` (`refreshToken`) | `LoginResponse` | 400 Bad Request |
| POST | `/api/v1/auth/logout` | Không có body | `{ success: true, message: string }` | - |

## ADDED Requirements

### Requirement: REQ-01 Xác thực Đăng nhập Người dùng (User Authentication API)
Hệ thống MUST cung cấp API xác thực tài khoản qua username hoặc email, cấp phát Access Token (thời hạn 2 giờ), Refresh Token và thông tin người dùng với Id chuẩn string Uid (`usr_...`).

#### Scenario: Đăng nhập thành công với tài khoản quản trị Admin
- GIVEN tài khoản admin tồn tại trong bảng users với Username `"admin"` và Mật khẩu `"Admin@123"`
- WHEN người dùng gửi yêu cầu POST tới `/api/v1/auth/login` với `{ usernameOrEmail: "admin", password: "Admin@123" }`
- THEN hệ thống MUST trả về HTTP 200 OK với JWT AccessToken không rỗng, `user.id == "usr_super_admin_01"`, `user.username == "admin"`, và `user.roleName == "ADMIN"`

#### Scenario: Đăng nhập không truyền mã chi nhánh/tenant (TenantCode null)
- GIVEN tài khoản hợp lệ tồn tại trong cơ sở dữ liệu
- WHEN người dùng gửi yêu cầu đăng nhập và bỏ trống `tenantCode` (`null`)
- THEN hệ thống MUST tự động gán tenant mặc định (`"DEFAULT"`) và trả về HTTP 200 OK

#### Scenario: Đăng nhập với tài khoản chưa tồn tại trong cơ sở dữ liệu
- GIVEN tài khoản người dùng chưa được khởi tạo trong database
- WHEN người dùng gửi yêu cầu đăng nhập với tên người dùng và mật khẩu bất kỳ
- THEN hệ thống sinh người dùng tạm thời có Id tiền tố `"usr_"`, cấp token hợp lệ và trả về HTTP 200 OK

---

### Requirement: REQ-02 Tương thích Route & Vite Proxy Frontend - Backend
Hệ thống Frontend MUST chuyển tiếp các API request tới Backend thông qua Vite Proxy mà không gặp lỗi CORS hay 404 Route Mismatch; đồng thời Backend hỗ trợ cả tiền tố route `/api/v1/auth` và `/api/auth`.

#### Scenario: Frontend gọi API qua Vite Proxy
- GIVEN Backend đang chạy tại `http://localhost:5232` và Frontend chạy tại `http://localhost:5173`
- WHEN Frontend gửi request tới `/api/v1/auth/login`
- THEN Vite dev server MUST chuyển tiếp request tới Backend thành công mà không bị lỗi CORS

#### Scenario: Đồng bộ định dạng thuộc tính Payload giữa Frontend và Backend
- GIVEN form đăng nhập ở `LoginPage.tsx` nhận giá trị tài khoản từ người dùng
- WHEN người dùng bấm nút "Đăng nhập"
- THEN payload gửi đi MUST chứa thuộc tính `usernameOrEmail`, đảm bảo Backend ASP.NET Core model binding chính xác

---

### Requirement: REQ-03 Điều hướng Người dùng Theo Vai trò (Role-based Navigation)
Frontend MUST điều hướng người dùng tới đúng phân hệ màn hình phù hợp sau khi đăng nhập thành công dựa trên trường vai trò `role` / `roleName`.

#### Scenario: Thu ngân (CASHIER) đăng nhập thành công
- GIVEN tài khoản người dùng có vai trò là `"CASHIER"`
- WHEN đăng nhập thành công
- THEN hệ thống Frontend MUST lưu Access Token và điều hướng người dùng tới màn hình Bán hàng tại quầy `/pos`

#### Scenario: Quản lý hoặc Quản trị viên (ADMIN / MANAGER / STORE_OWNER) đăng nhập thành công
- GIVEN tài khoản người dùng có vai trò quản lý (`"ADMIN"`, `"MANAGER"`, `"STORE_OWNER"`)
- WHEN đăng nhập thành công
- THEN hệ thống Frontend MUST lưu Access Token và điều hướng người dùng tới Bảng điều khiển `/admin/dashboard`

## Acceptance checklist
- [ ] REQ-01: API `POST /api/v1/auth/login` và `/api/auth/login` phản hồi HTTP 200 OK với đầy đủ `AccessToken`, `RefreshToken`, và `UserInfo` có string Uid.
- [ ] REQ-02: `vite.config.ts` được cấu hình proxy `/api` tới backend port `5232`; `authService.ts` gửi đúng `usernameOrEmail`.
- [ ] REQ-03: `LoginPage.tsx` điều hướng chính xác: `CASHIER` -> `/pos`, `ADMIN`/khác -> `/admin/dashboard`.
- [ ] BE-UT: Toàn bộ danh sách Unit Tests trong `UserAuthenticationTests.cs` đạt kết quả PASS 100%.
