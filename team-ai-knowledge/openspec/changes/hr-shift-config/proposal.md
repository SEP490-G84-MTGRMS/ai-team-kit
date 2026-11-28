# Proposal: Màn hình Cấu hình Ca làm việc Mẫu & Chính sách Chấm công Chi nhánh (`hr-shift-config`)

## Vấn đề
Trước khi xếp lịch cho nhân viên, mỗi chi nhánh cần định nghĩa bộ khung giờ ca làm việc chuẩn (Ca sáng, Ca chiều, Ca tối, Ca gãy qua đêm) cùng quy định số phút đi muộn/về sớm cho phép và cách tính phạt/làm thêm giờ.

## Mục tiêu
Quản lý danh mục cấu hình ca `ShiftConfig` không trùng lặp tên và thiết lập/sao chép chính sách chấm công (`AttendanceConfigModal`) giữa các chi nhánh.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/employees/shifts`, `/employees/shifts` (`src/features/employee/pages/ShiftConfigPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `AttendanceConfigModal`, `TablePagination`, `ConfirmModal`.
  - Tích hợp đầy đủ với tầng API Backend (`ShiftConfigsController`, `BranchAttendancePoliciesController`) và thực thể nghiệp vụ (`ShiftConfig`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/employees/shifts`, `/employees/shifts` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/employees/shifts`, `/employees/shifts`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-18-02` (FE-18).
