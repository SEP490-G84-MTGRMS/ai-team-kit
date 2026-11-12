# Guardian Review: homepage-trial-onboarding

## Kết quả vòng 1

Phát hiện HIGH về tenant spoofing qua header, thiếu backend gate, paid tenant quay lại Trial, OTP fail-open/in-memory, race condition và backfill trộn paid với Trial.

## Xử lý

Specs/design đã bắt buộc tenant claim + membership, backend gate, `FirstPaidAt`, OTP distributed fail-closed, conditional update/lock và backfill độc lập có dry-run.

## Re-review

Không còn HIGH bảo mật. Các lưu ý MEDIUM phải được đưa vào task triển khai:

- Idempotency scope theo actor + operation + tenant/challenge và request fingerprint.
- OTP challenge bind `NormalizedEmail` và payload hợp lệ.
- Payment callback vẫn xác minh chữ ký và chống replay, dù nằm trong allowlist.
- Migration report không chứa email/phone đầy đủ.

## Kết luận: An toàn
