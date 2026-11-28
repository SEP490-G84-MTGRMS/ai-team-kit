# Proposal: Màn hình Quản lý Danh sách Đơn mua hàng PO Toàn chuỗi (`po-store-order-list`)

## Vấn đề
Chủ cửa hàng và nhân viên mua hàng cần theo dõi vòng đời toàn bộ đơn PO (Nháp, Đã gửi NCC, Nhập một phần, Hoàn tất, Đã hủy, PO Đổi hàng RTV), xuất PDF đơn mua và chuyển nhanh sang lập phiếu nhập GRN.

## Mục tiêu
Cung cấp màn hình quản lý tập trung toàn bộ chứng từ PO với bộ lọc đa chiều, xuất file PDF đơn hàng và liên kết 1 chạm sang Nhập kho GRN.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/purchase-orders/list` (`src/features/purchase-order/pages/StoreOwnerPurchaseOrderListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `PoListFilterBar`, `PoListTable`.
  - Tích hợp đầy đủ với tầng API Backend (`PurchaseOrdersController`) và thực thể nghiệp vụ (`PurchaseOrder`, `PurchaseOrderDetail`, `PurchaseOrderRevision`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/purchase-orders/list` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/purchase-orders/list`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-05-01` (FE-05).
