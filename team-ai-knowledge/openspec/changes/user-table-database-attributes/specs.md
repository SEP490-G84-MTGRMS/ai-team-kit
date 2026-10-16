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
