# Design Brief: Khuyến mãi, Voucher & Tích điểm UI

## Cấu trúc file

```
src/features/promotion/
├── pages/
│   ├── PromotionListPage.tsx      # Quản lý Khuyến mại & Chiết khấu
│   ├── VoucherListPage.tsx        # Quản lý Voucher/Coupon
│   └── LoyaltyConfigPage.tsx      # Thiết lập Tích điểm
├── components/
│   ├── PromotionFilterSidebar.tsx # Bộ lọc sidebar dùng chung
│   ├── PromotionTable.tsx         # Bảng dữ liệu KM + accordion
│   ├── PromotionFormModal.tsx     # Modal tạo/sửa khuyến mại
│   ├── VoucherTable.tsx           # Bảng đợt voucher + accordion
│   ├── VoucherBatchModal.tsx      # Modal tạo/sửa đợt voucher
│   ├── VoucherGenerateModal.tsx   # Modal sinh mã voucher
│   ├── LoyaltyConfigForm.tsx     # Form cấu hình tích/tiêu điểm
│   ├── LoyaltyLedgerTable.tsx    # Sổ cái điểm hội viên
│   └── PointAdjustModal.tsx      # Modal điều chỉnh điểm thủ công
├── promotion.css                 # CSS module
└── index.ts                      # Barrel exports
```

## Luồng UI từng trang

### 1. PromotionListPage (`/store-owner/promotions`)
- **Header**: Icon Gift + tiêu đề + nút "Thêm Khuyến Mại" + "Báo cáo KM" + "Xuất file".
- **Sidebar trái**: Filter trạng thái (radio), hiệu lực (radio), hình thức KM (select), chi nhánh (select).
- **Bảng chính**: Mã KM, Tên CT, Từ ngày, Đến ngày, Hình thức, Trạng thái. Click row → accordion chi tiết.
- **Accordion**: Tabs (Thông tin chi tiết, Đơn hàng, Hóa đơn), grid điều kiện/mức giảm, nút Sửa/Xóa/Copy.
- **Modal PromotionFormModal**: Cấu hình thời gian, lịch Flash Sale, quy tắc rule engine (bậc thang), giới hạn.

### 2. VoucherListPage (`/store-owner/vouchers`)
- **Header**: Icon Ticket + tiêu đề + nút "Sinh Mã" + "Đợt Phát Hành Mới" + "In Barcode" + "Xuất file".
- **Sidebar trái**: Filter trạng thái đợt (radio), loại phiếu (radio), hiệu lực (select), chi nhánh (select).
- **Bảng chính**: Mã đợt, Tên đợt, Mệnh giá, SL mã, Đã dùng, Trạng thái, Thao tác.
- **Accordion**: Danh sách mã voucher (barcode, ngày, hạn, mệnh giá, trạng thái).
- **Modals**: VoucherBatchModal (tạo/sửa đợt), VoucherGenerateModal (sinh mã theo cú pháp).

### 3. LoyaltyConfigPage (`/store-owner/loyalty-config`)
- **Header**: Icon Award + tiêu đề + nút "Điều chỉnh điểm" + "Xuất file".
- **Cột trái (460px)**: LoyaltyConfigForm — phương pháp tích điểm, tỷ lệ earning, quy tắc redeem, ngoại lệ.
- **Cột phải**: LoyaltyLedgerTable — danh sách hội viên + accordion lịch sử biến động điểm.
- **Modal**: PointAdjustModal — chọn KH, cộng/trừ điểm, lý do.

## Navigation

Thêm vào `NAV_GROUPS` trong `AppTopNav.tsx`:
```ts
{
  id: 'promotions',
  label: 'Khuyến mãi',
  icon: GiftIcon, // lucide-react: Gift
  children: [
    { label: 'Khuyến mại & Chiết khấu', to: '/store-owner/promotions', badge: 'FE-16' },
    { label: 'Voucher / Coupon', to: '/store-owner/vouchers' },
    { label: 'Tích điểm (Loyalty)', to: '/store-owner/loyalty-config' },
  ],
}
```

## Routes (router.tsx)
```ts
// children của /store-owner
{ path: 'promotions', element: <PromotionListPage /> },
{ path: 'vouchers', element: <VoucherListPage /> },
{ path: 'loyalty-config', element: <LoyaltyConfigPage /> },
```

## Phân quyền (ngoài scope)
Không check role trong change này. Mọi user truy cập được.
