# Tasks: employee-fe-integration

## Frontend
- [x] T1 — Xây dựng các TypeScript interfaces DTOs và mapper hai chiều trong `src/features/employee/lib/employeeMapper.ts`, bổ sung logic regex UUID lọc ID phụ cấp tạm để đồng bộ an toàn (REQ-FE-EMP-01)
- [x] T2 — Triển khai `employeeApi.ts` trong `src/features/employee/api/` với đầy đủ các phương thức: `getEmployeesPaged`, `getEmployeeById`, `createEmployee`, `updateEmployee`, `updateEmployeeStatus`, `deleteEmployee`, `createIdentityAccount` (REQ-FE-EMP-01)
- [x] T3 — Cập nhật `EmployeeListPage.tsx`: tích hợp gọi API thực tế, xử lý Loading skeleton, Empty state, phân trang server-side, tìm kiếm debounce 300ms và bộ lọc chi nhánh/trạng thái (REQ-FE-EMP-02)
- [x] T4 — Cập nhật `EmployeeFormModal.tsx`: tích hợp API tạo mới (`createEmployee`) và cập nhật (`updateEmployee`), upload ảnh đại diện Cloudinary qua `POST /api/v1/media/upload`, bắt lỗi HTTP 409 Conflict hiển thị cảnh báo trực quan trong modal (REQ-FE-EMP-03)
- [x] T5 — Cập nhật `EmployeeDetailModal.tsx`: nạp dữ liệu chi tiết thực tế từ `GET /api/v1/employees/{id}`, optimistic pre-fill tránh chớp màn hình trắng, format ngày Việt Nam `DD/MM/YYYY` (REQ-FE-EMP-04)
- [x] T6 — Chuẩn hóa kích thước toàn bộ các modal và submodal trong phân hệ nhân viên theo kích thước cố định đồng nhất `width: 900px`, `height: 85vh` (REQ-FE-EMP-05)
- [x] T7 — Xây dựng 2 component dùng chung `ConfirmModal.tsx` và `NotificationModal.tsx` trong `src/components/common/` dựa trên mẫu chuẩn của `product` để tái sử dụng toàn hệ thống (REQ-FE-EMP-07)
- [x] T8 — Tích hợp `ConfirmModal` và `NotificationModal` vào luồng Xóa nhân viên, Toggle trạng thái và Lưu form; xử lý bắt mã lỗi `EMPLOYEE_HAS_WORK_HISTORY` (BR-EMP-03) khi nhân viên đã có ca hoặc phiếu lương (REQ-FE-EMP-06)
- [x] T9 — Triển khai `shiftConfigApi.ts` kết nối `/api/v1/hr/shift-configs` và `/api/v1/shift-configs`, đồng bộ với các màn hình `ShiftConfigPage`, `ShiftFormModal` (REQ-FE-EMP-08)

## Test
- [x] T10 — Viết Unit Tests cho `employeeApi.ts` và `employeeMapper.ts` kiểm chứng chuyển đổi dữ liệu, regex UUID và xử lý gọi API (REQ-FE-EMP-01)
- [x] T11 — Kiểm tra toàn diện luồng màn hình, chạy `npm run build` và verify không có lỗi runtime/linting (0 errors) (REQ-FE-EMP-02)
