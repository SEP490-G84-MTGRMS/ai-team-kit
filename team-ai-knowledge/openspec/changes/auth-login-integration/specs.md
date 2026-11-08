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
- [ ] Bảng `TenantUsers` được bổ sung `BranchID` và `IsActive`.
- [ ] Bảng `Tenants` được bổ sung thông tin pháp lý, gói thuê bao, hạn ân hạn và trạng thái khóa Soft/Hard Lock.
- [ ] Bổ sung bảng `AuditLogs` đáp ứng yêu cầu lưu vết kiểm toán GB-07.
- [ ] Mô hình Mermaid ERD và mã nguồn C# EF Core trong `Database_Design_Data_Dictionary.md` khớp 100% với từ điển dữ liệu.


<!-- Sáp nhập từ change: postgres-docker-user-table -->
# Specs: postgres-docker-user-table

## ADDED Requirements

### Requirement: REQ-AUTH-DB-01 Triển khai PostgreSQL 16 trên Docker Compose
Hệ thống MUST cung cấp tệp `docker-compose.yml` để khởi chạy máy chủ PostgreSQL 16 Alpine với cấu hình kết nối chuẩn trên cổng 5432.

#### Scenario: Khởi chạy container PostgreSQL thành công
- **GIVEN** máy phát triển đã cài Docker và chưa chạy dịch vụ nào trên cổng 5432.
- **WHEN** thực hiện lệnh `docker compose up -d` tại thư mục backend.
- **THEN** container `mtgrms-postgres` MUST khởi động ở trạng thái healthy, lắng nghe trên cổng 5432 và tạo sẵn database `mtgrms_db`.

#### Scenario: Lưu trữ dữ liệu bền vững qua Named Volume
- **GIVEN** container `mtgrms-postgres` đang chạy và đã có dữ liệu.
- **WHEN** container bị dừng hoặc restart (`docker compose down && docker compose up -d`).
- **THEN** dữ liệu MUST được bảo toàn nguyên vẹn từ volume `postgres_data`.

---

### Requirement: REQ-AUTH-DB-02 Cấu hình Bảng User Tối Giản với String Uid
Hệ thống MUST định nghĩa thực thể `User` và bảng cơ sở dữ liệu `users` chỉ chứa đúng 3 trường: `id` (chuỗi Uid), `username` và `password`.

#### Scenario: Lưu trữ thực thể User với string Uid
- **GIVEN** một tài khoản người dùng mới có `Id = "usr_admin_01"`, `Username = "admin"`, `Password = "Admin@123"`.
- **WHEN** thực thể được lưu vào bảng `users`.
- **THEN** bản ghi MUST được tạo thành công với khóa chính `id` là kiểu chuỗi và không yêu cầu bất kỳ trường bắt buộc nào khác.

#### Scenario: Ràng buộc tính duy nhất của Username
- **GIVEN** bảng `users` đã tồn tại tài khoản có username `"admin"`.
- **WHEN** có một bản ghi khác cố gắng chèn vào bảng với username `"admin"`.
- **THEN** cơ sở dữ liệu MUST từ chối và ném lỗi vi phạm Unique Constraint `ix_users_username`.

---

### Requirement: REQ-AUTH-DB-03 EF Core Initial Migration Cho Bảng Users
Hệ thống MUST tạo một bản Migration đầu tiên chỉ sinh duy nhất bảng `users` và áp dụng thành công vào PostgreSQL.

#### Scenario: Sinh migration độc lập chỉ chứa bảng users
- **GIVEN** cấu hình DbContext của dự án `MT_GRMS_BACKEND`.
- **WHEN** thực hiện lệnh tạo migration `InitialCreate_UserOnly`.
- **THEN** tệp Migration sinh ra MUST chỉ chứa lệnh `migrationBuilder.CreateTable("users", ...)` mà không chứa bất kỳ bảng nào khác.

#### Scenario: Áp dụng migration vào cơ sở dữ liệu và seed tài khoản mẫu
- **GIVEN** container PostgreSQL 16 đang hoạt động.
- **WHEN** thực hiện lệnh `dotnet ef database update`.
- **THEN** bảng `users` MUST xuất hiện trong schema của database `mtgrms_db` và có sẵn 1 tài khoản quản trị viên mẫu để kiểm thử đăng nhập ngay lập tức.

---

## Acceptance Checklist
- [ ] REQ-AUTH-DB-01: Container `mtgrms-postgres` khởi chạy thành công qua `docker compose up -d`.
- [ ] REQ-AUTH-DB-02: Thực thể `User` có `Id` kiểu string Uid, `Username`, `Password`, ràng buộc Unique trên `Username`.
- [ ] REQ-AUTH-DB-03: Migration chỉ sinh đúng bảng `users` và `dotnet ef database update` hoàn tất không lỗi.
- [ ] Đăng nhập thử nghiệm thành công với tài khoản seed `admin`.
- [ ] Toàn bộ UnitTests & IntegrationTests tiếp tục PASS 100%.
