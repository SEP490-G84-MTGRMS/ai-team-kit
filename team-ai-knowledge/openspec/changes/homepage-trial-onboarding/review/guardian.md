# Guardian Review: homepage-trial-onboarding

## Vấn đề

- [HIGH] Resolver hiện tin `X-Tenant-Id` và fallback tenant đầu tiên; có nguy cơ truy cập chéo tenant. Endpoint Trial chỉ được dùng tenant claim và membership Store Owner đang hoạt động.
- [HIGH] Frontend route guard không đủ; backend phải chặn mọi API nghiệp vụ với `NO_PLAN` hoặc Trial hết hạn, chỉ allowlist account/auth/subscription/payment cần thiết.
- [HIGH] Thiếu dấu `HasEverPaid`/`FirstPaidAt`; tenant từng trả phí hết hạn có thể quay lại Trial.
- [HIGH] OTP có đường fail-open, email giả và `DevOtpCode`; production phải bắt buộc email thật, challenge hợp lệ và không lộ OTP.
- [HIGH] OTP in-memory không an toàn đa instance, verify/remove không nguyên tử. Cần hash trong distributed cache/DB, TTL, counter và compare-and-consume nguyên tử.
- [HIGH] Trial concurrency chưa có cơ chế DB cụ thể. Cần conditional update/lock theo thứ tự cố định, audit/idempotency cùng transaction.
- [HIGH] Backfill Trial và paid-history đang trộn lẫn; phải tách `TrialConsumedAt` khỏi `HasEverPaid`, dry-run và cô lập dữ liệu mơ hồ.
- [MEDIUM] Cần normalized email/phone và unique index kể cả soft-delete.
- [MEDIUM] OTP chỉ consume sau commit hoặc có trạng thái reserved có thể rollback.
- [MEDIUM] IP audit chỉ tin forwarded headers từ trusted proxy.
- [MEDIUM] Không tiết lộ `TRIAL_ALREADY_USED` trước khi người dùng xác minh sở hữu định danh.

## Kết luận

Cần sửa.
