# Specs: auth-login-integration

## API / Contract
| Method | Path | Request Body | Response Body | Set-Cookie Header | HTTP Lỗi |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/login` (hoặc `/api/auth/login`) | `LoginRequest` (`usernameOrEmail`, `password`, `tenantCode?`) | `ApiResponse<UserInfo>` (`id`, `fullName`, `roleName`, `storeName`, `tenantId`) | `access_token` (HttpOnly, SameSite=Lax), `refresh_token` (HttpOnly, SameSite=Lax, Path=/api/auth) | 400 Bad Request, 401 Unauthorized |
| POST | `/api/v1/auth/refresh` (hoặc `/api/auth/refresh`) | Không có body (Đọc từ Cookie) | `ApiResponse<UserInfo>` | Cặp cookie `access_token` và `refresh_token` mới | 401 Unauthorized |
| GET | `/api/v1/auth/me` (hoặc `/api/auth/me`) | Không có body | `ApiResponse<UserInfo>` | - | 401 Unauthorized |
| POST | `/api/v1/auth/logout` | Không có body | `ApiResponse<{ success: true, message: string }>` | Xóa cookies (`Max-Age=0`) | 400 Bad Request |

## ADDED Requirements

### Requirement: REQ-01 Xác thực Đăng nhập & Cấp phát HttpOnly Cookies
Hệ thống Backend MUST cung cấp API xác thực tài khoản qua username/email và mật khẩu, cấp phát Access Token (thời hạn 15–60 phút) và Refresh Token (thời hạn 7–30 ngày) **dưới dạng HttpOnly Cookies**, tuyệt đối không trả chuỗi token nhạy cảm trong response body.

#### Scenario: Đăng nhập thành công với tài khoản quản trị Admin
- GIVEN tài khoản admin tồn tại trong bảng users với Username `"admin"` và Mật khẩu `"Admin@123"`
- WHEN người dùng gửi yêu cầu POST tới `/api/v1/auth/login` với `{ usernameOrEmail: "admin", password: "Admin@123" }`
- THEN hệ thống MUST:
  1. Trả về HTTP 200 OK kèm payload `UserInfo` (`id == "usr_super_admin_01"`, `roleName == "ADMIN"`).
  2. Đính kèm header `Set-Cookie` cho `access_token` với các thuộc tính `HttpOnly`, `SameSite=Lax`, `Path=/`.
  3. Đính kèm header `Set-Cookie` cho `refresh_token` với các thuộc tính `HttpOnly`, `SameSite=Lax`, `Path=/api/auth`.
  4. Response body MUST NOT chứa bất kỳ trường token nào (`accessToken`, `refreshToken`).

#### Scenario: Đăng nhập không truyền mã chi nhánh/tenant (TenantCode null)
- GIVEN tài khoản hợp lệ tồn tại trong cơ sở dữ liệu
- WHEN người dùng gửi yêu cầu đăng nhập và bỏ trống `tenantCode` (`null`)
- THEN hệ thống MUST tự động gán tenant mặc định (`"DEFAULT"`), cấp HttpOnly cookies và trả về HTTP 200 OK.

---

### Requirement: REQ-02 Tương thích Route, Vite Proxy & Cấu hình CORS Credentials
Hệ thống Frontend MUST cấu hình Axios `httpClient` với `withCredentials: true` để tự động trao đổi Cookie với Backend qua Vite Proxy; đồng thời Backend ASP.NET Core MUST cấu hình CORS policy cho phép `AllowCredentials()` với nguồn gốc xác định (`http://localhost:5173`).

#### Scenario: Frontend gọi API qua Vite Proxy kèm HttpOnly Cookie
- GIVEN Backend đang chạy tại `http://localhost:5232` và Frontend chạy tại `http://localhost:5173`
- WHEN Frontend gửi request tới `/api/v1/auth/login` hoặc các endpoint nghiệp vụ
- THEN trình duyệt MUST tự động đính kèm cookie hợp lệ mà mã nguồn JavaScript không cần can thiệp hay đọc token từ bộ nhớ.

---

