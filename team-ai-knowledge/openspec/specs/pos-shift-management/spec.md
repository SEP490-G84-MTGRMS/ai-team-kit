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

### Requirement: REQ-SHIFT-SHARED-01: Single Active Shift Per Branch Enforcement
Hệ thống **MUST** đảm bảo rằng tại một thời điểm, mỗi chi nhánh thuộc một Tenant chỉ có tối đa một ca bán hàng ở trạng thái `Open` hoặc `Closing`. Mọi yêu cầu mở ca mới khi chi nhánh đã có ca đang hoạt động **MUST** bị từ chối với mã lỗi `409 Conflict`.

#### Scenario: Mở ca đầu tiên thành công
**GIVEN** Chi nhánh `BR-01` của Tenant `tenant_01` chưa có ca bán hàng nào ở trạng thái `Open` hoặc `Closing`  
**WHEN** Thu ngân gửi yêu cầu `POST /api/pos/shifts/open` với số tiền đầu ca `OpeningFloat = 2.000.000 đ`  
**THEN** Hệ thống tạo ca mới với `Status = Open`, lưu `OpeningFloat = 2.000.000 đ`, ghi nhận `CashierUserId` là người mở ca, và trả về HTTP 201 Created.

#### Scenario: Chặn mở ca thứ hai tại cùng một chi nhánh
**GIVEN** Chi nhánh `BR-01` đã có ca bán hàng ID `shift_01` đang ở trạng thái `Open`  
**WHEN** Thu ngân thứ hai gửi yêu cầu `POST /api/pos/shifts/open` tại chi nhánh `BR-01`  
**THEN** Hệ thống từ chối yêu cầu, trả về HTTP 409 Conflict kèm thông tin `shiftId: shift_01` và thông báo *"Chi nhánh đã có ca bán hàng đang mở"*.

---

### Requirement: REQ-SHIFT-SHARED-02: Multi-Cashier Auto-Join & Participant Tracking
Hệ thống **SHALL** cho phép nhân viên khác trong chi nhánh đăng nhập và tự động tham gia bán hàng trong ca đang mở mà không cần mở ca riêng. Hệ thống **MUST** tự động ghi nhận nhân viên vào bảng `ShiftParticipants` khi nhân viên tạo đơn hàng hoặc lập phiếu thu/chi trong ca.

#### Scenario: Thu ngân thứ hai tự động vào ca đang mở
**GIVEN** Chi nhánh `BR-01` đang có ca ID `shift_01` ở trạng thái `Open`  
**WHEN** Thu ngân B đăng nhập vào hệ thống và truy cập màn hình POS  
**THEN** Giao diện POS không hiển thị modal mở ca, tự động nạp `shift_01` vào phiên làm việc và hiển thị tên người mở ca cùng thời gian mở ca.

#### Scenario: Ghi nhận người tham gia ca khi phát sinh đơn hàng
**GIVEN** Ca `shift_01` đang mở và Thu ngân B chưa có trong danh sách `ShiftParticipants`  
**WHEN** Thu ngân B tạo thành công một đơn hàng tại chi nhánh  
**THEN** Hệ thống lưu đơn hàng gắn `ShiftId = shift_01`, `CreatedBy = UserId của B`, đồng thời thêm một bản ghi vào `ShiftParticipants` với `JoinedAtUtc` và `LastActiveAtUtc` là thời điểm hiện tại.

---

### Requirement: REQ-SHIFT-SHARED-03: Lockdown During Closing (Khóa bán khi kiểm đếm)
Khi một nhân viên bấm bắt đầu chốt ca (`start-closing`), hệ thống **MUST** chuyển trạng thái ca sang `Closing` và **MUST** từ chối tất cả các yêu cầu tạo đơn hàng (`POST /api/pos/orders`) và lập phiếu thu/chi (`POST /api/pos/shifts/{id}/cash-movements`) trên mọi máy POS thuộc chi nhánh đó.

