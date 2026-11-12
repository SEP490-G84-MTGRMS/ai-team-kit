# Specs: homepage-trial-onboarding

Dependencies: `exploration.md`, `design-brief.md`

## API / Contract

Mọi lỗi API MUST dùng ProblemDetails RFC 7807, có `code` và `traceId`, không chứa OTP/token/password.

| Method | Path | Yêu cầu |
|---|---|---|
| POST | `/api/auth/register/send-otp` | Email thật đã chuẩn hóa; rate limit IP + định danh |
| POST | `/api/auth/register` | OTP challenge/code, `startTrial`, idempotency key; không nhận plan/duration/tenant ID |
| GET | `/api/tenant/subscriptions/trial-status` | Tenant từ JWT + membership |
| POST | `/api/tenant/subscriptions/trial` | Không nhận tenant/plan/duration |

## ADDED Requirements

### Requirement: REQ-SUB-07 Phân biệt đăng ký thường và CTA Trial

1. CTA HomePage MUST dẫn tới `/auth/register?intent=trial`; đăng ký trực tiếp MUST không tự bắt đầu Trial.
2. Query intent chỉ điều khiển UI; backend MUST tự quyết định eligibility và thời hạn.
3. UI MUST ghi “Dùng thử miễn phí 3 ngày”, “Không cần thẻ”, “Không tự động gia hạn” và nói rõ 72 giờ bắt đầu khi đăng ký commit.
4. UI MUST không báo thành công trước backend commit và MUST giữ dữ liệu form khi gửi/resend OTP hoặc lỗi có thể thử lại.

#### Scenario: Đăng ký thường
- GIVEN khách mở `/auth/register`
- WHEN hoàn tất OTP và đăng ký
- THEN tenant MUST là `NO_PLAN`, không có dấu Trial
- AND UI MUST chuyển tới trang chọn gói.

#### Scenario: Đăng ký từ CTA
- GIVEN khách mở `/auth/register?intent=trial`
- WHEN OTP và transaction thành công
- THEN tenant MUST nhận Trial đúng 72 giờ
- AND UI MUST chuyển Dashboard.

#### Scenario: Mất response sau commit
- GIVEN backend đã commit nhưng client mất response
- WHEN người dùng đăng nhập lại
- THEN hệ thống MUST dùng trạng thái đã lưu để điều hướng
- AND MUST không tạo tenant hoặc Trial thứ hai.

### Requirement: REQ-SUB-08 OTP fail-closed và đăng ký nguyên tử

1. Email thật, OTP challenge tồn tại, đúng, còn TTL và chưa dùng MUST là bắt buộc; MUST không sinh email giả.
2. Production MUST không trả OTP/DevOtpCode và MUST không đánh dấu email verified trước xác thực.
3. OTP MUST lưu hash trong distributed cache/DB với TTL, counter và consume nguyên tử.
4. Challenge MUST được reserve nguyên tử khi đăng ký, chỉ consume sau commit; rollback MUST trả reservation về trạng thái retry được nếu còn TTL.
5. User, Tenant, TenantUser, Branch, tùy chọn Trial và audit MUST commit trong một transaction.
6. Email/phone MUST canonicalize và có unique constraint kể cả soft-delete; dấu Trial MUST không bị xóa khi soft-delete/restore.
7. API MUST dùng idempotency key và không trả lịch sử Trial trước khi xác minh OTP.

#### Scenario: Thiếu challenge
- GIVEN không có OTP challenge hợp lệ
- WHEN gọi register
- THEN MUST trả 400 `OTP_REQUIRED`
- AND MUST không tạo dữ liệu.

#### Scenario: Rollback sau OTP hợp lệ
- GIVEN challenge đã reserve
- WHEN transaction DB thất bại
- THEN mọi dữ liệu MUST rollback
- AND challenge còn TTL MUST có thể retry an toàn.

#### Scenario: Hai request đồng thời
- GIVEN cùng định danh và idempotency key
- WHEN hai instance xử lý đồng thời
- THEN chỉ một User/Tenant/Branch MUST được tạo
- AND response MUST hội tụ về cùng kết quả.

### Requirement: REQ-SUB-09 Trial một lần theo account và tenant

1. User MUST lưu `TrialConsumedAt`; Tenant MUST lưu `TrialStartedAt`, `TrialExpiresAt` và `FirstPaidAt`.
2. Eligibility MUST yêu cầu User chưa dùng Trial, Tenant chưa dùng Trial, chưa từng trả phí, đang `NO_PLAN`, email verified.
3. Account là User.Id bất biến; soft-delete MUST giữ dấu và định danh chuẩn hóa.
4. Kích hoạt MUST khóa/conditional-update User trước Tenant trong cùng transaction; chỉ thành công khi cả hai bản ghi còn eligible.
5. Trial MUST đúng 72 giờ UTC; ACTIVE retry trả cùng mốc, không cộng ngày.
6. `EXPIRED` MUST được suy trực tiếp khi `TrialExpiresAt <= UtcNow`.
7. Trial MUST không trừ ví, tạo WalletTransaction, yêu cầu thẻ hoặc tự gia hạn.
8. Audit duy nhất MUST nằm cùng transaction và có unique idempotency key.

