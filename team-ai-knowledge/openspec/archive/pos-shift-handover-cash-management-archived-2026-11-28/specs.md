# Đặc Tả Delta (Specs): Quản Lý Ca Làm Việc POS — Mở Ca, Thu Chi Két & Chốt Ca

## ADDED Requirements

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

## Acceptance Checklist
- [ ] Bổ sung trường mới vào `ShiftZReport` và bảng `ShiftCashMovement` trong EF Core & DbContext.
- [ ] Bổ sung `Order.ShiftId` và tự động gắn ca khi thanh toán POS.
- [ ] API Mở ca đối soát `OpeningFloatExpected` từ ca trước khép kín chuỗi tiền.
- [ ] API Thu chi két tạo dòng `ShiftCashMovement` có `CreatedBy`.
- [ ] API Chốt ca kiểm tra chặt chẽ $Retained + Dropped = H$ và tính $G$, $Discrepancy$.
- [ ] API Xác nhận bàn giao ca `CONFIRMED` / `DISPUTED`.
- [ ] Toàn bộ unit tests đạt 100% PASS.

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: pos-till-shift-timing-concurrency -->
# Specification: Ca Dùng Chung Theo Chi Nhánh (Nhiều Quầy, Một Két), Khóa Bán Khi Chốt Ca & Concurrency Tồn Kho

## Capability Summary
Tính năng này mở rộng phân hệ Quản lý ca bán hàng (`pos-shift-management`) của MT-GRMS:
- Cho phép tất cả quầy thu ngân và nhân viên trong một chi nhánh dùng chung một ca bán hàng và một két tiền mặt duy nhất.
- Đảm bảo tại một thời điểm mỗi chi nhánh chỉ có tối đa một ca `Open` hoặc `Closing`.
- Tự động khóa tạo đơn hàng và phiếu thu chi trên mọi máy quầy khi ca chuyển sang trạng thái `Closing` (kiểm đếm két).
- Hỗ trợ nhân viên về sớm mà ca vẫn tiếp tục, hỗ trợ Chủ cửa hàng bán hàng gắn đơn vào ca chung, và cho phép Chủ đóng ca cưỡng bức khi cần.
- Bảo vệ trừ tồn kho FEFO đồng thời (Concurrency Control) an toàn tuyệt đối chống race condition khi nhiều quầy quét bán cùng một sản phẩm.

---

## Architecture Map
- **Frontend**: `PosCheckoutPage.tsx`, `PosHeader.tsx`, `CloseShiftModal.tsx`, `OpenShiftModal.tsx` -> `posShiftApi.ts`, `posOrderApi.ts`.
- **Backend**: `ShiftsController.cs`, `OrdersController.cs` -> `ShiftService.cs`, `OrderService.cs` -> `IShiftRepository.cs`, `IOrderRepository.cs`.
- **Database**: PostgreSQL tables: `ShiftZReports`, `ShiftParticipants`, `ShiftCloseConfirmations`, `Orders`, `BranchStocks`.

---

## ADDED Requirements

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

## Acceptance Checklist
- [ ] Bổ sung trường `Closing`, `ClosingStartedByUserId`, `ClosedByUserId`, `ForceCloseReason` vào `ShiftZReport`.
- [ ] Tạo bảng `ShiftParticipants` và `ShiftCloseConfirmations` kèm EF Core migration.
- [ ] Tạo partial unique index `(TenantId, BranchId)` cho ca `Open`/`Closing`.
- [ ] Triển khai các API: `start-closing`, `cancel-closing`, `counted-cash`, `confirm-close`, `force-close`.
- [ ] Chặn API tạo đơn hàng và tạo phiếu thu chi khi ca đang ở trạng thái `Closing`.
- [ ] Áp dụng `FOR UPDATE` row lock trong `OrderService` khi trừ tồn kho `BranchStocks` theo FEFO.
- [ ] Tự động gán đơn hàng của Chủ vào ca `Open` đang chạy.
- [ ] Cập nhật giao diện `PosCheckoutPage`: tự động vào ca mở, hiển thị banner khóa bán khi `Closing`.
- [ ] Cập nhật `CloseShiftModal`: hỗ trợ bắt đầu chốt ca, hủy chốt và xác nhận số đếm.
- [ ] Kiểm thử tự động xUnit: Pass 100% tất cả các kịch bản đơn lẻ và đồng thời.
