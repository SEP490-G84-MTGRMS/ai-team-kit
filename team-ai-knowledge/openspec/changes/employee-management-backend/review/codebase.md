# Codebase Review: employee-management-backend

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa | Ghi chú |
|---|---|---|---|
| REQ-01 | `MT_GRMS.Domain/Entities/HR/Employee.cs`, `EmployeeAllowance.cs` | Bổ sung `SyncAllowances` trong `EmployeeRepository.cs`, `Guid? Id` trong `EmployeeDtos.cs` | Đã triển khai xong, sửa triệt để lỗi ConcurrencyException & Severed relationship |
| REQ-02 | `MT_GRMS.Domain/Entities/HR/ShiftConfig.cs` | DTOs & Service quản lý ca đa chi nhánh (`BranchIds` jsonb) | Chuẩn bị triển khai |
| REQ-03 | `MT_GRMS.Domain/Entities/HR/EmployeeSchedule.cs` | Logic phân ca batch và kiểm tra chống trùng thời gian | Chuẩn bị triển khai |
| REQ-04 | `MT_GRMS.Application/HR/Attendance` | Tích hợp công thức Haversine tính khoảng cách GPS | Chuẩn bị triển khai |
| REQ-05 | `MT_GRMS.Domain/Entities/POS/ShiftZReport.cs` | Migration thêm `DenominationDetailsJson`, tích hợp `ICashbookService` | Chuẩn bị triển khai |
| REQ-06 | `MT_GRMS.Domain/Entities/HR/Payslip.cs` | Payroll Engine tính lương tự động từ ngày công | Chuẩn bị triển khai |

## Tái sử dụng được
- `MT_GRMS.Infrastructure/Persistence/AppDbContext.cs` — DbSet `Employees`, `EmployeeAllowances`, cấu hình Fluent API.
- `MT_GRMS.Application/Common/Exceptions/BusinessException.cs` & `NotFoundException.cs` — Xử lý lỗi chuẩn HTTP 400/404/409.
- `MT_GRMS.Application/Common/Interfaces/ICurrentTenantContext.cs` — Lấy thông tin `TenantId` tự động.
- `MT_GRMS.Application/Finance/Cashbooks/ICashbookService.cs` — Tự động sinh phiếu thu/chi sổ quỹ.

## Xung đột / rủi ro kỹ thuật đã kiểm soát
- [ĐÃ XỬ LÝ] `BaseTenantEntity` tự sinh `Id = Uuid7.NewGuid()` khiến `collection.Add()` bị EF Core hiểu là `EntityState.Modified` $\rightarrow$ Đã xử lý bằng `_context.EmployeeAllowances.Add(newAllowance)` và `_context.Entry(newAllowance).State = EntityState.Added`.
- [ĐÃ XỬ LÝ] Ngoại lệ `The association between entity types 'Employee' and 'EmployeeAllowance' has been severed` $\rightarrow$ Đã xử lý bằng cách chỉ gọi `RemoveRange` trên DbSet, không xóa thủ công khỏi navigation collection.

## Kết luận: Khả thi
Toàn bộ mã nguồn Cụm 1 (REQ-01) đã được kiểm chứng tương thích và build sạch 0 lỗi.
