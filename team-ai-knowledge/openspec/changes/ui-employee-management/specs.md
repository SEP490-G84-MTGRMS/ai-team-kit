# Delta Specs: ui-employee-management
## Capability: employee

### ADDED Requirements

#### [UC-EMP-01] View and Filter Employee List
- The system SHALL display a paginated list of employees with columns: Checkbox, Avatar, Employee Code, Attendance Code, Full Name, Phone, Working Branch, Department, Job Title, Debt & Advance Amount (VND), and Status (Active/Inactive).
- The system SHALL provide instant search filtering by employee name, employee code, or phone number.
- The system SHALL provide a multi-criteria filter sidebar allowing filtering by:
  - Working Status (Active / Inactive / All).
  - Working Branches (multi-select / branch toggle).
  - Salary Payment Branch (single-select).
  - Department (single-select with employee count).
  - Job Title (single-select).
- The system SHALL display a badge count on the "Duyệt yêu cầu" button indicating pending approval requests.

#### [UC-EMP-02] Create and Update Employee Profile
- The system SHALL validate mandatory fields: Full Name, Phone Number, and Salary Payment Branch.
- The system SHALL auto-generate an incremental unique Employee Code (e.g., `NV000001`) when left blank.
- The system SHALL support avatar image upload (PNG, JPG, max 2MB).
- The system SHALL allow assignment to multiple working branches and a single salary payment branch.
- The system SHALL allow linking the employee to an existing system User account or triggering the Quick User Creation modal.
- The system SHALL allow quick creation of new departments, job titles, and allowance types directly from the employee form modal.

#### [UC-EMP-03] View Employee Detail 360-degree
- The system SHALL display an employee detail drawer/modal containing 5 functional tabs:
  - **Tab 1: Thông tin:** Full view of personal info, contact, job details, linked user account, and bank details.
  - **Tab 2: Lịch làm việc:** Weekly/monthly shift schedule view with toggle between Table view and List view.
  - **Tab 3: Thiết lập lương:** Current salary structure, base wage, hourly rate, OT coefficients, and active allowances.
  - **Tab 4: Phiếu lương:** History of finalized monthly payslips, net pay, payment status, and actions to View / Print / Export.
  - **Tab 5: Nợ và tạm ứng:** Current debt balance, transaction history, and action to open Salary Payment modal.

#### [UC-EMP-04] Configure Salary and Allowances
- The system SHALL support 3 salary calculation types: Monthly Fixed, Hourly, and Shift-based.
- The system SHALL support OT multiplier settings: Normal Day, Weekend/Day-off, and Public Holiday.
- The system SHALL allow managing employee allowances with active toggles, allowance type, and custom amounts.

#### [UC-EMP-05] Process Approval Requests
- The system SHALL display pending approval requests grouped into two tabs:
  - **Tab Nhân viên:** Profile creation requests, phone number changes, and personal detail updates.
  - **Tab Chấm công:** Device change requests, out-of-range GPS check-in requests, and missing clock-in/out requests.
- The system SHALL allow approving or rejecting requests individually or in bulk.
- The system SHALL update the pending badge count immediately upon request approval/rejection.

#### [UC-EMP-06] Manage Debt & Advance Salary Payment
- The system SHALL provide a "Thanh toán lương" modal to create payment vouchers (Cash or Bank Transfer).
- When the employee has an outstanding salary debt > 0, the system SHALL record the voucher as a debt clearance payment.
- When the employee has 0 outstanding debt, the system SHALL automatically record the voucher as an advance salary payment (Tạm ứng lương).

#### [UC-EMP-07] Import and Export Employee Excel Data
- The system SHALL allow downloading the standard Excel template (`Mau_nhan_vien.xlsx`).
- The system SHALL allow uploading an Excel file containing up to 500 employee records.
- The system SHALL support error handling modes: "Dừng lại khi gặp lỗi" (Stop on error) or "Bỏ qua dòng lỗi để tiếp tục" (Skip invalid rows).
- The system SHALL allow exporting the full employee list or filtered subset to Excel.

---

### ADDED Business Rules

- **BR-EMP-01 (Mã nhân viên duy nhất):** Mỗi nhân viên có một mã duy nhất trên toàn hệ thống. Nếu không nhập, hệ thống tự sinh theo định dạng `NVxxxxxx`.
- **BR-EMP-02 (Ràng buộc Chi nhánh trả lương):** Nhân viên bắt buộc phải có 1 Chi nhánh trả lương chính. Chi nhánh trả lương phải nằm trong danh sách các Chi nhánh làm việc được chọn.
- **BR-EMP-03 (Tạm ứng tự động):** Phiếu chi lương phát sinh khi công nợ hiện tại bằng 0 sẽ tự động chuyển thành phiếu Tạm ứng và được cấn trừ vào kỳ lương kế tiếp.
- **BR-EMP-04 (Giới hạn Nhập Excel):** Giới hạn tối đa 500 bản ghi nhân viên cho một lần nạp file để bảo đảm hiệu năng hệ thống.
