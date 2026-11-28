# Design Brief: employee-fe-integration

## 1. Luồng trải nghiệm người dùng & Tương tác API (User & API Flows)

```mermaid
flowchart TD
    A[Màn hình EmployeeListPage] -->|Mount / URL Filter change| B[Gọi employeeApi.getEmployeesPaged]
    B -->|Đang tải| C[Hiển thị Table Skeleton / Loading Spinner]
    B -->|Lỗi mạng / 500| D[Hiển thị Error Banner kèm nút Thử lại]
    B -->|Danh sách rỗng| E[Hiển thị Empty State: Không có dữ liệu]
    B -->|Có dữ liệu| F[Render Bảng Nhân viên + Phân trang server-side TablePagination]

    F -->|Bấm Thêm nhân viên| G[Mở EmployeeFormModal]
    G -->|Upload Avatar| G1[Gọi API Media Cloudinary mtgrms/employees]
    G1 -->|Nhận URL Cloudinary| G2[Hiển thị Avatar Preview]
    G -->|Submit Form| H{Gọi employeeApi.createEmployee}
    H -->|201 Created| I[Đóng modal + Mở NotificationModal Thành công + Refresh danh sách]
    H -->|409 Conflict| J[Hiển thị cảnh báo trong form: Trùng CCCD hoặc SĐT]

    F -->|Bấm Sửa nhân viên| K[Mở EmployeeFormModal nạp dữ liệu cũ]
    K -->|Sync Allowances| K1[Kiểm tra Regex UUID: Phụ cấp mới = undefined ID, cũ = giữ nguyên UUID]
    K -->|Submit Form| L{Gọi employeeApi.updateEmployee}
    L -->|200 OK| I
    L -->|409 Conflict| J

    F -->|Gạt chuyển đổi trạng thái| M[Gọi employeeApi.updateEmployeeStatus]
    M -->|200 OK| N[Cập nhật UI Switch + Mở NotificationModal Cập nhật trạng thái thành công]

    F -->|Bấm Xem chi tiết| O[Mở EmployeeDetailModal: Thông tin 360 độ]
    O -->|Bấm Cấp tài khoản| P[Mở CreateUserModal]
    P -->|Submit| Q{Gọi employeeApi.createIdentityAccount}
    Q -->|200 OK| R[Mở NotificationModal Thành công + Cập nhật badge tài khoản]
    Q -->|409 Conflict| S[Báo lỗi: Tên đăng nhập đã tồn tại]

    F -->|Bấm Xóa nhân viên| T[Mở ConfirmModal: Xác nhận xóa nhân viên]
    T -->|Bấm Hủy| T1[Đóng ConfirmModal, không thực hiện gì]
    T -->|Bấm Xác nhận| U{Gọi employeeApi.deleteEmployee}
    U -->|200 OK| V[Đóng modal + Mở NotificationModal Thành công + Refresh danh sách]
    U -->|400 Lỗi EMPLOYEE_HAS_WORK_HISTORY| W[Mở NotificationModal Cảnh báo BR-EMP-03: Nhân viên đã có ca hoặc lương, gợi ý chuyển Ngừng làm việc]

    A -->|Chuyển tab Cấu hình ca| SC[Màn hình ShiftConfigPage]
    SC -->|Mount| SC1[Gọi shiftConfigApi.getShiftConfigsByBranch]
    SC -->|Bấm Thêm/Sửa ca| SC2[Mở ShiftFormModal: Khung giờ, ca qua đêm, chọn chi nhánh]
    SC2 -->|Submit| SC3[Gọi shiftConfigApi.create / updateShiftConfig]
    SC3 -->|200 OK| SC4[Toast thành công + Làm mới danh sách ca]
```

## 2. Thiết kế Component & Trạng thái Giao diện

