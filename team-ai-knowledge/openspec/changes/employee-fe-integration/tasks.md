# Tasks: employee-fe-integration

## Frontend
- [ ] T1 — Xây dựng các TypeScript interfaces DTOs và mapper hai chiều trong `src/features/employee/lib/employeeMapper.ts` (REQ-FE-EMP-01)
- [ ] T2 — Triển khai `employeeApi.ts` trong `src/features/employee/api/` với đầy đủ các phương thức: `getEmployeesPaged`, `getEmployeeById`, `createEmployee`, `updateEmployee`, `updateEmployeeStatus`, `deleteEmployee`, `createIdentityAccount` (REQ-FE-EMP-01)
- [ ] T3 — Cập nhật `EmployeeListPage.tsx`: tích hợp gọi API thực tế, xử lý Loading skeleton, Empty state, phân trang server-side, tìm kiếm debounce và bộ lọc chi nhánh/trạng thái (REQ-FE-EMP-02)
- [ ] T4 — Cập nhật `EmployeeFormModal.tsx`: tích hợp API tạo mới (`createEmployee`) và cập nhật (`updateEmployee`), bắt lỗi HTTP 409 Conflict hiển thị cảnh báo trực quan trong modal (REQ-FE-EMP-03)
- [ ] T5 — Cập nhật `CreateUserModal.tsx`: tích hợp API cấp tài khoản đăng nhập Identity `createIdentityAccount`, xử lý thông báo thành công và bắt lỗi trùng username (REQ-FE-EMP-04)
- [ ] T6 — Tích hợp thao tác Toggle trạng thái hoạt động và Xóa nhân viên trực tiếp vào `EmployeeListPage.tsx` và `EmployeeDetailModal.tsx` (REQ-FE-EMP-05)

## Test
- [ ] T7 — Viết Unit Tests cho `employeeApi.ts` và `employeeMapper.ts` kiểm chứng chuyển đổi dữ liệu và xử lý gọi API (REQ-FE-EMP-01)
- [ ] T8 — Kiểm tra toàn diện luồng màn hình, chạy `npm run build` và verify không có lỗi runtime/linting (REQ-FE-EMP-02)
