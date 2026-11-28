# Proposal: Màn hình Quản lý Bảng lương, Tính lương Tự động, Ứng lương & Chi trả Phiếu lương (`hr-payroll`)

## Vấn đề
Cuối tháng Chủ cửa hàng cần tổng hợp tự động công thực tế, giờ tăng ca OT đã duyệt, phụ cấp, phạt đi muộn và các khoản tạm ứng để sinh phiếu lương chính xác cho từng nhân viên và hạch toán chi trả lương.

## Mục tiêu
Cung cấp màn hình khởi tạo hàng loạt bảng lương theo kỳ tháng, tính lại lương khi cập nhật công, ghi nhận tạm ứng và chi trả lẻ/hàng loạt phiếu lương.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/employees/payroll`, `/employee/payroll`, `/employees/payroll` (`src/features/employee/pages/PayslipManagementPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `CreatePayslipModal`, `PayslipDetailModal`, `PayslipPaymentModal`, `ConfirmModal`.
  - Tích hợp đầy đủ với tầng API Backend (`PayslipsController`) và thực thể nghiệp vụ (`Payslip`, `Employee`, `EmployeeSchedule`, `CashbookEntry`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/employees/payroll`, `/employee/payroll`, `/employees/payroll` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/employees/payroll`, `/employee/payroll`, `/employees/payroll`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-18-06` (FE-18).
