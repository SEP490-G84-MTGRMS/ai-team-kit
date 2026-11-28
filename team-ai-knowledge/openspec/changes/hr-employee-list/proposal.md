# Proposal: Màn hình Danh sách Hồ sơ Nhân viên, Cấp Tài khoản Đăng nhập & Phân quyền RBAC (`hr-employee-list`)

## Vấn đề
Chủ cửa hàng cần quản lý hồ sơ nhân sự các chi nhánh, thiết lập hình thức trả lương (theo giờ/theo ca/cố định tháng) + phụ cấp, cấp tài khoản đăng nhập gán đúng chi nhánh và kiểm soát hạn ngạch nhân sự theo gói cước SaaS.

## Mục tiêu
Xây dựng màn hình quản lý danh sách nhân viên tích hợp cấp/khóa tài khoản định danh, đăng ký dữ liệu khuôn mặt FaceID và kiểm tra hạn ngạch gói dịch vụ (`StaffManagementGate`).

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/employees`, `/employees` (`src/features/employee/pages/EmployeeListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `EmployeeFormModal`, `EmployeeDetailModal`, `ImportEmployeeModal`, `TablePagination`, `ConfirmModal`.
  - Tích hợp đầy đủ với tầng API Backend (`EmployeesController`) và thực thể nghiệp vụ (`Employee`, `EmployeeAllowance`, `User`, `TenantUser`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/employees`, `/employees` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/employees`, `/employees`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-18-01` (FE-18).
