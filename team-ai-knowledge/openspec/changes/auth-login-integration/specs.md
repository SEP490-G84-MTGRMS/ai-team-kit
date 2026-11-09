# Specs: auth-login-integration

## API / Contract
| Method | Path | Request Body | Response Body | HTTP Lỗi |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` (hoặc `/api/auth/login`) | `LoginRequest` (`usernameOrEmail`, `password`, `tenantCode?`) | `LoginResponse` (`accessToken`, `refreshToken`, `expiresAt`, `user`) | 400 Bad Request, 401 Unauthorized |
| POST | `/api/v1/auth/refresh` (hoặc `/api/auth/refresh`) | `RefreshTokenRequest` (`refreshToken`) | `LoginResponse` (`accessToken`, `refreshToken`, `expiresAt`, `user`) | 400 Bad Request, 401 Unauthorized |
| POST | `/api/v1/auth/logout` | `RefreshTokenRequest` (`refreshToken?`) | `{ success: true, message: string }` | 400 Bad Request |

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

---

### Requirement: REQ-AUTH-04 Cơ chế Silent Refresh Ngầm với Axios Request Queue
Hệ thống Frontend MUST triển khai Axios Response Interceptor chặn mã lỗi HTTP `401 Unauthorized` từ các API nghiệp vụ thông thường, tự động gọi API refresh ngầm và xử lý hàng đợi các request đồng thời mà không làm gián đoạn trải nghiệm người dùng.

#### Scenario: Access Token hết hạn khi đang gọi API nghiệp vụ
- GIVEN người dùng đang thao tác tại trang POS hoặc Quản lý chi nhánh với Access Token đã hết hạn
- WHEN một API nghiệp vụ (ví dụ: `GET /api/branches`) gửi lên nhận phản hồi HTTP 401
- THEN Frontend MUST NOT chuyển hướng về trang đăng nhập ngay lập tức; thay vào đó, hệ thống giữ request trong trạng thái chờ (pending Promise) và phát lệnh ngầm `POST /api/auth/refresh` với Refresh Token hiện tại

#### Scenario: Nhiều API đồng thời gặp lỗi 401 (Concurrent 401 Requests)
- GIVEN có 3 request API nghiệp vụ cùng phát sinh và nhận 401 trong cùng một khoảnh khắc
- WHEN request đầu tiên kích hoạt quá trình refresh token (`isRefreshing = true`)
- THEN 2 request sau MUST được đưa vào hàng đợi `failedQueue` mà không gửi thêm request refresh trùng lặp
- WHEN quá trình refresh hoàn tất thành công, toàn bộ các request trong `failedQueue` MUST được tự động thực thi lại (retry) với Access Token mới và trả kết quả chính xác về cho các component

---

### Requirement: REQ-AUTH-05 Điều Hướng Hết Hạn Phiên Làm Việc (Graceful Session Expiry)
Khi Refresh Token hết hạn hoặc không hợp lệ (API `/api/auth/refresh` phản hồi HTTP 401/400), hệ thống Frontend MUST dọn dẹp phiên làm việc an toàn, hiển thị thông báo rõ ràng và điều hướng về trang đăng nhập kèm tham số ghi nhớ trang đích.

#### Scenario: Refresh Token hết hạn hoặc bị thu hồi
- GIVEN phiên làm việc của người dùng đã quá hạn Refresh Token (ví dụ: quá 7 ngày không thao tác)
- WHEN Frontend gọi `POST /api/auth/refresh` và nhận phản hồi HTTP 401 hoặc lỗi từ chối
- THEN Frontend MUST:
  1. Hủy bỏ và từ chối các request đang đợi trong `failedQueue`.
  2. Xóa sạch `access_token`, `refresh_token`, và `auth_user` khỏi Storage và Zustand store.
  3. Hiển thị thông báo Toast cảnh báo: *"Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."*
  4. Ghi nhớ đường dẫn hiện tại và điều hướng về `/auth/login?redirect={encodeURIComponent(currentPath)}`.

#### Scenario: Tự động đưa người dùng trở lại màn hình làm việc sau khi đăng nhập lại
- GIVEN người dùng bị điều hướng về `/auth/login?redirect=%2Fadmin%2Fbranches`
- WHEN người dùng đăng nhập lại thành công
- THEN hệ thống MUST ưu tiên chuyển tiếp người dùng về đúng `/admin/branches` thay vì trang mặc định `/admin/dashboard`.

---

### Requirement: REQ-AUTH-06 Xác Thực & Xoay Vòng Refresh Token Ở Backend (Token Rotation)
Backend `AuthService.cs` MUST quản lý Refresh Token an toàn trong CSDL PostgreSQL bảng `Users`, xác thực tính hợp lệ của token và hạn sử dụng `RefreshTokenExpiryTime`, đồng thời áp dụng cơ chế xoay vòng Refresh Token (Token Rotation) để phòng chống tấn công Replay Attack.

#### Scenario: Refresh Token hợp lệ và còn hạn
- GIVEN người dùng gửi `POST /api/auth/refresh` kèm chuỗi `refreshToken` hợp lệ khớp với giá trị lưu trong CSDL và `RefreshTokenExpiryTime > DateTime.UtcNow`
- WHEN Backend xử lý yêu cầu refresh
- THEN Backend MUST sinh mới cả `AccessToken` và một chuỗi `RefreshToken` mới ngẫu nhiên, lưu `RefreshToken` mới vào DB và cập nhật `RefreshTokenExpiryTime` mới, rồi trả về trong `LoginResponse`.

#### Scenario: Refresh Token không tồn tại hoặc đã hết hạn
- GIVEN `refreshToken` không tìm thấy trong CSDL hoặc thời điểm hiện tại đã vượt quá `RefreshTokenExpiryTime`
- WHEN người dùng gửi yêu cầu refresh
- THEN Backend MUST trả về HTTP 401 Unauthorized kèm thông báo lỗi `"Invalid or expired refresh token"`.

---

## Acceptance checklist
- [ ] REQ-01: API `POST /api/v1/auth/login` và `/api/auth/login` phản hồi HTTP 200 OK với đầy đủ `AccessToken`, `RefreshToken`, và `UserInfo` có string Uid.
- [ ] REQ-02: `vite.config.ts` được cấu hình proxy `/api` tới backend port `5232`; `authService.ts` gửi đúng `usernameOrEmail`.
- [ ] REQ-03: `LoginPage.tsx` điều hướng chính xác: `CASHIER` -> `/pos`, `ADMIN`/khác -> `/admin/dashboard`.
- [ ] REQ-AUTH-04: Axios Interceptor trong `httpClient.ts` tự động phát hiện HTTP 401, xếp hàng các request đồng thời, gọi `/api/auth/refresh` và retry các request thành công không gây reload trang.
- [ ] REQ-AUTH-05: Khi Refresh Token hết hạn hoặc không hợp lệ, hệ thống xóa token, hiển thị Toast cảnh báo và chuyển hướng về `/auth/login?redirect=...`.
- [ ] REQ-AUTH-06: `AuthService.cs` lưu `RefreshToken` và `RefreshTokenExpiryTime` vào CSDL `Users`, xác thực và sinh token mới xoay vòng (Token Rotation) khi gọi refresh.
- [ ] BE-UT: Toàn bộ danh sách Unit Tests trong `UserAuthenticationTests.cs` đạt kết quả PASS 100%.

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: auth-login-feature -->
# Specs: auth-login-feature

## API / Contract

### POST /api/auth/register
**Request:**
```json
{
  "fullName": "Trần Hoàng Long",
  "storeName": "Siêu thị MT Mart Q1",
  "phone": "0912345678",
  "email": "0912345678@mtgrms.vn",
  "password": "Password123#",
  "agreeTerms": true
}
```
**Response 200:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 7200,
  "user": {
    "id": "usr_01",
    "phone": "0912345678",
    "fullName": "Trần Hoàng Long",
    "tenantId": "TNT_Q1",
    "role": "STORE_OWNER"
  }
}
```

