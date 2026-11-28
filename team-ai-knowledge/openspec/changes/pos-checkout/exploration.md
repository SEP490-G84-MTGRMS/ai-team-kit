# Exploration: Màn hình Bán hàng & Thu ngân Quầy POS (Barcode, FEFO, Khuyến mãi, VietQR & Bán nợ) (`pos-checkout`)

## 1. Khảo sát Hiện trạng Mã nguồn (AS-IS Codebase)
- **Phân hệ**: `FE-03` · **Mã màn hình kiểm thử**: `UI-03-01`
- **Nguồn gốc chuẩn hóa**: Hợp nhất & chuẩn hóa từ các change lịch sử: `pos-sales-checkout-ui`, `pos-sales-order-backend`, `pos-customer-debt-management`, `pos-db-sync-owner-shiftless-and-branch-catalog`, `pos-branch-scoped-catalog-and-stock-archived-2026-11-09`.
- **Frontend Pages**:
- `MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx` (2105 dòng) — Components: `AdminToast`, `ConfirmDialog`, `PosHeader`, `PosCartTable`, `PosPaymentPanel`, `PosCatalogModal`, `AddCustomerModal`, `VietQrModal`, `BelowCostWarningModal`, `OrderDiscountModal`, `PosReceiptModal`, `PosInventoryLookupModal`, `OpenShiftModal`, `CashMovementModal`, `CloseShiftModal` — Hooks/Stores: `useBarcodeScanner`, `useAuthStore`, `usePoints`
- **Backend Controllers**: `MT_GRMS.Api/Controllers/OrdersController.cs`, `MT_GRMS.Api/Controllers/PromotionsController.cs`, `MT_GRMS.Api/Controllers/VouchersController.cs`, `MT_GRMS.Api/Controllers/ProductsController.cs`, `MT_GRMS.Api/Controllers/RepackOrdersController.cs`
- **Application Services / Validators**: `IOrderService`, `ITenantContext`, `IAuthorizationService`, `IPromotionService`, `IThermalPrintService`, `ICatalogService`, `ISupplierService`, `IRepackService`
- **Domain Entities**: `Order`, `OrderDetail`, `BranchStock`, `Package`, `Promotion`, `VoucherCode`, `Customer`

## 2. Giả định (Assumptions) & Không làm (Non-Goals)
- **Assumptions**:
  - Người dùng đã đi qua tầng xác thực JWT và middleware định danh `ITenantContext` để gắn cứng `TenantId` (cùng `BranchId` nếu là nhân viên chi nhánh).
  - Mọi giá trị tiền tệ VND sử dụng `decimal(18,2)` và thời gian lưu trữ chuẩn UTC, hiển thị theo `Asia/Ho_Chi_Minh`.
- **Non-Goals**:
  - Không trộn lẫn đặc tả của các màn hình khác vào chung change `pos-checkout` (mỗi màn hình là 1 đơn vị OpenSpec độc lập).

## 3. Phân tích Phương án Thiết kế
### Phương án A (Được chọn): Kiến trúc Clean Architecture 4 tầng + Feature-Sliced Screen Module
- **Mô tả**: Tách biệt hoàn toàn state & UI của màn hình trong `src/features/...` gọi RESTful API chuẩn ProblemDetails tới Controller/Service tương ứng có Global Query Filter theo `TenantId`.
- **Ưu điểm**: Cô lập phạm vi thay đổi theo đúng từng màn hình, dễ kiểm thử chéo (Report 5.1 → 5.5) và không gây xung đột Git khi nhiều thành viên cùng làm việc.
- **Nhược điểm**: Cần định nghĩa rõ hợp đồng DTO giữa Frontend và Backend.

### Phương án B: Gom chung nhiều màn hình vào một Mega-Page / Shared Mutable Store
- **Mô tả**: Nhồi tất cả danh sách, biểu mẫu phức tạp và cấu hình vào chung một màn hình lớn.
- **Nhược điểm**: File quá lớn, tải chậm, phân quyền theo vai trò phức tạp và khó truy vết đặc tả khi thay đổi. -> **Loại bỏ**.

## 4. Rủi ro Kỹ thuật & Biện pháp Kiểm soát
- **Rò rỉ dữ liệu liên gian hàng / liên chi nhánh**: Bắt buộc lọc theo `ITenantContext.TenantId` và kiểm tra phạm vi chi nhánh (`useBranchScope` + Backend Authorization).
- **Thao tác trùng lặp (Double Submit)**: Khóa nút hành động khi đang gửi request (`isSubmitting`) và kiểm tra trạng thái hợp lệ ở tầng Service trước khi ghi DB.
