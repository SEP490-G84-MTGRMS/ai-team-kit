# Codebase Review: shift-and-business-day-closing

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa | Ghi chú |
|---|---|---|---|
| REQ-SBDC-01 | ShiftService, ShiftRepository.GetShiftSalesMetricsAsync | Revenue/refund và trạng thái paid | Recorded đang gộp nhiều nghĩa |
| REQ-SBDC-02 | ShiftService, ShiftsController | closing-preview, token, transaction | Chưa có preview/token |
| REQ-SBDC-03 | ShiftValidators, CloseShiftModal | Đồng bộ validation, bỏ receiver bắt buộc | Backend nullable, frontend bắt buộc |
| REQ-SBDC-04 | ShiftZReport.Discrepancy | DiscrepancyReason/ngưỡng | Chưa có lifecycle riêng |
| REQ-SBDC-05 | CASH_DRAW, ConfirmHandover, Cashbook | Chọn một mô hình transfer | Hai mô hình cạnh tranh |
| REQ-SBDC-06 | ShiftParticipant, RecordParticipantAsync | Event/unique index | Cần chống trùng |
| REQ-SBDC-07 | BusinessDateResolver, OrderService, PosShiftPage | Trả/dùng BusinessDate | UI tự tính; Order có cutoff hardcode |
| REQ-SBDC-08 | BusinessDayClosingService/Controller | Preview/current/FundCounts | Hiện chỉ một ActualCashCounted |
| REQ-SBDC-09 | CashbookPostingStatus, PostedAtUtc | Chống posting trùng | CloseAsync đang posting toàn bộ |
| REQ-SBDC-10 | BusinessDayClosing | Version/reopen/audit/reversal/guard | Unique index hiện ngăn nhiều version |
| REQ-SBDC-11 | CloseShiftModal, PosShiftPage | Tách khối UI và states | Còn nhãn kỹ thuật |
| REQ-SBDC-12 | ShiftManagementServiceTests, BusinessDayClosingServiceTests | Mở rộng test | Nền test backend sẵn có |

## Tái sử dụng được
- MT_GRMS.Application/Common/BusinessDateResolver.cs.
- Domain/Entities/Finance/ShiftZReport.cs và ShiftCashMovement.cs.
- Application/PosShifts/ShiftService.cs.
- Application/BusinessDays/BusinessDayClosingService.cs.
- UnitTests/ShiftManagementServiceTests.cs và BusinessDayClosingServiceTests.cs.
- Frontend CloseShiftModal.tsx và PosShiftPage.tsx.

## Xung đột / rủi ro
- [HIGH] Repository chốt ngày và một số shift query không lọc TenantId. → Bắt buộc tenant-aware signatures.
- [HIGH] Điểm posting design không khớp code. → Chọn một nguồn posting và recovery.
- [HIGH] Có hai mô hình transfer. → Chọn ShiftZReport handover là aggregate nguồn; CASH_DRAW chỉ cho rút két chủ động trong ca.
- [HIGH] Unique index ngày hiện không hỗ trợ version. → Đổi sang Tenant+Branch+Date+Version và một active version.
- [HIGH] Thiếu reversal/delta Cashbook. → Bổ sung ledger bất biến.
- [HIGH] Recorded chưa thể hiện rõ paid. → Định nghĩa Recorded là tiền đã thực chuyển; approval hoàn tất atomically.
- [MEDIUM] Có route đóng ca legacy Cashbook. → Deprecate hoặc áp dụng cùng guard.
- [MEDIUM] OrderService cutoff 06:00 hardcode. → Đọc Branch.BusinessDayStartTime.
- [MEDIUM] Frontend contract thiếu businessDate. → Sửa history/filter/detail callers.
- [MEDIUM] Posting không được nuốt exception. → Transaction/outbox và trạng thái Failed.

## Kết luận: Cần sửa specs
