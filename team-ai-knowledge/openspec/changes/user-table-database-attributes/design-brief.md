# Design Brief: user-table-database-attributes

## 1. Luồng Nghiệp Vụ & Tương Tác Hệ Thống (Workflow & Interactivity)

### Luồng 1: Cấp phát Tenant mới & Khởi tạo Mật khẩu tạm (UC 20.1 & GB-09)
1. **Super Admin** nhập form tại `create_tenant.html`: Tên công ty, Subdomain, MST, Hotline, Họ tên chủ sở hữu, Email đăng nhập, Gói cước ban đầu.
2. Hệ thống:
   - Tạo bản ghi `Tenants` với trạng thái `Active` hoặc `Pending`.
   - Tạo bản ghi `Users` với Email làm Username, sinh chuỗi mật khẩu tạm ngẫu nhiên (băm vào `PasswordHash`), đặt cờ `MustChangePassword = true`, `IsEmailVerified = false`.
   - Tạo bản ghi `TenantUsers` liên kết `(TenantID, UserID)` với `Role = 'OWNER'`.
   - Gửi email kích hoạt chứa thông tin đăng nhập và mật khẩu tạm.
3. **Chủ sở hữu (Store Owner)**:
   - Đăng nhập lần đầu tại `LoginPage.tsx`.
   - Hệ thống phát hiện `MustChangePassword == true`, lập tức chuyển hướng sang màn hình bắt buộc đổi mật khẩu mới.
   - Sau khi đổi mật khẩu thành công: Cập nhật `PasswordHash`, đặt `MustChangePassword = false`, `IsEmailVerified = true`.

### Luồng 2: Xác thực Đăng nhập & Duy trì Phiên làm việc (Auth Dual-Token Flow)
1. Người dùng nhập `Phone` hoặc `Email` cùng `Password` trên `LoginPage.tsx`.
2. Hệ thống tra cứu theo `Email` hoặc `Phone`:
   - Nếu tài khoản đang bị khóa tạm thời (`LockoutEnd > Now`), chặn đăng nhập (chống Brute Force).
   - Kiểm tra mật khẩu băm. Nếu sai $\rightarrow$ Tăng `AccessFailedCount`. Nếu đạt ngưỡng 5 lần $\rightarrow$ Đặt `LockoutEnd = Now + 15 phút`.
   - Nếu đúng $\rightarrow$ Reset `AccessFailedCount = 0`, ghi nhận `LastLoginAt = Now`, `LastLoginIp = Request.IP`.
3. Kiểm tra trạng thái Tenant liên kết:
   - Nếu Tenant bị `Hard-Lock` $\rightarrow$ Chặn đăng nhập với thông báo lý do (`LockReason`).
   - Nếu Tenant bị `Soft-Lock` $\rightarrow$ Cho phép đăng nhập nhưng gắn Claim `ReadOnly = true`.
4. Sinh cặp Token:
   - `AccessToken` (JWT 30 phút, chứa `UserId`, `TenantId`, `BranchId`, `Role`, `SecurityStamp`).
   - `RefreshToken` (lưu vào cột `RefreshToken` và `RefreshTokenExpiryTime` trong bảng `Users`).

### Luồng 3: Áp dụng Lệnh Khóa & Thu hồi Phiên tức thì (UC 21.6 & GB-13)
1. Super Admin áp dụng lệnh **Hard-Lock** trên màn hình `LockControl.tsx`.
2. Hệ thống:
   - Cập nhật `Tenants`: `LockType = 'Hard'`, `LockReason`, `LockedAt`, `LockedBy`.
   - Đổi giá trị `SecurityStamp = NEWID()` của toàn bộ tài khoản `Users` thuộc Tenant đó.
   - Khi các request tiếp theo mang JWT cũ gửi lên, Middleware kiểm tra `SecurityStamp` không khớp sẽ từ chối ngay lập tức (Status 401 Unauthorized), buộc người dùng phải đăng xuất.

### Luồng 4: Khôi phục Mật khẩu qua OTP (ForgotPassword Flow)
1. Người dùng nhập Email tại `ForgotPasswordPage.tsx`.
2. Hệ thống sinh mã OTP ngẫu nhiên 6 chữ số, lưu vào `PasswordResetOtp`, đặt hạn chót `OtpExpiry = Now + 10 phút`, và gửi mã về email.
3. Người dùng nhập mã OTP. Hệ thống kiểm tra khớp và chưa hết hạn.
4. Người dùng nhập mật khẩu mới: Hệ thống cập nhật `PasswordHash`, xóa trắng `PasswordResetOtp` và `OtpExpiry`.

---

## 2. Đặc Tả Thay Đổi Chi Tiết Cơ Sở Dữ Liệu (Database Schema Changes)

