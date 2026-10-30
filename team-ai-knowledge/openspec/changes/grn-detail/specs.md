# Specs: grn-detail

## API / Contract (Backend Integration & Detail View)
| Method | Path | Request Body | Response | Ghi chú nghiệp vụ V1 |
|---|---|---|---|---|
| `GET` | `/api/v1/goods-receipts/{id}` | - | `GoodsReceiptDetailDto` | Lấy chi tiết phiếu nhập gồm 4 chỉ số số lượng, Lô & HSD, và thông tin PO gốc |
| `POST` | `/api/v1/goods-receipts/{id}/complete` | `{ landedCost?, discountAmount?, vatRate?, notes? }` | `GoodsReceiptDto` | Hoàn tất nhập kho: Tăng tồn kho theo `AcceptedQty`, chuyển PO sang `COMPLETED` |
| `POST` | `/api/v1/goods-receipts/{id}/cancel` | `{ reason: string }` | `GoodsReceiptDto` | Hủy phiếu DRAFT: Bắt buộc có lý do, chuyển trạng thái `CANCELLED`, giải phóng đơn PO |

## ADDED Requirements

### Requirement: REQ-01 Hiển thị Thông tin chung phiếu nhập và Tổng tiền tài chính
Hệ thống MUST hiển thị thẻ Thông tin chung bao gồm: Mã GRN, Tên & Mã chi nhánh, Tên & Mã Nhà cung cấp, Mã đơn PO gốc, Người kiểm đếm/lập phiếu, Trạng thái phiếu (`DRAFT`, `COMPLETED`, `CANCELLED`), Tiền hàng, Phí vận chuyển (Landed Cost), Giảm giá NCC, Thuế VAT, và Tổng công nợ phải trả (AP) kèm điều khoản thanh toán.

#### Scenario: Hiển thị đúng thông tin của phiếu DRAFT chuẩn bị hoàn tất
- GIVEN người dùng mở phiếu `GRN-20260926-001` đang ở trạng thái `DRAFT`
- WHEN trang chi tiết tải xong
- THEN hệ thống hiển thị badge trạng thái `DRAFT ➔ COMPLETED`
- AND hiển thị tổng công nợ AP = `Tiền hàng + Phí VC - Giảm giá + VAT`
- AND hiển thị rõ điều khoản công nợ (ví dụ `Credit 30 days`).

#### Scenario: Hiển thị đúng thông tin của phiếu đã hoàn tất COMPLETED
- GIVEN người dùng mở một phiếu đã hoàn tất `COMPLETED`
- WHEN trang chi tiết tải xong
- THEN hệ thống hiển thị badge trạng thái `COMPLETED` màu xanh lục
- AND hiển thị tên người đã duyệt và thời điểm duyệt hoàn tất.

---

### Requirement: REQ-02 Bảng Tồn kho sẽ cộng theo AcceptedQty & Quản lý lô hàng FEFO
Hệ thống MUST hiển thị bảng danh sách các mặt hàng được chấp nhận nhập kho (`AcceptedQty`):
- Thông tin sản phẩm: SKU, Tên sản phẩm, ĐVT, Mã Lô (Batch No), Hạn sử dụng (EXP Date).
- Số lượng: Hiển thị rõ `AcceptedQty` (chỉ số lượng này mới được cộng vào tồn kho `BranchStocks`). Hàng bị từ chối (`RejectedQty`) và giao thừa tuyệt đối không được cộng vào tồn kho.
- Tài chính & Giá vốn: Phí VC phân bổ trên mỗi ĐVT, Giá vốn mới (`Landed Unit Cost`), Giá bán lẻ niêm yết, Margin %, và Ghi chú giao nhận thực tế.

