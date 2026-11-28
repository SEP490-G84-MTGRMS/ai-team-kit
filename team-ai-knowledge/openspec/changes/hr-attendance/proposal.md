# Proposal: Màn hình Chấm công Check-in / Check-out bằng AI FaceID & Bảng công Thực tế (`hr-attendance`)

## Vấn đề
Chấm công thủ công dễ xảy ra chấm công hộ giữa các nhân viên ca hàng; cửa hàng cần chấm công bằng nhận diện khuôn mặt AI trực tiếp qua camera thiết bị kết hợp tự động đối chiếu ca trực trong ngày.

## Mục tiêu
Triển khai `AttendancePage` và `FaceIdAttendanceModal` đối khớp véc-tơ khuôn mặt thời gian thực, ghi nhận giờ vào/ra ca chính xác, mở lối tắt vào POS sau chấm công và cho phép gửi đơn giải trình.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/employees/attendance`, `/employee/attendance`, `/employees/attendance` (`src/features/employee/pages/AttendancePage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `FaceIdAttendanceModal`, `AttendanceDetailModal`, `CreateScheduleRequestModal`, `ScheduleRequestsHistoryModal`.
  - Tích hợp đầy đủ với tầng API Backend (`SchedulesController`, `EmployeesController`) và thực thể nghiệp vụ (`EmployeeSchedule`, `Employee`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/employees/attendance`, `/employee/attendance`, `/employees/attendance` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/employees/attendance`, `/employee/attendance`, `/employees/attendance`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-18-04` (FE-18).
