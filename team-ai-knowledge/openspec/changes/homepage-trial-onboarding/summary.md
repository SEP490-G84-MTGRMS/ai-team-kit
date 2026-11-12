# Summary: homepage-trial-onboarding

## Spec — ✅ Approve bởi @Ortus24 · 2026-11-12 08:02

Đã duyệt proposal luồng CTA dùng thử trên HomePage. CTA dẫn vào đăng ký thật, xác thực Email OTP, tạo tenant/chi nhánh và kích hoạt duy nhất gói TRIAL trong đúng 3 ngày; không dùng STANDARD/PRO, không yêu cầu thẻ, không trừ ví, không tự gia hạn và không cộng ngày khi request lặp.

## Brainstorm — ✅ Approve bởi @Ortus24 · 2026-11-12 08:24

Duyệt mô hình hai luồng: đăng ký thường tạo tenant NO_PLAN và tự chọn gói; CTA dùng thử sau Email OTP tự kích hoạt TRIAL đúng 72 giờ. Trial giới hạn một lần theo cả account và tenant, không trừ ví, không cần thẻ, không tự gia hạn; NO_PLAN bị route guard đưa tới trang chọn gói.
