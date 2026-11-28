# Tasks: create-purchase-order

## DB
- [x] T1 — Tạo migration EF Core cho bảng `SupplierDeliveryConfigs` lưu cấu hình lịch giao hàng, lead time, cutoff time, lock hour của NCC (REQ-PO-02)
- [x] T2 — Tạo migration EF Core cho bảng `PurchaseOrders` và `PurchaseOrderDetails` lưu các đơn PO độc lập với số lượng `decimal(12,3)` (REQ-PO-06)

## Backend
- [x] T3 — Khởi tạo Entities và Enums trong `MT_GRMS.Domain` (`SupplierDeliveryConfig`, `PurchaseOrder`, `PurchaseOrderDetail`, `PurchaseOrderStatus`) (REQ-PO-02, REQ-PO-06)
- [x] T4 — Triển khai Query `GetOrderMatrixMetadataQuery` trong `MT_GRMS.Application` lấy lịch giao NCC, dư nợ AP, bảng giá SP và SOH chi nhánh (REQ-PO-01, REQ-PO-03, REQ-PO-05)
- [x] T5 — Triển khai Command `CreateBatchPurchaseOrdersCommand` kiểm tra hạn mức tín dụng Credit Limit trong Database Transaction và tạo hàng loạt PO theo ngày giao (REQ-PO-03, REQ-PO-06, REQ-PO-07)
- [x] T6 — Tạo Controller `PurchaseOrdersController` trong `MT_GRMS.Api` cung cấp các endpoint RESTful với ProblemDetails và xác thực đa tenant (REQ-PO-01, REQ-PO-06)

## Frontend
- [x] T7 — Khởi tạo cấu trúc thư mục feature `src/features/purchase-order/` gồm `types/po.types.ts`, `lib/mockData.ts` và API service (REQ-PO-01)
- [x] T8 — Refactor toàn bộ bộ lọc thành 1 hàng ngang duy nhất (Single Compact Row 48–54px) với 13 controls theo đúng thứ tự nghiệp vụ (REQ-PO-01, REQ-PO-02)
- [x] T9 — Tối ưu màn hình: loại bỏ các khối text rườm rà, giải phóng tối đa không gian hiển thị cho bảng ma trận lưới (REQ-PO-03)
- [x] T10 — Cấu hình hiển thị theo nhóm Nhà Cung Cấp thay vì ngành hàng trên toàn bộ ma trận (REQ-PO-02)
- [x] T11 — Xây dựng Action Toolbar riêng biệt hỗ trợ Copy Prev Week, Shift tuần (Prev/This/Next Week), Excel Download/Upload, Tóm tắt Đơn (REQ-PO-04, REQ-PO-05, REQ-PO-08)
- [x] T12 — Xây dựng component `OrderMatrixTable` hiển thị bảng ma trận lưới gom nhóm theo NCC, xử lý ô ngày Off (`—`), ngày Khóa (xám), ngày Mở (xanh), cảnh báo viền đỏ vi phạm MOQ (`qty-bad`), phím tắt điều hướng ↑ ↓ ← → và Enter (REQ-PO-01, REQ-PO-02, REQ-PO-04, REQ-PO-08)
- [x] T13 — Xây dựng component `OrderMatrixFooter` tính Grand Total Qty, Total Amount và cơ chế Client-Side Auto PO Splitting khi bấm Submit tách 1 PO = 1 NCC + 1 Chi nhánh + 1 Ngày giao (REQ-PO-03, REQ-PO-06, REQ-PO-07)
- [x] T14 — Tích hợp Page `OrderMatrixPage` vào hệ thống định tuyến `router.tsx` và gắn liên kết vào Topbar điều hướng (REQ-PO-01)

## Test
- [x] T15 — Viết Unit Test cho logic kiểm tra hạn mức tín dụng NCC, kiểm tra MOQ và cơ chế bóc tách ma trận Auto PO Splitting (REQ-PO-03, REQ-PO-04, REQ-PO-06)
- [x] T16 — Viết Component Test kiểm tra hành vi nhập liệu ma trận, phím tắt mũi tên và trạng thái khóa ô ngày giao (REQ-PO-02, REQ-PO-08)

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: supplier-order-dispatch-cutoff -->
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
