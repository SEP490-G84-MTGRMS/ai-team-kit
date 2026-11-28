# EXP-2026-11-07-001: Tích Hợp API Bảng Lương Cho PayslipManagementPage

## 1. Problem Statement (Vấn Đề)
Màn hình quản lý bảng lương [PayslipManagementPage.tsx](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/employee/pages/PayslipManagementPage.tsx) và các modal liên quan ([CreatePayslipModal.tsx](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/employee/components/CreatePayslipModal.tsx), [PayslipDetailModal.tsx](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/employee/components/PayslipDetailModal.tsx), [PayslipPaymentModal.tsx](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/employee/components/PayslipPaymentModal.tsx)) hiện đang hiển thị và thao tác trên dữ liệu tĩnh `MOCK_PAYSLIPS_MANAGEMENT`.
Backend đã có sẵn các API hoàn chỉnh tại [PayslipsController.cs](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/PayslipsController.cs) (`GET /api/v1/payslips`, `GET /api/v1/payslips/{id}`, `POST /api/v1/payslips/generate-batch`, `POST /api/v1/payslips/{id}/pay`, `POST /api/v1/payslips/batch-pay`), nhưng Frontend chưa có tầng gọi API `payslipApi.ts` và chưa kết nối thực, dẫn đến không thể xem được lương tính từ chấm công thật và không hạch toán được chi trả vào Sổ quỹ thật.

## 2. Context & Background (Bối Cảnh)
- Backend `MT_GRMS_BACKEND` đã hoàn thành phân hệ tính lương và hạch toán Sổ quỹ (`payroll-management-backend`), vượt qua 486 unit tests và 44 integration tests.
- Frontend `MT_GRMS_FRONTEND` đã có cấu trúc chuẩn cho phân hệ nhân viên `src/features/employee`:
  - `employeeApi.ts`: quản lý hồ sơ nhân viên và chi nhánh.
  - `attendancePolicyApi.ts`: quản lý chính sách chấm công.
  - `scheduleApi.ts`: quản lý phân ca và chấm công thực tế.
  - `httpClient.ts`: wrapper Axios xử lý token JWT, tự động đính kèm `X-Tenant-ID` và interceptor lỗi.
- Hiện trạng trang `PayslipManagementPage.tsx` đang có đầy đủ UI bộ lọc (kỳ tháng, chi nhánh, trạng thái, từ khóa), danh sách phiếu lương, checkbox chọn hàng loạt, và các modal. Cần chuyển đổi state cục bộ sang fetch dữ liệu từ backend.

## 3. Constraints (Ràng Buộc)
- **Tương thích UI hiện có:** Giữ nguyên giao diện, layout và các tương tác UX mượt mà hiện tại của `PayslipManagementPage.tsx`.
- **Định dạng dữ liệu:** Tiền tệ VND dùng `number` trong frontend (hiển thị định dạng `vi-VN ₫`), thời gian định dạng DD/MM/YYYY.
- **Xử lý lỗi theo chuẩn ProblemDetails:** Khi API trả mã lỗi 400/404/409, sử dụng `problemDetailsMapper.ts` để hiển thị message rõ ràng thay vì crash giao diện.
- **Bảo mật và Phân quyền:** Gửi token JWT trong Header Authorization; phân quyền role `STORE_OWNER`, `BRANCH_MANAGER`, `ACCOUNTANT`.

## 4. Assumptions (Giả Định)
- **[ASSUMPTION-01]**: Backend API `GET /api/v1/payslips` hỗ trợ lọc theo `periodMonth` (định dạng `YYYY-MM`), `branchId` (Guid), `status` (Unpaid, Paid) và `keyword`.
- **[ASSUMPTION-02]**: Khi chi trả phiếu lương qua `pay` hoặc `batch-pay`, backend tự động tạo bản ghi phiếu chi tương ứng trong bảng Sổ quỹ `CashbookTransactions`.
- **[ASSUMPTION-03]**: Chi nhánh được lấy từ `employeeApi.getBranches()` hoặc API danh mục chi nhánh hiện có của hệ thống thay vì `MOCK_BRANCHES`.

