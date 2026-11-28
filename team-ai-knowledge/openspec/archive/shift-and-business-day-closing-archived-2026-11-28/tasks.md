# Tasks: shift-and-business-day-closing

## DB

- [ ] T1 — Bổ sung trường discrepancy reason, closing/concurrency version và destination fund cho ShiftZReport; cấu hình nullable/default tương thích dữ liệu cũ (REQ-SBDC-02, REQ-SBDC-04, REQ-SBDC-05)
- [ ] T2 — Bổ sung version, supersedes/reopen fields và active-version semantics cho BusinessDayClosing; đổi unique index sang TenantId + BranchId + BusinessDate + Version (REQ-SBDC-10)
- [ ] T3 — Bổ sung liên kết transfer/adjustment/reversal và audit append-only cần thiết cho Cashbook; unique ClosingId chống tạo trùng (REQ-SBDC-05, REQ-SBDC-09, REQ-SBDC-10)
- [ ] T4 — Thêm/kiểm tra unique index ShiftParticipant theo ShiftId + UserId và migration/backfill an toàn (REQ-SBDC-06)
- [ ] T5 — Tạo EF Core migration mới, review SQL/backfill/index và không sửa migration đã merge (REQ-SBDC-05, REQ-SBDC-10, REQ-SBDC-12)

## Domain / Application Backend

- [ ] T6 — Chuẩn hóa state machine ShiftCashMovement: Recorded là tiền đã thực chuyển; approve + record atomic, trạng thái khác không ảnh hưởng két (REQ-SBDC-01)
- [ ] T7 — Chuẩn hóa tính doanh thu thuần từ order/payment/discount/void/partial/full return/refund khác phương thức (REQ-SBDC-01)
- [ ] T8 — Tạo closing preview DTO/service gồm breakdown doanh thu, dòng tiền, blockers, participants và opaque PreviewToken (REQ-SBDC-02, REQ-SBDC-06)
- [ ] T9 — Đồng bộ validation request chốt ca: VND integer, giới hạn tiền, allocation, notes/reasons, receiver optional, destination fund ownership (REQ-SBDC-03, REQ-SBDC-05)
- [ ] T10 — Bổ sung discrepancy workflow: lý do cho mọi lệch, manager approval khi vượt ngưỡng, audit/idempotency (REQ-SBDC-04)
- [ ] T11 — Chuẩn hóa shift handover transfer state PendingReceipt/Received/Cancelled-Disputed và quỹ trung gian; CASH_DRAW chỉ dùng trong ca mở (REQ-SBDC-05)
- [ ] T12 — Upsert participants từ các event quy định và kế thừa retained float/opening discrepancy cho ca sau (REQ-SBDC-06)
- [ ] T13 — Trả BusinessDate trong shift DTO; sửa Order/shiftless flows dùng Branch.BusinessDayStartTime thay cutoff hardcode (REQ-SBDC-07)
- [ ] T14 — Tạo BusinessDay preview/current DTO/service với FundCounts, fund breakdown, blockers chi tiết và PreviewToken (REQ-SBDC-08)
- [ ] T15 — Sửa BusinessDayClosingService chỉ tổng hợp ca Posted, chỉ posting đơn ngoài ca chưa posting và xử lý Failed/Partial an toàn (REQ-SBDC-09)
- [ ] T16 — Thực hiện reopen/reclose versioning với immutable ledger, reversal/adjustment delta và audit append-only (REQ-SBDC-10)
- [ ] T17 — Tạo BusinessDayLockGuard dùng chung và tích hợp vào order/payment/void/return/refund/preorder/debt/movement/handover/cashbook/background jobs (REQ-SBDC-10)
- [ ] T18 — Chuẩn hóa idempotency scope + payload hash và transaction/concurrency token cho confirm-close/close-day/reopen (REQ-SBDC-02, REQ-SBDC-09, REQ-SBDC-10)
- [ ] T19 — Sửa mọi shift/business-day repository query nhận TenantId từ context, lọc TenantId + BranchId và kiểm tra branch/fund ownership (REQ-SBDC-06, REQ-SBDC-08, REQ-SBDC-12)

