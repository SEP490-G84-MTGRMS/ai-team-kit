# Proposal: payroll-management-backend

## Vấn đề
Hiện tại trong hệ thống MT-GRMS, phân hệ Nhân sự đã có cấu hình ca làm việc (`ShiftConfigs`), lịch làm việc & chấm công (`EmployeeSchedules`), chính sách điểm danh chi nhánh (`BranchAttendancePolicies`) và sổ quỹ (`CashbookTransactions`). Tuy nhiên, backend chưa có service & API để:
1. Tự động tính toán bảng lương tháng (`Payslip`) dựa trên công thực tế, loại hình lương (theo tháng `Monthly`, theo ca `Shift`, theo giờ `Hourly`).
2. Xử lý khấu trừ tạm ứng lương, phụ cấp, trích đóng BHXH (10.5% chuẩn Việt Nam cho hợp đồng tháng) và tiền làm thêm giờ (OT) có phê duyệt đơn.
3. Hỗ trợ quy trình chi trả lương (Tiền mặt, Chuyển khoản, VietQR) và tự động đồng bộ sinh phiếu chi (`CashbookTransaction`) vào Sổ quỹ để quản lý dòng tiền chi phí lương minh bạch.

## Mục tiêu
- Xây dựng tầng Backend hoàn chỉnh (Repository Pattern + Service Pattern + Controllers) theo chuẩn Clean Architecture (.NET 8) cho nghiệp vụ Quản lý & Tính toán Lương (`Payslips`).
- Hỗ trợ tính lương đơn lẻ hoặc khởi tạo hàng loạt (`Batch Generate`) theo Kỳ tháng (`PeriodMonth`) và Chi nhánh (`BranchId`).
- Hạch toán chi trả lương và tự động sinh bút toán Phiếu chi vào Sổ quỹ chi nhánh khi thanh toán lương.
- Đảm bảo tính toàn vẹn dữ liệu, kiểm soát trùng lặp bảng lương và bao phủ kiểm thử tự động (Unit Test / Integration Test).

## Phạm vi
- **In scope**:
  - DTOs, Validators (FluentValidation), Repository interface & EF Core implementation cho `Payslip`.
  - Service tính toán lương tự động:
    - Lương cơ bản theo loại hình: `Monthly`, `Shift`, `Hourly`.
    - Tiền làm thêm giờ (OT): ngày thường 150%, ngày nghỉ hằng tuần 200%, chỉ tính giờ OT có Đơn được duyệt (`ApprovedOtHours`), chặn trần 12 giờ/ngày.
    - Phụ cấp nhân viên (`AllowancesDetailJson`), giảm trừ bảo hiểm xã hội 10.5% (chỉ áp dụng `Monthly`), cấn trừ tạm ứng (`AdvanceDeduction`).
  - API Controller (`/api/v1/payslips`) cung cấp các endpoint: Lấy danh sách phân trang + lọc, xem chi tiết, tạo bảng lương theo lô, chi trả phiếu lương (đơn lẻ / hàng loạt), xóa/hủy phiếu lương chưa thanh toán.
  - Tích hợp Sổ quỹ (`CashbookTransactions`): Tự động sinh phiếu chi chi phí lương (`EXPENSE`) khi chuyển trạng thái phiếu sang `Paid`.
  - Unit tests bao phủ toàn bộ công thức tính lương và luồng thanh toán.
- **Out of scope**:
  - Không xây dựng UI frontend (đã được quản lý ở change/tác vụ riêng).
  - Không tích hợp trực tiếp cổng thanh toán ngân hàng tự động (chi trả qua xác nhận thủ công hoặc mã VietQR đối soát).
  - Không bao gồm các nghiệp vụ thuế thu nhập cá nhân lũy tiến phức tạp của doanh nghiệp lớn ngoài các định mức cơ bản.

## Người dùng liên quan
- **Chủ cửa hàng (`Store Owner`) / Quản lý chi nhánh (`Store Manager`)**: Khởi tạo bảng lương tháng, kiểm tra đối soát công, xác nhận thanh toán lương và theo dõi chi phí lương trên Sổ quỹ.
- **Nhân viên (`Employee`)**: Xem chi tiết phiếu lương cá nhân (thu nhập, phụ cấp, giảm trừ, thực lĩnh) qua API tra cứu.

## Tiêu chí thành công
- [ ] Backend biên dịch thành công (`dotnet build`) với 0 Errors.
- [ ] Có đầy đủ API endpoint RESTful chuẩn hóa theo tài liệu thiết kế nghiệp vụ (`/api/v1/payslips`).
- [ ] Đảm bảo tính toán chính xác số tiền thực lĩnh (`NetSalary = TotalEarnings - TotalDeductions`) theo đúng quy định lương, OT và BHXH.
- [ ] Chặn trùng lặp: Không cho phép tạo 2 phiếu lương trùng kỳ tháng cho cùng một nhân viên nếu đã được thanh toán.
- [ ] Chi trả lương tự động sinh Phiếu chi Sổ quỹ với số tiền và mã chứng từ khớp với phiếu lương.
- [ ] Viết tối thiểu 5 Unit Tests kiểm thử nghiệp vụ tính lương đạt kết quả PASS 100%.
