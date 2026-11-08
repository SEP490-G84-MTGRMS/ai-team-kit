# Specs: purchase-order-grid-creation (FE-05 Ordering)

## 1. API / Contract

| Method | Path | Request Body / Query | Response | Error Codes |
|---|---|---|---|---|
| GET | `/api/v1/purchase-orders/grid-init` | Query: `supplierId`, `branchId` | `GridInitDto` (SupplierInfo, CreditInfo, Categories, BranchInfo) | `400`, `404` |
| GET | `/api/v1/purchase-orders/grid-products` | Query: `supplierId`, `branchId`, `fromDate`, `toDate` | `List<GridProductDto>` (Products, AvailabilityRules, CutoffSchedules, ExistingQuantities) | `400` |
| POST | `/api/v1/purchase-orders/grid-submit` | Body: `SubmitGridPoCommand` | `SubmitGridResultDto` (CreatedPoIds, SplitPosList, Status) | `400 Bad Request` (vi phạm MOQ/LeadTime/Cutoff) |
| POST | `/api/v1/purchase-orders/grid-draft` | Body: `SaveGridDraftCommand` | `200 OK` | `400` |
| POST | `/api/v1/purchase-orders/excel/export` | Body: `ExportOrderMatrixCommand { BranchId, SupplierId, FromDate, ToDate }` | File Stream (`.xlsx` formatted & styled) | `400 Bad Request` |
| POST | `/api/purchase-orders/excel/import/validate` | Form-data: `file` (.xlsx), `branchId`, `supplierId`, `fromDate`, `toDate` | `ExcelImportPreviewDto` (IsValid, ValidCount, WarningCount, ErrorCount, Rows, Summary) | `400 Bad Request`, `FILE_INVALID`, `BRANCH_ACCESS_DENIED` |
| POST | `/api/purchase-orders/excel/import/apply` | Body: `ApplyExcelImportCommand { BranchId, SupplierId, FromDate, ToDate, ValidatedCells }` | `ApplyImportResultDto { UpdatedCellsCount, Status }` | `400 Bad Request` |

## 2. Yêu cầu Chi tiết (Detailed Requirements)

### Requirement: REQ-POGRID-01 Ma trận đặt hàng đa ngày theo lịch giao NCC (Tối đa 31 ngày)
Hệ thống MUST hỗ trợ lập kế hoạch đặt hàng cho nhiều ngày giao hàng trong tương lai trên cùng một bảng ma trận, với phạm vi tối đa 31 ngày (1 tháng).
Các cột ngày giao hàng phải được hiển thị chính xác theo lịch giao của Nhà cung cấp và cấu hình riêng của từng chi nhánh:
- Ô bị khóa và hiển thị gạch ngang `—` nếu:
  1. Ngày nằm ngoài danh sách ngày giao hàng của Chi nhánh đối với Nhà cung cấp (`DeliveryDaysOfWeek`).
  2. Ngày nằm trong danh sách ngày nghỉ/lễ (`holidays` / `blackoutDates`).
  3. Ngày vi phạm thời gian chuẩn bị (`LeadDays`).

#### Scenario: Hiển thị ngày giao hợp lệ và ngày bị khóa
- GIVEN Nhà cung cấp A giao hàng vào Thứ Ba, Thứ Năm, Thứ Bảy; `LeadDays = 1`
- WHEN Người dùng mở bảng ma trận từ ngày `2026-11-02` (Thứ Hai) đến ngày `2026-11-15` (Chủ Nhật)
- THEN Các cột Thứ Ba (`03/11`), Thứ Năm (`05/11`), Thứ Bảy (`07/11`), Thứ Ba tuần sau (`10/11`)... là các ô mở cho phép nhập số lượng
- AND Các ngày Thứ Hai, Thứ Tư, Thứ Sáu, Chủ Nhật hiển thị dạng ô xám `—` không cho phép nhập.

---

