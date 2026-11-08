# Design Brief: schedule-approval-requests

## 1. Luồng người dùng (User Flows)

### 1.1. Luồng Nhân viên gửi đơn (Staff Flow)
```
[Lịch làm việc / Điểm danh]
        │
        ├── Ca chưa làm ───► Bấm Menu ───► [Modal Xin nghỉ phép] OR [Modal Xin đổi ca]
        │
        └── Ca đã/đang làm ─► Bấm Menu ───► [Modal Báo lỗi FaceID] OR [Modal Xin OT]
                                                    │
                                                    ▼
                                            [Submit Form]
                                                    │
                                                    ▼
                                    Backend Validate (PayslipId == null?)
                                                    │
                                                    ▼
                                    Lưu bảng ScheduleApprovalRequests (Pending)
                                                    │
                                                    ▼
                                    Badge trên ca chuyển sang "Chờ duyệt"
```

### 1.2. Luồng Quản lý phê duyệt (Store Owner / Manager Flow)
```
[AppTopNav Icon Chuông] ──► Hiển thị số lượng badge đỏ (đơn Pending)
        │
        ▼ Click mở Modal
[Modal Duyệt Yêu Cầu] ──► 4 Tabs: Nghỉ phép | Đổi ca | Chấm công sự cố | OT
        │
        ├── Chọn "Từ chối" ──► Nhập lý do từ chối ──► Cập nhật Status = Rejected
        │
        └── Chọn "Phê duyệt" ──► Cập nhật Status = Approved
                                        │
                                        ▼ Đồng bộ dữ liệu ca gốc (EmployeeSchedule)
                                        - LeaveRequest: Status = OnLeave, IsLeave = true, IsPaidLeave = ...
                                        - ShiftSwap: Hoán đổi / chuyển giao EmployeeId
                                        - CheckInIncident: Set CheckInTime, CheckInMethod = "INCIDENT_EXPLAINED", tính lại giờ
                                        - Overtime: Cộng dồn OvertimeMinutes
```

---

## 2. Màn hình & Component UI (Frontend)

| Component | Vị trí | Thư viện & Trạng thái |
|---|---|---|
| `CreateScheduleRequestModal.tsx` | `src/features/employee/components/` | Ant Design `Modal`, `Form`, `Select`, `Input.TextArea`, `Upload`. Hỗ trợ 4 loại form tương ứng 4 Enums. |
| `ScheduleRequestsHistoryModal.tsx` | `src/features/employee/components/` | Ant Design `Modal`, `Timeline` / `List` hiển thị lịch sử các đơn đã gửi của ca kèm lý do và ghi chú của Quản lý. |
| `ApprovalRequestsModal.tsx` | `src/layouts/EmployeeLayout/` | Ant Design `Modal`, `Tabs`, `Table`, `Image.PreviewGroup`, `Badge`. Có nút Duyệt/Từ chối nhanh. |
| `AppTopNav.tsx` | `src/layouts/EmployeeLayout/` | Bỏ mock `setTimeout`, query React Query / TanStack Query gọi `GET /api/schedule-approval-requests/pending`. |

- **Loading State:** Skeleton table trong Modal duyệt; Spin icon khi submit form đơn.
- **Empty State:** `Empty` component của Antd với mô tả: *"Hiện tại không có yêu cầu nào chờ phê duyệt"*.
- **Error State:** Hiển thị thông báo lỗi từ ProblemDetails của Backend qua Antd `message.error()`.

---

## 3. Thiết kế Cơ sở dữ liệu & Migration

### 3.1. Bảng mới: `ScheduleApprovalRequests`
- **Khóa chính:** `Id` (Guid)
- **Tenant:** `TenantId` (Guid - Partitioning multi-tenant)
- **Liên kết:**
  - `ScheduleId` (Guid, Foreign Key -> `EmployeeSchedules.Id`, OnDelete: Cascade / Restrict)
  - `EmployeeId` (Guid, Foreign Key -> `Employees.Id`)
  - `BranchId` (Guid, Foreign Key -> `Branches.Id`)
  - `TargetEmployeeId` (Guid?, Foreign Key -> `Employees.Id`)
  - `TargetScheduleId` (Guid?, Foreign Key -> `EmployeeSchedules.Id`)
