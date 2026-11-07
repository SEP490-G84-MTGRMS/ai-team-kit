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
