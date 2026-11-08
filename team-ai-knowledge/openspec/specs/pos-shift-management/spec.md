# Spec: pos-shift-management

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-POS-PREORDER-CASHIER-UI-01 — Hiển thị cột Người tạo trên bảng Đơn đặt trước
Bảng danh sách Đơn Đặt Trước & Giữ Kho trên giao diện [`InvoiceManagementPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/InvoiceManagementPage.tsx) MUST có cột "Người tạo", hiển thị rõ ràng tên thu ngân / chủ cửa hàng đã lập đơn nhận cọc, và nếu đơn đã hoàn tất thì hiển thị thêm tên người đã giao hàng.

#### Scenario: Thu ngân xem bảng Đơn đặt trước
- **GIVEN** Đơn đặt trước `PO-2026110801` được tạo bởi `Nguyễn Văn Minh (Nhân viên bán hàng An Nhiên)`.
- **WHEN** Người dùng chuyển sang tab "Đơn Đặt Trước & Giữ Kho" trên trang Quản lý hóa đơn.
- **THEN** Bảng hiển thị cột "Người tạo" với giá trị `Nguyễn Văn Minh (Nhân viên bán hàng An Nhiên)`.

#### Scenario: Đơn đặt trước đã giao hàng hiển thị người hoàn tất
- **GIVEN** Đơn đặt trước `PO-2026110801` được hoàn tất giao hàng bởi thu ngân `Lê Thị Thu Ngân`.
- **WHEN** Xem danh sách đơn đặt trước.
- **THEN** Cột Người tạo hiển thị cả thông tin người lập cọc và người giao hàng: `Tạo: Nguyễn Văn Minh` và `Giao: Lê Thị Thu Ngân`.

---

### Requirement: REQ-POS-PREORDER-CASHIER-SNAPSHOT-02 — Lưu snapshot người tạo và người giao đơn đặt trước
Backend API MUST tiếp nhận `CashierName` trong `PreOrderCreateRequest` để lưu vào `Order.CashierName`, và tiếp nhận `CashierName` trong `PreOrderFulfillRequest` để lưu vào `Order.FulfilledByCashierName` cùng thời gian `Order.FulfilledAtUtc`.

#### Scenario: Thu ngân tạo đơn đặt trước tại quầy
- **GIVEN** Thu ngân `Nguyễn Văn Minh` mở modal Tạo đơn đặt trước, điền cọc 50.000 đ và xác nhận.
- **WHEN** Frontend gọi API `POST /api/v1/orders/pre-orders`.
- **THEN** Backend lưu đơn với `CashierName = "Nguyễn Văn Minh"`, `Status = "PendingPickup"`, `DepositAmount = 50000`.

---

### Requirement: REQ-POS-PREORDER-SHIFT-METRICS-03 — Chuẩn hóa tính tiền két ca khi có đơn đặt cọc
Hàm tính toán chỉ số bán hàng của ca làm việc (`GetShiftSalesMetricsAsync`) MUST chỉ cộng số tiền cọc thực thu (`DepositAmount`) của các đơn ở trạng thái `PendingPickup` vào doanh số ca (`CashSales` hoặc `BankRevenue`), thay vì cộng toàn bộ `FinalAmount`.

#### Scenario: Chốt ca làm việc có phát sinh đơn đặt trước đặt cọc tiền mặt
- **GIVEN** Ca làm việc có vốn đầu ca `OpeningFloat = 1.000.000 đ`.
- **WHEN** Phát sinh 1 đơn đặt trước tổng tiền 500.000 đ, khách cọc tiền mặt 50.000 đ (`DepositAmount = 50.000 đ`, `Status = "PendingPickup"`).
- **THEN** Doanh số tiền mặt của ca `CashSales` được tính đúng là `50.000 đ`, và tiền lý thuyết trong két `ExpectedCash = 1.000.000 + 50.000 = 1.050.000 đ` (khớp chính xác với số tiền mặt thực tế trong két).

---

### Requirement: REQ-POS-PREORDER-FULFILL-SHIFT-04 — Ghi nhận tiền thu phần còn lại vào ca làm việc giao hàng
Khi khách hàng đến nhận hàng và thanh toán phần tiền còn lại (`remainingAmount = FinalAmount - DepositAmount`), hệ thống backend `FulfillPreOrderAsync` MUST tự động ghi nhận số tiền này vào ca làm việc đang mở (`activeShift`) của chi nhánh giao hàng:
- Nếu thanh toán tiền mặt (`CASH`): Tự động tạo một phiếu thu tiền két `ShiftCashMovement` (loại `IN`, danh mục `PREORDER_PICKUP`, số tiền `remainingAmount`) và tăng `activeShift.TotalCashIn`, `activeShift.ExpectedCash`.
- Nếu thanh toán chuyển khoản / QR (`VIETQR`): Tăng `activeShift.TotalBankRevenue += remainingAmount`.

#### Scenario: Giao hàng thu nốt tiền mặt tại ca làm việc hôm sau
- **GIVEN** Đơn đặt trước có tiền còn thiếu phải thu là `450.000 đ`.
- **WHEN** Thu ngân ca hôm sau bấm "Giao hàng & Thu tiền", chọn hình thức Tiền mặt và nhập `amountPaid = 450.000 đ`.
- **THEN** Đơn hàng chuyển sang `Completed`, đồng thời ca làm việc hiện tại của thu ngân được cộng thêm `450.000 đ` vào tiền lý thuyết trong két `ExpectedCash` qua phiếu thu `ShiftCashMovement` hợp lệ, giúp chốt ca khớp 100%.

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

---

### Requirement: REQ-POS-DEBT-COLLECTION-SHIFT-10 — Thu nợ tiền mặt tự động gắn vào ca của thu ngân đang trực
Tại [`CollectDebtModal.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/components/modals/CollectDebtModal.tsx) và [`InvoiceManagementPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/InvoiceManagementPage.tsx):
1. `cashierName` trong modal thu nợ MUST lấy từ thông tin người dùng đang đăng nhập (`user?.fullName`), không hardcode tên cũ.
2. Khi thu nợ bằng tiền mặt (`method == 'CASH'`), hệ thống MUST ghi nhận số tiền thu nợ này vào ca làm việc đang mở của thu ngân đang trực quầy (`ShiftCashMovement` loại `IN`, danh mục `DEBT_COLLECTION` hoặc tăng `activeShift.TotalCashIn`, `activeShift.ExpectedCash`), đảm bảo tiền kiểm đếm thực tế của ca khớp 100% khi chốt ca mà không ảnh hưởng tới người lập đơn ban đầu.

#### Scenario: Thu ngân ca sau thu nợ tiền mặt của đơn hàng do thu ngân ca trước tạo
- **GIVEN** Hóa đơn HD001 được tạo bởi "Thu ngân A" với số tiền nợ 500.000 đ. Nay "Thu ngân B" đang trực ca mở.
- **WHEN** Thu ngân B thực hiện thu nợ 500.000 đ tiền mặt cho hóa đơn HD001.
- **THEN** Sổ nợ của khách được trừ 500.000 đ; Hóa đơn lưu bản ghi thu nợ với người thu là "Thu ngân B"; ca mở của Thu ngân B được ghi nhận phiếu thu tiền mặt 500.000 đ; hóa đơn gốc vẫn giữ nguyên người tạo là "Thu ngân A".

### Requirement: REQ-POS-RETURN-LINE-CONDITION-01 — Bắt buộc phân loại tình trạng hàng trả (Nhập lại kho vs Hàng hỏng/lỗi)
Với mỗi dòng sản phẩm được khách mang đến trả tại modal Đổi / Trả Hàng, hệ thống **MUST** yêu cầu thu ngân chọn tình trạng hàng trả:
1. `Restock` (Nhập lại kho): Sản phẩm còn nguyên bao bì, tem mác, hạn sử dụng đảm bảo. Khi xác nhận, hệ thống **MUST** tự động cộng lại số lượng vào tồn kho khả dụng của chi nhánh và ghi nhận vào thẻ kho lô FEFO.
2. `Damaged` (Hàng lỗi / Hỏng): Sản phẩm rách tem, móp méo, ôi thiu hoặc lỗi kỹ thuật. Khi xác nhận, hệ thống **MUST NOT** cộng vào tồn kho bán hàng khả dụng, mà ghi nhận vào kho hàng hỏng / chờ thanh lý / trả nhà cung cấp.

#### Scenario: Thu ngân nhận hàng trả với sản phẩm còn nguyên vẹn
- **GIVEN** Khách trả 2 hộp "Sữa chua Vinamilk" do mua nhầm, hộp còn nguyên seal, HSD còn dài.
- **WHEN** Thu ngân tick chọn dòng sản phẩm và chọn tình trạng là "Hàng nguyên vẹn (Nhập lại kho bán)".
- **THEN** Sau khi xác nhận trả hàng, tồn kho khả dụng của "Sữa chua Vinamilk" tăng thêm 2 hộp.

#### Scenario: Thu ngân nhận hàng trả bị hư hỏng / quá hạn
- **GIVEN** Khách trả 1 gói "Bánh quy bơ" bị mốc do bao bì rách từ trước.
- **WHEN** Thu ngân tick chọn dòng sản phẩm và chọn tình trạng là "Hàng hỏng / lỗi (Chờ hủy/trả NCC)".
- **THEN** Sau khi xác nhận trả hàng, tồn kho bán hàng khả dụng không tăng, hệ thống ghi nhận 1 gói bánh vào danh mục hàng hỏng chờ xử lý.

---

### Requirement: REQ-POS-RETURN-REASON-MANDATORY-02 — Bắt buộc chọn danh mục lý do đổi trả
Khi thực hiện đổi hoặc trả hàng, hệ thống **MUST** yêu cầu thu ngân chọn Lý do đổi trả từ danh mục chuẩn hóa:
- `DEFECTIVE`: Lỗi do Nhà Sản Xuất (bao bì rách, hỏng, biến chất).
- `WRONG_ITEM`: Thu ngân hoặc khách chọn nhầm mặt hàng.
- `CHANGE_MIND`: Khách đổi ý (chỉ áp dụng đổi sang sản phẩm khác, không hoàn tiền đối với hàng đặc biệt).
- `EXPIRED_NEAR_DATE`: Hàng cận hạn / quá hạn sử dụng sót trên kệ.
- `OTHER`: Lý do khác (bắt buộc nhập ghi chú chi tiết).

#### Scenario: Thu ngân không chọn lý do đổi trả
- **GIVEN** Thu ngân đã chọn mặt hàng trả nhưng chưa chọn lý do đổi trả.
- **WHEN** Bấm nút "Xác nhận Đổi / Trả Hàng".
- **THEN** Hệ thống chặn lại và cảnh báo: *"Vui lòng chọn lý do đổi trả hàng trước khi hoàn tất"*.

---

### Requirement: REQ-POS-PREORDER-RETURN-EXCHANGE-RULES-03 — Quy tắc Đổi/Trả/Hủy cho Đơn Đặt Trước theo 2 Tab
Hệ thống **MUST** phân định rõ quy trình xử lý Đổi / Trả / Hủy đơn đặt trước theo 2 trạng thái và vị trí màn hình tương ứng:

1. **Giai đoạn 1: Đơn chưa nhận hàng (`RESERVED` - nằm tại Tab "Đơn Đặt Trước & Giữ Kho")**:
   - Khách muốn đổi sản phẩm: Cung cấp thao tác "Đổi sản phẩm đặt trước", cho phép điều chỉnh danh sách món hàng đã đặt và cập nhật lại số tiền cọc (bù thêm cọc hoặc hoàn tiền cọc thừa bằng tiền mặt).
   - Khách hoặc Cửa hàng muốn hủy đơn:
     + *Hủy do lỗi cửa hàng* (hết hàng, chậm trễ): Cửa hàng hoàn trả 100% tiền cọc cho khách bằng tiền mặt từ két quầy (`CASH`).
     + *Hủy do khách tự ý bỏ cọc*: Không hoàn cọc, ghi nhận tiền cọc vào thu nhập khác của cửa hàng, hủy giữ kho lô FEFO để hàng quay lại kho bán lẻ.

2. **Giai đoạn 2: Đơn đã nhận hàng (`COMPLETED` - đã sinh Hóa đơn tại Tab "Hóa Đơn Bán Lẻ")**:
   - Các hóa đơn có nguồn gốc từ Đơn đặt trước (`isPreOrderOrder === true`):
     + Khi thu ngân bấm nút "Đổi/Trả" trên hóa đơn này, hệ thống **CHỈ CHO PHÉP ĐỔI SẢN PHẨM KHÁC (EXCHANGE)**, tuyệt đối **KHÔNG CHO PHÉP TRẢ HÀNG LẤY LẠI TIỀN MẶT**.
     + **Ngoại lệ duy nhất**: Cho phép hoàn tiền mặt nếu và chỉ nếu lý do đổi trả được chọn là `DEFECTIVE` (Lỗi do Nhà Sản Xuất) và tại quầy không còn sản phẩm cùng loại để đổi mới.

#### Scenario: Khách yêu cầu trả hàng lấy tiền mặt cho hóa đơn đặt trước không có lỗi
- **GIVEN** Hóa đơn `HD000045` được tạo từ Đơn đặt trước `PO-2026110801` đã hoàn tất bàn giao hôm qua. Khách mang hàng đến xin trả lại lấy tiền vì "không có nhu cầu dùng nữa".
- **WHEN** Thu ngân mở modal Đổi / Trả hàng cho hóa đơn `HD000045` và chọn lý do "Khách đổi ý".
- **THEN** Hệ thống hiển thị thông báo: *"Đơn đặt trước chỉ hỗ trợ Đổi sang sản phẩm khác, không áp dụng hoàn tiền mặt khi sản phẩm không có lỗi từ NSX"*, và vô hiệu hóa nút hoàn tiền mặt, yêu cầu khách chọn sản phẩm đổi mới tương đương giá trị.

#### Scenario: Đơn đặt trước đã nhận bị lỗi nhà sản xuất được hoàn tiền mặt
- **GIVEN** Hóa đơn `HD000045` có sản phẩm đặt trước bị biến chất do lỗi đóng gói của NSX.
- **WHEN** Thu ngân chọn lý do "Lỗi do Nhà Sản Xuất" và quầy hết hàng đổi.
- **THEN** Hệ thống cho phép duyệt hoàn tiền mặt từ két quầy với ghi chú xác nhận lỗi NSX.

---

### Requirement: REQ-POS-RETURN-UNIT-CONVERSION-04 — Đổi/Trả hàng chỉ hoàn tiền mặt từ két và chặn hoàn khi két không đủ
Hệ thống **MUST** loại bỏ hoàn toàn các hình thức hoàn tiền qua Ngân hàng (VietQR) và Cấn trừ vào sổ nợ khi xử lý Đổi / Trả hàng:
1. 100% số tiền cửa hàng hoàn trả lại cho khách (`settlementMethod == 'REFUND_CASH'`) **MUST** được chi trực tiếp từ két tiền mặt của quầy thu ngân trong ca làm việc hiện tại.
2. Hệ thống **MUST** kiểm tra số tiền mặt hiện có trong két quầy (`activeShiftCash`). Nếu số tiền hoàn trả cho khách lớn hơn số tiền mặt hiện có trong két:
   - Hệ thống **MUST** vô hiệu hóa nút "Xác nhận hoàn tiền".
   - Hiển thị cảnh báo rõ ràng: *"Tiền mặt trong két quầy không đủ để hoàn trả (Hiện có: X đ, Cần hoàn: Y đ). Vui lòng lập phiếu nạp thêm tiền vào két quầy để tiếp tục."*
   - Cung cấp nút tiện ích nhanh dẫn đến hoặc kích hoạt modal *"Nạp tiền vào két"* (Phiếu thu loại `IN`).
3. Khi hoàn tất đổi trả có hoàn tiền mặt:
   - Hệ thống **MUST** ghi nhận giảm tiền két ca làm việc tương ứng (tạo giao dịch chi hoàn hàng hoặc tăng chỉ số `CashRefund` của ca).

#### Scenario: Két quầy đủ tiền mặt để hoàn trả khách
- **GIVEN** Ca làm việc có tiền mặt trong két là `1.200.000 đ`. Khách trả hàng và cửa hàng cần hoàn lại `150.000 đ`.
- **WHEN** Thu ngân mở modal Đổi / Trả hàng, kiểm tra số tiền hoàn là `150.000 đ`.
- **THEN** Phương thức hoàn trả hiển thị cố định là "Tiền mặt từ két quầy" (không còn lựa chọn Chuyển khoản hay Sổ nợ), nút "Xác nhận hoàn tiền" kích hoạt bình thường. Khi xác nhận, tiền trong két còn `1.050.000 đ`.

#### Scenario: Két quầy thiếu tiền mặt khi hoàn trả khách
- **GIVEN** Ca làm việc chỉ còn `50.000 đ` tiền mặt trong két. Khách mang hàng đến trả và số tiền cần hoàn lại là `200.000 đ`.
- **WHEN** Thu ngân chọn trả hàng với số tiền `200.000 đ`.
- **THEN** Hệ thống hiển thị thông báo màu đỏ: *"Tiền mặt trong két không đủ (còn 50.000 đ, cần 200.000 đ). Hãy lập phiếu nạp két trước khi hoàn tiền"*, nút "Xác nhận" bị khóa (`disabled`). Thu ngân lập phiếu nạp thêm tiền thì nút xác nhận mới sáng trở lại.

---

## Lịch sử
- 2026-11-08 · `pos-preorder-shift-metrics-and-cashier-tracking` · +0 ~4 -0
- 2026-11-08 · `pos-cash-control-and-pos-ux-refinements` · +0 ~10 -0
- 2026-11-08 · `pos-cash-refund-and-preorder-rules` · +3 ~1 -0
