# Tasks: grn-detail

## Frontend
- [x] T1 — Mở rộng kiểu dữ liệu trong `grn.types.ts`: bổ sung `GrnRemainingOption`, `GrnDetailItemDetail`, `GrnPostSettings` (REQ-01, REQ-02, REQ-03)
- [x] T2 — Mở rộng mock data trong `mockGrnData.ts`: bổ sung thông tin chi tiết đầy đủ cho phiếu mẫu `GRN-20260926-001` và các phiếu có hàng thiếu (REQ-01, REQ-02, REQ-03)
- [x] T3 — Xây dựng component `GrnDetailHeaderCard.tsx`: hiển thị thông tin chung, chi nhánh, NCC, PO gốc, người duyệt, tiền hàng, Landed Cost, giảm giá, VAT, tổng công nợ AP và điều khoản thanh toán (REQ-01)
- [x] T4 — Xây dựng component `GrnStockFefoTable.tsx`: bảng Tồn kho & Lô FEFO, tính Phí VC phân bổ/ĐVT, Giá vốn mới, Margin %, badge Catch-weight & Hàng KM (REQ-02)
- [x] T5 — Xây dựng component `GrnPoRemainingTable.tsx`: bảng so khớp Đặt vs Nhận, radio `backorder` vs `cancel` cho từng dòng thiếu, tự động preview trạng thái PO (`PARTIALLY_RECEIVED` vs `COMPLETED`) (REQ-03)
- [x] T6 — Xây dựng component `GrnPostSettingsCard.tsx`: checkbox tạo nợ AP, checkbox in tem dán kệ với số lượng tem tự tính, thông tin hóa đơn/biên bản đính kèm (REQ-04)
- [x] T7 — Xây dựng thanh công cụ `GrnDetailActionBar.tsx` và modal thông báo kết quả duyệt `GrnDetailSuccessModal.tsx` (REQ-05)
- [x] T8 — Xây dựng container page `GoodsReceiptDetailPage.tsx`: tích hợp các sub-components, kết nối luồng duyệt và xem chi tiết theo trạng thái phiếu (`DRAFT` vs `CONFIRMED`) (REQ-01 đến REQ-05)
- [x] T9 — Cập nhật routing trong `src/app/router.tsx` và liên kết điều hướng từ `GoodsReceiptListPage.tsx` và `GoodsReceiptFormPage.tsx` sang `GoodsReceiptDetailPage.tsx` (REQ-06)

## Test & Verification
- [x] T10 — Kiểm thử build Vite/TypeScript, xác minh toàn bộ các scenarios trong specs.md (REQ-01 đến REQ-06)
