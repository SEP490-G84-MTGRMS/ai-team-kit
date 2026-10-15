# Specs: grn-form

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| GET | `/api/goods-receipts/po-lookup?status=CONFIRMED` | Query: `status`, `branchId` | `PurchaseOrderLookupDto[]` | 401, 403 |
| GET | `/api/purchase-orders/{poId}/receipt-details` | Path: `poId` | `PoReceiptDetailsDto` | 404, 400 |
| POST | `/api/goods-receipts` | Body: `CreateGrnCommand` | `GoodsReceiptDetailDto` | 400 (Validation), 409 |
| PUT | `/api/goods-receipts/{id}/draft` | Body: `UpdateGrnDraftCommand` | `GoodsReceiptDetailDto` | 400, 404 |
| POST | `/api/goods-receipts/{id}/confirm` | Body: `ConfirmGrnCommand` | `GoodsReceiptDetailDto` | 400, 409 (Locked) |

## ADDED Requirements

### Requirement: REQ-01 Auto PO Data Binding & Header Configuration
Hệ thống MUST cho phép người dùng mở form tạo phiếu nhập kho với mã PO nguồn (qua query param `?poCode=...` hoặc chọn từ dropdown danh sách đơn PO đã chốt). Khi chọn PO, hệ thống MUST tự động điền Chi nhánh nhận, Nhà cung cấp (mã + tên), và khởi tạo danh sách các mặt hàng đã đặt.

#### Scenario: Mở form từ phiếu hẹn giao hàng hôm nay
- GIVEN người dùng ở màn hình GRN List thấy phiếu `PO-20261009-001` trạng thái `TODAY`
- WHEN người dùng bấm "Nhập kho ngay"
- THEN hệ thống chuyển sang `/store-owner/goods-receipts/create?poCode=PO-20261009-001`
- AND tự động điền Chi nhánh: `BR-01 (CH Nguyễn Trãi)`, Nhà cung cấp: `TươiSạch (SUP-001)`, danh sách mặt hàng đúng 5 SKU đã đặt.

#### Scenario: Chọn PO thủ công từ dropdown
- GIVEN người dùng mở form tạo mới chưa chọn PO
- WHEN người dùng chọn `PO-20261010-002` từ danh sách PO đã chốt
- THEN bảng hàng hóa được nạp đúng 4 sản phẩm bánh kẹo từ đơn PO này.

---

### Requirement: REQ-02 Quantity Discrepancy & Line Total Calculation
Hệ thống MUST tự động tính toán chênh lệch số lượng `differenceQty = receivedQty - orderedQty` và thành tiền từng dòng `lineTotal = receivedQty * unitPrice` ngay khi người dùng thay đổi số lượng thực nhận.

#### Scenario: Nhận đủ 100% số lượng
- GIVEN dòng hàng có `orderedQty = 20`, `unitPrice = 185.000`
- WHEN người dùng nhập `receivedQty = 20`
- THEN `differenceQty` hiển thị `0` (không có cảnh báo lệch)
- AND `lineTotal` hiển thị `3.700.000 VNĐ`.

#### Scenario: Nhận thiếu hàng so với PO
- GIVEN dòng hàng có `orderedQty = 20`, `unitPrice = 185.000`
- WHEN người dùng nhập `receivedQty = 15`
- THEN `differenceQty` hiển thị `-5` với màu đỏ cảnh báo thiếu hàng
- AND `lineTotal` tính lại là `2.775.000 VNĐ`.

---

### Requirement: REQ-03 FEFO Batch Code & Expiry Date Management
Hệ thống MUST yêu cầu nhập Mã Lô hàng (Batch Code) và Hạn sử dụng (EXP Date) cho từng mặt hàng nhập kho. Hệ thống MUST tự động so sánh HSD với ngày nhập kho hiện tại; nếu khoảng cách nhỏ hơn 30 ngày, hệ thống MUST hiển thị huy hiệu cảnh báo `⚠️ Sát HSD (<30 ngày)`.

#### Scenario: Nhập hạn sử dụng an toàn dài hạn
- GIVEN ngày nhập là `09/10/2026`
- WHEN người dùng chọn HSD là `2027-10-15` (còn >1 năm)
- THEN hệ thống ghi nhận HSD hợp lệ và không hiển thị cảnh báo cận date.

#### Scenario: Nhập hạn sử dụng cận date dưới 30 ngày
- GIVEN ngày nhập là `09/10/2026`
- WHEN người dùng chọn HSD là `2026-10-25` (chỉ còn 16 ngày)
- THEN hệ thống lập tức hiển thị huy hiệu màu cam viền vàng `⚠️ Sát HSD (<30 ngày)`.

