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

### Requirement: REQ-POS-ROLE-01 Phân quyền giao diện POS giữa Chủ cửa hàng và Nhân viên
Hệ thống MUST phân biệt rõ giao diện và trải nghiệm quầy POS dựa trên vai trò người dùng (`useAuthStore().user?.role`):
- Nếu người dùng có vai trò `STORE_OWNER` hoặc `ADMIN`: Hệ thống MUST KHÔNG hiển thị modal bắt buộc mở ca (`OpenShiftModal`), ẩn các nút thao tác ca (Chốt ca, Thu/chi két) trên Header POS; đồng thời MUST hiển thị icon Chuông thông báo "Duyệt chi két" kèm Badge số lượng yêu cầu `PendingApproval`.
- Nếu người dùng có vai trò `CASHIER` hoặc `EMPLOYEE`: Hệ thống MUST kiểm tra trạng thái ca khi truy cập màn hình POS; nếu chưa có ca mở thì MUST chặn màn hình và hiển thị modal `OpenShiftModal`; trên Header POS hiển thị thông tin ca, nút "Thu/Chi Két" và menu chốt ca.

#### Scenario: Chủ cửa hàng truy cập POS bán hàng
GIVEN Người dùng đăng nhập với role `STORE_OWNER`
WHEN Truy cập trang `/pos` hoặc `/employee/pos`
THEN Không có modal mở ca nào hiển thị
AND Header POS hiển thị icon Chuông phê duyệt chi két với số lượng yêu cầu chờ duyệt
AND Các nút "Mở ca", "Thu/Chi Két", "Chốt ca" được ẩn khỏi Header

#### Scenario: Thu ngân truy cập POS khi chưa mở ca
GIVEN Người dùng đăng nhập với role `CASHIER`
AND Chi nhánh hiện tại chưa có ca nào đang mở cho quầy thu ngân
WHEN Truy cập trang `/pos`
THEN Modal `OpenShiftModal` bắt buộc mở ca hiển thị chặn màn hình bán hàng
AND Nút bắt đầu ca yêu cầu nhập số tiền đầu ca thực tế

---

### Requirement: REQ-POS-SHIFT-02 Kế thừa số tiền đầu ca từ ca liền trước
Khi mở ca mới, hệ thống MUST tự động truy vấn số tiền tồn két thực tế để lại từ ca trước $A_{expected}$ (`OpeningFloatExpected`) để hiển thị cho nhân viên. Nhân viên MUST đếm và nhập số tiền thực tế $A$ (`OpeningFloat`). Hệ thống SHALL tự động tính chênh lệch đầu ca $\Delta_{open} = A - A_{expected}$.

#### Scenario: Mở ca kế thừa tiền từ ca trước
GIVEN Ca liền trước chốt với số tiền để lại két `RetainedFloatAmount = 1,500,000 VND`
WHEN Nhân viên mở modal `OpenShiftModal`
THEN Hệ thống hiển thị `OpeningFloatExpected = 1,500,000 VND`
AND Khi nhân viên nhập `OpeningFloat = 1,500,000 VND`, chênh lệch đầu ca hiển thị `0 VND`
AND Nhân viên bấm "Bắt đầu ca bán hàng", hệ thống gọi API `POST /api/pos/shifts/open` thành công

---

### Requirement: REQ-POS-CASH-03 Kiểm tra hạn mức chi tiền két và luồng duyệt chi
Khi nhân viên lập phiếu xuất tiền (`CashOut` / `PettyExpense`):
- Nếu số tiền $\le$ hạn mức `CashOutApprovalThreshold` (mặc định 200,000 VND hoặc theo cấu hình chi nhánh): Hệ thống MUST tự động ghi nhận phiếu với trạng thái `Recorded` và trừ ngay vào quỹ tiền mặt lý thuyết của ca ($G$).
- Nếu số tiền $>$ `CashOutApprovalThreshold`: Hệ thống MUST hiển thị cảnh báo yêu cầu phê duyệt của Chủ, đổi nút tạo thành "Gửi yêu cầu phê duyệt", tạo phiếu với trạng thái `PendingApproval`. Phiếu này MUST KHÔNG được trừ vào quỹ $G$ cho đến khi được duyệt.
- Nhân viên SHALL có quyền bấm "Hủy yêu cầu" (`Cancelled`) với phiếu của mình khi còn `PendingApproval`.

#### Scenario: Lập phiếu chi nhỏ hơn hoặc bằng hạn mức
GIVEN Ca đang mở có hạn mức duyệt chi là `200,000 VND`
WHEN Nhân viên lập phiếu chi "Mua giấy in bill" số tiền `150,000 VND`
THEN Hệ thống tạo phiếu với trạng thái `Recorded`
AND Tiền lý thuyết trong ca $G$ giảm đi `150,000 VND` ngay lập tức

#### Scenario: Lập phiếu chi vượt hạn mức phê duyệt
GIVEN Ca đang mở có hạn mức duyệt chi là `200,000 VND`
WHEN Nhân viên nhập phiếu chi "Sửa bóng đèn quầy" số tiền `350,000 VND`
THEN Hệ thống hiển thị cảnh báo màu cam và nút "Gửi Yêu Cầu Phê Duyệt"
AND Khi gửi, phiếu được tạo với trạng thái `PendingApproval`
AND Tiền lý thuyết $G$ của ca chưa bị trừ `350,000 VND`
AND Số badge trên chuông của Chủ tăng thêm 1

---

