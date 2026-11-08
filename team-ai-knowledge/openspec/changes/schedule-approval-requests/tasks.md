# Tasks: schedule-approval-requests

## DB & Domain
- [x] T1 — Cập nhật Enums trong `HREnums.cs`: `ScheduleRequestType`, `ShiftSwapType`, `LeaveType`, `ScheduleApprovalStatus`, `ScheduleStatus.OnLeave` (REQ-01)
- [x] T2 — Tạo Domain Entity `ScheduleApprovalRequest.cs` và cập nhật `EmployeeSchedule.cs` thêm quan hệ 1 - N (REQ-01, REQ-06)
- [x] T3 — Cấu hình EF Core Fluent API `ScheduleApprovalRequestConfiguration.cs`, cập nhật `AppDbContext.cs` và tạo Migration (REQ-01, REQ-06)

## Backend (Application & API)
- [ ] T4 — Tạo DTOs và FluentValidation cho `CreateScheduleApprovalRequestCommand` (REQ-01, REQ-02, REQ-03, REQ-04, REQ-05)
- [ ] T5 — Viết MediatR Handler cho `CreateScheduleApprovalRequestCommand` với ràng buộc `PayslipId == null` và kiểm tra trùng lặp (REQ-01, REQ-06)
- [ ] T6 — Viết Query Handler `GetPendingScheduleApprovalRequestsQuery` và `GetScheduleApprovalRequestsByScheduleIdQuery` (REQ-06)
- [ ] T7 — Viết Command Handler `PeerConfirmShiftSwapCommand` xử lý đồng nghiệp xác nhận đổi ca (REQ-02)
- [ ] T8 — Viết Command Handler `ReviewScheduleApprovalRequestCommand` xử lý đồng bộ kết quả ca (`OnLeave`, hoán đổi `EmployeeId`, tính lại giờ công sự cố, cộng OT) (REQ-02, REQ-03, REQ-04, REQ-05)
- [ ] T9 — Viết Controller `ScheduleApprovalRequestsController.cs` và tích hợp endpoints vào `EmployeeSchedulesController.cs` (REQ-01, REQ-06)

## Frontend
- [ ] T10 — Định nghĩa Enums & TypeScript Interfaces `scheduleApprovalTypes.ts` và tạo API Service `scheduleApprovalService.ts` (REQ-01)
- [ ] T11 — Tạo Component `CreateScheduleRequestModal.tsx` hỗ trợ gửi 4 loại đơn (REQ-01, REQ-02, REQ-03, REQ-04, REQ-05)
- [ ] T12 — Tạo Component `ScheduleRequestsHistoryModal.tsx` hiển thị lịch sử các đơn của một ca làm việc (REQ-01)
- [ ] T13 — Tích hợp nút thao tác gửi đơn và hiển thị nhãn/badge trạng thái ca trên `WorkSchedulePage.tsx` và `AttendancePage.tsx` (REQ-01, REQ-03)
- [ ] T14 — Tạo Component `ApprovalRequestsModal.tsx` và cập nhật chuông thông báo trên `AppTopNav.tsx` kết nối API thật (REQ-06)

## Test & Verification
- [ ] T15 — Viết Unit Tests xUnit cho `CreateScheduleApprovalRequestCommand` và `ReviewScheduleApprovalRequestCommand` (REQ-01, REQ-02, REQ-03, REQ-04, REQ-05)
- [ ] T16 — Build kiểm thử toàn bộ Backend `dotnet build` và Frontend `npm run build` (REQ-01 -> REQ-06)
