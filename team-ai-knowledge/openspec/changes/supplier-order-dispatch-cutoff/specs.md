# Specs: supplier-order-dispatch-cutoff

## API / Contract

| Method / Interface | Route / Component | Request / Props | Response / Output | Lỗi / Cảnh báo |
|---|---|---|---|---|
| `SupplierOrderDispatchHubPage` | `/store-owner/purchase-orders/dispatch-hub` | State nội bộ | Render Trung tâm Chốt Đơn & Tách PO theo NCC | Empty state nếu không có đơn nháp |
| `handleQuickDispatchToday` | Handler | N/A | Chốt toàn bộ các NCC có cutoff trong hôm nay | Cảnh báo nếu có đơn chưa đạt MOV |
| `handleDispatchSupplier` | Handler | `supplierId: string` | Mở modal xác nhận phát hành PO độc lập | Cảnh báo nếu đơn rỗng hoặc vi phạm MOV |
| `handleUpdateItemQty` | Handler | `supplierId, itemId, newQty` | Cập nhật số lượng SKU inline và tính lại tổng tiền | Reset về 0 nếu nhập số âm |

---

## ADDED Requirements

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
- **THEN** Hệ thống mở modal xác nhận chốt gộp 2 NCC này thành 2 PO độc lập tương ứng.

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

### Requirement: REQ-03 Two-Tier Supplier Order Accordion Cards with Inline Edit
Mỗi Nhà cung cấp MUST được hiển thị dưới dạng một thẻ (Card) 2 tầng thông tin:
- **Tầng 1 (Summary Card)**: Tên & mã NCC, tag nhóm hàng, Cutoff Time kèm Countdown timer đếm ngược, Ngày giao dự kiến, Số SKU, Tổng SL, Tổng tiền tạm tính, trạng thái MOV, và nút [Xem chi tiết SKU], [Chốt & Tạo PO].
- **Tầng 2 (Expanded Grid)**: Bảng chi tiết từng SKU (Tên, ĐVT, Đơn giá, SL, Thành tiền, Tình trạng Cutoff) với khả năng chỉnh sửa trực tiếp (inline) số lượng đặt hàng, cùng ô nhập ghi chú giao hàng cho NCC.

#### Scenario: Mở rộng chi tiết SKU và chỉnh sửa số lượng tại chỗ
- **GIVEN** Thẻ NCC "Công ty Thực phẩm Tươi Sống Hương Quê" đang ở trạng thái thu gọn.
- **WHEN** Người dùng bấm nút "Xem chi tiết 6 mặt hàng".
- **THEN** Bảng chi tiết SKU mở rộng bên dưới; người dùng thay đổi số lượng "Thịt ba chỉ bò Úc" từ 10 thành 15; tổng tiền của mặt hàng và tổng tiền của NCC được tự động tính toán lại ngay lập tức.

---

### Requirement: REQ-04 Min Order Value (MOV) & Overdue Cutoff Validation
Hệ thống MUST kiểm tra điều kiện Giá trị đơn hàng tối thiểu (MOV) của từng NCC:
- Nếu tổng tiền < MOV: Hiển thị cảnh báo màu vàng/đỏ và vô hiệu hóa nút chốt đơn trực tiếp (hoặc yêu cầu xác nhận kèm nhắc nhở đặt thêm).
- Nếu đã quá giờ Cutoff (Overdue): Hiển thị cảnh báo đỏ và thông báo đơn hàng sẽ tự động dời lịch giao sang ngày kế tiếp.

#### Scenario: Cảnh báo chưa đạt giá trị đơn tối thiểu (MOV)
- **GIVEN** NCC "Bao bì Việt Tiến" yêu cầu đơn hàng tối thiểu là 1.000.000 đ.
- **WHEN** Đơn nháp hiện tại của NCC này chỉ có giá trị 850.000 đ.
- **THEN** Thẻ hiển thị cảnh báo "Chưa đạt đơn tối thiểu 1.000.000 đ (Thiếu 150.000 đ)" và nút Chốt đơn bị khóa hoặc chuyển sang trạng thái cảnh báo.

#### Scenario: Cảnh báo đơn quá giờ Cutoff
- **GIVEN** Giờ cutoff của NCC là 15:00 và thời gian hệ thống đã là 15:10.
- **WHEN** Người dùng xem thẻ NCC này.
- **THEN** Hệ thống hiển thị badge "ĐÃ QUÁ GIỜ CUTOFF" và cảnh báo lịch giao sẽ dời sang ngày tiếp theo nếu chốt đơn.

---

### Requirement: REQ-05 Single & Batch PO Dispatch Confirmation Modal
Khi người dùng bấm "Chốt & Tạo PO" hoặc "Chốt nhanh hôm nay", hệ thống MUST hiển thị Modal xác nhận tóm tắt:
- Danh sách NCC nhận đơn
- Ngày giao hàng dự kiến
- Phương thức gửi (Email / Zalo / Hệ thống B2B)
- Tổng giá trị đơn hàng  
Sau khi người dùng bấm "Xác nhận & Phát hành PO", hệ thống MUST tạo mã Purchase Order độc lập (VD: `PO-20261014-SUP001`), cập nhật trạng thái thẻ NCC sang "Đã chốt / Đã phát hành PO" và hiển thị thông báo toast thành công.

#### Scenario: Xác nhận và phát hành PO độc lập
- **GIVEN** Đơn hàng của NCC Hương Quê đã đạt điều kiện MOV.
- **WHEN** Người dùng bấm nút "Chốt & Tạo PO", kiểm tra thông tin trên Modal và bấm "Xác nhận & Phát hành Purchase Order".
- **THEN** Hệ thống đóng modal, chuyển trạng thái thẻ NCC sang "Đã gửi PO" với badge màu xanh lá, hiển thị mã PO vừa sinh và hiện toast thành công.

---

## Acceptance checklist
- [ ] REQ-01: Top Urgency Bar hiển thị đầy đủ tổng quan số NCC, tổng tiền, deadline badges và nút Chốt nhanh.
- [ ] REQ-02: Bộ lọc Tab pills và ô tìm kiếm hoạt động realtime mượt mà.
- [ ] REQ-03: Thẻ NCC 2 tầng hiển thị đẹp mắt; Accordion mở rộng xem chi tiết và cho phép sửa inline số lượng, tự động cập nhật tổng tiền.
- [ ] REQ-04: Cảnh báo MOV và cảnh báo quá giờ cutoff hiển thị trực quan và chính xác.
- [ ] REQ-05: Modal xác nhận hiển thị đầy đủ thông tin tóm tắt và phát hành PO độc lập thành công.
- [ ] Giao diện tuân thủ `RULE_UI_DESIGN_SYSTEM.md`, build không lỗi.
