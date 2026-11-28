# Exploration: pos-shift-management-ui

## Hien trang

### POS hien tai
- File: `src/features/pos/pages/PosCheckoutPage.tsx` (446 dong)
- Components: PosHeader, PosCartTable, PosCatalogGrid, PosPaymentPanel, PosReceiptModal + 4 modals
- CSS: `pos.css` (17KB)
- PosHeader hien tai co 3 nut tach biet: "Giu don", "In bill gan nhat", "Chot ca" chiem nhieu khong gian
- Tab hoa don nam cung hang voi barcode search va mode switch, gay chat

### Design System co san
- CSS tokens: `--blue-primary: #0F766E`, `--radius-pill: 9999px`, `--radius-lg: 24px`, `--shadow-card`
- Font: `Be Vietnam Pro` + `JetBrains Mono` cho so lieu
- Pagination pattern: class `admin-pagination-footer`, `admin-page-btn` (SupplierTable.tsx)
- Rule RULE_UI_DESIGN_SYSTEM.md: bat buoc component hoa, bo tron, khong animation nhun nhay

### Mau thiet ke tham khao
- `POS_Quan_Ly_Ca.html`: 2 tab (Phien Ca Hien Tai + Lich Su Dong Ca)
  - Tab 1: Thong tin ca, 4 KPI metrics, doanh thu theo phuong thuc, thu/chi noi bo, bang kiem dem menh gia, doi chieu chenh lech, form ban giao
  - Tab 2: Bo loc thoi gian/thu ngan/chi nhanh, 4 KPI tong hop, bang lich su ca voi pagination
  - Modals: Thu/Chi Ket, Z-Report

## Gia dinh
1. Chua co API backend, dung mock data tuong tu pattern posMockData.ts
2. Route moi /pos/shift hoac tich hop nhu sub-page trong /pos
3. Khong can real-time, chi cap nhat khi load/submit

## Phuong an

### PA-A: Route rieng /pos/shift (Tach biet)
- Tao page `PosShiftPage.tsx` tai route `/pos/shift`
- POS Header cai tien ap dung cho ca 2 page
- Uu: gon, khong anh huong PosCheckoutPage
- Nhuoc: can navigate qua lai giua 2 page

### PA-B: Tich hop vao PosCheckoutPage (Cung page)
- Them state view ('checkout' | 'shift') trong PosCheckoutPage
- "Chot ca" trong hamburger menu chuyen view
- Uu: khong mat context don hang dang lam
- Nhuoc: PosCheckoutPage da 446 dong, them nua se qua lon -> vi pham rule component hoa

### Quyet dinh: PA-A (Route rieng)
- Tao PosShiftPage.tsx tai /pos/shift
- PosHeader cai tien dung chung (hamburger menu, tab xuong duoi, +F1 ngoai)
- "Chot ca" trong hamburger menu navigate sang /pos/shift
- Giu nguyen PosCheckoutPage, chi sua PosHeader

## Rui ro
1. PosHeader thay doi lon co the anh huong POS hien tai -> Test ky
2. Bang kiem dem menh gia can tinh toan chinh xac -> Unit logic rieng
3. Component qua nhieu -> Gioi han o muc can thiet theo rule
