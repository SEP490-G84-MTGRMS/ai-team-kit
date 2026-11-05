# Exploration: shift-config-crud

## 1. Hiện trạng Code & Bối cảnh (Current State & Context)
- **Domain Entity:** Đã có thực thể `ShiftConfig.cs` tại `MT_GRMS.Domain/Entities/HR/ShiftConfig.cs` kế thừa `BaseTenantEntity` với các trường: `BranchId`, `ShiftCode`, `ShiftName`, `StartTime`, `EndTime`, `DurationHours`, `AllowedCheckInStart`, `AllowedCheckInEnd`, `Description`, `IsActive`.
- **Infrastructure Configuration:** Đã có `ShiftConfigConfiguration.cs` tại `MT_GRMS.Infrastructure/Persistence/Configurations/HR/ShiftConfigConfiguration.cs` và khai báo `DbSet<ShiftConfig> ShiftConfigs` trong `AppDbContext.cs`.
- **Thiếu sót hiện tại:**
  - Chưa có Repository chuyên biệt `IShiftConfigRepository` và implementation `ShiftConfigRepository`.
  - Chưa có tầng Application: DTOs (`ShiftConfigDtos.cs`), Validator (`ShiftConfigValidators.cs`), `IShiftConfigService` và `ShiftConfigService`.
  - Chưa có API Controller: `ShiftConfigsController.cs` để phơi bày các endpoint RESTful.
  - Phía Frontend: Màn hình lập lịch `WorkSchedulePage.tsx` và modal `AddScheduleModal.tsx` đang phải dùng mock/hardcode khung giờ thay vì gọi API lấy danh mục ca chuẩn của chi nhánh.

## 2. Giả định (Assumptions)
- **[ASSUMPTION-01]**: Mỗi chi nhánh (`BranchId`) có danh mục ca làm việc độc lập của riêng mình. Các chi nhánh khác nhau có thể đặt cùng một mã ca (VD: cả Chi nhánh Q1 và Chi nhánh Cầu Giấy đều có thể có mã ca `SANG`), nhưng trong cùng một chi nhánh thì `ShiftCode` là duy nhất.
- **[ASSUMPTION-02]**: Chỉ tài khoản có vai trò Quản lý (`Store Owner`, `Store Manager` hoặc Admin Tenant) mới có quyền tạo/sửa/xóa danh mục ca. Nhân viên bán hàng chỉ có quyền xem (Read-only) khi xem lịch.
- **[ASSUMPTION-03]**: Khi một ca mẫu bị xóa mềm (`IsDeleted = true`) hoặc tắt kích hoạt (`IsActive = false`), các bản ghi lịch làm việc trong quá khứ (`EmployeeSchedules`) vẫn giữ nguyên snapshot dữ liệu và không bị ảnh hưởng.

## 3. Phạm vi & Non-Goals
### In Scope:
- Xây dựng trọn vẹn cụm API CRUD:
  - `GET /api/v1/hr/shift-configs`: Danh sách ca theo chi nhánh (kèm query `isActive`).
  - `GET /api/v1/hr/shift-configs/{id}`: Chi tiết ca.
  - `POST /api/v1/hr/shift-configs`: Tạo mới ca.
  - `PUT /api/v1/hr/shift-configs/{id}`: Cập nhật thông tin ca.
  - `PATCH /api/v1/hr/shift-configs/{id}/status`: Bật/tắt trạng thái `IsActive`.
  - `DELETE /api/v1/hr/shift-configs/{id}`: Xóa mềm ca.
- Kiểm tra hợp lệ dữ liệu bằng `FluentValidation`.
- Viết Unit Tests đầy đủ cho Service.

### Non-Goals (Ngoài phạm vi):
- Không quản lý việc đổi ca / xin nghỉ ca giữa các nhân viên (thuộc về workflow duyệt nghỉ phép).
- Không tự động tính phụ cấp lương ca đêm / ca gãy tại module này (thuộc về module Payroll).

## 4. Đánh giá các phương án kỹ thuật (Options Analysis)

### Phương án A: Tách module riêng biệt chuẩn Clean Architecture (Khuyên dùng)
- **Cách làm:** Xây dựng `IShiftConfigRepository`, `IShiftConfigService`, `ShiftConfigsController` độc lập trong phân hệ `HR/ShiftConfigs`.
- **Ưu điểm:**
  - Tuân thủ nguyên lý Đơn trách nhiệm (Single Responsibility Principle - SRP).
  - Controller tinh gọn, dễ viết Unit Test độc lập với mock repository.
  - Dễ bảo trì và mở rộng khi sau này thêm các quy tắc ca nâng cao (phân ca tự động, ca xoay vòng).
- **Nhược điểm:** Tăng số lượng file class trong project.

### Phương án B: Gộp chung vào `EmployeeService` hoặc `WorkScheduleService`
- **Cách làm:** Thêm các method CRUD shift vào thẳng service quản lý nhân viên/lịch làm việc hiện có.
- **Ưu điểm:** Ít file hơn.
- **Nhược điểm:** Làm phình to `EmployeeService` (God class), vi phạm SRP, khó viết unit test biệt lập.

👉 **Lựa chọn:** Chọn **Phương án A** vì phù hợp 100% với chuẩn Clean Architecture của toàn solution `MT_GRMS_BACKEND`.

## 5. Rủi ro & Giải pháp giảm thiểu (Risks & Mitigations)
- **Rủi ro 1: Ca làm việc qua đêm (Overnight shift):** Giờ kết thúc nhỏ hơn giờ bắt đầu (VD: `22:00` đến `06:00` sáng hôm sau).
  - *Giải pháp:* Công thức tính thời lượng hỗ trợ ca qua đêm: `DurationHours = (EndTime < StartTime) ? (EndTime + 24h - StartTime) : (EndTime - StartTime)`.
- **Rủi ro 2: Trùng mã ca do bấm gửi liên tiếp:**
  - *Giải pháp:* Đặt unique index `(TenantId, BranchId, ShiftCode)` trong DB và kiểm tra `ExistsAsync` trước khi lưu.
- **Rủi ro 3: Xóa nhầm ca đang có lịch làm việc sắp tới:**
  - *Giải pháp:* Không xóa vật lý; dùng Soft Delete (`IsDeleted = true`), đồng thời kiểm tra nếu ca đang có lịch sắp tới thì cảnh báo hoặc chỉ cho phép chuyển `IsActive = false`.
