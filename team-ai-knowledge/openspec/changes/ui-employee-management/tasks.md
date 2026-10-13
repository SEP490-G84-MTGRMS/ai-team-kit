# Tasks: ui-employee-management

- [x] T1: Thiết lập TypeScript types & interfaces cho Employee, Department, JobTitle, SalaryConfig, Payslip, DebtTransaction, ApprovalRequest tại `src/features/employee/types/index.ts`
- [x] T2: Xây dựng bộ Mock Data chuẩn nghiệp vụ và in-memory service tại `src/features/employee/services/mockData.ts`
- [x] T3: Xây dựng bộ CSS quy chuẩn KiotViet / Deep Teal (`#0F766E`), bo góc Full Pill & 24px tại `src/features/employee/employee.css`
- [x] T4: Xây dựng Component Sidebar Bộ lọc đa tiêu chí tại `src/features/employee/components/EmployeeFilterSidebar.tsx`
- [x] T5: Xây dựng Form Modal Thêm mới / Cập nhật nhân viên đa tab (Thông tin, Lương, Phụ cấp, Thuế/BHXH) cùng modal con Tạo tài khoản và Tạo phụ cấp tại `src/features/employee/components/EmployeeFormModal.tsx`
- [x] T6: Xây dựng Panel Chi tiết Nhân viên 360 độ với 5 tabs (Thông tin, Lịch làm việc, Mức lương, Phiếu lương in/xuất file, Nợ & Tạm ứng kèm Tạo phiếu chi) tại `src/features/employee/components/EmployeeDetailModal.tsx`
- [x] T7: Xây dựng Modal Duyệt yêu cầu (Nhân viên, Chấm công, duyệt hàng loạt) và Modal Import Excel tại `src/features/employee/components/ApprovalRequestsModal.tsx` & `ImportEmployeeModal.tsx`
- [x] T8: Hoàn thiện Trang danh sách chính `EmployeeListPage.tsx`, cấu hình Routing trong `router.tsx`, tích hợp liên kết trên `AppTopNav.tsx`, và kiểm tra `npm run build` đạt 0 lỗi
