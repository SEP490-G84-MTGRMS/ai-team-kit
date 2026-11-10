# Đặc Tả Delta (Specs): pos-owner-shift-mode-prompt-and-cashier-history

> Change: pos-owner-shift-mode-prompt-and-cashier-history  
> Capability: `pos-shift-management`  
> Schema: feature  
> Dependencies: EXP-2026-11-10-001  

---

## ADDED Requirements

### Requirement: REQ-OWNER-SHIFT-MODE-01 Modal Lựa Chọn Chế Độ Bán Cho Chủ Cửa Hàng Khi Có Ca Mở
Hệ thống **MUST** kiểm tra trạng thái ca làm việc của chi nhánh hiện tại khi người dùng có vai trò `STORE_OWNER` hoặc `ADMIN` truy cập màn hình POS bán hàng (`/pos/sales`):
1. **Kiểm tra ca hoạt động**:
   - Nếu chi nhánh đang có ca làm việc ở trạng thái `Open`:
     - Hệ thống kiểm tra giá trị đã lưu trong `sessionStorage` theo key `mtgrms_owner_shift_mode_${branchId}`.
     - Nếu chưa có lựa chọn: Hệ thống **MUST** hiển thị modal `OwnerShiftModeModal` với thuộc tính chặn đóng tự do (`maskClosable={false}`, `closable={false}`) để buộc chủ cửa hàng xác nhận rõ ràng 1 trong 2 chế độ:
       - **Chế độ 1 ("Bỏ chung ngăn kéo quầy")** (`mode = 'attach'`): Bán chung vào ca quầy. Đơn hàng gửi `shiftId = activeShift.id`. Tiền mặt đưa vào ngăn kéo quầy (`Till`), tự động phản ánh vào doanh số ca khi tính `ExpectedCash`, và ghi nhận chủ cửa hàng vào `ShiftParticipants`.
       - **Chế độ 2 ("Tự giữ / Cất két sắt")** (`mode = 'shiftless'`): Bán riêng độc lập. Đơn hàng gửi `shiftId = null`. Tiền mặt ghi nhận vào Két sắt (`Safe`), tiền ngăn kéo quầy giữ nguyên.
     - Nếu người dùng đã chọn trước đó trong session của chi nhánh: Hệ thống tự động áp dụng chế độ tương ứng.
2. **Badge trạng thái & Nút đổi chế độ trên Header**:
   - Header POS **MUST** hiển thị badge trạng thái chế độ bán của chủ cửa hàng:
     - Nếu `attach`: Badge Teal `🛒 Bán vào ca #{shiftCode} (Ngăn kéo quầy)` kèm nút `[Đổi chế độ]`.
     - Nếu `shiftless`: Badge Slate `🔒 Bán riêng (Két sắt)` kèm nút `[Đổi chế độ]`.
   - Khi bấm `[Đổi chế độ]`, modal `OwnerShiftModeModal` hiển thị lại để chuyển đổi tức thì.
3. **Chi nhánh chưa có ca mở**:
   - Nếu chi nhánh không có ca nào đang `Open`, hệ thống **MUST** tự động thiết lập chế độ Bán riêng (`shiftless`), hiển thị badge `🔒 Bán riêng (Chưa có ca mở)` và không bật popup làm phiền.
4. **Xử lý khi ca bị đóng giữa chừng (Shift Closing Fallback)**:
   - Nếu ca làm việc chuyển sang trạng thái `Closing` hoặc `Closed` trong khi chủ cửa hàng đang ở chế độ `attach`, giao diện POS Header **MUST** tự động hủy chế độ `attach`, chuyển về `shiftless` (`🔒 Bán riêng (Ca đã đóng)`), xóa cache session của ca đó và hiển thị thông báo toast: *"Ca làm việc vừa kết thúc. Hệ thống đã chuyển về chế độ bán riêng vào Két sắt."*

#### Scenario: Chủ cửa hàng vào POS tại chi nhánh có ca nhân viên đang mở
- **GIVEN** Chi nhánh "Ba Đình" đang có ca mở `SHF-20261110-001`
- **WHEN** Chủ cửa hàng truy cập POS và chưa chọn chế độ cho chi nhánh này
- **THEN** Modal `OwnerShiftModeModal` hiển thị bắt buộc chọn giữa "Bỏ chung ngăn kéo quầy" và "Tự giữ / Cất két sắt".

#### Scenario: Chủ cửa hàng chọn "Bỏ chung ngăn kéo quầy"
- **GIVEN** Modal `OwnerShiftModeModal` đang hiển thị
- **WHEN** Chủ cửa hàng chọn "Bỏ chung ngăn kéo quầy"
- **THEN** Key `mtgrms_owner_shift_mode_{branchId}` được lưu là `'attach'`, Header POS hiển thị `🛒 Bán vào ca #SHF-20261110-001 (Ngăn kéo quầy)`, các đơn hàng tiếp theo gửi `shiftId = activeShift.id`.

