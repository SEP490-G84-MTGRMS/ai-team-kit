# Proposal: Màn hình Lập & Xác nhận Phiếu nhập kho GRN Đa lô FEFO & Landed Cost (`grn-form`)

## Vấn đề
Khi xe nhà cung cấp giao hàng thực tế, một mặt hàng trên PO có thể gồm nhiều lô hạn sử dụng khác nhau, giao thiếu/dư hoặc lệch đơn giá và phát sinh phí vận chuyển cần phân bổ vào giá vốn.

## Mục tiêu
Cho phép kiểm đếm thực nhận theo từng dòng tách lô (Batch + NSX + HSD), kiểm soát tổng thực nhận <= SL đặt, phân bổ chi phí nhập hàng và tự động cộng tồn kho FEFO + ghi sổ công nợ AP khi hoàn tất.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/goods-receipts/create`, `/store-owner/goods-receipts/:id`, `/store-owner/goods-receipts/:id/edit`, `/store-owner/goods-receipts/:id/confirm`, `/employee/goods-receipts/create` (`src/features/goods-receipt/pages/GoodsReceiptFormPage.tsx`, `src/features/goods-receipt/pages/GoodsReceiptDetailPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `GrnFormHeaderCard`, `GrnProductEntryTable`, `GrnFormFooter`, `GrnDetailHeaderCard`, `GrnCostSummaryCard`, `GrnPostSettingsCard`, `GrnMismatchConfirmModal`, `GrnPrintPreviewModal`.
  - Tích hợp đầy đủ với tầng API Backend (`GoodsReceiptsController`) và thực thể nghiệp vụ (`GoodsReceipt`, `GoodsReceiptLine`, `BranchStock`, `StockOnHand`, `SupplierAPLedger`, `PurchaseOrder`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/goods-receipts/create`, `/store-owner/goods-receipts/:id`, `/store-owner/goods-receipts/:id/edit`, `/store-owner/goods-receipts/:id/confirm`, `/employee/goods-receipts/create` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/goods-receipts/create`, `/store-owner/goods-receipts/:id`, `/store-owner/goods-receipts/:id/edit`, `/store-owner/goods-receipts/:id/confirm`, `/employee/goods-receipts/create`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-05-06` (FE-05).