## ADDED Requirements

### Requirement: REQ-REG-01 Đăng ký định danh qua Số điện thoại (Phone-First)
Form đăng ký tài khoản mở cửa hàng MT-GRMS MUST NOT bắt buộc người dùng nhập địa chỉ email. Hệ thống MUST sử dụng Số điện thoại làm phương thức liên lạc và định danh chính của chủ cửa hàng.

#### Scenario: Đăng ký thành công không cần Email
- **GIVEN**: Khách hàng mở trang `/auth/register`.
- **WHEN**: Khách hàng nhập Họ tên, Tên cửa hàng, Số điện thoại hợp lệ và Mật khẩu (không có trường Email).
- **THEN**: Hệ thống tạo thành công tài khoản quản trị chuỗi, tự động gán phiên đăng nhập và chuyển hướng vào Dashboard.

### Requirement: REQ-REG-02 Giao diện Zero-Scroll vừa vặn màn hình
Giao diện Auth Shell (`AuthLayout`) và Form Đăng ký (`RegisterPage`) MUST vừa vặn trong 1 màn hình tiêu chuẩn (chiều cao viewport từ 768px trở lên) mà không xuất hiện thanh cuộn dọc.

#### Scenario: Hiển thị trọn vẹn không cuộn chuột
- **GIVEN**: Khách hàng truy cập trang `/auth/register` trên màn hình laptop/desktop thông thường.
- **WHEN**: Trang hoàn tất tải giao diện.
- **THEN**: Toàn bộ Header, Auth Card (tất cả các trường, nút bấm CTA) và Footer bản quyền hiển thị trọn vẹn trong một khung nhìn không bị cuộn.

