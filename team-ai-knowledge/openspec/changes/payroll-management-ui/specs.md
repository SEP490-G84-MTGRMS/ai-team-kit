# Specs: payroll-management-ui

## API / Contract

| Method | Path | Request Body / Query Params | Response | Lỗi |
|---|---|---|---|---|
| `GET` | `/api/v1/payslips` | Query: `keyword?: string`, `periodMonth?: string`, `branchId?: string`, `status?: PayslipStatus`, `page?: number`, `pageSize?: number` | `ApiResponse<PagedResult<PayslipSummaryDto>>` | 400 Bad Request, 401 Unauthorized |
| `GET` | `/api/v1/payslips/{id}` | Path: `id: Guid` | `ApiResponse<PayslipResponse>` | 400 Bad Request, 401 Unauthorized, 404 Not Found |
| `POST` | `/api/v1/payslips/generate-batch` | Body: `{ periodMonth: string, branchId?: string, autoPublish?: boolean }` | `ApiResponse<IReadOnlyList<PayslipResponse>>` | 400 Bad Request, 401 Unauthorized, 409 Conflict |
| `POST` | `/api/v1/payslips/{id}/pay` | Path: `id: Guid`, Body: `{ paymentMethod: string, paymentAccount?: string, note?: string }` | `ApiResponse<PayslipResponse>` | 400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict |
| `POST` | `/api/v1/payslips/batch-pay` | Body: `{ payslipIds: string[], paymentMethod: string, paymentAccount?: string, note?: string }` | `ApiResponse<BatchPayResultDto>` | 400 Bad Request, 401 Unauthorized, 400 Empty List |

---

## ADDED Requirements

### Requirement: REQ-FE-PAY-01 Xây dựng Tầng API Client `payslipApi.ts`
Hệ thống Frontend MUST cung cấp module `src/features/employee/api/payslipApi.ts` sử dụng `httpClient` để kết nối đầy đủ các endpoint quản lý bảng lương của backend `PayslipsController`, kèm theo các định nghĩa TypeScript Interfaces đồng bộ 100% với Backend DTOs.

#### Scenario: Gọi API lấy danh sách phiếu lương phân trang
- **GIVEN** Người dùng đã đăng nhập có token hợp lệ và chọn kỳ lương `"2026-10"`.
- **WHEN** Hàm `payslipApi.getPayslipsPaged({ periodMonth: "2026-10", page: 1, pageSize: 20 })` được gọi.
- **THEN** Hệ thống gửi request `GET /api/v1/payslips?periodMonth=2026-10&page=1&pageSize=20`.
- **AND** Nhận về `ApiResponse<PagedResult<PayslipSummaryDto>>` với danh sách items, tổng số trang và tổng số bản ghi.

#### Scenario: Xử lý lỗi từ backend trả về ProblemDetails
- **GIVEN** Request gửi lên backend bị lỗi validation hoặc xung đột dữ liệu.
- **WHEN** Backend trả về HTTP status 400/409 kèm payload `ProblemDetails`.
- **THEN** Tầng client bắt lỗi và parse qua `extractErrorMessage` để trả về thông điệp lỗi tường minh cho UI.

---

### Requirement: REQ-FE-PAY-02 Tải và lọc danh sách phiếu lương trên `PayslipManagementPage.tsx`
Trang `PayslipManagementPage.tsx` MUST gọi API `payslipApi.getPayslipsPaged` để hiển thị danh sách phiếu lương theo kỳ tháng được chọn. Khi người dùng thay đổi kỳ tháng (`periodMonth`), từ khóa (`keyword`), chi nhánh (`branchId`) hoặc tab trạng thái (`status: ALL | UNPAID | PAID`), hệ thống SHALL tự động gọi lại API để làm mới dữ liệu.

#### Scenario: Chuyển kỳ tháng xem bảng lương
- **GIVEN** Người dùng đang ở màn hình Quản lý Bảng lương, kỳ tháng hiện tại là `"2026-10"`.
- **WHEN** Người dùng bấm nút mũi tên chuyển sang tháng trước (`[<]`).
- **THEN** Kỳ tháng chuyển thành `"2026-09"`.
- **AND** Hệ thống hiển thị loading spinner và gọi `getPayslipsPaged({ periodMonth: "2026-09" })`.
- **AND** Bảng hiển thị các phiếu lương thuộc tháng 09/2026 lấy từ backend.

#### Scenario: Lọc phiếu lương theo Chi nhánh và Trạng thái
- **GIVEN** Người dùng chọn chi nhánh `"Chi nhánh Cầu Giấy"` và bấm tab `"Chưa thanh toán"`.
- **WHEN** Người dùng chọn bộ lọc.
- **THEN** Request gửi lên backend có tham số `branchId` tương ứng và `status=Unpaid`.
- **AND** Bảng chỉ hiển thị các nhân viên tại chi nhánh Cầu Giấy chưa nhận lương.

