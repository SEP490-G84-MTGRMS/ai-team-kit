# Tasks: grn-detail

## Backend
- [x] B1 — Endpoint `GET /api/v1/goods-receipts/{id}`: Trả về đầy đủ chi tiết phiếu nhập gồm 4 chỉ số số lượng, Lô & HSD, thông tin PO, chi nhánh và nhà cung cấp
- [x] B2 — Endpoint `POST /api/v1/goods-receipts/{id}/complete`: Xử lý hoàn tất phiếu nhập kho:
  - Tăng số lượng tồn kho khả dụng `BranchStocks` theo `AcceptedQty`.
  - Tuyệt đối không cộng hàng từ chối (`RejectedQty`) và giao thừa vào tồn kho.
  - Chuyển trạng thái đơn PO sang `COMPLETED` (loại bỏ `PARTIALLY_RECEIVED` và không tạo backorder theo V1).
  - Cập nhật trạng thái phiếu nhập thành `COMPLETED`.
- [x] B3 — Endpoint `POST /api/v1/goods-receipts/{id}/cancel`: Xử lý hủy phiếu:
  - Chỉ cho phép hủy khi phiếu đang ở trạng thái `DRAFT`.
  - Bắt buộc có lý do hủy (`reason`).
  - Chuyển trạng thái phiếu sang `CANCELLED` và giải phóng PO gốc để có thể lập phiếu nhập lại.
- [x] B4 — Viết Unit Tests tự động (`GoodsReceiptTests.cs`): Kiểm thử hoàn tất thành công, cập nhật kho, chuyển PO sang `COMPLETED`, hủy DRAFT giải phóng PO, chặn hủy phiếu đã COMPLETED (100% tests passed)

## Frontend
- [x] T1 — Mở rộng kiểu dữ liệu trong `grn.types.ts`: bổ sung 4 chỉ số số lượng (`acceptedQty`, `rejectedQty`, `rejectionReason`), `GoodsReceiptBatchDto`, loại bỏ `GrnRemainingOption` thừa (REQ-01, REQ-02, REQ-03)
- [x] T2 — Kết nối `goodsReceiptApi.ts`: tích hợp API `getGoodsReceiptById`, `completeGoodsReceipt`, `cancelGoodsReceipt` với mock fallback an toàn (REQ-01, REQ-05)
- [x] T3 — Xây dựng component `GrnDetailHeaderCard.tsx`: hiển thị thông tin chung, chi nhánh, NCC, PO gốc, người duyệt, tiền hàng, Landed Cost, giảm giá, VAT, tổng công nợ AP và điều khoản thanh toán (REQ-01)
- [x] T4 — Xây dựng component `GrnStockFefoTable.tsx`: bảng Tồn kho & Lô FEFO, hiển thị rõ số lượng chấp nhận cộng vào tồn kho (`AcceptedQty`), tính Phí VC phân bổ/ĐVT, Giá vốn mới, Margin %, badge Catch-weight & Hàng KM (REQ-02)
- [x] T5 — Xây dựng component `GrnPoRemainingTable.tsx`: bảng đối soát 4 chỉ số (Đặt, Nhận, Chấp nhận, Từ chối), hiển thị rõ PO sẽ đóng sang `COMPLETED` (loại bỏ radio backorder theo V1) (REQ-03)
- [x] T6 — Xây dựng component `GrnPostSettingsCard.tsx`: checkbox tạo nợ AP, checkbox in tem dán kệ với số lượng tem tự tính, thông tin hóa đơn/biên bản đính kèm (REQ-04)
- [x] T7 — Xây dựng thanh công cụ `GrnDetailActionBar.tsx` và modal thông báo kết quả duyệt `GrnDetailSuccessModal.tsx` kèm nút Hủy phiếu DRAFT (REQ-05)
- [x] T8 — Xây dựng container page `GoodsReceiptDetailPage.tsx`: tích hợp các sub-components, kết nối luồng duyệt và xem chi tiết theo trạng thái phiếu (`DRAFT` vs `COMPLETED` vs `CANCELLED`) (REQ-01 đến REQ-05)
- [x] T9 — Cập nhật routing trong `src/app/router.tsx` và liên kết điều hướng từ `GoodsReceiptListPage.tsx` và `GoodsReceiptFormPage.tsx` sang `GoodsReceiptDetailPage.tsx` (REQ-06)

## Test & Verification
- [x] T10 — Kiểm thử build Vite/TypeScript, xác minh toàn bộ các scenarios trong specs.md (REQ-01 đến REQ-06)
- [x] T11 — Chạy dotnet test MT_GRMS.UnitTests đạt 100% PASS (64/64 tests)