---

### Requirement: REQ-04 Landed Cost & Financial Summary Aggregation
Hệ thống MUST tính toán tự động toàn bộ chi phí tài chính của phiếu nhập kho theo công thức:
`Grand Total = (Tổng tiền hàng - Chiết khấu + Landed Cost) + VAT`.

#### Scenario: Tính tổng tiền có chi phí vận chuyển Landed Cost
- GIVEN tổng tiền hàng là `1.034.000 VNĐ`, chiết khấu `0 VNĐ`, thuế VAT `0%`
- WHEN người dùng nhập chi phí vận chuyển Landed Cost là `30.000 VNĐ`
- THEN Tổng giá trị phiếu nhập hiển thị đúng `1.064.000 VNĐ`.

#### Scenario: Áp dụng thuế VAT và chiết khấu
- GIVEN tiền hàng sau chiết khấu và vận chuyển là `1.000.000 VNĐ`
- WHEN người dùng chọn mức thuế VAT `10%`
- THEN tiền thuế tính được là `100.000 VNĐ` và Grand Total là `1.100.000 VNĐ`.

---

### Requirement: REQ-05 Receipt Lifecycle & Confirmation Workflows
Hệ thống MUST hỗ trợ 3 hành động chính:
1. **Lưu nháp (Draft)**: Lưu phiếu ở trạng thái `DRAFT` không tăng tồn kho.
2. **Hoàn tất nhập kho (Confirmed)**: Kiểm tra validation (bắt buộc nhập mã lô, HSD và số lượng > 0). Nếu có chênh lệch hàng, hiển thị modal xác nhận lập biên bản và chuyển sang trạng thái `MISMATCH`. Nếu đủ hàng, chuyển sang trạng thái `CONFIRMED`.
3. **Nhập kho & In tem**: Sau khi hoàn tất thành công, hiển thị modal xem trước tem nhãn mã vạch để in dán lên thùng/lô hàng.

#### Scenario: Bấm hoàn tất khi có chênh lệch hàng
- GIVEN phiếu nhập có ít nhất 1 dòng bị thiếu hàng (`differenceQty < 0`)
- WHEN người dùng bấm "Hoàn tất nhập kho"
- THEN hệ thống hiển thị dialog cảnh báo: *"Phát hiện chênh lệch so với đơn PO. Bạn có muốn lập biên bản đối soát và lưu trạng thái Lệch hàng (Mismatch)?"*
- AND khi xác nhận, phiếu được lưu với trạng thái `MISMATCH`.

---

### Requirement: REQ-06 Barcode Scanning & Item Quick Search
Hệ thống MUST cung cấp thanh nhập Barcode / SKU. Khi người dùng quét mã vạch hoặc nhập mã SKU và nhấn phím Enter:
- Nếu sản phẩm đã có trong danh sách: Hệ thống tự động cuộn (scroll) tới dòng đó và tăng số lượng thực nhận lên 1.
- Nếu sản phẩm chưa có trong đơn PO: Hệ thống hiển thị thông báo sản phẩm ngoài đơn PO và cho phép thêm dòng bổ sung nếu được phép.

#### Scenario: Quét barcode tăng số lượng
- GIVEN sản phẩm `SKU-00102` đang có `receivedQty = 10`
- WHEN người dùng quét mã vạch `SKU-00102` vào ô tìm kiếm và ấn Enter
- THEN số lượng thực nhận của `SKU-00102` tự động tăng lên `11`
- AND tổng tiền được tính toán lại ngay lập tức.

## Acceptance Checklist
- [ ] REQ-01: Mở form với `poCode` tải đúng thông tin chi nhánh, NCC và các mặt hàng đã đặt.
- [ ] REQ-02: Nhập số lượng thực nhận tự động cập nhật chênh lệch `differenceQty` và thành tiền từng dòng.
- [ ] REQ-03: Nhập HSD < 30 ngày lập tức hiện cờ cảnh báo `Sát HSD (<30 ngày)`.
- [ ] REQ-04: Nhập Landed Cost, chiết khấu và VAT cập nhật Grand Total chính xác theo thời gian thực.
- [ ] REQ-05: Lưu nháp (`DRAFT`), Hoàn tất (`CONFIRMED` / `MISMATCH`) hoạt động mượt mà, có modal xác nhận khi lệch hàng.
- [ ] REQ-06: Ô quét barcode hỗ trợ Enter tăng số lượng hoặc định vị nhanh dòng sản phẩm.
