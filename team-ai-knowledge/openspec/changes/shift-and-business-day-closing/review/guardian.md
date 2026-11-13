# Guardian Review: shift-and-business-day-closing

| Hạng mục | Tình trạng | Ghi chú |
|---|---|---|
| Multi-tenant | Thiếu | Repository hiện chỉ lọc BranchId/BusinessDate. |
| AuthN/AuthZ | Rủi ro | Chưa xác minh branch/fund ownership và phạm vi ADMIN. |
| Validation | Rủi ro | Contract FundCounts và quỹ hợp lệ chưa xác định. |
| Toàn vẹn dữ liệu | Thiếu | Reopen, lock guard và token chưa đầy đủ. |
| Vận hành & audit | Rủi ro | Idempotency scope, audit append-only và quyền reopen chưa rõ. |

## Vấn đề
- [HIGH] REQ-SBDC-08/12 chưa bắt buộc repository lọc TenantId + BranchId. → Mọi query lấy tenant từ context, kiểm tra ownership, tài nguyên khác tenant trả 404.
- [HIGH] REQ-SBDC-10 thiếu ledger reversal/adjustment. → Không sửa entry cũ; posting delta liên kết OriginalEntryId và version.
- [HIGH] Khóa ngày chưa bao phủ mọi mutation endpoint. → Central BusinessDayLockGuard cho mọi write path.
- [HIGH] Contract kiểm đếm ngày còn mơ hồ. → FundCounts[] duy nhất; kiểm tra duplicate, active, tenant/branch.
- [HIGH] Token preview chưa bao phủ refund, payment, handover và movement. → Token opaque bị invalidate bởi mọi nguồn.
- [HIGH] Mô hình reopen chưa chốt separation of duties. → Chọn rõ mô hình và audit.
- [MEDIUM] Idempotency chưa có scope/payload hash. → Unique theo tenant+actor+route+key, payload khác trả 409.
- [MEDIUM] DestinationFundId thiếu ownership/status/source khác destination. → Bổ sung validation/scenario.
- [MEDIUM] Giới hạn tiền và rounding chưa chốt. → Cấm silent rounding/overflow.
- [MEDIUM] Audit reopen cần append-only, correlation, before/after hash và retention.
- [LOW] ProblemDetails không được lộ stack trace/SQL/PII.

## Kết luận: Cần sửa
