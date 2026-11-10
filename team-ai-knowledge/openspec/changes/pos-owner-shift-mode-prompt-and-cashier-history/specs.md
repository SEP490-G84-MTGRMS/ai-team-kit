# Đặc Tả Delta (Specs): pos-owner-shift-mode-prompt-and-cashier-history

> Change: pos-owner-shift-mode-prompt-and-cashier-history  
> Capability: `pos-shift-management`  
> Schema: feature  
> Dependencies: EXP-2026-11-10-001  

---

## ADDED Requirements

### Requirement: REQ-OWNER-SHIFT-MODE-01 Modal Lựa Chọn Chế Độ Bán Cho Chủ Cửa Hàng Khi Có Ca Mở
Hệ thống **MUST** kiểm tra trạng thái ca làm việc của chi nhánh hiện tại khi người dùng có vai trò `STORE_OWNER` hoặc `ADMIN` truy cập màn hình POS bán hàng (`/pos/sales`):
1. Nếu chi nhánh đang có một ca làm việc ở trạng thái `Open`:
   - Hệ thống **MUST** hiển thị modal lựa chọn chế độ bán hàng (`OwnerShiftModeModal`) nếu chủ cửa hàng chưa chọn trong phiên làm việc hiện tại của chi nhánh đó.
   - Modal **MUST** cung cấp 2 tùy chọn rõ ràng:
     - **Tùy chọn A ("Bỏ chung ngăn kéo quầy")**: Bán chung vào ca của nhân viên. Tiền mặt vào ngăn kéo quầy (`Till`), cập nhật `ExpectedCash` của ca, ghi nhận chủ cửa hàng vào `ShiftParticipants`.
     - **Tùy chọn B ("Tự giữ / Cất két sắt")**: Bán riêng độc lập. Tiền mặt vào két sắt (`Safe`), không tính vào doanh thu ca, tiền ngăn kéo quầy nhân viên giữ nguyên.
2. Hệ thống **SHALL** hiển thị Badge chế độ trên POS Header (`PosHeader`) thể hiện chế độ đang chọn kèm nút chuyển đổi nhanh (`[Đổi chế độ]`), cho phép chủ cửa hàng thay đổi chế độ bán bất cứ lúc nào mà không cần tải lại trang.
3. Nếu chi nhánh không có ca nào mở, hệ thống **MUST** tự động chuyển sang chế độ Bán riêng (Két sắt) và không hiển thị modal popup làm phiền người dùng.

#### Scenario: Chủ cửa hàng vào POS tại chi nhánh có ca nhân viên đang mở
- **GIVEN** Chi nhánh "Ba Đình" đang có ca bán hàng mở với mã `SHF-20261110-001` do nhân viên "Nguyễn Văn A" trực
- **WHEN** Người dùng "Chủ cửa hàng Trần Văn B" đăng nhập và truy cập màn hình POS
- **THEN** Hệ thống hiển thị modal `OwnerShiftModeModal` thông báo *"Chi nhánh đang có ca bán hàng hoạt động"* kèm 2 tùy chọn "Bỏ chung ngăn kéo quầy" và "Tự giữ / Cất két sắt".

#### Scenario: Chủ cửa hàng chọn "Bỏ chung ngăn kéo quầy"
- **GIVEN** Modal `OwnerShiftModeModal` đang hiển thị
- **WHEN** Chủ cửa hàng nhấn chọn "Bỏ chung ngăn kéo quầy"
- **THEN** Modal đóng lại, Header POS hiển thị badge `🛒 Bán vào ca #SHF-20261110-001 (Ngăn kéo quầy)`, các đơn hàng tạo tiếp theo sẽ được gắn `shiftId = SHF-20261110-001`.

#### Scenario: Chủ cửa hàng chọn "Tự giữ / Cất két sắt"
- **GIVEN** Modal `OwnerShiftModeModal` đang hiển thị
- **WHEN** Chủ cửa hàng nhấn chọn "Tự giữ / Cất két sắt"
- **THEN** Modal đóng lại, Header POS hiển thị badge `🔒 Bán riêng (Két sắt)`, các đơn hàng tạo tiếp theo sẽ có `shiftId = null`.

#### Scenario: Chủ cửa hàng vào POS tại chi nhánh chưa có ca mở
- **GIVEN** Chi nhánh "Cầu Giấy" hiện không có ca làm việc nào mở
- **WHEN** Chủ cửa hàng truy cập màn hình POS
- **THEN** Hệ thống không hiển thị modal popup, tự động cho phép bán hàng chế độ Shiftless với badge `🔒 Bán riêng (Chưa có ca mở)`.

---

### Requirement: REQ-OWNER-SHIFT-ROUTING-02 Định Tuyến Dòng Tiền & Ghi Nhận Đơn Hàng Theo Chế Độ Chọn
Khi xử lý đơn hàng POS tại endpoint `POST /api/orders`:
1. Nếu người gọi là `STORE_OWNER` hoặc `ADMIN`:
   - Nếu `request.ShiftId` có giá trị và trùng với ca mở hiện tại:
     - Hệ thống **MUST** liên kết đơn hàng với `ShiftId` này.
     - Với thanh toán tiền mặt (`CASH`), hệ thống **MUST** ghi nhận vào tài khoản `Till` của quầy và cộng doanh thu vào `activeShift.ExpectedCash`.
     - Hệ thống **MUST** tự động ghi nhận chủ cửa hàng vào bảng `ShiftParticipants` của ca với vai trò tương ứng (`STORE_OWNER` / `ADMIN`).
   - Nếu `request.ShiftId` là `null` hoặc không truyền:
     - Hệ thống **MUST** thiết lập `order.ShiftId = null`.
     - Với thanh toán tiền mặt (`CASH`), hệ thống **MUST** ghi nhận vào tài khoản `Safe` (Két sắt chi nhánh) theo cơ chế `REQ-OWNER-SHIFTLESS-04`.
     - Hệ thống **MUST NOT** làm thay đổi `activeShift.ExpectedCash` và không thêm chủ cửa hàng vào `ShiftParticipants`.
