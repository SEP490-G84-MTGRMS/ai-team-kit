# Proposal: shift-config-crud

## 1. Vấn đề (Problem Statement)
Hiện tại hệ thống MT-GRMS đã có thực thể cơ sở dữ liệu `ShiftConfig` (`ShiftConfigs` table), tuy nhiên:
- Chưa có phân hệ API Controller (`ShiftConfigsController`), DTOs, Service và Repository để thực hiện các thao tác quản lý danh mục ca làm việc (CRUD).
- Khi Chủ cửa hàng (Store Owner) hoặc Quản lý chi nhánh xếp lịch tuần cho nhân viên trên màn hình `WorkSchedulePage`, hệ thống chưa có danh mục ca chuẩn để chọn nhanh mà phải nhập thủ công từng mốc giờ (giờ bắt đầu, giờ kết thúc, khung giờ mở/đóng check-in).
- Việc thiếu danh mục ca chuẩn dẫn đến dữ liệu lịch làm việc không đồng nhất, dễ nhầm lẫn thời gian và làm giảm trải nghiệm vận hành của chủ tiệm.

## 2. Mục tiêu (Objectives)
- Xây dựng trọn vẹn cụm tính năng **Quản lý danh mục ca làm việc (CRUD Shift Config Master Data)** theo từng chi nhánh.
- Cho phép Chủ cửa hàng định nghĩa sẵn các khung ca mẫu (Ví dụ: Ca Sáng `06:00 - 14:00`, Ca Chiều `14:00 - 22:00`, Ca Tối `18:00 - 22:00`, Ca Hành chính `08:00 - 17:00`).
- Tự động hóa việc cung cấp danh sách ca chuẩn cho phân hệ Xếp lịch tuần (`EmployeeSchedules`), giúp việc phân ca cho nhân viên chỉ cần 1 cú click chọn mã ca.

## 3. Phạm vi (Scope)

### In scope:
- **Backend API (.NET 8 Clean Architecture):**
  - `GET /api/v1/hr/shift-configs`: Lấy danh sách ca làm việc theo chi nhánh (`branchId`), hỗ trợ lọc ca đang hoạt động (`isActive = true/false`).
  - `GET /api/v1/hr/shift-configs/{id}`: Xem chi tiết cấu hình ca làm việc.
  - `POST /api/v1/hr/shift-configs`: Tạo mới ca làm việc chuẩn cho chi nhánh.
  - `PUT /api/v1/hr/shift-configs/{id}`: Cập nhật thông tin khung giờ, tên ca, thời lượng và ghi chú.
  - `PATCH /api/v1/hr/shift-configs/{id}/status`: Bật / tắt trạng thái kích hoạt của ca (`IsActive`).
  - `DELETE /api/v1/hr/shift-configs/{id}`: Xóa mềm ca làm việc (Soft delete - `IsDeleted = true`).
- **Quy tắc nghiệp vụ & Ràng buộc toàn vẹn dữ liệu:**
  - Mã ca (`ShiftCode`) là duy nhất trong phạm vi cùng một chi nhánh (`BranchId`) của cùng một `TenantId`.
  - Khung giờ hợp lệ: `DurationHours > 0`, `AllowedCheckInStart <= StartTime`, `AllowedCheckInEnd >= StartTime`.
  - Hỗ trợ ca làm việc cùng ngày (`StartTime < EndTime`) và ca vắt đêm (`StartTime > EndTime`).
- **Phân quyền & Multi-tenancy:**
  - Tự động cô lập dữ liệu theo `TenantId` qua `BaseTenantEntity`.
  - Chỉ người dùng có vai trò `Store Owner` hoặc `Store Manager` mới có quyền cấu hình ca.

### Out of scope:
- Chưa bao gồm nghiệp vụ tự động hoán đổi ca làm việc giữa hai nhân viên.
- Chưa tính toán chính sách hệ số phụ cấp ca đêm hoặc ca gãy vào bảng lương (sẽ được xử lý ở module Payroll).

## 4. Người dùng & Vai trò liên quan (Actors & Roles)
- **Chủ cửa hàng (`Store Owner`) / Quản lý chi nhánh (`Store Manager`):** Thao tác tạo, sửa, ngừng kích hoạt hoặc xóa ca làm việc mẫu.
- **Hệ thống Xếp lịch tuần (`WorkSchedule Service`):** Đọc danh mục ca mẫu đang hoạt động (`IsActive = true`) để điền tự động dữ liệu vào bảng `EmployeeSchedules`.

## 5. Tiêu chí thành công (Success Criteria)
- [ ] API trả về danh sách ca làm việc chuẩn theo từng chi nhánh với thời gian phản hồi $\le 150\text{ms}$.
- [ ] Tạo mới thành công ca làm việc với đầy đủ các mốc: `ShiftCode`, `ShiftName`, `StartTime`, `EndTime`, `DurationHours`, `AllowedCheckInStart`, `AllowedCheckInEnd`.
- [ ] Chặn thành công trường hợp tạo trùng `ShiftCode` trong cùng chi nhánh với mã lỗi nghiệp vụ rõ ràng (`DUPLICATE_SHIFT_CODE`).
- [ ] Hỗ trợ cập nhật và bật/tắt trạng thái ca (`IsActive`) an toàn mà không ảnh hưởng đến các ca đã xếp trong quá khứ.
- [ ] Viết đầy đủ Unit Tests kiểm thử Service và Validation đạt 100% pass.
