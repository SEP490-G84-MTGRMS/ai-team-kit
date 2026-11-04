# Design Brief: shift-config-crud

## 1. Luồng người dùng & Trải nghiệm (User Flow & UX)
```
[ Chủ cửa hàng vào Cài đặt Ca làm việc ]
               │
               ▼
[ Xem danh sách ca hiện tại của Chi nhánh ] ◄── (Bộ lọc: Đang dùng / Ngừng dùng)
   ├── Bấm [+ Thêm ca làm việc] ──> Modal nhập thông tin ──> Lưu ──> Cập nhật bảng
   ├── Bấm [Sửa] ──> Modal chỉnh sửa khung giờ/tên ca ──> Cập nhật
   ├── Gạt công tắc [Kích hoạt] ──> Bật/Tắt IsActive tức thì
   └── Bấm [Xóa] ──> Modal xác nhận ──> Xóa mềm (IsDeleted = true)
```

## 2. Thiết kế Thành phần Giao diện & Trạng thái (UI Components & States)
- **Vị trí tích hợp:** Tab *Cấu hình ca* trong trang Quản lý Lịch làm việc ([`WorkSchedulePage.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/employee/pages/WorkSchedulePage.tsx)) hoặc modal riêng.
- **Thành phần:**
  - `ShiftConfigTable`: Bảng liệt kê: Mã ca, Tên ca, Khung giờ làm việc (`StartTime` - `EndTime`), Thời lượng (`DurationHours`), Khung Check-in (`AllowedCheckInStart` - `AllowedCheckInEnd`), Trạng thái (`Switch` kích hoạt), Nút thao tác (Sửa/Xóa).
  - `ShiftConfigModal`: Form tạo mới / chỉnh sửa ca sử dụng Ant Design `TimePicker.RangePicker`, `Input`, `InputNumber`, `Switch`.
- **Trạng thái UI:**
  - *Loading:* Hiển thị Skeleton/Spin của Ant Design khi đang tải danh sách ca.
  - *Empty:* Hiển thị `Empty` component: *"Chưa có ca làm việc nào. Bấm 'Thêm ca' để tạo ca mẫu đầu tiên cho chi nhánh."*
  - *Error:* Hiển thị `Alert` đỏ kèm nút *Thử lại* nếu API lỗi kết nối.

## 3. Thiết kế Hợp đồng API & DTOs (API Contracts & DTOs)

### 3.1. Các Endpoints RESTful
| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---:|:---|
| `GET` | `/api/v1/hr/shift-configs` | Owner, Manager, Staff | Lấy danh sách ca theo `branchId` (query `isActive`) |
| `GET` | `/api/v1/hr/shift-configs/{id}` | Owner, Manager | Lấy chi tiết một ca |
| `POST` | `/api/v1/hr/shift-configs` | Owner, Manager | Tạo mới ca làm việc |
| `PUT` | `/api/v1/hr/shift-configs/{id}` | Owner, Manager | Cập nhật toàn bộ thông tin ca |
| `PATCH` | `/api/v1/hr/shift-configs/{id}/status` | Owner, Manager | Bật/tắt trạng thái hoạt động (`IsActive`) |
| `DELETE` | `/api/v1/hr/shift-configs/{id}` | Owner, Manager | Xóa mềm ca làm việc |

### 3.2. Data Transfer Objects (DTOs)
```csharp
public record CreateShiftConfigRequest(
    Guid BranchId,
    string ShiftCode,
    string ShiftName,
    TimeSpan StartTime,
    TimeSpan EndTime,
    decimal? DurationHours,
    TimeSpan? AllowedCheckInStart,
    TimeSpan? AllowedCheckInEnd,
    string? Description,
    bool IsActive = true
);

public record UpdateShiftConfigRequest(
    string ShiftName,
    TimeSpan StartTime,
    TimeSpan EndTime,
    decimal? DurationHours,
    TimeSpan? AllowedCheckInStart,
    TimeSpan? AllowedCheckInEnd,
    string? Description,
    bool IsActive = true
);

public record ShiftConfigResponse(
    Guid Id,
    Guid BranchId,
    string ShiftCode,
    string ShiftName,
    TimeSpan StartTime,
    TimeSpan EndTime,
    decimal DurationHours,
    TimeSpan AllowedCheckInStart,
    TimeSpan AllowedCheckInEnd,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
```

## 4. Thiết kế Cơ sở Dữ liệu (Database Design)
- Đã có thực thể `ShiftConfig` ánh xạ tới bảng `ShiftConfigs`:
  - Khóa chính: `Id` (UUIDv7, cột `ShiftConfigID`).
  - Khóa ngoại: `TenantId` (`varchar(50)`), `BranchId` (`uniqueidentifier`).
  - Cột dữ liệu: `ShiftCode`, `ShiftName`, `StartTime`, `EndTime`, `DurationHours`, `AllowedCheckInStart`, `AllowedCheckInEnd`, `Description`, `IsActive`.
  - Khóa tự động: `CreatedAt`, `UpdatedAt`, `IsDeleted`, `DeletedAt` từ `BaseTenantEntity`.
  - Chỉ mục duy nhất (Unique Index): `(TenantId, BranchId, ShiftCode)` có lọc `IsDeleted = false`.

## 5. Quy tắc Nghiệp vụ cốt lõi (Business Rules)
- **BR-SHF-01 (Mã ca duy nhất):** Trong cùng một chi nhánh, không được phép tồn tại 2 ca có cùng `ShiftCode` chưa bị xóa.
- **BR-SHF-02 (Tự động tính thời lượng):** Nếu client không gửi `DurationHours`, hệ thống tự tính:
  - Nếu `EndTime > StartTime`: `DurationHours = (EndTime - StartTime).TotalHours`
  - Nếu `EndTime < StartTime` (ca qua đêm): `DurationHours = (EndTime + 24h - StartTime).TotalHours`
- **BR-SHF-03 (Khung Check-in mặc định):** Nếu client không cung cấp:
  - `AllowedCheckInStart` mặc định = `StartTime - 30 phút`
  - `AllowedCheckInEnd` mặc định = `StartTime + 60 phút`
- **BR-SHF-04 (Bảo vệ dữ liệu lịch sử):** Xóa ca chỉ đặt cờ `IsDeleted = true`. Các dòng lịch làm việc trong quá khứ đã dùng `ShiftCode` này vẫn giữ nguyên vẹn.