#### Scenario: Chủ cửa hàng chọn "Tự giữ / Cất két sắt"
- **GIVEN** Modal `OwnerShiftModeModal` đang hiển thị
- **WHEN** Chủ cửa hàng chọn "Tự giữ / Cất két sắt"
- **THEN** Key `mtgrms_owner_shift_mode_{branchId}` được lưu là `'shiftless'`, Header POS hiển thị `🔒 Bán riêng (Két sắt)`, các đơn hàng tiếp theo gửi `shiftId = null`.

#### Scenario: Ca bị thu ngân đóng giữa chừng khi chủ đang bán chung ca
- **GIVEN** Chủ cửa hàng đang ở chế độ `attach` với ca `SHF-001`
- **WHEN** Thu ngân tiến hành đóng ca `SHF-001`
- **THEN** POS tự động chuyển chế độ sang `shiftless`, các đơn tạo sau đó không bị lỗi gắn ca đóng mà đi vào Két sắt `Safe`.

---

### Requirement: REQ-OWNER-SHIFT-ROUTING-02 Định Tuyến Dòng Tiền & Kiểm Soát Validation Đơn Hàng
Tại API endpoint `POST /api/orders`:
1. **Kiểm tra tính hợp lệ của `request.ShiftId`**:
   - Nếu `request.ShiftId.HasValue`:
     - Hệ thống **MUST** kiểm tra chi nhánh có `activeShift` không và `activeShift.Id == request.ShiftId.Value`.
     - Nếu không có ca mở hoặc ca đang ở trạng thái `Closing` / `Closed` hoặc không khớp chi nhánh, hệ thống **MUST** từ chối với `BusinessException("SHIFT_CLOSED_OR_INVALID", "Ca làm việc đã kết thúc hoặc không hợp lệ. Vui lòng kiểm tra lại.")`.
2. **Định tuyến dòng tiền mặt (`PaymentMethod == "CASH"`)**:
   - Nếu đơn hàng có `ShiftId` hợp lệ (kể cả do chủ cửa hàng gửi lên):
     - Hệ thống **MUST** ghi nhận tiền vào tài khoản `Till` (Két quầy) của chi nhánh.
     - Doanh thu đơn hàng tự động tính vào doanh số tiền mặt của ca (phản ánh qua công thức tính `ExpectedCash` động của `ShiftService`).
     - Hệ thống **MUST** đảm bảo ghi nhận người tạo đơn vào bảng `ShiftParticipants` của ca (với `UserId`, `FullName`, `UserName`).
   - Nếu đơn hàng có `ShiftId == null` và người gọi là `STORE_OWNER` hoặc `ADMIN`:
     - Hệ thống **MUST** ghi nhận tiền mặt vào tài khoản `Safe` (Két sắt) của chi nhánh theo `REQ-OWNER-SHIFTLESS-04`.
     - Doanh thu này hoàn toàn tách biệt khỏi ca quầy của nhân viên, không tính vào `ExpectedCash` ca và không thêm vào `ShiftParticipants`.
3. **Quy tắc phân quyền**:
   - Người gọi là `STAFF` bắt buộc phải có ca mở tại chi nhánh, không được phép gửi `shiftId = null`.

#### Scenario: Chủ cửa hàng tạo đơn tiền mặt gắn ca mở hợp lệ
- **GIVEN** Chi nhánh có ca mở `SHF-001`
- **WHEN** Chủ cửa hàng gửi request tạo đơn tiền mặt `200.000 đ` kèm `shiftId = SHF-001`
- **THEN** Đơn hàng được tạo thành công, tài khoản `Till` nhận `200.000 đ`, chủ cửa hàng được ghi nhận trong `ShiftParticipants` của `SHF-001`.

#### Scenario: Chủ cửa hàng gửi shiftId của ca đã đóng
- **GIVEN** Ca `SHF-001` đã đóng
- **WHEN** Chủ cửa hàng gửi request tạo đơn với `shiftId = SHF-001`
- **THEN** Hệ thống từ chối tạo đơn, trả về mã lỗi `SHIFT_CLOSED_OR_INVALID`.

#### Scenario: Chủ cửa hàng tạo đơn tiền mặt bán riêng (shiftless)
- **GIVEN** Chi nhánh có hoặc không có ca mở
- **WHEN** Chủ cửa hàng gửi request tạo đơn tiền mặt `300.000 đ` với `shiftId = null`
- **THEN** Đơn hàng được tạo với `ShiftId = null`, tài khoản `Safe` nhận `300.000 đ`, ca quầy không bị ảnh hưởng.

---

