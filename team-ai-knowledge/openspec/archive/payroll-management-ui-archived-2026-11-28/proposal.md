# Đề Xuất Tính Năng: Tích Hợp Giao Diện Quản Lý Bảng Lương (Payroll Management UI)

## 1. Vấn Đề (Problem Statement)
Màn hình quản lý bảng lương [PayslipManagementPage.tsx](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/employee/pages/PayslipManagementPage.tsx) và các modal liên quan hiện đang sử dụng dữ liệu tĩnh từ `mockData.ts` (`MOCK_PAYSLIPS_MANAGEMENT`, `MOCK_BRANCHES`). Điều này dẫn đến các hạn chế:
- Người dùng không thể xem được dữ liệu bảng lương thực tế tính từ lịch phân ca và chấm công của nhân viên.
- Các thao tác "Tính bảng lương theo lô", "Xem chi tiết phiếu lương", và "Chi trả phiếu lương" chưa được gửi tới backend [PayslipsController.cs](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/PayslipsController.cs), do đó không tự động sinh phiếu chi Sổ quỹ (Cashbook) hay cập nhật trạng thái phiếu lương thật.
- Chưa có tầng API client chuẩn hóa (`payslipApi.ts`) để đồng bộ types và xử lý lỗi theo chuẩn `ApiResponse<T>` / `ProblemDetails`.

## 2. Mục Tiêu (Objectives)
- Xây dựng tầng API client `src/features/employee/api/payslipApi.ts` giao tiếp với các endpoint của `PayslipsController`:
  1. `GET /api/v1/payslips` (danh sách có phân trang và bộ lọc).
  2. `GET /api/v1/payslips/{id}` (chi tiết phiếu lương).
  3. `POST /api/v1/payslips/generate-batch` (tự động tính & tạo bảng lương theo kỳ tháng và chi nhánh).
  4. `POST /api/v1/payslips/{id}/pay` (thanh toán đơn lẻ và sinh phiếu chi Sổ quỹ).
  5. `POST /api/v1/payslips/batch-pay` (thanh toán hàng loạt).
- Cập nhật trang `PayslipManagementPage.tsx` fetch dữ liệu thực, hỗ trợ chuyển tháng, lọc trạng thái, lọc chi nhánh và tìm kiếm từ khóa.
- Tích hợp các modal hành động:
  - `CreatePayslipModal`: gọi API tính bảng lương tháng theo lô.
  - `PayslipDetailModal`: tải chi tiết các thành phần lương (lương cơ bản, phụ cấp, OT, BHXH, thuế TNCN, thực lĩnh).
  - `PayslipPaymentModal`: thực hiện chi trả lương đơn lẻ hoặc hàng loạt với phương thức thanh toán thực.

## 3. Phạm Vi (Scope)

### Trong phạm vi (In-scope):
- **Tầng API (`src/features/employee/api/`):**
  - Tạo `payslipApi.ts` định nghĩa DTOs, Query filters, Request payload và các hàm gọi API sử dụng `httpClient`.
- **Trang quản lý (`src/features/employee/pages/`):**
  - Cập nhật `PayslipManagementPage.tsx`: quản lý state tải dữ liệu, loading spinner, empty state, pagination, bộ lọc động và trigger các action.
- **Các thành phần Modal (`src/features/employee/components/`):**
  - Cập nhật `CreatePayslipModal.tsx`: gọi `payslipApi.generateMonthlyPayroll`.
  - Cập nhật `PayslipDetailModal.tsx`: nạp dữ liệu chi tiết từ `payslipApi.getPayslipById`.
  - Cập nhật `PayslipPaymentModal.tsx`: gọi `payslipApi.payPayslip` hoặc `payslipApi.batchPayPayslips`.
- **Thông báo & Trải nghiệm (UX):**
  - Hiển thị toast thông báo thành công hoặc lỗi (sử dụng `problemDetailsMapper`).

### Ngoài phạm vi (Out-of-scope):
- Chỉnh sửa backend (backend đã hoàn thiện và kiểm thử đạt 100%).
- Xuất file bảng lương Excel / PDF từ client (nếu chưa có API backend xuất file tương ứng).

## 4. Người Dùng Liên Quan (Stakeholders & Roles)
- **Chủ cửa hàng (`STORE_OWNER`)**: Khởi tạo bảng lương, xem chi tiết và phê duyệt/chi trả lương cho nhân viên toàn chuỗi.
- **Quản lý chi nhánh (`BRANCH_MANAGER`)**: Theo dõi bảng lương của nhân viên tại chi nhánh mình quản lý.
- **Kế toán (`ACCOUNTANT`)**: Thực hiện đối soát số liệu chấm công, hạch toán chi trả lương vào Sổ quỹ tiền mặt/ngân hàng.

## 5. Tiêu Chí Thành Công (Success Criteria)
1. Danh sách phiếu lương hiển thị đầy đủ, chính xác dữ liệu từ CSDL backend theo từng kỳ tháng.
2. Thao tác lọc theo trạng thái (`ALL`, `UNPAID`, `PAID`) và chi nhánh phản ánh tức thời kết quả từ backend.
3. Chức năng "Tính bảng lương" tự động tổng hợp ca làm việc và hiển thị kết quả phiếu lương mới tạo.
4. Chức năng "Chi trả lương" chuyển trạng thái phiếu sang `PAID` và cập nhật tức thì trên giao diện bảng lương.
5. Không còn phụ thuộc vào `MOCK_PAYSLIPS_MANAGEMENT`.
6. Xử lý loading và bắt lỗi mạng / validation một cách trực quan, thân thiện.
