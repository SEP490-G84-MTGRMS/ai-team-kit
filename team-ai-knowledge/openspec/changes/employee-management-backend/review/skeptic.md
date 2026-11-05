# Skeptic Review: employee-management-backend

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 7 REQ trọng tâm. Bổ sung trọn vẹn REQ-07 quản lý Chính sách Chấm công Chi nhánh (`BranchAttendancePolicy`) với quy tắc quy đổi ngày công, dung sai đi muộn/về sớm (Grace Period), cấu hình làm thêm giờ (OT) và API sao chép đa chi nhánh (`copy`). Bao phủ các edge cases: fallback về cấu hình mặc định khi chi nhánh chưa từng thiết lập, Upsert an toàn, và ngăn chặn sao chép sang chi nhánh ngoài Tenant. |
| D2 Correctness | 5/5 | Kiến trúc bóc tách chuẩn xác giữa `ShiftConfig` (danh mục khung giờ ca) và `BranchAttendancePolicy` (chính sách chấm công toàn chi nhánh), triệt tiêu hoàn toàn sự dư thừa lặp lại dữ liệu và giảm thiểu gánh nặng thao tác cho người quản trị. Tiếp tục bảo đảm an toàn với các giải pháp EF Core Change Tracker cho phụ cấp nhân viên và quy tắc `BR-EMP-03`. |
| D3 Coherence | 5/5 | Thống nhất giữa Specs, DTO (`AttendancePolicyDto`, `UpsertAttendancePolicyRequest`, `CopyAttendancePolicyRequest`), Entity (`BranchAttendancePolicy`), Persistence Configuration và giao diện Frontend (`AttendanceConfigModal.tsx`). |
| D4 Constraints | 5/5 | Bảo vệ cô lập Multi-tenant tuyệt đối (`TenantId`), Unique Index `(TenantId, BranchId)` với Soft Delete filter `"IsDeleted" = false`, phân quyền RBAC và kiểm tra quyền sở hữu chi nhánh trước khi sao chép. |
| D5 Blast Radius | 5/5 | Thêm bảng mới `BranchAttendancePolicies` hoàn toàn không ảnh hưởng tới các bảng sẵn có của Sales, Inventory, Finance hay HR. Entity `ShiftConfig` được giữ tinh gọn, đúng chức năng. |

## Vấn đề đã xử lý
- [HIGH] REQ-07: Vấn đề trùng lặp dữ liệu và bất tiện quản trị nếu nhúng cấu hình chấm công trực tiếp vào từng ca làm việc (`ShiftConfig`).
  - *Phân tích:* Một chi nhánh có nhiều ca làm việc nhưng thường áp dụng chung 1 bộ quy tắc tính công (8h/công, mốc nửa công) và dung sai đi trễ/OT. Nếu gắn vào `ShiftConfig`, mỗi ca mới đều phải điền lại và khi đổi chính sách phải sửa từng ca một.
  - *Giải pháp:* Tách hẳn thành Entity độc lập `BranchAttendancePolicy` liên kết 1-1 với `BranchId`. Cung cấp API Upsert theo chi nhánh và API sao chép chính sách sang các chi nhánh khác trong Tenant. → **Đã cập nhật chi tiết trong `specs.md` và `tasks.md`**.
- [HIGH] REQ-01: Lỗi `DbUpdateConcurrencyException` khi thêm mới phụ cấp trong lúc cập nhật nhân viên. → **Đã xử lý triệt để trong `EmployeeRepository.cs`**.
- [HIGH] REQ-01: Lỗi đứt gãy quan hệ (`severed relationship`) khi xóa phụ cấp cũ. → **Đã xử lý triệt để trong `AppDbContext.cs` và `EmployeeRepository.cs`**.
- [HIGH] REQ-01: Quy tắc nghiệp vụ `BR-EMP-03` bảo toàn dữ liệu lịch sử ca / phiếu lương khi xóa nhân viên. → **Đã xử lý trong `EmployeeService.cs`**.
- [MEDIUM] REQ-02 & REQ-03: Tách biệt rõ ràng quản lý danh mục ca (`ShiftConfigs`) và phân ca tuần (`Schedules`). → **Đã thể hiện trong `specs.md`**.

## Kết luận: Chấp nhận
Specs và mô hình dữ liệu đã hoàn toàn hoàn thiện và sẵn sàng để triển khai code cho các task tiếp theo.
