# Delta Specs: Đổi Trả Hàng, Phân Quyền Hủy Hóa Đơn & Ràng Buộc Pre-Order

## ADDED Requirements

### Requirement: REQ_POS_RET_01 Order Return and Exchange Processing
Hệ thống MUST cho phép thu ngân hoặc quản lý thực hiện nghiệp vụ Đổi / Trả hàng từ một hóa đơn đã hoàn thành (`Status = Completed`).
Hệ thống MUST tự động hoàn trả số lượng hàng khách trả lại vào `BranchStocks` của chi nhánh.
Nếu có hàng khách đổi mới, hệ thống MUST kiểm tra tồn kho và trừ tồn kho `BranchStocks` theo nguyên tắc FEFO.
Hệ thống MUST tự động tính bù trừ chênh lệch (Net Amount):
* Nếu Tổng tiền hàng mới > Tổng tiền hàng trả: Khách hàng MUST thanh toán thêm phần chênh lệch (CASH, VIETQR, DEBT).
* Nếu Tổng tiền hàng mới < Tổng tiền hàng trả: Cửa hàng MUST hoàn lại tiền thừa (tiền mặt) hoặc giảm trừ công nợ khách hàng (nếu khách có nợ).
Hóa đơn gốc MUST được giữ nguyên trạng thái `Completed`; hệ thống sinh ra chứng từ giao dịch mới có ghi chú tham chiếu đến mã hóa đơn gốc.

#### Scenario: Đổi hàng có giá trị cao hơn, khách thanh toán thêm phần chênh lệch
* **GIVEN** Hóa đơn `HD-001` đã hoàn thành chứa sản phẩm `SP-A` (đơn giá 100.000đ, số lượng 1)
* **WHEN** Thu ngân chọn trả 1 sản phẩm `SP-A` và chọn đổi sang sản phẩm `SP-B` (đơn giá 150.000đ, số lượng 1, tồn kho khả dụng $\ge 1$)
* **THEN** Hệ thống tính số tiền khách cần trả thêm là 50.000đ
* **AND** Sau khi xác nhận thanh toán, tồn kho `SP-A` tại chi nhánh tăng 1, tồn kho `SP-B` giảm 1
* **AND** Một đơn hàng mới được tạo ghi nhận thanh toán 50.000đ kèm ghi chú tham chiếu `HD-001`.

#### Scenario: Trả hàng và cấn trừ vào Sổ nợ của khách hàng
* **GIVEN** Khách hàng `Chị Lan` có số nợ hiện tại là 200.000đ và có hóa đơn mua hàng `HD-002` gồm `SP-C` (trị giá 80.000đ)
* **WHEN** Thu ngân chọn trả sản phẩm `SP-C` và chọn hình thức "Trừ vào sổ nợ"
* **THEN** Tồn kho `SP-C` tại chi nhánh tăng 1
* **AND** Số nợ của khách hàng `Chị Lan` giảm từ 200.000đ xuống còn 120.000đ
* **AND** Hệ thống không phát sinh dòng tiền mặt chi ra.

#### Scenario: Đổi hàng nhưng sản phẩm mới không đủ tồn kho tại chi nhánh
* **GIVEN** Hóa đơn `HD-003` có sản phẩm cần trả
* **WHEN** Thu ngân chọn đổi sang sản phẩm `SP-D` với số lượng 5, nhưng tồn kho khả dụng tại chi nhánh chỉ còn 2
* **THEN** Hệ thống MUST từ chối giao dịch và hiển thị thông báo lỗi "Sản phẩm SP-D không đủ tồn kho tại chi nhánh để đổi".

---

### Requirement: REQ_POS_SEC_02 Role-Based Order Cancellation Permission
Hệ thống MUST kiểm soát phân quyền khi thực hiện hủy hóa đơn đã thanh toán (`Status = Completed`).
Tài khoản mang vai trò Thu ngân (`CASHIER`) MUST NOT được phép tự ý hủy hóa đơn đã hoàn thành.
Chỉ tài khoản mang vai trò Chủ cửa hàng (`STORE_OWNER`), Quản lý (`MANAGER`), hoặc `ADMIN` MUST được phép thực hiện hủy hóa đơn đã hoàn thành và MUST nhập lý do hủy.

