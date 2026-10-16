# Exploration: user-table-database-attributes

## 1. Hiện trạng Code & Thiết kế Hiện Tại
- **Tài liệu Data Dictionary (`Database_Design_Data_Dictionary.md`)**:
  - Bảng `Users` hiện tại chỉ có 8 cột tối giản (`UserID`, `UserName`, `PasswordHash`, `FullName`, `Email`, `Phone`, `IsActive`, `CreatedAt`).
  - Bảng `TenantUsers` chỉ có 4 cột (`TenantID`, `UserID`, `Role`, `AssignedAt`), thiếu `BranchID` để phân quyền theo chi nhánh và thiếu `IsActive` trong phạm vi tenant.
  - Bảng `Tenants` chỉ có 5 cột cơ bản (`TenantID`, `Name`, `Code`, `Status`, `CreatedAt`), thiếu toàn bộ các trường quản lý thuê bao, hạn ân hạn, hình thức khóa Soft/Hard Lock và thông tin pháp lý (MST, Hotline, Địa chỉ) hiển thị trên Master Admin.
- **Mã nguồn Backend (`MT_GRMS_BACKEND`)**:
  - `User.cs` trong `Domain/Entities/Identity/` chỉ mới có 3 thuộc tính sơ khởi (`Id`, `Username`, `Password`) từ bước setup docker ban đầu.
- **Hệ thống Giao diện Thực tế do Ortus phát triển**:
  - Màn hình SaaS Master Admin (`TenantManagementPage`, `TenantDetailPage`, `create_tenant.html`, `LockControl.tsx`, `audit_logs.html`).
  - Luồng Auth & Xác thực (`LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `authTypes.ts`).
  - Giao diện Profile & Nhân sự (`StoreOwnerDashboardPage`, `employee.types.ts`).

## 2. Assumptions (Giả định cốt lõi)
1. **Tuân thủ chuẩn hóa 3NF**: Phân tách rõ ràng giữa Tài khoản xác thực danh tính (`Users`), Hồ sơ nhân sự - tiền lương (`Employees`), và Bảng phân quyền trong tổ chức (`TenantUsers`).
2. **Kiến trúc Multi-Tenancy**: `Users` là thực thể toàn cục (Platform/Identity Scope). Một người dùng có thể là Super Admin, hoặc là Store Owner sở hữu 1 chuỗi cửa hàng, hoặc là nhân viên làm việc tại 1 hoặc nhiều chi nhánh thuộc Tenant.
3. **Bảo mật & Kiểm toán**: Các trường lưu vết đăng nhập (`LastLoginAt`, `LastLoginIp`), cơ chế hủy token tức thì (`SecurityStamp`), mật khẩu tạm (`MustChangePassword`) và OTP khôi phục mật khẩu là bắt buộc đối với hệ thống SaaS thương mại.

## 3. Non-Goals (Ngoài phạm vi)
- Không gộp bảng `Employees` vào bảng `Users` (giữ nguyên tính độc lập của phân hệ nhân sự 3NF theo yêu cầu đồ án).
- Không can thiệp vào các bảng thuộc phân hệ Catalog, Kho bãi, Bán hàng, hay Thu chi.
- Không viết migration database thật ở bước Brainstorm.

## 4. Các Phương Án Đánh Giá

### Phương án 1: Chỉ sửa cục bộ bảng `Users` đơn lẻ
- **Mô tả**: Chỉ thêm các trường nghiệp vụ thiếu vào bảng `Users` (`AvatarUrl`, `MustChangePassword`, `IsEmailVerified`, `LastLoginAt`, `LastLoginIp`, `SecurityStamp`, `PasswordResetOtp`, `OtpExpiry`, `RefreshToken`). Giữ nguyên bảng `Tenants` và `TenantUsers`.
- **Ưu điểm**: Khối lượng chỉnh sửa nhỏ, thời gian làm nhanh.
- **Nhược điểm**: Bỏ qua các vấn đề cốt lõi trên UI Master Admin (không lưu được hình thức khóa Soft/Hard Lock, ngày hết hạn thuê bao, hạn ân hạn trên `Tenants`; và không phân quyền theo chi nhánh trên `TenantUsers`).

### Phương án 2: Chuẩn hóa Toàn diện & Đồng bộ Hệ thống Identity & Multi-Tenancy (KHUYÊN DÙNG)
- **Mô tả**:
  1. **Nâng cấp bảng `Users`**: Bổ sung đầy đủ 12 trường an ninh, kiểm toán, mật khẩu tạm, OTP và Refresh Token.
  2. **Nâng cấp bảng `TenantUsers`**: Bổ sung `BranchID` (phân quyền phạm vi chi nhánh) và `IsActive` (kiểm soát hiệu lực trong Tenant).
  3. **Nâng cấp bảng `Tenants`**: Bổ sung thông tin pháp lý (`TaxCode`, `Hotline`, `Address`, `City`), quản lý gói dịch vụ (`CurrentPlan`, `SubscriptionExpiresAt`, `GracePeriodExpiresAt`), và kiểm soát khóa (`LockType`, `LockReason`, `LockedAt`, `LockedBy`).
  4. **Bổ sung bảng `AuditLogs`**: Lưu vết kiểm toán các thao tác can thiệp hệ thống của Super Admin và Store Owner (khóa tenant, đổi gói, gia hạn, duyệt thao tác nhạy cảm).
  5. **Bổ sung/Làm rõ bảng `SubscriptionPlans`**: Định nghĩa danh mục gói dịch vụ SaaS phục vụ Master Admin.
- **Ưu điểm**: Khớp 100% với toàn bộ wireframe và code Frontend React 19 mà Ortus đã làm; đáp ứng chuẩn SRS Report-3 và các quy tắc nghiệp vụ GB-01 đến GB-15.
- **Nhược điểm**: Cần cập nhật một số mục trong tài liệu Data Dictionary và C# Entity class.

## 5. Phương Án Lựa Chọn & Lý Do
- **Lựa chọn**: **Phương án 2**.
- **Lý do**: Đây là giải pháp triệt để, xóa bỏ hoàn toàn khoảng cách giữa Giao diện (Frontend) và Cơ sở dữ liệu (Database Design). Việc bổ sung các trường này giúp hệ thống sẵn sàng cho việc tích hợp Backend API xác thực, phân quyền RBAC và kiểm toán hệ thống một cách vững chắc.

## 6. Rủi Ro & Cách Giảm Thiểu
- **Rủi ro**: Làm thay đổi số lượng bảng hoặc vi phạm chuẩn 3NF so với sơ đồ ERD nộp trường.
- **Cách giảm thiểu**: Các trường bổ sung trên `Users` và `Tenants` đều là các thuộc tính nguyên tử (Atomic Attributes), không sinh ra phụ thuộc bắc cầu; duy trì tính toàn vẹn 3NF và tương thích hoàn toàn với kiến trúc EF Core Code-First.
