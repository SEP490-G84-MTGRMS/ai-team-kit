# Spec: purchase-order

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-01 Top Urgency Bar & Overview Metrics
Hệ thống MUST hiển thị thanh chỉ số tổng quan ở đầu màn hình (Top Urgency Bar), bao gồm tổng số NCC có đơn nháp, tổng số SKU, tổng tiền dự kiến, và phân loại theo 3 mức độ deadline:
- 🔴 Sắp hết hạn (< 2 giờ)
- 🟡 Trong hôm nay
- ⚪ Các ngày sau trong tuần  
Đồng thời, hệ thống MUST cung cấp nút tác vụ nhanh: **"Chốt nhanh các đơn hết hạn hôm nay"**.

#### Scenario: Hiển thị đầy đủ các chỉ số khẩn cấp
- **GIVEN** Người dùng mở màn hình Trung tâm Chốt Đơn (`/store-owner/purchase-orders/dispatch-hub`).
- **WHEN** Dữ liệu đơn nháp được tải.
- **THEN** Thanh chỉ số hiển thị tổng số NCC (VD: 8 NCC), tổng tiền (VD: 45.200.000 đ) và số lượng NCC cần chốt gấp theo deadline.

#### Scenario: Bấm nút Chốt nhanh các đơn hết hạn hôm nay
- **GIVEN** Có 2 NCC có trạng thái sắp hết hạn trong hôm nay và đều đạt điều kiện MOV.
- **WHEN** Người dùng bấm nút "Chốt nhanh các đơn hết hạn hôm nay".
- **THEN** Hệ thống mở modal xác nhận chốt gộp 2 NCC này thành các PO độc lập tương ứng.

---

### Requirement: REQ-02 Urgency Tabs & Supplier Search
Hệ thống MUST cung cấp thanh lọc phân loại (Filter Tabs/Pills) gồm: **Tất cả**, **🔴 Cần chốt gấp**, **Hôm nay**, **Đợt tới trong tuần**, **Đã gửi PO** kèm số đếm bản ghi trên từng tab. Hệ thống SHALL hỗ trợ ô tìm kiếm realtime theo tên NCC, mã NCC hoặc nhóm sản phẩm.

#### Scenario: Lọc danh sách theo tab Cần chốt gấp
- **GIVEN** Danh sách có 8 NCC gồm cả các đơn khẩn cấp và đơn tuần tới.
- **WHEN** Người dùng nhấp chọn tab "🔴 Cần chốt gấp".
- **THEN** Danh sách chỉ hiển thị các thẻ NCC có thời gian Cutoff còn dưới 2 giờ.

#### Scenario: Tìm kiếm NCC theo từ khóa
- **GIVEN** Người dùng đang ở màn hình chốt đơn.
- **WHEN** Người dùng nhập từ khóa "Hương Quê" vào ô tìm kiếm.
- **THEN** Danh sách lọc ngay lập tức chỉ hiển thị NCC "Công ty Thực phẩm Tươi Sống Hương Quê".

---

### Requirement: REQ-03 Two-Tier Supplier Order Accordion Cards with Deep-Link
Mỗi Nhà cung cấp MUST được hiển thị dưới dạng một thẻ (Card) tổng hợp:
- **Tầng 1 (Summary Card)**: Tên & mã NCC, tag nhóm hàng, Cutoff Time kèm Countdown timer đếm ngược, Ngày giao dự kiến, Số SKU, Tổng SL, Tổng tiền tạm tính, trạng thái MOV, và nút [Xem chi tiết], [Chốt & Tạo PO].
- **Deep-Link sang Matrix**: Khi cần xem chi tiết ma trận đặt hàng hoặc chỉnh sửa số lượng trước khi chốt, người dùng SHALL có thể bấm liên kết trực tiếp sang trang Order Matrix với bộ lọc `?supplierId={id}&orderedOnly=true`.

