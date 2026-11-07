# Specs: payroll-management-backend

## API / Contract
| Method | Path | Request Body | Response Body | HTTP Status / Errors |
|---|---|---|---|---|
| `GET` | `/api/v1/payslips` | None (Query parameters) | `ApiResponse<PagedResult<PayslipSummaryDto>>` | 200 OK, 401 Unauthorized, 403 Forbidden |
| `GET` | `/api/v1/payslips/{id}` | None | `ApiResponse<PayslipResponse>` | 200 OK, 404 Not Found |
| `POST` | `/api/v1/payslips/generate-batch` | `GeneratePayrollBatchRequest` | `ApiResponse<IReadOnlyList<PayslipResponse>>` | 200 OK, 400 Bad Request |
| `POST` | `/api/v1/payslips/{id}/pay` | `PayPayslipRequest` | `ApiResponse<PayslipResponse>` | 200 OK, 400 Bad Request, 404 Not Found, 409 Conflict |
| `POST` | `/api/v1/payslips/batch-pay` | `BatchPayPayslipsRequest` | `ApiResponse<BatchPayResultDto>` | 200 OK, 400 Bad Request |
| `DELETE` | `/api/v1/payslips/{id}` | None | `ApiResponse<bool>` | 200 OK, 404 Not Found, 400 Bad Request |

---

## ADDED Requirements

### Requirement: REQ-PAY-01 Tính toán lương tự động đa hình thức
Hệ thống MUST tự động tính toán tổng thu nhập cho nhân viên theo đúng loại hình lương (`SalaryType`) và giờ công thực tế trong kỳ:
- `Monthly`: Lương công nhật quy đổi theo `StandardDays = 26.0`.
- `Shift`: Lương theo tổng số ca hoàn tất (`TotalShifts`).
- `Hourly`: Lương theo tổng số giờ làm việc thực tế (`TotalWorkHours`).

#### Scenario: Tính lương cho nhân viên lương tháng có làm thêm giờ (OT)
- **GIVEN**: Nhân viên A ký hợp đồng `Monthly` với `BaseRate = 10,400,000 VND` (`DailyRate = 400,000 VND`, `HourlyRate = 50,000 VND`). Trong kỳ tháng có `WorkedDays = 24.0` ngày và có 10 giờ làm thêm giờ OT ngày thường được phê duyệt (`ApprovedOtHours = 10.0`).
- **WHEN**: Chủ cửa hàng yêu cầu khởi tạo bảng lương kỳ tháng cho nhân viên A.
- **THEN**: 
  - `BaseSalaryEarned` MUST bằng `24.0 * 400,000 = 9,600,000 VND`.
  - `OvertimePay` MUST bằng `10.0 * 50,000 * 1.5 = 750,000 VND`.
  - Hệ thống MUST tự động trích đóng BHXH 10.5%: `SocialInsurance = 10,400,000 * 10.5% = 1,092,000 VND`.
  - `TotalEarnings = 9,600,000 + 750,000 = 10,350,000 VND`.
  - `NetSalary = 10,350,000 - 1,092,000 = 9,258,000 VND`.

#### Scenario: Tính lương cho nhân viên part-time theo ca (Shift)
- **GIVEN**: Nhân viên B ký hợp đồng `Shift` với `BaseRate = 150,000 VND/ca`. Trong kỳ tháng hoàn thành 20 ca làm việc, không có OT.
- **WHEN**: Khởi tạo bảng lương kỳ tháng cho nhân viên B.
- **THEN**:
  - `BaseSalaryEarned` MUST bằng `20 * 150,000 = 3,000,000 VND`.
  - `SocialInsurance` MUST bằng `0 VND`.
  - `NetSalary = 3,000,000 VND`.

---

### Requirement: REQ-PAY-02 Khấu trừ tạm ứng và kiểm soát âm thực lĩnh
Hệ thống MUST tự động khấu trừ số tiền tạm ứng trong kỳ từ nợ của nhân viên. Nếu tổng các khoản giảm trừ lớn hơn tổng thu nhập, `NetSalary` MUST được chặn ở mức tối thiểu 0 VND, phần nợ chưa thu hồi hết MUST được kết chuyển vào `RemainingDebt`.

#### Scenario: Nhân viên có khoản tạm ứng nhỏ hơn lương thực nhận
- **GIVEN**: Nhân viên C có `TotalEarnings = 5,000,000 VND`, không có BHXH, đang nợ tạm ứng `AdvanceDeduction = 1,500,000 VND`.
- **WHEN**: Tính bảng lương tháng cho nhân viên C.
- **THEN**: `TotalDeductions = 1,500,000 VND`, `NetSalary = 3,500,000 VND`, `RemainingDebt = 0 VND`.

