# Guardian Review: shift-and-business-day-closing — Vòng 2

| Hạng mục | Tình trạng | Ghi chú |
|---|---|---|
| Multi-tenant | OK | Mọi query/command bắt buộc TenantId + BranchId và ownership; cross-tenant trả 404. |
| AuthN/AuthZ | OK | Quyền close/reopen/confirm fund và phạm vi ADMIN đã rõ. |
| Validation | OK | FundCounts, destination fund, VND integer UI, decimal backend và overflow đã rõ. |
| Toàn vẹn dữ liệu | OK | Transaction/outbox, opaque token, immutable ledger, reversal và version constraint đã rõ. |
| Vận hành & audit | OK | Audit append-only, idempotency scope/hash, correlation và safe ProblemDetails đã được yêu cầu. |

## Vấn đề đã xử lý
- [Đã xử lý HIGH] Tenant-aware repository và branch/fund isolation.
- [Đã xử lý HIGH] Reopen/reclose dùng reversal/adjustment, không sửa ledger cũ.
- [Đã xử lý HIGH] Central BusinessDayLockGuard bao phủ mutation endpoints/background jobs.
- [Đã xử lý HIGH] FundCounts là contract duy nhất và kiểm tra duplicate/ownership/active.
- [Đã xử lý HIGH] PreviewToken bao phủ mọi nguồn tài chính và kiểm tra trong transaction.
- [Đã xử lý HIGH] Reopen chọn mô hình một bước có đặc quyền và audit rõ ràng.

## Vấn đề còn lại
- [LOW] Cần cấu hình retention audit/idempotency khi triển khai. → Task backend phải dùng cấu hình thay vì hardcode.

## Kết luận: An toàn
