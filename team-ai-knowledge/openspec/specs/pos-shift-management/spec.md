# Spec: pos-shift-management

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-SHIFT-01 Mở Ca POS & Khép Kín Chuỗi Tiền Két
Hệ thống **MUST** cho phép thu ngân mở ca làm việc mới tại một quầy thu ngân (`TillId`) thuộc chi nhánh (`BranchId`). Mỗi quầy tại một thời điểm **MUST NOT** có nhiều hơn 1 ca ở trạng thái `Open`. Khi mở ca, hệ thống **MUST** tự động tìm ca đóng gần nhất của quầy (`PrevShiftId`), lấy số tiền để lại (`prevShift.RetainedFloatAmount`) làm `OpeningFloatExpected`, và tính chênh lệch mở ca `OpeningDiscrepancy = OpeningFloat - OpeningFloatExpected`.

#### Scenario: Mở ca đầu tiên của quầy (chưa có ca trước)
- **GIVEN** quầy #01 tại Chi nhánh Ba Đình chưa từng có ca làm việc nào
- **WHEN** thu ngân mở ca với số tiền đầu ca 1.500.000đ
- **THEN** hệ thống tạo bản ghi `ShiftZReport` với `OpeningFloat = 1500000`, `PrevShiftId = null`, `OpeningFloatExpected = 0`, `OpeningDiscrepancy = 1500000`, trạng thái `Open`

#### Scenario: Mở ca kế tiếp khép kín tiền két từ ca trước
- **GIVEN** ca sáng của quầy #01 đã đóng với số tiền để lại két `RetainedFloatAmount = 2.000.000đ`
- **WHEN** thu ngân ca chiều mở ca và nhập số tiền thực đếm trong két là 2.000.000đ
- **THEN** hệ thống thiết lập `OpeningFloatExpected = 2000000`, `OpeningFloat = 2000000`, `OpeningDiscrepancy = 0`, `PrevShiftId = ca_sang_id`

#### Scenario: Mở ca khi thực tế thiếu tiền so với ca trước bàn giao (Edge Case)
- **GIVEN** ca sáng để lại két `RetainedFloatAmount = 2.000.000đ`
- **WHEN** thu ngân ca chiều mở két đếm chỉ thấy 1.800.000đ và nhập số này
- **THEN** hệ thống ghi nhận `OpeningDiscrepancy = -200000` (âm 200k), cảnh báo giao diện và yêu cầu nhập ghi chú giải trình

#### Scenario: Từ chối mở ca khi quầy đang có ca mở chưa đóng
- **GIVEN** quầy #01 đang có một ca ở trạng thái `Open`
- **WHEN** thu ngân gửi yêu cầu mở ca mới tại quầy #01
- **THEN** hệ thống từ chối với HTTP 400 và thông báo "Quầy hiện đang có ca làm việc đang hoạt động, vui lòng chốt ca trước khi mở ca mới."

---

### Requirement: REQ-SHIFT-02 Lập Phiếu Thu / Chi Két Lẻ Trong Ca (ShiftCashMovement)
Hệ thống **MUST** cung cấp API và giao diện cho phép thu ngân ghi nhận các phiếu thu/chi tiền mặt phát sinh trong ca (`ShiftCashMovement`). Mỗi giao dịch **MUST** xác định loại `MovementType` (`IN` hoặc `OUT`), danh mục `Category` (`EXPENSE`, `CASH_DRAW`, `CASH_DEPOSIT`, `DEBT_COLLECT`), số tiền `Amount` (> 0), lý do `Reason`, và người tạo `CreatedBy`. Hệ thống **MUST** tự động cập nhật tổng `TotalCashIn` hoặc `TotalCashOut` tương ứng trên ca.

#### Scenario: Chi tiền mặt mua văn phòng phẩm lẻ (Chi vặt - OUT)
- **GIVEN** ca đang mở có số dư két
- **WHEN** thu ngân tạo phiếu chi 50.000đ với lý do "Mua giấy in bill POS", loại `OUT`, danh mục `EXPENSE`
- **THEN** hệ thống tạo 1 dòng `ShiftCashMovement`, tăng `TotalCashOut` của ca thêm 50.000đ

#### Scenario: Rút bớt tiền mặt trong két nộp chủ cửa hàng (Cash Drop - OUT)
- **GIVEN** tiền mặt trong két tích lũy nhiều (trên 10.000.000đ)
- **WHEN** thu ngân rút 5.000.000đ nộp chủ tiệm, tạo phiếu loại `OUT`, danh mục `CASH_DRAW`
- **THEN** hệ thống tạo phiếu `ShiftCashMovement`, tăng `TotalCashOut` thêm 5.000.000đ

#### Scenario: Nạp thêm tiền lẻ vào két đầu ngày (Cash Deposit - IN)
- **GIVEN** két thiếu tiền lẻ thối
- **WHEN** thu ngân đổi và nạp thêm 500.000đ tiền lẻ vào két, loại `IN`, danh mục `CASH_DEPOSIT`
- **THEN** hệ thống tạo phiếu `ShiftCashMovement`, tăng `TotalCashIn` thêm 500.000đ

---

### Requirement: REQ-SHIFT-03 Tự Động Gắn ShiftId Vào Đơn Hàng & Phân Tách Dòng Tiền
Hệ thống **MUST** tự động gán `ShiftId` của ca đang mở vào mọi hóa đơn bán lẻ `Order` được tạo tại quầy đó. Đơn hàng thanh toán tiền mặt (`PaymentMethod == 'CASH'`) **MUST** được tính vào doanh thu tiền mặt bán hàng của ca ($B$). Đơn hàng thanh toán qua ngân hàng / VietQR (`VIETQR`, `BANK_TRANSFER`) **MUST NOT** cộng vào két tiền mặt mà **MUST** được tổng hợp riêng vào `TotalBankRevenue`.

