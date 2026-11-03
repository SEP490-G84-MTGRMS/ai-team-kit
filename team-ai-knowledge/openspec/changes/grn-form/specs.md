# Specs: grn-form (Form Lập Phiếu Nhập Kho & Kiểm Đếm Hàng - GR-01 đến GR-09)

## API / Contract
| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| GET | `/api/v1/goods-receipts/po-lookup` | Query: `branchId` | `PurchaseOrderLookupDto[]` | 401, 403 |
| GET | `/api/v1/goods-receipts/po-details/{poId}` | Path: `poId` | `PoReceiptDetailsDto` | 404, 400 (PO đã có phiếu nhập) |
| POST | `/api/v1/goods-receipts` | Body: `CreateGoodsReceiptCommand` | `GoodsReceiptDto` | 400 (Validation: SL/Lô/Lý do), 409 |
| POST | `/api/v1/goods-receipts/{id}/complete` | Body: `CompleteGoodsReceiptCommand` | `GoodsReceiptDto` | 400, 409 (Đã hoàn tất / Đã hủy) |
| POST | `/api/v1/goods-receipts/{id}/cancel` | Body: `CancelGoodsReceiptCommand` | `GoodsReceiptDto` | 400 (Bắt buộc lý do), 409 (Không cho hủy COMPLETED) |

## ADDED Requirements

### Requirement: REQ-01 Auto PO Data Binding & Single Receipt Rule (GR-01, Mục 4)
Hệ thống MUST chỉ cho phép tạo phiếu nhập kho xuất phát từ một Purchase Order (PO) hợp lệ (trạng thái `SENT` hoặc `CONFIRMED`) thuộc chi nhánh đang thao tác.
- Hệ thống MUST ràng buộc: Một PO chỉ có tối đa một Goods Receipt chưa bị hủy (`DRAFT` hoặc `COMPLETED`). Tuyệt đối không cho phép tạo trùng nhiều phiếu nhập cho cùng một PO.
- Nếu mở form với query `?poCode=...`, hệ thống MUST tự động điền Chi nhánh, Nhà cung cấp và khởi tạo danh sách SKU đặt.

#### Scenario: Mở form với đơn PO hợp lệ
- GIVEN đơn PO `PO-20261009-001` đang ở trạng thái `CONFIRMED` và chưa có phiếu nhập nào
- WHEN người dùng bấm "Nhập kho ngay" hoặc chọn PO từ danh sách
- THEN hệ thống tải toàn bộ sản phẩm và số lượng đặt từ PO vào form.

#### Scenario: Chặn tạo trùng phiếu nhập cho PO đã có phiếu đang xử lý
- GIVEN đơn PO `PO-20261010-002` đã có phiếu nhập kho `GRN-20261010-001` ở trạng thái `DRAFT`
- WHEN người dùng cố gắng lập phiếu nhập kho mới cho PO này
- THEN hệ thống chặn và hiển thị lỗi: *"Đơn hàng PO này đã có phiếu nhập kho đang xử lý hoặc đã hoàn tất."*

---

### Requirement: REQ-02 4-Metric Quantity Verification & Excess Delivery Prevention (GR-03, GR-04, Mục 6, 7.2)
Hệ thống MUST kiểm soát 4 chỉ số số lượng trên từng dòng sản phẩm:
1. `OrderedQty`: Số lượng đã đặt trên PO.
2. `ReceivedQty`: Số lượng thực tế nhà cung cấp giao.
3. `AcceptedQty`: Số lượng chấp nhận nhập kho.
4. `RejectedQty`: Số lượng bị từ chối (`RejectedQty = ReceivedQty - AcceptedQty`).

**Ràng buộc nghiêm ngặt:**
- `0 <= AcceptedQty <= ReceivedQty <= OrderedQty`.
- **Giao thừa (`ReceivedQty > OrderedQty`)**: Hệ thống KHÔNG cho phép nhập vượt PO vào tồn kho. `AcceptedQty` tối đa chỉ bằng `OrderedQty`. Phần vượt được ghi nhận cảnh báo ngoại lệ riêng để xử lý với NCC ngoài kho.
- **Giao thiếu (`ReceivedQty < OrderedQty`)**: `ShortageQty = OrderedQty - ReceivedQty`. Không tạo backorder trên đơn PO cũ; PO sẽ đóng khi hoàn tất phiếu nhập, phần thiếu được tính vào chu kỳ đặt tiếp theo.

#### Scenario: Nhận hàng đủ 100%
- GIVEN dòng hàng có `OrderedQty = 20`, đơn giá `185.000 đ`
- WHEN người dùng nhập `ReceivedQty = 20` và `AcceptedQty = 20`
- THEN `RejectedQty = 0`, `DifferenceQty = 0`, thành tiền dòng là `3.700.000 đ`.

#### Scenario: Giao thừa hàng so với đơn PO
- GIVEN dòng hàng có `OrderedQty = 50`
- WHEN NCC giao thực tế `ReceivedQty = 55`
- THEN hệ thống giới hạn `AcceptedQty` tối đa bằng `50` (chỉ cộng 50 vào tồn kho)
- AND hiển thị cảnh báo: *"NCC giao thừa 5 ĐVT — Không cho phép nhập vượt PO vào kho"*.

---

### Requirement: REQ-03 Mandatory Rejection Reason & Non-Inventory of Defects (GR-05, Mục 7.4)
Khi phát sinh hàng bị từ chối (`RejectedQty > 0`):
- Hệ thống MUST bắt buộc người dùng chọn Lý do từ chối từ danh mục:
  - `DAMAGE`: Hàng hư hỏng / móp méo
  - `EXPIRED`: Hàng hết hạn sử dụng
  - `NEAR_EXPIRY`: Hàng cận hạn không đạt yêu cầu
  - `WRONG_SPEC`: Sai quy cách đóng gói
  - `WRONG_ITEM`: Giao sai sản phẩm
  - `QUALITY_ISSUE`: Không đạt chất lượng
  - `OTHER`: Lý do khác (Bắt buộc nhập ghi chú chi tiết).
