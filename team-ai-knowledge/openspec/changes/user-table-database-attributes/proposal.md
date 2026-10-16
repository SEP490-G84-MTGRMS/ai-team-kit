# Proposal: user-table-database-attributes

## Vấn đề
Hiện tại trong tài liệu thiết kế cơ sở dữ liệu `Database_Design_Data_Dictionary.md` và mã nguồn Backend (`User.cs`), bảng `Users` chỉ mới có 8 thuộc tính tối giản (`UserID`, `UserName`, `PasswordHash`, `FullName`, `Email`, `Phone`, `IsActive`, `CreatedAt`).
Trong khi đó, qua rà soát toàn bộ hệ thống màn hình thực tế do Ortus (`@Ortus24`) đã xây dựng (bao gồm: Phân hệ SaaS Master Admin, Quản lý & Chi tiết Tenant, Auth Flow Đăng nhập/Đăng ký/Quên mật khẩu OTP, Quản lý khóa Soft/Hard Lock, và Profile Chủ cửa hàng/Nhân viên), có nhiều trường dữ liệu an ninh, kiểm toán và nghiệp vụ thiết yếu chưa được phản ánh vào CSDL:
1. **Thiếu thông tin kiểm toán đăng nhập** (`LastLoginAt`, `LastLoginIp`) xuất hiện trực tiếp trên màn hình Tenant Detail (mục Tài khoản Chủ sở hữu - GB-09).
2. **Thiếu cờ kích hoạt và mật khẩu tạm** (`MustChangePassword`, `IsEmailVerified`) phục vụ luồng cấp phát Tenant mới từ Master Admin (`create_tenant.html` & UC Resend Activation).
3. **Thiếu cơ chế vô hiệu hóa phiên JWT** (`SecurityStamp` / `TokenVersion`) khi thực hiện lệnh Khóa cứng (Hard-Lock) theo quy tắc GB-13 / POST-2.
4. **Thiếu trường lưu mã OTP khôi phục mật khẩu** (`PasswordResetOtp`, `OtpExpiry`) trên màn hình Forgot Password (`ForgotPasswordPage.tsx`).
5. **Thiếu trường Refresh Token** (`RefreshToken`, `RefreshTokenExpiryTime`) phục vụ checkbox "Ghi nhớ đăng nhập" (Remember Me) trên màn hình Login (`LoginPage.tsx`).
6. **Bảng quan hệ `TenantUsers`** chưa có `BranchID` và `IsActive` để hỗ trợ phân quyền theo phạm vi chi nhánh (Branch Scope) cho Quản lý / Thu ngân.

## Mục tiêu
Chuẩn hóa và đồng bộ 100% thuộc tính cho bảng `Users` và bảng phân quyền `TenantUsers` giữa Giao diện người dùng (Frontend Wireframe / React 19) và Tài liệu thiết kế CSDL (`Database_Design_Data_Dictionary.md`) cũng như Entity C# EF Core Backend:
- Bổ sung đầy đủ các cột dữ liệu kiểm toán, an ninh và nghiệp vụ vào bảng `Users` trong từ điển dữ liệu.
- Mở rộng bảng `TenantUsers` hỗ trợ phân quyền linh hoạt theo Chi nhánh (`BranchID`) và kiểm soát trạng thái hoạt động theo từng Tenant.
- Cập nhật mô hình ERD Mermaid, bảng từ điển dữ liệu (Data Dictionary), và mã nguồn C# EF Core tương ứng trong `Database_Design_Data_Dictionary.md`.
- Bảo đảm CSDL vẫn tuân thủ nghiêm ngặt chuẩn 3NF, không làm phình bảng và duy trì kiến trúc 23 bảng cốt lõi của đề tài.

## Phạm vi
- **In scope**:
  - Khảo sát và tổng hợp toàn bộ trường dữ liệu người dùng trên các màn hình Ortus (`Html/demo/`, `src/pages/admin/`, `src/pages/auth/`).
  - Cập nhật bảng `Users` trong `Database_Design_Data_Dictionary.md` (Mermaid ERD, Data Dictionary, và C# EF Core Entity Class `User`).
  - Cập nhật bảng `TenantUsers` trong `Database_Design_Data_Dictionary.md` (hỗ trợ `BranchID` và `IsActive`).
  - Cập nhật tài liệu kiến trúc KB (`projects/MT-GRMS/design/database-schema.md`).
- **Out of scope**:
  - Không thay đổi bảng `Employees` (vẫn giữ nguyên 19 thuộc tính nhân sự & tiền lương đã chuẩn hóa 3NF).
  - Không thay đổi các bảng phân hệ khác (Catalog, Mua hàng, Bán hàng, Thu chi).
  - Không thực hiện database migration trực tiếp ở bước này (sẽ thực hiện trong bước Apply).

## Người dùng liên quan
- **SaaS Master Admin**: Cần xem thông tin kiểm toán chủ cửa hàng, cấp mật khẩu tạm, gửi lại email kích hoạt và áp dụng lệnh khóa tài khoản.
- **Store Owner (Chủ chuỗi)**: Đăng nhập lần đầu với mật khẩu tạm, đổi mật khẩu, quản lý tài khoản và xem thông tin hồ sơ cá nhân.
- **Store Manager & Cashier**: Đăng nhập bằng Email/SĐT, ghi nhớ phiên làm việc, phân quyền theo chi nhánh trực thuộc.

## Tiêu chí thành công
- [ ] Bảng `Users` trong Data Dictionary phản ánh đầy đủ 100% các trường dữ liệu trên UI: `AvatarUrl`, `MustChangePassword`, `IsEmailVerified`, `LastLoginAt`, `LastLoginIp`, `SecurityStamp`, `PasswordResetOtp`, `OtpExpiry`, `RefreshToken`, `RefreshTokenExpiryTime`.
- [ ] Bảng `TenantUsers` được nâng cấp thêm `BranchID` và `IsActive` đáp ứng chuẩn phân quyền RBAC đa cấp độ (Platform / Tenant / Branch).
- [ ] Mã C# EF Core trong `Database_Design_Data_Dictionary.md` và `MT_GRMS_BACKEND` được định nghĩa đầy đủ Fluent API, kiểu dữ liệu, độ dài và thuộc tính Nullable.
- [ ] ERD Mermaid và quan hệ 1-1 giữa `Users` và `Employees` được bảo toàn tính toàn vẹn 3NF.
