# Tasks: pos-customer-debt-management

- [ ] T1: Mở rộng types/DTOs trong `src/features/pos/types/pos.types.ts` và `inventory.types.ts` (PaymentMethod 'debt', Customer debtLimit/currentDebt/allowDebt, DebtPaymentRecord, InvoiceDTO debt fields) (tham chiếu REQ-01, REQ-04)
- [ ] T2: Bổ sung dữ liệu mẫu khách hàng có hạn mức công nợ và hóa đơn công nợ trong `src/features/pos/mock/posMockData.ts` và `inventoryMockData.ts` (tham chiếu REQ-01, REQ-04)
- [ ] T3: Cập nhật `src/features/pos/components/PosPaymentPanel.tsx` thêm lựa chọn `Ghi nợ (Bán nợ)` và thẻ hiển thị hạn mức công nợ khách hàng (tham chiếu REQ-01)
- [ ] T4: Xây dựng modal cảnh báo vượt hạn mức công nợ (`DebtLimitWarningModal`) và tích hợp vào quy trình thanh toán quầy trong `PosCheckoutPage.tsx` (tham chiếu REQ-02, REQ-03)
- [ ] T5: Cập nhật `src/features/pos/pages/InvoiceManagementPage.tsx`: Thêm bộ lọc hóa đơn Ghi nợ, hiển thị badge Còn nợ, in bill nhiệt K80 có thông tin nợ (tham chiếu REQ-04)
- [ ] T6: Xây dựng modal Thu Nợ Hóa Đơn (`CollectDebtModal`) cho phép thu nợ bằng Tiền mặt/VietQR, cập nhật số dư nợ và lưu lịch sử phiếu thu (tham chiếu REQ-05, REQ-06)
- [ ] T7: Kiểm tra build TypeScript (`npm run build`) đảm bảo 0 lỗi và xác nhận giữ nguyên cam kết không đẩy code lên Git (tham chiếu REQ-06)