### Requirement: REQ-03 Điều hướng Người dùng Theo Vai trò (Role-based Navigation)
Frontend MUST điều hướng người dùng tới đúng phân hệ màn hình phù hợp sau khi đăng nhập thành công dựa trên trường vai trò `role` / `roleName` trong `UserInfo`.

#### Scenario: Thu ngân (CASHIER) đăng nhập thành công
- GIVEN tài khoản người dùng có vai trò là `"CASHIER"`
- WHEN đăng nhập thành công
- THEN hệ thống Frontend MUST lưu thông tin `user` vào Zustand store (không lưu token vào `localStorage`) và điều hướng người dùng tới màn hình Bán hàng tại quầy `/pos`.

#### Scenario: Quản lý hoặc Quản trị viên (ADMIN / MANAGER / STORE_OWNER) đăng nhập thành công
- GIVEN tài khoản người dùng có vai trò quản lý (`"ADMIN"`, `"MANAGER"`, `"STORE_OWNER"`)
- WHEN đăng nhập thành công
- THEN hệ thống Frontend MUST lưu thông tin `user` vào Zustand store (không lưu token vào `localStorage`) và điều hướng người dùng tới Bảng điều khiển `/admin/dashboard`.

---

### Requirement: REQ-AUTH-04 Loại Bỏ Hoàn Toàn `localStorage` Khỏi Cơ Chế Xác Thực
Mã nguồn Frontend MUST loại bỏ 100% việc lưu trữ, đọc hoặc ghi Access Token và Refresh Token trong `localStorage` hoặc `sessionStorage`. Toàn bộ việc xác thực danh tính phụ thuộc hoàn toàn vào HttpOnly Cookies do trình duyệt quản lý.

#### Scenario: Khởi tạo phiên làm việc khi tải lại trang (F5 / Mở tab mới)
- GIVEN người dùng đã đăng nhập và đang mở tab trình duyệt
- WHEN người dùng nhấn F5 hoặc mở tab mới trong cùng trình duyệt
- THEN Frontend MUST gọi `GET /api/auth/me` với `withCredentials: true` để lấy thông tin `UserInfo` từ cookie hiện hữu; nếu hợp lệ thì duy trì phiên làm việc; nếu nhận HTTP 401 thì tự động kích hoạt Silent Refresh hoặc chuyển về trang đăng nhập.

---

### Requirement: REQ-AUTH-05 Cơ Chế Silent Refresh Bằng HttpOnly Cookie & Axios Request Queue
Hệ thống Frontend MUST triển khai Axios Response Interceptor chặn mã lỗi HTTP `401 Unauthorized` từ các API nghiệp vụ, tự động gọi `POST /api/auth/refresh` (trình duyệt tự đính kèm cookie `refresh_token`) và xử lý hàng đợi các request đồng thời mà không làm gián đoạn trải nghiệm người dùng.

#### Scenario: Access Token Cookie hết hạn khi đang gọi API nghiệp vụ
- GIVEN người dùng đang thao tác tại trang POS hoặc Quản lý chi nhánh với Access Token cookie đã hết hạn
- WHEN một API nghiệp vụ (ví dụ: `GET /api/branches`) gửi lên nhận phản hồi HTTP 401
- THEN Frontend MUST giữ request trong trạng thái chờ (pending Promise) và phát lệnh ngầm `POST /api/auth/refresh` với `withCredentials: true`.

#### Scenario: Nhiều API đồng thời gặp lỗi 401 (Concurrent 401 Requests)
- GIVEN có nhiều request API nghiệp vụ cùng phát sinh và nhận 401 trong cùng một khoảnh khắc
- WHEN request đầu tiên kích hoạt quá trình refresh (`isRefreshing = true`)
- THEN các request sau MUST được đưa vào hàng đợi `failedQueue` mà không gửi thêm request refresh trùng lặp
- WHEN quá trình refresh hoàn tất thành công (Backend đã ghi đè cookies mới), toàn bộ các request trong `failedQueue` MUST được tự động thực thi lại (retry) và trả kết quả chính xác về cho các component.

---

### Requirement: REQ-AUTH-06 Điều Hướng Hết Hạn Phiên & Đăng Xuất An Toàn
Khi Refresh Token hết hạn hoặc không hợp lệ (API `/api/auth/refresh` phản hồi HTTP 401), hệ thống Backend MUST xóa bỏ các cookies, và Frontend MUST dọn dẹp state, hiển thị thông báo rõ ràng và điều hướng về trang đăng nhập kèm tham số ghi nhớ trang đích.