2. Nếu người gọi là `STAFF`:
   - Bắt buộc phải có ca mở tại chi nhánh, toàn bộ đơn hàng gán `shiftId = activeShift.Id` và tiền mặt vào `Till`.

#### Scenario: Đơn hàng tiền mặt của chủ cửa hàng khi chọn bán chung ca
- **GIVEN** Chi nhánh có ca mở `activeShift` với `ExpectedCash = 1.000.000 đ`
- **WHEN** Chủ cửa hàng thanh toán đơn hàng tiền mặt trị giá `200.000 đ` với `shiftId = activeShift.Id`
- **THEN** Đơn hàng lưu thành công với `ShiftId = activeShift.Id`, tài khoản `Till` nhận `200.000 đ`, `activeShift.ExpectedCash` tăng lên `1.200.000 đ`, chủ cửa hàng xuất hiện trong `ShiftParticipants`.

#### Scenario: Đơn hàng tiền mặt của chủ cửa hàng khi chọn bán riêng
- **GIVEN** Chi nhánh có ca mở `activeShift` với `ExpectedCash = 1.000.000 đ`
- **WHEN** Chủ cửa hàng thanh toán đơn hàng tiền mặt trị giá `300.000 đ` với `shiftId = null`
- **THEN** Đơn hàng lưu thành công với `ShiftId = null`, tài khoản `Safe` nhận `300.000 đ`, `activeShift.ExpectedCash` vẫn giữ nguyên `1.000.000 đ`.

---

### Requirement: REQ-SHIFT-PARTICIPANT-TRACKING-03 Tự Động Ghi Nhận & Hiển Thị Đầy Đủ Nhân Viên Tham Gia Ca
1. Khi mở ca (`OpenShiftAsync`), hệ thống **MUST** tự động truy vấn danh sách tất cả nhân viên có lịch làm việc trong ngày tại chi nhánh đó và nạp vào danh sách `ShiftParticipants` ban đầu của ca.
2. Khi nhân viên phát sinh đơn hàng trong ca, hệ thống **MUST** đảm bảo nhân viên đó tồn tại trong `ShiftParticipants`.
3. Màn hình Lịch sử chốt ca (`/pos/shift`, `/store-owner/shifts`) và modal Bàn giao quầy **MUST** hiển thị toàn bộ danh sách nhân viên tham gia ca dưới dạng các badges riêng biệt kèm nhãn vai trò, không được cắt cụt hoặc chỉ hiển thị 1 nhân viên duy nhất.

#### Scenario: Hiển thị đầy đủ nhân viên trong lịch sử ca
- **GIVEN** Ca `SHF-001` có 3 người tham gia: "Thu ngân A", "Thu ngân B", "Chủ cửa hàng C"
- **WHEN** Người dùng xem bảng Lịch sử chốt ca hoặc mở modal Bàn giao quầy
- **THEN** Cột nhân viên trực hiển thị đầy đủ 3 badges cho "Thu ngân A", "Thu ngân B" và "Chủ cửa hàng C".

---

### Requirement: REQ-POS-FONT-STANDARDIZATION-04 Chuẩn Hóa Font Số Tự Nhiên Toàn Bộ POS
1. Hệ thống **MUST** sử dụng phông chữ `Be Vietnam Pro` (`var(--font-sans)`) kết hợp thuộc tính `font-variant-numeric: tabular-nums` cho toàn bộ hiển thị số tiền, giá sản phẩm và các ô nhập tiền mặt trên màn hình POS.
2. Hệ thống **MUST NOT** áp dụng phông chữ monospace có số 0 chấm giữa (`JetBrains Mono`) lên các thành phần giá bán sản phẩm (`.pos-product-price`) và ô nhập tiền mặt (`pos-modal-dialog input.font-mono`).

#### Scenario: Hiển thị giá sản phẩm trên thẻ POS
- **GIVEN** Sản phẩm "Nước khoáng Lavie 500ml" có giá `10.000 đ`
- **WHEN** Hiển thị trên lưới danh mục POS
- **THEN** Giá hiển thị là `10.000 đ` với các chữ số '0' tròn trơn tự nhiên, không có dấu chấm ở giữa.

---

## Acceptance Checklist
- [ ] Chủ cửa hàng vào POS tại chi nhánh có ca mở: modal hiển thị và cho chọn 2 chế độ.
- [ ] Chọn bán vào ca: đơn hàng gắn `shiftId`, tiền vào `Till`, `ExpectedCash` tăng, chủ được thêm vào participants.
- [ ] Chọn bán riêng: đơn hàng `shiftId = null`, tiền vào `Safe`, `ExpectedCash` quầy không đổi.
- [ ] POS Header có badge hiển thị chế độ và nút đổi nhanh chế độ bất kỳ lúc nào.
- [ ] Chi nhánh không có ca mở: chủ bán riêng tự động, không hiện popup phiền toái.
- [ ] Lịch sử chốt ca và modal Bàn giao quầy hiển thị đầy đủ badges cho mọi nhân viên tham gia ca.
- [ ] Toàn bộ giá sản phẩm và ô nhập tiền mặt hiển thị số 0 tròn bình thường không chấm giữa.
