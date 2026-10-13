# Tasks: supplier-order-dispatch-cutoff

## Frontend
- [x] T1 — Định nghĩa Types và xây dựng Mock Data phong phú gồm 8 NCC mẫu cho Dispatch Hub trong `po.types.ts` và `lib/mockDispatchData.ts` (REQ-01, REQ-03)
- [x] T2 — Xây dựng component `DispatchUrgencyBar.tsx` (Thống kê số lượng, tổng tiền, deadline badges, nút Chốt nhanh các đơn hôm nay) (REQ-01)
- [x] T3 — Xây dựng component `DispatchFilterBar.tsx` (Tab pills lọc theo độ khẩn cấp, ô tìm kiếm NCC realtime) (REQ-02)
- [x] T4 — Xây dựng component `SupplierDispatchCard.tsx` dạng Accordion 2 tầng (Countdown timer, cảnh báo MOV, bảng chi tiết SKU với inline edit số lượng, ghi chú NCC) (REQ-03, REQ-04)
- [x] T5 — Xây dựng component `DispatchConfirmModal.tsx` (Popup xác nhận tóm tắt thông tin trước khi phát hành Purchase Order) (REQ-05)
- [x] T6 — Xây dựng trang chính `SupplierOrderDispatchHubPage.tsx` tích hợp đầy đủ state, thông báo toast và xử lý chốt đơn đơn lẻ & hàng loạt (REQ-01 đến REQ-05)
- [x] T7 — Cấu hình routing trong `src/app/router.tsx` và liên kết trong menu `AppTopNav.tsx` (REQ-01)
- [x] T8 — Cập nhật `src/features/purchase-order/index.ts` để export trang và sub-components (REQ-01)

## Test & Verification
- [x] T9 — Kiểm thử giao diện trên trình duyệt: xác nhận hiển thị chuẩn 3 khu vực, countdown timer, accordion mở rộng/thu gọn, inline edit tính lại tiền, modal xác nhận phát hành PO (REQ-01, REQ-02, REQ-03, REQ-05)
- [x] T10 — Kiểm tra biên dịch dự án (`npm run build`) đảm bảo 100% không có lỗi TypeScript hoặc linting
