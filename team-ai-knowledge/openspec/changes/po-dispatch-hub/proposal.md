# Proposal: Màn hình Trung tâm Điều phối, Chốt gửi & Theo dõi Gói PO Nhà cung cấp (`po-dispatch-hub`)

## Vấn đề
Sau khi các chi nhánh nhập nhu cầu trên ma trận, Chủ cửa hàng cần một trung tâm điều phối để rà soát chênh lệch số lượng theo từng Nhà cung cấp, chốt tách/cập nhật hàng loạt PO và gửi gói chứng từ PDF/Excel qua Email cho NCC trước giờ Cut-off.

## Mục tiêu
Cung cấp màn hình tổng hợp và màn hình chi tiết từng NCC (`SupplierDispatchDetailPage`) để chốt PO, sinh gói `SupplierDispatchPackage`, tải chứng từ và gửi lại Email khi lỗi.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/purchase-orders/dispatch-hub`, `/store-owner/purchase-orders/dispatch-hub/:supplierId`, `/store-owner/purchase-orders/cutoff-hub` (`src/features/purchase-order/pages/SupplierOrderDispatchHubPage.tsx`, `src/features/purchase-order/pages/SupplierDispatchDetailPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `DispatchFilterBar`, `SupplierDispatchTable`, `DispatchConfirmModal`.
  - Tích hợp đầy đủ với tầng API Backend (`PurchaseOrdersController`) và thực thể nghiệp vụ (`PurchaseOrder`, `SupplierDispatchPackage`, `PurchaseOrderRevision`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/purchase-orders/dispatch-hub`, `/store-owner/purchase-orders/dispatch-hub/:supplierId`, `/store-owner/purchase-orders/cutoff-hub` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/purchase-orders/dispatch-hub`, `/store-owner/purchase-orders/dispatch-hub/:supplierId`, `/store-owner/purchase-orders/cutoff-hub`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-05-03` (FE-05).
