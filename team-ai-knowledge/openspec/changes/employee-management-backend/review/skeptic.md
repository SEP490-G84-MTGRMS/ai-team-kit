# Skeptic Review: employee-management-backend

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 6 REQ trọng tâm. Bao phủ toàn diện các edge cases phức tạp: kiểm tra trùng CCCD/SĐT cùng tenant, đồng bộ phụ cấp 3 chiều (Insert/Update/Delete) đồng thời trong 1 request PUT, chống xung đột ca cùng ngày, chấm công GPS Geofencing, đóng ca thiếu giải trình lệch tiền theo GBR-POS-04, và chặn đúp bảng lương/phiếu lương. |
| D2 Correctness | 5/5 | Giải quyết triệt để 2 lỗi nhạy cảm của EF Core Change Tracker đối với thực thể con `EmployeeAllowance`: (1) Tránh `DbUpdateConcurrencyException` do `BaseTenantEntity` tự sinh `Id = Uuid7.NewGuid()` bằng cách ép tường minh `_context.EmployeeAllowances.Add()` kèm `EntityState.Added`; (2) Tránh `severed relationship` bằng cách dùng `RemoveRange(toDelete)` trên DbSet thay vì gọi `employee.Allowances.Remove(item)` trên quan hệ bắt buộc non-nullable `EmployeeId`. Logic 9 mệnh giá POS và công thức NetSalary chuẩn xác. |
| D3 Coherence | 5/5 | Đồng nhất hoàn hảo giữa Specs, DTO (`EmployeeAllowanceDto.Id` dạng `Guid?`), Repository Contract (`SyncAllowances`), và Frontend Mapper (`mapFormToCreatePayload`). |
| D4 Constraints | 5/5 | Đảm bảo tính cô lập Multi-tenant tuyệt đối (`TenantId`), chuẩn tiền tệ `decimal(18,2)`, chuẩn thời gian UTC khi lưu DB và bảo vệ phân quyền theo RBAC. |
| D5 Blast Radius | 5/5 | Tác động an toàn: giới hạn cập nhật trong aggregate `Employee` và `EmployeeAllowance`, không làm ảnh hưởng hay phá vỡ cấu trúc của các module khác (Sales, Inventory, Finance). |

## Vấn đề đã xử lý
- [HIGH] REQ-01: Lỗi `DbUpdateConcurrencyException` khi thêm mới phụ cấp trong lúc cập nhật nhân viên.
  - *Nguyên nhân:* Constructor `BaseTenantEntity` sinh sẵn Guid khiến EF Core Change Tracker nhận diện nhầm bản ghi mới là `EntityState.Modified` thay vì `EntityState.Added`.
  - *Giải pháp:* Gọi `_context.EmployeeAllowances.Add(newAllowance)` và gán `_context.Entry(newAllowance).State = EntityState.Added`. → **Đã xử lý triệt để trong `EmployeeRepository.cs`**.
- [HIGH] REQ-01: Lỗi đứt gãy quan hệ (`severed relationship`) khi xóa phụ cấp cũ.
  - *Nguyên nhân:* Khóa ngoại `EmployeeId` là non-nullable; việc gọi `employee.Allowances.Remove(item)` ngắt liên kết quan hệ trong bộ nhớ.
  - *Giải pháp:* Chỉ gọi `_context.EmployeeAllowances.RemoveRange(toDelete)` trên DbSet. → **Đã xử lý triệt để trong `EmployeeRepository.cs`**.
- [MEDIUM] REQ-04 & REQ-05: Đảm bảo tính Idempotent khi duyệt ca và thanh toán lương để chống sinh đúp phiếu thu/chi trên Sổ quỹ. → *Đã thể hiện trong Scenario REQ-04 và REQ-05*.

## Kết luận: Chấp nhận
Specs và giải pháp kỹ thuật đã hoàn toàn sẵn sàng, các ca kiểm thử và kịch bản bất đồng bộ EF Core đã được tháo gỡ an toàn.
