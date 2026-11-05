# Tasks: pos-debt-validation-and-receipt-hotline-fix

- [x] T1 — Backend ESC/POS Receipt (`ThermalPrintService.cs`): Xóa dòng `Doi tra trong 24h kem hoa don.`, chuẩn hóa ngắt dòng hotline và thông tin chi nhánh (tham chiếu REQ-POS-PRINT-03, REQ-POS-HOTLINE-04).
- [x] T2 — Frontend Quản lý hóa đơn & Modal Thu Nợ (`InvoiceManagementPage.tsx` & `CollectDebtModal.tsx`): Ẩn nút "Thu nợ" khi hóa đơn đã hết nợ (`debtAmount <= 0`), sửa lỗi HTML5 min-max validation và hiện thông báo đã tất toán (tham chiếu REQ-POS-DEBT-01).
- [x] T3 — Frontend POS Tìm kiếm khách hàng đa tiêu chí (`PosPaymentPanel.tsx` & `PosCheckoutPage.tsx`): Cho phép gõ chữ, tìm kiếm theo Tên (không dấu & có dấu), SĐT và Mã KH; đồng bộ danh sách khách hàng từ CSDL (tham chiếu REQ-POS-CUST-02).
- [x] T4 — Frontend Hóa đơn bán lẻ & Preview (`PosReceiptModal.tsx` & `PosCheckoutPage.tsx`): Xóa 2 dòng thừa chân bill, xóa mã lô nội bộ `(LÔ-FEFO)`, căn chỉnh dòng Tổng cộng và Thành tiền thẳng cột, truyền đúng Hotline chi nhánh (tham chiếu REQ-POS-PRINT-03, REQ-POS-HOTLINE-04).
- [x] T5 — Kiểm thử Tự động & Hồi quy: Chạy test xUnit `MT_GRMS.UnitTests` và Frontend build/test để đảm bảo hệ thống hoạt động ổn định 100%.