### Requirement: REQ-POS-OWNER-04 Drawer phê duyệt của Chủ cửa hàng và Xác nhận Rút két
Chủ cửa hàng MUST có Drawer `OwnerCashApprovalDrawer` truy cập từ icon Chuông trên Header POS để thực hiện:
- Phê duyệt phiếu chi (`Approve`): Chuyển trạng thái sang `Recorded`, trừ số tiền vào quỹ két của ca hiện hành.
- Từ chối phiếu chi (`Reject`): Yêu cầu nhập lý do từ chối (bắt buộc), chuyển trạng thái sang `Rejected`.
- Xác nhận nhận tiền rút két (`CashDrop` / `confirm-drop`): Đánh dấu đã nhận bàn giao tiền mặt từ nhân viên.
- Cài đặt nhanh hạn mức duyệt chi `CashOutApprovalThreshold`.

#### Scenario: Chủ cửa hàng duyệt phiếu chi vượt hạn mức
GIVEN Có 1 phiếu chi `350,000 VND` đang ở trạng thái `PendingApproval`
WHEN Chủ cửa hàng mở Drawer `OwnerCashApprovalDrawer` và bấm "Phê duyệt"
THEN Trạng thái phiếu đổi thành `Recorded`
AND Quỹ tiền mặt lý thuyết trong ca $G$ được trừ đi `350,000 VND`
AND Badge thông báo giảm đi 1

#### Scenario: Chủ cửa hàng từ chối phiếu chi
GIVEN Có 1 phiếu chi đang ở trạng thái `PendingApproval`
WHEN Chủ cửa hàng bấm "Từ chối" và nhập lý do "Chi không hợp lý"
THEN Trạng thái phiếu đổi thành `Rejected` kèm ghi chú
AND Quỹ tiền mặt lý thuyết trong ca $G$ không bị ảnh hưởng

---

### Requirement: REQ-POS-CLOSE-05 Chốt ca kiểm đếm 9 mệnh giá, đối soát và khóa chốt ca
Khi nhân viên thực hiện chốt ca trong `CloseShiftModal`:
- Hệ thống MUST cung cấp bảng kiểm đếm 9 mệnh giá tiền mặt Việt Nam Đồng (500k, 200k, 100k, 50k, 20k, 10k, 5k, 2k, 1k) để tự động tính tổng tiền mặt thực tế $H$ (`ActualCashCounted`).
- Hệ thống MUST tự động tính toán đối soát: $G = A + B + C - D - E$ và chênh lệch kết ca $\Delta = H - G$.
- Ràng buộc bất biến tiền mặt (Invariant): Hệ thống MUST xác thực $RetainedFloatAmount + DroppedToSafeAmount == H$. Nếu không khớp, hệ thống MUST khóa nút "Chốt Ca & Bàn Giao".
- Khóa chốt ca khi còn phiếu chờ duyệt: Nếu trong ca còn bất kỳ phiếu chi nào ở trạng thái `PendingApproval`, hệ thống MUST khóa thao tác chốt ca và hiển thị danh sách phiếu cần xử lý (yêu cầu Chủ duyệt/từ chối hoặc Nhân viên bấm "Hủy yêu cầu").

#### Scenario: Nhân viên chốt ca hợp lệ
GIVEN Ca đang mở, không còn phiếu chi nào ở trạng thái `PendingApproval`
AND Tổng kiểm đếm thực tế $H = 5,000,000 VND$
WHEN Nhân viên phân bổ `RetainedFloatAmount = 2,000,000 VND` và `DroppedToSafeAmount = 3,000,000 VND`
THEN Hệ thống kiểm tra $2,000,000 + 3,000,000 == 5,000,000$ (Hợp lệ)
AND Nút "Chốt Ca & Bàn Giao" cho phép bấm
AND Sau khi chốt ca thành công, hiển thị modal Z-Report

#### Scenario: Bị chặn chốt ca do còn phiếu chi chờ duyệt
GIVEN Ca đang mở có 1 phiếu chi `PendingApproval`
WHEN Nhân viên mở modal Chốt ca
THEN Nút "Chốt Ca & Bàn Giao" bị vô hiệu hóa
AND Hiển thị thông báo cảnh báo màu đỏ "Còn phiếu chi chưa được duyệt" kèm nút "Hủy yêu cầu" để nhân viên chủ động giải phóng két nếu cần

---

### Requirement: REQ-POS-CONFIG-06 Cài đặt hạn mức phê duyệt thu chi tại Store Settings
Chủ cửa hàng MUST có khả năng cấu hình `CashOutApprovalThreshold` và `CashOutShiftTotalLimit` tại trang cài đặt chi nhánh / thanh toán (`StorePaymentConfigPage.tsx`).
- Giá trị mặc định: `200,000 VND`.
- Nếu cài đặt `0 VND`: Mọi phiếu chi đều chuyển sang `PendingApproval`.

#### Scenario: Chủ cửa hàng thay đổi hạn mức duyệt chi
GIVEN Chủ cửa hàng ở trang Cài đặt thanh toán chi nhánh
WHEN Cập nhật hạn mức phê duyệt chi két thành `500,000 VND` và bấm Lưu
THEN Cấu hình được lưu trữ vào hệ thống
AND Các phiếu chi từ `500,000 VND` trở xuống tại quầy POS sẽ được tự động ghi nhận mà không cần duyệt

---

## Lịch sử
- 2026-11-06 · `pos-shift-handover-cash-management` · +5 ~0 -0
- 2026-11-06 · `pos-shift-ui-role-and-cash-approval` · +6 ~0 -0
