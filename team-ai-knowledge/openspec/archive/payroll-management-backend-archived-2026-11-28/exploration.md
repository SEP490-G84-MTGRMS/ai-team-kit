# EXP-2026-11-07-001: Exploration - Payroll Management Backend

## 1. Problem Statement
Hệ thống MT-GRMS hiện đã có cấu hình ca (`ShiftConfigs`), dữ liệu chấm công hoàn tất (`EmployeeSchedules`), thông tin lương nhân viên (`Employees`), và bút toán sổ quỹ (`CashbookTransactions`). Tuy nhiên, backend hoàn toàn thiếu tầng Application, Repository và API để tự động kết chuyển dữ liệu chấm công sang Bảng tính lương tháng (`Payslip`), khấu trừ tạm ứng, trích đóng BHXH (10.5%), tính tiền làm thêm giờ (OT) có phê duyệt, và tự động sinh phiếu chi Sổ quỹ khi thanh toán lương.

## 2. Context & Background
- **Hiện trạng code liên quan**:
  - Entity `Payslip` (`MT_GRMS.Domain.Entities.HR.Payslip`) đã được định nghĩa đầy đủ các trường tài chính: snapshot hợp đồng (`SalaryType`, `BaseRate`, `StandardDays`, `StandardDayHours`), thống kê công (`WorkedDays`, `TotalWorkHours`, `TotalShifts`, `OtHours`), thu nhập (`BaseSalaryEarned`, `OvertimePay`, `TotalAllowance`, `TotalEarnings`), giảm trừ (`AdvanceDeduction`, `RemainingDebt`, `SocialInsurance`, `TotalDeductions`), thực lĩnh (`NetSalary`), và tích hợp sổ quỹ (`CashbookTransactionId`, `CashbookVoucherCode`).
  - Phân hệ chấm công `EmployeeSchedule` lưu trữ các ca đã hoàn tất (`Status = Completed`), có `ActualWorkHours` và `OvertimeMinutes`.
  - Phân hệ chính sách `BranchAttendancePolicy` đã được dọn dẹp các trường ngưỡng OT; OT chỉ được tính khi có đơn được phê duyệt.
  - Sổ quỹ `CashbookTransaction` sẵn sàng tiếp nhận phiếu chi loại `EXPENSE`.
- Tài liệu tham chiếu: [`doc/Prompt_TrienKhai_Payroll_Management.md`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Prompt_TrienKhai_Payroll_Management.md) và [`doc/Require/Nhan Vien/DacTa_NghiepVu_QuanLyNhanVien.md`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Require/Nhan%20Vien/DacTa_NghiepVu_QuanLyNhanVien.md).

## 3. Constraints
- **Kiến trúc**: Tuân thủ triệt để Clean Architecture 4 tầng (.NET 8): Domain -> Application -> Infrastructure -> API.
- **Repository Pattern & Service Pattern**: Controller không xử lý logic trực tiếp, sử dụng DTOs và FluentValidation.
- **Quy tắc tính lương chuẩn**:
  - Hợp đồng tháng (`Monthly`): $\text{BaseSalaryEarned} = \text{Round}\left(\frac{\text{WorkedDays}}{\text{StandardDays}} \times \text{BaseRate}\right)$, trích BHXH 10.5%.
  - Hợp đồng ca (`Shift`): $\text{BaseSalaryEarned} = \text{TotalShifts} \times \text{BaseRate}$, không trích BHXH.
  - Hợp đồng giờ (`Hourly`): $\text{BaseSalaryEarned} = \text{Round}(\text{TotalWorkHours} \times \text{BaseRate})$, không trích BHXH.
  - Làm thêm giờ (OT): Ngày thường 150%, ngày nghỉ hằng tuần/Chủ nhật 200%. Chặn trần thời gian làm việc tối đa 12 giờ/ngày.
