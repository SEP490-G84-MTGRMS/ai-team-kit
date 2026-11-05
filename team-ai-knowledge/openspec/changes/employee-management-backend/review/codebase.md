# Codebase Review: employee-management-backend

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa | Ghi chú |
|---|---|---|---|
| REQ-01 | `MT_GRMS.Domain/Entities/HR/Employee.cs`, `EmployeeAllowance.cs` | Bổ sung `SyncAllowances` trong `EmployeeRepository.cs`, `Guid? Id` trong `EmployeeDtos.cs`, ngoại lệ Cascade trong `AppDbContext.cs`, hàm `HasWorkOrPayrollHistoryAsync` cho BR-EMP-03 | Đã triển khai xong, sửa triệt để lỗi ConcurrencyException, Severed relationship và bảo vệ dữ liệu xóa |
| REQ-02 | `MT_GRMS.Domain/Entities/HR/ShiftConfig.cs` | DTOs, Repository (`IShiftConfigRepository`), Service (`IShiftConfigService`) và `ShiftConfigsController` quản lý ca đa chi nhánh (`BranchIds` jsonb), ca qua đêm | Đã triển khai xong trong Cụm 2 (Nhóm 2.1) |
| REQ-07 | `MT_GRMS.Domain/Entities/HR/BranchAttendancePolicy.cs` | Entity `BranchAttendancePolicy` (đã tạo), cấu hình Fluent API trong `BranchAttendancePolicyConfiguration.cs` (đã tạo), DbSet trong `AppDbContext.cs` (đã tạo). Cần bổ sung DTOs, Repository (`IBranchAttendancePolicyRepository`), Service (`IBranchAttendancePolicyService`) và `BranchAttendancePoliciesController` hỗ trợ CRUD, Fallback default và Sao chép đa chi nhánh (`copy`). | Sẽ triển khai trong Cụm 2 (Nhóm 2.2) |
| REQ-03 | `MT_GRMS.Domain/Entities/HR/EmployeeSchedule.cs` | DTOs, Repository (`IScheduleRepository`), Service (`IScheduleService`) và `SchedulesController` phân ca batch và kiểm tra chống trùng thời gian | Sẽ triển khai trong Cụm 2 (Nhóm 2.3) |
| REQ-04 | `MT_GRMS.Application/HR/Attendance` | Tích hợp công thức Haversine tính khoảng cách GPS Geofencing, áp dụng dung sai từ `BranchAttendancePolicy` tính đi trễ/về sớm và giờ công | Sẽ triển khai trong Cụm 3 |
| REQ-05 | `MT_GRMS.Domain/Entities/POS/ShiftZReport.cs` | Migration thêm `DenominationDetailsJson`, `AuditApproveShiftAsync` tích hợp `ICashbookService.ReceiveCashAsync()` | Sẽ triển khai trong Cụm 4 |
| REQ-06 | `MT_GRMS.Domain/Entities/HR/Payslip.cs` | Payroll Engine tính lương tự động từ ngày công, tích hợp `ICashbookService.DisburseCashAsync()` | Sẽ triển khai trong Cụm 5 |

## Tái sử dụng được
- `MT_GRMS.Infrastructure/Persistence/AppDbContext.cs` — DbSet `Employees`, `EmployeeAllowances`, `ShiftConfigs`, `BranchAttendancePolicies`, `EmployeeSchedules`, `Payslips`, cấu hình Fluent API.
- `MT_GRMS.Application/Common/Exceptions/BusinessException.cs` & `NotFoundException.cs` — Xử lý lỗi chuẩn HTTP 400/404/409.
- `MT_GRMS.Application/Common/Interfaces/ICurrentTenantContext.cs` — Lấy thông tin `TenantId` tự động.
- `MT_GRMS.Application/Finance/Cashbooks/ICashbookService.cs` — Tự động sinh phiếu thu/chi sổ quỹ.

## Xung đột / rủi ro kỹ thuật đã kiểm soát
- [ĐÃ XỬ LÝ] Tách bạch đúng trách nhiệm giữa Quản lý Danh mục cấu hình Ca (`ShiftConfigs`) và Chính sách Chấm công Chi nhánh (`BranchAttendancePolicy`) $\rightarrow$ Khắc phục hoàn toàn rủi ro trùng lặp cấu hình trên từng ca.
- [ĐÃ XỬ LÝ] `BaseTenantEntity` tự sinh `Id = Uuid7.NewGuid()` $\rightarrow$ Đã xử lý bằng `_context.EmployeeAllowances.Add(newAllowance)` và gán tường minh `EntityState.Added`.
- [ĐÃ XỬ LÝ] Ngoại lệ `severed relationship` $\rightarrow$ Đã xử lý bằng cách miễn trừ `EmployeeAllowance` giữ nguyên `DeleteBehavior.Cascade` trong `AppDbContext.cs`.

## Kết luận: Khả thi
Toàn bộ mã nguồn Cụm 1 (REQ-01), Cụm 2 Nhóm 2.1 (REQ-02) đã hoàn thành và kiểm chứng tương thích. Việc bổ sung Nhóm 2.2 Chính sách Chấm công Chi nhánh (REQ-07) hoàn toàn tương thích và khả thi 100%.
