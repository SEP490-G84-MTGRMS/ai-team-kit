# Specs: pos-shift-management-ui

## API / Contract (Giao dien & Cau truc du lieu)
| Thanh phan | Endpoint / Handler | Request DTO | Response DTO | Loi / Validation |
|---|---|---|---|---|
| Tinh tong kiem dem tien mat | `calculateCashCount(denominations)` | `{ denomId: string, count: number }[]` | `{ totalSheets: number, totalAmount: number }` | count < 0 -> 0 |
| Doi chieu chenh lech ket | `reconcileCash(theoretical, actual)` | `{ theoretical: number, actual: number }` | `{ diff: number, status: 'match' \| 'surplus' \| 'deficit' }` | — |
| Dong ca & Ban giao | `handleCloseShift(payload)` | `CloseShiftRequest` | `ShiftCloseResult` | Chua kiem dem -> canh bao; nguoi nhan trong |
| Lap phieu thu/chi ket | `handleCashInOut(payload)` | `CashInOutRequest` | `CashTransaction` | So tien <= 0; ly do trong |

---

## ADDED Requirements

### Requirement: REQ-SHIFT-01 Cai tien POS Header: Hamburger Menu & Tab Hoa Don
He thong MUST cai tien POS Header tren man hinh /pos va /pos/shift: gom 3 nut "Giu don", "In bill gan nhat", "Chot ca" vao mot menu hamburger (icon 3 gach ngang). Tab hoa don (Hoa don 1, Hoa don 2...) MUST duoc doi xuong hang rieng phia duoi header chinh. Nut + [F1] MUST luon hien thi ben ngoai cuoi danh sach tab, khong bi an khi co nhieu tab.

#### Scenario: Mo hamburger menu va chon Chot ca
- GIVEN Thu ngan dang o man hinh POS /pos.
- WHEN Thu ngan click icon hamburger (3 gach).
- THEN Dropdown menu MUST hien thi 3 muc: Giu don, In bill gan nhat, Chot ca.
- WHEN Thu ngan chon "Chot ca".
- THEN He thong MUST navigate sang /pos/shift.

#### Scenario: Nut +F1 luon hien thi
- GIVEN Man hinh POS co 5 tab hoa don.
- WHEN Thu ngan cuon ngang trong danh sach tab.
- THEN Nut + [F1] MUST luon hien thi o vi tri cuoi cung, khong bi an.

---

### Requirement: REQ-SHIFT-02 Man hinh Phien Ca Ban Hang - Thong tin ca & KPI Metrics
He thong MUST hien thi thong tin phien ca hien tai (ca lam viec, thoi gian bat dau, thoi gian truc, quan ly giam sat, trang thai) va 4 the KPI: Tien mat dau ca (Float), Tong doanh thu ban hang, Tien mat thu thuc te quay, Tien chuyen khoan/The/Vi. Moi KPI card la component rieng (ShiftKpiCard) su dung design tokens co san.

#### Scenario: Hien thi thong tin ca va KPI
- GIVEN Thu ngan truy cap /pos/shift.
- THEN He thong MUST hien thi: Ca Sang (07:00 - 15:00), bat dau 25/09/2026 07:00:15, thoi gian truc 7 gio 55 phut, trang thai "Dang Hoat Dong".
- AND 4 KPI cards MUST hien thi voi so lieu va mau sac tuong ung theo design tokens.

---

### Requirement: REQ-SHIFT-03 Doanh Thu Theo Phuong Thuc & Thu/Chi Noi Bo
He thong MUST hien thi bang doanh thu phan bo theo phuong thuc thanh toan (Tien mat, VietQR, The, Vi, Diem loyalty, Voucher) voi cot: phuong thuc, so don, so tien, ty trong. He thong cung MUST hien thi bang thu/chi tien mat noi bo tai quay (ma phieu, gio, loai giao dich, ly do, so tien) voi pagination tai su dung pattern `admin-pagination-footer`.

#### Scenario: Xem doanh thu theo phuong thuc
- GIVEN Thu ngan o tab "Phien Ca Ban Hang".
- THEN Bang doanh thu MUST hien thi it nhat 6 phuong thuc voi tong cong o dong cuoi.
- AND Bang thu/chi noi bo MUST co pagination hien thi "X - Y tren Z phieu".

---

### Requirement: REQ-SHIFT-04 Kiem Dem Tien Mat Theo Menh Gia & Doi Chieu Chenh Lech
He thong MUST hien thi bang kiem dem tien mat voi 9 menh gia (500k, 200k, 100k, 50k, 20k, 10k, 5k, 2k, 1k), moi menh gia co input so to, tu dong tinh thanh tien va tong. He thong MUST doi chieu giua tien mat ly thuyet tren he thong va tien mat thuc te kiem dem, hien thi trang thai Khop/Thua/Thieu.

#### Scenario: Kiem dem va doi chieu
- GIVEN Thu ngan nhap so to cho tung menh gia.
- WHEN Tong tien kiem dem = tien ly thuyet (vd: 4.600.000 d).
- THEN Hien thi "Khop 100% (0 d)" mau xanh la.
- WHEN Tong tien kiem dem < tien ly thuyet.
- THEN Hien thi "Thieu -X d" mau do.

---