#### Scenario: Khóa tạo đơn hàng khi ca đang ở trạng thái Closing
**GIVEN** Ca `shift_01` đã chuyển sang trạng thái `Closing` do Thu ngân A bấm "Bắt đầu chốt ca"  
**WHEN** Thu ngân B ở máy khác gửi yêu cầu thanh toán `POST /api/pos/orders`  
**THEN** Hệ thống từ chối đơn hàng, trả về HTTP 409 Conflict với thông báo *"Ca bán hàng của chi nhánh đang trong trạng thái kiểm đếm chốt ca (Closing). Không thể tạo đơn mới."*

#### Scenario: Hủy chốt ca và mở lại quầy bán hàng
**GIVEN** Ca `shift_01` đang ở trạng thái `Closing`  
**WHEN** Thu ngân gửi yêu cầu `POST /api/pos/shifts/shift_01/cancel-closing`  
**THEN** Hệ thống chuyển trạng thái ca trở lại `Open`, xóa các xác nhận số đếm tạm thời, và các máy POS được phép tiếp tục tạo đơn hàng bình thường.

---

### Requirement: REQ-SHIFT-SHARED-04: Shift Cash Reconciliation & Confirmation
Hệ thống **MUST** yêu cầu nhập số tiền đếm thực tế $H$ khi ca đang `Closing`. Hệ thống **MUST** chặn đóng ca nếu còn bất kỳ phiếu chi tiền mặt nào ở trạng thái `PendingApproval`. Khi đủ xác nhận, hệ thống **MUST** chuyển ca sang `Closed` và chốt số liệu Z-Report.

#### Scenario: Chặn đóng ca khi còn phiếu chi chưa duyệt
**GIVEN** Ca `shift_01` đang ở trạng thái `Closing` và có 1 phiếu chi tiền mặt `100.000 đ` đang chờ duyệt (`PendingApproval`)  
**WHEN** Thu ngân gửi yêu cầu `POST /api/pos/shifts/shift_01/confirm-close`  
**THEN** Hệ thống từ chối đóng ca, trả về HTTP 400 Bad Request với thông báo *"Không thể đóng ca khi còn phiếu chi đang chờ duyệt. Vui lòng duyệt hoặc hủy phiếu chi trước khi đóng ca."*

#### Scenario: Đóng ca thành công và in Z-Report phân bổ theo nhân viên
**GIVEN** Ca `shift_01` đang ở trạng thái `Closing`, không còn phiếu chi chờ duyệt, Thu ngân A đã bán `500.000 đ` và Thu ngân B đã bán `300.000 đ`  
**WHEN** Thu ngân nhập số tiền đếm $H$ và gửi yêu cầu `confirm-close`  
**THEN** Hệ thống chuyển ca sang `Closed`, tính chênh lệch $I = H - G$, và Z-Report tổng hợp chi tiết doanh thu phân bổ riêng theo từng nhân viên (A: 500k, B: 300k).

---

### Requirement: REQ-SHIFT-SHARED-05: Store Owner Sales Attribution & Force-Close
Khi Chủ cửa hàng (vai trò `STORE_OWNER`) tạo đơn hàng tại chi nhánh đang có ca `Open`, hệ thống **MUST** gán đơn hàng vào ca đó và ghi rõ `CreatedBy` là Chủ cửa hàng. Nếu nhân viên quên đóng ca, Chủ cửa hàng **MUST** có quyền gọi API `POST /api/pos/shifts/{id}/force-close` kèm lý do bắt buộc để kết thúc ca.

#### Scenario: Đơn hàng của Chủ cửa hàng gắn vào ca chung
**GIVEN** Chi nhánh `BR-01` đang có ca `shift_01` mở  
**WHEN** Chủ cửa hàng đăng nhập và thực hiện thanh toán đơn hàng tại quầy  
**THEN** Đơn hàng được lưu với `ShiftId = shift_01`, `CreatedBy = UserId của Chủ`, và Z-Report có dòng thống kê riêng *"Trong đó bán bởi chủ: [Số tiền]"*.