#### Scenario: Tự động phân bổ Phí VC và tính Giá vốn mới và Margin %
- GIVEN đơn nhập có tổng phí VC là 50,000 VNĐ và tổng số lượng chấp nhận là 41.6 ĐVT (bình quân ~1,200 VNĐ/ĐVT)
- WHEN bảng sản phẩm được hiển thị
- THEN mỗi sản phẩm hiển thị Phí VC/ĐVT là `+1,200đ`
- AND hiển thị Giá vốn mới = `Giá mua gốc + 1,200đ`
- AND hiển thị Margin % = `(Giá bán - Giá vốn mới) / Giá bán * 100%` với màu xanh lá nổi bật nếu margin > 20%.

#### Scenario: Hiển thị badge đặc thù của sản phẩm
- GIVEN sản phẩm có tính chất cân ký (Catch-weight / Variable Weight) hoặc hàng tặng kèm (Free goods)
- WHEN sản phẩm được hiển thị trong bảng
- THEN hiển thị huy hiệu `⚖️ Catch-weight` hoặc `🎁 Hàng KM` tương ứng.

---

### Requirement: REQ-03 Bảng Đối soát 4 chỉ số số lượng & Tự động đóng PO sang COMPLETED
Hệ thống MUST hiển thị bảng so sánh đối soát 4 chỉ số số lượng giữa Đơn PO gốc và Phiếu nhập kho:
- Số lượng đặt theo PO (`OrderedQty`).
- Số lượng thực nhận tại kho (`ReceivedQty`).
- Số lượng đạt chuẩn chấp nhận nhập kho (`AcceptedQty`).
- Số lượng từ chối / hàng lỗi (`RejectedQty`) kèm lý do từ chối.
- Chênh lệch thiếu (`Shortage = OrderedQty - ReceivedQty`).

**Quy tắc nghiệp vụ V1**:
- Khi Goods Receipt hoàn tất, đơn PO gốc được chuyển thẳng sang trạng thái `COMPLETED`.
- Hệ thống V1 không sử dụng trạng thái `PARTIALLY_RECEIVED` trên PO cũ và không sinh tự động đơn hàng bù (Backorder PO). Lượng thiếu được ghi nhận trên chứng từ đối soát; nhu cầu còn lại sẽ được lập thành đơn hàng mới trong chu kỳ đặt tiếp theo.

#### Scenario: Đơn PO có mặt hàng giao thiếu
- GIVEN sản phẩm Rau cải xanh đặt 30kg, thực nhận 28kg (thiếu 2kg)
- WHEN xem bảng đối soát PO
- THEN hệ thống hiển thị rõ: Đặt 30kg, Nhận 28kg, Chấp nhận 28kg, Thiếu 2kg
- AND hiển thị thông báo trạng thái: `Đơn PO sẽ đóng thành COMPLETED khi hoàn tất phiếu nhập (V1 ghi nhận lượng thiếu để đối soát công nợ, không tạo backorder)`.

---

### Requirement: REQ-04 Thiết lập sau khi hoàn tất & Chứng từ đính kèm
Hệ thống MUST cung cấp các tùy chọn thao tác tự động sau khi duyệt:
1. Checkbox "Tự động tạo Phiếu chi / Ghi nhận Sổ nợ AP" (Accounts Payable).
2. Checkbox "In tem giá / mã vạch dán kệ" với tổng số tem được tính tự động từ tổng số lượng sản phẩm nhập.
3. Khu vực hiển thị tệp đính kèm hóa đơn VAT hoặc biên bản giao nhận với thông tin tên file và dung lượng.

#### Scenario: Đếm số tem dán kệ tự động
- GIVEN phiếu nhập chấp nhận tổng cộng 83 sản phẩm (28kg rau + 15 hộp thịt + 40 hộp sữa)
- WHEN người dùng xem tùy chọn in tem
- THEN checkbox hiển thị ghi chú `(Tự động tạo 83 tem tương ứng 83 sản phẩm nhập)`.

---