#### Scenario: Xem thẻ NCC và chuyển sang Order Matrix để chỉnh sửa
- **GIVEN** Thẻ NCC "Công ty Thực phẩm Tươi Sống Hương Quê" đang ở trạng thái nháp.
- **WHEN** Người dùng muốn điều chỉnh số lượng của từng mặt hàng cho từng chi nhánh.
- **THEN** Người dùng nhấp vào link "Xem chi tiết ma trận đặt hàng", hệ thống điều hướng sang trang Order Matrix với đúng chi nhánh và NCC đã chọn.

---

### Requirement: REQ-04 Min Order Value (MOV) & Overdue Cutoff Validation
Hệ thống MUST kiểm tra điều kiện Giá trị đơn hàng tối thiểu (MOV) của từng NCC:
- Nếu tổng tiền < MOV: Hiển thị cảnh báo màu vàng/đỏ và vô hiệu hóa nút chốt đơn trực tiếp (hoặc yêu cầu xác nhận kèm nhắc nhở đặt thêm).
- Nếu đã quá giờ Cutoff (Overdue): Hiển thị cảnh báo đỏ và thông báo đơn hàng sẽ tự động dời lịch giao sang ngày kế tiếp hoặc bị bỏ qua nếu chốt theo kỳ hiện tại.

#### Scenario: Cảnh báo chưa đạt giá trị đơn tối thiểu (MOV)
- **GIVEN** NCC "Bao bì Việt Tiến" yêu cầu đơn hàng tối thiểu là 1.000.000 đ.
- **WHEN** Đơn nháp hiện tại của NCC này chỉ có giá trị 850.000 đ.
- **THEN** Thẻ hiển thị cảnh báo "Chưa đạt đơn tối thiểu 1.000.000 đ (Thiếu 150.000 đ)" và nút Chốt đơn bị khóa hoặc chuyển sang trạng thái cảnh báo.

#### Scenario: Cảnh báo đơn quá giờ Cutoff
- **GIVEN** Giờ cutoff của NCC là 15:00 và thời gian hệ thống đã là 15:10.
- **WHEN** Người dùng xem thẻ NCC này.
- **THEN** Hệ thống hiển thị badge "ĐÃ QUÁ GIỜ CUTOFF" và cảnh báo lịch giao không thể chốt cho ngày hiện tại.

---

### Requirement: REQ-05 Single-Center Purchase Order Dispatch Confirmation Modal
Hệ thống MUST cung cấp popup xác nhận chốt đơn NCC tập trung (`DispatchConfirmModal`):
- Vị trí cố định giữa màn hình (`fixed`, căn giữa, `z-index: 99999`) với backdrop mờ tối.
- Tiêu đề hiển thị rõ tên và mã NCC được chọn.
- Segmented control lựa chọn phạm vi: "Ngày giao gần nhất" và "Cả tuần (T2–CN)".
- 4 Card Metrics tóm tắt:
  1. Tổng số PO dự kiến tạo
  2. Số chi nhánh có đơn
  3. Tổng số SKU
  4. Tổng giá trị dự kiến (hiển thị thông báo nếu thiếu giá)
- Bảng Preview Table tinh gọn 6 cột: `Chi nhánh`, `Ngày giao`, `Số SKU`, `SL đặt`, `Giá trị dự kiến`, `Trạng thái`. **KHÔNG CÓ dropdown mũi tên mở rộng sản phẩm** để tránh rối loạn giao diện khi chốt hàng chục chi nhánh.
- Khối cảnh báo danh sách nhóm bị bỏ qua (Skipped Groups) và lý do chi tiết.
- Textarea ghi chú đính kèm gửi NCC (chỉ áp dụng cho các PO được tạo thành công).
- Sticky footer với nút Hủy và nút Submit hành động ("Chốt ngày giao gần nhất" hoặc "Chốt đơn cả tuần"), có loading spinner, disable khi không có group hợp lệ và chống bấm đúp (double-click).

