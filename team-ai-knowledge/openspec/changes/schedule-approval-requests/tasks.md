# Tasks: Quản lý Phiếu Yêu Cầu Ca Làm Việc (Schedule Approval Requests)

## Backend (Domain, Infrastructure, Application, API)
- [x] **T1: Enums & Domain Types** (`HREnums.cs`): Thêm `ScheduleRequestType` (Overtime, CheckInIncident, ShiftSwap, LeaveRequest), `ShiftSwapType` (CrossSwap, Cover), `LeaveType` (AnnualLeave, SickLeave, UnpaidLeave, Maternity, Other), `ScheduleApprovalStatus.Cancelled`, `ScheduleStatus.OnLeave`.
- [x] **T2: Domain Entities** (`ScheduleApprovalRequest.cs`, `EmployeeSchedule.cs`): Tạo entity `ScheduleApprovalRequest` gắn quan hệ 1-N với `EmployeeSchedule`, bổ sung cờ `IsLeave`, `IsPaidLeave` vào `EmployeeSchedule`.
- [x] **T3: EF Core & Database Migration** (`ScheduleApprovalRequestConfiguration.cs`, `AppDbContext.cs`, Migration): Tạo migration `AddScheduleApprovalRequests`, cấu hình indexes & foreign keys, cập nhật database schema.
- [x] **T4: DTOs & Validation** (`ScheduleApprovalDtos.cs`, `ScheduleApprovalValidators.cs`): Tạo DTOs cho tạo đơn, duyệt đơn, xác nhận đổi ca đồng nghiệp kèm FluentValidation rules.
- [x] **T5: Repository Interfaces & Implementations** (`IScheduleApprovalRequestRepository.cs`, `ScheduleApprovalRequestRepository.cs`): Viết các hàm query chi tiết đơn, đơn pending theo ca/loại đơn, đếm số lượng pending theo chi nhánh.
- [x] **T6: Application Service - Core Logic** (`IScheduleApprovalService.cs`, `ScheduleApprovalService.cs`): Xử lý tạo đơn (`CreateRequestAsync`) với kiểm tra logic: không cho phép tạo khi ca đã chốt bảng lương (`PayslipId != null`), chặn trùng lặp đơn đang pending.
- [x] **T7: Application Service - Approval Handlers**:
  - `LeaveRequest`: Chuyển status ca thành `OnLeave`, set `IsLeave = true`, `IsPaidLeave`.
  - `ShiftSwap`: Đổi chéo ca (`CrossSwap`) hoán đổi `EmployeeId` giữa 2 ca; Nhờ làm thay (`Cover`) gán lại `EmployeeId` cho đồng nghiệp.
  - `CheckInIncident`: Cập nhật `CheckInTime`, `CheckOutTime`, `CheckInMethod = "INCIDENT_EXPLAINED"`, tính lại giờ công và phút đi muộn.
  - `Overtime`: Cộng dồn `OvertimeMinutes` vào `EmployeeSchedule`.
- [x] **T8: Application Service - Peer Confirm & Notifications**: Xử lý đồng nghiệp xác nhận đổi ca (`PeerConfirmShiftSwapAsync`) và đếm số lượng badge pending cho quản lý.
- [x] **T9: Controllers & Endpoints** (`ScheduleApprovalRequestsController.cs`, `SchedulesController.cs`): Bổ sung routes `api/schedules/{id}/requests`, `api/schedule-approval-requests/pending`, `api/schedule-approval-requests/{id}/review`, `api/schedule-approval-requests/{id}/peer-confirm`.

## Frontend (React 19 + TypeScript)
- [x] **T10: Types & API Client** (`scheduleApprovalTypes.ts`, `scheduleApprovalApi.ts`): Khai báo enums, interfaces, và các hàm gọi API tương ứng backend.
- [x] **T11: Modal Tạo Đơn Cho Nhân Viên** (`CreateScheduleRequestModal.tsx`): Form tạo 4 loại đơn trực quan (chọn loại nghỉ, đồng nghiệp đổi ca, giờ check-in thực tế, số phút OT, upload ảnh chứng cứ).
- [x] **T12: Modal Lịch Sử Đơn Của Ca** (`ScheduleRequestsHistoryModal.tsx`): Hiển thị danh sách các đơn đã gửi của ca làm việc đó, trạng thái duyệt và phản hồi của quản lý.
- [x] **T13: Tích Hợp UI Phân Ca & Chấm Công** (`WorkSchedulePage.tsx`, `AttendancePage.tsx`): Thêm action dropdown trên từng ô ca làm việc (Xin nghỉ, Đổi ca, Sự cố FaceID, Xin OT, Lịch sử), hiển thị badge `[Nghỉ]` khi ca có trạng thái `OnLeave`.
- [x] **T14: Modal Phê Duyệt Của Quản Lý & Chuông Thông Báo** (`ApprovalRequestsModal.tsx`, `AppTopNav.tsx`): Bộ lọc 4 tab duyệt đơn, form xác nhận duyệt/từ chối kèm ghi chú, badge số lượng đơn pending trên chuông thông báo header polling 30s.

## Testing & Quality Assurance
- [x] **T15: Backend Unit Tests** (`ScheduleApprovalServiceTests.cs`): Viết 7 test cases bao phủ tạo đơn, chặn khi đã chốt lương, chặn trùng đơn pending, duyệt đơn xin nghỉ, duyệt đổi chéo ca, duyệt sự cố FaceID, từ chối đơn.
- [x] **T16: Build & Verification**: Build thành công toàn bộ Backend (.NET 8) và Frontend (Vite + TypeScript), 0 error.
