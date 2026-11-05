# Specs: supplier-branch-delivery-days

## API & UI Contract

| Method / Component | Route / Path | Request / Props | Response / Output | Lỗi / Cảnh báo |
|---|---|---|---|---|
| `AssignBranchModal` | UI Component | `supplierId: string, open: boolean` | Prefill lịch giao từ Supplier, lưu assignment mới | Thông báo nếu chưa chọn chi nhánh |
| `EditAssignmentDeliveryDaysModal` | UI Component | `assignment: SupplierBranchAssignment, open: boolean` | Modal cập nhật lịch giao riêng của chi nhánh | Báo lỗi nếu lưu thất bại |
| `POST /api/v1/suppliers/{id}/branches` | Backend API | `AssignSupplierBranchDto` | `SupplierBranchAssignmentDto` | `400 BadRequest`, `404 NotFound` |
| `PUT /api/v1/suppliers/{id}/branches/{branchId}` | Backend API | `UpdateSupplierBranchAssignmentDto` | `SupplierBranchAssignmentDto` | `400 BadRequest`, `404 NotFound` |
| `GET /api/v1/suppliers/{id}/branches` | Backend API | N/A | `IReadOnlyList<SupplierBranchAssignmentDto>` | `401 Unauthorized` |

---

## ADDED Requirements

### Requirement: REQ-01 Prefill lịch giao hàng từ Nhà cung cấp khi mở popup gán chi nhánh
Khi Store Owner mở modal gán chi nhánh mới cho Nhà cung cấp (`AssignBranchModal`), hệ thống MUST tự động prefill các checkbox ngày giao hàng theo cấu hình `DeliveryDaysOfWeek` hiện tại của Nhà cung cấp đó.

#### Scenario: Mở popup gán chi nhánh mới
- **GIVEN** Nhà cung cấp "Công ty Hải Nam" có lịch giao hàng base là Thứ 2, Thứ 4, Thứ 6 (`[1, 3, 5]`).
- **WHEN** Store Owner mở modal gán chi nhánh cho Nhà cung cấp "Công ty Hải Nam".
- **THEN** Hệ thống hiển thị 7 checkbox ngày trong tuần, trong đó các ô [Thứ 2], [Thứ 4], [Thứ 6] tự động được đánh dấu chọn sẵn.

---

### Requirement: REQ-02 Cho phép tùy chỉnh ngày giao hàng độc lập theo từng chi nhánh
Hệ thống MUST cho phép Store Owner thay đổi (chọn thêm hoặc bỏ chọn) bất kỳ ngày nào trong tuần (Chủ Nhật → Thứ Bảy) cho lần gán chi nhánh đó và lưu cấu hình độc lập vào bảng `SupplierBranchAssignment`.

#### Scenario: Tùy chỉnh ngày giao hàng khác so với lịch gốc
- **GIVEN** Modal gán chi nhánh đang mở với prefill `[1, 3, 5]`.
- **WHEN** Store Owner bỏ chọn [Thứ 4] và tích chọn [Thứ 7], sau đó nhấn "Lưu gán chi nhánh".
- **THEN** Hệ thống gửi yêu cầu `POST /api/v1/suppliers/{id}/branches` với `deliveryDaysOfWeek: [1, 5, 6]` và lưu thành công vào cơ sở dữ liệu.

---

### Requirement: REQ-03 Cập nhật ngày giao hàng cho chi nhánh đã gán
Hệ thống MUST cung cấp tính năng chỉnh sửa ngày giao hàng trực tiếp cho các chi nhánh đã được gán trước đó thông qua modal `EditAssignmentDeliveryDaysModal` mà không cần phải xóa và gán lại chi nhánh.

#### Scenario: Chỉnh sửa ngày giao hàng của chi nhánh đang hoạt động
- **GIVEN** Chi nhánh "MT-Mart Quận 1" đã được gán cho NCC "Bao bì Việt Tiến" với lịch giao Thứ 3, Thứ 5.
- **WHEN** Store Owner nhấn nút chỉnh sửa ngày giao hàng trên dòng của chi nhánh "MT-Mart Quận 1", tick thêm [Thứ 7] và nhấn "Cập nhật".
- **THEN** Hệ thống gửi `PUT /api/v1/suppliers/{id}/branches/{branchId}` với `deliveryDaysOfWeek: [2, 4, 6]` và thông báo cập nhật thành công.

---

### Requirement: REQ-04 Hiển thị chuỗi viết tắt ngày giao hàng trên bảng quản lý
Bảng danh sách chi nhánh đã gán (`SupplierBranchTable`) MUST có cột "Ngày giao hàng" hiển thị danh sách các thứ giao hàng dưới dạng chuỗi viết tắt tiếng Việt chuẩn (ví dụ: `T2, T4, T6` hoặc `CN, T3, T7`), sắp xếp theo thứ tự từ Chủ Nhật đến Thứ Bảy.

#### Scenario: Hiển thị đúng định dạng viết tắt
- **GIVEN** Chi nhánh có `deliveryDaysOfWeek` là `[0, 1, 3, 5]`.
- **WHEN** Store Owner truy cập màn hình `/store-owner/suppliers/branches`.
- **THEN** Cột "Ngày giao hàng" hiển thị nhãn `CN, T2, T4, T6`.

---

### Requirement: REQ-05 Tích hợp Ma trận đặt hàng và Dispatch Hub theo lịch chi nhánh
Hàm `GetMatrixSupplierConfigsAsync` và Business Engine của Ma trận đặt hàng (`OrderMatrix`) và Dispatch Hub MUST ưu tiên lấy `DeliveryDaysOfWeek` từ bản ghi gán chi nhánh (`SupplierBranchAssignment`). Nếu bản ghi gán không có cấu hình override riêng, hệ thống SHALL tự động fallback về cấu hình gốc của Nhà cung cấp.

#### Scenario: Hiển thị ngày giao hàng trên Ma trận đặt hàng theo chi nhánh
- **GIVEN** Chi nhánh "MT-Mart Thủ Đức" có override ngày giao là `[2, 4]` (Thứ 3, Thứ 5).
- **WHEN** Nhân viên hoặc Store Owner mở Ma trận đặt hàng cho Chi nhánh "MT-Mart Thủ Đức".
- **THEN** Các cột Thứ 3 và Thứ 5 hiển thị trạng thái `OPEN`, các ngày còn lại hiển thị `SUPPLIER_OFF` (NCC không giao hàng).

---

## Acceptance Checklist
- [x] Entity `SupplierBranchAssignment` có trường `DeliveryDaysOfWeek` (`List<int>`).
- [x] API gán chi nhánh nhận và lưu `DeliveryDaysOfWeek`.
- [x] API sửa chi nhánh nhận và cập nhật `DeliveryDaysOfWeek`.
- [x] Modal `AssignBranchModal` prefill đúng lịch giao hàng từ NCC.
- [x] Modal `EditAssignmentDeliveryDaysModal` cho phép chỉnh sửa ngày giao hàng nhanh.
- [x] Bảng gán chi nhánh hiển thị cột viết tắt (vd: `T2, T4, T6`).
- [x] `OrderMatrix` và `DispatchHub` tự động phản ánh lịch giao theo từng chi nhánh.
