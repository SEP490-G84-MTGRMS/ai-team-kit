# Tasks: supplier-order-dispatch-cutoff

## Backend (ASP.NET Core)
- [x] T1 — Bổ sung DTOs: `PreviewSplitMatrixRequestDto`, `SplitMatrixPoBatchRequestDto`, `SplitPreviewResultDto`, `SplitMatrixBatchResultDto`, `SplitGroupResultDto`, `SplitGroupLineDto` (REQ-06, REQ-10)
- [x] T2 — Xây dựng phương thức `PreviewSplitMatrixPoAsync` trong `PurchaseOrderService` để tính toán Dry Run (kiểm tra Cutoff, gom nhóm theo BranchId + DeliveryDate, tính tiền, phát hiện missing price, skipped groups) (REQ-06, REQ-10)
- [x] T3 — Xây dựng phương thức `SplitMatrixPoBatchAsync` trong `PurchaseOrderService` thực hiện chốt đơn với nguồn số lượng 100% từ DB draft matrix, bảo đảm nguyên tắc 1 PO = 1 Branch + 1 Supplier + 1 DeliveryDate (REQ-07, REQ-08)
- [x] T4 — Xử lý Partial Success độc lập theo từng group: ghi nhận SUCCESS, FAILED, SKIPPED (CUTOFF_EXPIRED, ALREADY_FINALIZED, NO_QUANTITY) mà không rollback toàn bộ batch (REQ-09)
- [x] T5 — Cập nhật Controller `PurchaseOrdersController`: expose `POST /api/purchase-orders/matrix/split/preview` và `POST /api/purchase-orders/matrix/split` (REQ-06 đến REQ-10)
- [x] T6 — Verify Backend build: `dotnet build MT_GRMS_BACKEND` thành công 100% không cảnh báo hoặc lỗi

## Frontend (React / Vite)
- [x] T7 — Xây dựng UI Dispatch Hub ban đầu: `SupplierOrderDispatchHubPage.tsx`, `DispatchUrgencyBar.tsx`, `DispatchFilterBar.tsx` (REQ-01, REQ-02)
- [x] T8 — Cập nhật `dispatchHubApi.ts` và `purchaseOrderApi.ts`: bổ sung gọi API preview `previewSplitMatrixPo` và batch split `splitMatrixPoBatch` (REQ-10)
- [x] T9 — Refactor `DispatchConfirmModal.tsx`:
  - Căn giữa màn hình cố định với `position: fixed inset-0 z-[99999]`, backdrop mờ tối (REQ-05)
  - Segmented control chuyển đổi giữa 2 phạm vi: NEAREST (Ngày gần nhất) và WEEK (Cả tuần T2-CN) (REQ-06)
  - 4 Cards Summary Metrics: Tổng số PO dự kiến, Số chi nhánh, Tổng SKU, Tổng tiền ước tính (REQ-05)
  - Preview Table 6 cột: `Chi nhánh`, `Ngày giao`, `Số SKU`, `SL đặt`, `Giá trị dự kiến`, `Trạng thái` — ĐÃ LOẠI BỎ hoàn toàn icon dropdown mũi tên mở rộng và danh sách con sản phẩm theo yêu cầu nghiệp vụ (REQ-05)
  - Bảng Skipped Groups phân loại rõ lý do bị bỏ qua (REQ-05, REQ-09)
  - Textarea ghi chú gửi NCC gắn vào các PO tạo thành công (REQ-05)
  - Footer sticky với nút hành động chống double-click và loading state (REQ-05)
- [x] T10 — Cập nhật liên kết deep-link từ thẻ NCC sang trang Order Matrix (`/store-owner/purchase-orders/create-matrix?branchId=...&supplier=...&orderedOnly=true`) (REQ-03)
- [x] T11 — Verify Frontend build: `npm run build` thành công 100% trong ~900ms không có lỗi TypeScript hay linting

## Test & Verification
- [x] T12 — Kiểm thử tích hợp luồng Preview và Split PO: xác nhận chia đúng 1 PO = 1 Branch + 1 Supplier + 1 DeliveryDate, không trùng lặp đơn (REQ-06, REQ-07)
- [x] T13 — Kiểm thử UI Modal xác nhận: popup hiển thị đẹp mắt, căn giữa, không có lỗi dropdown vỡ layout, số liệu khớp hoàn toàn với Backend (REQ-05)