#### Scenario: Kỳ tháng chưa có bảng lương (Empty state)
- **GIVEN** Người dùng chọn một kỳ tháng mới chưa từng được tính lương.
- **WHEN** API trả về danh sách rỗng (`items: []`, `totalCount: 0`).
- **THEN** Bảng hiển thị giao diện trống (Empty state) kèm thông điệp gợi ý bấm nút `+ Khởi tạo Bảng lương`.

---

### Requirement: REQ-FE-PAY-03 Thẻ tổng hợp chỉ số tài chính (Summary Cards)
Phần đầu trang `PayslipManagementPage.tsx` MUST hiển thị 4 thẻ thống kê:
1. **Tổng quỹ lương:** Tổng lương thực lĩnh (`netSalary`) của kỳ.
2. **Đã thanh toán:** Tổng số tiền của các phiếu lương trạng thái `PAID`.
3. **Còn phải trả:** Tổng số tiền còn lại trạng thái `UNPAID`.
4. **Tổng nhân sự:** Tổng số nhân viên có phiếu lương trong kỳ.
Các số liệu này MUST được tính toán chính xác từ danh sách dữ liệu thực do API trả về.

#### Scenario: Tính toán tổng quỹ lương tự động
- **GIVEN** Kỳ tháng 10/2026 có 3 phiếu lương: Phiếu 1 (`10,480,000₫` - `PAID`), Phiếu 2 (`3,730,000₫` - `UNPAID`), Phiếu 3 (`4,550,000₫` - `UNPAID`).
- **WHEN** Trang tải dữ liệu thành công.
- **THEN** Thẻ "Tổng quỹ lương" hiển thị `18,760,000 ₫`.
- **AND** Thẻ "Đã thanh toán" hiển thị `10,480,000 ₫`.
- **AND** Thẻ "Còn phải trả" hiển thị `8,280,000 ₫`.
- **AND** Thẻ "Tổng nhân sự" hiển thị `3`.

---

### Requirement: REQ-FE-PAY-04 Khởi tạo và Tính toán bảng lương theo lô (`CreatePayslipModal.tsx`)
Khi người dùng bấm nút `+ Khởi tạo Bảng lương`, modal `CreatePayslipModal.tsx` MUST cho phép chọn kỳ tháng và chi nhánh, sau đó gửi request `POST /api/v1/payslips/generate-batch`. Sau khi thành công, modal SHALL tự đóng, hiển thị toast thông báo thành công và reload lại danh sách bảng lương.

#### Scenario: Khởi tạo bảng lương tháng thành công
- **GIVEN** Người dùng mở modal `CreatePayslipModal`, chọn kỳ tháng `"2026-11"`, chọn chi nhánh `"Tất cả chi nhánh"`.
- **WHEN** Người dùng bấm nút `"Bắt đầu tính lương"`.
- **THEN** Nút chuyển sang trạng thái loading (`disabled`).
- **AND** Gửi request `POST /api/v1/payslips/generate-batch` với body `{ periodMonth: "2026-11" }`.
- **AND** Backend trả về HTTP 200 kèm danh sách phiếu lương vừa tạo.
- **AND** Modal đóng lại, hiển thị toast `"Khởi tạo bảng lương thành công"`, bảng dữ liệu tự động cập nhật.

#### Scenario: Xử lý lỗi khi kỳ lương đã được chốt hoặc dữ liệu không hợp lệ
- **GIVEN** Kỳ lương đã có lỗi hoặc backend trả về mã 400.
- **WHEN** Backend trả về lỗi `{ message: "Không tìm thấy dữ liệu ca làm việc trong kỳ." }`.
- **THEN** Modal vẫn mở, nút bấm hết loading, hiển thị toast thông báo lỗi rõ ràng cho người dùng.

---

### Requirement: REQ-FE-PAY-05 Xem chi tiết phiếu lương minh bạch (`PayslipDetailModal.tsx`)
Khi người dùng bấm vào một dòng phiếu lương hoặc nút `Chi tiết`, modal `PayslipDetailModal.tsx` MUST gọi API `GET /api/v1/payslips/{id}` để tải toàn bộ các khoản mục bóc tách chi tiết:
- Thông tin nhân viên, chức danh, hình thức lương (Monthly/Shift/Hourly).
- Chi tiết ngày công chuẩn, ngày công thực tế, giờ làm, giờ OT.
- Lương cơ bản, Lương theo công, Phụ cấp chi tiết theo từng loại, Tiền OT, Tiền thưởng.
- Các khoản giảm trừ: Tạm ứng lương, Bảo hiểm xã hội, Phạt vi phạm.
- Lương thực nhận (`NetSalary`).
- Lịch sử thanh toán: Ngày thanh toán, Phương thức thanh toán, Mã phiếu chi Sổ quỹ.

