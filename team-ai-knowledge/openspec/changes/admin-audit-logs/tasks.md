# Tasks: Màn hình Nhật ký Kiểm toán Hệ thống (Platform Audit Logs) (`admin-audit-logs`)

## DB & Domain
- [x] T1 — Chuẩn hóa thực thể Domain & cấu hình EF Core cho `AuditLog` đảm bảo lọc `TenantId` (`REQ-ADMI-AUDI-LOGS-01`).

## Backend API
- [x] T2 — Hiện thực hóa Application Service, DTOs & FluentValidation cho nghiệp vụ màn hình `admin-audit-logs` (`REQ-ADMI-AUDI-LOGS-02`, `REQ-ADMI-AUDI-LOGS-03`).
- [x] T3 — Triển khai các RESTful endpoints tại `AdminAuditLogsController.cs` kèm kiểm soát phân quyền RBAC (MasterAdmin) (`REQ-ADMI-AUDI-LOGS-01`, `REQ-ADMI-AUDI-LOGS-04`).

## Frontend UI
- [x] T4 — Xây dựng giao diện màn hình `src/pages/admin/AuditLogPage.tsx` tại route `/admin/audit-logs` và kết nối API thời gian thực (`REQ-ADMI-AUDI-LOGS-01` → `REQ-ADMI-AUDI-LOGS-04`).

## Test & Nghiệm thu
- [x] T5 — Chạy kiểm chứng build/test hai đầu (`dotnet test`, `npm run build`) và nghiệm thu trọn bộ kịch bản màn hình `UI-21-06` (`REQ-ADMI-AUDI-LOGS-01` → `REQ-ADMI-AUDI-LOGS-04`).