#### Scenario: Hiển thị modal xác nhận và kiểm tra thông tin tóm tắt
- **GIVEN** Người dùng chọn bấm "Chốt đơn" trên thẻ NCC "Hương Quê".
- **WHEN** Modal xác nhận mở ra.
- **THEN** Hệ thống gọi API Preview để lấy danh sách PO dự kiến; modal hiển thị căn giữa màn hình với 4 thẻ metrics và bảng 6 cột tinh gọn rõ ràng.

---

### Requirement: REQ-06 Phạm vi Chốt Đơn (Scope): NEAREST và WEEK
Hệ thống MUST hỗ trợ 2 phạm vi chốt đơn:
1. **NEAREST**:
   - Chọn ngày giao gần nhất trong tương lai **có số lượng đặt hàng (`FinalQty > 0`)** và còn đủ điều kiện chốt (thời điểm hiện tại chưa vượt quá Cutoff time).
   - Bỏ qua các ngày đã quá hạn Cutoff, ngày NCC không hoạt động (`SUPPLIER_OFF`), hoặc ngày không có mặt hàng nào được đặt.
2. **WEEK**:
   - Chọn tất cả các ngày giao hợp lệ từ **Thứ Hai đến Chủ nhật** của tuần hiện tại (hoặc tuần được chọn) theo múi giờ `Asia/Ho_Chi_Minh`.
   - Mỗi ngày giao có số lượng đặt hàng (`FinalQty > 0`) và chưa quá cutoff sẽ được tạo thành PO riêng biệt.

#### Scenario: Chốt theo phạm vi NEAREST
- **GIVEN** NCC có dữ liệu đặt hàng vào Thứ Tư (04/11) và Thứ Sáu (06/11). Thời điểm hiện tại Thứ Tư chưa quá cutoff.
- **WHEN** Người dùng chọn scope "Ngày giao gần nhất" và bấm Chốt.
- **THEN** Hệ thống chỉ tạo PO cho ngày Thứ Tư (04/11). Ngày Thứ Sáu vẫn giữ nguyên ở trạng thái nháp.

#### Scenario: Chốt theo phạm vi WEEK
- **GIVEN** Chi nhánh có lịch đặt Thứ Tư và Thứ Sáu cùng tuần với FinalQty > 0.
- **WHEN** Người dùng chọn scope "Cả tuần (T2–CN)" và xác nhận chốt.
- **THEN** Hệ thống tạo 2 Purchase Order riêng biệt cho Thứ Tư và Thứ Sáu của tuần đó.

---

### Requirement: REQ-07 Nguyên tắc Bất biến 1 PO = 1 Branch + 1 Supplier + 1 DeliveryDate
Hệ thống SHALL bảo đảm nguyên tắc phân rã bất biến:
- Mỗi Purchase Order chỉ tương ứng với đúng **1 Chi nhánh + 1 Nhà cung cấp + 1 Ngày giao hàng cụ thể**.
- TUYỆT ĐỐI KHÔNG gộp nhiều ngày giao vào cùng 1 PO.
- TUYỆT ĐỐI KHÔNG gộp nhiều chi nhánh vào cùng 1 PO.
- Đảm bảo tính duy nhất nghiệp vụ: Trong cùng 1 Tenant, không thể tạo 2 Purchase Order ở trạng thái cam kết (COMMITTED/APPROVED) cho cùng một bộ `(BranchId, SupplierId, DeliveryDate)`.

#### Scenario: Tách thành nhiều PO độc lập khi chốt nhiều chi nhánh và ngày giao
- **GIVEN** Có 2 chi nhánh (Q1 và Q2) cùng đặt hàng của NCC A vào 2 ngày (T4 và T6).
- **WHEN** Store Owner thực hiện chốt đơn cả tuần.
- **THEN** Hệ thống tạo đúng 4 Purchase Order độc lập: (Q1, A, T4), (Q1, A, T6), (Q2, A, T4), (Q2, A, T6).

---