#### Scenario: Hiển thị đầy đủ bóc tách phiếu lương nhân viên lương tháng
- **GIVEN** Phiếu lương của nhân viên `NV001` (lương tháng 10,000,000₫, 3 phụ cấp, có làm thêm giờ).
- **WHEN** Người dùng mở `PayslipDetailModal`.
- **THEN** Modal hiển thị chi tiết phụ cấp: Phụ cấp ăn trưa 730,000₫, Phụ cấp trách nhiệm 1,000,000₫, Phụ cấp xăng xe 500,000₫.
- **AND** Hiển thị chi tiết tiền OT và lương thực lĩnh nổi bật.

---

### Requirement: REQ-FE-PAY-06 Chi trả phiếu lương đơn lẻ và hàng loạt (`PayslipPaymentModal.tsx`)
Khi người dùng bấm nút `Thanh toán` trên một phiếu lương hoặc chọn nhiều phiếu lương chưa trả rồi bấm `Chi trả hàng loạt`, modal `PayslipPaymentModal.tsx` MUST:
1. Hiển thị tổng số tiền cần thanh toán và danh sách nhân viên nhận lương.
2. Cho phép chọn hình thức thanh toán: `Chuyển khoản (VietQR)` hoặc `Tiền mặt`.
   - Nếu chọn `Chuyển khoản`: Hiển thị thông tin STK, Ngân hàng, Người thụ hưởng và mã QR NAPAS 247.
   - Nếu chọn `Tiền mặt`: Cho phép chọn quỹ tiền mặt tương ứng.
3. Khi bấm `"Xác nhận đã chi trả"`:
   - Với 1 phiếu: Gọi `POST /api/v1/payslips/{id}/pay`.
   - Với nhiều phiếu: Gọi `POST /api/v1/payslips/batch-pay`.
4. Sau khi chi trả thành công:
   - Cập nhật trạng thái phiếu lương thành `PAID`.
   - Backend tự động sinh phiếu chi trong Sổ quỹ.
   - Hiển thị toast thành công, đóng modal và reload lại danh sách bảng lương.

#### Scenario: Chi trả lương đơn lẻ qua chuyển khoản ngân hàng
- **GIVEN** Phiếu lương `PL-202610-NV001` trạng thái `UNPAID`, số tiền `10,480,000 ₫`.
- **WHEN** Người dùng mở `PayslipPaymentModal`, chọn phương thức `"BANK_TRANSFER"` và bấm `"Xác nhận đã chi trả"`.
- **THEN** Gửi request `POST /api/v1/payslips/{id}/pay`.
- **AND** Nhận phản hồi thành công, phiếu lương đổi sang trạng thái `PAID` kèm badge xanh lá.
- **AND** Thẻ "Đã thanh toán" tăng thêm `10,480,000 ₫`, thẻ "Còn phải trả" giảm tương ứng.

#### Scenario: Chi trả lương hàng loạt cho nhiều nhân viên
- **GIVEN** Người dùng chọn 2 phiếu lương chưa thanh toán của `NV002` và `NV003`.
- **WHEN** Người dùng bấm `"Chi trả hàng loạt"`, xác nhận thanh toán.
- **THEN** Gửi request `POST /api/v1/payslips/batch-pay` với mảng `payslipIds: [id1, id2]`.
- **AND** Cả 2 phiếu lương được cập nhật trạng thái `PAID` đồng thời trên màn hình.

---

## MODIFIED Requirements
*Không có (Chức năng UI mới kết nối trực tiếp với backend).*

## REMOVED Requirements
*Không có.*

---

## Acceptance Checklist
- [ ] **REQ-FE-PAY-01:** File `payslipApi.ts` được tạo đầy đủ types và 5 methods gọi API qua `httpClient`.
- [ ] **REQ-FE-PAY-02:** `PayslipManagementPage.tsx` fetch dữ liệu thực từ backend, chuyển tháng mượt mà, bộ lọc trạng thái và chi nhánh hoạt động chính xác.
- [ ] **REQ-FE-PAY-03:** 4 thẻ chỉ số tài chính tính toán động chính xác từ danh sách dữ liệu thực tế.
- [ ] **REQ-FE-PAY-04:** `CreatePayslipModal.tsx` gọi API `generate-batch` thành công, tự động reload danh sách.
- [ ] **REQ-FE-PAY-05:** `PayslipDetailModal.tsx` hiển thị đầy đủ bóc tách lương chi tiết từ API `getPayslipById`.
- [ ] **REQ-FE-PAY-06:** `PayslipPaymentModal.tsx` thực hiện chi trả đơn lẻ và hàng loạt thành công, cập nhật trạng thái `PAID` và hạch toán Sổ quỹ.
- [ ] **Build & Test:** Code frontend build thành công không lỗi TypeScript, lint đạt tiêu chuẩn dự án.
