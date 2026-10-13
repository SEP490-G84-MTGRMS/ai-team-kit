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