### Requirement: REQ-08 Nguồn Dữ liệu Chốt 100% từ Database Matrix Draft
Hệ thống MUST lấy số lượng chốt trực tiếp từ cơ sở dữ liệu Draft Matrix (`PurchaseOrderDetails` có trạng thái DRAFT):
- Công thức tính: `FinalQty = detail.StoreQty ?? detail.EmployeeQty ?? 0`.
- Client (Frontend) KHÔNG ĐƯỢC PHÉP gửi danh sách số lượng tự tính lên khi chốt để ngăn chặn tình trạng stale data hoặc gian lận số lượng.
- Frontend chỉ gửi `SupplierId`, `Scope`, `ReferenceDate`, `BranchIds` (tùy chọn) và `Note`. Backend sẽ truy vấn và tính toán lại 100%.

#### Scenario: Tính toán số lượng chốt từ DB Draft
- **GIVEN** Chi nhánh có một mặt hàng với `EmployeeQty = 10`, sau đó Store Owner chỉnh sửa `StoreQty = 15` trên Matrix.
- **WHEN** Thực hiện Preview hoặc Chốt đơn.
- **THEN** Backend tự động lấy `FinalQty = 15` từ DB, tính thành tiền theo đơn giá hiện hành và tạo chi tiết PO với số lượng 15.

---

### Requirement: REQ-09 Xử lý Chốt Đơn Hàng Loạt Hỗ trợ Partial Success
Hệ thống MUST xử lý từng nhóm PO độc lập trong một phiên chốt hàng loạt (Batch Execution):
- Mỗi group `(BranchId, DeliveryDate)` được kiểm tra điều kiện riêng biệt.
- Nếu 1 group bị lỗi (ví dụ: đã quá giờ cutoff hoặc đã chốt trước đó), hệ thống KHÔNG ĐƯỢC rollback toàn bộ các group khác.
- Kết quả trả về danh sách chi tiết:
  - `SUCCESS`: Tạo PO thành công kèm `PurchaseOrderId` và `PurchaseOrderCode`.
  - `SKIPPED`: Bỏ qua kèm lý do chuẩn hóa (`CUTOFF_EXPIRED`, `ALREADY_FINALIZED`, `NO_QUANTITY`, `SUPPLIER_OFF`).
  - `FAILED`: Thất bại kèm thông điệp lỗi nghiệp vụ cụ thể (`MIN_ORDER_VALUE_NOT_MET`, `PRODUCT_INACTIVE`).

#### Scenario: Xử lý partial success khi một chi nhánh quá giờ cutoff
- **GIVEN** Chi nhánh A đã quá giờ cutoff 14:00, chi nhánh B có giờ cutoff 16:00 (vẫn còn hạn).
- **WHEN** Store Owner bấm chốt đơn cho cả 2 chi nhánh.
- **THEN** Chi nhánh B tạo PO thành công (Status: SUCCESS). Chi nhánh A bị bỏ qua với lý do "Đã quá thời gian cutoff" (Status: SKIPPED). Hệ thống trả về kết quả rõ ràng cho người dùng.

---

### Requirement: REQ-10 Dry Run Preview API Endpoint
Hệ thống MUST cung cấp API `POST /api/purchase-orders/matrix/split/preview`:
- Thực hiện toàn bộ logic phân rã, kiểm tra cutoff, gom nhóm và tính tiền giả lập trong bộ nhớ mà KHÔNG ghi dữ liệu vào cơ sở dữ liệu.
- Trả về danh sách PO dự kiến tạo, danh sách group bị bỏ qua, tổng số PO, tổng chi nhánh, tổng SKU, tổng giá trị ước tính và cờ `HasMissingPrice`.
- Giúp Frontend render bảng xác nhận chính xác tuyệt đối với Backend trước khi người dùng ra quyết định chốt.

