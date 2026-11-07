# Tasks: payroll-management-backend

## Database & Entity Mapping
- [ ] T1 — Kiểm tra mapping cấu hình `PayslipConfiguration.cs` và đảm bảo index `(TenantId, EmployeeId, PeriodMonth)` sẵn sàng (REQ-PAY-03)

## Backend - Application Layer
- [ ] T2 — Tạo DTOs cho nghiệp vụ Payslip (`GeneratePayrollBatchRequest`, `PayPayslipRequest`, `BatchPayPayslipsRequest`, `PayslipQueryFilter`, `PayslipResponse`, `PayslipSummaryDto`, `BatchPayResultDto`) tại `MT_GRMS.Application/HR/Payslips/Dtos/PayslipDtos.cs` (REQ-PAY-01, REQ-PAY-04)
- [ ] T3 — Tạo Validators với FluentValidation cho các requests tại `MT_GRMS.Application/HR/Payslips/Validators/PayslipValidators.cs` (REQ-PAY-01, REQ-PAY-04)
- [ ] T4 — Định nghĩa Repository Interface `IPayslipRepository.cs` tại `MT_GRMS.Application/HR/Payslips/` (REQ-PAY-01, REQ-PAY-03)
- [ ] T5 — Định nghĩa Service Interface `IPayslipService.cs` tại `MT_GRMS.Application/HR/Payslips/` (REQ-PAY-01, REQ-PAY-02, REQ-PAY-03, REQ-PAY-04)
- [ ] T6 — Triển khai `PayslipService.cs`:
  - Động cơ tính toán lương tự động: `Monthly`, `Shift`, `Hourly`, OT 150%/200% (REQ-PAY-01)
  - Khấu trừ tạm ứng lương và chặn âm thực lĩnh (REQ-PAY-02)
  - Kiểm soát trùng lặp, bảo toàn phiếu lương đã thanh toán và xóa phiếu Unpaid (REQ-PAY-03)
  - Chi trả đơn lẻ và chi trả theo lô, tự động sinh phiếu chi Sổ quỹ (REQ-PAY-04)

## Backend - Infrastructure & API Layer
- [ ] T7 — Triển khai `PayslipRepository.cs` với EF Core tại `MT_GRMS.Infrastructure/Repositories/PayslipRepository.cs` (REQ-PAY-01, REQ-PAY-03)
- [ ] T8 — Đăng ký DI trong `MT_GRMS.Infrastructure/DependencyInjection.cs` cho `IPayslipRepository` và `IPayslipService` (REQ-PAY-01)
- [ ] T9 — Tạo `PayslipsController.cs` tại `MT_GRMS.Api/Controllers/PayslipsController.cs` với các endpoints: `GET`, `GET /{id}`, `POST /generate-batch`, `POST /{id}/pay`, `POST /batch-pay`, `DELETE /{id}` (REQ-PAY-01, REQ-PAY-04)

## Test & Verification
- [ ] T10 — Viết Unit Tests `PayslipServiceTests.cs` kiểm thử các kịch bản tính lương theo tháng có OT và BHXH, tính lương part-time ca/giờ, cấn trừ nợ tạm ứng, và chi trả sinh bút toán Sổ quỹ (REQ-PAY-01, REQ-PAY-02, REQ-PAY-03, REQ-PAY-04)
- [ ] T11 — Chạy `dotnet test` và `dotnet build` xác minh 100% tests PASS và 0 compile errors (REQ-PAY-01)
