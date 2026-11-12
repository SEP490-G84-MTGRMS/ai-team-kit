# Tasks: homepage-trial-onboarding

## Database / Migration

- [x] T1 — Thêm `User.TrialConsumedAt`, normalized email/phone và unique constraints giữ qua soft-delete; thêm `Tenant.TrialStartedAt`, `TrialExpiresAt`, `FirstPaidAt`; đổi default đăng ký mới sang `NO_PLAN`. (REQ-SUB-08, REQ-SUB-09)
- [x] T2 — Tạo EF Core migration mới cùng công cụ dry-run/backfill deterministic cho Trial/paid/`REVIEW_REQUIRED`; report chỉ dùng ID hoặc định danh đã mask, không chứa email/phone đầy đủ. (REQ-SUB-11)
- [x] T3 — Loại bỏ default/fallback ngầm sang TRIAL hoặc STANDARD trong entity configuration, initializer, quota/branch service và mapping liên quan. (REQ-SUB-11)

## Domain / Application

- [ ] T4 — Thiết kế OTP challenge distributed dạng hash với TTL, counter, state `Pending/Reserved/Consumed`; bind challenge với `NormalizedEmail`, intent và request fingerprint; không trả OTP ở Production. (REQ-SUB-08)
- [x] T5 — Sửa registration use case cho hai mode `NO_PLAN`/Trial, transaction User–Tenant–TenantUser–Branch–Trial–audit và retry an toàn khi rollback/mất response. (REQ-SUB-07, REQ-SUB-08)
- [x] T6 — Cài đặt Trial eligibility/status/activation với `FirstPaidAt`, live expiry UTC, conditional update/lock theo User rồi Tenant và audit duy nhất. (REQ-SUB-09)
- [ ] T7 — Cài đặt idempotency scope theo actor + operation + tenant/challenge, lưu request fingerprint và từ chối tái dùng key với payload khác. (REQ-SUB-08, REQ-SUB-09)

## API / Security

- [x] T8 — Sửa DTO/validator và ProblemDetails cho register, send OTP, trial-status và activate Trial; không nhận tenant/plan/duration từ client và không tiết lộ Trial history trước OTP. (REQ-SUB-07, REQ-SUB-08, REQ-SUB-09)
- [x] T9 — Sửa tenant resolver của Trial dùng JWT + Store Owner membership active; bỏ tin `X-Tenant-Id` và fallback tenant đầu tiên. (REQ-SUB-10)
- [x] T10 — Thêm backend subscription authorization gate cho `NO_PLAN`/Trial expired và allowlist tối thiểu cho auth/account/subscription/wallet/top-up/checkout/store-info. (REQ-SUB-10)
- [x] T11 — Giữ authorization/signature validation và chống replay riêng cho payment callback; cấu hình trusted proxy trước khi lấy IP audit. (REQ-SUB-10)
- [x] T12 — Thay endpoint Trial cũ dựa trên purchase flow bằng use case mới; bảo đảm không trừ ví, không tạo WalletTransaction và không cộng lại ngày. (REQ-SUB-09)

## Frontend

- [x] T13 — Thống nhất HomePage CTA tới `/auth/register?intent=trial`, bỏ form/toast Trial giả và nội dung 14 ngày. (REQ-SUB-07)
- [x] T14 — Sửa RegisterPage/API client cho `startTrial`, OTP challenge/idempotency, giữ form khi retry và điều hướng theo kết quả commit. (REQ-SUB-07, REQ-SUB-08)
- [x] T15 — Hoàn thiện onboarding `NO_PLAN`: trial status, xác nhận Trial accessible, chọn STANDARD/PRO, ví/nạp tiền/checkout và nhãn tiếng Việt. (REQ-SUB-10)
- [x] T16 — Thêm frontend route guard theo subscription để hỗ trợ UX, xử lý mất response/live expiry và mapping ProblemDetails; không coi guard là lớp bảo mật. (REQ-SUB-07, REQ-SUB-10)

## Test / Verification

- [x] T17 — Viết unit tests cho eligibility, 72 giờ UTC, paid history, live expiry, normalized identity, OTP state và idempotency fingerprint. (REQ-SUB-08, REQ-SUB-09)
- [ ] T18 — Viết integration tests cho rollback/retry, hai instance/concurrent register-activate, account qua tenant khác, tenant spoofing và audit duy nhất. (REQ-SUB-08, REQ-SUB-09, REQ-SUB-10)
- [ ] T19 — Viết integration tests backend gate/allowlist, callback signature/replay và backfill Trial/paid/mơ hồ. (REQ-SUB-10, REQ-SUB-11)
- [ ] T20 — Viết frontend tests cho hai intent, CTA, OTP retry, redirect, modal accessibility và trạng thái `NO_PLAN/ACTIVE/EXPIRED/PAID`. (REQ-SUB-07, REQ-SUB-10)
- [ ] T21 — Chạy backend build + unit/integration tests, frontend typecheck/lint/build/test; ghi kết quả thật ở bước `/sep-test`. (REQ-SUB-07..11)
