# Tasks: POS Debt Checkout, Print Decoupling & Multi-Lot FEFO

- [x] T1 (DB) — Bổ sung các cột công nợ `LastRepaymentAtUtc`, `Notes`, `RowVersion` cho bảng `Customers` trong CSDL PostgreSQL và cập nhật `init-db.sql`. (Tham chiếu: `REQ-POS-DEBT-01`)
- [x] T2 (Frontend - UX) — Cập nhật `PosCartTable.tsx` và `posOrderApi.ts` bỏ hiển thị vị trí kệ sách dưới tên mặt hàng, làm sạch hiển thị và đồng bộ UTF-8 giỏ hàng POS. (Tham chiếu: `REQ-POS-PRINT-02`)
- [x] T3 (Frontend - Decoupling) — Đảm bảo `PosCheckoutPage.tsx` thực hiện lưu đơn hàng thành công trước khi gửi lệnh in nền `printDirect`, lỗi in không làm gián đoạn đơn. (Tham chiếu: `REQ-POS-PRINT-02`)
- [x] T4 (Backend - Logic) — Xác minh thuật toán FEFO đa lô trong `OrderService.cs` cấn trừ liên hoàn tuần tự qua nhiều lô theo hạn dùng gần nhất. (Tham chiếu: `REQ-POS-FEFO-03`)
- [x] T5 (Test) — Chạy toàn bộ kiểm thử tự động `MT_GRMS.UnitTests` (347 tests) và frontend vitest (`npm test -- pos`), đảm bảo 100% PASS. (Tham chiếu: `REQ-POS-DEBT-01`, `REQ-POS-FEFO-03`)
