# Proposal: Màn hình Quản lý & Phê duyệt 4 Loại Đơn từ Ca làm việc Nhân viên (`hr-approval-requests`)

## Vấn đề
Trong vận hành cửa hàng hàng ngày, nhân viên thường xuyên phát sinh xin tăng ca (OT), giải trình quên chấm công kèm ảnh minh chứng, xin nghỉ phép hoặc đổi ca với đồng nghiệp cần luồng xác nhận hai bước rõ ràng.

## Mục tiêu
Quản lý tập trung 4 loại đơn từ nhân sự (`ScheduleApprovalRequest`), hỗ trợ đồng nghiệp xác nhận đổi ca trước và Store Owner phê duyệt tự động cập nhật bảng lịch/bảng công.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/employees/approval-requests` (`src/features/employee/pages/ApprovalRequestsPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `ApprovalRequestsModal`, `TablePagination`, `NotificationModal`.
  - Tích hợp đầy đủ với tầng API Backend (`ScheduleApprovalRequestsController`) và thực thể nghiệp vụ (`ScheduleApprovalRequest`, `EmployeeSchedule`, `Notification`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/employees/approval-requests` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/employees/approval-requests`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-18-05` (FE-18).
