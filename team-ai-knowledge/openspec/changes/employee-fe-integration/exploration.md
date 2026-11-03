# EXP-2026-11-02-FE-EMP-INTEGRATION: Khảo sát Tích hợp Backend API vào Frontend Phân hệ Quản lý Nhân viên

## 1. Problem Statement
Trang Quản lý Nhân viên (`EmployeeListPage.tsx`) và các component modal liên quan (`EmployeeFormModal`, `EmployeeDetailModal`, `CreateUserModal`) hiện đang khởi tạo dữ liệu mẫu tĩnh từ `MOCK_EMPLOYEES` (`src/features/employee/services/mockData.ts`). Mọi thay đổi dữ liệu (tạo mới, sửa, xóa, đổi trạng thái) chỉ tác động lên React local state, dẫn đến dữ liệu bị mất hoàn toàn khi người dùng reload trang (F5).
Tầng Backend C# .NET 8 đã xây dựng hoàn thiện `EmployeesController` với đầy đủ các RESTful endpoints:
- `GET /api/v1/employees`: Danh sách phân trang, tìm kiếm keyword, lọc `branchId`, `status`.
- `GET /api/v1/employees/{id}`: Chi tiết hồ sơ nhân viên.
- `POST /api/v1/employees`: Tạo mới, tự sinh mã tuần tự `NVxxxx`, kiểm tra trùng CCCD/SĐT.
- `PUT /api/v1/employees/{id}`: Cập nhật thông tin và mức lương.
- `PATCH /api/v1/employees/{id}/status`: Đổi trạng thái `active` / `inactive`.
- `DELETE /api/v1/employees/{id}`: Soft-delete nhân viên.
- `POST /api/v1/employees/{id}/identity-account`: Cấp tài khoản đăng nhập Identity.

Frontend cần được tích hợp kết nối trực tiếp với các API này để người dùng có thể thao tác với dữ liệu thật từ cơ sở dữ liệu.

## 2. Context & Background
- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS v4, Lucide React, Axios (`httpClient` tại `src/api/httpClient.ts`).
- **Thư mục liên quan**: `src/features/employee/`
  - `pages/EmployeeListPage.tsx`: Màn hình danh sách chính.
  - `components/EmployeeFormModal.tsx`: Form thêm mới / chỉnh sửa hồ sơ.
  - `components/EmployeeDetailModal.tsx`: Xem chi tiết hồ sơ nhân viên.
  - `components/CreateUserModal.tsx`: Modal cấp tài khoản đăng nhập.
  - `components/EmployeeFilterSidebar.tsx`: Bộ lọc trạng thái và chi nhánh.
  - `types/index.ts`: Định nghĩa kiểu dữ liệu `Employee`, `SalaryConfig`, `Branch`...
- **Backend**: `MT_GRMS.Api/Controllers/EmployeesController.cs` (Route: `/api/v1/employees` và `/api/employees`).

## 3. Constraints
- Sử dụng `httpClient` từ `src/api/httpClient.ts` để tận dụng tự động gắn `Authorization: Bearer <token>` và `X-Tenant-Id`.
- Phải có hàm mapping tương thích giữa `EmployeeSummaryDto` / `EmployeeResponse` từ Backend với interface `Employee` phong phú của Frontend UI.
- Xử lý mượt mà các trạng thái: Loading (spinner/skeleton), Empty State, và hiển thị thông báo lỗi rõ ràng khi gặp mã 400 hoặc 409 (trùng CCCD, SĐT hoặc Username).

## 4. Assumptions
- **[ASSUMPTION-01]**: Backend API chạy tại endpoint tương đối `/api/v1/employees` (được proxy qua Vite hoặc biến môi trường `VITE_API_BASE_URL`).
- **[ASSUMPTION-02]**: Người dùng đăng nhập có token JWT hợp lệ và quyền hạn tương ứng (`STORE_OWNER` hoặc `BRANCH_MANAGER`).
- **[ASSUMPTION-03]**: Danh sách chi nhánh (`branches`) có thể lấy từ API chi nhánh `/api/v1/branches` hoặc fallback về danh sách chi nhánh người dùng quản lý.