### 2.1 Bảng `Users` (Nâng cấp & Chuẩn hóa 20 cột)
| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
|---|---|:---:|---|---|
| `UserID` | `UUID` | ❌ | **PK**, `NEWID()` | Mã định danh duy nhất toàn hệ thống |
| `UserName` | `VARCHAR(50)` | ❌ | **UK**, `UNIQUE` | Tên đăng nhập |
| `PasswordHash` | `VARCHAR(255)` | ❌ | BCrypt / Argon2 | Mật khẩu mã hóa |
| `FullName` | `NVARCHAR(100)`| ❌ | | Họ và tên người dùng |
| `Email` | `VARCHAR(100)` | ❌ | **UK**, `UNIQUE` | Email tiếp nhận thông báo và mật khẩu |
| `Phone` | `VARCHAR(20)` | ❌ | **UK**, `UNIQUE` | Số điện thoại dùng để đăng nhập hoặc liên hệ |
| **`AvatarUrl`** | `NVARCHAR(500)`| ✔️ | `NULL` | Đường dẫn ảnh đại diện |
| `IsActive` | `BIT` | ❌ | `1` (TRUE) | Trạng thái tài khoản hoạt động |
| **`IsEmailVerified`** | `BIT` | ❌ | `0` (FALSE) | Trạng thái xác thực email (`tenant_detail.html`) |
| **`MustChangePassword`**| `BIT`| ❌ | `0` (FALSE) | Bắt buộc đổi MK khi dùng mật khẩu tạm (`create_tenant.html`) |
| **`LastLoginAt`** | `DATETIME2` | ✔️ | `NULL` | Lần đăng nhập gần nhất (`tenant_detail.html`) |
| **`LastLoginIp`** | `VARCHAR(50)` | ✔️ | `NULL` | Địa chỉ IP đăng nhập cuối (`tenant_detail.html`) |
| **`SecurityStamp`** | `VARCHAR(100)`| ✔️ | `NEWID()` | Token version hủy phiên đăng nhập tức thì (GB-13) |
| **`PasswordResetOtp`**| `VARCHAR(10)` | ✔️ | `NULL` | Mã OTP đặt lại mật khẩu (`ForgotPasswordPage.tsx`) |
| **`OtpExpiry`** | `DATETIME2` | ✔️ | `NULL` | Thời hạn hiệu lực của mã OTP |
| **`RefreshToken`** | `VARCHAR(500)`| ✔️ | `NULL` | Token làm mới phiên đăng nhập (`LoginPage.tsx`) |
| **`RefreshTokenExpiryTime`**| `DATETIME2`| ✔️ | `NULL` | Thời hạn hết hạn của Refresh Token |
| **`AccessFailedCount`**| `INT` | ❌ | `0` | Đếm số lần đăng nhập thất bại (chống brute-force) |
| **`LockoutEnd`** | `DATETIME2` | ✔️ | `NULL` | Thời gian mở khóa sau khi bị khóa tạm thời |
| `CreatedAt` | `DATETIME2` | ❌ | `GETUTCDATE()` | Ngày giờ khởi tạo tài khoản |

### 2.2 Bảng `TenantUsers` (Nâng cấp thêm 2 cột)
| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng buộc | Ý nghĩa nghiệp vụ |
|---|---|:---:|---|---|
| `TenantID` | `UUID` | ❌ | **PK, FK** $\rightarrow$ `Tenants` | Thuộc Tenant nào |
| `UserID` | `UUID` | ❌ | **PK, FK** $\rightarrow$ `Users` | Thuộc User nào |
| `Role` | `VARCHAR(50)` | ❌ | `OWNER`, `STORE_MANAGER`, `CASHIER`, `STAFF` | Vai trò trong tổ chức |
| **`BranchID`** | `UUID` | ✔️ | **FK** $\rightarrow$ `Branches` | Phân công phụ trách chi nhánh cụ thể (Branch Scope) |
| **`IsActive`** | `BIT` | ❌ | `1` (TRUE) | Hiệu lực quyền trong Tenant này |
| `AssignedAt` | `DATETIME2` | ❌ | `GETUTCDATE()` | Thời điểm gán quyền |