### `EmployeeListPage.tsx`
- **Loading State**: Khi đang fetch danh sách, hiển thị hiệu ứng skeleton mượt mà cho 5 hàng dữ liệu bảng để tránh giật lag layout.
- **Empty State**: Khi danh sách rỗng, hiển thị biểu tượng `UserX` kèm thông điệp phù hợp.
- **Pagination Component**: Điều khiển phân trang server-side tích hợp component chung `TablePagination` (`src/components/common/TablePagination.tsx`).
- **Search & Filter**: Input tìm kiếm tích hợp debounce 300ms tự động kích hoạt query API mới. Bộ lọc chi nhánh và trạng thái cập nhật query params.
- **Modals Tích hợp**: Kết nối `NotificationModal` (cho phản hồi create/update/delete/status) và `ConfirmModal` (cho thao tác xác nhận xóa).

### `EmployeeFormModal.tsx`
- Nhận prop `onSave` bất đồng bộ: Hiển thị loading spinner trên nút **[Lưu thông tin]** khi đang gửi request.
- Thông báo lỗi tại chỗ: Nếu backend trả về lỗi 409 Conflict hoặc 400 Validation, hiển thị Alert banner màu đỏ ngay phía trên form:
  + *"Số CCCD đã tồn tại trong hệ thống."*
  + *"Số điện thoại đã được đăng ký cho nhân viên khác."*
- Đồng bộ phụ cấp: Phụ cấp mới tạo từ UI mang ID tạm `al_timestamp` được mapper chuyển thành `id: undefined` trước khi gửi lên API Backend để tránh lỗi `DbUpdateConcurrencyException`.

### `CreateUserModal.tsx`
- Quản lý submit bất đồng bộ, nút [Cấp tài khoản] hiển thị trạng thái đang xử lý.
- Bắt lỗi 409 khi username đã tồn tại và hiển thị thông báo lỗi trực tiếp dưới ô nhập Username.

### `ConfirmModal.tsx` & `NotificationModal.tsx` (`src/components/common/`)
- **ConfirmModal**: Modal xác nhận hành động nguy hiểm (như Xóa nhân viên), hỗ trợ backdrop blur, icon cảnh báo, các biến thể `danger` / `warning` / `primary`, có spinner trên nút xác nhận khi đang xử lý.
- **NotificationModal**: Popup thông báo kết quả tức thì (Thành công, Thất bại, Cảnh báo nghiệp vụ `BR-EMP-03`, Thông tin), có icon trực quan, tự động đóng hoặc bấm "Đã hiểu". Dùng chung cho toàn hệ thống (Employee, Product, v.v.).

---

## 3. Cấu trúc Hợp đồng DTOs & Mapper

Tạo file `src/features/employee/api/employeeApi.ts` và mappers trong `src/features/employee/lib/employeeMapper.ts`:

### Backend DTOs tương ứng:
```typescript
export interface EmployeeBackendSummaryDto {
  id: string;
  employeeCode: string;
  fullName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  address?: string;
  startDate?: string;
  note?: string;
  branchId: string;
  branchName: string;
  status: string; // "active" | "inactive"
  salaryType: string;
  baseRate: number;
  otWeekday?: string;
  otSunday?: string;
  debtAmount?: number;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface EmployeeBackendDetailDto {
  id: string;
  employeeCode: string;
  fullName: string;
  citizenId: string;
  dateOfBirth?: string;
  gender?: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  address?: string;
  startDate?: string;
  note?: string;
  otWeekday?: string;
  otSunday?: string;
  branchId: string;
  branchName: string;
  userId?: string;
  userName?: string;
  role?: string;
  salaryType: string;
  baseRate: number;
  allowances?: Array<{ id?: string; name: string; amount: number }>;
  debtAmount: number;
  status: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankAccountHolder?: string;
  createdAt: string;
  updatedAt?: string;
}
```

### ShiftConfig API DTOs (`src/features/employee/api/shiftConfigApi.ts`):
```typescript
export interface ShiftConfigDto {
  id: string;
  branchId: string;
  branchIds?: string[];
  shiftCode: string;
  shiftName: string;
  startTime: string; // "17:00:00"
  endTime: string;   // "21:00:00"
  durationHours: number;
  allowedCheckInStart: string; // "14:00:00"
  allowedCheckInEnd: string;   // "00:00:00"
  isCheckInNextDay?: boolean;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  branchName?: string | null;
  branchNames?: string[] | null;
}
```