### Requirement: REQ-POGRID-02 Mô hình 3 trường số lượng (EmployeeQty, StoreQty, FinalQty)
Hệ thống MUST lưu trữ và xử lý độc lập 3 giá trị số lượng cho mỗi ô `[Chi nhánh, Sản phẩm, Ngày giao hàng]`:
- `EmployeeQty`: Số lượng do nhân viên chi nhánh đề xuất (mặc định 0).
- `StoreQty`: Số lượng do Chủ cửa hàng điều chỉnh (kiểu dữ liệu `number | null`, mặc định `null`).
- `FinalQty`: Số lượng chốt cuối cùng được xác định theo quy tắc:
  $$ \text{FinalQty} = \begin{cases} \text{EmployeeQty}, & \text{khi StoreQty is NULL} \\ \text{StoreQty}, & \text{khi StoreQty is NOT NULL} \end{cases} $$

#### Scenario: Chủ cửa hàng điều chỉnh số lượng
- GIVEN Nhân viên nhập `EmployeeQty = 10`
- WHEN Chủ cửa hàng nhập số lượng điều chỉnh `15` vào ô
- THEN `StoreQty = 15`, `FinalQty = 15`
- AND Ô hiển thị dấu hiệu nổi bật màu sắc/badge chỉ báo đã được Chủ cửa hàng ghi đè, kèm tooltip xem được số lượng gốc của nhân viên.

#### Scenario: Chủ cửa hàng chủ động hủy mặt hàng bằng cách đặt số lượng bằng 0
- GIVEN Nhân viên nhập `EmployeeQty = 10`
- WHEN Chủ cửa hàng nhập `0`
- THEN `StoreQty = 0`, `FinalQty = 0` (hệ thống phân biệt rõ `0` khác với `NULL`)
- AND Khi chốt đơn, sản phẩm này KHÔNG tạo dòng trong Purchase Order.

#### Scenario: Chủ cửa hàng khôi phục số lượng về đề xuất của nhân viên
- GIVEN Ô đang có `EmployeeQty = 20`, `StoreQty = 25`, `FinalQty = 25`
- WHEN Chủ cửa hàng bấm "Khôi phục đề xuất nhân viên"
- THEN `StoreQty` được gán lại thành `null`, `FinalQty` trở về `20`.

---

### Requirement: REQ-POGRID-03 Quản lý Cutoff độc lập theo từng ngày giao hàng
Mỗi ngày giao hàng MUST có thời hạn chốt đơn (`CutoffDateTime`) riêng biệt dựa trên cấu hình giờ chốt đơn của nhà cung cấp.
- Việc chốt đơn cho một ngày giao hàng đến hạn KHÔNG ĐƯỢC phép khóa hay chốt các ngày giao trong tương lai chưa đến cutoff.
- Các ngày giao trong tương lai tiếp tục được lưu trữ dưới dạng kế hoạch dự kiến và cho phép nhân viên / chủ cửa hàng chỉnh sửa cho đến khi đến cutoff tương ứng.

#### Scenario: Thứ Hai chốt đơn Thứ Ba, các ngày Thứ Năm và Thứ Bảy vẫn mở
- GIVEN Hôm nay là Thứ Hai `02/11/2026`. Nhà cung cấp A có lịch giao Thứ Ba (`03/11`), Thứ Năm (`05/11`), Thứ Bảy (`07/11`)
- AND Cutoff của ngày giao `03/11` là `15:00` ngày `02/11` (đã đến hạn)
- WHEN Hệ thống thực hiện chốt đơn cho ngày `03/11`
- THEN Chỉ các số lượng thuộc cột ngày giao `03/11` được chốt và đưa vào PO
- AND Cột ngày giao `05/11` và `07/11` tiếp tục ở trạng thái MỞ (Dự kiến), người dùng vẫn có thể điều chỉnh số lượng bình thường.

---

### Requirement: REQ-POGRID-04 Tự động bóc tách PO theo [Chi nhánh + Nhà cung cấp + Ngày giao hàng]
Khi thực hiện chốt đơn hoặc tạo PO từ ma trận:
- Hệ thống MUST tạo đúng **1 PO cho mỗi tổ hợp [Chi nhánh nhận hàng + Nhà cung cấp + Ngày giao hàng]**.
- KHÔNG gộp các ngày giao khác nhau vào cùng một PO.
- KHÔNG gộp các chi nhánh nhận hàng khác nhau vào cùng một PO.
- Chỉ các sản phẩm có `FinalQty > 0` mới được đưa vào dòng chi tiết PO (`PurchaseOrderDetail`).
- Giá mua (`UnitPrice`) và đơn vị đặt hàng (`OrderUnit`) được lưu thành snapshot cố định tại thời điểm tạo PO.