#### Scenario: Gọi Preview trước khi mở modal
- **GIVEN** Store Owner nhấp vào nút "Chốt đơn" của NCC Hương Quê.
- **WHEN** Modal mở ra.
- **THEN** Frontend gọi ngay API Preview; backend tính toán và trả về chính xác số PO sẽ tạo và số tiền, không xảy ra sai lệch số liệu giữa FE và BE.

---

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

- [x] REQ-POGRID-01: Ma trận hỗ trợ phạm vi tối đa 31 ngày, khóa chuẩn các ngày nghỉ, ngày lễ, ngày vi phạm lead time hoặc không thuộc DeliveryDaysOfWeek của chi nhánh.
- [x] REQ-POGRID-02: Vận hành đúng 3 giá trị `EmployeeQty`, `StoreQty` (nullable), `FinalQty`. Phân biệt rõ `0` và `NULL`.
- [x] REQ-POGRID-03: Cột ngày giao hiển thị rõ trạng thái Cutoff; chốt ngày đến hạn cutoff mà không khóa ngày tương lai.
- [x] REQ-POGRID-04: Tạo PO tách bạch 100% theo [Chi nhánh + NCC + Ngày giao]. Không tạo dòng cho sản phẩm có FinalQty = 0.
- [x] REQ-POGRID-05: Cảnh báo vi phạm MOQ và bội số đặt hàng.
- [x] REQ-POGRID-06: Hiển thị và hỗ trợ điền số lượng đề xuất (Suggested Qty).
- [x] REQ-POGRID-07: Quy trình Excel Import/Export 3 pha (Validate -> Preview -> Apply) và Excel Export format thẩm mỹ hoàn thiện.
- [x] REQ-POGRID-08: Tự động phân loại trạng thái tín dụng nếu vượt hạn mức công nợ.
- [x] Toàn bộ code biên dịch và build thành công không lỗi.

### Requirement: REQ-01 Hiển thị Bảng danh sách Đơn mua hàng PO
Hệ thống **MUST** hiển thị danh sách tất cả các đơn mua hàng (PO) dạng bảng dữ liệu chuẩn Enterprise ERP với Sticky Header, bo góc `rounded-xl`, đổ bóng nhẹ `shadow-sm`, bao gồm đầy đủ 10 cột dữ liệu: Mã PO/Mã cửa hàng, Nhà cung cấp, Chi nhánh nhận, Nguồn tạo/Người nhập, Ngày sửa cuối, Ngày dự kiến giao, Số mặt hàng (SKU), Tổng tiền (VNĐ), Trạng thái PO và Cột Thao tác.

#### Scenario: Hiển thị bảng PO đầy đủ
- **GIVEN** Store Owner đã đăng nhập và truy cập màn hình Danh sách PO.
- **WHEN** Trang tải dữ liệu danh sách đơn hàng thành công.
- **THEN** Hệ thống hiển thị danh sách đơn hàng có phân trang, định dạng số tiền tiếng Việt (`vi-VN`), cột số căn phải, font monospace tabular nums.

#### Scenario: Danh sách rỗng không có bản ghi nào
- **GIVEN** Hệ thống chưa có đơn PO nào được tạo.
- **WHEN** Trang hiển thị bảng dữ liệu.
- **THEN** Hệ thống hiển thị hàng thông báo rỗng `"Chưa có đơn mua hàng PO nào trong hệ thống"` kèm hình ảnh minh họa thân thiện.

---

### Requirement: REQ-02 Bộ lọc đa tiêu chí hợp nhất (Unified Filter Bar)
Hệ thống **MUST** cung cấp thanh bộ lọc hợp nhất cho phép lọc linh hoạt theo:
1. Chi nhánh nhận hàng (`branchId`: Tất cả hoặc từng chi nhánh cụ thể).
2. Nhà cung cấp (`supplierId`: Tất cả hoặc từng NCC cụ thể).
3. Trạng thái PO (`status`: Tất cả, `SENT`, `CONFIRMED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED`).
4. Khoảng thời gian (`dateFrom` - `dateTo`).
5. Từ khóa tìm kiếm (`keyword`: tìm theo mã PO, mã NCC, tên NCC, tên chi nhánh, người nhập, tên SKU).
Kèm nút `[Tìm kiếm]` để áp dụng bộ lọc và nút `[Đặt lại]` để xóa trắng tất cả tiêu chí về mặc định.

