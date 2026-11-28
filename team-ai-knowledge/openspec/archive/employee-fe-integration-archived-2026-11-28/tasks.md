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
- [x] T12 — Nâng cấp `AddScheduleModal.tsx` và `scheduleApi.ts`: gọi API `createRecurringSchedule`, lọc ca theo chi nhánh nhân viên, tính ngày kết thúc đến hết tháng sau khi để trống, bỏ giới hạn 31 ngày, loại bỏ nhãn tự động gia hạn và map đúng `shiftCode` (REQ-FE-EMP-09)
- [x] T13 — Khởi tạo chức năng chấm công thủ công: bổ sung API `POST/PUT /api/v1/schedules/{id}/attendance` trong `SchedulesController`, tính toán giờ công/đi muộn/về sớm theo `BranchAttendancePolicy` trong `ScheduleService`, cập nhật `AttendanceDetailModal.tsx` và `scheduleApi.ts` (REQ-FE-EMP-10)

## Test
- [x] T10 — Viết Unit Tests cho `employeeApi.ts` và `employeeMapper.ts` kiểm chứng chuyển đổi dữ liệu, regex UUID và xử lý gọi API (REQ-FE-EMP-01)
- [x] T11 — Kiểm tra toàn diện luồng màn hình, chạy `npm run build` và verify không có lỗi runtime/linting (0 errors, 106 unit tests passed) (REQ-FE-EMP-02, REQ-FE-EMP-09)
- [x] T14 — Viết Unit Tests Backend cho chức năng chấm công thủ công trong `ScheduleServiceTests.cs` (đi làm, nghỉ phép có lương, nghỉ phép không lương, tính đi muộn/về sớm/OT) (REQ-FE-EMP-10)

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: ui-employee-management -->
# Tasks: ui-employee-management

- [x] T1: Thiết lập TypeScript types & interfaces cho Employee, Department, JobTitle, SalaryConfig, Payslip, DebtTransaction, ApprovalRequest tại `src/features/employee/types/index.ts`
- [x] T2: Xây dựng bộ Mock Data chuẩn nghiệp vụ và in-memory service tại `src/features/employee/services/mockData.ts`
- [x] T3: Xây dựng bộ CSS quy chuẩn KiotViet / Deep Teal (`#0F766E`), bo góc Full Pill & 24px tại `src/features/employee/employee.css`
- [x] T4: Xây dựng Component Sidebar Bộ lọc đa tiêu chí tại `src/features/employee/components/EmployeeFilterSidebar.tsx`
- [x] T5: Xây dựng Form Modal Thêm mới / Cập nhật nhân viên đa tab (Thông tin, Lương, Phụ cấp, Thuế/BHXH) cùng modal con Tạo tài khoản và Tạo phụ cấp tại `src/features/employee/components/EmployeeFormModal.tsx`
- [x] T6: Xây dựng Panel Chi tiết Nhân viên 360 độ với 5 tabs (Thông tin, Lịch làm việc, Mức lương, Phiếu lương in/xuất file, Nợ & Tạm ứng kèm Tạo phiếu chi) tại `src/features/employee/components/EmployeeDetailModal.tsx`
- [x] T7: Xây dựng Modal Duyệt yêu cầu (Nhân viên, Chấm công, duyệt hàng loạt) và Modal Import Excel tại `src/features/employee/components/ApprovalRequestsModal.tsx` & `ImportEmployeeModal.tsx`
- [x] T8: Hoàn thiện Trang danh sách chính `EmployeeListPage.tsx`, cấu hình Routing trong `router.tsx`, tích hợp liên kết trên `AppTopNav.tsx`, và kiểm tra `npm run build` đạt 0 lỗi
- [x] T9: Bổ sung Màn hình Lịch làm việc ma trận (`WorkSchedulePage.tsx`), Quản lý ca làm việc (`WorkshiftManagementPage.tsx`), Modal tạo ca (`ShiftFormModal.tsx`) và Modal phân ca (`AddScheduleModal.tsx`) theo thiết kế `work_schedule/`
- [x] T10: Bổ sung Màn hình Bảng chấm công (`AttendancePage.tsx`), Modal chi tiết chấm công vi phạm/thưởng (`AttendanceDetailModal.tsx`), và popup định vị GPS / mã QR check-in theo thiết kế `attendance/`