- **Dữ liệu Enums & Nghiệp vụ:**
  - `RequestType` (int / nvarchar - `ScheduleRequestType`)
  - `Status` (int / nvarchar - `ScheduleApprovalStatus`)
  - `Reason` (nvarchar(500), Not Null)
  - `EvidenceImageUrl` (nvarchar(1000), Nullable)
  - `LeaveType` (int / nvarchar Nullable - `LeaveType`)
  - `IsPaidLeave` (bit, Default 0)
  - `SwapType` (int / nvarchar Nullable - `ShiftSwapType`)
  - `PeerConfirmed` (bit Nullable)
  - `PeerConfirmedAt` (datetime2 Nullable)
  - `RequestedCheckInTime` (datetime2 Nullable)
  - `RequestedCheckOutTime` (datetime2 Nullable)
  - `ApprovedCheckInTime` (datetime2 Nullable)
  - `ApprovedCheckOutTime` (datetime2 Nullable)
  - `RequestedOvertimeMinutes` (int Nullable)
  - `ApprovedOvertimeMinutes` (int Nullable)
  - `ReviewNote` (nvarchar(500), Nullable)
  - `ApprovedBy` (nvarchar(100), Nullable)
  - `ApprovedAt` (datetime2 Nullable)
  - `CreatedAt`, `UpdatedAt` (Audit fields)
- **Indexes:**
  - `IX_ScheduleApprovalRequests_TenantId_Status`
  - `IX_ScheduleApprovalRequests_ScheduleId`
  - `IX_ScheduleApprovalRequests_BranchId_Status`

### 3.2. Cập nhật bảng `EmployeeSchedules`:
- Thêm cột: `IsLeave` (bit, Default 0).
- Thêm cột: `IsPaidLeave` (bit, Default 0).
- Cập nhật Enum `Status`: Bổ sung giá trị `OnLeave = 6`.

---

## 4. Đặc tả API & DTOs

1. **`POST /api/employee-schedules/{scheduleId}/requests`**
   - *Role:* `STAFF`, `STORE_OWNER`
   - *Request DTO:* `CreateScheduleApprovalRequestDto` (`RequestType`, `Reason`, `EvidenceImageUrl`, `LeaveType`, `IsPaidLeaveRequested`, `SwapType`, `TargetEmployeeId`, `TargetScheduleId`, `RequestedCheckInTime`, `RequestedOvertimeMinutes`).
   - *Response:* `201 Created` kèm `id` của đơn.

2. **`GET /api/employee-schedules/{scheduleId}/requests`**
   - *Role:* `STAFF`, `STORE_OWNER`
   - *Response:* Danh sách các yêu cầu của ca làm việc đó.

3. **`GET /api/schedule-approval-requests/pending?storeId={id}&type={type}`**
   - *Role:* `STORE_OWNER`, `MANAGER`
   - *Response:* `{ total: number, items: PendingScheduleApprovalRequestDto[] }`.

4. **`POST /api/schedule-approval-requests/{requestId}/review`**
   - *Role:* `STORE_OWNER`
   - *Request DTO:* `ReviewScheduleApprovalRequestDto` (`IsApproved: bool`, `ReviewNote: string`, `IsPaidLeave?: bool`, `ApprovedOvertimeMinutes?: int`, `ApprovedCheckInTime?: DateTime`).
   - *Response:* `200 OK`.

5. **`POST /api/schedule-approval-requests/{requestId}/peer-confirm`**
   - *Role:* `STAFF` (Người nhận được lời mời đổi ca `TargetEmployeeId`).
   - *Request DTO:* `PeerConfirmDto` (`IsAgreed: bool`, `Note?: string`).
   - *Response:* `200 OK`.

---

## 5. Quy tắc phân quyền (RBAC) & Multi-Tenancy
- Tất cả truy vấn và ghi dữ liệu BẮT BUỘC lọc theo `TenantId` từ Claims của JWT Token.
- Nhân viên (`STAFF`):
  - Chỉ được tạo đơn cho ca làm của chính mình.
  - Không thể tự duyệt đơn của mình.
- Chủ cửa hàng (`STORE_OWNER`):
  - Có toàn quyền xem và duyệt tất cả các đơn của các chi nhánh thuộc Tenant của mình.
