# Proposal: Quản Lý Ca Làm Việc POS — Mở Ca, Thu Chi Két, Chốt Ca & Bàn Giao Ca

## 1. Vấn Đề (Problem Statement)
- Hiện tại quầy thu ngân POS chưa có cơ chế quản lý ca làm việc (Shift Management) khép kín giữa các nhân viên thu ngân.
- Tiền mặt đầu ca (Opening Float) và tiền bàn giao cho ca kế tiếp (Retained Float) chưa được liên kết chuỗi (`PrevShiftId`), dẫn đến nguy cơ thất thoát hoặc lệch tiền mà không thể truy vết được ca nào gây ra.
- Các khoản thu chi lẻ phát sinh trong ca (nạp tiền lẻ, chi vặt, rút tiền nộp két an toàn, thu nợ khách hàng) chưa có bảng lưu vết định danh riêng (`ShiftCashMovement`) có người tạo (`CreatedBy`) và thời điểm cụ thể.
- Đơn hàng bán ra (`Order`) chưa được gắn `ShiftId`, khiến việc tính doanh thu thực tế của ca dễ bị trôi số hoặc lệch nếu hai quầy bán song song.

## 2. Mục Tiêu (Goals & Objectives)
- Xây dựng luồng Quản lý Ca làm việc chuẩn hóa cho POS:
  1. **Mở ca**: Thu ngân mở ca, xác nhận tiền bàn giao từ ca trước (`OpeningFloatExpected` từ `prevShift.RetainedFloatAmount`), ghi nhận chênh lệch mở ca (`OpeningDiscrepancy`) nếu có.
  2. **Thu chi két**: Cho phép lập phiếu Thu tiền vào / Chi tiền ra trong ca (`ShiftCashMovement`) với phân loại rõ ràng (Chi vặt, Rút két nộp chủ, Nạp tiền lẻ, Thu nợ).
  3. **Bán hàng trong ca**: Tự động gán `ShiftId` vào mọi `Order` tạo ra trong ca, phục vụ tính chính xác doanh thu tiền mặt ($B$) và doanh thu ngân hàng ($TotalBankRevenue$).
  4. **Chốt ca & Bàn giao**: Thu ngân đếm tiền mặt thực tế ($H$), hệ thống tự tính tiền lý thuyết ($G$) và chênh lệch ($Discrepancy = H - G$); phân bổ tiền giữ lại cho ca sau ($RetainedFloat$) và tiền nộp két an toàn ($DroppedToSafe$); bàn giao ca cho nhân viên tiếp theo với trạng thái xác nhận (`HandoverStatus`).

## 3. Phạm Vi Thực Hiện (Scope)

### A. In Scope
- **Backend Entities**:
  - `ShiftZReport` (mở rộng): Thêm `BranchId`, `ShiftCode`, `ShiftName`, `PrevShiftId`, `OpeningFloatExpected`, `OpeningDiscrepancy`, `ReceiverUserId`, `HandoverStatus`, `TotalBankRevenue`, `TotalOrdersCount`, chuyển `Discrepancy` thành `decimal?`.
  - `ShiftCashMovement` (tạo mới): `ShiftId`, `MovementType` (IN/OUT), `Category`, `Amount`, `Reason`, `CreatedBy`, `OccurredAtUtc`, navigation `Shift`.
  - `Order` (cập nhật): Thêm `ShiftId` (`Guid?`) và navigation `Shift`.
  - Enums: `CashMovementType`, `CashMovementCategory`, `HandoverStatus`.
- **Backend Application & API**:
  - `IShiftService` / `ShiftService`: API Mở ca (`OpenShift`), Ghi nhận thu/chi két (`AddCashMovement`), Chốt ca & Bàn giao (`CloseShift`), Xác nhận bàn giao ca (`ConfirmHandover`), Lấy ca hiện tại (`GetCurrentShift`).
  - Đảm bảo 1 quầy / 1 chi nhánh chỉ có tối đa 1 ca mở cùng lúc (`Status == Open`).
- **Unit Tests**:
  - Bộ test suite kiểm thử toàn diện vòng đời ca: Mở ca -> Thu chi két -> Bán hàng cộng dồn -> Chốt ca tính công thức $A \to I$ -> Bàn giao ca kế tiếp.
- **Frontend POS Integration**:
  - Nối API mở ca, chốt ca, thu chi két vào giao diện ca POS đã có trên Frontend.

### B. Out of Scope
- Tích hợp két sắt phần cứng vật lý qua cổng serial/RJ11 (chỉ quản lý phần mềm và két an toàn logic).
- Chấm công tự động tính lương theo giờ từ ca (thuộc phân hệ HR tách biệt).

## 4. Người Dùng & Vai Trò (Actors & Roles)
- **STORE_OWNER (Chủ cửa hàng)**: Xem báo cáo ca toàn chuỗi, duyệt các ca lệch tiền (`Discrepancy`), nhận tiền nộp két an toàn (`DroppedToSafeAmount`), thực hiện force-close ca khi cần.
- **EMPLOYEE (Thu ngân)**: Mở ca, kiểm đếm tiền đầu ca, lập phiếu thu chi lẻ, chốt ca cuối ngày, bàn giao két cho đồng nghiệp ca kế tiếp.

## 5. Tiêu Chí Thành Công (Success Criteria)
1. Thực thể `ShiftZReport`, `ShiftCashMovement`, và `Order.ShiftId` được định nghĩa chuẩn xác trong Entity Framework Core và AppDbContext.
2. Công thức chốt ca chuẩn xác:
   $$\text{Tiền lý thuyết (G)} = \text{Đầu ca (A)} + \text{Bán hàng tiền mặt (B)} + \text{Tiền vào (C)} - \text{Tiền ra (D)} - \text{Trả hàng (E)}$$
   $$\text{Chênh lệch} = \text{Tiền thực đếm (H)} - \text{Tiền lý thuyết (G)}$$
   Ràng buộc: $\text{Tiền giữ lại (Retained)} + \text{Tiền nộp két (Dropped)} = \text{Tiền thực đếm (H)}$.
3. Chuỗi tiền liên tục: Ca sau mở sẽ tự động lấy `OpeningFloatExpected = prevShift.RetainedFloatAmount`.
4. 100% Backend Unit Tests và Frontend Build đạt kết quả PASS.
