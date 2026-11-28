# EXP-2026-11-02-FE-EMP-INTEGRATION: Khảo sát Tích hợp Backend API vào Frontend Phân hệ Quản lý Nhân viên & Cấu hình Ca

## 1. Problem Statement
Trang Quản lý Nhân viên (`EmployeeListPage.tsx`) và Cấu hình Ca làm việc (`ShiftConfigPage.tsx`, `ShiftFormModal.tsx`) cùng các component modal liên quan trước đây khởi tạo dữ liệu mẫu tĩnh từ mock state. Mọi thay đổi dữ liệu (tạo mới, sửa, xóa, đổi trạng thái) chỉ tác động lên React local state, dẫn đến dữ liệu bị mất hoàn toàn khi người dùng reload trang (F5).
Tầng Backend C# .NET 8 đã xây dựng hoàn thiện `EmployeesController` và `ShiftConfigsController` với đầy đủ các RESTful endpoints:
- `EmployeesController`: Phân trang, tìm kiếm keyword, lọc `branchId`, `status`, CRUD nhân viên, kiểm tra trùng CCCD/SĐT, `SyncAllowances` an toàn, chặn xóa có điều kiện `BR-EMP-03`, cấp tài khoản Identity.
- `ShiftConfigsController`: CRUD danh mục ca làm việc mẫu theo chi nhánh, hỗ trợ ca qua đêm (`isCheckInNextDay`), ca áp dụng nhiều chi nhánh (`BranchIds`), tính toán giờ công chuẩn.

Frontend cần được tích hợp kết nối trực tiếp với cả 2 nhóm API này để người dùng có thể thao tác với dữ liệu thật từ cơ sở dữ liệu.

## 2. Context & Background
- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS v4, Lucide React, Axios (`httpClient` tại `src/api/httpClient.ts`).
- **Thư mục liên quan**: `src/features/employee/`
  - `pages/EmployeeListPage.tsx`: Màn hình danh sách nhân viên.
  - `pages/ShiftConfigPage.tsx`: Màn hình cấu hình danh mục ca chuẩn.
  - `components/EmployeeFormModal.tsx`: Form thêm mới / chỉnh sửa hồ sơ nhân viên.
  - `components/EmployeeDetailModal.tsx`: Xem chi tiết hồ sơ 360 độ.
  - `components/ShiftConfigModal.tsx` / `ShiftFormModal.tsx`: Form cấu hình ca làm việc.
  - `components/ShiftInfoModal.tsx`: Chi tiết ca làm việc.
  - `components/CreateUserModal.tsx`: Modal cấp tài khoản đăng nhập.
  - `src/components/common/ConfirmModal.tsx`: Modal xác nhận nguy hiểm (Xóa nhân viên, Xóa ca).
  - `src/components/common/NotificationModal.tsx`: Popup thông báo phản hồi kết quả (Thành công, Lỗi BR-EMP-03).
- **Backend**:
  - `MT_GRMS.Api/Controllers/EmployeesController.cs` (`/api/v1/employees`).
  - `MT_GRMS.Api/Controllers/ShiftConfigsController.cs` (`/api/v1/hr/shift-configs` và `/api/v1/shift-configs`).

## 3. Constraints
- Sử dụng `httpClient` từ `src/api/httpClient.ts` để tự động gắn `Authorization: Bearer <token>` và `X-Tenant-Id`.
- Phải có hàm mapping tương thích giữa DTOs từ Backend với interface model của Frontend UI.
- Xử lý mượt mà các trạng thái: Loading (spinner/skeleton), Empty State, và hiển thị thông báo lỗi rõ ràng khi gặp mã 400 hoặc 409 (trùng CCCD, SĐT, Username hoặc trùng Mã ca).
- Bảo toàn ID phụ cấp (kiểm tra Regex UUID) để Backend thực hiện đồng bộ 3 chiều (Sync & Diffing) an toàn, tránh lỗi `DbUpdateConcurrencyException`.
- Xử lý mã lỗi `EMPLOYEE_HAS_WORK_HISTORY` khi xóa nhân viên vi phạm quy tắc `BR-EMP-03`.

## 4. Assumptions
- **[ASSUMPTION-01]**: Backend API chạy tại endpoint tương đối `/api/v1/employees` và `/api/v1/hr/shift-configs` (proxy qua Vite hoặc cấu hình base URL).
- **[ASSUMPTION-02]**: Người dùng đăng nhập có token JWT hợp lệ và quyền hạn tương ứng (`STORE_OWNER` hoặc `BRANCH_MANAGER`).
- **[ASSUMPTION-03]**: Danh sách chi nhánh (`branches`) có thể lấy từ API chi nhánh `/api/v1/branches`.

## 5. Scope & Non-Goals
### In Scope
- Xây dựng module `src/features/employee/api/employeeApi.ts` đóng gói toàn bộ lời gọi API đến `/api/v1/employees`.
- Xây dựng module `src/features/employee/api/shiftConfigApi.ts` đóng gói toàn bộ lời gọi API đến `/api/v1/hr/shift-configs`.
- Viết mapper dữ liệu hai chiều: Backend DTOs $\longleftrightarrow$ Frontend Model kèm lọc ID phụ cấp tạm.
- Chuyển đổi `EmployeeListPage.tsx` và `ShiftConfigPage.tsx` sang tải dữ liệu từ API Backend thực tế.
- Tích hợp bộ Modal dùng chung `ConfirmModal` và `NotificationModal` cho các luồng thao tác.
- Upload ảnh đại diện Cloudinary qua `POST /api/v1/media/upload`.

### Out of Scope (Non-Goals)
- Không đụng đến các trang Phân ca tuần chi tiết (`WorkSchedulePage`), Chấm công số (`AttendancePage`) và Tính lương (`PayslipManagementPage`) trong change này; các trang này sẽ được kết nối ở các change tiếp theo khi backend hoàn thiện Cụm 3, 4, 5.

## 6. Đánh giá Phương án Kiến trúc (Architecture Options)
Tập trung toàn bộ các hàm gọi API trong 2 client chuyên biệt:
1. `src/features/employee/api/employeeApi.ts`: Xử lý phân hệ hồ sơ nhân sự, nợ lương, trạng thái và tài khoản.
2. `src/features/employee/api/shiftConfigApi.ts`: Xử lý phân hệ danh mục ca làm việc chuẩn, ca qua đêm, multi-branch.
Kết hợp bộ Modal dùng chung hệ thống trong `src/components/common/` (`ConfirmModal`, `NotificationModal`) để chuẩn hóa trải nghiệm người dùng trên toàn hệ thống MT-GRMS.