- **Bảo toàn dữ liệu tài chính**: Không xóa phiếu lương đã thanh toán (`Status = Paid`); tính toán lại phải giữ tính idempotent.
- **Multi-tenancy**: Mọi truy vấn bắt buộc cô lập theo `TenantId`.

## 4. Assumptions
- **[ASSUMPTION-01]**: Mỗi nhân viên chỉ có 1 phiếu lương hợp lệ cho mỗi kỳ tháng (`PeriodMonth` dạng `yyyy-MM`). Nếu tính lại trong khi phiếu đang `Unpaid`, hệ thống sẽ cập nhật lại số liệu mới nhất.
- **[ASSUMPTION-02]**: Các ca làm việc được tính công phải có trạng thái `ScheduleStatus.Completed`.
- **[ASSUMPTION-03]**: Giờ làm thêm (`OtHours`) chỉ được tính từ các ca có phê duyệt hoặc số giờ làm thêm dôi ra hợp lệ theo quy chế cửa hàng.

## 5. Scope & Non-Goals
### In Scope
- Xây dựng trọn vẹn backend: `PayslipDtos`, `PayslipValidators`, `IPayslipRepository`, `PayslipRepository`, `IPayslipService`, `PayslipService`, và `PayslipsController`.
- Hỗ trợ tính lương đơn lẻ và tính lương hàng loạt (`GenerateMonthlyPayrollAsync`).
- Xử lý chi trả đơn lẻ và chi trả hàng loạt (`BatchPayPayslipsAsync`), tự động ghi nhận phiếu chi `CashbookTransaction` tương ứng.
- Viết Unit Tests kiểm thử toàn bộ các nhánh logic tính lương.

### Out of Scope (Non-Goals)
- Không can thiệp sửa đổi UI Frontend trong change này (tập trung độc lập backend).
- Không tự động kết nối API ngân hàng thực tế để chuyển khoản tự động (thanh toán được xác nhận thông qua tiền mặt hoặc mã quét VietQR).
- Không tính thuế TNCN bậc thang lũy tiến phức tạp.

## 6. So sánh các Phương án Kiến trúc
- **Phương án 1 (Transaction Script trực tiếp trong Service)**: Viết toàn bộ câu truy vấn và logic cấn trừ trực tiếp trong `PayslipService`.
  - *Ưu điểm*: Viết nhanh, ít file.
  - *Nhược điểm*: Vi phạm Single Responsibility, khó viết Unit Test độc lập cho tầng tính toán lương, khó mở rộng khi thêm các chính sách thưởng/phạt.
- **Phương án 2 (Tách biệt Repository + Calculation Engine Module trong Clean Architecture - ĐƯỢC CHỌN)**:
  - Repository chịu trách nhiệm truy vấn nạp dữ liệu với eager loading tối ưu (`AsNoTracking`).
  - Service đóng vai trò điều phối nghiệp vụ (`Orchestrator`), kết hợp động cơ tính toán công thức lương rõ ràng.
  - Tích hợp UnitOfWork đảm bảo tính toàn vẹn khi vừa đổi trạng thái Payslip vừa ghi nhận CashbookTransaction.
  - *Lý do chọn*: Đáp ứng chuẩn mực thiết kế của MT-GRMS, kiểm thử độc lập 100%, bảo mật dòng tiền.

## 7. Rủi ro & Cách giảm thiểu
- **Rủi ro tính toán sai lệch tiền lẻ do làm tròn số học**:
  - *Cách xử lý*: Sử dụng `decimal` cho toàn bộ các phép tính tiền tệ, làm tròn chuẩn `MidpointRounding.AwayFromZero` ở các bước kết luận thu nhập.
- **Rủi ro tranh chấp trạng thái khi thanh toán đồng thời (Concurrency)**:
  - *Cách xử lý*: Kiểm tra nghiêm ngặt `Status == Unpaid` trước khi cho phép chi trả và bọc trong giao dịch `UnitOfWork`.
