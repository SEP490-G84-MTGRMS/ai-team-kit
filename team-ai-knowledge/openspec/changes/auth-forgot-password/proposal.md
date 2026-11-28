# Proposal: Màn hình Khôi phục Mật khẩu qua Email OTP (`auth-forgot-password`)

## Vấn đề
Người dùng quên mật khẩu cần tự khôi phục quyền truy cập an toàn thông qua mã OTP 6 chữ số gửi về email liên kết mà không cần Admin can thiệp thủ công.

## Mục tiêu
Cung cấp quy trình khôi phục 3 bước (Nhập Email -> Xác thực OTP có đếm ngược gửi lại -> Đặt mật khẩu mới) chống vét cạn mã OTP.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/auth/forgot-password`, `/forgot-password` (`src/pages/auth/ForgotPasswordPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: Bố cục màn hình chuẩn hệ thống.
  - Tích hợp đầy đủ với tầng API Backend (`AuthController`) và thực thể nghiệp vụ (`User`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/auth/forgot-password`, `/forgot-password` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Khách vãng lai / Chưa đăng nhập**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/auth/forgot-password`, `/forgot-password`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-20-03` (FE-20).
