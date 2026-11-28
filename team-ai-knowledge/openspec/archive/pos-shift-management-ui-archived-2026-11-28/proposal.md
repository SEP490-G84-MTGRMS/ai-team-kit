# Proposal: pos-shift-management-ui

## Van de

He thong POS hien tai chua co man hinh dong ca (Shift Close) va lich su dong ca, thu ngan khong the chot so lieu ket ca, kiem dem tien mat, doi chieu chenh lech va ban giao cho ca tiep theo. Ngoai ra, header POS dang bi chat vi 3 nut "Giu don", "In bill gan nhat", "Chot ca" chiem nhieu khong gian, va khu vuc tab hoa don chua can doi.

## Muc tieu

1. Xay dung man hinh Dong Ca (Shift Close): hien thi KPI ca (tien dau ca, doanh thu, tien mat, chuyen khoan), bang doanh thu theo phuong thuc thanh toan, bang thu/chi noi bo, bang kiem dem tien mat theo menh gia, doi chieu chenh lech, thong tin ban giao ca sau, nut Dong Ca & Ban Giao.
2. Xay dung tab Lich Su Dong Ca (Shift History): bang lich su cac phien ca voi bo loc thoi gian/thu ngan/chi nhanh, KPI tong hop, nut xem Z-Report.
3. Cai tien UX POS Header:
   - Gom 3 nut (Giu don, In bill gan nhat, Chot ca) vao menu hamburger (3 gach) de giai phong khong gian.
   - Doi khu vuc tab hoa don xuong ben duoi cho can bang.
   - Giu nut + [F1] luon hien thi ben ngoai de de them hoa don moi.
4. Modal Thu/Chi Ket noi bo va Modal Bao Cao Z-Report.

## Pham vi

### In scope
- Man hinh Dong Ca voi form kiem dem tien mat, doi chieu, ban giao ca
- Tab Lich Su Dong Ca voi bo loc va bang lich su
- Modal Thu/Chi Ket, Modal Z-Report
- Cai tien POS Header: hamburger menu, doi tab xuong duoi, +F1 luon hien
- Route /pos/shift (hoac tich hop vao /pos voi navigation)
- Mock data tuong ung

### Out of scope
- Tich hop API Backend thuc te
- Logic phan quyen thu ngan vs quan ly
- Dong bo real-time voi may in bill

## Nguoi dung lien quan
- Thu ngan (cashier): thuc hien kiem dem, chot ca, ban giao
- Quan ly cua hang (store manager): xem lich su dong ca, bao cao so quy, giam sat chenh lech ket

## Tieu chi thanh cong
1. Man hinh Dong Ca hien thi dung 4 KPI metrics, bang doanh thu theo phuong thuc, bang thu chi noi bo, bang kiem dem menh gia tu dong tinh tong, doi chieu chenh lech, form ban giao.
2. Tab Lich Su hien thi bang lich su ca voi bo loc thoi gian/nhan vien/chi nhanh.
3. POS Header duoc cai tien: 3 nut gom vao hamburger menu, tab hoa don doi xuong duoi, nut +F1 luon hien.
4. Modal Z-Report va Thu/Chi Ket hoat dong dung.
5. npm run build thanh cong 0 loi.