#### Scenario: Chủ cửa hàng đóng ca cưỡng bức khi nhân viên đã về
**GIVEN** Ca `shift_01` đã quá giờ làm việc và nhân viên đã về hết mà chưa chốt ca  
**WHEN** Chủ cửa hàng gọi `POST /api/pos/shifts/shift_01/force-close` với `ActualCashCounted = 3.500.000 đ` và `ForceCloseReason = "Nhân viên quên chốt ca, chủ kiểm đếm đóng ca"`  
**THEN** Hệ thống chuyển ca sang `Closed`, lưu `ClosedByUserId` là ID của Chủ, ghi nhận `ForceCloseReason`, và cập nhật sổ quỹ an toàn.

---

### Requirement: REQ-STOCK-CONCURRENCY-01: Concurrency-Safe FEFO Inventory Deduction
Khi nhiều thu ngân thực hiện thanh toán đồng thời các đơn hàng có chứa cùng một sản phẩm, hệ thống **MUST** sử dụng cơ chế khóa mức dòng (Pessimistic Row-Level Lock hoặc Concurrency Check) trên bảng `BranchStocks`. Hệ thống **MUST** đảm bảo việc trừ tồn kho theo hạn dùng sớm nhất (FEFO) được thực hiện tuần tự và không bao giờ để xảy ra tình trạng bán âm hoặc bán quá tồn kho thực tế.

#### Scenario: Hai thu ngân bán cùng sản phẩm đồng thời không bị âm kho
**GIVEN** Sản phẩm X tại chi nhánh `BR-01` chỉ còn tồn kho đúng `3` đơn vị ở hạn dùng sớm nhất  
**WHEN** Thu ngân 1 gửi đơn mua số lượng `2` và Thu ngân 2 gửi đơn mua số lượng `2` tại cùng một thời điểm chính xác  
**THEN** 
- Một trong hai đơn hàng được xử lý trước, trừ tồn kho từ `3` xuống `1` và hoàn tất thành công.
- Đơn hàng còn lại kiểm tra thấy tồn kho chỉ còn `1` (nhỏ hơn `2` yêu cầu), từ chối thanh toán với thông báo *"Sản phẩm X không đủ số lượng tồn kho (chỉ còn 1)"*.
- Tồn kho cuối cùng của sản phẩm X tại chi nhánh còn đúng `1`, tuyệt đối không bị âm (`-1`).

---

### Requirement: REQ-NAV-01 Lối tắt Lịch sử giao ca trên trang Lịch làm việc
Giao diện "Lịch làm việc chi nhánh" (`WorkSchedulePage.tsx`) MUST cung cấp một button chuyên dụng "Lịch sử giao ca" tại khu vực thanh điều khiển tiêu đề (Header Actions).

#### Scenario: Chủ cửa hàng hoặc Quản lý chi nhánh nhấn button Lịch sử giao ca
- **GIVEN** Người dùng đang ở màn hình `/store-owner/employees/schedule` và đã chọn chi nhánh `Chi nhánh Ba Đình`.
- **WHEN** Người dùng nhấn vào button "Lịch sử giao ca".
- **THEN** Hệ thống MUST điều hướng sang trang `/pos/shift?branchId={branchId}` với chi nhánh Ba Đình được thiết lập sẵn trên bộ lọc.

#### Scenario: Không chọn chi nhánh cụ thể (Tất cả chi nhánh)
- **GIVEN** Người dùng chưa lọc chi nhánh hoặc chọn tất cả chi nhánh.
- **WHEN** Người dùng nhấn "Lịch sử giao ca".
- **THEN** Hệ thống MUST điều hướng sang `/pos/shift` và hiển thị chi nhánh mặc định đầu tiên của chuỗi.

---

