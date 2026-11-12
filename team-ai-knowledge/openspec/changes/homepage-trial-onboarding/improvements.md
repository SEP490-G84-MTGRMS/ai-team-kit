# Improvements: homepage-trial-onboarding

## Spec · 2026-11-12 08:02

Ở bước brainstorm và verify-spec phải mô hình hóa rõ state machine Trial và kiểm thử idempotency: chỉ PlanCode TRIAL, thời hạn cố định 3 ngày theo backend.

## Brainstorm · 2026-11-12 08:24

Bước verify-spec cần phản biện kỹ race condition khi hai request Trial đồng thời, backfill account/tenant cũ, route guard NO_PLAN và khả năng lách giới hạn bằng tenant/account khác.
