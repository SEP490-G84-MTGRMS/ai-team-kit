# Proposal: schedule-approval-requests

## Vấn đề
Hiện tại trong hệ thống MT-GRMS, bảng `EmployeeSchedule` chỉ lưu trữ thông tin chấm công cơ bản và các trường duyệt phẳng 1-1, dẫn tới:
1. Nhân viên không thể gửi nhiều loại yêu cầu trong cùng một ca (ví dụ: vừa bị lỗi FaceID đầu ca cần điểm danh bù, vừa làm thêm giờ OT cuối ca do khách đông). Đơn sau sẽ ghi đè đơn trước làm mất lịch sử đối soát.
2. Chưa có quy trình chuẩn cho nhân viên xin Đổi ca làm việc (đổi chéo ca hoặc nhờ đồng nghiệp làm thay) và Xin nghỉ phép (có lương/không lương).
3. Thiếu cơ chế thông báo cho Quản lý / Chủ cửa hàng trên TopNav để kịp thời xem xét, phê duyệt các yêu cầu phát sinh.
4. Sử dụng chuỗi string tự do gây rủi ro sai sót dữ liệu, thiếu chuẩn hóa Enums giữa Backend và Frontend.

## Mục tiêu
Xây dựng phân hệ Quản lý Phiếu yêu cầu ca làm việc hoàn chỉnh theo mô hình quan hệ 1 - N:
1. Cho phép nhân viên tạo và theo dõi 4 loại phiếu yêu cầu gắn với ca làm việc:
   - `Overtime`: Đề xuất tính thêm giờ làm thêm khi có phát sinh công việc ngoài giờ.
   - `CheckInIncident`: Báo sự cố FaceID / mạng / camera để được điểm danh bù và không bị tính đi trễ.
   - `ShiftSwap`: Đổi ca làm việc (đổi chéo hoặc nhờ làm thay) với đồng nghiệp cùng chi nhánh.
   - `LeaveRequest`: Xin nghỉ ca làm việc (phép năm, nghỉ ốm, việc riêng) tránh bị phạt vắng vô cớ.
2. Cung cấp giao diện chuông thông báo và Modal duyệt tập trung cho Quản lý / Chủ cửa hàng (Store Owner) trên TopNav.
3. Chuẩn hóa 100% các trạng thái và phân loại bằng Enums trong cả Backend (.NET) và Frontend (TypeScript).

## Phạm vi
### In scope:
- **Backend (.NET Core 8 Clean Architecture):**
  - Cập nhật enums trong `HREnums.cs`: `ScheduleRequestType`, `ShiftSwapType`, `LeaveType`, `ScheduleApprovalStatus`, `ScheduleStatus.OnLeave`.
  - Tạo entity mới `ScheduleApprovalRequest` kế thừa `BaseTenantEntity` (quan hệ 1 - N với `EmployeeSchedule`).
  - Cập nhật entity `EmployeeSchedule` (thêm navigation collection `ApprovalRequests`, cờ `IsLeave`, `IsPaidLeave`).
  - Cấu hình Entity Framework Core mapping & DbContext.
  - Các MediatR Commands/Queries: `CreateScheduleApprovalRequestCommand`, `GetPendingScheduleApprovalRequestsQuery`, `GetScheduleApprovalRequestsByScheduleIdQuery`, `ReviewScheduleApprovalRequestCommand`, `PeerConfirmShiftSwapCommand`.
  - `ScheduleApprovalRequestsController` với các RESTful endpoints.
- **Frontend (React + Vite + TypeScript + Tailwind CSS):**
  - Đồng bộ Enums TypeScript (`scheduleApprovalTypes.ts`).
  - Viết `scheduleApprovalService.ts`.
  - Tích hợp chuông thông báo & Modal duyệt 4 tabs trên `AppTopNav.tsx` (bỏ mock `setTimeout`).
  - Bổ sung nút thao tác xin nghỉ, đổi ca, báo lỗi FaceID, xin OT trên `WorkSchedulePage.tsx` và `AttendancePage.tsx`.
  - Hiển thị badge trạng thái trên từng ô ca làm việc.

### Out of scope:
- Tích hợp phần cứng FaceID vật lý tự động mở khóa cửa quầy.
- Tự động trừ quỹ phép năm tồn của nhân viên từ các năm trước (sẽ phát triển ở phân hệ HR nâng cao tiếp theo).
- Hệ thống gửi email/SMS thông báo ngoài ứng dụng (thông báo nội bộ realtime qua TopNav và Polling).

## Người dùng liên quan
- **Nhân viên (STAFF):** Tạo đơn, chọn đồng nghiệp đổi ca, đính kèm ảnh bằng chứng, theo dõi trạng thái phê duyệt của ca làm.
- **Chủ cửa hàng / Quản lý (STORE_OWNER / MANAGER):** Nhận thông báo trên chuông TopNav, xem danh sách chờ, phê duyệt hoặc từ chối đơn kèm lý do giải trình.

## Tiêu chí thành công
- [ ] Nhân viên gửi được cả 4 loại đơn: Overtime, CheckInIncident, ShiftSwap, LeaveRequest gắn liền với ca làm việc.
- [ ] Một ca làm có thể chứa nhiều đơn khác loại (ví dụ: vừa có đơn CheckInIncident vừa có đơn Overtime) mà không bị ghi đè dữ liệu.
- [ ] Đơn xin đổi ca hoạt động chính xác: khi duyệt đổi chéo ca, `EmployeeId` giữa 2 ca được hoán đổi thành công; khi duyệt làm thay, ca được chuyển cho đồng nghiệp.
- [ ] Đơn xin nghỉ phép khi duyệt: ca chuyển trạng thái `OnLeave`, không bị hệ thống tính là vắng không phép.
- [ ] Đơn sự cố FaceID khi duyệt: cập nhật giờ vào và phương thức `INCIDENT_EXPLAINED`, tính lại giờ làm thực tế.
- [ ] Đơn OT khi duyệt: số phút OT được cộng dồn vào `OvertimeMinutes` của ca làm việc.
- [ ] Ràng buộc nghiệp vụ: Không cho phép tạo đơn hoặc duyệt đơn đối với ca đã chốt bảng lương (`PayslipId != null`).
- [ ] TopNav hiển thị số lượng đơn chờ duyệt thực tế từ API và cập nhật sau khi duyệt.
- [ ] Mã nguồn sử dụng 100% Enums, `dotnet build` và `npm run build` thành công không có lỗi.