#### Scenario: Lọc đơn hàng theo Chi nhánh và Trạng thái
- **GIVEN** Danh sách có các đơn từ chi nhánh `BR-01`, `BR-02`, `DC1` với nhiều trạng thái khác nhau.
- **WHEN** Store Owner chọn `Chi nhánh: BR-01` và `Trạng thái: SENT`, sau đó nhấn `[Tìm kiếm]`.
- **THEN** Bảng chỉ hiển thị các đơn PO của chi nhánh `BR-01` có trạng thái `SENT`. Số lượng bản ghi trên footer phân trang cập nhật tương ứng.

#### Scenario: Tìm kiếm từ khóa không có kết quả phù hợp
- **GIVEN** Bảng đang hiển thị danh sách đơn hàng.
- **WHEN** Store Owner nhập từ khóa `"NCC_KHONG_TON_TAI_999"` và nhấn `[Tìm kiếm]`.
- **THEN** Bảng hiển thị giao diện rỗng `"Không tìm thấy đơn mua hàng nào phù hợp với bộ lọc"` và cung cấp nút `"Đặt lại bộ lọc"`.

---

### Requirement: REQ-03 Phân trang bảng dữ liệu (Pagination Footer)
Hệ thống **MUST** tích hợp footer phân trang ở cuối bảng dữ liệu đồng bộ với layout chuẩn của hệ thống:
- Hiển thị dải bản ghi: `Hiển thị X - Y trên Z đơn mua hàng PO`.
- Cho phép chọn số bản ghi trên một trang: `10`, `20`, `30`, `50`.
- Cho phép chuyển trang thông qua nút `[Trước]`, `Trang X / Y`, `[Sau]`.
- Nút `[Trước]` **MUST** bị vô hiệu hóa (disabled) khi đang ở trang 1; nút `[Sau]` **MUST** bị vô hiệu hóa khi ở trang cuối cùng.

#### Scenario: Chuyển trang và thay đổi kích thước trang
- **GIVEN** Danh sách có tổng cộng 25 đơn PO, kích thước trang hiện tại là `10` (tổng 3 trang).
- **WHEN** Store Owner nhấn nút `[Sau]`.
- **THEN** Bảng hiển thị các đơn PO từ vị trí thứ 11 đến 20, nhãn trang chuyển thành `Trang 2 / 3`.
- **WHEN** Store Owner thay đổi số bản ghi/trang thành `50`.
- **THEN** Bảng hiển thị toàn bộ 25 đơn hàng trên trang 1 và nhãn trang chuyển thành `Trang 1 / 1`.

---

### Requirement: REQ-04 Xem nhanh chi tiết PO qua Slide-over Drawer
Hệ thống **MUST** hỗ trợ mở Slide-over Drawer từ bên phải khi Store Owner click vào mã PO hoặc nút `"Xem chi tiết"` ở cột Thao tác.
Drawer **MUST** hiển thị:
- Header: Mã PO, Mã tham chiếu cửa hàng, Tên Nhà cung cấp, Chi nhánh nhận, Badge trạng thái đơn, Nút đóng `[X]`.
- Danh sách mặt hàng: Bảng chi tiết gồm STT, Tên mặt hàng, Mã SKU, Đơn vị tính (ĐVT), Số lượng đặt hàng, Số lượng đã nhận (nếu có), Đơn giá (VNĐ), Thành tiền (VNĐ).
- Footer: Ghi chú đơn hàng (nếu có) và Tổng tiền đơn hàng in đậm nổi bật.