#### Scenario: Hai chi nhánh cùng đặt hàng và một chi nhánh đặt nhiều ngày
- GIVEN Chi nhánh A đặt NCC A cho ngày giao `03/11` và `05/11`
- AND Chi nhánh B đặt NCC A cho ngày giao `03/11`
- WHEN Thực hiện chốt đơn
- THEN Hệ thống tạo 3 PO độc lập:
  - PO-1: Chi nhánh A · NCC A · Ngày giao `03/11`
  - PO-2: Chi nhánh B · NCC A · Ngày giao `03/11`
  - PO-3: Chi nhánh A · NCC A · Ngày giao `05/11`

---

### Requirement: REQ-POGRID-05 Kiểm tra ràng buộc MOQ và Bội số đặt hàng
Hệ thống MUST kiểm tra:
- Nếu `0 < FinalQty < Product.MOQ`: Báo vi phạm MOQ (viền đỏ + biểu tượng cảnh báo `!`), hiển thị trong danh sách vi phạm và ngăn chặn chốt đơn ngày đó.
- Nếu `FinalQty` không chia hết cho Bội số đặt hàng (`OrderMultiple`): Báo lỗi không đúng quy cách đóng gói (ví dụ: bội số thùng là 6 hoặc 12).

---

### Requirement: REQ-POGRID-06 Tính toán số lượng đề xuất (Suggested Qty)
Hệ thống cung cấp số lượng đề xuất theo công thức:
$$ \text{ForecastSales} = \frac{\text{SalesQty}}{\text{ValidDays}} \times \text{CoverageDays} $$
$$ \text{TargetStock} = \text{ForecastSales} + \text{SafetyStock} $$
$$ \text{NetAvailable} = \text{CurrentStock} + \text{IncomingQty} - \text{ReservedQty} $$
$$ \text{SuggestedQty} = \max(0, \text{TargetStock} - \text{NetAvailable}) $$
Người dùng có thể xem gợi ý và chọn áp dụng số lượng gợi ý vào kế hoạch.

---

### Requirement: REQ-POGRID-07 Quy trình Excel Import/Export 3 Giai đoạn và Định dạng Trang trí
Hệ thống MUST cung cấp tính năng Xuất và Nhập Excel cho Ma trận đặt hàng:
1. **Quy tắc Nghiệp vụ**:
   - Excel Import CHỈ cập nhật dữ liệu nháp (Draft Matrix), KHÔNG trực tiếp tạo Purchase Order và KHÔNG ghi nhận nhập kho.
   - PO chỉ được tạo khi người dùng thực hiện Finalize / Chốt đơn trên hệ thống.
2. **Quy trình Nhập Excel 3 Giai đoạn (Validate → Preview → Apply)**:
   - **Giai đoạn 1: Validate file & ngữ cảnh**:
     - Kiểm tra file rỗng, định dạng chỉ chấp nhận `.xlsx`, giới hạn dung lượng ≤ 5 MB.
     - Validate quyền truy cập `BranchId`, quan hệ `SupplierId` gắn active với Branch, kiểm tra Tenant isolation.
     - Parse template header, đối chiếu danh sách Product Code/Barcode và dải ngày giao hàng.
     - Kiểm tra tính hợp lệ của từng ô: ngày quá cutoff, ngày không giao (`SUPPLIER_OFF`), vi phạm MOQ/OrderMultiple.
   - **Giai đoạn 2: Preview**:
     - Trả về danh sách ô hợp lệ, ô cảnh báo và danh sách lỗi cụ thể (`FILE_INVALID`, `BRANCH_ACCESS_DENIED`, `MOQ_VIOLATION`, v.v.).
     - Nếu có lỗi (ERROR): Khóa nút Apply, hiển thị bảng lỗi chi tiết theo dòng/cột.
     - Nếu không có lỗi (Valid hoặc chỉ có Warning): Mở nút Apply cho phép áp dụng.
   - **Giai đoạn 3: Apply**:
     - Cập nhật số lượng vào bảng nháp `PurchaseOrderDetails` (ghi nhận `StoreQty` cho Store Owner hoặc `EmployeeQty` cho Nhân viên).
     - Tự động tải lại ma trận hiển thị số liệu mới nhất.