## 5. Scope & Non-Goals
### In Scope
- Xây dựng module `src/features/employee/api/employeeApi.ts` đóng gói toàn bộ lời gọi API đến `/api/v1/employees`.
- Viết mapper dữ liệu hai chiều: Backend DTOs $\longleftrightarrow$ Frontend `Employee`.
- Chuyển đổi `EmployeeListPage.tsx` từ mock state sang load dữ liệu từ API: phân trang, tìm kiếm, lọc chi nhánh, toggle status, delete.
- Kết nối `EmployeeFormModal.tsx` để submit `POST` (thêm mới) hoặc `PUT` (cập nhật); hiển thị lỗi validation hoặc trùng lặp (409 Conflict).
- Kết nối `CreateUserModal.tsx` để cấp tài khoản người dùng qua API `POST /api/v1/employees/{id}/identity-account`.
- Viết Unit Tests cho `employeeApi`.

### Out of Scope (Non-Goals)
- Không đụng đến các trang Ca làm việc (`WorkSchedulePage`), Chấm công (`AttendancePage`) và Tính lương (`PayslipManagementPage`) trong change này.

## 6. Đánh giá Phương án Kiến trúc (Architecture Options)

### Phương án 1: Gọi Axios rải rác trực tiếp trong components
Gọi `httpClient.get(...)`, `httpClient.post(...)` trực tiếp trong từng file component (`EmployeeListPage.tsx`, `EmployeeFormModal.tsx`, `CreateUserModal.tsx`).
- **Ưu điểm**: Viết nhanh tại chỗ.
- **Nhược điểm**: Phân tán logic, khó tái sử dụng, khó bảo trì, không nhất quán với các feature khác (`features/product`, `features/purchase-order`), cực kỳ khó viết test kiểm thử.

### Phương án 2: Xây dựng tầng API Client tập trung (`src/features/employee/api/employeeApi.ts`) kèm Mapper (Được chọn)
Tập trung toàn bộ các hàm gọi API trong `employeeApi.ts`, định nghĩa DTOs rõ ràng, kèm các hàm chuyển đổi:
- `mapSummaryToEmployee(dto)`
- `mapDetailToEmployee(dto)`
- `mapEmployeeToCreatePayload(emp)`
- `mapEmployeeToUpdatePayload(emp)`
Component chỉ việc gọi `employeeApi.getEmployeesPaged(...)`, `employeeApi.createEmployee(...)`.
- **Ưu điểm**:
  + Tuân thủ cấu trúc feature-driven của dự án.
  + Tách biệt hoàn toàn tầng giao diện (UI) và tầng mạng (Network).
  + Giao diện không bị xáo trộn hay gãy giao diện do mapper bảo vệ tính toàn vẹn của interface `Employee`.
  + Dễ dàng viết Unit Tests độc lập với mock axios.
- **Nhược điểm**: Cần thêm 1 file mapper và 1 file api, nhưng lợi ích về kiến trúc và độ tin cậy vượt trội.

## 7. Rủi ro & Giải pháp Giảm thiểu (Risks & Mitigations)
1. **Lệch cấu trúc dữ liệu giữa Backend và Frontend**:
   - *Rủi ro*: Backend trả về `BaseRate`, `EmployeeCode`, `BranchName` phẳng, trong khi Frontend UI yêu cầu lồng `salaryConfig.baseSalary`, mảng `workingBranchNames`, avatar, v.v.
   - *Giải pháp*: Hàm mapper `mapSummaryToEmployee` và `mapDetailToEmployee` chuyển đổi chuẩn xác, cung cấp giá trị mặc định cho các thuộc tính bổ sung để UI hiển thị đầy đủ và không bị lỗi undefined.
2. **Xử lý lỗi trùng lặp khi thêm mới**:
   - *Rủi ro*: Backend trả về 409 Conflict với thông báo lỗi ("Số CCCD đã tồn tại...", "Số điện thoại đã tồn tại..."), nếu frontend không bắt khéo sẽ hiển thị generic error gây bối rối cho người dùng.
   - *Giải pháp*: Trong `try/catch` của form modal và trang danh sách, đọc `error.response?.data?.message` hoặc `error.response?.data?.errorCode` để hiển thị alert thông báo lỗi chi tiết, chính xác tới người dùng.
