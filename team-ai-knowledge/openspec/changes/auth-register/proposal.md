# Proposal: Màn hình Đăng ký Khởi tạo Gian hàng & Xác thực Email OTP (`auth-register`)

## Vấn đề
Chủ tiệm tạp hóa mới cần tự đăng ký gian hàng SaaS trực tuyến, xác minh quyền sở hữu Email bằng OTP và tự động khởi tạo chi nhánh mặc định đầu tiên.

## Mục tiêu
Triển khai luồng đăng ký nhiều bước có kiểm tra độ mạnh mật khẩu, xác thực Email OTP 6 số và khởi tạo đồng bộ Tenant + Chi nhánh mặc định + Tài khoản Store Owner.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/auth/register`, `/register` (`src/pages/auth/RegisterPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `RegistrationOtpModal`, `AuthPolicyModal`, `AdminToast`.
  - Tích hợp đầy đủ với tầng API Backend (`AuthController`, `TenantStoreController`) và thực thể nghiệp vụ (`Tenant`, `User`, `TenantUser`, `Branch`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/auth/register`, `/register` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Khách vãng lai / Chưa đăng nhập**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/auth/register`, `/register`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-20-02` (FE-20).
