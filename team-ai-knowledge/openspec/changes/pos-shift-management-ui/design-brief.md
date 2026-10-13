# Design Brief: pos-shift-management-ui

## 1. Cai tien POS Header (ap dung cho toan bo /pos/*)

### Layout moi:
```
+------------------------------------------------------------------+
| [Logo Quay Ban Hang]  [Barcode Search F2]  [Mode Switch]  [☰]  [Thu ngan badge] |
+------------------------------------------------------------------+
| [Hoa don 1 x] [Hoa don 2 x] [+ F1]                              |
+------------------------------------------------------------------+
```

### Chi tiet:
- **Hamburger menu (☰)**: Gom 3 nut "Giu don", "In bill gan nhat", "Chot ca" vao dropdown menu
  - Click ☰ -> hien dropdown voi 3 muc
  - "Chot ca" navigate sang /pos/shift
- **Tab hoa don doi xuong hang 2**: Tao 1 hang rieng ben duoi header chinh, chua danh sach tab + nut +F1
- **Nut + [F1] luon hien ben ngoai**: Nam cuoi danh sach tab, khong bi an khi scroll
- CSS: Su dung `--blue-primary`, `--radius-pill`, font `Be Vietnam Pro`

## 2. Man hinh Dong Ca (PosShiftPage.tsx)

### Route: /pos/shift

### Bo cuc 2 tab:
- Tab 1: **Phien Ca Ban Hang & Ban Giao** (Thu ngan)
- Tab 2: **Bao Cao So Quy & Lich Su Dong Ca** (Quan Ly Store)

### Tab 1 - Phien Ca Hien Tai:
#### Thong tin ca:
- Ca lam viec, bat dau, thoi gian truc, quan ly giam sat, trang thai

#### 4 KPI Metrics Cards (component rieng: ShiftKpiCard):
| Card | Nhan | Gia tri mau | Mau so |
|------|------|-------------|--------|
| 1 | Tien mat dau ca (Float) | 1.500.000 d | --blue-primary |
| 2 | Tong doanh thu ban hang | 18.450.000 d | --green-money |
| 3 | Tien mat thu thuc te quay | 8.250.000 d | --orange-accent |
| 4 | Tien chuyen khoan / The / Vi | 10.050.000 d | --blue-primary |

#### Cot trai: Doanh thu theo phuong thuc + Thu/Chi noi bo
- Component: ShiftRevenueTable (phuong thuc, so don, so tien, ty trong)
- Component: ShiftCashInOutTable (ma phieu, gio, loai, ly do, so tien)
- Pagination: tai su dung pattern `admin-pagination-footer`

#### Cot phai: Kiem dem tien mat + Ban giao
- Component: CashCountingTable (menh gia, so to, thanh tien - input number)
- Component: CashReconciliation (ly thuyet vs thuc te vs chenh lech)
- Component: ShiftHandoverForm (nguoi nhan, tien de lai, tien nop, ghi chu, nut Dong Ca)

### Tab 2 - Lich Su Dong Ca:
#### Bo loc: ShiftHistoryFilter
- Moc thoi gian: Hom nay, Hom qua, 7 ngay, Thang nay, Date picker
- Thu ngan: dropdown
- Chi nhanh: dropdown

#### 4 KPI Cards (tai su dung ShiftKpiCard)
#### Bang lich su: ShiftHistoryTable
- Cot: Ma ca, Chi nhanh, Thoi gian, Thu ngan, Tien dau ca, Doanh thu, Tien thuc dem, Chenh lech, Bao cao
- Pagination: tai su dung pattern `admin-pagination-footer`, `admin-page-btn`

### Modals:
- CashInOutModal: Lap phieu thu/chi ket (loai, so tien, ly do, nut Luu)
- ZReportModal: Bao cao Z-Report dang in bill K80 (chieu rong 320px, monospace, nut In)

## 3. CSS
- File: `pos.css` (them section moi cho shift management)
- Tat ca class su dung token tu `:root` trong index.css
- So lieu tien te: font `JetBrains Mono` voi `font-variant-numeric: tabular-nums`
- Bo tron: nut pill `9999px`, card `24px`, modal `24px`
- Khong animation nhun nhay, chi hover nhe mau/border/shadow

## 4. File Structure
```
src/features/pos/
  components/
    PosHeader.tsx          (sua: hamburger menu, tab xuong duoi)
    ShiftKpiCard.tsx       (moi)
    ShiftRevenueTable.tsx  (moi)
    ShiftCashInOutTable.tsx (moi)
    CashCountingTable.tsx  (moi)
    CashReconciliation.tsx (moi)
    ShiftHandoverForm.tsx  (moi)
    ShiftHistoryFilter.tsx (moi)
    ShiftHistoryTable.tsx  (moi)
    modals/
      CashInOutModal.tsx   (moi)
      ZReportModal.tsx     (moi)
  pages/
    PosCheckoutPage.tsx    (khong doi)
    PosShiftPage.tsx       (moi)
  types/
    pos.types.ts           (them shift types)
  mock/
    posMockData.ts         (them shift mock data)
  pos.css                  (them shift styles)
```
