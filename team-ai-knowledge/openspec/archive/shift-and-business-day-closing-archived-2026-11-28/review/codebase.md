# Codebase Review: shift-and-business-day-closing — Vòng 2

## Bản đồ ảnh hưởng
| Nhóm | File/module chính | Hướng triển khai |
|---|---|---|
| Shift | ShiftService, ShiftRepository, ShiftsController, ShiftDtos/Validators | Preview, token, discrepancy, participant và transfer state |
| Business day | BusinessDayClosingService/Repository/Controller/DTO | Preview, FundCounts, tenant filter, version/reopen/delta |
| Domain/DB | ShiftZReport, ShiftCashMovement, BusinessDayClosing, Cashbook entries/configurations | Trường mới, index/version, adjustment linkage, migration |
| Write guards | Order/Payment/Return/Preorder/Debt/Cashbook services | BusinessDayLockGuard dùng chung |
| Frontend | CloseShiftModal, PosShiftPage, posShiftApi/types | Contract mới, validation, UX và BusinessDate |
| Tests | ShiftManagementServiceTests, BusinessDayClosingServiceTests, frontend tests | Công thức, isolation, concurrency và validation |

## Tái sử dụng được
- BusinessDateResolver, Shift lifecycle hiện tại, CashMovement approval, BusinessDay transaction và bộ unit test hiện hữu.
- CloseShiftModal và PosShiftPage được tái cấu trúc, không viết lại toàn bộ.

## Vấn đề đã xử lý
- [Đã xử lý HIGH] Spec bắt buộc tenant-aware repository signatures.
- [Đã xử lý HIGH] Chốt ngày không posting lại ca Posted; lỗi posting không bị nuốt.
- [Đã xử lý HIGH] Shift handover là nguồn transfer chuẩn; CASH_DRAW chỉ cho rút chủ động trong ca.
- [Đã xử lý HIGH] Index version và một active version đã được chốt.
- [Đã xử lý HIGH] Reversal/delta Cashbook đã có quy tắc.
- [Đã xử lý HIGH] Recorded được định nghĩa máy đọc được.

## Rủi ro còn lại
- [MEDIUM] Blast radius của BusinessDayLockGuard lớn. → Triển khai theo từng write path và test hồi quy trước khi bật bắt buộc.
- [MEDIUM] Route legacy có thể còn caller. → Tìm caller, deprecate có tương thích hoặc chuyển tiếp cùng service.
- [LOW] Cần migration/backfill an toàn cho dữ liệu cũ.

## Kết luận: Khả thi