### Requirement: REQ-SHIFT-05 Form Ban Giao Ca & Dong Ca
He thong MUST hien thi form ban giao gom: dropdown nguoi nhan ban giao, input tien de lai ket ca sau, tien mat nop lai quan ly (tu dong tinh = thuc dem - de lai), textarea ghi chu ban giao. Co 2 nut: "In Bao Cao Z-Report" va "Dong Ca & Ban Giao" (xac nhan confirm truoc khi dong).

#### Scenario: Dong ca thanh cong
- GIVEN Thu ngan da kiem dem tien mat, chon nguoi nhan, nhap tien de lai.
- WHEN Bam nut "Dong Ca & Ban Giao".
- THEN He thong MUST hien thi confirm dialog.
- WHEN Thu ngan xac nhan.
- THEN He thong MUST thong bao "Da dong ca va ban giao thanh cong!".

---

### Requirement: REQ-SHIFT-06 Tab Lich Su Dong Ca (Bao Cao So Quy)
He thong MUST hien thi tab "Bao Cao So Quy & Lich Su Dong Ca" voi: bo loc (moc thoi gian nhanh + date picker, dropdown thu ngan, dropdown chi nhanh), 4 KPI tong hop (tong thu tien mat, tong chi/nop, ton quy, ty le khop ket), bang lich su ca (ma ca, chi nhanh, thoi gian, thu ngan, tien dau ca, doanh thu, tien thuc dem, chenh lech, nut Z-Report) voi pagination chuan `admin-pagination-footer`.

#### Scenario: Loc lich su theo thoi gian va thu ngan
- GIVEN Quan ly o tab Lich Su Dong Ca.
- WHEN Chon "7 ngay qua" va thu ngan "Nguyen Ba Son".
- THEN Bang lich su MUST chi hien thi cac ca cua Nguyen Ba Son trong 7 ngay gan nhat.
- AND Pagination hien thi "Dang hien thi X - Y trong tong Z ca".

---

### Requirement: REQ-SHIFT-07 Modal Thu/Chi Ket Noi Bo & Modal Z-Report
He thong MUST co 2 modal:
1. Modal Thu/Chi Ket: form loai phieu (Thu/Chi dropdown), so tien (input number), ly do (textarea), nut Huy va Luu.
2. Modal Z-Report: bao cao ket ca dang in bill K80 (320px, monospace JetBrains Mono) voi thong tin cua hang, thong tin ca, doanh thu, thu chi, doi chieu ket, nut In (window.print()).

#### Scenario: In Z-Report
- GIVEN Thu ngan bam nut "Bao Cao Z-Report".
- THEN Modal Z-Report MUST hien thi voi chieu rong 320px, font monospace.
- WHEN Bam "In Ra May In Bill K80".
- THEN He thong MUST goi window.print().

---

## Acceptance checklist
- [ ] REQ-SHIFT-01: POS Header cai tien: hamburger menu gom 3 nut, tab hoa don xuong duoi, +F1 luon hien.
- [ ] REQ-SHIFT-02: Thong tin ca va 4 KPI metrics cards hien thi dung design tokens.
- [ ] REQ-SHIFT-03: Bang doanh thu theo phuong thuc va bang thu/chi noi bo voi pagination chuan.
- [ ] REQ-SHIFT-04: Bang kiem dem menh gia tu dong tinh, doi chieu chenh lech dung.
- [ ] REQ-SHIFT-05: Form ban giao ca voi confirm dialog va thong bao thanh cong.
- [ ] REQ-SHIFT-06: Tab lich su dong ca voi bo loc, KPI tong hop, bang lich su + pagination.
- [ ] REQ-SHIFT-07: Modal Thu/Chi Ket va Modal Z-Report K80 voi window.print().
- [ ] Chuan Design System: token --blue-primary #0F766E, font Be Vietnam Pro, JetBrains Mono cho so lieu, bo tron pill/24px, khong animation.
- [ ] Component hoa: moi the/bang/modal la component rieng theo RULE_UI_DESIGN_SYSTEM.
- [ ] npm run build thanh cong 0 loi.

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: pos-shift-ui-role-and-cash-approval -->
# Specs: pos-shift-ui-role-and-cash-approval

## ADDED Requirements

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

## Acceptance Checklist
- [ ] Role check hoạt động chuẩn xác: Owner không bị popup chặn, Cashier bị popup chặn nếu chưa mở ca.
- [ ] Header POS hiển thị icon Chuông + badge số lượng pending đối với Owner; hiển thị trạng thái ca + Thu/Chi két đối với Cashier.
- [ ] Modal mở ca hiển thị đúng $A_{expected}$ kế thừa từ ca trước và cho phép nhập $A$.
- [ ] Modal thu chi két tự động kiểm tra ngưỡng 200k; nếu vượt ngưỡng hiển thị cảnh báo và chuyển thành `PendingApproval`.
- [ ] Drawer duyệt chi của Owner cho phép Duyệt, Từ chối kèm lý do, Xác nhận `CashDrop` và chỉnh nhanh hạn mức.
- [ ] Modal chốt ca có bảng 9 mệnh giá tiền mặt, đối soát $G$ vs $H$, ràng buộc $Retained + Dropped = H$, và chặn chốt ca khi còn phiếu `PendingApproval`.
- [ ] Trang cài đặt thanh toán `StorePaymentConfigPage.tsx` có Card cài đặt hạn mức duyệt chi két.
- [ ] Build Frontend (`npm run build`) và Unit Test Backend (`dotnet test`) đều đạt 100% PASS.
