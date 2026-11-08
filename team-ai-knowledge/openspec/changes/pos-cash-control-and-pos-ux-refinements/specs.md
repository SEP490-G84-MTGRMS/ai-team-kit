# Đặc tả kỹ thuật (Delta Spec): Tinh chỉnh UX quầy POS và kiểm soát dòng tiền ca

## MODIFIED Requirements

### Requirement: REQ-POS-UI-CLEANUP-01 — Xóa nút Recall & In bill gần nhất khỏi menu POS
Dropdown menu tại [`PosHeader.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/components/PosHeader.tsx) MUST loại bỏ 2 nút "Giữ đơn hàng (Recall)" và "In bill gần nhất". Các props `onHoldOrder` và `onPrintRecent` MUST được dọn dẹp khỏi [`PosCheckoutPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx).

#### Scenario: Thu ngân mở menu điều hướng POS
- **GIVEN** Thu ngân hoặc Chủ cửa hàng đang ở màn hình bán hàng POS.
- **WHEN** Người dùng bấm vào icon Menu mở rộng ở góc trên bên phải.
- **THEN** Menu chỉ hiển thị các mục: "Bàn giao / Chốt ca", "Tra cứu tồn kho & Lô FEFO", "Lịch sử ca", "Về Dashboard" (nếu là Chủ), không còn hiển thị nút "Giữ đơn hàng (Recall)" hay "In bill gần nhất".

---

