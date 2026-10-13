# Tasks: fe17-cashbook-frontend

## Nhóm 1: Database & Contracts (Đã hoàn tất ở giai đoạn Grill-me)
- [x] T1.1 — Cập nhật thiết kế ERD Draw.io và database-schema.md bổ sung `Balance_After`, `Reference_Doc_Type`, `Is_Automated`, `Counterparty_Type/Name`, `Bank_Name`, `Account_Number`

## Nhóm 2: Frontend Data Types & Mock Service Layer
- [ ] T2.1 — Tạo file `src/features/cashbook/types/cashbook.types.ts` định nghĩa TypeScript interfaces cho CashAccount, LedgerTransaction, FilterParams, ReconciliationDTO (tham chiếu REQ-17.1, REQ-17.4)
- [ ] T2.2 — Xây dựng `src/features/cashbook/services/cashbookService.ts` với mock store lưu trữ tài khoản quỹ, phát sinh giao dịch, tính toán lũy kế `BalanceAfter`, và tự động đồng bộ mock với POS (FE-08) và Expenses (FE-07) (tham chiếu REQ-17.1, REQ-17.5)

## Nhóm 3: Design Tokens & Vanilla CSS Architecture
- [ ] T3.1 — Xây dựng `src/features/cashbook/cashbook.css` chuẩn 100% Vanilla CSS: Deep Teal `#0F766E`, bo góc card `24px`, pill `9999px`, màu trạng thái thu xanh lá / chi đỏ cam, `tabular-nums` tiền tệ (tham chiếu REQ-17.5)

## Nhóm 4: Components Giao Diện Chính
- [ ] T4.1 — Xây dựng `CashAccountsCardSection.tsx` hiển thị danh sách thẻ két tiền mặt và tài khoản ngân hàng kèm số dư tức thời (tham chiếu REQ-17.1)
- [ ] T4.2 — Xây dựng `CashbookFilterToolbar.tsx` thanh lọc KiotViet pill theo Chi nhánh, Tài khoản quỹ, Mốc thời gian, Loại giao dịch (tham chiếu REQ-17.1)
- [ ] T4.3 — Xây dựng `CashbookLedgerTable.tsx` bảng bút toán Sổ quỹ tích hợp component `TablePagination` của dự án, khóa thao tác Sửa/Xóa đối với giao dịch hệ thống `IsAutomated = true` (tham chiếu REQ-17.1, REQ-17.5)

## Nhóm 5: Modals Nghiệp Vụ Chống Âm Quỹ & Đối Soát
- [ ] T5.1 — Xây dựng `CreateReceiptModal.tsx` lập phiếu thu tiền mặt / ngân hàng (tham chiếu REQ-17.2)
- [ ] T5.2 — Xây dựng `CreatePaymentModal.tsx` lập phiếu chi tiền mặt có kiểm tra chặt chẽ quy tắc `GBR-CSH-03` ngăn chặn xuất âm két tiền (tham chiếu REQ-17.3)
- [ ] T5.3 — Xây dựng `CashReconciliationModal.tsx` kiểm kê két tiền mặt, tự động tính chênh lệch, bắt buộc nhập lý do giải trình `GBR-CSH-04` và tự tạo bút toán điều chỉnh `ADJUSTMENT` (tham chiếu REQ-17.4)
- [ ] T5.4 — Xây dựng `CashbookExportModal.tsx` hỗ trợ xuất file Excel CSV UTF-8 có BOM và xem trước bản in khổ A4 (tham chiếu REQ-17.5)

## Nhóm 6: Tích Hợp Trang Chính & Toast Notifications
- [ ] T6.1 — Hoàn thiện trang `CashbookPage.tsx` tích hợp component `AdminToast` của dự án để phản hồi thông báo tức thời (tham chiếu REQ-17.1)
- [ ] T6.2 — Đăng ký route `/store-owner/cashbook` và gắn menu điều hướng trong hệ thống (tham chiếu REQ-17.1)

## Nhóm 7: Kiểm Thử Đơn Vị & Xác Minh
- [ ] T7.1 — Viết bộ test Vitest `src/features/cashbook/__tests__/cashbook.test.ts` kiểm chứng toàn diện logic tính toán số dư lũy kế, lọc dữ liệu, chống âm két và giải trình kiểm kê (tham chiếu REQ-17.1 đến REQ-17.5)
- [ ] T7.2 — Chạy `npm test` và `npm run build` đảm bảo không có lỗi type hoặc lint
