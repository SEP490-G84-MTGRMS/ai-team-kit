# Tasks: pos-sales-checkout-ui

## Types & Mock Data
- [x] T1 — Định nghĩa Types và Mock Data chuẩn ERD trong `src/features/pos/types/pos.types.ts` và `src/features/pos/mock/posMockData.ts` (REQ-POS-01, REQ-POS-04)

## Modals
- [x] T2 — Xây dựng bộ Modals nghiệp vụ: Thêm khách hàng, Dynamic VietQR Napas 247, Thêm nhanh hàng hóa, Cảnh báo bán dưới giá vốn kèm PIN Quản lý, Chiết khấu đơn hàng trong `src/features/pos/components/modals/` (REQ-POS-03, REQ-POS-04, REQ-POS-05)

## Components Quầy POS
- [x] T3 — Xây dựng `PosHeader.tsx` (thông tin quầy, multi-tab hóa đơn F1, chuyển chế độ bán nhanh/thường, giữ đơn, phím tắt) (REQ-POS-01, REQ-POS-02)
- [x] T4 — Xây dựng `PosCartTable.tsx` (bảng giỏ hàng chi tiết, tăng giảm số lượng, popover chiết khấu món, xóa món) (REQ-POS-03)
- [x] T5 — Xây dựng `PosCatalogGrid.tsx` (lưới danh mục cảm ứng Touch Screen, lọc theo nhóm hàng, tái sử dụng phân trang có sẵn) (REQ-POS-02)
- [x] T6 — Xây dựng `PosPaymentPanel.tsx` (tìm kiếm khách hàng F4, điểm tích lũy, bảng tính tiền, Tiền mặt F8 tính tiền thừa, chọn VietQR, nút Thanh toán) (REQ-POS-04, REQ-POS-05)
- [x] T7 — Xây dựng Mẫu in Hóa đơn nhiệt K80 `PosReceiptModal.tsx` chuẩn 80mm ESC/POS kèm nút `window.print()` và mã VietQR chân bill (REQ-POS-06)

## Page & Routing
- [x] T8 — Tích hợp `PosCheckoutPage.tsx`, stylesheet `pos.css`, cập nhật route `/pos` trong `src/app/router.tsx` và export public API tại `src/features/pos/index.ts` (REQ-POS-01 đến REQ-POS-06)

## Build & Kiểm chứng
- [x] T9 — Kiểm thử toàn diện giao diện, chạy `npm run build` trên `MT_GRMS_FRONTEND` xác nhận 0 lỗi (Acceptance checklist)