### Requirement: REQ-NAV-02 Tập trung cấu hình Hạn mức & Phê duyệt chi két tại Portal Cài đặt & Thiết lập
Toàn bộ tính năng thiết lập hạn mức tiền mặt rút két và phê duyệt chi quỹ vượt ngưỡng MUST được quản lý độc quyền tại dropdown "Cài đặt & Thiết lập" (`/store-owner/pos-cash-control`), không xuất hiện trên giao diện POS bán hàng.

#### Scenario: Chủ cửa hàng cấu hình hạn mức từ TopNav Portal
- **GIVEN** Chủ cửa hàng đang ở bất kỳ trang quản trị nào của Portal.
- **WHEN** Người dùng click vào icon bánh răng "CÀI ĐẶT & THIẾT LẬP" trên TopNav và chọn "Hạn Mức & Duyệt Chi Két POS".
- **THEN** Hệ thống MUST mở trang `StorePosCashControlPage.tsx`, cho phép cập nhật hạn mức chi và phê duyệt/từ chối các phiếu chi đang chờ.

---

### Requirement: REQ-SHIFT-HIST-01 Truy vấn danh sách lịch sử đóng ca tích hợp Backend API
Màn hình `PosShiftPage.tsx` MUST gọi API `GET /api/pos/shifts/history` để tải danh sách các phiên ca thực tế đã diễn ra tại chi nhánh.

#### Scenario: Tải danh sách lịch sử ca thành công
- **GIVEN** Chi nhánh có các ca làm việc đã đóng (`Closed`) và đang đóng (`Closing`).
- **WHEN** Trang `PosShiftPage.tsx` được mở với `branchId`.
- **THEN** Hệ thống MUST hiển thị danh sách các ca với đầy đủ thông tin: Mã ca, Quầy, Giờ mở - Giờ đóng, Thu ngân mở ca, Tiền đầu ca, Doanh thu tiền mặt, Tiền thực đếm, Chênh lệch két thừa/thiếu, Trạng thái ca, Trạng thái bàn giao.
- **AND** Hệ thống MUST tính toán và hiển thị đúng 4 thẻ KPI tổng hợp (Tổng số ca, Tổng doanh thu tiền mặt, Tổng tiền thực đếm, Tổng chênh lệch).

#### Scenario: Không có ca nào trong dải ngày
- **GIVEN** Chi nhánh không phát sinh ca bán hàng nào trong dải ngày đã chọn.
- **WHEN** Dữ liệu trả về rỗng.
- **THEN** Hệ thống MUST hiển thị trạng thái Empty State rõ ràng: "Không có dữ liệu ca làm việc trong khoảng thời gian này."

---

### Requirement: REQ-SHIFT-HIST-02 Xác nhận bàn giao ca và đối soát chênh lệch
Thu ngân nhận ca tiếp theo hoặc Chủ cửa hàng/Quản lý MUST có khả năng xác nhận bàn giao ca (`ConfirmHandover`) hoặc khiếu nại chênh lệch (`Disputed`) cho các ca có trạng thái bàn giao chưa hoàn tất.

#### Scenario: Thu ngân xác nhận nhận bàn giao ca khớp tiền
- **GIVEN** Một ca đã đóng với `HandoverStatus = Pending`.
- **WHEN** Người dùng nhấn "Xác nhận bàn giao", nhập số tiền thực nhận khớp và bấm Đồng ý.
- **THEN** Hệ thống MUST gửi `POST /api/pos/shifts/{id}/confirm-handover` với `isConfirmed = true`.
- **AND** Trạng thái bàn giao của ca MUST chuyển sang `Confirmed` (màu xanh lá) ngay lập tức.

#### Scenario: Thu ngân ghi nhận khiếu nại thiếu hụt tiền bàn giao
- **GIVEN** Một ca đã đóng phát hiện thiếu hụt tiền mặt không rõ lý do.
- **WHEN** Người dùng chọn "Khiếu nại / Lệch tiền", nhập lý do và bấm Gửi.
- **THEN** Hệ thống MUST gửi `POST /api/pos/shifts/{id}/confirm-handover` với `isConfirmed = false` kèm `disputeReason`.
- **AND** Trạng thái bàn giao MUST chuyển sang `Disputed` (màu đỏ cam) cùng ghi chú khiếu nại.

