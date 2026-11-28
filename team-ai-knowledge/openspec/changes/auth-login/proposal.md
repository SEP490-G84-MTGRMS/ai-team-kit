# Proposal: Màn hình Đăng nhập Đa vai trò & Xác thực 2FA OTP (`auth-login`)

## Vấn đề
Người dùng đa vai trò (Master Admin, Chủ cửa hàng, Nhân viên thu ngân/kho) cần đăng nhập an toàn bằng SĐT/Email kết hợp xác thực hai lớp Email OTP và điều hướng đúng cổng làm việc.

## Mục tiêu
Xác thực tài khoản qua JWT Access/Refresh Token, kiểm tra khóa gian hàng (Tenant Lock), hỗ trợ thử thách 2FA Email OTP và phân luồng tự động theo Role.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/auth/login`, `/login` (`src/pages/auth/LoginPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `LoginOtpModal`, `AdminToast`.
  - Tích hợp đầy đủ với tầng API Backend (`AuthController`) và thực thể nghiệp vụ (`User`, `TenantUser`, `Tenant`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/auth/login`, `/login` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Khách vãng lai / Chưa đăng nhập**
- **Quản trị viên nền tảng (Master Admin)**
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/auth/login`, `/login`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-20-01` (FE-20).
