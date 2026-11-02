# Proposal: employee-fe-integration

## Vấn đề
Hiện tại, giao diện phân hệ Quản lý Nhân viên phía Frontend (`EmployeeListPage.tsx`, `EmployeeFormModal.tsx`, `EmployeeDetailModal.tsx`, `CreateUserModal.tsx`) vẫn đang sử dụng dữ liệu tĩnh từ `MOCK_EMPLOYEES` trong `src/features/employee/services/mockData.ts`. Mọi thao tác thêm mới, chỉnh sửa, đổi trạng thái, xóa nhân viên hoặc cấp tài khoản người dùng chỉ lưu tạm thời trong React state nội bộ của trang và sẽ bị mất khi người dùng làm mới trình duyệt (F5).

Trong khi đó, tầng Backend .NET 8 Web API (`/api/v1/employees`) đã hoàn thiện đầy đủ các chức năng nghiệp vụ của Cụm 1: CRUD nhân viên, tự sinh mã tuần tự `NVxxxx`, kiểm soát trùng lặp CCCD/SĐT, gán chi nhánh và cấp tài khoản đăng nhập Identity (`Users`). Do đó, cần kết nối tích hợp giao diện Frontend với các API Backend thực tế để đưa tính năng vào vận hành thật.

## Mục tiêu
- Xây dựng tầng API client (`employeeApi.ts`) trong `src/features/employee/api/` dựa trên `httpClient` chuẩn của dự án.
- Thay thế hoàn toàn mock data trong `EmployeeListPage` và các modal liên quan bằng các lời gọi API thực tế đến Backend `/api/v1/employees`.
- Đảm bảo trải nghiệm người dùng hoàn chỉnh với các trạng thái: Loading (spinner/skeleton), Empty (chưa có nhân viên), Phân trang server-side, Tìm kiếm debounce, Lọc chi nhánh và thông báo lỗi thân thiện (Toast / Alert khi trùng CCCD, SĐT hoặc Username).

## Phạm vi (Scope)

### In Scope
1. **Xây dựng module API client (`employeeApi.ts`)**:
   - `getEmployeesPaged(filter)`: Gọi `GET /api/v1/employees` với tham số phân trang (`page`, `pageSize`), tìm kiếm (`keyword`), lọc chi nhánh (`branchId`) và trạng thái (`status`).
   - `getEmployeeById(id)`: Gọi `GET /api/v1/employees/{id}` lấy thông tin chi tiết nhân viên.
   - `createEmployee(payload)`: Gọi `POST /api/v1/employees` tạo mới nhân viên.
   - `updateEmployee(id, payload)`: Gọi `PUT /api/v1/employees/{id}` cập nhật thông tin và lương.
   - `updateEmployeeStatus(id, status)`: Gọi `PATCH /api/v1/employees/{id}/status` đổi trạng thái `active` / `inactive`.
   - `deleteEmployee(id)`: Gọi `DELETE /api/v1/employees/{id}` xóa mềm nhân viên.
   - `createIdentityAccount(id, payload)`: Gọi `POST /api/v1/employees/{id}/identity-account` cấp tài khoản đăng nhập.
2. **Cập nhật trang Danh sách Nhân viên (`EmployeeListPage.tsx`)**:
   - Thay thế `useState(MOCK_EMPLOYEES)` bằng hook truy vấn dữ liệu từ API Backend.
   - Đồng bộ hóa các trạng thái Loading, Error và Empty state.
   - Hỗ trợ phân trang từ dữ liệu server (`totalItems`, `page`, `pageSize`).
   - Tích hợp tìm kiếm theo từ khóa và lọc danh sách chi nhánh thực tế từ API Chi nhánh.
3. **Tích hợp các Modal thao tác**:
   - `EmployeeFormModal`: Gửi dữ liệu form Thêm mới / Cập nhật đến Backend; xử lý hiển thị lỗi trả về từ backend (như lỗi trùng CCCD hoặc SĐT với mã 409).
   - `EmployeeDetailModal`: Hiển thị chi tiết nhân viên, thông tin lương, chi nhánh và tài khoản liên kết được lấy từ API.
   - `CreateUserModal`: Gửi yêu cầu cấp tài khoản đăng nhập Identity cho nhân viên; hiển thị thông báo thành công hoặc báo lỗi trùng Username.
   - Thao tác chuyển đổi trạng thái (Toggle status) và Xóa nhân viên trực tiếp gọi API Backend kèm xác nhận.
4. **Kiểm thử & Xác minh**:
   - Viết Unit Tests cho `employeeApi`.
   - Kiểm tra tương thích giao diện và kiểm chứng toàn bộ luồng hoạt động.

### Out of Scope
- Các trang Lập lịch ca (`WorkSchedulePage`), Chấm công (`AttendancePage`) và Tính lương (`PayslipManagementPage`) vẫn giữ mockData và sẽ được nối Backend ở các change tiếp theo khi các cụm chức năng 2, 3, 4, 5 của backend hoàn thiện.

## Người dùng liên quan
- **Chủ cửa hàng (Store Owner)**: Xem toàn bộ nhân viên các chi nhánh, tạo mới nhân viên, cấp tài khoản quản trị/thu ngân.
- **Quản lý chi nhánh (Branch Manager)**: Quản lý và theo dõi nhân viên thuộc phạm vi chi nhánh được phân quyền.

## Tiêu chí thành công
- [ ] 100% dữ liệu hiển thị trên `EmployeeListPage` được tải từ Backend API, không còn sử dụng `MOCK_EMPLOYEES`.
- [ ] Thêm mới nhân viên thành công, nhận mã tự sinh tuần tự `NVxxxx` từ Backend và cập nhật ngay vào bảng.
- [ ] Chỉnh sửa thông tin nhân viên và cập nhật mức lương lưu vết thành công vào cơ sở dữ liệu.
- [ ] Chuyển đổi trạng thái (`active` / `inactive`) và Xóa nhân viên gọi đúng API Backend.
- [ ] Cấp tài khoản Identity đăng nhập cho nhân viên qua `CreateUserModal` thành công.
- [ ] Hiển thị thông báo lỗi rõ ràng, trực quan khi vi phạm ràng buộc dữ liệu (trùng CCCD, SĐT hoặc Username).
- [ ] Dự án frontend build thành công (`npm run build`) không có lỗi TypeScript hay linting.