---

### Requirement: REQ-SHIFT-05 Tinh giản Menu thao tác POS Header
Giao diện `PosHeader.tsx` MUST loại bỏ nút điều hướng "Hạn mức & Duyệt chi két" và loại bỏ prop `pendingApprovalCount` trong `PosHeaderProps`. Menu thao tác chỉ giữ các chức năng phục vụ trực tiếp cho hoạt động quầy thu ngân.

#### Scenario: Thu ngân hoặc Chủ cửa hàng mở Menu thao tác trên POS Header
- **GIVEN** Người dùng (kể cả role `STORE_OWNER`) đang ở giao diện bán hàng POS.
- **WHEN** Nhấn vào nút Hamburger "Thao tác".
- **THEN** Menu dropdown hiển thị:
  1. Về Dashboard (chỉ Store Owner)
  2. Giữ đơn hàng (Recall)
  3. In bill gần nhất
  4. Tra cứu tồn kho & Lô FEFO
  5. Quản lý đơn hàng & Đổi trả
  6. Thu / Chi tiền mặt két (Nhân viên)
  7. Lịch sử ca cửa hàng / Sổ ca & Chốt ca quầy
- **AND** Hoàn toàn KHÔNG hiển thị mục "Hạn mức & Duyệt chi két".

---

### Requirement: REQ-MULTI-STAFF-SHIFT-TESTING (Cấu Hình 2 Tài Khoản Nhân Viên Test Bán Chung Ca)
Dữ liệu khởi tạo CSDL (Seed Data) **MUST** đảm bảo có sẵn ít nhất 2 tài khoản nhân viên thật thuộc Chi nhánh Ba Đình:
1. `0917778888` / `123456`: Phạm Thị Yến (Thu ngân 1, Role: EMPLOYEE, Chi nhánh Ba Đình)
2. `0915556666` / `123456`: Nguyễn Văn Minh (Thu ngân 2, Role: EMPLOYEE, Chi nhánh Ba Đình)
Cả 2 tài khoản **MUST** được phân công ca làm việc hoạt động (Active EmployeeSchedule) tại Chi nhánh Ba Đình.
Khi Thu ngân 1 mở ca và bán đơn hàng, rồi Thu ngân 2 đăng nhập vào POS bán đơn hàng tiếp theo trong cùng ngày/chi nhánh, hệ thống **MUST** cho phép Thu ngân 2 bán vào phiên ca chung đó và tự động ghi nhận Thu ngân 2 vào danh sách `ShiftParticipants`.

#### Scenario: Hai nhân viên bán chung ca và ghi nhận vào danh sách tham gia
* **GIVEN** Thu ngân 1 (`0917778888`) đăng nhập vào POS, mở ca với tiền đầu ca 1.500.000 đ và thanh toán đơn hàng HD01
* **WHEN** Thu ngân 2 (`0915556666`) đăng nhập vào POS trên cùng chi nhánh Ba Đình
* **THEN** POS tự động nhận diện ca đang mở và cho phép Thu ngân 2 bán hàng ngay
* **WHEN** Thu ngân 2 thanh toán đơn hàng HD02
* **THEN** Đơn hàng HD02 được lưu với `CreatedBy` là Thu ngân 2
* **AND** Bảng `ShiftParticipants` tự động ghi nhận Thu ngân 2 tham gia ca
* **WHEN** Thực hiện chốt ca và xem lại trong trang Lịch sử chốt ca
* **THEN** Cột "Thu ngân" hiển thị cả 2 nhân viên: `Phạm Thị Yến, Nguyễn Văn Minh`

