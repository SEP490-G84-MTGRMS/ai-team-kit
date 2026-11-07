# Design Brief: payroll-management-backend

## 1. Luồng nghiệp vụ & Tương tác API
1. **Khởi tạo Bảng lương tháng (`POST /api/v1/payslips/generate-batch`)**:
   - Client gửi `PeriodMonth` (`yyyy-MM`), `BranchId` (tùy chọn hoặc toàn bộ), `SalaryTypeFilter` (tùy chọn), `Note`.
   - Backend quét các nhân viên `Active` trong phạm vi, truy vấn danh sách `EmployeeSchedules` đã `Completed` trong tháng.
   - Tính toán công quy đổi (`WorkedDays`), giờ làm (`ActualWorkHours`), số ca (`TotalShifts`), giờ OT (`OtHours`), phụ cấp (`AllowancesDetailJson`), giảm trừ BHXH (10.5% cho `Monthly`), tạm ứng nợ cũ.
   - Tạo hoặc cập nhật lại bản ghi `Payslips` ở trạng thái `Unpaid`.
2. **Truy vấn danh sách & lọc (`GET /api/v1/payslips`)**:
   - Hỗ trợ phân trang (`page`, `pageSize`), tìm kiếm theo từ khóa tên/mã nhân viên, lọc theo kỳ tháng `PeriodMonth`, Chi nhánh `BranchId`, và Trạng thái `Status` (`Unpaid`, `Paid`, `Cancelled`).
3. **Xem chi tiết phiếu lương (`GET /api/v1/payslips/{id}`)**:
   - Trả về toàn bộ thông tin chi tiết: snapshot lương, thống kê công, thu nhập chi tiết, giảm trừ bóc tách (BHXH, BHYT, BHTN, tạm ứng), thông tin tài khoản ngân hàng nhân viên.
4. **Chi trả phiếu lương (`POST /api/v1/payslips/{id}/pay` & `POST /api/v1/payslips/batch-pay`)**:
   - Client gửi hình thức thanh toán `PaymentMethod` (`CASH`, `VIETQR`, `BANK_TRANSFER`), `Note`, `CashbookAccountId` (tùy chọn).
   - Kiểm tra trạng thái phiếu lương phải là `Unpaid`.
   - Cập nhật phiếu lương: `Status = Paid`, `PaidAt = UtcNow`, `PaidBy = CurrentUserId`.
   - Tự động sinh bản ghi `CashbookTransaction` loại `EXPENSE`, số tiền bằng `NetSalary`, sinh mã phiếu chi dạng `PC-yyyyMM-xxxx`.
   - Ghi nhận `CashbookTransactionId` và `CashbookVoucherCode` vào phiếu lương.

## 2. API Contract & Data Transfer Objects (DTOs)
### DTOs Request & Response
- **`GeneratePayrollBatchRequest`**:
  - `string PeriodMonth` (bắt buộc, format `yyyy-MM`)
  - `Guid? BranchId`
  - `SalaryType? SalaryTypeFilter`
  - `string? Note`
- **`PayPayslipRequest`**:
  - `string PaymentMethod` (bắt buộc, một trong các giá trị: `CASH`, `VIETQR`, `BANK_TRANSFER`)
  - `string? Note`
  - `Guid? CashbookAccountId`
- **`BatchPayPayslipsRequest`**:
  - `List<Guid> PayslipIds` (bắt buộc, ít nhất 1 id)
  - `string PaymentMethod`
  - `string? Note`
- **`PayslipQueryFilter`**:
  - `string? Keyword`
  - `string? PeriodMonth`
  - `Guid? BranchId`
  - `PayslipStatus? Status`
  - `int Page = 1`, `int PageSize = 20`
- **`PayslipResponse`**:
  - `Guid Id`, `string PayslipCode`, `string PeriodMonth`, `Guid BranchId`, `string BranchName`, `Guid EmployeeId`, `string EmployeeCode`, `string EmployeeName`
  - `SalaryType SalaryType`, `decimal BaseRate`, `decimal StandardDays`, `decimal StandardDayHours`
  - `decimal WorkedDays`, `decimal TotalWorkHours`, `int TotalShifts`, `decimal OtHours`
  - `decimal BaseSalaryEarned`, `decimal OvertimePay`, `decimal TotalAllowance`, `string AllowancesDetailJson`, `decimal TotalEarnings`
  - `decimal AdvanceDeduction`, `decimal RemainingDebt`, `decimal SocialInsurance`, `decimal TotalDeductions`, `decimal NetSalary`
  - `decimal BhxhAmount` (8%), `decimal BhytAmount` (1.5%), `decimal BhtnAmount` (1%)
  - `PayslipStatus Status`, `DateTime? PaidAt`, `string? PaymentMethod`, `string? PaidBy`, `Guid? CashbookTransactionId`, `string? CashbookVoucherCode`
  - `string? BankName`, `string? BankAccountNumber`, `string? BankAccountHolder`

## 3. Database Schema & Persistence
- Sử dụng bảng hiện có `Payslips` đã cấu hình trong EF Core:
  - Khóa chính: `Id (Guid)`
  - Ràng buộc Unique Index: `(TenantId, EmployeeId, PeriodMonth)` với bộ lọc mềm `IsDeleted = false`.
  - Liên kết khóa ngoại: `BranchId -> Branches(Id)`, `EmployeeId -> Employees(Id)`.
- Không cần thêm bảng mới; chỉ tương tác và ghi nhận thêm bản ghi vào `CashbookTransactions`.

## 4. Phân quyền & Bảo mật (Authorization)
- `StoreOwner` và `StoreManager`: Có toàn quyền khởi tạo bảng lương, xem danh sách toàn chi nhánh, duyệt chi trả và xóa phiếu lương `Unpaid`.
- Nhân viên (`Employee` / `Cashier` / `InventoryStaff`): Chỉ được phép tra cứu phiếu lương cá nhân liên kết với tài khoản người dùng (`UserId`).
- Bắt buộc kiểm tra ngữ cảnh `TenantId` trên toàn bộ các truy vấn Repository và Service.