### Requirement: REQ-05 Hành động Hoàn tất nhập kho & Hủy phiếu DRAFT
Hệ thống MUST cung cấp các nút hành động chân trang:
- Với phiếu `DRAFT`:
  - Nút "Quay lại sửa": Chuyển về form nhập liệu `/goods-receipts/create?id=...`.
  - Nút "HỦY PHIẾU DRAFT": Mở modal yêu cầu nhập lý do hủy. Khi xác nhận hủy, gọi `POST /api/v1/goods-receipts/{id}/cancel`, chuyển trạng thái phiếu sang `CANCELLED` và giải phóng đơn PO để có thể lập phiếu nhập lại.
  - Nút "HOÀN TẤT NHẬP KHO": Gọi `POST /api/v1/goods-receipts/{id}/complete`. Hệ thống cập nhật trạng thái phiếu thành `COMPLETED`, tăng tồn kho `BranchStocks` theo `AcceptedQty`, chốt đơn PO sang `COMPLETED`, hiển thị hộp thông báo kết quả chi tiết.
- Với phiếu đã `COMPLETED`: Nút "In phiếu nhập kho", "In tem mã vạch", và "Quay lại danh sách".
- Với phiếu `CANCELLED`: Hiển thị lý do hủy và vô hiệu hóa mọi thao tác chỉnh sửa.

#### Scenario: Hoàn tất thành công phiếu DRAFT
- GIVEN người dùng bấm nút "HOÀN TẤT NHẬP KHO" trên phiếu DRAFT
- WHEN hệ thống xử lý API thành công
- THEN thông báo thành công hiển thị rõ: Tồn kho đã cộng (chỉ theo AcceptedQty), Lô FEFO đã lưu, Đơn PO đã đóng thành COMPLETED.

#### Scenario: Hủy phiếu DRAFT hợp lệ
- GIVEN người dùng bấm "Hủy phiếu" trên phiếu DRAFT và nhập lý do "Xe hàng bị tai nạn không thể giao"
- WHEN bấm xác nhận hủy
- THEN hệ thống cập nhật phiếu thành `CANCELLED`, giải phóng đơn PO và hiển thị toast thông báo thành công.

---

### Requirement: REQ-06 Định tuyến & Phân quyền vai trò (Store Owner vs Employee)
Hệ thống MUST hỗ trợ:
- Đường dẫn `/store-owner/goods-receipts/:id` cho Chủ cửa hàng (xem mọi chi nhánh).
- Đường dẫn `/employee/goods-receipts/:id` cho Nhân viên (chỉ xem chi nhánh được phân công).
- Nút chuyển đổi vai trò (Role Switcher) ở góc trên để kiểm thử nhanh phân quyền.
- Liên kết điều hướng thông suốt từ `GoodsReceiptListPage`: click vào mã GRN hoặc icon xem chi tiết sẽ chuyển tới trang `GoodsReceiptDetailPage`.

---

## Acceptance checklist
- [ ] REQ-01: Hiển thị đầy đủ Thông tin chung phiếu nhập, chi nhánh, NCC, PO, và Tổng công nợ AP.
- [ ] REQ-02: Bảng Tồn kho & Quản lý lô FEFO chỉ cộng tồn kho theo `AcceptedQty`, tính đúng Phí VC/ĐVT, Giá vốn mới và Margin %.
- [ ] REQ-03: Bảng Đối soát 4 chỉ số số lượng (Ordered, Received, Accepted, Rejected) và tự động đóng đơn PO thành COMPLETED (không backorder).
- [ ] REQ-04: Các tùy chọn tạo nợ AP, in tem dán kệ và xem file đính kèm hiển thị trực quan.
- [ ] REQ-05: Chức năng Hoàn tất nhập kho (`COMPLETED`) và Hủy phiếu DRAFT (`CANCELLED` giải phóng PO) hoạt động trơn tru với backend API.
- [ ] REQ-06: Routing, phân quyền vai trò và liên kết từ `grn-list` hoạt động liền mạch.