### Requirement: REQ-SHIFT-HISTORY-QUERY (Truy Vấn Lịch Sử Ca Hợp Lệ & An Toàn)
Hệ thống **MUST** hỗ trợ tra cứu lịch sử các phiên ca làm việc theo chi nhánh sử dụng định dạng `Guid` chuẩn từ CSDL thay vì mã chuỗi mock.
Giao diện người dùng **SHALL** tải danh sách chi nhánh hoạt động từ API (`employeeApi.getBranches()` hoặc `branchApi.getBranches()`) để người dùng lọc chi nhánh.
Backend `ShiftsController.GetShiftHistory` **MUST** cho phép tham số `branchId` là nullable (`Guid? branchId`). Nếu không truyền hoặc truyền `Guid.Empty`, backend **SHALL** tự động fallback về `CurrentBranchId` của Tenant/User mà không được trả lỗi `400 Bad Request`.

#### Scenario: Sửa lỗi 400 khi mở trang Lịch sử ca
* **GIVEN** Người dùng mở trang "Lịch Sử Chốt Ca & Bàn Giao Quầy"
* **WHEN** Trang khởi tạo và gọi API lấy danh sách chi nhánh và lịch sử ca
* **THEN** Chi nhánh được chọn mang GUID chuẩn (ví dụ của Chi nhánh Ba Đình)
* **AND** API `GET /api/v1/shifts/history?branchId={guid}` trả về HTTP 200 OK kèm danh sách các phiên ca
* **AND** Không còn xuất hiện banner đỏ `Request failed with status code 400`

#### Scenario: Fallback an toàn khi branchId không được chỉ định
* **GIVEN** Client gửi request `GET /api/v1/shifts/history` không truyền `branchId` hoặc truyền `branchId=00000000-0000-0000-0000-000000000000`
* **WHEN** Backend xử lý request
* **THEN** Backend lấy `_tenantContext.CurrentBranchId` hợp lệ
* **AND** Trả về HTTP 200 OK với danh sách ca thuộc chi nhánh mặc định của tenant

---

### Requirement: REQ-SHIFT-PAGE-LAYOUT (Tích Hợp Thanh Điều Hướng Sidebar Quản Trị)
Trang Lịch Sử Chốt Ca & Bàn Giao Quầy **MUST** được đặt tại đường dẫn quản trị `/store-owner/shifts` và nằm bên trong layout chuẩn `StoreOwnerLayout`.
Trang **SHALL** hiển thị đầy đủ thanh Sidebar điều hướng bên trái và thanh TopNav trên cùng để Chủ cửa hàng dễ dàng chuyển sang các module khác (Hàng hóa, Khuyến mãi, Nhân viên, Sổ quỹ...).
Nút "Lịch sử giao ca" tại trang Lịch làm việc (`WorkSchedulePage.tsx`) **SHALL** điều hướng đến `/store-owner/shifts`.

#### Scenario: Chủ cửa hàng xem lịch sử ca có thanh Sidebar
* **GIVEN** Chủ cửa hàng đang ở trang Lịch Làm Việc (`/store-owner/employees/schedule`)
* **WHEN** Chủ cửa hàng bấm nút "Lịch sử giao ca"
* **THEN** Hệ thống chuyển hướng đến `/store-owner/shifts?branchId={guid}`
* **AND** Trang hiển thị đầy đủ thanh Sidebar quản trị bên trái cùng bảng dữ liệu lịch sử ca và 4 thẻ KPI

---

### Requirement: REQ-SHIFT-CLOSE-UX-CLEANUP (Tinh Gọn Quy Trình Đóng Ca, Xóa Bỏ In Z-Report K80)
Hệ thống **MUST** loại bỏ hoàn toàn modal in phiếu kết ca K80 (`ZReportModal`) sau khi chốt ca POS cũng như nút in "Z-Report" trong bảng lịch sử ca.
Khi hoàn tất đóng ca tại POS, hệ thống **SHALL** hiển thị thông báo thành công (Toast), đóng modal chốt ca và cập nhật trạng thái ca làm việc mà không bật popup in ấn.
Trong bảng lịch sử ca, cột "Thao tác" **SHALL** chỉ hiển thị nút hành động "Nhận ca" nếu ca đang ở trạng thái `PendingHandover`.

