# Skeptic Review: payroll-management-backend

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ toàn diện 7 REQ: các công thức 3 loại hình lương (`Monthly`, `Shift`, `Hourly`), nạp giờ OT hệ số 1.5/2.0 chỉ từ ca được duyệt, liên thông bảo toàn ngày công nghỉ phép có lương `PAID_LEAVE`, công nhận công sau giải trình sự cố chấm công `INCIDENT_RESOLVED`, cấn trừ nợ tạm ứng và sinh phiếu chi Sổ quỹ. |
| D2 Correctness | 5/5 | Logic nghiệp vụ khớp chính xác với luật lao động Việt Nam (BHXH 10.5% chỉ tính lương tháng, OT 150%/200%), quy đổi công chuẩn mẫu số 8.0 giờ, công thức làm tròn số học rõ ràng, cộng gộp `PaidLeaveDays` vào công chuẩn chính xác. |
| D3 Coherence | 5/5 | Thống nhất tuyệt đối giữa `DacTa_NghiepVu_QuanLyNhanVien.md`, `specs.md`, `ScheduleApprovalRequest` và `PayslipService`. |
| D4 Constraints | 5/5 | Tuân thủ triệt để Clean Architecture 4 tầng, Repository Pattern, bảo mật cô lập TenantId, hạch toán giao dịch với IUnitOfWork. |
| D5 Blast Radius | 5/5 | Không làm thay đổi cấu trúc bảng Payslips hiện có, chỉ ghi thêm bút toán hợp lệ vào CashbookTransactions, liên thông mượt mà qua các enum trạng thái sẵn có của EmployeeSchedule. |

## Vấn đề
- [RESOLVED] REQ-PAY-04: Trong kịch bản chi trả hàng loạt (`BatchPayPayslipsRequest`), cần làm rõ việc nếu có 1 phiếu trong danh sách bị lỗi hoặc đã thanh toán trước đó thì rollback toàn bộ hay chi trả các phiếu hợp lệ còn lại?
  - *Giải pháp*: Xử lý theo cơ chế Best-effort trả về `BatchPayResultDto` ghi nhận số lượng thành công `SuccessCount`, số lượng thất bại `FailedCount` và danh sách chi tiết mã phiếu lỗi.
- [RESOLVED] REQ-PAY-05 & REQ-PAY-07: Đảm bảo chỉ các ca nghỉ phép và làm thêm giờ có `ApprovalStatus == Approved` mới được cộng vào công và quỹ lương.
  - *Giải pháp*: `GetCompletedSchedulesInPeriodAsync` đã bổ sung điều kiện lọc `(s.Status == ScheduleStatus.Completed || (s.Status == ScheduleStatus.OnLeave && s.ApprovalStatus == ScheduleApprovalStatus.Approved))` và `PayslipService` chỉ tính OT khi `sch.ApprovalStatus == ScheduleApprovalStatus.Approved`.

## Đã xử lý
- Đã quy định rõ cơ chế `BatchPayResultDto` trong design-brief và service contract.
- Đã liên thông toàn diện giữa hệ thống Phiếu yêu cầu ca làm việc và Động cơ tính bảng lương tháng.

## Kết luận: Chấp nhận (PASS)
Specs và thiết kế liên thông đã hoàn toàn chặt chẽ, tối ưu và sẵn sàng.
