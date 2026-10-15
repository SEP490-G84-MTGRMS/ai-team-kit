# Tasks: grn-form

## Frontend
- [ ] T1 — Mở rộng kiểu dữ liệu `grn.types.ts`: bổ sung `GrnFormData`, `GrnCostSummary`, `PaymentTerm`, `PaymentMethod`, và DTO liên quan (REQ-01, REQ-04)
- [ ] T2 — Mở rộng `mockGrnData.ts`: bổ sung danh sách PO đã chốt (`MOCK_AVAILABLE_POS`) sẵn sàng nhập kho kèm danh sách SKU chi tiết (REQ-01)
- [ ] T3 — Xây dựng component `GrnFormHeaderCard.tsx`: Thông tin chi nhánh, Mã GRN tự sinh, Dropdown chọn PO gốc, Tên/Mã NCC, Ngày giờ, Hóa đơn NCC, Điều khoản thanh toán (REQ-01)
- [ ] T4 — Xây dựng component `GrnProductEntryTable.tsx`: Ô quét Barcode/SKU, Bảng kiểm đếm SL đặt vs SL thực nhận, tính chênh lệch `differenceQty`, nhập Mã Lô (Batch No) & HSD (EXP Date), cảnh báo FEFO cận date < 30 ngày (REQ-02, REQ-03, REQ-06)
- [ ] T5 — Xây dựng component `GrnCostSummaryCard.tsx`: Ghi chú nhập kho, input Landed Cost (phí vận chuyển), Chiết khấu, Thuế VAT (%), tự động tính Grand Total (REQ-04)
- [ ] T6 — Xây dựng component `GrnFormActionBar.tsx`: Fixed Bottom Bar với các action Hủy bỏ, Lưu nháp (Draft), Hoàn tất nhập kho (Confirmed), Hoàn tất & In tem (REQ-05)
- [ ] T7 — Xây dựng modal xác nhận lệch hàng `GrnMismatchConfirmModal.tsx` và modal xem trước tem in `GrnPrintPreviewModal.tsx` (REQ-05)
- [ ] T8 — Xây dựng container page `GoodsReceiptFormPage.tsx`: Tích hợp các sub-components, kết nối logic state kiểm đếm, hỗ trợ query param `?poCode=...`, chế độ xem chi tiết phiếu cũ (REQ-01 đến REQ-06)
- [ ] T9 — Cập nhật router `src/app/router.tsx` và liên kết điều hướng từ `GoodsReceiptListPage.tsx`: Bấm "+ Nhập kho từ PO" hoặc "Nhập kho ngay" chuyển hướng sang `GoodsReceiptFormPage` (REQ-01, REQ-05)

## Test & Verification
- [ ] T10 — Kiểm thử build Vite/TypeScript, xác minh toàn bộ các scenarios trong specs.md (REQ-01 đến REQ-06)
