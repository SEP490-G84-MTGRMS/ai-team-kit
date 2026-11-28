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

### Requirement: REQ-PAY-05 Liên thông Phiếu yêu cầu: Bảo toàn công Nghỉ phép hưởng lương (PAID_LEAVE)
Hệ thống MUST tự động quét và tính các ca làm việc có trạng thái `OnLeave` nhưng đã được phê duyệt đơn xin nghỉ có lương (`Schedule.ApprovalStatus == ScheduleApprovalStatus.Approved` VÀ `Schedule.ApprovalType == "PAID_LEAVE"`) vào tổng số ngày công hưởng lương trong kỳ (`PaidLeaveDays`).
- Lương tháng (`Monthly`): Ngày nghỉ có lương được cộng trực tiếp vào số ngày công hưởng lương:
  $$\text{BaseSalaryEarned} = \text{ROUND}\left(\frac{\text{WorkedDays} + \text{PaidLeaveDays}}{\text{StandardDays}} \times \text{BaseRate}, 0\right)$$
- Lương ca (`Shift`): Ca nghỉ có lương được hưởng 100% định mức ca:
  $$\text{BaseSalaryEarned} = \text{ROUND}\left((\text{TotalCompletedShifts} + \text{PaidLeaveDays}) \times \text{BaseRate}, 0\right)$$
- Lương giờ (`Hourly`): Giờ nghỉ có lương được quy đổi theo giờ chuẩn của ca:
  $$\text{BaseSalaryEarned} = \text{ROUND}\left((\text{TotalWorkHours} + (\text{PaidLeaveDays} \times \text{StandardDayHours})) \times \text{BaseRate}, 0\right)$$

#### Scenario: Nhân viên lương tháng có 2 ngày nghỉ phép hưởng lương
- **GIVEN**: Nhân viên G lương tháng `BaseRate = 13,000,000 VND` (`StandardDays = 26.0`). Thực tế làm việc 22 ngày công (`WorkedDays = 22.0`), có 2 ngày nghỉ phép năm được duyệt `PAID_LEAVE` (`PaidLeaveDays = 2.0`). Không có vi phạm hay giảm trừ.
- **WHEN**: Tính bảng lương tháng cho nhân viên G.
- **THEN**:
  - Tổng ngày công hưởng lương = `22.0 + 2.0 = 24.0` ngày.
  - `BaseSalaryEarned` MUST bằng `ROUND((24.0 / 26.0) * 13,000,000, 0) = 12,000,000 VND`.
  - Phiếu lương ghi nhận rõ `WorkedDays = 22.0`, `PaidLeaveDays = 2.0`.

---

### Requirement: REQ-PAY-06 Liên thông Phiếu yêu cầu: Công nhận công sau Giải trình sự cố chấm công
Hệ thống MUST tự động công nhận giờ làm việc và trạng thái hoàn thành ca đối với các ca làm việc có đơn báo sự cố chấm công (`CheckInIncident`) đã được duyệt:
- Ca làm việc chuyển `Status = ScheduleStatus.Completed`, `ApprovalStatus = Approved`, `ApprovalType = "INCIDENT_RESOLVED"`.
- `ActualWorkHours` được cập nhật dựa trên giờ vào/ra được phê duyệt và được tính trọn vẹn vào `TotalWorkHours` và `TotalCompletedShifts` trong kỳ tính lương.

#### Scenario: Nhân viên quên chấm công được chủ duyệt đơn sự cố
- **GIVEN**: Nhân viên H làm ca 8 tiếng nhưng bị lỗi FaceID nên ca bị treo `Missing`. Nhân viên gửi đơn giải trình sự cố chấm công kèm ảnh minh chứng. Chủ cửa hàng phê duyệt đơn, hệ thống cập nhật ca với `ActualWorkHours = 8.0` và `Status = Completed`.
- **WHEN**: Chủ cửa hàng thực hiện tính bảng lương tháng.
- **THEN**: Ca làm việc này MUST được tính vào tổng giờ làm `TotalWorkHours` và số ca hoàn thành `TotalShifts` của nhân viên H như một ca làm việc bình thường.

---

### Requirement: REQ-PAY-07 Liên thông Phiếu yêu cầu: Phê duyệt làm thêm giờ (Overtime)
Hệ thống MUST chỉ ghi nhận và tính chi trả lương làm thêm giờ (`OvertimePay`) cho các ca làm việc có `OvertimeMinutes > 0` VÀ có trạng thái phê duyệt `Schedule.ApprovalStatus == ScheduleApprovalStatus.Approved`. Các ca có số phút làm thêm nhưng chưa được phê duyệt hoặc bị từ chối MUST bị loại khỏi quỹ lương OT.

#### Scenario: Ca có tăng ca nhưng chưa được phê duyệt
- **GIVEN**: Nhân viên K có ca làm việc ghi nhận `OvertimeMinutes = 120` (2 giờ), nhưng đơn OT đang ở trạng thái `Pending` (chưa duyệt) hoặc `ApprovalStatus != Approved`.
- **WHEN**: Khởi tạo bảng lương cho nhân viên K.
- **THEN**: Hệ thống MUST ghi nhận `OtHours = 0` và `OvertimePay = 0 VND` cho ca làm việc này.

---

## Acceptance checklist
- [ ] REQ-PAY-01: Tính toán đúng `BaseSalaryEarned` cho 3 hình thức `Monthly`, `Shift`, `Hourly`.
- [ ] REQ-PAY-01: Tính toán tiền làm thêm giờ (OT) chuẩn xác với hệ số 150% (ngày thường) và 200% (ngày nghỉ).
- [ ] REQ-PAY-01: Trích đóng BHXH 10.5% chỉ áp dụng cho nhân viên `Monthly`.
- [ ] REQ-PAY-02: Cấn trừ tạm ứng chính xác, không để `NetSalary` âm.
- [ ] REQ-PAY-03: Chặn ghi đè hoặc xóa phiếu lương đã có `Status = Paid`.
- [ ] REQ-PAY-04: Chi trả lương tự động cập nhật trạng thái `Paid` và sinh Phiếu chi Sổ quỹ với số tiền tương ứng.
- [ ] REQ-PAY-05: Liên thông ngày nghỉ có lương `PAID_LEAVE`, cộng đủ ngày công cho `Monthly`, `Shift`, `Hourly`.
- [ ] REQ-PAY-06: Ca duyệt sự cố chấm công `INCIDENT_RESOLVED` được công nhận công và tính lương trọn vẹn.
- [ ] REQ-PAY-07: Chỉ tính tiền OT cho các ca đã được phê duyệt `ApprovalStatus == Approved`.
- [ ] Tối thiểu 5 Unit Tests đạt `PASS 100%`.
