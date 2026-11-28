# Proposal: Màn hình Xếp lịch Phân ca Nhân viên Định kỳ & Kiểm soát Xung đột Ca (`hr-work-schedule`)

## Vấn đề
Chủ cửa hàng cần xếp lịch trực tuần/tháng lặp lại cho nhiều nhân viên cùng lúc mà không bị trùng ca, không vượt trần số giờ làm tối đa trong ngày và không làm lệch các kỳ lương đã thanh toán.

## Mục tiêu
Xây dựng bảng lịch phân ca trực quan hỗ trợ xếp lịch đơn lẻ, hàng loạt và lặp lại định kỳ (`recurring`), phát hành lịch và khóa sửa đổi khi kỳ lương đã chốt trả.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/employees/schedule`, `/employees/schedule` (`src/features/employee/pages/WorkSchedulePage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `AddScheduleModal`, `ScheduleScopeConfirmModal`, `CreateScheduleRequestModal`, `ScheduleRequestsHistoryModal`, `TablePagination`.
  - Tích hợp đầy đủ với tầng API Backend (`SchedulesController`) và thực thể nghiệp vụ (`EmployeeSchedule`, `ShiftConfig`, `Payslip`, `Employee`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/employees/schedule`, `/employees/schedule` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/employees/schedule`, `/employees/schedule`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-18-03` (FE-18).
