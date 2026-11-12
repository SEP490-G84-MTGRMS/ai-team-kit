# Design Brief: Homepage Trial Onboarding

## 1. Quyết định chính

- `/auth/register`: Email OTP → transaction tạo User/Tenant/Branch với `NO_PLAN` → trang chọn gói.
- `/auth/register?intent=trial`: Email OTP → cùng transaction, đồng thời kích hoạt Trial 72 giờ → Dashboard.
- Query chỉ điều khiển UI; request có `startTrial`, nhưng backend tự quyết định eligibility, plan và thời hạn.
- `NO_PLAN` chỉ truy cập account, subscription/pricing, ví/nạp tiền, checkout/callback và đăng xuất; mọi API nghiệp vụ bị backend gate.
- Trial một lần được bảo vệ ở account và tenant; tenant từng trả phí có `FirstPaidAt` và không còn eligible.

## 2. Data model

### User
- `TrialConsumedAt UTC null`.
- `NormalizedEmail`, `NormalizedPhone` có unique index, bao gồm account soft-delete.
- Account là `User.Id` bất biến; soft-delete không xóa dấu Trial và không giải phóng định danh để tạo account Trial mới.

### Tenant
- `CurrentPlan = null`, `SubscriptionStatus = NO_PLAN` mặc định cho đăng ký mới.
- `TrialStartedAt UTC null`, `TrialExpiresAt UTC null`.
- `FirstPaidAt UTC null` là dấu tenant đã từng trả phí, tách biệt lịch sử Trial.

Tạo EF Core migration mới; không sửa migration đã merge.

## 3. OTP và đăng ký nguyên tử

- Bắt buộc email thật đã chuẩn hóa; không sinh email giả.
- OTP lưu dạng hash trong distributed cache/DB, TTL và bộ đếm sai dùng chung toàn cụm.
- Production không trả `DevOtpCode`; chỉ Development được kiểm soát mới có diagnostic riêng.
- Verify dùng challenge state `Pending → Reserved → Consumed` nguyên tử. Registration giữ reservation bằng idempotency key; chỉ consume sau DB commit, rollback trả về `Pending` nếu còn TTL.
- Transaction tạo User/Tenant/TenantUser/Branch/Trial/audit. Unique index và idempotency ngăn tạo trùng.
- Nếu response mất sau commit, đăng nhập lại trả trạng thái thật và điều hướng phù hợp.

## 4. Trial concurrency

- Chỉ dùng tenant claim từ JWT và xác minh membership Store Owner active; không dùng `X-Tenant-Id`, không fallback tenant đầu tiên.
- Trong transaction, khóa theo thứ tự User rồi Tenant hoặc dùng atomic conditional update:
  `User.TrialConsumedAt IS NULL`, `Tenant.TrialStartedAt IS NULL`, `Tenant.FirstPaidAt IS NULL`, tenant `NO_PLAN`.
- Chỉ thành công khi cả hai conditional update thành công; audit `TRIAL_ACTIVATED` có unique idempotency key và nằm cùng transaction.
- ACTIVE trả lại cùng mốc thời gian; không cộng ngày.
- `EXPIRED` được suy ra trực tiếp khi `TrialExpiresAt <= UtcNow`; background job chỉ đồng bộ trạng thái hiển thị, không phải nguồn sự thật.

## 5. Backend subscription gate

Middleware/policy chạy sau authentication và tenant membership, trước controller nghiệp vụ:

- Chặn `NO_PLAN` và Trial đã hết với HTTP 403 ProblemDetails code `SUBSCRIPTION_REQUIRED`.
- Allowlist tối thiểu: login/logout/me/account, trial-status/trial, pricing/subscription purchase, wallet balance/top-up, checkout/payment callback và endpoint store-info cần cho onboarding.
- Paid active và Trial còn hạn được dùng API theo role hiện có.
- Không thay thế authorization role/tenant; cả hai lớp đều phải pass.
- IP audit lấy qua ForwardedHeaders chỉ từ trusted proxy.

## 6. API/UI

- `POST /api/auth/register`: `startTrial`, OTP challenge/code, idempotency key; không nhận plan/duration/tenant ID.
- `GET /api/tenant/subscriptions/trial-status`: `ELIGIBLE|ACTIVE|EXPIRED|PAID|REVIEW_REQUIRED`.
- `POST /api/tenant/subscriptions/trial`: body không chứa tenant/plan/duration.
- Lỗi theo RFC 7807 với `code`, `traceId`; không tiết lộ lịch sử Trial trước OTP.
- UI giữ dữ liệu form qua send/resend/error; nói rõ 72 giờ bắt đầu khi đăng ký commit.
- Popup xác nhận có focus trap, Escape, accessible labels; UI dùng nhãn tiếng Việt, không lộ enum nội bộ.
- Frontend guard chỉ hỗ trợ UX; backend gate là bắt buộc.

## 7. Backfill

Chạy dry-run trước migration và xuất số lượng/ID mơ hồ:

1. Tenant có bằng chứng Trial (plan/status TRIAL hoặc expiry Trial): suy `TrialStartedAt = TrialExpiresAt - 72h` khi thiếu; đánh dấu tất cả Store Owner active đã liên kết là đã dùng Trial tại mốc bắt đầu.
2. Tenant có giao dịch mua gói thành công/plan STANDARD-PRO: đặt `FirstPaidAt` từ bằng chứng sớm nhất; không tự tạo lịch sử Trial.
3. Tenant vừa có Trial vừa paid: giữ cả hai dấu độc lập.
4. Dữ liệu thiếu/mâu thuẫn: đặt `REVIEW_REQUIRED`, không cấp eligibility; ghi report để admin xử lý.
5. Không tenant/account hiện hữu nào được mặc định `ELIGIBLE` chỉ vì cột mới null.

## 8. Test strategy

Unit/integration cho OTP fail-closed, rollback/retry, normalized identity, idempotency/concurrency, tenant isolation, paid history, live expiry, backend gate/allowlist và backfill. Frontend test hai intent, redirect, mất response, accessible modal và mapping ProblemDetails.
