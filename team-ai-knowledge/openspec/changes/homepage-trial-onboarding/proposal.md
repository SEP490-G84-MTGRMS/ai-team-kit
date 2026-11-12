# Proposal: Homepage Trial Onboarding

## Vấn đề

CTA “Dùng thử miễn phí” trên HomePage hiện chỉ mở form/toast giả “14 ngày”, trong khi đăng ký thường của hệ thống đang tự cấp Trial. Hai hành vi này làm người dùng không chủ động thời điểm bắt đầu 3 ngày dùng thử và có thể bị mất Trial trước khi muốn trải nghiệm.

## Mục tiêu

- Đăng ký thường chỉ tạo gian hàng `NO_PLAN`, chưa bắt đầu Trial.
- Chỉ đăng ký từ CTA `/auth/register?intent=trial` hoặc thao tác “Bắt đầu dùng thử” của Store Owner `NO_PLAN` mới kích hoạt Trial đúng 72 giờ.
- Mỗi account và mỗi tenant chỉ được Trial một lần; backend quyết định eligibility và chống request đồng thời.
- Tenant `NO_PLAN` vẫn có đường chọn gói, nạp ví và thanh toán nhưng không dùng API nghiệp vụ.
- Email OTP bắt buộc, fail-closed, không tạo dữ liệu một phần hoặc lộ OTP.

## Phạm vi

### In scope

- Thống nhất CTA Trial trên HomePage và bỏ modal/toast giả.
- Tách đăng ký thường `NO_PLAN` khỏi đăng ký CTA Trial.
- Email OTP thật trước khi tạo Store Owner, tenant và branch.
- API trạng thái/kích hoạt Trial; lưu dấu Trial theo account và tenant.
- Backend subscription gate cho `NO_PLAN` và Trial hết hạn; allowlist account, subscription, ví/nạp tiền/checkout.
- Migration/backfill an toàn cho dữ liệu hiện hữu; audit và test đồng thời/idempotency.
- Điều hướng frontend theo `ELIGIBLE/ACTIVE/EXPIRED/PAID`.

### Out of scope

- Đổi giá/quota STANDARD, PRO hoặc chính sách mua thêm GB/chi nhánh.
- Thẻ tự động gia hạn hoặc thu tiền sau Trial.
- Thiết kế lại toàn bộ HomePage/Dashboard/Subscription.
- Thay đổi 2FA hoặc onboarding dữ liệu mẫu.
- Cấp lại Trial thủ công.

## Tiêu chí thành công

- [ ] 100% CTA Trial dùng luồng thật và hiển thị 3 ngày, không cần thẻ, không tự gia hạn.
- [ ] Đăng ký thường tạo `NO_PLAN`, không ghi thời gian/dấu Trial và đi tới chọn gói.
- [ ] Đăng ký CTA chỉ kích hoạt Trial sau Email OTP và commit thành công, sau đó vào Dashboard.
- [ ] Một account và tenant không thể nhận Trial lần hai, kể cả retry, đa instance hoặc request đồng thời.
- [ ] `NO_PLAN`/Trial hết hạn bị backend chặn khỏi API nghiệp vụ nhưng vẫn dùng được account, chọn gói, ví/nạp tiền/checkout.
- [ ] Tenant và role được lấy từ JWT + membership; không tin tenant header client gửi.
- [ ] OTP production fail-closed, không trả OTP, không đánh dấu email verified khi chưa xác thực.
- [ ] Không trừ ví/tạo giao dịch khi kích hoạt Trial; paid history không bị nhầm thành Trial history.
- [ ] Migration có dry-run/report cho dữ liệu mơ hồ; build và test frontend/backend PASS.