#### Scenario: Đóng ca POS nhanh gọn không in Z-Report
* **GIVEN** Thu ngân đang mở modal "Chốt ca" tại màn hình bán hàng POS
* **WHEN** Thu ngân nhập số tiền thực đếm, phân bổ két và bấm "Xác Nhận & Hoàn Tất Đóng Ca"
* **THEN** Ca được đóng thành công với thông báo Toast xanh
* **AND** Modal đóng ca tự động tắt, không hiển thị popup "Báo Cáo Kết Ca Z-Report K80"
* **AND** Trạng thái trên header POS chuyển sang chưa mở ca

---

### Requirement: REQ-POS-HEADER-CLEANUP (Ẩn Hiển Thị Quầy Trên Header POS)
Thanh Header POS **MUST NOT** hiển thị nhãn `&bull; Quầy #01`.
Thanh Header **SHALL** chỉ hiển thị thông tin Chi nhánh: `Chi nhánh: [Tên chi nhánh]` để tránh gây hiểu nhầm về phân chia quầy/két vật lý.

#### Scenario: Header POS chỉ hiển thị Chi nhánh
* **GIVEN** Thu ngân truy cập màn hình bán hàng POS
* **WHEN** Màn hình POS hiển thị
* **THEN** Thanh tiêu đề hiển thị tên chi nhánh đã chọn
* **AND** Không xuất hiện bất kỳ nhãn nào chứa "Quầy #01"

---

### Requirement: REQ-STRICT-SCHEDULE-VALIDATION (Xác Thực Lịch Phân Ca Khi Bán Hàng POS)
Hệ thống Backend MUST xác thực tính hợp lệ của lịch phân ca làm việc (`EmployeeSchedule`) của người dùng trước khi cho phép mở ca hoặc tạo đơn hàng POS mới.
1. Nếu người dùng mang vai trò Quản lý / Chủ cửa hàng (`STORE_OWNER`, `OWNER`, `ADMIN`), hệ thống MUST miễn trừ kiểm tra lịch trực và cho phép thực thi ngay.
2. Nếu người dùng mang vai trò Nhân viên thu ngân (`EMPLOYEE`), hệ thống MUST kiểm tra:
   - Hồ sơ nhân viên (`Employee`) tồn tại và gắn với tài khoản đang đăng nhập.
   - Tồn tại ít nhất 1 bản ghi `EmployeeSchedule` thuộc chi nhánh đang bán (`BranchId`), ngày hôm nay theo múi giờ Việt Nam (`WorkDate == nowVn.Date`), trạng thái không bị hủy (`Status != Cancelled`).
   - Thời điểm hiện tại `nowVn.TimeOfDay` nằm trong khung giờ làm việc của ca (kèm dung sai 30 phút trước giờ bắt đầu và sau giờ kết thúc ca).
3. Nếu không thỏa mãn điều kiện ca trực, hệ thống MUST ném `BusinessException("EMPLOYEE_NOT_SCHEDULED", "Bạn không có lịch làm việc trong ca hiện tại của chi nhánh.")`.

#### Scenario: Nhân viên có lịch trực hợp lệ trong ca tạo đơn thành công
**GIVEN** Thu ngân `Phạm Thị Yến` có lịch phân ca hôm nay từ 08:00 đến 12:00 tại Chi nhánh Ba Đình  
**AND** Thời điểm hiện tại là 09:30 sáng  
**WHEN** Thu ngân gửi yêu cầu tạo đơn hàng thanh toán POS (`POST /api/orders`)  
**THEN** Hệ thống xác thực lịch trực thành công và tạo đơn hoàn tất.

