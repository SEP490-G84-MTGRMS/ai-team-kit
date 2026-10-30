# Tasks: grn-form

## Backend
- [x] B1 — Xây dựng DTOs & Commands (`GoodsReceiptDtos.cs`): Hỗ trợ 4 chỉ số số lượng (`OrderedQty`, `ReceivedQty`, `AcceptedQty`, `RejectedQty`), `RejectionReason`, chi tiết lô `GoodsReceiptBatchLineDto`, `PoLookupOption`
- [x] B2 — Cập nhật Repository (`IGoodsReceiptRepository.cs` / `GoodsReceiptRepository.cs`): Hỗ trợ eager load `Supplier`, `Branch`, `Product`, kiểm tra trùng PO đang xử lý (`GetActiveReceiptByPoIdAsync`)
- [x] B3 — Hoàn thiện Business Logic (`GoodsReceiptService.cs`):
  - Ràng buộc 4 chỉ số: `0 <= AcceptedQty <= ReceivedQty <= OrderedQty`.
  - Chặn nhập vượt PO: Nếu giao thừa `ReceivedQty > OrderedQty`, chỉ chấp nhận tối đa `OrderedQty`, phần thừa ghi nhận ngoại lệ.
  - Bắt buộc lý do từ chối (`RejectionReason`) khi `RejectedQty > 0` và tuyệt đối không cộng hàng lỗi vào tồn kho.
  - Kiểm tra Lô & HSD: Bắt buộc khi sản phẩm có `HasBatches = true`, HSD >= ngày nhận hàng, cảnh báo cận date <= 30 ngày.
  - Cập nhật tồn kho `BranchStocks`: Chỉ tăng số lượng theo `AcceptedQty`.
  - Cập nhật trạng thái đơn PO: Chuyển thẳng sang `COMPLETED` khi Goods Receipt hoàn tất (loại bỏ `PARTIALLY_RECEIVED` và backorder theo V1).
  - Hủy phiếu DRAFT: Bắt buộc có lý do, chuyển trạng thái sang `CANCELLED` và giải phóng PO.
- [x] B4 — Mở Controller Endpoints (`GoodsReceiptsController.cs`): `GET /api/v1/goods-receipts/po-lookup`, `GET /api/v1/goods-receipts/po-details/{poId}`, `POST /api/v1/goods-receipts`, `POST /api/v1/goods-receipts/{id}/complete`, `POST /api/v1/goods-receipts/{id}/cancel`
- [x] B5 — Viết bộ Unit Tests (`GoodsReceiptTests.cs`): 6 kịch bản kiểm thử toàn diện, chạy thành công 100% (64/64 tests passed)

## Frontend
- [x] T1 — Mở rộng kiểu dữ liệu `grn.types.ts`: bổ sung `GrnFormData`, `GrnCostSummary`, `PaymentTerm`, `PaymentMethod`, 4 chỉ số số lượng (`acceptedQty`, `rejectedQty`, `rejectionReason`), và `GoodsReceiptBatchDto` (REQ-01, REQ-04)
- [x] T2 — Mở rộng `mockGrnData.ts` & `goodsReceiptApi.ts`: kết nối REST API backend kèm fallback an toàn, danh sách PO khả dụng (REQ-01)
- [x] T3 — Xây dựng component `GrnFormHeaderCard.tsx`: Thông tin chi nhánh, Mã GRN tự sinh, Dropdown chọn PO gốc, Tên/Mã NCC, Ngày giờ, Hóa đơn NCC, Điều khoản thanh toán (REQ-01)
- [x] T4 — Xây dựng component `GrnProductEntryTable.tsx`: Bảng kiểm đếm 4 chỉ số (`Ordered`, `Received`, `Accepted`, `Rejected`), dropdown chọn lý do hàng lỗi/từ chối, cảnh báo giao thừa chặn nhập vượt PO, nhập Lô & HSD, cảnh báo FEFO cận date < 30 ngày (REQ-02, REQ-03, REQ-06)
- [x] T5 — Xây dựng component `GrnCostSummaryCard.tsx`: Ghi chú nhập kho, input Landed Cost (phí vận chuyển), Chiết khấu, Thuế VAT (%), tự động tính Grand Total (REQ-04)
- [x] T6 — Xây dựng component `GrnFormActionBar.tsx`: Fixed Bottom Bar với các action Hủy bỏ, Lưu nháp (Draft), Hoàn tất nhập kho (Confirmed/Completed), Hoàn tất & In tem (REQ-05)
- [x] T7 — Xây dựng modal xác nhận lệch hàng `GrnMismatchConfirmModal.tsx` và modal xem trước tem in `GrnPrintPreviewModal.tsx` (REQ-05)
- [x] T8 — Xây dựng container page `GoodsReceiptFormPage.tsx`: Tích hợp các sub-components, kết nối logic state kiểm đếm, hỗ trợ query param `?poCode=...`, chế độ xem chi tiết phiếu cũ (REQ-01 đến REQ-06)
- [x] T9 — Cập nhật router `src/app/router.tsx` và liên kết điều hướng từ `GoodsReceiptListPage.tsx`: Bấm "+ Nhập kho từ PO" hoặc "Nhập kho ngay" chuyển hướng sang `GoodsReceiptFormPage` (REQ-01, REQ-05)

## Test & Verification
- [x] T10 — Kiểm thử build Vite/TypeScript, xác minh toàn bộ các scenarios trong specs.md (REQ-01 đến REQ-06)
- [x] T11 — Chạy dotnet test MT_GRMS.UnitTests đạt 100% PASS (64/64 tests)