### Requirement: REQ-POS-CASH-OUT-VALIDATION-02 — Kiểm tra số tiền chi không vượt quá tiền mặt hiện có trong két
Khi người dùng lập phiếu chi két (MovementType = `OUT`), hệ thống MUST kiểm tra số tiền chi không được vượt quá số tiền mặt lý thuyết hiện có trong két (`CurrentAvailableCash = OpeningFloat + CashSales + TotalCashIn - TotalCashOut`). Ràng buộc này MUST được kiểm tra ở cả Frontend ([`CashMovementModal.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/components/modals/CashMovementModal.tsx)) và Backend ([`ShiftService.cs`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_BACKEND/src/MT_GRMS.Application/PosShifts/ShiftService.cs)).

#### Scenario: Thu ngân lập phiếu chi vượt quá tiền mặt trong két
- **GIVEN** Ca làm việc có tiền mặt trong két hiện tại là `300.000 đ`.
- **WHEN** Thu ngân nhập số tiền chi là `500.000 đ` và bấm xác nhận chi.
- **THEN** Giao diện hiển thị cảnh báo lỗi đỏ: "Số tiền chi vượt quá số tiền mặt hiện có trong két (300.000 đ)" và ngăn chặn gửi yêu cầu; nếu gửi qua API, Backend ném `BusinessException("EXCEED_DRAWER_CASH")`.

---

### Requirement: REQ-POS-CASH-DEBT-REMOVED-03 — Xóa nút thu nợ khách hàng khỏi két quầy
Giao diện chọn Loại nghiệp vụ tại [`CashMovementModal.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/components/modals/CashMovementModal.tsx) MUST loại bỏ nút `[+] Thu nợ khách hàng`. Việc thu nợ công nợ khách hàng chỉ được thực hiện tại trang Quản lý hóa đơn thông qua modal thu nợ gắn với khách hàng và hóa đơn nợ cụ thể.

#### Scenario: Thu ngân mở modal thu/chi két
- **GIVEN** Thu ngân mở modal "Thu / Chi Tiền Mặt Tại Két".
- **WHEN** Quan sát các lựa chọn loại nghiệp vụ.
- **THEN** Chỉ còn các lựa chọn: `[-] Chi vặt quầy`, `[↓] Rút két nộp Chủ / Két sắt`, `[+] Nạp thêm tiền lẻ vào két`. Không còn nút `[+] Thu nợ khách hàng`.

---

### Requirement: REQ-POS-RETURN-UNIT-CONVERSION-04 — Đổi/Trả hàng hỗ trợ đơn vị quy đổi và kiểm soát tiền hoàn trả
Tại [`ReturnExchangeModal.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/components/modals/ReturnExchangeModal.tsx):
1. Tiêu đề modal MUST được đổi thành **"Đổi / Trả Hàng"** (xóa bỏ chữ "Chuẩn KiotViet").
2. Bảng sản phẩm khách trả và sản phẩm khách đổi mới MUST hiển thị dropdown chọn Đơn vị tính quy đổi (`UnitName`) từ `product.units` (liên kết bảng `ProductUnits`), tự động cập nhật đơn giá theo đơn vị đã chọn.
3. Nếu phát sinh tiền cửa hàng hoàn trả cho khách bằng tiền mặt (`settlementMethod == 'REFUND_CASH'`), hệ thống MUST kiểm tra số tiền hoàn không vượt quá tiền mặt hiện có trong két quầy. Nếu vượt quá, hiển thị cảnh báo và hướng dẫn thu ngân chọn Hoàn qua VietQR/Chuyển khoản hoặc Cấn trừ vào sổ nợ.

#### Scenario: Thu ngân thực hiện đổi trả hàng với đơn vị quy đổi Vỉ
- **GIVEN** Khách hàng mua 1 Hộp thuốc (1 Hộp = 10 Vỉ), nay mang 3 Vỉ đến đổi.
- **WHEN** Thu ngân mở modal Đổi / Trả hàng, chọn đơn vị "Vỉ" và số lượng "3".
- **THEN** Hệ thống tính giá mua theo đơn vị Vỉ và tính chính xác số tiền hoàn trả tương ứng 3 Vỉ.

#### Scenario: Két không đủ tiền mặt khi hoàn trả tiền cho khách
- **GIVEN** Khách trả hàng và cửa hàng phải hoàn lại `500.000 đ` tiền mặt, nhưng két quầy chỉ còn `200.000 đ`.
- **WHEN** Thu ngân chọn "Hoàn tiền mặt".
- **THEN** Hệ thống hiển thị cảnh báo: "Tiền mặt trong két quầy không đủ (còn 200.000 đ). Vui lòng chọn Hoàn tiền qua VietQR, cấn trừ công nợ hoặc nạp thêm tiền vào két quầy".

---

### Requirement: REQ-POS-INVOICE-ACCORDION-CLEANUP-05 — Xóa nút trùng lặp trong chi tiết hóa đơn
Tại [`InvoiceManagementPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/InvoiceManagementPage.tsx), khi mở rộng accordion xem chi tiết mặt hàng của hóa đơn, hệ thống MUST loại bỏ cụm 3 nút thao tác `Đổi / Trả Hàng`, `Hủy Hóa Đơn Này`, `In Hóa Đơn Nhiệt K80`.

#### Scenario: Người dùng bấm mở rộng dòng hóa đơn
- **GIVEN** Người dùng ở trang Quản lý hóa đơn.
- **WHEN** Người dùng bấm vào một dòng hóa đơn để xem danh sách mặt hàng bên trong.
- **THEN** Accordion chỉ hiển thị bảng danh sách sản phẩm, số lượng, đơn giá, mã lô FEFO và ghi chú; không hiển thị lặp lại 3 nút thao tác ở thanh tiêu đề con.

---

### Requirement: REQ-POS-SHIFT-GUARD-06 — Khóa thanh toán POS khi chưa mở ca làm việc
Tại [`PosCheckoutPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx), khi `currentShift` là `null` (chưa có ca làm việc nào đang mở cho chi nhánh quầy), hệ thống MUST:
1. Chặn bấm nút "Thanh toán" hoặc thêm món vào giỏ hàng.
2. Hiển thị thông báo hoặc mở modal yêu cầu kiểm đếm và bấm "Mở ca làm việc" trước.

#### Scenario: Thu ngân vào màn POS khi chưa mở ca
- **GIVEN** Chưa có ca làm việc nào mở cho chi nhánh.
- **WHEN** Thu ngân bấm nút Thanh toán hoặc thêm món hàng.
- **THEN** Hệ thống chặn thanh toán và thông báo: "Bạn chưa mở ca làm việc. Vui lòng kiểm đếm tiền đầu ca và mở ca trước khi bán hàng!".

---

### Requirement: REQ-POS-SHIFT-DETAILS-MODAL-07 — Bổ sung nút Xem chi tiết phiên ca & Lý do chênh lệch
Tại [`PosShiftPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/PosShiftPage.tsx), trong bảng "Danh Sách Các Phiên Ca Bán Hàng", cột Thao tác MUST có nút "Xem chi tiết" (icon con mắt / Z-Report). Khi bấm vào, mở modal hiển thị đầy đủ:
- Thông tin ca (Mã ca, Chi nhánh, Thời gian mở - đóng, Thu ngân trực ca).
- Doanh thu theo phương thức thanh toán (Tiền mặt, VietQR, Công nợ).
- Tiền kiểm đếm thực tế, Tiền lý thuyết, Chênh lệch và **Lý do giải trình chênh lệch** (`differenceReason` / `notes`).
- Lịch sử các phiếu thu/chi phát sinh trong ca.

#### Scenario: Chủ cửa hàng xem ca có chênh lệch âm tiền
- **GIVEN** Một ca làm việc chốt ca bị lệch âm `-50.000 đ`.
- **WHEN** Chủ cửa hàng bấm nút "Xem chi tiết" của ca đó trên bảng lịch sử.
- **THEN** Modal chi tiết ca mở ra, hiển thị rõ ràng giải trình của thu ngân trong ô Lý do chênh lệch cùng danh sách các phiếu thu/chi đã lập trong ca.

---

### Requirement: REQ-POS-OWNER-HANDOVER-HIDDEN-08 — Ẩn nút Nhận ca đối với Chủ cửa hàng
Tại [`PosShiftPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/PosShiftPage.tsx), nếu người dùng đang đăng nhập có role `STORE_OWNER` hoặc `ADMIN`, nút "Nhận ca" MUST được ẩn đi (chỉ hiển thị nút "Xem chi tiết").

#### Scenario: Chủ cửa hàng xem danh sách ca chờ bàn giao
- **GIVEN** Người dùng đăng nhập là Chủ cửa hàng (`STORE_OWNER`).
- **WHEN** Xem danh sách các ca làm việc.
- **THEN** Không xuất hiện nút màu vàng "Nhận ca" trên dòng ca, tránh gây hiểu nhầm về vai trò nhận ca của thu ngân.

---

### Requirement: REQ-POS-CASH-CONTROL-CLEANUP-09 — Xóa khối ca bàn giao tồn đọng ở trang Hạn Mức Két POS
Tại [`StorePosCashControlPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/StorePosCashControlPage.tsx), hệ thống MUST xóa bỏ khối "Ca Làm Việc Chờ Phê Duyệt Bàn Giao" để trang tập trung hoàn toàn vào Cấu hình hạn mức chi và Phê duyệt các phiếu rút/chi két vượt hạn mức.

#### Scenario: Chủ cửa hàng truy cập trang Hạn Mức & Duyệt Chi Két POS
- **GIVEN** Chủ cửa hàng mở trang "Hạn Mức & Duyệt Chi Két POS".
- **WHEN** Cuộn xem nội dung trang.
- **THEN** Trang chỉ gồm: Thẻ thống kê phiếu chi, Bảng cấu hình hạn mức chi tự động theo chi nhánh, và Bảng danh sách phiếu chi két chờ phê duyệt; không còn khối hiển thị ca bàn giao trùng lặp.