## Acceptance checklist
- [x] Đã bỏ trường input Email trên giao diện RegisterPage.
- [x] Đã cập nhật validate form chỉ kiểm tra Số điện thoại.
- [x] Chiều cao toàn trang hiển thị gọn gàng trong 1 khung nhìn không bị cuộn.
- [x] Build và kiểm thử giao diện đạt tiêu chuẩn.


<!-- Sáp nhập từ change: user-table-database-attributes -->
# Specs: user-table-database-attributes

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` | `{ emailOrPhone, password, rememberMe }` | `{ accessToken, refreshToken, user }` | 400 (Validation), 401 (Sai thông tin), 403 (Tài khoản/Tenant bị khóa) |
| POST | `/api/v1/auth/refresh-token` | `{ refreshToken }` | `{ accessToken, refreshToken }` | 401 (Token hết hạn/không hợp lệ) |
| POST | `/api/v1/auth/forgot-password` | `{ email }` | `{ message, success: true }` | 404 (Email không tồn tại) |
| POST | `/api/v1/auth/verify-otp` | `{ email, otpCode }` | `{ resetToken, success: true }` | 400 (OTP không đúng/hết hạn) |
| POST | `/api/v1/auth/reset-password` | `{ email, resetToken, newPassword }` | `{ message, success: true }` | 400 (Mật khẩu không đạt độ mạnh) |
| POST | `/api/v1/admin/tenants/{id}/apply-lock` | `{ lockType, reason, revokeSessions }` | `{ message, status: 'locked' }` | 400 (Lý do trống), 404 (Không tìm thấy) |

---

## ADDED Requirements

### Requirement: REQ-01 Chuẩn hóa các trường an ninh và kiểm toán bảng Users
Hệ thống MUST lưu trữ đầy đủ các thông tin kiểm toán đăng nhập, cờ mật khẩu tạm thời, cơ chế thu hồi phiên JWT tức thì, mã OTP đặt lại mật khẩu và Refresh Token trong bảng `Users`.

#### Scenario: Cấp tài khoản mới với mật khẩu tạm thời
- **GIVEN** Super Admin thực hiện cấp phát Tenant mới từ giao diện `create_tenant.html`
- **WHEN** Hệ thống tạo bản ghi người dùng cho Store Owner
- **THEN** Cột `MustChangePassword` MUST được đặt là `true`, `IsEmailVerified` MUST được đặt là `false`, và `PasswordHash` lưu mật khẩu tạm được mã hóa an toàn.

#### Scenario: Đăng nhập lần đầu với mật khẩu tạm thời
- **GIVEN** Store Owner đăng nhập thành công với mật khẩu tạm thời
- **WHEN** Hệ thống kiểm tra thấy `MustChangePassword == true`
- **THEN** Hệ thống MUST chuyển hướng người dùng đến giao diện đổi mật khẩu bắt buộc và từ chối cấp quyền truy cập các tính năng quản lý cửa hàng cho đến khi mật khẩu mới được cập nhật.

#### Scenario: Xử lý gõ sai mật khẩu liên tiếp (Chống Brute Force)
- **GIVEN** Người dùng gõ sai mật khẩu trên giao diện `LoginPage.tsx`
- **WHEN** Số lần sai liên tiếp đạt ngưỡng 5 lần (`AccessFailedCount >= 5`)
- **THEN** Hệ thống MUST đặt `LockoutEnd` bằng thời điểm hiện tại cộng thêm 15 phút, đồng thời trả về thông báo tài khoản bị tạm khóa.

---

### Requirement: REQ-02 Phân quyền theo Chi nhánh trên TenantUsers
Hệ thống MUST hỗ trợ gán nhân viên vào một chi nhánh cụ thể thông qua khóa ngoại `BranchID` trong bảng `TenantUsers`, cho phép áp dụng phạm vi dữ liệu chi nhánh (Branch Scope) cho Store Manager và Cashier.

#### Scenario: Gán tài khoản Thu ngân vào Chi nhánh 1
- **GIVEN** Store Owner tạo tài khoản nhân viên thu ngân mới
- **WHEN** Gán quyền vào Tenant với `Role = 'CASHIER'` và chọn chi nhánh `CN-01`
- **THEN** Bản ghi `TenantUsers` MUST lưu `BranchID` của `CN-01`, và khi thu ngân đăng nhập, hệ thống chỉ cấp quyền truy cập dữ liệu đơn hàng và tồn kho của `CN-01`.

---

### Requirement: REQ-03 Quản lý Thông tin Pháp lý, Thuê bao và Khóa trên Tenants
Hệ thống MUST lưu trữ đầy đủ thông tin pháp lý doanh nghiệp (`TaxCode`, `Hotline`, `Address`, `City`), tên miền phụ chuẩn RFC-1123 (`Subdomain`), thời hạn hợp đồng, thời hạn ân hạn (`GracePeriodExpiresAt`) và hình thức khóa (`LockType`, `LockReason`, `LockedAt`, `LockedBy`) trong bảng `Tenants`.

#### Scenario: Áp dụng Lệnh Hard-Lock và vô hiệu hóa JWT Token tức thì (POST-2 & GB-13)
- **GIVEN** Super Admin thực hiện Hard-Lock một Tenant vi phạm hoặc hết hạn thanh toán
- **WHEN** Lệnh khóa được lưu với `LockType = 'Hard'`
- **THEN** Hệ thống MUST cập nhật `SecurityStamp = NEWID()` cho toàn bộ tài khoản `Users` thuộc Tenant đó, khiến tất cả các phiên đăng nhập JWT hiện tại của họ bị vô hiệu hóa ngay lập tức.

---

### Requirement: REQ-04 Ghi vết Nhật ký Kiểm toán Toàn hệ thống (AuditLogs)
Hệ thống MUST tự động ghi lại lịch sử mọi thao tác quản trị can thiệp vào Tenant, Gói cước, và các lệnh Khóa/Mở khóa vào bảng `AuditLogs` kèm snapshot dữ liệu Trước/Sau (`OldValuesJson`, `NewValuesJson`), IP và thiết bị.

#### Scenario: Ghi vết khi Super Admin gia hạn thời gian ân hạn
- **GIVEN** Super Admin thực hiện gia hạn thêm 7 ngày ân hạn cho Tenant `taphoa-thanhdat`
- **WHEN** Hộp thoại `ExtendGraceModal` gửi yêu cầu thành công
- **THEN** Hệ thống MUST ghi 1 bản ghi vào `AuditLogs` với `ActionType = 'ExtendGrace'`, lưu vết số ngày cộng thêm và lý do gia hạn của Admin.

---

## MODIFIED Requirements

### Requirement: Cập nhật Từ điển Dữ liệu Data Dictionary
Tài liệu `Database_Design_Data_Dictionary.md` MUST được cập nhật đồng bộ tại:
1. **Sơ đồ ERD Mermaid**: Cập nhật định nghĩa các trường cho `Tenants`, `Users`, `TenantUsers`, và bổ sung thực thể `AuditLogs`.
2. **Mục Từ điển Dữ liệu (Phân hệ 1)**: Cập nhật chi tiết bảng biểu cho `Tenants` (17 cột), `Users` (20 cột), `TenantUsers` (6 cột), và thêm bảng `AuditLogs` (13 cột).
3. **Mã nguồn C# EF Core (Mục 5.3)**: Cập nhật đầy đủ các thuộc tính và Data Annotations trong lớp thực thể C# `User`, `Tenant`, `TenantUser`, và `AuditLog`.

---

## Acceptance checklist
- [ ] Bảng `Users` trong Data Dictionary chứa đủ 20 cột, có đầy đủ kiểu dữ liệu, ràng buộc UK và mô tả nghiệp vụ.
