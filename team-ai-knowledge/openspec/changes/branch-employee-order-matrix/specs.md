# Specs: branch-employee-order-matrix

## API / Contract
Do thay đổi này tập trung ở tầng giao diện Frontend và Mock State cho Nhân viên Chi nhánh, các hợp đồng giao tiếp component và mock client được định nghĩa như sau:

| Component / Function | Path / Target | Props / Params | Output / Behavior | Lỗi / Cảnh báo |
|---|---|---|---|---|
| `EmployeeOrderMatrixPage` | `/employee/purchase-orders/create-matrix` | N/A (State nội bộ) | Render giao diện ma trận đặt hàng cho nhân viên | Thông báo rỗng nếu không có sản phẩm |
| `OrderMatrixFilterBar` | Subcomponent | `hideBranchSelect?: boolean`, `fixedBranchLabel?: string` | Ẩn dropdown chọn chi nhánh khi cờ bằng true | Không |
| `handleSubmitOrder` | Action Handler | `QtyMatrixMap`, `branchId` | Gửi đơn đặt hàng của chi nhánh tới hệ thống | Toast cảnh báo nếu đơn hàng chưa có số lượng |

---

## ADDED Requirements

### Requirement: REQ-01 Employee Matrix Access & Fixed Branch Scope
Hệ thống MUST cung cấp trang đặt hàng ma trận dành cho nhân viên chi nhánh tại đường dẫn `/employee/purchase-orders/create-matrix`. Trang này MUST khóa cứng chi nhánh của nhân viên phụ trách và KHÔNG cho phép nhân viên chuyển đổi sang chi nhánh khác.

#### Scenario: Truy cập màn hình đặt hàng nhân viên thành công
- **GIVEN** Người dùng là nhân viên chi nhánh (mặc định gắn với chi nhánh `BR-01 - Siêu thị Mini Cầu Giấy`).
- **WHEN** Người dùng truy cập đường dẫn `/employee/purchase-orders/create-matrix`.
- **THEN** Hệ thống hiển thị giao diện Đặt hàng theo ma trận với ngữ cảnh dữ liệu và sản phẩm thuộc chi nhánh `BR-01`.

#### Scenario: Ngăn chặn thay đổi chi nhánh ngoài quyền hạn
- **GIVEN** Người dùng đang ở màn hình đặt hàng ma trận nhân viên.
- **WHEN** Người dùng quan sát thanh công cụ lọc dữ liệu.
- **THEN** Không có dropdown danh sách các chi nhánh khác để lựa chọn; phạm vi chi nhánh luôn cố định theo chi nhánh hiện tại.

---

### Requirement: REQ-02 Matrix Filter Bar without Branch Selector
Thanh công cụ lọc (`OrderMatrixFilterBar`) MUST hỗ trợ cấu hình ẩn dropdown chọn chi nhánh khi được sử dụng tại giao diện nhân viên chi nhánh (`hideBranchSelect = true`). Tất cả các bộ lọc khác (Nhà cung cấp, Khoảng thời gian, Danh mục, Tìm kiếm từ khóa, Lọc vi phạm MOQ, Lọc sản phẩm đã đặt, Ẩn/hiện SOH) SHALL tiếp tục hoạt động đầy đủ và chính xác.

#### Scenario: Hiển thị thanh công cụ lọc không có dropdown chi nhánh
- **GIVEN** Giao diện `EmployeeOrderMatrixPage` được tải.
- **WHEN** Thanh công cụ `OrderMatrixFilterBar` được render với cờ `hideBranchSelect={true}`.
- **THEN** Khối chọn chi nhánh bị ẩn khỏi toolbar, các khối chọn Nhà cung cấp và bộ lọc khác được căn chỉnh cân đối theo flexbox.

#### Scenario: Lọc sản phẩm theo Nhà cung cấp và Danh mục
- **GIVEN** Nhân viên chi nhánh đang mở bảng ma trận.
- **WHEN** Nhân viên chọn Nhà cung cấp "NCC-01 - Công ty Thực phẩm ABC" và chọn danh mục "Bánh kẹo".
- **THEN** Bảng ma trận chỉ hiển thị danh sách sản phẩm thuộc NCC-01 và có danh mục là Bánh kẹo.

---

### Requirement: REQ-03 Order Quantity Entry & Validation
Bảng ma trận MUST cho phép nhân viên nhập số lượng đặt hàng vào các ngày giao hợp lệ, đồng thời MUST khóa các ngày không hợp lệ (ngày nghỉ, ngày lễ, ngày vi phạm lead time). Khi số lượng nhập nhỏ hơn số lượng đặt tối thiểu (MOQ), hệ thống MUST hiển thị cảnh báo trực quan cho nhân viên.

