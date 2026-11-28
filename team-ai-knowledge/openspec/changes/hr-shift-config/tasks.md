# Tasks: Màn hình Cấu hình Ca làm việc Mẫu & Chính sách Chấm công Chi nhánh (`hr-shift-config`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `ShiftConfig` đảm bảo lọc `TenantId` (`REQ-HR-SHIF-CONF-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `hr-shift-config` (`REQ-HR-SHIF-CONF-02`, `REQ-HR-SHIF-CONF-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `ShiftConfigsController.cs`, `BranchAttendancePoliciesController.cs` kèm kiểm soát phân quyền RBAC (StoreOwner) (`REQ-HR-SHIF-CONF-01`, `REQ-HR-SHIF-CONF-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/features/employee/pages/ShiftConfigPage.tsx` tại route `/store-owner/employees/shifts` và kết nối API thời gian thực (`REQ-HR-SHIF-CONF-01` → `REQ-HR-SHIF-CONF-04`).

## Test & Nghiệm thu
- [ ] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-18-02` (`REQ-HR-SHIF-CONF-01` → `REQ-HR-SHIF-CONF-04`).
