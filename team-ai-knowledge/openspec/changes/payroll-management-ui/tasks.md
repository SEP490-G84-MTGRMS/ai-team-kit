# Tasks: payroll-management-ui

## Frontend
- [ ] **T1 — Tạo module API Client `src/features/employee/api/payslipApi.ts`** (REQ-FE-PAY-01)
  - Khai báo các interface TypeScript: `PayslipSummaryDto`, `PayslipResponse`, `PayslipQueryFilter`, `GeneratePayrollBatchRequest`, `PayPayslipRequest`, `BatchPayPayslipsRequest`, `BatchPayResultDto`, `PayslipAllowanceItemDto`.
  - Cài đặt 5 phương thức gọi API REST thông qua `httpClient`:
    - `getPayslipsPaged(filter: PayslipQueryFilter)`
    - `getPayslipById(id: string)`
    - `generateMonthlyPayroll(data: GeneratePayrollBatchRequest)`
    - `payPayslip(id: string, data: PayPayslipRequest)`
    - `batchPayPayslips(data: BatchPayPayslipsRequest)`
  - Bắt lỗi theo chuẩn `ProblemDetails` với `extractErrorMessage`.

- [ ] **T2 — Tích hợp fetch dữ liệu thực và bộ lọc vào `PayslipManagementPage.tsx`** (REQ-FE-PAY-02, REQ-FE-PAY-03)
  - Thay thế `MOCK_PAYSLIPS_MANAGEMENT` bằng state thực tế nạp từ `payslipApi.getPayslipsPaged`.
  - Quản lý trạng thái `isLoading`, `errorMessage` và giao diện trống (Empty state).
  - Tải danh sách chi nhánh thực từ `employeeApi.getBranches()` thay thế `MOCK_BRANCHES`; xử lý `branchId === 'ALL'` thì không gửi tham số hoặc gửi `undefined`.
  - Cập nhật 4 thẻ chỉ số tài chính tính toán tự động từ dữ liệu API: Tổng quỹ lương, Đã thanh toán, Còn phải trả, Tổng nhân sự.
  - Hỗ trợ chuyển tháng dạng Navigator (`[<] Tháng MM/YYYY [>]`), tìm kiếm theo tên/mã nhân viên và lọc theo 3 tab trạng thái `ALL` / `UNPAID` / `PAID`.

- [ ] **T3 — Tích hợp Modal tính bảng lương tự động `CreatePayslipModal.tsx`** (REQ-FE-PAY-04)
  - Kết nối form với hàm `payslipApi.generateMonthlyPayroll`.
  - Truyền `periodMonth` hiện tại vào modal làm giá trị mặc định.
  - Quản lý trạng thái `isSubmitting` trên nút "Bắt đầu tính toán".
  - Hiển thị toast thông báo thành công hoặc lỗi chi tiết, tự động đóng modal và kích hoạt reload danh sách phiếu lương trên trang chính.

- [ ] **T4 — Tích hợp Modal xem chi tiết phiếu lương `PayslipDetailModal.tsx`** (REQ-FE-PAY-05)
  - Nhận `payslipId` và gọi `payslipApi.getPayslipById` khi mở modal để đảm bảo số liệu mới nhất.
  - Hiển thị đầy đủ các khối bóc tách:
    - Thông tin nhân viên, chức danh, loại lương (Monthly/Shift/Hourly).
    - Ngày công chuẩn, ngày công thực tế, giờ làm, giờ làm thêm (OT ngày thường / OT Chủ nhật).
    - Các thành phần thu nhập (lương theo công, phụ cấp theo danh sách, tiền OT, thưởng).
    - Các khoản giảm trừ (tạm ứng, bảo hiểm xã hội, phạt).
    - Lương thực nhận (`NetSalary`) nổi bật.
    - Lịch sử chi trả (ngày thanh toán, phương thức, mã phiếu chi Sổ quỹ liên kết).

- [ ] **T5 — Tích hợp Modal chi trả lương `PayslipPaymentModal.tsx`** (REQ-FE-PAY-06)
  - Hỗ trợ cả 2 kịch bản: Chi trả đơn lẻ (1 phiếu) và Chi trả theo lô (mảng các phiếu đã chọn qua checkbox).
  - Kết nối `payslipApi.payPayslip` cho chi trả đơn lẻ và `payslipApi.batchPayPayslips` cho chi trả hàng loạt.
  - Hiển thị mã QR thanh toán VietQR chuyển khoản ngân hàng hoặc chọn quỹ tiền mặt.
  - Sau khi xác nhận thanh toán thành công, hiển thị toast thông báo, cập nhật badge `PAID` trên bảng dữ liệu và cập nhật lại thẻ tóm tắt tài chính.

## Test
- [ ] **T6 — Kiểm thử Frontend, Build & Lint Verify**
  - Chạy `npm run lint` kiểm tra toàn bộ code TypeScript không có warning hoặc syntax error.
  - Chạy `npm run build` trên thư mục `MT_GRMS_FRONTEND` đảm bảo đóng gói thành công.
  - Kiểm thử trực tiếp luồng nghiệp vụ: Tải danh sách $\rightarrow$ Lọc tháng $\rightarrow$ Khởi tạo bảng lương $\rightarrow$ Xem chi tiết $\rightarrow$ Chi trả đơn lẻ / hàng loạt.