3. **Định dạng Xuất Excel Thẩm mỹ (Styled Excel Export)**:
   - Header bảng màu xanh thương hiệu chuyên nghiệp (`#0d9488` hoặc `#1e293b`), chữ trắng in đậm, căn giữa.
   - Các cột cố định sản phẩm (Mã hàng, Mã vạch, Tên hàng, ĐVT, Đơn giá, MOQ) được căn chỉnh độ rộng tự động và freeze panes.
   - Các cột ngày giao hàng được tô màu phân biệt: Cột ngày giao hợp lệ có nền trắng/xanh nhạt, cột ngày không giao được tô nền xám nhạt (`#f1f5f9`) kèm ô khóa không sửa.
   - Định dạng số tiền và số lượng chuẩn phân cách hàng nghìn.

#### Scenario: Nhập file Excel có lỗi MOQ
- GIVEN Người dùng tải lên file Excel có mặt hàng A với số lượng 3, nhưng MOQ của NCC là 5.
- WHEN Bấm "Tải lên & Kiểm tra".
- THEN Modal hiển thị bảng Preview với dòng lỗi màu đỏ: "Sản phẩm A: Số lượng 3 nhỏ hơn MOQ 5", nút "Xác nhận áp dụng" bị vô hiệu hóa.

#### Scenario: Nhập file Excel hợp lệ và Apply
- GIVEN Toàn bộ các dòng trong file Excel đều hợp lệ và không vi phạm cutoff.
- WHEN Người dùng bấm "Áp dụng vào ma trận".
- THEN Hệ thống cập nhật các ô nháp trong DB, hiển thị toast thành công và reload lại lưới ma trận.

---

### Requirement: REQ-POGRID-08 Kiểm tra Hạn mức Tín dụng (Credit Limit)
- Nếu `OpenAP + Tổng giá trị các PO mới > CreditLimit`: Gán trạng thái PO là `PENDING_CREDIT_APPROVAL` (Chờ duyệt tín dụng).
- Ngược lại: Gán trạng thái PO là `PENDING_APPROVAL` hoặc `DRAFT`.

---

## 3. Acceptance Checklist
- [x] REQ-POGRID-01: Ma trận hỗ trợ phạm vi tối đa 31 ngày, khóa chuẩn các ngày nghỉ, ngày lễ, ngày vi phạm lead time hoặc không thuộc DeliveryDaysOfWeek của chi nhánh.
- [x] REQ-POGRID-02: Vận hành đúng 3 giá trị `EmployeeQty`, `StoreQty` (nullable), `FinalQty`. Phân biệt rõ `0` và `NULL`.
- [x] REQ-POGRID-03: Cột ngày giao hiển thị rõ trạng thái Cutoff; chốt ngày đến hạn cutoff mà không khóa ngày tương lai.
- [x] REQ-POGRID-04: Tạo PO tách bạch 100% theo [Chi nhánh + NCC + Ngày giao]. Không tạo dòng cho sản phẩm có FinalQty = 0.
- [x] REQ-POGRID-05: Cảnh báo vi phạm MOQ và bội số đặt hàng.
- [x] REQ-POGRID-06: Hiển thị và hỗ trợ điền số lượng đề xuất (Suggested Qty).
- [x] REQ-POGRID-07: Quy trình Excel Import/Export 3 pha (Validate -> Preview -> Apply) và Excel Export format thẩm mỹ hoàn thiện.
- [x] REQ-POGRID-08: Tự động phân loại trạng thái tín dụng nếu vượt hạn mức công nợ.
- [x] Toàn bộ code biên dịch và build thành công không lỗi.

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: branch-employee-order-matrix -->
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