#### Scenario: Nhập số lượng vào ngày hợp lệ
- **GIVEN** Cột ngày giao hàng thứ Hai là ngày hợp lệ (thỏa mãn lead time và lịch giao của NCC).
- **WHEN** Nhân viên nhập số lượng `10` cho sản phẩm có MOQ là `5`.
- **THEN** Ô nhập nhận giá trị `10`, hiển thị bình thường không có cảnh báo lỗi, tổng tiền và tổng số lượng được cộng dồn tương ứng.

#### Scenario: Cảnh báo vi phạm MOQ
- **GIVEN** Sản phẩm "Bánh mì sandwich" có yêu cầu MOQ là `20`.
- **WHEN** Nhân viên nhập số lượng `12` vào ngày giao hợp lệ.
- **THEN** Ô nhập hiển thị viền/badge cảnh báo màu cam báo hiệu chưa đạt mức đặt hàng tối thiểu MOQ (cần tối thiểu 20).

#### Scenario: Ô nhập bị khóa vào ngày không hợp lệ
- **GIVEN** Ngày mai là ngày vi phạm Lead Time (cần báo trước tối thiểu 2 ngày).
- **WHEN** Nhân viên cố gắng nhập số lượng vào cột ngày mai.
- **THEN** Ô nhập bị vô hiệu hóa (disabled) với nền màu xám, nhân viên không thể chỉnh sửa số liệu.

---

### Requirement: REQ-04 Order Submission & Draft Storage
Hệ thống MUST cung cấp chức năng Lưu nháp (Save Draft) và Gửi đơn đặt hàng (Submit Order) cho nhân viên chi nhánh. Khi gửi đơn thành công, hệ thống MUST hiển thị thông báo phản hồi rõ ràng.

#### Scenario: Gửi đơn đặt hàng hợp lệ
- **GIVEN** Nhân viên đã nhập ít nhất một sản phẩm có số lượng lớn hơn 0.
- **WHEN** Nhân viên bấm nút "Gửi đơn hàng".
- **THEN** Hệ thống hiển thị modal / toast thông báo thành công: "Đơn đặt hàng chi nhánh đã được gửi thành công" và ghi nhận trạng thái đơn.

#### Scenario: Cảnh báo khi gửi đơn không có sản phẩm
- **GIVEN** Nhân viên chưa nhập bất kỳ số lượng nào trên bảng ma trận (tổng số lượng bằng 0).
- **WHEN** Nhân viên bấm nút "Gửi đơn hàng".
- **THEN** Hệ thống hiển thị toast cảnh báo: "Vui lòng nhập ít nhất 1 sản phẩm trước khi gửi đơn".

---

### Requirement: REQ-05 Excel Import / Export & Week Actions
Hệ thống SHALL cho phép nhân viên chi nhánh tải về bảng mẫu Excel của ma trận, nhập dữ liệu từ file Excel, và sao chép số lượng đặt từ tuần làm việc trước đó.

#### Scenario: Sao chép dữ liệu tuần trước
- **GIVEN** Nhân viên đang lên kế hoạch cho tuần hiện tại.
- **WHEN** Nhân viên bấm nút "Sao chép tuần trước".
- **THEN** Số lượng đặt hàng của các ngày tương ứng trong tuần trước được sao chép vào tuần này (chỉ áp dụng cho các ngày hợp lệ).

---

## MODIFIED Requirements
Không có requirement nào bị sửa đổi trong spec gốc. Màn hình của Store Owner giữ nguyên hoạt động ban đầu.

---

## REMOVED Requirements
Không có requirement nào bị loại bỏ.

---

## Acceptance checklist
- [ ] REQ-01: Truy cập được route `/employee/purchase-orders/create-matrix`, chi nhánh cố định không bị thay đổi ngoài ý muốn.
- [ ] REQ-02: Toolbar không có dropdown chọn chi nhánh khi mở tại trang nhân viên; các filter khác hoạt động đầy đủ.
- [ ] REQ-03: Nhập liệu ma trận tính toán chính xác số lượng, tổng tiền; khóa ngày vi phạm lead time / ngày nghỉ; cảnh báo khi vi phạm MOQ.
- [ ] REQ-04: Nút Lưu nháp và Gửi đơn hoạt động chuẩn xác, có phản hồi toast trực quan.
- [ ] REQ-05: Các tính năng tuần (Tuần này, dịch chuyển tuần, copy tuần trước) và Import/Export Excel hoạt động mượt mà.
- [ ] Giao diện tuân thủ `RULE_UI_DESIGN_SYSTEM.md`, build không lỗi.
