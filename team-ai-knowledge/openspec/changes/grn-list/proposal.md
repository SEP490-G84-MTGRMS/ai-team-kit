# Proposal: Màn hình Danh sách Phiếu nhập kho (GRN) & Lịch Nhận hàng Hôm nay (`grn-list`)

## Vấn đề
Nhân viên kho tại chi nhánh và Chủ cửa hàng cần theo dõi danh sách các phiếu nhập kho (Nháp, Hoàn tất, Đã hủy), lịch đơn PO dự kiến giao trong ngày để chuẩn bị nhận hàng và in phiếu.

## Mục tiêu
Hiển thị danh sách phiếu nhập kho phân quyền chặt theo chi nhánh của nhân viên (`useBranchScope`), xem nhanh qua Drawer và điều hướng lập/xác nhận phiếu nhập.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/goods-receipts`, `/goods-receipts`, `/employee/goods-receipts`, `/branch/goods-receipts` (`src/features/goods-receipt/pages/GoodsReceiptListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `GrnFilterBar`, `GrnTable`, `GrnDetailDrawer`.
  - Tích hợp đầy đủ với tầng API Backend (`GoodsReceiptsController`) và thực thể nghiệp vụ (`GoodsReceipt`, `GoodsReceiptLine`, `PurchaseOrder`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/goods-receipts`, `/goods-receipts`, `/employee/goods-receipts`, `/branch/goods-receipts` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/goods-receipts`, `/goods-receipts`, `/employee/goods-receipts`, `/branch/goods-receipts`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-05-05` (FE-05).