#### Scenario: Thu ngân cố gắng hủy hóa đơn đã thanh toán
* **GIVEN** Người dùng đang đăng nhập với vai trò `CASHIER`
* **WHEN** Người dùng cố gắng gọi API hủy hoặc bấm hủy trên hóa đơn có trạng thái `Completed`
* **THEN** Hệ thống MUST từ chối với mã lỗi `403 Forbidden` và thông báo "Thu ngân không có quyền hủy hóa đơn đã thanh toán. Vui lòng liên hệ Quản lý hoặc Chủ cửa hàng."
* **AND** Trạng thái hóa đơn và tồn kho không bị thay đổi.

#### Scenario: Chủ cửa hàng hủy hóa đơn đã thanh toán kèm lý do
* **GIVEN** Người dùng đang đăng nhập với vai trò `STORE_OWNER`
* **WHEN** Người dùng bấm hủy hóa đơn `HD-004` và nhập lý do "Khách hủy nhầm đơn tại quầy"
* **THEN** Hệ thống cập nhật trạng thái hóa đơn thành `Cancelled`
* **AND** Toàn bộ sản phẩm trong hóa đơn được hoàn trả lại tồn kho `BranchStocks`
* **AND** Nếu hóa đơn có ghi nợ, số nợ của khách hàng được hoàn tác giảm tương ứng.

---

## MODIFIED Requirements

### Requirement: REQ_POS_PRE_03 Pre-Order Minimum Deposit Validation
Khi tạo đơn đặt trước giữ kho (Pre-Order), số tiền đặt cọc (`DepositAmount`) MUST đạt tối thiểu $10\%$ của tổng giá trị thanh toán cuối cùng (`FinalAmount`).
Nếu `DepositAmount < 0.10 * FinalAmount`, hệ thống MUST từ chối tạo đơn và yêu cầu bổ sung tiền cọc.
Hệ thống MUST ghi nhận `BranchId` và hiển thị chi nhánh tiếp nhận đặt hàng làm chi nhánh nhận hàng mặc định.

#### Scenario: Tạo đơn đặt trước với số tiền cọc hợp lệ (>= 10%)
* **GIVEN** Đơn hàng đặt trước có tổng giá trị `FinalAmount = 1.000.000đ`
* **WHEN** Người dùng nhập số tiền đặt cọc là 150.000đ (15%) và các thông tin khách hàng, ngày hẹn
* **THEN** Hệ thống chấp nhận tạo đơn với mã `POxxxxxx`, trạng thái `PendingPickup`, và khóa tồn kho tương ứng theo FEFO tại chi nhánh tiếp nhận.

#### Scenario: Tạo đơn đặt trước với số tiền cọc không đủ (< 10%)
* **GIVEN** Đơn hàng đặt trước có tổng giá trị `FinalAmount = 1.000.000đ`
* **WHEN** Người dùng nhập số tiền đặt cọc là 50.000đ (5%)
* **THEN** Hệ thống MUST từ chối lưu và hiển thị thông báo lỗi "Tiền đặt cọc tối thiểu phải bằng 10% tổng giá trị đơn hàng (tối thiểu: 100.000 đ)".

---

## Acceptance Checklist
* [ ] Modal Đổi / Trả hàng hiển thị đầy đủ 3 khối: Hàng trả, Hàng đổi mới, Bù trừ chênh lệch.
* [ ] Đổi hàng bù trừ tự động cộng kho hàng trả và trừ kho hàng mới chính xác.
* [ ] Hóa đơn cũ giữ nguyên `Completed`; đơn đổi trả mới có liên kết tham chiếu rõ ràng.
* [ ] Thu ngân (`CASHIER`) bị chặn quyền hủy hóa đơn `Completed` cả ở UI và API Backend (403).
* [ ] Chủ cửa hàng (`STORE_OWNER`) hủy hóa đơn thành công kèm lý do, kho và nợ được hoàn tác.
* [ ] Đơn đặt trước bắt buộc cọc $\ge 10\%$, validate chặt chẽ ở cả Frontend và Backend.
