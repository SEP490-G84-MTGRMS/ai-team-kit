# Tasks: payroll-management-backend

## Database & Entity Mapping
- [x] T1 — Kiểm tra mapping cấu hình `PayslipConfiguration.cs` và đảm bảo index `(TenantId, EmployeeId, PeriodMonth)` sẵn sàng (REQ-PAY-03)

## Backend - Application Layer
- [x] T2 — Tạo DTOs cho nghiệp vụ Payslip (`GeneratePayrollBatchRequest`, `PayPayslipRequest`, `BatchPayPayslipsRequest`, `PayslipQueryFilter`, `PayslipResponse`, `PayslipSummaryDto`, `BatchPayResultDto`) tại `MT_GRMS.Application/HR/Payslips/Dtos/PayslipDtos.cs` (REQ-PAY-01, REQ-PAY-04)
- [x] T3 — Tạo Validators với FluentValidation cho các requests tại `MT_GRMS.Application/HR/Payslips/Validators/PayslipValidators.cs` (REQ-PAY-01, REQ-PAY-04)
- [x] T4 — Định nghĩa Repository Interface `IPayslipRepository.cs` tại `MT_GRMS.Application/HR/Payslips/` (REQ-PAY-01, REQ-PAY-03)
- [x] T5 — Định nghĩa Service Interface `IPayslipService.cs` tại `MT_GRMS.Application/HR/Payslips/` (REQ-PAY-01, REQ-PAY-02, REQ-PAY-03, REQ-PAY-04)
- [x] T6 — Triển khai `PayslipService.cs`:
  - Động cơ tính toán lương tự động: `Monthly`, `Shift`, `Hourly`, OT 150%/200% (REQ-PAY-01)
  - Khấu trừ tạm ứng lương và chặn âm thực lĩnh (REQ-PAY-02)
  - Kiểm soát trùng lặp, bảo toàn phiếu lương đã thanh toán và xóa phiếu Unpaid (REQ-PAY-03)
  - Chi trả đơn lẻ và chi trả theo lô, tự động sinh phiếu chi Sổ quỹ (REQ-PAY-04)

## Backend - Infrastructure & API Layer
- [x] T7 — Triển khai `PayslipRepository.cs` với EF Core tại `MT_GRMS.Infrastructure/Repositories/PayslipRepository.cs` (REQ-PAY-01, REQ-PAY-03)
- [x] T8 — Đăng ký DI trong `MT_GRMS.Infrastructure/DependencyInjection.cs` cho `IPayslipRepository` và `IPayslipService` (REQ-PAY-01)
- [x] T9 — Tạo `PayslipsController.cs` tại `MT_GRMS.Api/Controllers/PayslipsController.cs` với các endpoints: `GET`, `GET /{id}`, `POST /generate-batch`, `POST /{id}/pay`, `POST /batch-pay`, `DELETE /{id}` (REQ-PAY-01, REQ-PAY-04)

## Liên thông Phiếu yêu cầu Ca làm việc (Schedule Approval Integration)
- [x] T10 — Cập nhật `ScheduleApprovalService.cs`: Gán `ApprovalStatus = Approved`, `ApprovalType = "OVERTIME"` / `"INCIDENT_RESOLVED"` / `"PAID_LEAVE"`, cập nhật `Status = Completed` cho ca sự cố chấm công khi phê duyệt (REQ-PAY-05, REQ-PAY-06, REQ-PAY-07)
- [x] T11 — Cập nhật `ScheduleRepository.cs`: Mở rộng `GetCompletedSchedulesInPeriodAsync` quét cả ca `Completed` và ca `OnLeave` đã duyệt (REQ-PAY-05)
- [x] T12 — Cập nhật `PayslipService.cs`: Cộng `PaidLeaveDays` vào công hưởng lương cho `Monthly`, `Shift`, `Hourly`, chỉ tính OT khi ca có `ApprovalStatus == Approved` (REQ-PAY-05, REQ-PAY-07)

## Test & Verification
- [x] T13 — Viết Unit Tests `PayslipServiceTests.cs` kiểm thử các kịch bản tính lương theo tháng có OT và BHXH, tính lương part-time ca/giờ, cấn trừ nợ tạm ứng, và chi trả sinh bút toán Sổ quỹ (REQ-PAY-01, REQ-PAY-02, REQ-PAY-03, REQ-PAY-04)
- [x] T14 — Chạy `dotnet test` và `dotnet build` xác minh 100% tests PASS và 0 compile errors (REQ-PAY-01, REQ-PAY-05, REQ-PAY-06, REQ-PAY-07)
