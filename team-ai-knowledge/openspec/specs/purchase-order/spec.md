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

## Lịch sử
- 2026-11-05 · `supplier-order-dispatch-cutoff` · +10 ~0 -0
