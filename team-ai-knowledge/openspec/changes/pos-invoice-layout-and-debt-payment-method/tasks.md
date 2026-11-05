# Tasks: POS Invoice Layout & Credit Debt Payment Method

- [x] T1 (Frontend - Mapping) — Cập nhật toàn bộ logic ánh xạ đơn hàng trong `InvoiceManagementPage.tsx` nhận diện `CREDIT` và `DEBT`, gán đúng `Ghi nợ`, `debtAmount`, `finalPaidAmount` và `status`. (Tham chiếu: `REQ-POS-INVOICE-01`)
- [x] T2 (Frontend - Filtering) — Cập nhật bộ lọc `paymentMethodFilter === 'DEBT'` bao gồm cả các đơn `CREDIT` và `DEBT`. (Tham chiếu: `REQ-POS-INVOICE-01`)
- [x] T3 (Frontend - Layout) — Cân đối lại độ rộng các cột bảng hóa đơn (`pos-shift-table`), nâng `Mã hóa đơn` lên 180px, `Thao tác` lên 210px, căn chỉnh các cột số tiền thẳng hàng. (Tham chiếu: `REQ-POS-INVOICE-02`)
- [x] T4 (Frontend - Cashier UX) — Xử lý loại bỏ cặp dấu ngoặc đơn rỗng `()` khi `cashierId` rỗng trong dòng chi tiết thu ngân. (Tham chiếu: `REQ-POS-INVOICE-02`)
- [x] T5 (Test) — Chạy kiểm thử tự động `npm test -- pos` và `npm run build`, đảm bảo pass 100%. (Tham chiếu: `REQ-POS-INVOICE-01`, `REQ-POS-INVOICE-02`)
