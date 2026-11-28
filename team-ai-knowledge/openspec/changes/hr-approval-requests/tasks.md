# Tasks: Màn hình Quản lý & Phê duyệt 4 Loại Đơn từ Ca làm việc Nhân viên (`hr-approval-requests`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `ScheduleApprovalRequest`, `EmployeeSchedule`, `Notification` đảm bảo lọc `TenantId` (`REQ-HR-APPR-REQU-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `hr-approval-requests` (`REQ-HR-APPR-REQU-02`, `REQ-HR-APPR-REQU-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `ScheduleApprovalRequestsController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner, Employee) (`REQ-HR-APPR-REQU-01`, `REQ-HR-APPR-REQU-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/employee/pages/ApprovalRequestsPage.tsx` tại route `/store-owner/employees/approval-requests` và kết nối API thời gian thực (`REQ-HR-APPR-REQU-01` → `REQ-HR-APPR-REQU-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-18-05` (`REQ-HR-APPR-REQU-01` → `REQ-HR-APPR-REQU-04`).