## 5. Scope & Non-Goals
### In Scope
- Xây dựng file `src/features/employee/api/payslipApi.ts` với đầy đủ types và 5 methods gọi API.
- Cập nhật `PayslipManagementPage.tsx` để fetch dữ liệu từ `payslipApi.getPayslipsPaged`, quản lý loading spinner, pagination, và làm mới dữ liệu sau các thao tác.
- Kết nối `CreatePayslipModal.tsx` để gọi `payslipApi.generateMonthlyPayroll`.
- Kết nối `PayslipDetailModal.tsx` để fetch chi tiết phiếu lương theo ID qua `payslipApi.getPayslipById`.
- Kết nối `PayslipPaymentModal.tsx` để gọi `payslipApi.payPayslip` (đơn lẻ) và `payslipApi.batchPayPayslips` (hàng loạt).

### Out of Scope (Non-Goals)
- Không chỉnh sửa backend API hay cơ sở dữ liệu (Backend đã đóng băng và kiểm thử PASS).
- Không xuất file Excel/PDF từ client (chức năng xuất file phụ thuộc vào API file export riêng sau này).
- Không sửa đổi logic tính lương trên server.

## 6. Các Phương Án Kỹ Thuật (Options Comparison)
- **Phương án 1 (Custom Hooks + React Query / TanStack Query):** Sử dụng `useQuery` và `useMutation`.
  - *Ưu điểm:* Tự động cache, quản lý loading/error state chuẩn chỉnh.
  - *Nhược điểm:* Trang `PayslipManagementPage.tsx` hiện tại đang viết theo mô hình `useState` + `useEffect` trực tiếp tương tự `EmployeeListPage.tsx` và `AttendancePage.tsx`. Refactor toàn bộ sang TanStack Query sẽ làm thay đổi cấu trúc code và dễ phát sinh xung đột với style đồng bộ của team.
- **Phương án 2 (Direct Service Calls qua useState & useEffect - Chọn phương án này):** Xây dựng `payslipApi.ts` chuẩn REST và gọi trong `useEffect` / async handlers của `PayslipManagementPage.tsx` và modals.
  - *Ưu điểm:* Hoàn toàn nhất quán với các trang cùng phân hệ ([EmployeeListPage.tsx](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/employee/pages/EmployeeListPage.tsx), [AttendancePage.tsx](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/employee/pages/AttendancePage.tsx)), thay thế gọn gàng mockData mà không làm vỡ logic giao diện, kiểm soát tốt loading indicator và modal lifecycle.
  - *Nhược điểm:* Cần tự quản lý cờ `isLoading` trong component.

## 7. Rủi Ro & Biện Pháp Giảm Thiểu (Risks & Mitigations)
- **Rủi ro 1: Lệch kiểu dữ liệu giữa Backend DTO và Frontend TypeScript interface:**
  - *Giải pháp:* Khai báo type định nghĩa trong `payslipApi.ts` khớp 100% với `PayslipSummaryDto`, `PayslipResponse`, `GeneratePayrollBatchRequest`, `PayPayslipRequest`, `BatchPayResultDto` từ `MT_GRMS.Application.HR.Payslips.Dtos`.
- **Rủi ro 2: Chi nhánh trong dropdown dùng Mock thay vì dữ liệu thực:**
  - *Giải pháp:* Tích hợp lấy danh sách chi nhánh thực tế qua `employeeApi.getBranches()` để đảm bảo `branchId` gửi lên backend là Guid thật.

## 8. Success Criteria (Tiêu Chí Thành Công)
1. Danh sách phiếu lương tải thành công từ API `GET /api/v1/payslips` theo đúng tháng được chọn (`periodMonth`).
2. Bộ lọc trạng thái (`ALL`, `UNPAID`, `PAID`) và chi nhánh hiển thị đúng kết quả lọc từ server.
3. Chức năng khởi tạo bảng lương gọi API `generate-batch` thành công, tự động reload danh sách.
4. Chức năng chi trả đơn lẻ và hàng loạt gọi đúng endpoint `pay` / `batch-pay`, cập nhật trạng thái phiếu lương thành `PAID` trên giao diện.
5. Hiển thị thông báo toast thành công hoặc lỗi chi tiết rõ ràng.
