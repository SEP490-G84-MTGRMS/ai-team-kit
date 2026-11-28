# Specs: supplier-store-assignment (Delta Refactor)

> Delta specs bổ sung cho capability `supplier`. Sẽ được merge vào `openspec/specs/supplier/spec.md` khi archive.

## MODIFIED REQUIREMENTS

### Requirement: REQ-SBA01 Branch-Centric Supplier Allocation (Refactored Flow)
Hệ thống MUST chuyển đổi luồng phân bổ trên popup từ "Chọn 1 NCC -> Gán nhiều chi nhánh" sang **"Chọn 1 Chi nhánh -> Thêm nhiều NCC cho chi nhánh đó"**.
- Quan hệ giữa Branch và Supplier là quan hệ nhiều - nhiều (`Many-to-Many`).
- Một chi nhánh có thể được gán nhiều nhà cung cấp.
- Một nhà cung cấp có thể phục vụ nhiều chi nhánh.
- Một cặp `(BranchId, SupplierId)` chỉ được tồn tại một bản ghi duy nhất trong cùng Tenant.
- Khi chọn Chi nhánh A, hệ thống tự động loại trừ các nhà cung cấp đã được gán (ở trạng thái `Active`) cho Chi nhánh A. Nhà cung cấp đó vẫn hiển thị khả dụng khi phân bổ cho Chi nhánh B nếu chưa tồn tại quan hệ.

#### Scenario: Gán nhiều NCC cho một chi nhánh thành công
- **GIVEN** Chi nhánh `MT-Mart Quận 1` hiện chưa được gán `NCC A` và `NCC B`.
- **WHEN** Store Owner mở popup, chọn chi nhánh `MT-Mart Quận 1`, tìm kiếm và tích chọn `NCC A`, `NCC B`, rồi nhấn "Lưu phân bổ".
- **THEN** Hệ thống lưu thành công 2 liên kết `(MT-Mart Quận 1, NCC A)` và `(MT-Mart Quận 1, NCC B)`, đóng popup và tự động làm mới danh sách phân bổ.

---

## ADDED REQUIREMENTS

### Requirement: REQ-SBA04 Available Suppliers Filtering for Selected Branch
Hệ thống MUST cung cấp danh sách nhà cung cấp khả dụng cho một chi nhánh được chọn với các tiêu chí nghiêm ngặt:
1. **Trạng thái NCC**: Chỉ hiển thị các nhà cung cấp đang ở trạng thái hoạt động (`Status == Active`). NCC bị `Inactive` toàn hệ thống MUST bị ẩn hoàn toàn (SUP-03).
2. **Loại trừ NCC đã gán**: Bất kỳ NCC nào đã có liên kết `Active` với chi nhánh đang chọn MUST không xuất hiện trong danh sách lựa chọn (SUP-02).
3. **Trường hợp đã từng ngừng phân bổ**: NCC đã từng được gán nhưng hiện đang ở trạng thái `Inactive` với chi nhánh đó thì ĐƯỢC PHÉP hiển thị lại để Store Owner có thể tái kích hoạt quan hệ phân bổ.
4. **Empty States**:
   - Nếu chi nhánh đã được gán toàn bộ các NCC đang hoạt động: Hiển thị thông báo *"Tất cả nhà cung cấp đang hoạt động đã được gán cho chi nhánh này"* (SUP-06).
   - Nếu từ khóa tìm kiếm không khớp NCC nào: Hiển thị thông báo *"Không tìm thấy nhà cung cấp phù hợp"* (SUP-07).

#### Scenario: Ẩn NCC đã được gán khi đổi chi nhánh
- **GIVEN** `MT-Mart Quận 1` đã gán `NCC A, NCC B, NCC C`. `MT-Mart Cầu Giấy` đã gán `NCC A, NCC D`.
- **WHEN** Người dùng chọn chi nhánh `MT-Mart Quận 1`:
- **THEN** Danh sách NCC khả dụng không chứa `NCC A, NCC B, NCC C`.
- **WHEN** Người dùng đổi sang chọn chi nhánh `MT-Mart Cầu Giấy`:
- **THEN** Hệ thống xóa toàn bộ lựa chọn cũ (BR-04), tải lại danh sách mới không chứa `NCC A, NCC D`, nhưng `NCC B` và `NCC C` xuất hiện bình thường.

---

### Requirement: REQ-SBA05 Comprehensive Validation Matrix & Re-activation
Hệ thống MUST kiểm soát chặt chẽ 4 nhóm validation nghiệp vụ:

#### 1. Nhóm A — Validation Chi nhánh:
- **BR-01**: Chưa chọn chi nhánh -> Không cho tích chọn/lưu NCC; hiển thị yêu cầu chọn chi nhánh.
- **BR-02**: Chi nhánh bị vô hiệu hóa -> Chặn phân bổ.
- **BR-03**: Chi nhánh không tồn tại hoặc sai Tenant -> Backend từ chối 404/403.
- **BR-04**: Đổi chi nhánh -> Tự động xóa danh sách NCC đã chọn và tải lại danh sách khả dụng.

#### 2. Nhóm B — Validation Nhà cung cấp:
- **SUP-01**: Chưa chọn NCC nào -> Disable nút Lưu hoặc báo lỗi yêu cầu chọn ít nhất 1 NCC.
- **SUP-04**: NCC không tồn tại trong Tenant -> Backend từ chối request.
- **SUP-05**: Cho phép tích chọn và lưu đồng thời nhiều NCC hợp lệ.

#### 3. Nhóm C — Validation Lưu Phân bổ & Data Integrity:
- **MAP-01**: Loại bỏ các ID trùng lặp trong request trước khi xử lý.
- **MAP-02**: Unique Index `UX_BranchSuppliers_Branch_Supplier` hoặc `(TenantId, SupplierId, BranchId)` ngăn chặn race-condition khi 2 người dùng cùng gán đồng thời.
- **MAP-03 & MAP-04**: Backend kiểm tra lại trạng thái `Active` của chi nhánh và toàn bộ NCC trước khi commit.
- **MAP-05**: Nguyên tắc **All-or-Nothing**: Thực thi trong 1 Database Transaction duy nhất. Nếu 1 NCC không hợp lệ, rollback toàn bộ để tránh dữ liệu phân bổ dở dang.
- **MAP-06**: Tái kích hoạt thông minh: Nếu cặp `(BranchId, SupplierId)` đã tồn tại bản ghi nhưng `Status == Inactive`, cập nhật lại thành `Active` và xóa `InactiveReason`, không insert mới gây lỗi Duplicate Key.
- **MAP-07**: Chống spam double-click: Disable nút "Lưu phân bổ" và hiển thị trạng thái loading trong khi đang gửi request.

#### 4. Nhóm D — Thao tác UI & Tìm kiếm:
- Tìm kiếm không phân biệt chữ hoa/chữ thường, tìm theo cả Mã và Tên NCC.
- Nút "Chọn tất cả" chỉ áp dụng cho các NCC đang hiển thị khớp với từ khóa tìm kiếm và còn khả dụng.
- Cập nhật tức thời số lượng đã chọn (`Đã chọn: X nhà cung cấp`).
- Nút "Hủy" hoặc đóng popup không làm thay đổi dữ liệu hiện tại.

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: supplier-branch-delivery-days -->
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