#### Scenario: Bán hàng thanh toán tiền mặt thành công
- **GIVEN** quầy có ca mở `ShiftId = shift_01`
- **WHEN** thu ngân hoàn tất đơn hàng trị giá 200.000đ bằng tiền mặt
- **THEN** đơn hàng được lưu với `Order.ShiftId = shift_01`, và khi chốt ca số tiền 200.000đ được tính vào tổng doanh thu tiền mặt $B$

#### Scenario: Bán hàng thanh toán VietQR thành công
- **GIVEN** quầy có ca mở `ShiftId = shift_01`
- **WHEN** khách thanh toán đơn hàng 350.000đ qua quét mã VietQR SePay
- **THEN** đơn hàng được lưu với `Order.ShiftId = shift_01`, và khi chốt ca số tiền 350.000đ được cộng vào `TotalBankRevenue`, không ảnh hưởng đến số dư két tiền mặt lý thuyết

---

### Requirement: REQ-SHIFT-04 Chốt Ca, Tự Động Tính Chênh Lệch & Phân Bổ Tiền Két
Hệ thống **MUST** cho phép thu ngân chốt ca làm việc bằng cách nhập số tiền mặt thực tế kiểm đếm trong két ($H$). Hệ thống **MUST** tính tiền lý thuyết theo công thức chuẩn:
$$G = \text{OpeningFloat (A)} + \text{CashSales (B)} + \text{TotalCashIn (C)} - \text{TotalCashOut (D)} - \text{CashRefund (E)}$$
Chênh lệch được tính: $\text{Discrepancy} = H - G$.
Thu ngân **MUST** phân bổ số tiền thực đếm $H$ thành 2 phần: Tiền để lại két cho ca sau (`RetainedFloatAmount`) và Tiền nộp két an toàn (`DroppedToSafeAmount`) sao cho:
$$\text{RetainedFloatAmount} + \text{DroppedToSafeAmount} = \text{ActualCashCounted (H)}$$
Nếu tổng không khớp, hệ thống **MUST** từ chối chốt ca.

#### Scenario: Chốt ca tiền khớp 100% (Không chênh lệch)
- **GIVEN** ca có $A = 1.000.000$, bán tiền mặt $B = 5.000.000$, nạp tiền $C = 200.000$, chi tiền $D = 100.000$. Tiền lý thuyết $G = 6.100.000đ$
- **WHEN** thu ngân đếm thực tế $H = 6.100.000đ$, phân bổ `RetainedFloatAmount = 1.500.000đ`, `DroppedToSafeAmount = 4.600.000đ`
- **THEN** hệ thống chốt ca thành công, lưu `Discrepancy = 0`, trạng thái ca chuyển sang `Closed`

#### Scenario: Chốt ca có chênh lệch tiền mặt (Dư tiền hoặc Thiếu tiền)
- **GIVEN** tiền lý thuyết $G = 6.100.000đ$
- **WHEN** thu ngân đếm thực tế $H = 6.050.000đ$ (thiếu 50.000đ), nhập ghi chú "Lệch tiền lẻ thối", phân bổ $1.500.000 + 4.550.000 = 6.050.000đ$
- **THEN** hệ thống lưu `Discrepancy = -50000`, đánh dấu biên bản Z-Report có chênh lệch để Chủ cửa hàng theo dõi

#### Scenario: Từ chối chốt ca khi phân bổ tiền không khớp với số đếm
- **GIVEN** thu ngân đếm thực tế $H = 5.000.000đ$
- **WHEN** thu ngân nhập `RetainedFloatAmount = 2.000.000đ` và `DroppedToSafeAmount = 2.500.000đ` (tổng = 4.500.000đ != 5.000.000đ)
- **THEN** hệ thống báo lỗi 400 "Tổng tiền để lại két và tiền nộp két an toàn phải bằng đúng số tiền thực đếm."

---

### Requirement: REQ-SHIFT-05 Bàn Giao Ca & Xác Nhận Bàn Giao
Khi chốt ca, thu ngân **MUST** chỉ định người nhận ca kế tiếp (`ReceiverUserId`). Trạng thái bàn giao ban đầu là `PENDING`. Khi thu ngân ca sau mở ca và kiểm đếm két, họ **MUST** có tùy chọn xác nhận bàn giao: `CONFIRMED` (nếu tiền khớp) hoặc `DISPUTED` (nếu có khiếu nại thiếu tiền kèm lý do).

#### Scenario: Người ca sau xác nhận nhận đủ tiền bàn giao
- **GIVEN** ca trước chốt để lại 1.500.000đ, bàn giao cho nhân viên Nam (`ReceiverUserId = usr_nam`)
- **WHEN** Nam mở ca và bấm "Xác nhận nhận đủ bàn giao"
- **THEN** ca trước được cập nhật `HandoverStatus = 'CONFIRMED'`

#### Scenario: Người ca sau khiếu nại thiếu tiền bàn giao
- **GIVEN** ca trước khai để lại 1.500.000đ
- **WHEN** Nam mở két chỉ thấy 1.200.000đ, bấm "Khiếu nại bàn giao", nhập lý do "Két thiếu 300k tờ 500k bị rách"
- **THEN** ca trước được cập nhật `HandoverStatus = 'DISPUTED'` và gửi thông báo cảnh báo đến Chủ cửa hàng

---

## Lịch sử
- 2026-11-06 · `pos-shift-handover-cash-management` · +5 ~0 -0