#### Scenario: Account dùng Trial qua tenant khác
- GIVEN User đã có `TrialConsumedAt`
- WHEN kích hoạt trên tenant khác
- THEN MUST trả 409 `TRIAL_ALREADY_USED`
- AND không sửa tenant.

#### Scenario: Tenant từng trả phí
- GIVEN Tenant có `FirstPaidAt` hoặc giao dịch mua gói thành công
- WHEN gọi Trial
- THEN MUST trả 409 `TRIAL_NOT_ELIGIBLE`
- AND không cấp Trial.

#### Scenario: Kích hoạt đồng thời
- GIVEN User và Tenant đủ điều kiện
- WHEN hai request tới đồng thời
- THEN chỉ một transaction MUST ghi Trial/audit
- AND request còn lại MUST trả cùng ACTIVE hoặc conflict, không cộng hạn.

#### Scenario: Trial vừa hết
- GIVEN `TrialExpiresAt <= UtcNow` dù trạng thái lưu chưa đồng bộ
- WHEN gọi API nghiệp vụ
- THEN backend MUST coi Trial là EXPIRED và từ chối.

### Requirement: REQ-SUB-10 Backend subscription gate và điều hướng NO_PLAN

1. Backend MUST chặn `NO_PLAN` và Trial hết hạn khỏi mọi API nghiệp vụ bằng 403 `SUBSCRIPTION_REQUIRED`.
2. Allowlist MUST giới hạn ở auth/me/logout/account, trial status/activate, pricing/subscription purchase, wallet balance/top-up, checkout/payment callback và store-info cần cho onboarding.
3. Frontend route guard chỉ hỗ trợ UX và MUST không thay thế backend gate.
4. Tenant MUST lấy từ JWT, xác minh membership Store Owner active; MUST không tin `X-Tenant-Id` hoặc fallback tenant đầu tiên.
5. Trial status MUST trả `ELIGIBLE|ACTIVE|EXPIRED|PAID|REVIEW_REQUIRED`.
6. `NO_PLAN` MUST có thể bắt đầu Trial, nạp ví và mua STANDARD/PRO.
7. UI MUST map lỗi sang tiếng Việt và không hiển thị enum nội bộ.

#### Scenario: Gọi trực tiếp API nghiệp vụ
- GIVEN tenant `NO_PLAN` hoặc Trial hết hạn
- WHEN gọi trực tiếp API kho/POS/sản phẩm
- THEN backend MUST trả 403 ProblemDetails `SUBSCRIPTION_REQUIRED`.

#### Scenario: NO_PLAN mua gói
- GIVEN tenant `NO_PLAN`
- WHEN truy cập ví/nạp tiền/checkout và mua gói thành công
- THEN request MUST được allowlist
- AND Tenant MUST đặt `FirstPaidAt`, chuyển PAID/ACTIVE
- AND MUST không tự ghi lịch sử Trial.

#### Scenario: Giả mạo tenant
- GIVEN user tenant A gửi header tenant B
- WHEN gọi status/kích hoạt
- THEN backend MUST bỏ qua/từ chối header và chỉ dùng tenant claim + membership
- AND MUST không tiết lộ tenant B.

### Requirement: REQ-SUB-11 Migration và backfill không cấp Trial nhầm

1. Migration MUST có dry-run/report trước khi ghi.
2. Bằng chứng Trial MUST backfill timestamp Trial và đánh dấu Store Owner liên kết đã dùng.
3. Bằng chứng mua gói MUST chỉ backfill `FirstPaidAt`, không tự tạo lịch sử Trial.
4. Có cả hai bằng chứng MUST giữ hai lịch sử độc lập.
5. Dữ liệu thiếu/mâu thuẫn MUST thành `REVIEW_REQUIRED`, không ELIGIBLE, và được báo cáo.
6. Giá trị mặc định mới MUST là `NO_PLAN`; mọi fallback code sang TRIAL/STANDARD MUST bị loại bỏ.

#### Scenario: Dữ liệu legacy mơ hồ
- GIVEN tenant không có bằng chứng Trial hoặc paid đáng tin cậy
- WHEN backfill chạy
- THEN MUST đặt `REVIEW_REQUIRED`
- AND MUST không cấp Trial tự động.

#### Scenario: Tenant paid chưa từng Trial
- GIVEN có giao dịch STANDARD/PRO nhưng không có bằng chứng Trial
- WHEN backfill chạy
- THEN MUST đặt `FirstPaidAt`
- AND MUST để `TrialConsumedAt/TrialStartedAt` không bị bịa đặt.

## MODIFIED Requirements

Không thay đổi giá, quota hoặc chính sách thanh toán STANDARD/PRO.

## Acceptance checklist

- [ ] Hai intent đăng ký và UX retry rõ ràng.
- [ ] OTP fail-closed, distributed, atomic và transaction retry an toàn.
- [ ] Trial account+tenant đúng một lần, paid history tách biệt, chống concurrency.
- [ ] Backend gate/allowlist, tenant isolation và live expiry được kiểm thử.
- [ ] Backfill deterministic, có dry-run/report và không cấp eligibility nhầm.
- [ ] Build/test frontend/backend PASS.
