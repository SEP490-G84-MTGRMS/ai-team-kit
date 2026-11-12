# Proposal: Homepage Trial Onboarding

## Vấn đề

Các nút **Dùng thử miễn phí** trên Navbar, Hero và CTA của trang chủ hiện mở một `TrialModal` cục bộ ghi “14 ngày”. Form này chỉ kiểm tra tên cửa hàng và số điện thoại, sau đó đóng modal và hiển thị toast thành công; không gọi API đăng ký, không xác thực Email OTP, không tạo tài khoản/tenant/chi nhánh và không kích hoạt Trial thật. Hành vi này mâu thuẫn với chính sách Trial 3 ngày đang áp dụng trong phân hệ Subscription và có thể khiến người dùng tin rằng gian hàng đã được tạo dù hệ thống chưa lưu dữ liệu.

## Mục tiêu

- Biến toàn bộ CTA dùng thử trên trang chủ thành một điểm vào thống nhất cho luồng đăng ký và kích hoạt Trial thật.
- Dẫn người chưa đăng nhập qua đăng ký, Email OTP, tạo tài khoản chủ cửa hàng, tenant và chi nhánh mặc định trước khi vào Dashboard.
- Điều hướng người đã đăng nhập theo trạng thái tenant/subscription hiện tại, không tạo Trial trùng và không yêu cầu thanh toán.
- Thống nhất nội dung toàn hệ thống thành **dùng thử miễn phí 3 ngày**, không cần thẻ và không tự động gia hạn.
- Bảo đảm backend là nguồn quyết định điều kiện, thời hạn và trạng thái Trial.

## Phạm vi

### In scope

- Các CTA dùng thử tại Navbar, Hero, CTA banner và các điểm gọi Trial trên trang chủ.
- Thay modal đăng ký giả bằng điều hướng tới `/auth/register?intent=trial` hoặc bước xác nhận phù hợp với trạng thái đăng nhập.
- Trang đăng ký nhận intent Trial, giữ luồng gửi/xác thực Email OTP hiện có và hiển thị rõ quyền lợi Trial 3 ngày.
- Sau đăng ký và OTP thành công, tạo tài khoản Store Owner, tenant, chi nhánh mặc định và kích hoạt Trial đúng một lần; chuyển người dùng tới Dashboard.
- Với người đã đăng nhập:
  - chưa có tenant hợp lệ: dẫn tới hoàn tất tạo gian hàng;
  - có tenant đủ điều kiện và chưa từng dùng Trial: cho xác nhận kích hoạt;
  - đang dùng Trial: đưa tới Dashboard;
  - đã dùng Trial, Trial hết hạn hoặc đang dùng gói trả phí: đưa tới trang quản lý gói.
- Backend kiểm tra quyền sở hữu tenant, Email đã xác minh, điều kiện dùng Trial một lần, thời hạn 3 ngày và idempotency.
- Thông báo rõ Trial không cần thẻ, không trừ ví và không tự động gia hạn.
- Cập nhật nội dung “14 ngày” hoặc giá/gói cũ trên trang chủ liên quan trực tiếp tới CTA Trial.

### Out of scope

- Thay đổi giá STANDARD, PRO hoặc chính sách mua thêm GB/chi nhánh.
- Tích hợp thẻ thanh toán, tự động gia hạn hoặc thu tiền sau Trial.
- Thiết kế lại toàn bộ HomePage, Dashboard hay trang quản lý Subscription.
- Thay đổi cơ chế đăng nhập, 2FA hoặc Email OTP ngoài phần tái sử dụng luồng đăng ký hiện có.
- Ứng dụng mobile native hoặc onboarding dữ liệu hàng hóa mẫu tự động.

## Người dùng liên quan

- Khách chưa đăng nhập muốn tạo gian hàng và trải nghiệm MT-GRMS.
- Store Owner đã đăng nhập cần tiếp tục Dashboard hoặc xem/nâng cấp gói theo trạng thái.
- SaaS Admin/Support cần trạng thái Trial chính xác, không bị kích hoạt lặp.
- Hệ thống Subscription/Auth chịu trách nhiệm xác thực điều kiện và lưu trạng thái bền vững.

## Tiêu chí thành công

- [ ] 100% CTA “Dùng thử miễn phí” trên HomePage đi vào cùng một luồng onboarding thật, không còn toast thành công giả.
- [ ] Nội dung CTA và màn hình đăng ký thống nhất Trial 3 ngày, không cần thẻ và không tự động gia hạn.
- [ ] Người chưa đăng nhập hoàn tất đăng ký và Email OTP trước khi tenant/Trial được kích hoạt.
- [ ] Đăng ký thành công tạo đúng một Store Owner, một tenant và chi nhánh mặc định, sau đó vào Dashboard bằng phiên đăng nhập hợp lệ.
- [ ] Một tenant không thể nhận thêm ngày Trial khi gửi lại request, tải lại trang hoặc bấm CTA nhiều lần.
- [ ] Người đang Trial được chuyển tới Dashboard; người đã hết/đã dùng Trial hoặc đang trả phí được chuyển tới trang quản lý gói phù hợp.
- [ ] Frontend không gửi hoặc quyết định thời hạn Trial, tenant ID hay giá; backend xác định toàn bộ từ phiên và chính sách hệ thống.
- [ ] Không phát sinh trừ Ví gian hàng, yêu cầu thẻ hoặc giao dịch thanh toán khi kích hoạt Trial.
- [ ] Build frontend/backend và các test điều hướng, OTP, idempotency và quyền tenant đều PASS.