## API

- [ ] T20 — Thêm GET shift closing-preview và cập nhật confirm-close contract/ProblemDetails; deprecate hoặc chuyển route đóng ca legacy qua cùng service/guard (REQ-SBDC-02, REQ-SBDC-03)
- [ ] T21 — Thêm business-days current/preview/history/reopen endpoints và đổi close request sang FundCounts + PreviewToken (REQ-SBDC-08, REQ-SBDC-10)
- [ ] T22 — Áp dụng RBAC, tenant/branch/fund ownership, safe ProblemDetails và idempotency cho toàn bộ endpoint mới/sửa (REQ-SBDC-05, REQ-SBDC-08, REQ-SBDC-12)

## Frontend

- [ ] T23 — Cập nhật posShift types/API cho BusinessDate, closing preview/token, discrepancy reason, optional receiver, destination fund và ProblemDetails (REQ-SBDC-02, REQ-SBDC-03, REQ-SBDC-07)
- [ ] T24 — Tái cấu trúc CloseShiftModal thành bốn khối nghiệp vụ, bỏ nhãn kỹ thuật và hiển thị participants/drill-down (REQ-SBDC-01, REQ-SBDC-06, REQ-SBDC-11)
- [ ] T25 — Viết validation đầy đủ mọi trường chốt ca, auto-select quỹ đích, lý do chênh lệch và manager approval state (REQ-SBDC-03, REQ-SBDC-04, REQ-SBDC-05)
- [ ] T26 — Xử lý loading/empty/error/409, giữ draft local khi stale preview, chống double submit và accessibility/responsive POS (REQ-SBDC-11)
- [ ] T27 — Cập nhật PosShiftPage dùng BusinessDate backend, không suy từ openedAtUtc; sửa history/filter/detail callers (REQ-SBDC-07)
- [ ] T28 — Xây khối preview chốt ngày theo FundCounts, doanh thu/thu chi/transfer/quỹ và blocker có ActionPath (REQ-SBDC-08, REQ-SBDC-11)
- [ ] T29 — Thêm lịch sử version và dialog reopen với lý do; bỏ thông báo sai rằng chốt ngày tạo lại phiếu thu/chi (REQ-SBDC-09, REQ-SBDC-10)
- [ ] T30 — Đồng bộ mọi thông báo tiếng Việt, định dạng VND raw-safe, focus lỗi đầu tiên, keyboard/aria và modal cuộn (REQ-SBDC-03, REQ-SBDC-11)

## Test

- [ ] T31 — Unit test ShiftService cho revenue vs cash, movement states, refund khác phương thức, allocation và optional receiver (REQ-SBDC-01, REQ-SBDC-03)
- [ ] T32 — Unit test preview/token, stale conflict, idempotency payload mismatch và concurrent movement approval/close (REQ-SBDC-02)
- [ ] T33 — Unit test discrepancy threshold/approval, transfer state/reversal và participant/opening chain (REQ-SBDC-04, REQ-SBDC-05, REQ-SBDC-06)
- [ ] T34 — Unit test BusinessDate trước/sau cutoff, ca kéo qua cutoff và order ngoài ca dùng branch config (REQ-SBDC-07)
- [ ] T35 — Unit test BusinessDay preview/FundCounts/blockers/posting matrix và không posting trùng (REQ-SBDC-08, REQ-SBDC-09)
- [ ] T36 — Unit test reopen/reclose version, delta adjustment, lock guard cho từng write path và rollback/retry (REQ-SBDC-10)
- [ ] T37 — Unit/integration test role, tenant/branch/fund isolation và safe ProblemDetails (REQ-SBDC-12)
- [ ] T38 — Frontend tests cho validation từng trường, BusinessDate, stale draft, blockers, labels và accessibility states (REQ-SBDC-03, REQ-SBDC-07, REQ-SBDC-11)
- [ ] T39 — Chạy dotnet build/test backend, npm build/lint/test frontend và sửa mọi hồi quy liên quan (REQ-SBDC-12)
