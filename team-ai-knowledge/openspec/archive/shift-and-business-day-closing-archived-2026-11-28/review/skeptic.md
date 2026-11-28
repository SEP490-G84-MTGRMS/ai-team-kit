# Skeptic Review: shift-and-business-day-closing — Vòng 2

| Chiều | Điểm (1–5) | Nhận xét |
|---|---:|---|
| D1 Completeness | 5 | Đã có contract theo quỹ, state machine tiền mặt/chuyển quỹ, posting matrix, lock guard, reopen và UI edge cases. |
| D2 Correctness | 5 | Công thức doanh thu/két, ledger bất biến, delta posting và refund khác phương thức đã rõ. |
| D3 Coherence | 4 | Proposal, design và specs thống nhất; mục normative A–L được ưu tiên khi diễn đạt cũ khác biệt. |
| D4 Constraints | 5 | Tenant isolation, quyền, decimal, idempotency, concurrency và audit đã định nghĩa đủ để triển khai/test. |
| D5 Blast Radius | 4 | Blast radius lớn nhưng đã liệt kê write paths, legacy route, migration và frontend callers. |

## Vấn đề đã xử lý
- [Đã xử lý HIGH] Chốt ngày dùng duy nhất FundCounts theo quỹ; tiền đang bàn giao là quỹ trung gian.
- [Đã xử lý HIGH] Ledger bất biến; reopen dùng reversal/adjustment và reclose chỉ posting delta.
- [Đã xử lý HIGH] Recorded được định nghĩa là thời điểm tiền thực sự giao/nhận.
- [Đã xử lý HIGH] Chuyển quỹ dùng một aggregate/state machine và unique ClosingId.
- [Đã xử lý HIGH] BusinessDayLockGuard bao phủ mọi write path liên quan.
- [Đã xử lý HIGH] Doanh thu thuần bao phủ discount, void, partial/full return và refund khác phương thức.
- [Đã xử lý HIGH] Posting matrix và recovery Failed/Partial đã rõ.
- [Đã xử lý HIGH] Tenant-aware repository và branch/fund ownership đã bắt buộc.

## Vấn đề còn lại
- [LOW] Mục normative A–L khá dài. → Khi archive nên hợp nhất vào requirement tương ứng để spec gốc dễ đọc.

## Kết luận: Chấp nhận
