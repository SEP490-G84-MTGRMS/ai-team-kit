# Codebase Review: user-table-database-attributes

## 1. Bản Đồ Ảnh Hưởng Mã Nguồn (Code Mapping)

| REQ | Code Hiện Có | Cần Thêm / Chỉnh Sửa | Ghi Chú |
|---|---|---|---|
| **REQ-01** (Users Attributes) | `Database_Design_Data_Dictionary.md` (mục 3.1.2 & 5.3.1)<br>`MT_GRMS_BACKEND/src/.../Identity/User.cs`<br>`UserConfiguration.cs` | Thêm 12 cột: `AvatarUrl`, `MustChangePassword`, `IsEmailVerified`, `LastLoginAt`, `LastLoginIp`, `SecurityStamp`, `PasswordResetOtp`, `OtpExpiry`, `RefreshToken`, `RefreshTokenExpiryTime`, `AccessFailedCount`, `LockoutEnd`. | Đồng bộ 100% giữa Data Dictionary và C# Entity. |
| **REQ-02** (TenantUsers Branch) | `Database_Design_Data_Dictionary.md` (mục 3.1.3 & 5.3.1) | Thêm cột `BranchID (UUID NULL, FK -> Branches)` và `IsActive (BIT)`. | Cho phép phân quyền Store Manager/Cashier theo chi nhánh. |
| **REQ-03** (Tenants Management) | `Database_Design_Data_Dictionary.md` (mục 3.1.1 & 5.3.1) | Thêm 11 cột: `Subdomain`, `TaxCode`, `Hotline`, `Address`, `City`, `CurrentPlan`, `SubscriptionExpiresAt`, `GracePeriodExpiresAt`, `LockType`, `LockReason`, `LockedAt`, `LockedBy`. | Đáp ứng wireframe Master Admin & UC 20.1-20.3, UC 21.6. |
| **REQ-04** (AuditLogs Entity) | `Database_Design_Data_Dictionary.md` (mục 3.1 & 5.3.1) | Thêm bảng thực thể mới `AuditLogs` (13 cột) trong Phân hệ 1 và cấu hình Fluent API. | Phục vụ màn hình `audit_logs.html` và Tab Audit Trail. |

## 2. Mã Nguồn Tái Sử Dụng Được (Reusable Components)
- `BaseEntity<Guid>` và `IAuditableEntity` tại `Database_Design_Data_Dictionary.md` (mục 5.1).
- `UserAuthenticationTests.cs` và `UserDatabaseIntegrationTests.cs` trong `MT_GRMS_BACKEND/tests/`.
- `authService.ts` và `authTypes.ts` trong `MT_GRMS_FRONTEND/src/features/auth/`.

## 3. Rủi Ro Xung Đột & Biện Pháp Kiểm Soát
- **Rủi ro**: `MT_GRMS_BACKEND` có pre-commit hook yêu cầu phải tạo worklog `.md` trong `docs/worklogs/` khi commit code backend.
  $\rightarrow$ *Biện pháp*: Ở bước `/sep-apply`, bắt buộc tự động tạo file worklog đúng quy chuẩn `RULE_WORKLOG_AND_COMMIT.md`.

## 4. Kết Luận: Khả Thi
Codebase hoàn toàn sẵn sàng cho việc triển khai các task.