#### Scenario: Mở và đóng Drawer xem chi tiết PO
- **GIVEN** Bảng dữ liệu đang hiển thị đơn `PO-20261008-001`.
- **WHEN** Store Owner click vào nút `"Xem chi tiết"` của đơn này.
- **THEN** Ngăn kéo trượt ra từ bên phải màn hình hiển thị danh sách 5 mặt hàng của đơn và tổng tiền `3.450.000 đ`.
- **WHEN** Store Owner nhấn nút `[X]` hoặc click vào lớp nền mờ (backdrop) hoặc nhấn phím `Escape`.
- **THEN** Drawer đóng lại mà không làm thay đổi các tiêu chí lọc hiện tại trên bảng danh sách.

---

### Requirement: REQ-05 Định dạng Huy hiệu Trạng thái (Status Badges)
Hệ thống **MUST** trực quan hóa trạng thái đơn hàng bằng huy hiệu (badge) có màu sắc ngữ nghĩa rõ ràng, đúng quy chuẩn:
- `SENT`: Nền `#fef3c7`, chữ `#b45309`, viền `#fde68a`, nhãn `"Đã gửi NCC"`.
- `CONFIRMED`: Nền `#dcfce7`, chữ `#15803d`, viền `#86efac`, nhãn `"NCC đã chốt"`.
- `PARTIALLY_RECEIVED`: Nền `#e0e7ff`, chữ `#4338ca`, viền `#c7d2fe`, nhãn `"Đã nhận 1 phần"`.
- `RECEIVED`: Nền `#e0f2fe`, chữ `#0369a1`, viền `#bae6fd`, nhãn `"Đã nhập kho xong"`.
- `CANCELLED`: Nền `#fee2e2`, chữ `#dc2626`, viền `#fca5a5`, nhãn `"Đã hủy"`.

#### Scenario: Hiển thị đúng màu và nhãn trạng thái PO
- **GIVEN** Một đơn hàng có thuộc tính `status: 'CONFIRMED'`.
- **WHEN** Dòng đơn hàng được render trên bảng hoặc drawer.
- **THEN** Hệ thống hiển thị badge màu xanh lá với văn bản `"NCC đã chốt"`.

---

### Requirement: REQ-06 Lịch sử Điều chỉnh Đơn hàng (Purchase Order Revisions & Audit)
Hệ thống **MUST** theo dõi và ghi nhận đầy đủ lịch sử các lần điều chỉnh đơn hàng (`PurchaseOrderRevision`):
- Mỗi lần Store Owner điều chỉnh số lượng hoặc thông tin dòng PO sau khi đã gửi, hệ thống tự động sinh một bản ghi Revision gồm: Phiên bản (`RevisionNumber`), Người sửa (`ChangedBy`), Thời điểm sửa (`CreatedAt`), Lý do sửa (`ChangeReason`), và danh sách các dòng chi tiết thay đổi (`OldQty`, `NewQty`, `DeltaAmount`).
- Drawer xem chi tiết PO SHALL có tab hoặc khu vực "Lịch sử điều chỉnh" để Store Owner xem lại chi tiết sự khác biệt giữa các phiên bản đơn hàng.

#### Scenario: Xem lịch sử điều chỉnh PO
- **GIVEN** Đơn hàng `PO-20261014-002` đã được điều chỉnh số lượng từ 20 xuống 15 cho sản phẩm sữa tươi.
- **WHEN** Store Owner mở xem chi tiết đơn hàng và chuyển sang mục Lịch sử điều chỉnh.
- **THEN** Hệ thống hiển thị bản ghi Revision #1 với người sửa, thời gian và chỉ báo "Sữa tươi: 20 -> 15 (Giảm 5)".

---

## Lịch sử
- 2026-11-05 · `supplier-order-dispatch-cutoff` · +10 ~0 -0
- 2026-11-05 · `purchase-order-grid-creation` · +8 ~0 -0
- 2026-11-05 · `store-owner-po-list` · +6 ~0 -0
