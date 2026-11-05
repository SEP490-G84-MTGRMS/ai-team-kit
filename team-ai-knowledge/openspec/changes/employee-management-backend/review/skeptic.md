# Skeptic Review: employee-management-backend

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 6 REQ trọng tâm. Cụm 2 đã được bóc tách rõ ràng thành Nhóm 2.1 (Quản lý Danh mục & Cấu hình Ca `ShiftConfigs`) và Nhóm 2.2 (Lập lịch & Ban hành Ca `Schedules`). Bao phủ toàn diện các edge cases phức tạp: kiểm tra trùng CCCD/SĐT cùng tenant, đồng bộ phụ cấp 3 chiều (Insert/Update/Delete) đồng thời trong 1 request PUT, quy tắc BR-EMP-03 chặn xóa nhân viên đã có ca/lương, chống xung đột ca cùng ngày, chấm công GPS Geofencing, đóng ca thiếu giải trình lệch tiền theo GBR-POS-04, và chặn đúp bảng lương/phiếu lương. |
| D2 Correctness | 5/5 | Giải quyết triệt để 2 lỗi nhạy cảm của EF Core Change Tracker đối với thực thể con `EmployeeAllowance`: (1) Tránh `DbUpdateConcurrencyException` do `BaseTenantEntity` tự sinh `Id = Uuid7.NewGuid()` bằng cách ép tường minh `_context.EmployeeAllowances.Add()` kèm `EntityState.Added` và chỉ update root entity khi `Detached`; (2) Tránh `severed relationship` bằng cách miễn trừ `EmployeeAllowance` giữ nguyên `DeleteBehavior.Cascade` trong `AppDbContext.cs` và gọi `RemoveRange(toDelete)` trên DbSet. Logic 9 mệnh giá POS và công thức NetSalary chuẩn xác. |
| D3 Coherence | 5/5 | Đồng nhất hoàn hảo giữa Specs, DTO (`EmployeeAllowanceDto.Id` dạng `Guid?`, `ShiftConfigDto`), Repository Contract (`SyncAllowances`, `IShiftConfigRepository`, `IScheduleRepository`), và Frontend Mapper (`mapFormToCreatePayload`). |
| D4 Constraints | 5/5 | Đảm bảo tính cô lập Multi-tenant tuyệt đối (`TenantId`), chuẩn tiền tệ `decimal(18,2)`, chuẩn thời gian UTC khi lưu DB và bảo vệ phân quyền theo RBAC. |
| D5 Blast Radius | 5/5 | Tác động an toàn: giới hạn cập nhật trong aggregate `Employee`, `EmployeeAllowance`, `ShiftConfig`, `EmployeeSchedule`, không làm ảnh hưởng hay phá vỡ cấu trúc của các module khác (Sales, Inventory, Finance). |

## Vấn đề đã xử lý
- [HIGH] REQ-01: Lỗi `DbUpdateConcurrencyException` khi thêm mới phụ cấp trong lúc cập nhật nhân viên.
  - *Nguyên nhân:* Constructor `BaseTenantEntity` sinh sẵn Guid và `_employeeRepository.Update()` gọi `_dbSet.Update()` vô điều kiện khiến EF Core Change Tracker nhận diện nhầm bản ghi mới là `EntityState.Modified` thay vì `EntityState.Added`, sinh lệnh UPDATE bản ghi chưa có trong DB dẫn tới 0 rows affected.
  - *Giải pháp:* Gọi `_context.EmployeeAllowances.Add(newAllowance)`, gán `_context.Entry(newAllowance).State = EntityState.Added`, đồng bộ vào `employee.Allowances` và chỉ gọi `_dbSet.Update(employee)` khi entity ở trạng thái `Detached`. → **Đã xử lý triệt để trong `EmployeeRepository.cs`**.
- [HIGH] REQ-01: Lỗi đứt gãy quan hệ (`severed relationship`) khi xóa phụ cấp cũ.
  - *Nguyên nhân:* Khóa ngoại `EmployeeId` là non-nullable; vòng lặp tắt Cascade trong `AppDbContext.cs` đã ghi đè quan hệ `EmployeeAllowance` thành `Restrict`.
  - *Giải pháp:* Miễn trừ `EmployeeAllowance` giữ nguyên `DeleteBehavior.Cascade` trong `AppDbContext.cs`, và dọn dẹp an toàn qua `_context.EmployeeAllowances.RemoveRange(toDelete)`. → **Đã xử lý triệt để trong `AppDbContext.cs` và `EmployeeRepository.cs`**.
- [HIGH] REQ-01: Quy tắc nghiệp vụ `BR-EMP-03` bảo toàn dữ liệu lịch sử chấm công / sổ quỹ.
  - *Giải pháp:* Bổ sung hàm kiểm tra `HasWorkOrPayrollHistoryAsync()` ngăn chặn xóa nhân viên đã có lịch ca (`EmployeeSchedule`) hoặc phiếu lương (`Payslip`); đồng thời dọn dẹp sạch toàn bộ `EmployeeAllowances` khi xóa nhân viên hợp lệ. → **Đã xử lý trong `EmployeeService.cs`**.
- [MEDIUM] Cụm 2 (REQ-02 & REQ-03): Tách biệt rõ ràng quản lý danh mục cấu hình ca (`ShiftConfigs` đa chi nhánh, ca qua đêm) và phân ca tuần (`Schedules` chống trùng khung giờ). → **Đã cập nhật chi tiết trong `specs.md`, `design-brief.md` và `tasks.md`**.
- [MEDIUM] REQ-05 & REQ-06: Đảm bảo tính Idempotent khi duyệt ca và thanh toán lương để chống sinh đúp phiếu thu/chi trên Sổ quỹ. → *Đã thể hiện trong Scenario REQ-05 và REQ-06*.

## Kết luận: Chấp nhận
Specs và giải pháp kỹ thuật đã hoàn toàn sẵn sàng, các ca kiểm thử và kịch bản bất đồng bộ EF Core đã được tháo gỡ an toàn.
