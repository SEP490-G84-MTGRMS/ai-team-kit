---
verdict: PASS
---

# Test Report: pos-sales-checkout-ui

## Build Verification

| Command | Result | Details |
|---------|--------|---------|
| `tsc -b` | PASS | 0 TypeScript errors |
| `vite build` | PASS | 2201 modules, 472ms, dist output OK |

Build output:
- `dist/index.html` — 1.16 kB
- `dist/assets/index-DZTZ1IGR.css` — 113.92 kB (gzip 19.03 kB)
- `dist/assets/index-DbnBk0BK.js` — 1,037.38 kB (gzip 303.67 kB)

> Warning: chunk > 500 kB — co the dung dynamic import de code-split sau nay.

## UI Test Cases (Manual — Browser localhost:5173/pos)

| # | REQ | Scenario | Ket qua | Ghi chu |
|---|-----|----------|---------|---------|
| 1 | REQ-POS-01 | Bo cuc POS fullscreen: Header hien thi Chi nhanh trung tam, Quay #01, Nguyen Ba Son, phim tat F1-F12 | PASS | Dung layout |
| 2 | REQ-POS-01 | Multi-tab hoa don: Tab Hoa don 1, Hoa don 2 hien thi dung, nut [+] F1 tao tab moi, chuyen tab giu nguyen gio hang | PASS | Khong mat du lieu khi chuyen tab |
| 3 | REQ-POS-02 | Toggle Ban nhanh / Ban thuong hoat dong | PASS | Chuyen doi muot |
| 4 | REQ-POS-02 | Che do Ban thuong: Luoi san pham dang the, loc theo danh muc, phan trang chuan he thong (hien thi X - Y trong tong Z, dropdown rows/page, nut trang) | PASS | Tai su dung phan trang co san |
| 5 | REQ-POS-03 | Bang gio hang: STT, Xoa, Ma hang, Ten mat hang & Quy cach, DVT, So luong, Don gia, Thanh tien, Tuy chon | PASS | Day du cot |
| 6 | REQ-POS-03 | Popover chiet khau mon, canh bao ban duoi gia von kem PIN 8888 | PASS | Modal canh bao hien thi dung |
| 7 | REQ-POS-04 | Tim kiem khach hang F4, hien thi diem tich luy, checkbox Dung diem | PASS | Tru diem chinh xac |
| 8 | REQ-POS-04 | Modal Them khach hang moi: Ma tu dong, Nhom KH, Ho ten, Ngay sinh + Gioi tinh, SDT, Email, Dia chi, Khu vuc (datalist), Phuong/Xa, Ghi chu | PASS | Layout 5 hang x 4 cot |
| 9 | REQ-POS-05 | Bang tinh tien tu dong: Tong tien hang, Giam gia, Khuyen mai, Diem tich luy, Khach can tra | PASS | Tinh toan chinh xac |
| 10 | REQ-POS-05 | Thanh toan Tien mat: nhap tien khach dua, tinh tien thua tu dong | PASS | Hien thi ro rang |
| 11 | REQ-POS-05 | Modal Dynamic VietQR Napas 247 | PASS | QR code va so tien dung |
| 12 | REQ-POS-06 | Mau in Hoa don nhiet K80 chuan 80mm, window.print() | PASS | Nut In bill gan nhat hoat dong |
| 13 | Design | Tone mau Deep Teal #0F766E, font Be Vietnam Pro, nut bo tron theo token :root | PASS | Nhat quan voi design system |
| 14 | Constraint | Khong day commit len GitHub repo MT_GRMS_FRONTEND | PASS | Chi co local commits |

## Acceptance Checklist

- [x] REQ-POS-01: Giao dien POS Fullscreen, Header quay, Multi-Tab hoa don hoat dong doc lap.
- [x] REQ-POS-02: Ho tro 2 che do Ban nhanh (Barcode) va Ban thuong (Touch Screen Catalog co phan trang chuan).
- [x] REQ-POS-03: Bang gio hang day du truong, chinh so luong, popover chiet khau mon, canh bao ban duoi gia von kem ma PIN 8888.
- [x] REQ-POS-04: Tim kiem khach hang F4, hien thi diem tich luy, checkbox tru diem, Modal them khach hang moi.
- [x] REQ-POS-05: Bang tinh tien tu dong, thanh toan Tien mat tinh tien thua, Modal Dynamic VietQR Napas 247.
- [x] REQ-POS-06: Mau in Hoa don nhiet K80 chuan kho 80mm ESC/POS co nut window.print().
- [x] Chuan Design System: Tone mau Deep Teal #0F766E, font Be Vietnam Pro, cac nut bo tron theo token :root.
- [x] Khong day bat ky commit nao len GitHub cua repo MT_GRMS_FRONTEND.

## Loi ton dong

Khong co loi ton dong. Warning duy nhat: chunk JS > 500 kB (co the toi uu bang dynamic import sau).

## Verdict: PASS