#### Scenario: Nhân viên không có lịch trực hôm nay bị chặn tạo đơn
**GIVEN** Thu ngân `Nguyễn Văn Minh` không có bất kỳ lịch trực nào hôm nay tại Chi nhánh Ba Đình  
**WHEN** Thu ngân gửi yêu cầu tạo đơn hàng thanh toán POS (`POST /api/orders`)  
**THEN** Hệ thống MUST chặn yêu cầu và trả về lỗi HTTP 400 Bad Request / 422 Unprocessable Entity với mã lỗi `EMPLOYEE_NOT_SCHEDULED` và thông báo `"Bạn không có lịch làm việc trong ca hiện tại của chi nhánh."`.

#### Scenario: Nhân viên có lịch trực hôm nay nhưng ngoài khung giờ làm việc bị chặn
**GIVEN** Thu ngân `Phạm Thị Yến` có lịch ca chiều từ 13:00 đến 17:00  
**AND** Thời điểm hiện tại là 09:00 sáng (ngoài dung sai 30 phút)  
**WHEN** Thu ngân bấm mở ca hoặc gửi yêu cầu tạo đơn hàng  
**THEN** Hệ thống MUST chặn yêu cầu với mã lỗi `EMPLOYEE_NOT_SCHEDULED`.

#### Scenario: Nhân viên đến sớm trong phạm vi dung sai 30 phút được phép mở ca
**GIVEN** Thu ngân có lịch ca bắt đầu lúc 08:00 sáng  
**AND** Thời điểm hiện tại là 07:45 sáng (sớm 15 phút, nằm trong dung sai 30 phút)  
**WHEN** Thu ngân bấm mở ca kết két POS  
**THEN** Hệ thống chấp thuận cho phép mở ca.

#### Scenario: Chủ cửa hàng tạo đơn không bị chặn lịch làm việc
**GIVEN** Người dùng đăng nhập bằng tài khoản Chủ cửa hàng (`STORE_OWNER`)  
**AND** Người dùng không có bản ghi nào trong bảng `EmployeeSchedules`  
**WHEN** Người dùng thực hiện thanh toán đơn hàng trên POS  
**THEN** Hệ thống miễn trừ kiểm tra lịch làm việc và hoàn tất tạo đơn bình thường.

---

### Requirement: REQ-POS-UI-SCHEDULE-ALERT (Cảnh Báo & Khóa Nút Thanh Toán POS Khi Ngoài Ca)
Giao diện bán hàng POS ([`PosCheckoutPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx)) SHALL kiểm tra tính đủ điều kiện trực ca của người dùng qua API `GET /api/shifts/cashier-eligibility?branchId=...` khi màn hình tải.
1. Nếu `isAllowed === false`:
   - Giao diện MUST hiển thị Banner cảnh báo lỗi (`Alert type="error"`) với nội dung: *"Bạn không có lịch làm việc trong ca hiện tại của chi nhánh này. Thao tác thanh toán bị khóa."*
   - Nút **"Thanh toán (F9)"** MUST bị vô hiệu hóa (`disabled={true}`).
2. Nếu `isAllowed === true`:
   - Không hiển thị banner cảnh báo và nút Thanh toán hoạt động bình thường.

#### Scenario: Màn hình POS tự động khóa khi nhân viên ngoài ca truy cập
**GIVEN** Nhân viên không có lịch trực ca đăng nhập vào `/employee/pos`  
**WHEN** Màn hình POS tải hoàn tất  
**THEN** Giao diện hiển thị Alert thông báo màu đỏ và nút "Thanh toán (F9)" bị vô hiệu hóa kèm Tooltip cảnh báo.

---

## Lịch sử
- 2026-11-06 · `pos-shift-handover-cash-management` · +5 ~0 -0
- 2026-11-06 · `pos-shift-ui-role-and-cash-approval` · +6 ~0 -0
- 2026-11-07 · `pos-till-shift-timing-concurrency` · +6 ~0 -0
- 2026-11-08 · `pos-cash-control-nav-and-shift-history` · +4 ~1 -0
- 2026-11-08 · `pos-shift-sidebar-multistaff-and-fix400` · +1 ~4 -0
- 2026-11-08 · `pos-strict-employee-schedule-check` · +2 ~0 -0