### 2.3 Bảng `Tenants` (Nâng cấp thêm 11 cột phục vụ Master Admin)
| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
|---|---|:---:|---|---|
| `TenantID` | `UUID` | ❌ | **PK**, `NEWID()` | Định danh Tenant |
| `Name` | `NVARCHAR(150)`| ❌ | | Tên chuỗi / thương hiệu |
| **`Subdomain`** | `VARCHAR(63)` | ❌ | **UK**, RFC-1123, `UNIQUE` | Tên miền con truy cập riêng biệt (`taphoa-thanhdat`) |
| `Code` | `VARCHAR(30)` | ❌ | **UK**, `UNIQUE` | Mã quản lý hệ thống |
| **`TaxCode`** | `VARCHAR(20)` | ✔️ | 1 MST / Tenant (GB-08) | Mã số thuế doanh nghiệp / hộ kinh doanh |
| **`Hotline`** | `VARCHAR(20)` | ✔️ | | Số hotline liên hệ chính |
| **`Address`** | `NVARCHAR(255)`| ✔️ | | Địa chỉ trụ sở chính |
| **`City`** | `NVARCHAR(100)`| ✔️ | | Tỉnh / Thành phố hoạt động |
| `Status` | `VARCHAR(30)` | ❌ | `Active`, `Suspended`, `Pending` | Trạng thái chung |
| **`CurrentPlan`** | `VARCHAR(30)` | ❌ | `Basic`, `Advanced`, `Enterprise` | Gói dịch vụ SaaS đang sử dụng |
| **`SubscriptionExpiresAt`**| `DATETIME2`| ✔️| | Ngày hết hạn hợp đồng thuê bao |
| **`GracePeriodExpiresAt`** | `DATETIME2`| ✔️| | Hạn chót ân hạn (+5 đến +7 ngày theo GB-13) |
| **`LockType`** | `VARCHAR(20)` | ❌ | `None`, `Soft`, `Hard` | Hình thức khóa: Không khóa / Khóa mềm / Khóa cứng |
| **`LockReason`** | `NVARCHAR(500)`| ✔️| | Lý do áp dụng lệnh khóa |
| **`LockedAt`** | `DATETIME2` | ✔️ | `NULL` | Thời điểm kích hoạt lệnh khóa |
| **`LockedBy`** | `VARCHAR(100)`| ✔️ | `NULL` | Người thực hiện khóa (Admin hoặc JOB-03) |
| `CreatedAt` | `DATETIME2` | ❌ | `GETUTCDATE()` | Thời điểm tạo Tenant |

### 2.4 Bảng Bổ Sung: `AuditLogs` (Nhật ký kiểm toán hệ thống - GB-07)
| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng buộc | Ý nghĩa nghiệp vụ |
|---|---|:---:|---|---|
| `LogID` | `UUID` | ❌ | **PK**, `NEWID()` | Định danh bản ghi log |
| `TenantID` | `UUID` | ✔️ | FK $\rightarrow$ `Tenants` | Thuộc Tenant (hoặc NULL nếu là thao tác Platform) |
| `ActorID` | `UUID` | ✔️ | FK $\rightarrow$ `Users` | Người thực hiện thao tác |
| `ActorName` | `NVARCHAR(100)`| ❌ | | Tên người thực hiện |
| `ActorRole` | `VARCHAR(50)` | ❌ | | Vai trò: SuperAdmin, StoreOwner, StoreManager, SystemJob |
| `ActionType` | `VARCHAR(50)` | ❌ | | ApplyLock, RemoveLock, ExtendGrace, CreateTenant, UpdatePlan,... |
| `TargetEntity`| `VARCHAR(50)` | ❌ | | Tenants, Plans, Orders, Employees,... |
| `TargetID` | `VARCHAR(100)`| ✔️ | | ID của đối tượng bị tác động |
| `OldValuesJson`| `NVARCHAR(MAX)`| ✔️| | Dữ liệu snapshot trước thay đổi |
| `NewValuesJson`| `NVARCHAR(MAX)`| ✔️| | Dữ liệu snapshot sau thay đổi |
| `IpAddress` | `VARCHAR(50)` | ✔️ | | Địa chỉ IP thực hiện |
| `UserAgent` | `VARCHAR(255)`| ✔️ | | Trình duyệt / Thiết bị |
| `CreatedAt` | `DATETIME2` | ❌ | `GETUTCDATE()` | Thời điểm phát sinh hành động |

---

## 3. Quy Tắc Nghiệp Vụ & An Ninh (Security & Business Rules)
1. **GB-08 (Chính sách 1 MST / Tenant)**: Mỗi Tenant có tối đa 1 Mã số thuế hợp lệ (10 hoặc 13 số).
2. **GB-09 (Định danh bất biến & Email duy nhất)**: Subdomain chuẩn RFC-1123 bất biến sau khi khởi tạo; Email của chủ sở hữu là duy nhất trên toàn bộ hệ thống SaaS.
3. **GB-13 (Luồng Ân Hạn & Tự Động Soft-Lock)**: Khi hết hạn gói cước, Tenant chuyển sang trạng thái ân hạn (`GracePeriodExpiresAt = SubscriptionExpiresAt + 5 ngày`). Sau khi hết ân hạn mà chưa thanh toán, Background Job `JOB-03` tự động chuyển `LockType = 'Soft'`.
4. **POST-2 (Thu hồi Token Tức Thì)**: Khi kích hoạt `LockType = 'Hard'`, `SecurityStamp` được cấp mới ngay lập tức để cắt đứt toàn bộ phiên làm việc của người dùng thuộc tenant đó.
