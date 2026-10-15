# Specs: grn-detail

## API / Contract (Mock State Data)
| Entity | Type | Fields |
|---|---|---|
| `GrnRemainingOption` | `'backorder' \| 'cancel'` | Hướng xử lý lượng thiếu: backorder (giao bù) hoặc cancel (hủy phần thiếu) |
| `GrnDetailItem` | `GrnItemDetail` | Kế thừa `GrnItemDetail` bổ sung `landedCostPerUnit`, `newUnitCost`, `retailPrice`, `marginPercent`, `remainingOption` |
| `GrnPostSettings` | `interface` | `createApInvoice: boolean`, `printShelfLabels: boolean`, `attachmentUrl?: string` |

## ADDED Requirements

### Requirement: REQ-01 Hiển thị Thông tin chung phiếu nhập và Tổng tiền tài chính
Hệ thống MUST hiển thị thẻ Thông tin chung bao gồm: Mã GRN, Tên chi nhánh, Tên & Mã Nhà cung cấp, Mã đơn PO gốc, Người kiểm đếm/duyệt phiếu, Trạng thái phiếu (`DRAFT` hoặc `CONFIRMED`), Tiền hàng, Phí vận chuyển (Landed Cost), Giảm giá NCC, Thuế VAT, và Tổng công nợ phải trả (AP) kèm điều khoản thanh toán.

#### Scenario: Hiển thị đúng thông tin của phiếu DRAFT chuẩn bị duyệt
- GIVEN người dùng mở phiếu `GRN-20260926-001` đang ở trạng thái `DRAFT`
- WHEN trang chi tiết tải xong
- THEN hệ thống hiển thị badge trạng thái `Draft ➔ CONFIRMED`
- AND hiển thị tổng công nợ AP = `Tiền hàng + Phí VC - Giảm giá + VAT`
- AND hiển thị rõ điều khoản công nợ (ví dụ `Credit 30 days`).

#### Scenario: Hiển thị đúng thông tin của phiếu đã hoàn tất CONFIRMED
- GIVEN người dùng mở một phiếu đã hoàn tất `CONFIRMED`
- WHEN trang chi tiết tải xong
- THEN hệ thống hiển thị badge trạng thái `CONFIRMED` màu xanh lục
- AND hiển thị tên người đã duyệt và thời điểm duyệt.

---

### Requirement: REQ-02 Bảng Tồn kho sẽ cộng & Quản lý lô hàng FEFO với Giá vốn mới và Margin %
Hệ thống MUST hiển thị bảng danh sách các mặt hàng sẽ được cộng vào tồn kho kèm thông tin quản lý lô FEFO: SKU, Tên sản phẩm, Mã Lô (Batch No), Hạn sử dụng (EXP Date), Số lượng thực nhận, Phí VC phân bổ trên mỗi ĐVT, Giá vốn mới (`Landed Unit Cost`), Giá bán lẻ niêm yết, Margin %, và Ghi chú giao nhận thực tế.

#### Scenario: Tự động phân bổ Phí VC và tính Giá vốn mới và Margin %
- GIVEN đơn nhập có tổng phí VC là 50,000 VNĐ và tổng số lượng nhận là 41.6 ĐVT (bình quân ~1,200 VNĐ/ĐVT)
- WHEN bảng sản phẩm được hiển thị
- THEN mỗi sản phẩm hiển thị Phí VC/ĐVT là `+1,200đ`
- AND hiển thị Giá vốn mới = `Giá mua gốc + 1,200đ`
- AND hiển thị Margin % = `(Giá bán - Giá vốn mới) / Giá bán * 100%` với màu xanh lá nổi bật nếu margin > 20%.

#### Scenario: Hiển thị badge đặc thù của sản phẩm
- GIVEN sản phẩm có tính chất cân ký (Catch-weight / Variable Weight) hoặc hàng tặng kèm (Free goods)
- WHEN sản phẩm được hiển thị trong bảng
- THEN hiển thị huy hiệu `⚖️ Catch-weight` hoặc `🎁 Hàng KM` tương ứng.

---

