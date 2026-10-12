# Tasks: create-purchase-order

## DB
- [ ] T1 — Tạo migration EF Core cho bảng `SupplierDeliveryConfigs` lưu cấu hình lịch giao hàng, lead time, cutoff time, lock hour của NCC (REQ-PO-02)
- [ ] T2 — Tạo migration EF Core cho bảng `PurchaseOrders` và `PurchaseOrderDetails` lưu các đơn PO độc lập với số lượng `decimal(12,3)` (REQ-PO-06)

## Backend
- [ ] T3 — Khởi tạo Entities và Enums trong `MT_GRMS.Domain` (`SupplierDeliveryConfig`, `PurchaseOrder`, `PurchaseOrderDetail`, `PurchaseOrderStatus`) (REQ-PO-02, REQ-PO-06)
- [ ] T4 — Triển khai Query `GetOrderMatrixMetadataQuery` trong `MT_GRMS.Application` lấy lịch giao NCC, dư nợ AP, bảng giá SP và SOH chi nhánh (REQ-PO-01, REQ-PO-03, REQ-PO-05)
- [ ] T5 — Triển khai Command `CreateBatchPurchaseOrdersCommand` kiểm tra hạn mức tín dụng Credit Limit trong Database Transaction và tạo hàng loạt PO theo ngày giao (REQ-PO-03, REQ-PO-06, REQ-PO-07)
- [ ] T6 — Tạo Controller `PurchaseOrdersController` trong `MT_GRMS.Api` cung cấp các endpoint RESTful với ProblemDetails và xác thực đa tenant (REQ-PO-01, REQ-PO-06)

## Frontend
- [ ] T7 — Khởi tạo cấu trúc thư mục feature `src/features/purchase-order/` gồm `types/po.types.ts`, `lib/mockData.ts` và API service (REQ-PO-01)
- [ ] T8 — Xây dựng component `OrderMatrixFilterBar` cho phép chọn Nhà cung cấp (*), Chi nhánh (*), khoảng ngày và chế độ xem 7/14 ngày kèm kiểm tra thay đổi chưa lưu (REQ-PO-01, REQ-PO-02)
- [ ] T9 — Xây dựng component `OrderMatrixCreditSummary` hiển thị công thức kiểm tra hạn mức tín dụng thời gian thực ($\text{Open AP} + \text{New Orders} \le \text{Credit Limit}$) (REQ-PO-03)
- [ ] T10 — Xây dựng component `OrderMatrixSupplierInfo` hiển thị Lead Time, Cutoff Time, Lock Hour và ghi chú giao hàng của NCC (REQ-PO-02)
- [ ] T11 — Xây dựng component `OrderMatrixToolbar` hỗ trợ Copy Prev Week, Shift tuần (Prev/This/Next Week), Excel Download/Upload, bộ lọc MOQ/Ordered/SOH (REQ-PO-04, REQ-PO-05, REQ-PO-08)
- [ ] T12 — Xây dựng component `OrderMatrixTable` hiển thị bảng ma trận lưới, xử lý ô ngày Off (`—`), ngày Khóa (🔒), cảnh báo viền đỏ vi phạm MOQ (`qty-bad`), phím tắt điều hướng ↑ ↓ ← → và Enter (REQ-PO-01, REQ-PO-02, REQ-PO-04, REQ-PO-08)
- [ ] T13 — Xây dựng component `OrderMatrixFooter` tính Grand Total Qty, Total Amount, trạng thái an toàn công nợ và cơ chế Client-Side Auto PO Splitting khi bấm Submit (REQ-PO-03, REQ-PO-06, REQ-PO-07)
- [ ] T14 — Tích hợp Page `OrderMatrixPage` vào hệ thống định tuyến `router.tsx` và gắn liên kết vào Topbar điều hướng (REQ-PO-01)

## Test
- [ ] T15 — Viết Unit Test cho logic kiểm tra hạn mức tín dụng NCC, kiểm tra MOQ và cơ chế bóc tách ma trận Auto PO Splitting (REQ-PO-03, REQ-PO-04, REQ-PO-06)
- [ ] T16 — Viết Component Test kiểm tra hành vi nhập liệu ma trận, phím tắt mũi tên và trạng thái khóa ô ngày giao (REQ-PO-02, REQ-PO-08)