### Requirement: REQ-SHIFT-PARTICIPANT-TRACKING-03 Tự Động Ghi Nhận & Hiển Thị Đầy Đủ Nhân Viên Tham Gia Ca
1. **Schema tương thích không Migration (Zero Migration)**:
   - Sử dụng các trường sẵn có của `ShiftParticipant` (`ShiftId`, `UserId`, `UserName`, `FullName`, `JoinedAtUtc`, `LastActiveAtUtc`). Không thêm cột `Role` mới vào DB để đảm bảo toàn vẹn dữ liệu và tránh migration phát sinh.
   - Nhãn định danh được lưu trữ linh hoạt qua `FullName` / `UserName` (ví dụ: `"Chủ cửa hàng: Nguyễn Văn A"` hoặc `"Thu ngân: Trần Thị B"`).
2. **Ghi nhận tự động**:
   - Khi mở ca (`OpenShiftAsync`), hệ thống tự động truy vấn danh sách tất cả nhân viên có lịch làm việc trong ngày tại chi nhánh (`GetBranchCashierSchedulesAsync`) và nạp vào `ShiftParticipants`.
   - Khi bất kỳ nhân viên hoặc chủ cửa hàng phát sinh đơn hàng trong ca, backend tự động ghi nhận vào `ShiftParticipants` nếu chưa có.
3. **Hiển thị trên giao diện**:
   - Màn hình Lịch sử chốt ca (`/pos/shift`, `/store-owner/shifts`) và modal Bàn giao quầy **MUST** hiển thị toàn bộ nhân viên trong ca dưới dạng các badges bo tròn độc lập (`p.fullName || p.userName`), không cắt ngắn chuỗi.

#### Scenario: Hiển thị danh sách nhân viên tham gia ca
- **GIVEN** Ca `SHF-001` có 2 nhân viên và 1 chủ cửa hàng cùng tham gia bán
- **WHEN** Mở màn hình Lịch sử chốt ca hoặc modal Bàn giao quầy
- **THEN** Giao diện hiển thị đầy đủ 3 badges tương ứng với tên của từng người.

---

### Requirement: REQ-POS-FONT-STANDARDIZATION-04 Chuẩn Hóa Font Số Tự Nhiên (Bảo Vệ Template In Hóa Đơn)
1. **Khoanh vùng phạm vi đổi font số**:
   - Hệ thống **MUST** áp dụng font `Be Vietnam Pro` (`var(--font-sans)`) kèm thuộc tính `font-variant-numeric: tabular-nums` cho các trường hiển thị giá tiền sản phẩm trên POS catalog (`.pos-product-price`), tổng tiền giỏ hàng, bảng số liệu ca và ô nhập tiền mặt (`.pos-modal-dialog input.font-mono`, `.pos-shift-page-root input.font-mono`).
   - Các chữ số '0' trên các thành phần này hiển thị số tròn bình thường, không có dấu chấm ở giữa.
2. **Bảo toàn phông chữ in hóa đơn nhiệt**:
   - Các khu vực template in nhiệt ESC/POS K80/K58 (`.pos-receipt-paper`, `.pos-receipt-preview`) **MUST GIỮ NGUYÊN** phông chữ monospace (`JetBrains Mono`, `Consolas`, `monospace`) để đảm bảo các cột độ dài ký tự cố định không bị thụt thò hay xô lệch khi in ấn.

#### Scenario: Hiển thị giá sản phẩm trên thẻ POS
- **GIVEN** Sản phẩm có giá `55.000 đ`
- **WHEN** Hiển thị trên thẻ sản phẩm POS
- **THEN** Chữ số '0' trong `55.000` là hình oval tròn chuẩn không có chấm tâm.

#### Scenario: In hóa đơn nhiệt
- **GIVEN** Người dùng hoàn tất đơn hàng và xem trước hóa đơn in nhiệt
- **WHEN** Hóa đơn được render trong `.pos-receipt-paper`
- **THEN** Các cột số lượng, đơn giá và thành tiền thẳng hàng tuyệt đối nhờ phông chữ monospace.

---

## Acceptance Checklist
- [ ] Chủ cửa hàng vào POS tại chi nhánh có ca mở: modal hiển thị và chặn bấm ngoài backdrop để buộc chọn rõ ràng.
- [ ] Session key lưu trữ theo chi nhánh (`mtgrms_owner_shift_mode_{branchId}`).
- [ ] Khi ca đóng giữa phiên, POS tự động fallback về Bán riêng và toast thông báo.
- [ ] Backend kiểm tra chặt chẽ `request.ShiftId`: từ chối nếu ca không hợp lệ hoặc đã đóng.
- [ ] Không phát sinh migration DB mới (tận dụng `FullName`/`UserName` cho `ShiftParticipants`).
- [ ] Doanh thu tiền mặt của đơn gắn ca phản ánh chính xác vào công thức tính `ExpectedCash` động.
- [ ] Lịch sử ca và Bàn giao quầy hiển thị đầy đủ mọi nhân viên trực ca dạng badges.
- [ ] Giá tiền và ô nhập tiền POS hiển thị số 0 tròn bình thường; template in hóa đơn nhiệt giữ nguyên monospace.
