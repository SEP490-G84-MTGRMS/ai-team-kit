# Proposal: goods-receipt-multi-batch

## Vấn đề

Màn lập phiếu nhập kho từ PO (GRN) hiện chỉ cho **một mã lô + một EXP trên mỗi dòng SKU**. Thực tế NCC thường giao cùng SKU từ nhiều lô (MFG/EXP khác nhau). Hệ quả:

- Không khai báo đúng tồn theo từng lô → FEFO/cận date sai.
- Không tách rõ **thiếu hàng** (Missing) vs **từ chối** (Rejected) ở cấp tổng hợp khi nhiều lô.
- Batch No / EXP nằm trên bảng chính làm bảng SKU dày; DTO `Batches[]` đã có nhưng **không được dùng** end-to-end.
- Complete luôn set PO = COMPLETED và chặn **1 PO = 1 GRN active**, nên không nhận nhiều lần theo số lượng còn lại trên PO.

## Mục tiêu

Refactor trên nền GRN hiện có để:

1. **1 SKU = 1 dòng GRN = N batch** (mỗi batch: mã lô NCC, SL thực nhận/chấp nhận/từ chối, MFG, EXP, lý do từ chối).
2. Bảng SKU gọn: bỏ Batch/EXP khỏi cột chính; expandable chi tiết batch + badge số batch + trạng thái đối soát.
3. Enforce quy tắc số lượng (không vượt PO còn lại; thiếu bắt buộc lý do; từ chối bắt buộc lý do; chỉ Accepted vào tồn).
4. Complete: ghi tồn **theo từng batch được chấp nhận**; Draft không đụng tồn; không complete trùng.
5. Migration bảo toàn GRN lịch sử (scalar batch cũ → 1 batch con).

## Phạm vi

### In scope
- FE create/confirm GRN: `GrnProductEntryTable` expandable multi-batch; lý do thiếu hàng ở cấp SKU; giữ cost summary (tiền hàng Accepted − CK + VAT; freight = 0).
- BE: entity/collection batch dưới `GoodsReceiptLine`; validate create/complete; RemainingPOQty trên mọi GRN COMPLETED + phiếu đang xử lý.
- Complete: upsert tồn theo từng batch Accepted; idempotent; PO chỉ COMPLETED khi đủ nhận (theo ReceivedQty đã ghi).
- Migration + backfill dữ liệu cũ; unit tests các case đủ/thiếu/vượt/nhiều batch/reject/HasBatches.
- Phân quyền branch giữ như hiện tại (Owner / Employee).

### Out of scope
- Thêm role Thủ kho mới.
- Cho phép nhận vượt PO / exception approval riêng.
- Viết lại toàn bộ module GRN, list page, print tem engine, AP invoice.
- Thêm cột Product `track_expiry` / `track_manufacturing` riêng (dùng lại `HasBatches` hiện có).
- Đảo phiếu / điều chỉnh GRN sau COMPLETED.
- Gộp tự động các batch trùng mã lô khác EXP.

## Người dùng & role

| Role | Hành vi |
|------|--------|
| Store Owner | Lập/duyệt GRN mọi chi nhánh trong tenant |
| Employee | Chỉ chi nhánh được phân công (UI + BE) |

## Quyết định nghiệp vụ đã chốt (từ audit code)

1. **Tên thực thể**: giữ `GoodsReceipt` / `GoodsReceiptLine`; thêm bảng con `GoodsReceiptBatches` (không đổi tên sang GoodsReceiptDetail).
2. **Cờ sản phẩm**: chỉ có `Product.HasBatches` → bắt buộc multi-batch + EXP khi true; khi false nhập SL trực tiếp trên dòng SKU (0 hoặc 1 batch nội bộ ẩn tùy implement tối giản).
3. **Tồn kho Complete**: tiếp tục ghi `BranchStocks` (module đang dùng); với `HasBatches` đồng thời tạo/cập nhật `Batches` + `StockOnHands` (module FEFO hiện có — không có entity tên InventoryBatch).
4. **Nhiều GRN / PO**: bỏ chặn 1 active COMPLETED; tối đa **1 DRAFT**/PO; Remaining = Ordered − Σ DeliveredQty của GRN COMPLETED; phiếu hiện tại không được vượt remaining.
5. **PO status khi Complete**: set `COMPLETED` chỉ khi mọi dòng PO đã nhận đủ (Σ ReceivedQty ≥ Ordered); ngược lại giữ trạng thái trước / `PARTIALLY_RECEIVED` nếu cần tối thiểu để lookup vẫn nhận tiếp.

## Tiêu chí thành công

- UI: mỗi SKU một dòng; mở rộng thấy N batch; không còn Batch/EXP trên bảng chính.
- Case mẫu Ordered=100, 3 batch 40+35+15 → Received=90, Missing=10, bắt buộc lý do thiếu; vượt 110 bị chặn FE+BE.
- Draft không đổi tồn; Complete một lần cộng đúng từng batch Accepted; Complete lần 2 bị từ chối.
- Hai GRN cùng PO không làm tổng Received vượt Ordered.
- Dữ liệu GRN cũ sau migration vẫn đọc được (scalar → 1 GoodsReceiptBatch).
- Test tối thiểu cover các case bắt buộc trong yêu cầu (đủ / nhiều batch / thiếu±lý do / vượt / reject±lý do / HasBatches EXP / idempotent / remaining PO / employee branch).