#### Scenario: Nhân viên có khoản tạm ứng vượt quá thu nhập
- **GIVEN**: Nhân viên D có `TotalEarnings = 2,000,000 VND`, nợ tạm ứng `3,000,000 VND`.
- **WHEN**: Tính bảng lương tháng cho nhân viên D.
- **THEN**: `AdvanceDeduction = 2,000,000 VND`, `NetSalary = 0 VND`, `RemainingDebt = 1,000,000 VND`.

---

### Requirement: REQ-PAY-03 Chặn trùng lặp và bảo toàn phiếu lương đã thanh toán
Hệ thống MUST chặn việc khởi tạo đè hoặc thay đổi phiếu lương đã có trạng thái `Paid`. Nếu phiếu lương trong kỳ đang ở trạng thái `Unpaid`, hệ thống SHALL cho phép tính toán lại (Recalculate) để cập nhật dữ liệu chấm công mới nhất.

#### Scenario: Cố tình tính lại phiếu lương đã thanh toán
- **GIVEN**: Phiếu lương `PL-202611-0001` của nhân viên E kỳ `2026-11` đã có `Status = Paid`.
- **WHEN**: Người dùng gửi yêu cầu khởi tạo lại bảng lương kỳ `2026-11`.
- **THEN**: Hệ thống MUST bỏ qua phiếu lương này (hoặc trả thông báo phiếu lương đã được khóa thanh toán không được ghi đè).

#### Scenario: Xóa phiếu lương
- **GIVEN**: Một phiếu lương đang ở trạng thái `Paid`.
- **WHEN**: Người dùng gọi API `DELETE /api/v1/payslips/{id}`.
- **THEN**: Hệ thống MUST trả mã lỗi 400 Bad Request ("Không được xóa phiếu lương đã thanh toán").

---

### Requirement: REQ-PAY-04 Chi trả lương và tự động hạch toán Sổ quỹ
Hệ thống MUST hỗ trợ xác nhận chi trả lương đơn lẻ hoặc theo lô (`Batch Pay`). Khi chi trả thành công, hệ thống MUST cập nhật trạng thái phiếu lương sang `Paid`, đồng thời tự động ghi nhận một bút toán Phiếu chi trong `CashbookTransactions` tương ứng với số tiền `NetSalary`.

#### Scenario: Chi trả lương đơn lẻ bằng hình thức VietQR
- **GIVEN**: Phiếu lương `PL-202611-0005` của nhân viên F có `Status = Unpaid`, `NetSalary = 8,500,000 VND`.
- **WHEN**: Chủ cửa hàng gửi request `POST /api/v1/payslips/{id}/pay` với `PaymentMethod = "VIETQR"`.
- **THEN**:
  - Phiếu lương chuyển `Status = Paid`, `PaymentMethod = "VIETQR"`, `PaidAt = UtcNow`.
  - Hệ thống tự động tạo 1 bản ghi `CashbookTransaction`:
    - `EntryType = Expense`
    - `Amount = 8,500,000 VND`
    - `Category = "Chi phí lương nhân viên"`
    - `VoucherCode` sinh mã tăng dần `PC-yyyyMM-xxxx`
  - Mã phiếu chi `CashbookVoucherCode` và `CashbookTransactionId` được lưu ngược lại vào `Payslip`.

---

## Acceptance checklist
- [ ] REQ-PAY-01: Tính toán đúng `BaseSalaryEarned` cho 3 hình thức `Monthly`, `Shift`, `Hourly`.
- [ ] REQ-PAY-01: Tính toán tiền làm thêm giờ (OT) chuẩn xác với hệ số 150% (ngày thường) và 200% (ngày nghỉ).
- [ ] REQ-PAY-01: Trích đóng BHXH 10.5% chỉ áp dụng cho nhân viên `Monthly`.
- [ ] REQ-PAY-02: Cấn trừ tạm ứng chính xác, không để `NetSalary` âm.
- [ ] REQ-PAY-03: Chặn ghi đè hoặc xóa phiếu lương đã có `Status = Paid`.
- [ ] REQ-PAY-04: Chi trả lương tự động cập nhật trạng thái `Paid` và sinh Phiếu chi Sổ quỹ với số tiền tương ứng.
- [ ] Tối thiểu 5 Unit Tests đạt `PASS 100%`.
