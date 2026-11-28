# Proposal: Màn hình Danh sách Đặt hàng theo Chi nhánh (Branch Purchase Order Overview) (`po-branch-order-list`)

## Vấn đề
Chủ chuỗi cần điểm điều hướng trung tâm để theo dõi tình hình lên đơn đặt hàng của từng chi nhánh trước khi đi vào Ma trận đặt hàng chi tiết hoặc Trung tâm chốt đơn NCC.

## Mục tiêu
Hiển thị danh sách chi nhánh kèm tóm tắt tình trạng đơn mua hàng đang mở và lối tắt mở thẳng Ma trận đặt hàng của từng chi nhánh.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/purchase-orders`, `/store-owner/purchase-orders/branches` (`src/features/purchase-order/pages/BranchOrderListPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `BranchFilterBar`, `BranchOrderTable`.
  - Tích hợp đầy đủ với tầng API Backend (`PurchaseOrdersController`, `BranchesController`) và thực thể nghiệp vụ (`Branch`, `PurchaseOrder`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/purchase-orders`, `/store-owner/purchase-orders/branches` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/purchase-orders`, `/store-owner/purchase-orders/branches`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-05-00` (FE-05).