### Requirement: REQ-03 Bảng Cập nhật trạng thái đơn PO & Xử lý lượng thiếu
Hệ thống MUST hiển thị bảng so sánh giữa Số lượng đặt (Ordered) và Số lượng thực nhận (Received) của đơn PO gốc. Với các sản phẩm giao thiếu (`Received < Ordered`), hệ thống MUST cung cấp radio button để người dùng chọn:
- `backorder`: Nhà cung cấp sẽ giao bù trong đợt sau (PO tiếp tục mở).
- `cancel`: Hủy phần thiếu (Đóng dòng này).
Hệ thống MUST tự động suy ra và hiển thị Preview trạng thái đơn PO sau khi duyệt.

#### Scenario: Còn hàng thiếu và chọn NCC giao bù
- GIVEN sản phẩm Rau cải xanh đặt 30kg, nhận 28kg (thiếu 2kg)
- WHEN người dùng chọn radio `(•) NCC sẽ giao bù đợt sau`
- THEN dropdown Preview hiển thị trạng thái PO là `PARTIALLY_RECEIVED (Còn thiếu mặt hàng - PO tiếp tục mở)`.

#### Scenario: Tất cả mặt hàng thiếu đều chọn Hủy phần thiếu
- GIVEN tất cả các dòng giao thiếu đều được chọn `(•) Hủy phần thiếu (Đóng dòng)`
- WHEN các radio được chọn xong
- THEN dropdown Preview tự động chuyển sang `COMPLETED (Tất cả phần thiếu đã hủy - Đóng đơn PO)`.

---

### Requirement: REQ-04 Thiết lập sau khi hoàn tất & Chứng từ đính kèm
Hệ thống MUST cung cấp các tùy chọn thao tác tự động sau khi duyệt:
1. Checkbox "Tự động tạo Phiếu chi / Ghi nhận Sổ nợ AP" (Accounts Payable).
2. Checkbox "In tem giá / mã vạch dán kệ" với tổng số tem được tính tự động từ tổng số lượng sản phẩm nhập.
3. Khu vực hiển thị tệp đính kèm hóa đơn VAT hoặc biên bản giao nhận với thông tin tên file và dung lượng.

#### Scenario: Đếm số tem dán kệ tự động
- GIVEN phiếu nhập nhận tổng cộng 83 sản phẩm (28kg rau + 15 hộp thịt + 40 hộp sữa)
- WHEN người dùng xem tùy chọn in tem
- THEN checkbox hiển thị ghi chú `(Tự động tạo 83 tem tương ứng 83 sản phẩm nhập)`.

---

### Requirement: REQ-05 Hành động Hoàn tất & Duyệt nhập kho
Hệ thống MUST cung cấp các nút hành động chân trang:
- Với phiếu `DRAFT`: Nút "Quay lại sửa" (chuyển về form nhập liệu), nút "HOÀN TẤT & DUYỆT NHẬP KHO".
- Khi bấm "HOÀN TẤT & DUYỆT NHẬP KHO", hệ thống cập nhật trạng thái phiếu thành `CONFIRMED`, hiển thị hộp thông báo kết quả chi tiết kèm đường dẫn tới "Xem Quản lý Lô Hạn sử dụng" và "Quay về Danh sách Phiếu nhập (GRN List)".
- Với phiếu đã `CONFIRMED`: Nút "In phiếu nhập kho", "In tem mã vạch", và "Quay lại danh sách".

#### Scenario: Duyệt thành công phiếu DRAFT
- GIVEN người dùng bấm nút "HOÀN TẤT & DUYỆT NHẬP KHO"
- WHEN hệ thống xử lý xong
- THEN thông báo thành công hiển thị rõ: Tồn kho đã cộng, Lô FEFO đã lưu, Sổ nợ AP đã cập nhật, Lệnh in tem đã gửi, Trạng thái PO đã chốt.

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
- [ ] REQ-02: Bảng Tồn kho & Quản lý lô FEFO tính đúng Phí VC/ĐVT, Giá vốn mới và Margin %.
- [ ] REQ-03: Bảng Cập nhật trạng thái đơn PO có radio xử lý lượng thiếu và preview trạng thái PO (`PARTIALLY_RECEIVED` vs `COMPLETED`).
- [ ] REQ-04: Các tùy chọn tạo nợ AP, in tem dán kệ và xem file đính kèm hiển thị trực quan.
- [ ] REQ-05: Chức năng Hoàn tất duyệt nhập kho hoạt động trơn tru với banner kết quả chi tiết.
- [ ] REQ-06: Routing, phân quyền vai trò và liên kết từ `grn-list` hoạt động liền mạch.
