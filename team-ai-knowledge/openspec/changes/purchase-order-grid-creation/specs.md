# Specs: purchase-order-grid-creation (FE-05 Ordering)

## 1. API / Contract

| Method | Path | Request Body / Query | Response | Error Codes |
|---|---|---|---|---|
| GET | `/api/v1/purchase-orders/grid-init` | Query: `supplierId`, `branchId` | `GridInitDto` (SupplierInfo, CreditInfo, Categories, BranchInfo) | `400`, `404` |
| GET | `/api/v1/purchase-orders/grid-products` | Query: `supplierId`, `branchId`, `fromDate`, `toDate` | `List<GridProductDto>` (Products, AvailabilityRules, CutoffSchedules, ExistingQuantities) | `400` |
| POST | `/api/v1/purchase-orders/grid-submit` | Body: `SubmitGridPoCommand` | `SubmitGridResultDto` (CreatedPoIds, SplitPosList, Status) | `400 Bad Request` (vi phạm MOQ/LeadTime/Cutoff) |
| POST | `/api/v1/purchase-orders/grid-draft` | Body: `SaveGridDraftCommand` | `200 OK` | `400` |
| POST | `/api/v1/purchase-orders/grid-export-excel` | Body: `ExportGridCommand` | File Stream (CSV / XLSX) | `400` |
| POST | `/api/v1/purchase-orders/grid-import-excel` | Form-data: File | `List<ImportResultItem>` | `400` |

## 2. Yêu cầu Chi tiết (Detailed Requirements)

### Requirement: REQ-POGRID-01 Ma trận đặt hàng đa ngày theo lịch giao NCC (Tối đa 31 ngày)
Hệ thống MUST hỗ trợ lập kế hoạch đặt hàng cho nhiều ngày giao hàng trong tương lai trên cùng một bảng ma trận, với phạm vi tối đa 31 ngày (1 tháng).
Các cột ngày giao hàng phải được hiển thị chính xác theo lịch giao của Nhà cung cấp:
- Ô bị khóa và hiển thị gạch ngang `—` nếu:
  1. Ngày nằm ngoài danh sách ngày giao hàng trong tuần của Nhà cung cấp (`activeDeliveryDays`).
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

### Requirement: REQ-POGRID-07 Tiện ích Sao chép tuần trước & Xuất/Nhập Excel
- Nút "Copy Prev Week": Tự động sao chép số lượng từ 7 ngày trước đó vào các ô hợp lệ của tuần đang xem.
- Xuất Excel: Xuất toàn bộ bảng kế hoạch ra file `.csv` / `.xlsx` hiển thị đầy đủ thông tin sản phẩm, đơn giá, MOQ, và số lượng theo từng ngày.
- Nhập Excel: Nạp file bảng tính để điền tự động số lượng vào các ô hợp lệ chưa qua cutoff.

---

### Requirement: REQ-POGRID-08 Kiểm tra Hạn mức Tín dụng (Credit Limit)
- Nếu `OpenAP + Tổng giá trị các PO mới > CreditLimit`: Gán trạng thái PO là `PENDING_CREDIT_APPROVAL` (Chờ duyệt tín dụng).
- Ngược lại: Gán trạng thái PO là `PENDING_APPROVAL` hoặc `DRAFT`.

---

## 3. Acceptance Checklist
- [ ] REQ-POGRID-01: Ma trận hỗ trợ phạm vi tối đa 31 ngày, khóa chuẩn các ngày nghỉ, ngày lễ, ngày vi phạm lead time.
- [ ] REQ-POGRID-02: Vận hành đúng 3 giá trị `EmployeeQty`, `StoreQty` (nullable), `FinalQty`. Phân biệt rõ `0` và `NULL`.
- [ ] REQ-POGRID-03: Cột ngày giao hiển thị rõ trạng thái Cutoff; chốt ngày đến hạn cutoff mà không khóa ngày tương lai.
- [ ] REQ-POGRID-04: Tạo PO tách bạch 100% theo [Chi nhánh + NCC + Ngày giao]. Không tạo dòng cho sản phẩm có FinalQty = 0.
- [ ] REQ-POGRID-05: Cảnh báo vi phạm MOQ và bội số đặt hàng.
- [ ] REQ-POGRID-06: Hiển thị và hỗ trợ điền số lượng đề xuất (Suggested Qty).
- [ ] REQ-POGRID-07: Sao chép tuần trước và Xuất/Nhập Excel hoạt động chính xác.
- [ ] REQ-POGRID-08: Tự động phân loại trạng thái tín dụng nếu vượt hạn mức công nợ.
