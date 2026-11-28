# Design Brief: Màn hình Lập & Xác nhận Phiếu nhập kho GRN Đa lô FEFO & Landed Cost (`grn-form`)

## 1. Tuyến đường & Bố cục Màn hình (UI Architecture)
- **Routes chính**: `/store-owner/goods-receipts/create`, `/store-owner/goods-receipts/:id`, `/store-owner/goods-receipts/:id/edit`, `/store-owner/goods-receipts/:id/confirm`, `/employee/goods-receipts/create`
- **Entry Page**: `src/features/goods-receipt/pages/GoodsReceiptFormPage.tsx`, `src/features/goods-receipt/pages/GoodsReceiptDetailPage.tsx`
- **Tổ hợp Component trên màn hình**:
  - `GrnFormHeaderCard`
  - `GrnProductEntryTable`
  - `GrnFormFooter`
  - `GrnDetailHeaderCard`
  - `GrnCostSummaryCard`
  - `GrnPostSettingsCard`
  - `GrnMismatchConfirmModal`
  - `GrnPrintPreviewModal`

## 2. Trạng thái Giao diện (UI States)
- **Loading**: Hiển thị skeleton / trạng thái đang tải rõ ràng, khóa nút lưu khi request đang xử lý.
- **Empty**: Hiển thị thông điệp trạng thái trống thân thiện kèm nút kêu gọi hành động (CTA) hoặc xóa bộ lọc khi không có bản ghi khớp.
- **Error**: Bắt lỗi chuẩn RFC 7807 ProblemDetails từ Axios interceptor và hiển thị thông báo tiếng Việt cụ thể qua `AdminToast` / hộp thoại cảnh báo.
- **Success**: Cập nhật tức thời danh sách/số liệu trên màn hình và hiển thị toast xác nhận hoàn tất.

## 3. Hợp đồng Tích hợp API (Backend Endpoints)
| Method | Endpoint | Handler | Định dạng Phản hồi |
|---|---|---|---|
| `GET` | `/api/goods-receipts` | `GoodsReceiptsController.GetGoodsReceipts` | JSON DTO / ProblemDetails |
| `GET` | `/api/goods-receipts/{id:guid}` | `GoodsReceiptsController.GetById` | JSON DTO / ProblemDetails |
| `GET` | `/api/goods-receipts/po-lookup` | `GoodsReceiptsController.GetPoLookup` | JSON DTO / ProblemDetails |
| `GET` | `/api/goods-receipts/po-details/{poIdOrCode}` | `GoodsReceiptsController.GetPoReceiptDetails` | JSON DTO / ProblemDetails |
| `POST` | `/api/goods-receipts` | `GoodsReceiptsController.CreateGoodsReceipt` | JSON DTO / ProblemDetails |
| `PUT` | `/api/goods-receipts/{id:guid}` | `GoodsReceiptsController.UpdateDraft` | JSON DTO / ProblemDetails |
| `POST` | `/api/goods-receipts/{id:guid}/complete` | `GoodsReceiptsController.CompleteGoodsReceipt` | JSON DTO / ProblemDetails |
| `PUT` | `/api/goods-receipts/{id:guid}/confirm` | `GoodsReceiptsController.CompleteGoodsReceipt` | JSON DTO / ProblemDetails |
| `POST` | `/api/goods-receipts/{id:guid}/cancel` | `GoodsReceiptsController.CancelGoodsReceipt` | JSON DTO / ProblemDetails |

## 4. Mô hình Dữ liệu & Phân quyền (RBAC & Multi-Tenant)
- **Thực thể CSDL liên quan**: `GoodsReceipt`, `GoodsReceiptLine`, `BranchStock`, `StockOnHand`, `SupplierAPLedger`, `PurchaseOrder`.
- **Vai trò được phép truy cập**: `StoreOwner`, `Employee`.
- **Quy tắc cô lập dữ liệu**: Mọi truy vấn đọc/ghi đều ràng buộc theo `TenantId` của phiên đăng nhập và phạm vi chi nhánh được phân công.