- Hàng bị từ chối TUYỆT ĐỐI KHÔNG được cộng vào tồn kho khả dụng của chi nhánh.

#### Scenario: Từ chối hàng bị vỡ hỏng
- GIVEN nhận 100 chai sữa, trong đó 5 chai bị vỡ hỏng nắp
- WHEN người dùng nhập `AcceptedQty = 95`, `RejectedQty = 5` và chọn lý do `DAMAGE`
- THEN hệ thống ghi nhận biên bản từ chối 5 chai lý do `DAMAGE` và chỉ nhập 95 chai vào tồn kho.

---

### Requirement: REQ-04 FEFO Batch Code & Expiry Dates with Multi-Batch Support (GR-06, Mục 5 Bước 4, Mục 7.7)
- Đối với sản phẩm được cấu hình quản lý HSD (`HasBatches = true`), hệ thống MUST bắt buộc nhập Mã Lô (`batchCode`) và Hạn sử dụng (`expiryDate`).
- Cho phép một sản phẩm có **nhiều lô khác nhau** trong cùng một phiếu nhập; tổng số lượng các lô phải bằng `AcceptedQty` của sản phẩm đó.
- Hạn sử dụng không được trước ngày nhập hàng (`expiryDate >= receivedDate`).
- Hệ thống MUST tự động hiển thị huy hiệu cảnh báo màu vàng-cam `⚠️ Cận HSD (<30 ngày)` nếu khoảng cách tới HSD nhỏ hơn hoặc bằng 30 ngày.

#### Scenario: Nhập nhiều lô trên cùng 1 SKU
- GIVEN nhà cung cấp giao 100 hộp sữa gồm 2 lô: LOT-A (HSD: 05/11/2026, 60 hộp) và LOT-B (HSD: 20/11/2026, 40 nhận, 35 chấp nhận, 5 hư hỏng)
- WHEN người dùng khai báo thông tin 2 lô tương ứng
- THEN hệ thống ghi nhận đúng tồn kho tăng 60 cho LOT-A và 35 cho LOT-B (tổng tăng 95 vào kho).

---

### Requirement: REQ-05 Landed Cost & Financial Summary Aggregation
Hệ thống MUST tính toán tự động toàn bộ chi phí tài chính của phiếu nhập kho theo công thức:
`Grand Total = (Tổng tiền hàng theo AcceptedQty - Chiết khấu + Landed Cost) + VAT`.
Landed cost và chiết khấu được phân bổ tỷ lệ theo giá trị vào từng dòng để tính ra `LandedUnitCost` (Giá vốn mới).

---

### Requirement: REQ-06 Barcode Scanning (GR-02)
Khi người dùng quét barcode hoặc gõ SKU và nhấn Enter:
- Hệ thống tự động tìm dòng sản phẩm trong PO và tăng `ReceivedQty` cùng `AcceptedQty` thêm 1 đơn vị (tối đa bằng `OrderedQty`).
- Nếu mã vạch không thuộc PO, hiển thị cảnh báo không tìm thấy sản phẩm trong đơn.

---

### Requirement: REQ-07 Receipt Lifecycle & Idempotent Completion (GR-07, GR-08, GR-09, Mục 8, 10, 11)
- **Lưu nháp (`DRAFT`)**: Lưu trạng thái `DRAFT`, không tác động đến tồn kho.
- **Hoàn tất (`COMPLETED`)**:
  - Xác thực toàn bộ điều kiện số lượng và lô hạn.
  - Cộng `AcceptedQty` vào tồn kho chi nhánh `BranchStocks` theo từng lô.
  - Chuyển trạng thái đơn PO sang `COMPLETED` (không backorder).
  - Đảm bảo tính Idempotency: Phiếu đã `COMPLETED` không được hoàn tất lặp lại hoặc cộng tồn kho 2 lần.
- **Hủy phiếu (`CANCELLED`)**:
  - Chỉ cho phép hủy phiếu ở trạng thái `DRAFT` (bắt buộc nhập lý do hủy).
  - Không cho phép hủy phiếu đã `COMPLETED`.
  - Khi hủy phiếu, giải phóng đơn PO để có thể tạo lại phiếu nhập khác.

## Acceptance Checklist
- [ ] REQ-01: Kiểm tra PO hợp lệ, chặn tạo trùng phiếu nhập đang xử lý cho cùng PO.
- [ ] REQ-02: Kiểm đếm 4 chỉ số `OrderedQty`, `ReceivedQty`, `AcceptedQty`, `RejectedQty`; chặn nhập kho vượt PO khi giao thừa.
- [ ] REQ-03: Bắt buộc chọn lý do từ chối khi có hàng lỗi; không cộng hàng lỗi vào tồn kho.
- [ ] REQ-04: Bắt buộc mã lô và HSD với SP quản lý HSD; cảnh báo cận date < 30 ngày; HSD >= ngày nhập.
- [ ] REQ-05: Tính toán chi phí Landed Cost, phân bổ giá vốn mới và Grand Total chính xác.
- [ ] REQ-06: Quét barcode tăng số lượng và phản hồi tức thì.
- [ ] REQ-07: Luồng trạng thái `DRAFT` -> `COMPLETED` hoặc `CANCELLED`, đảm bảo cập nhật tồn kho chính xác và giải phóng PO khi hủy.