#### Scenario: Refresh Token hết hạn hoặc bị thu hồi
- GIVEN phiên làm việc của người dùng đã quá hạn Refresh Token
- WHEN Frontend gọi `POST /api/auth/refresh` và nhận phản hồi HTTP 401
- THEN:
  1. Backend MUST gửi header `Set-Cookie` xóa bỏ các cookies (`Max-Age=0`).
  2. Frontend MUST hủy bỏ các request đang đợi trong `failedQueue`.
  3. Frontend xóa sạch thông tin `user` trong Zustand store.
  4. Frontend hiển thị thông báo Toast cảnh báo: *"Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."*
  5. Frontend điều hướng về `/auth/login?redirect={encodeURIComponent(currentPath)}`.

#### Scenario: Người dùng chủ động đăng xuất
- GIVEN người dùng nhấn nút "Đăng xuất"
- WHEN Frontend gọi `POST /api/auth/logout`
- THEN Backend xóa cookies và đặt `User.RefreshToken = null` trong CSDL, Frontend dọn dẹp state và chuyển hướng về `/auth/login`.

---

### Requirement: REQ-AUTH-07 Xác Thực & Xoay Vòng Refresh Token Ở Backend (Token Rotation)
Backend `AuthService.cs` MUST quản lý Refresh Token an toàn trong CSDL PostgreSQL bảng `Users`, xác thực tính hợp lệ của token và hạn sử dụng `RefreshTokenExpiryTime`, đồng thời áp dụng cơ chế xoay vòng Refresh Token (Token Rotation) để phòng chống tấn công Replay Attack.

#### Scenario: Refresh Token hợp lệ và còn hạn
- GIVEN người dùng gửi `POST /api/auth/refresh` kèm cookie `refresh_token` hợp lệ khớp với giá trị lưu trong CSDL và `RefreshTokenExpiryTime > DateTime.UtcNow`
- WHEN Backend xử lý yêu cầu refresh
- THEN Backend MUST sinh mới cả Access Token và chuỗi Refresh Token ngẫu nhiên mới, lưu Refresh Token mới vào DB và cập nhật `RefreshTokenExpiryTime` mới, ghi đè lại 2 HttpOnly Cookies mới và trả về HTTP 200 OK.

---

## Acceptance checklist
- [ ] REQ-01: API `POST /api/v1/auth/login` trả về HTTP 200 OK với `Set-Cookie` HttpOnly cho `access_token` và `refresh_token`, response body chỉ chứa `UserInfo` và không chứa chuỗi token.
- [ ] REQ-02: `vite.config.ts` proxy `/api` tới backend port `5232`; Backend CORS policy cấu hình `AllowCredentials()`.
- [ ] REQ-03: `LoginPage.tsx` điều hướng chính xác: `CASHIER` -> `/pos`, `ADMIN`/khác -> `/admin/dashboard`.
- [ ] REQ-AUTH-04: Loại bỏ 100% token khỏi `localStorage`; bổ sung `GET /api/auth/me` để kiểm tra phiên khi F5 hoặc mở tab mới.
- [ ] REQ-AUTH-05: Axios Interceptor trong `httpClient.ts` tự động chặn HTTP 401, xếp hàng các request đồng thời, gọi `/api/auth/refresh` với `withCredentials: true` và retry các request thành công không gây reload trang.
- [ ] REQ-AUTH-06: Khi Refresh Token hết hạn hoặc khi logout, cookies được xóa (`Max-Age=0`), hệ thống hiển thị Toast cảnh báo và chuyển hướng về `/auth/login?redirect=...`.
- [ ] REQ-AUTH-07: `AuthService.cs` lưu `RefreshToken` và `RefreshTokenExpiryTime` vào CSDL `Users`, xác thực và sinh token mới xoay vòng (Token Rotation) khi gọi refresh.
- [ ] BE-UT: Toàn bộ danh sách Unit Tests trong `UserAuthenticationTests.cs` đạt kết quả PASS 100%.
