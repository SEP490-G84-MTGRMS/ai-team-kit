# Codebase Review: employee-management-backend

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa | Ghi chú |
|---|---|---|---|
| REQ-01 | `MT_GRMS.Domain/Entities/HR/Employee.cs`, `EmployeeAllowance.cs` | Bổ sung `SyncAllowances` trong `EmployeeRepository.cs`, `Guid? Id` trong `EmployeeDtos.cs`, ngoại lệ Cascade trong `AppDbContext.cs`, hàm `HasWorkOrPayrollHistoryAsync` cho BR-EMP-03 | Đã triển khai xong, sửa triệt để lỗi ConcurrencyException, Severed relationship và bảo vệ dữ liệu xóa |
| REQ-02 | `MT_GRMS.Domain/Entities/HR/ShiftConfig.cs` | DTOs, Repository (`IShiftConfigRepository`), Service (`IShiftConfigService`) và `ShiftConfigsController` quản lý ca đa chi nhánh (`BranchIds` jsonb), ca qua đêm | Chuẩn bị triển khai trong Cụm 2 (Nhóm 2.1) |
| REQ-03 | `MT_GRMS.Domain/Entities/HR/EmployeeSchedule.cs` | DTOs, Repository (`IScheduleRepository`), Service (`IScheduleService`) và `SchedulesController` phân ca batch và kiểm tra chống trùng thời gian | Chuẩn bị triển khai trong Cụm 2 (Nhóm 2.2) |
| REQ-04 | `MT_GRMS.Application/HR/Attendance` | Tích hợp công thức Haversine tính khoảng cách GPS Geofencing, tính đi trễ/về sớm | Chuẩn bị triển khai trong Cụm 3 |
| REQ-05 | `MT_GRMS.Domain/Entities/POS/ShiftZReport.cs` | Migration thêm `DenominationDetailsJson`, `AuditApproveShiftAsync` tích hợp `ICashbookService.ReceiveCashAsync()` | Chuẩn bị triển khai trong Cụm 4 |
| REQ-06 | `MT_GRMS.Domain/Entities/HR/Payslip.cs` | Payroll Engine tính lương tự động từ ngày công, tích hợp `ICashbookService.DisburseCashAsync()` | Chuẩn bị triển khai trong Cụm 5 |

## Tái sử dụng được
- `MT_GRMS.Infrastructure/Persistence/AppDbContext.cs` — DbSet `Employees`, `EmployeeAllowances`, `ShiftConfigs`, `EmployeeSchedules`, `Payslips`, cấu hình Fluent API.
- `MT_GRMS.Application/Common/Exceptions/BusinessException.cs` & `NotFoundException.cs` — Xử lý lỗi chuẩn HTTP 400/404/409.
- `MT_GRMS.Application/Common/Interfaces/ICurrentTenantContext.cs` — Lấy thông tin `TenantId` tự động.
- `MT_GRMS.Application/Finance/Cashbooks/ICashbookService.cs` — Tự động sinh phiếu thu/chi sổ quỹ.

## Xung đột / rủi ro kỹ thuật đã kiểm soát
- [ĐÃ XỬ LÝ] `BaseTenantEntity` tự sinh `Id = Uuid7.NewGuid()` khiến `collection.Add()` bị EF Core hiểu là `EntityState.Modified` $\rightarrow$ Đã xử lý bằng `_context.EmployeeAllowances.Add(newAllowance)`, `_context.Entry(newAllowance).State = EntityState.Added` và chỉ gọi `_dbSet.Update(employee)` khi entity ở trạng thái `Detached`.
- [ĐÃ XỬ LÝ] Ngoại lệ `The association between entity types 'Employee' and 'EmployeeAllowance' has been severed` $\rightarrow$ Đã xử lý bằng cách miễn trừ `EmployeeAllowance` giữ nguyên `DeleteBehavior.Cascade` trong `AppDbContext.cs` và gọi `RemoveRange` trên DbSet.
- [ĐÃ XỬ LÝ] Tách bạch rõ 2 trách nhiệm trong Cụm 2: Nhóm 2.1 Quản lý Danh mục cấu hình Ca (`ShiftConfigs`) và Nhóm 2.2 Lập lịch & Ban hành Ca (`Schedules`).

## Kết luận: Khả thi
Toàn bộ mã nguồn Cụm 1 (REQ-01) đã được kiểm chứng tương thích và build sạch 0 lỗi. Cụm 2 đã được chuẩn bị đầy đủ kiến trúc và task chi tiết.
